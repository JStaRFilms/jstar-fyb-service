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
    const [anonymousId, setAnonymousId] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem("jstar_anonymous_id") || "";
        }
        return "";
    });
    const [confirmedTopic, setConfirmedTopic] = useState<ConfirmedTopic | null>(null);

    // Initialize Anonymous ID if still empty
    useEffect(() => {
        if (!anonymousId) {
            let id = localStorage.getItem("jstar_anonymous_id");
            if (!id) {
                id = crypto.randomUUID();
                localStorage.setItem("jstar_anonymous_id", id);
            }
            setAnonymousId(id);
        }
    }, [anonymousId]);

    // Standard AI SDK useChat - Using any cast for options to bypass strict lint if needed
    // Using any cast for result to handle the sendMessage vs append typing
    const {
        messages: aiMessages,
        sendMessage,
        status,
        error,
        regenerate,
        setMessages
    } = useChat({
        body: {
            conversationId,
            anonymousId,
        }
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
                    // Match UIMessage structure with required parts array
                    setMessages(latest.messages.map(m => ({
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

            return {
                id: m.id,
                role: (m.role === 'user' ? 'user' : 'ai') as 'user' | 'ai',
                content: textContent,
                toolInvocations: m.parts?.filter((p: any) => p.type?.startsWith('tool-')),
                timestamp: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
            };
        })
        .filter((m: any) => m.content && (typeof m.content === 'string' ? m.content.trim() : true));

    // Watch for setComplexity tool calls
    useEffect(() => {
        for (const m of aiMessages as any[]) {
            if (m.parts) {
                for (const part of m.parts as any[]) {
                    if (part.type === 'tool-invocation' && part.toolName === 'setComplexity') {
                        const level = part.args?.level || part.result?.level;
                        if (level >= 1 && level <= 5) {
                            setComplexity(level as 1 | 2 | 3 | 4 | 5);
                        }
                    }
                }
            }
        }
    }, [aiMessages]);

    // Watch for confirmTopic tool calls
    useEffect(() => {
        for (const m of aiMessages as any[]) {
            if (m.parts) {
                for (const part of m.parts as any[]) {
                    const isConfirmTopic =
                        (part.type === 'tool-invocation' && part.toolName === 'confirmTopic') ||
                        (part.toolName === 'confirmTopic');

                    if (isConfirmTopic) {
                        const topic = part.args?.topic || part.result?.topic;
                        const twist = part.args?.twist || part.result?.twist;
                        if (topic && !confirmedTopic) {
                            setConfirmedTopic({ topic, twist: twist || '' });
                            setState("CLOSING");
                        }
                    }
                }
            }
        }
    }, [aiMessages, confirmedTopic]);

    const handleUserMessage = async (text: string) => {
        if (state === "CLOSING") {
            const cleanText = text.replace(/[\s-]/g, '');
            const isPhoneNumber = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(cleanText);

            if (isPhoneNumber && confirmedTopic) {
                setState("ANALYZING");
                const result = await saveLeadAction({
                    whatsapp: text.trim(),
                    topic: confirmedTopic.topic,
                    twist: confirmedTopic.twist,
                    complexity: complexity,
                    department: "Computer Science",
                    anonymousId: anonymousId,
                    userId: userId,
                });

                if (result.success) {
                    setState("COMPLETED");
                    return;
                } else {
                    setState("CLOSING");
                }
            }
        }

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
            setConfirmedTopic(null);
        } else if (action === "harder") {
            setComplexity(prev => Math.min(5, prev + 1) as any);
            sendMessage({ text: "Too boring. Give me something harder." });
            setConfirmedTopic(null);
        }
    };

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
