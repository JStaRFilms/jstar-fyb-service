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
    const [inputText, setInputText] = useState("");

    // Initialize Anonymous ID
    useEffect(() => {
        let id = localStorage.getItem("jstar_anonymous_id");
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem("jstar_anonymous_id", id);
        }
        setAnonymousId(id);
    }, []);

    const { messages: aiMessages, sendMessage, status } = useChat();

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
            router.push('/project/builder');
            return;
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
        } else if (action === "harder") {
            setComplexity(prev => Math.min(5, prev + 1) as any);
            sendMessage({ text: "Too boring. Give me something harder." });
        }
    };

    return {
        messages,
        state,
        complexity,
        isLoading,
        handleUserMessage,
        handleAction
    };
}
