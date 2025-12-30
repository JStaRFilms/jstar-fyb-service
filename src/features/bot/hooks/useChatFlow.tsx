import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { saveLeadAction } from "../actions/chat";

export interface Message {
    id: string;
    role: "ai" | "user";
    content: React.ReactNode;
    toolInvocations?: any[];
    timestamp: string;
}

export type ChatState = "INITIAL" | "ANALYZING" | "PROPOSAL" | "NEGOTIATION" | "CLOSING" | "COMPLETED";

export interface ConfirmedTopic {
    topic: string;
    twist: string;
}

export function useChatFlow(userId?: string) {
    const router = useRouter();
    const [state, setState] = useState<ChatState>("INITIAL");
    const [complexity, setComplexity] = useState<1 | 2 | 3 | 4 | 5>(1);
    const [conversationId, setConversationId] = useState<string | undefined>();
    const [anonymousId, setAnonymousId] = useState<string>("");
    const [confirmedTopic, setConfirmedTopic] = useState<ConfirmedTopic | null>(null);

    // Use refs to access current values in fetch without stale closures
    const conversationIdRef = useRef(conversationId);
    const anonymousIdRef = useRef(anonymousId);

    // Initialize anonymousId immediately if possible (client-side only)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            let id = localStorage.getItem("jstar_anonymous_id");
            if (!id) {
                id = crypto.randomUUID();
                localStorage.setItem("jstar_anonymous_id", id);
            }
            setAnonymousId(id);
            anonymousIdRef.current = id; // Update ref immediately
        }
    }, []);

    // Keep refs in sync with state
    useEffect(() => {
        conversationIdRef.current = conversationId;
    }, [conversationId]);

    useEffect(() => {
        anonymousIdRef.current = anonymousId;
    }, [anonymousId]);

    // Standard AI SDK useChat with custom fetch to inject headers dynamically
    const {
        messages: aiMessages,
        sendMessage,
        status,
        error,
        regenerate,
        setMessages
    } = useChat({
        // Use custom fetch to dynamically inject anonymousId/conversationId at request-time
        fetch: async (url: RequestInfo | URL, options?: RequestInit) => {
            const body = JSON.parse(options?.body as string || '{}');

            // Inject current values from refs (not stale closure values)
            body.anonymousId = anonymousIdRef.current;
            body.conversationId = conversationIdRef.current;

            return fetch(url, {
                ...options,
                body: JSON.stringify(body),
            });
        },
    } as any) as any;

    // Sync initial messages if we found a conversation
    const hasSyncedHistory = useRef(false);
    useEffect(() => {
        if (!hasSyncedHistory.current && anonymousId && anonymousId !== "") {
            const syncHistory = async () => {
                const { getLatestConversation } = await import("../actions/chat");
                const latest = await getLatestConversation({ anonymousId, userId });
                if (latest && latest.messages.length > 0) {
                    setConversationId(latest.id);
                    setMessages(latest.messages.map((m: any) => ({
                        id: m.id,
                        role: m.role as any,
                        content: m.content as string,
                        parts: [{ type: 'text' as const, text: m.content as string }],
                        createdAt: new Date(m.createdAt)
                    })));
                }
                hasSyncedHistory.current = true;
            };
            syncHistory();
        }
    }, [anonymousId, userId, setMessages]);

    const isLoading = status === 'streaming' || status === 'submitted';

    // Transform AI SDK messages to our UI format
    const messages: Message[] = aiMessages
        .map((m: any) => {
            let textContent = '';
            if (m.parts) {
                const textPart = m.parts.find((p: any) => p.type === 'text');
                textContent = textPart?.text || '';
            } else if (typeof m.content === 'string') {
                textContent = m.content;
            }

            // Extract tool-related parts (both invocations and results)
            const toolParts = m.parts?.filter((p: any) =>
                p.type === 'tool-invocation' ||
                p.type === 'tool-result' ||
                p.type?.startsWith('tool-')
            );



            return {
                id: m.id,
                role: (m.role === 'user' ? 'user' : 'ai') as 'user' | 'ai',
                content: textContent,
                toolInvocations: toolParts,
                timestamp: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
            };
        })
        .filter((m: any) => m.content && (typeof m.content === 'string' ? m.content.trim() : true));

    // Watch for tool calls
    useEffect(() => {
        if (!aiMessages?.length) return;

        const lastMessage = aiMessages[aiMessages.length - 1];
        if (lastMessage.role !== 'assistant') return;

        // Check for tool calls in the last message parts
        // Vercel AI SDK structure: type = "tool-{toolName}", state = "output-available", data in input/output
        const toolCalls = lastMessage.parts?.filter((p: any) => p.type?.startsWith('tool-'));



        if (toolCalls) {
            for (const tool of toolCalls) {
                // Extract tool name from type (e.g., "tool-setComplexity" -> "setComplexity")
                const toolType = tool.type as string;

                // handle setComplexity
                if (toolType === 'tool-setComplexity' && tool.state === 'output-available') {
                    const level = tool.output?.level || tool.input?.level;
                    if (level) setComplexity(level as 1 | 2 | 3 | 4 | 5);
                }

                // handle requestContactInfo -> Move to CLOSING state
                if (toolType === 'tool-requestContactInfo' && tool.state === 'output-available') {
                    if (state !== "CLOSING") {
                        setState("CLOSING");
                    }
                }

                // handle confirmTopic -> Redirect logic
                if (toolType === 'tool-confirmTopic' && tool.state === 'output-available') {
                    const topic = tool.output?.topic || tool.input?.topic;
                    const twist = tool.output?.twist || tool.input?.twist;
                    if (topic) {
                        setConfirmedTopic({ topic, twist: twist || '' });
                        setState("COMPLETED");
                        localStorage.setItem('jstar_confirmed_topic', JSON.stringify({
                            topic,
                            twist: twist || '',
                            confirmedAt: new Date().toISOString(),
                            userId: userId || null
                        }));
                    }
                }
            }
        }
    }, [aiMessages, state]);

    // ==============================================
    // Phone Number Detection Utility
    // ==============================================
    // Robust regex to detect phone numbers with:
    // - Optional country code (+234, +1, etc.)
    // - Spaces, dashes, parentheses
    // - Nigerian format (0803..., 234803...)
    // - Minimum 10 digits to avoid false positives
    const detectPhoneNumber = (text: string): string | null => {
        const cleanedText = text.replace(/[\s\-().]/g, '');
        // Match international or local phone patterns
        const phoneRegex = /^\+?\d{10,15}$/;
        if (phoneRegex.test(cleanedText)) {
            return cleanedText; // Return cleaned number
        }
        // Try to extract phone from longer text (e.g., "My number is 08012345678")
        const extractMatch = text.match(/(?:\+?\d[\d\s\-().]{9,17}\d)/);
        if (extractMatch) {
            const extracted = extractMatch[0].replace(/[\s\-().]/g, '');
            if (extracted.length >= 10 && extracted.length <= 15) {
                return extracted;
            }
        }
        return null;
    };

    const handleUserMessage = async (text: string) => {
        // ==============================================
        // UNIVERSAL PHONE DETECTION (Works in ANY state)
        // ==============================================
        const detectedPhone = detectPhoneNumber(text);

        if (detectedPhone) {
            // We have a phone number! Extract topic and save as lead.
            console.log("[useChatFlow] Phone detected, triggering lead capture:", detectedPhone);

            try {
                // Build message history for extraction
                const messageHistory = aiMessages.map((m: any) => {
                    let content = '';
                    if (m.parts) {
                        const textPart = m.parts.find((p: any) => p.type === 'text');
                        content = textPart?.text || '';
                    } else if (typeof m.content === 'string') {
                        content = m.content;
                    }
                    return { role: m.role, content };
                }).filter((m: any) => m.content);

                // Call extraction API to get structured topic data
                let extractedData = {
                    topic: confirmedTopic?.topic || "Pending AI Confirmation",
                    twist: confirmedTopic?.twist || "Pending Twist",
                    department: "Computer Science",
                    complexity: complexity,
                };

                try {
                    const extractRes = await fetch('/api/extract-topic', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ messages: messageHistory }),
                    });
                    if (extractRes.ok) {
                        const extracted = await extractRes.json();
                        extractedData = {
                            topic: extracted.topic || extractedData.topic,
                            twist: extracted.twist || extractedData.twist,
                            department: extracted.department || extractedData.department,
                            complexity: extracted.complexity || extractedData.complexity,
                        };
                        console.log("[useChatFlow] Extracted topic:", extractedData);
                    }
                } catch (extractError) {
                    console.warn("[useChatFlow] Extraction failed, using defaults:", extractError);
                }

                // Save lead with extracted data
                await saveLeadAction({
                    whatsapp: detectedPhone,
                    topic: extractedData.topic,
                    twist: extractedData.twist,
                    complexity: extractedData.complexity,
                    department: extractedData.department,
                    anonymousId: anonymousId,
                    userId: userId,
                });

                // Transition to CLOSING if not already there
                if (state !== "CLOSING" && state !== "COMPLETED") {
                    setState("CLOSING");
                }

                // Send the message to AI so flow continues naturally
                await sendMessage({ text: `My WhatsApp number is ${text}` });
            } catch (err) {
                console.error("[useChatFlow] Lead save failed:", err);
                // Still send to AI so user isn't stuck
                await sendMessage({ text });
            }
            return;
        }


        // ==============================================
        // Default Behavior (No phone detected)
        // ==============================================
        try {
            if (state === "INITIAL") {
                setState("ANALYZING");
            } else {
                setState("ANALYZING");
            }

            await sendMessage({ text });
        } catch (err) {
            console.error("Message failed:", err);
            setState("PROPOSAL");
        } finally {
            setState((currentState) => {
                if (currentState === "ANALYZING") {
                    return "PROPOSAL";
                }
                return currentState;
            });
        }
    };


    const handleAction = (action: "accept" | "simplify" | "harder") => {
        // These serve as quick replies
        if (action === "accept") {
            setState("CLOSING");
            sendMessage({ text: "I accept this topic. Let's proceed." });
        } else if (action === "simplify") {
            setComplexity(prev => Math.max(1, prev - 1) as any);
            sendMessage({ text: "That's too complex. Make it simpler." });
        } else if (action === "harder") {
            setComplexity(prev => Math.min(5, prev + 1) as any);
            sendMessage({ text: "Too boring. Give me something harder." });
        }
    };

    // New: Handle when user clicks on a specific topic card
    const handleSelectTopic = (topic: { title: string; twist: string; difficulty: string }) => {
        sendMessage({ text: `I want to go with "${topic.title}" - the ${topic.twist} approach. Let's do this!` });
    };

    const proceedToBuilder = () => {
        router.push('/project/builder');
    };

    return {
        messages,
        state,
        complexity,
        isLoading,
        confirmedTopic,
        error,
        regenerate,
        handleUserMessage,
        handleAction,
        handleSelectTopic,
        proceedToBuilder
    };
}
