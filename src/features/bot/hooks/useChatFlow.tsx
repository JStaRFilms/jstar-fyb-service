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

export function useChatFlow() {
    const router = useRouter();
    const [state, setState] = useState<ChatState>("INITIAL");
    const [complexity, setComplexity] = useState<1 | 2 | 3 | 4 | 5>(1);
    const [anonymousId, setAnonymousId] = useState<string>("");

    // Initialize Anonymous ID
    useEffect(() => {
        let id = localStorage.getItem("jstar_anonymous_id");
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem("jstar_anonymous_id", id);
        }
        setAnonymousId(id);
    }, []);

    const { messages: aiMessages, append, setInput, isLoading } = useChat({
        api: "/api/chat",
        body: { anonymousId },
        onFinish: (message: any) => {
            // Check for tool calls to update state/complexity
            if (message.toolInvocations) {
                const suggestionTool = message.toolInvocations.find((t: any) => t.toolName === 'suggestTopics');
                if (suggestionTool) {
                    setState("NEGOTIATION");
                    setComplexity(3);
                }
            }
        }
    });

    // Transform AI SDK messages to our UI format
    const messages: Message[] = aiMessages.map((m: any) => ({
        id: m.id,
        role: m.role === 'user' ? 'user' : 'ai',
        content: m.content,
        toolInvocations: m.toolInvocations,
        timestamp: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
    }));

    // Auto-greet
    const hasInitialized = useRef(false);
    useEffect(() => {
        if (!hasInitialized.current && anonymousId) {
            hasInitialized.current = true;
            // Future: Load initial messages or trigger greeting
        }
    }, [anonymousId]);


    const handleUserMessage = async (text: string) => {
        if (state === "CLOSING") {
            // Handle Lead Capture / Auth flow
            // Ideally we save the chat here definitively
            router.push('/project/builder');
            return;
        }

        setState("ANALYZING");
        await append({ role: 'user', content: text });
        if (!isLoading) setState("PROPOSAL");
    };

    const handleAction = (action: "accept" | "simplify" | "harder") => {
        if (action === "accept") {
            append({ role: 'user', content: "I accept this topic. Let's proceed." });
            setState("CLOSING");
        } else if (action === "simplify") {
            setComplexity(prev => Math.max(1, prev - 1) as any);
            append({ role: 'user', content: "That's too complex. Make it simpler." });
        } else if (action === "harder") {
            setComplexity(prev => Math.min(5, prev + 1) as any);
            append({ role: 'user', content: "Too boring. Give me something harder." });
        }
    };

    return {
        messages,
        state,
        complexity,
        handleUserMessage,
        handleAction
    };
}
