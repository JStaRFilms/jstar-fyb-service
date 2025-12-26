import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";

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

export function useChatFlow() {
    const router = useRouter();
    const [state, setState] = useState<ChatState>("INITIAL");
    const [complexity, setComplexity] = useState<1 | 2 | 3 | 4 | 5>(1);
    const [anonymousId, setAnonymousId] = useState<string>("");
    const [inputText, setInputText] = useState("");
    const [confirmedTopic, setConfirmedTopic] = useState<ConfirmedTopic | null>(null);

    // Initialize Anonymous ID
    useEffect(() => {
        let id = localStorage.getItem("jstar_anonymous_id");
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem("jstar_anonymous_id", id);
        }
        setAnonymousId(id);
    }, []);

    const { messages: aiMessages, sendMessage, status, error, regenerate } = useChat();

    const isLoading = status === 'streaming' || status === 'submitted';

    // Transform AI SDK messages to our UI format and filter out empty ones
    const messages: Message[] = aiMessages
        .map((m: any) => {
            // Extract text from parts array or use content directly
            let textContent = '';
            if (m.parts) {
                const textPart = m.parts.find((p: any) => p.type === 'text');
                textContent = textPart?.text || '';
            } else if (typeof m.content === 'string') {
                textContent = m.content;
            }

            return {
                id: m.id,
                role: (m.role === 'user' ? 'user' : 'ai') as 'user' | 'ai',
                content: textContent,
                toolInvocations: m.parts?.filter((p: any) => p.type?.startsWith('tool-')),
                timestamp: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
            };
        })
        .filter(m => m.content && (typeof m.content === 'string' ? m.content.trim() : true)); // Filter empty messages

    // Watch for setComplexity tool calls and update complexity meter
    useEffect(() => {
        for (const m of aiMessages) {
            if (m.parts) {
                for (const part of m.parts as any[]) {
                    // Check for setComplexity tool call (either from input or result)
                    if (part.type === 'tool-invocation' && part.toolName === 'setComplexity') {
                        const level = part.args?.level || part.result?.level;
                        if (level >= 1 && level <= 5) {
                            console.log('[Complexity] Tool called with level:', level);
                            setComplexity(level as 1 | 2 | 3 | 4 | 5);
                        }
                    }
                    // Also check for tool-setComplexity part type (AI SDK v5 format)
                    if (part.type?.includes('setComplexity')) {
                        const level = part.input?.level || part.result?.level || part.args?.level;
                        if (level >= 1 && level <= 5) {
                            console.log('[Complexity] Tool detected with level:', level);
                            setComplexity(level as 1 | 2 | 3 | 4 | 5);
                        }
                    }
                }
            }
        }
    }, [aiMessages]);

    // Watch for confirmTopic tool calls → update state (but don't auto-redirect)
    useEffect(() => {
        for (const m of aiMessages) {
            if (m.parts) {
                for (const part of m.parts as any[]) {
                    // Check for confirmTopic tool invocation (AI SDK v5 format)
                    const isConfirmTopic =
                        (part.type === 'tool-invocation' && part.toolName === 'confirmTopic') ||
                        (part.type?.includes('confirmTopic')) ||
                        (part.toolName === 'confirmTopic');

                    if (isConfirmTopic) {
                        const topic = part.args?.topic || part.result?.topic || part.input?.topic;
                        const twist = part.args?.twist || part.result?.twist || part.input?.twist;
                        if (topic && !confirmedTopic) {
                            console.log('[Chat Handoff] Topic confirmed:', { topic, twist });
                            setConfirmedTopic({ topic, twist: twist || '' });
                            setState("CLOSING");
                        }
                    }
                }
            }
        }
    }, [aiMessages, confirmedTopic]);

    // Auto-greet
    const hasInitialized = useRef(false);
    useEffect(() => {
        if (!hasInitialized.current && anonymousId) {
            hasInitialized.current = true;
            // Future: Load initial messages or trigger greeting
        }
    }, [anonymousId]);

    const handleUserMessage = async (text: string) => {
        setState("ANALYZING");
        await sendMessage({ text });
        setState("PROPOSAL");
    };

    const handleAction = (action: "accept" | "simplify" | "harder") => {
        if (action === "accept") {
            sendMessage({ text: "I accept this topic. Let's proceed." });
            setState("CLOSING");
        } else if (action === "simplify") {
            setComplexity(prev => Math.max(1, prev - 1) as any);
            sendMessage({ text: "That's too complex. Make it simpler." });
            // Reset confirmed topic if user wants to change
            setConfirmedTopic(null);
        } else if (action === "harder") {
            setComplexity(prev => Math.min(5, prev + 1) as any);
            sendMessage({ text: "Too boring. Give me something harder." });
            setConfirmedTopic(null);
        }
    };

    // Manual proceed to builder (reliable trigger)
    const proceedToBuilder = () => {
        if (confirmedTopic) {
            localStorage.setItem('jstar_confirmed_topic', JSON.stringify({
                topic: confirmedTopic.topic,
                twist: confirmedTopic.twist,
                confirmedAt: new Date().toISOString()
            }));
        }
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
        proceedToBuilder
    };
}
