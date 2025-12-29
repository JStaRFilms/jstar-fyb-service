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

    // Initialize anonymousId on client-side only (after hydration)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            let id = localStorage.getItem("jstar_anonymous_id");
            if (!id) {
                id = crypto.randomUUID();
                localStorage.setItem("jstar_anonymous_id", id);
            }
            setAnonymousId(id);
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
        if (!hasSyncedHistory.current && anonymousId) {
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
                            confirmedAt: new Date().toISOString()
                        }));
                    }
                }
            }
        }
    }, [aiMessages, state]);

    const handleUserMessage = async (text: string) => {
        // If we are in CLOSING state, we expect a phone number
        if (state === "CLOSING") {
            const cleanText = text.replace(/[\s-]/g, '');
            // Simple phone regex or loose check
            const isPhoneNumber = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(cleanText);

            if (isPhoneNumber) {
                // We'll tentatively use the last known complexity/topic if available, 
                // but really we just want to save the lead. 
                // However, the AI hasn't CONFIRMED the topic yet formally via tool in this flow usually, 
                // OR it has discussed it. 
                // We will try to save what we have. API allows empty topic/twist if needed but schema says required.
                // We'll pass placeholders if needed or rely on what AI context has.
                // Actually, let's just save the Lead with the text as the "Topic" or "Context" if missing?
                // No, the schema requires topic/twist.
                // We should probably rely on the AI to confirm the topic AFTER getting the phone number.

                // HACK: Pass "Pending" if not yet confirmed, or try to extract from local state if we tracked it?
                // For now, let's assume the flow: AI Pitched -> AI asked for Phone -> User provided Phone.
                // We don't have the topic in a structured variable yet unless `suggestTopics` saved it?
                // `suggestTopics` doesn't save selection.

                // Workaround: We will send the phone number to the AI first.
                // The AI will see the phone number, then it will call `confirmTopic`.
                // We can save the lead *inside* the `confirmTopic` tool? 
                // No, existing architecture: `saveLeadAction` is separate.

                // Let's call safeLeadAction with "Pending extraction" and update it later?
                // Or just send message and let AI handle the data extraction via `confirmTopic`?

                // BETTER PLAN: 
                // 1. Send message to AI: "My number is [number]".
                // 2. AI sees it, calls `confirmTopic(topic, twist)`.
                // 3. We intercept `confirmTopic`.
                // 4. We call `saveLeadAction` with the extracted topic/twist AND the phone number we just saw?
                // Complexity: The phone number was in the user message.

                // SIMPLER PLAN (Current implementation):
                // We try to save the lead now. If we don't have topic, we just pass "From Chat".

                try {
                    const result = await saveLeadAction({
                        whatsapp: text.trim(),
                        topic: confirmedTopic?.topic || "Pending AI Confirmation",
                        twist: confirmedTopic?.twist || "Pending Twist",
                        complexity: complexity,
                        department: "Computer Science",
                        anonymousId: anonymousId,
                        userId: userId,
                    });

                    // Send the phone number to the AI regardless of save success (so conversation continues)
                    await sendMessage({ text: `My WhatsApp number is ${text}` });
                } catch (err) {
                    console.error("Error in closing flow:", err);
                    // Force state reset if error
                    setState("PROPOSAL");
                }
                return;
            }
        }

        // Default behavior
        try {
            if (state === "INITIAL") {
                setState("ANALYZING");
            } else {
                // If not initial, likely staying in current state context until response? 
                // Actually keep it simple, if we are typing, we are "Analyzing" response next
                setState("ANALYZING");
            }

            await sendMessage({ text });
        } catch (err) {
            console.error("Message failed:", err);
            // Don't leave UI in ANALYZING (disabled) state
            setState("PROPOSAL");
        } finally {
            // Only reset to PROPOSAL if we're still in ANALYZING state.
            // Don't override CLOSING or COMPLETED states set by tool handlers.
            setState((currentState) => {
                if (currentState === "ANALYZING") {
                    return "PROPOSAL";
                }
                // Keep CLOSING, COMPLETED, or any other state set by tools
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
