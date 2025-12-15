import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MockAiService, AnalysisResult } from "../services/mockAi";
import { captureLead } from "@/features/leads/actions/captureLead";

export interface Message {
    id: string;
    role: "ai" | "user";
    content: React.ReactNode;
    timestamp: string;
}

export type ChatState = "INITIAL" | "ANALYZING" | "PROPOSAL" | "NEGOTIATION" | "CLOSING" | "COMPLETED";

export function useChatFlow() {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [state, setState] = useState<ChatState>("INITIAL");
    const [complexity, setComplexity] = useState<1 | 2 | 3 | 4 | 5>(1);
    const [proposal, setProposal] = useState<AnalysisResult | null>(null);
    const [originalIdea, setOriginalIdea] = useState("");

    const hasInitialized = useRef(false);

    // Initial Greeting
    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            addMessage("ai", "Scanning academic trends... 🤖");
            setTimeout(() => {
                addMessage("ai", "I'm your Project Consultant. Tell me, what's your department and what kind of 'vibe' do you want? (e.g., 'Computer Science, something with AI but not too hard')");
            }, 1000);
        }
    }, []);

    const addMessage = (role: "ai" | "user", content: React.ReactNode) => {
        const newMessage: Message = {
            id: Math.random().toString(36).substr(2, 9),
            role,
            content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, newMessage]);
    };

    const handleUserMessage = async (text: string) => {
        addMessage("user", text);

        if (state === "CLOSING") {
            setState("ANALYZING"); // brief pause

            // Capture Lead
            const leadData = {
                whatsapp: text,
                department: proposal?.department || "Computer Science",
                topic: originalIdea,
                twist: proposal?.twist || "Unknown",
                complexity: complexity
            };

            const result = await captureLead(leadData);

            setTimeout(() => {
                if (result.success) {
                    addMessage("ai", "Perfect. I've created your project file and saved your spot. Redirecting you to the Project Builder...");
                    setState("COMPLETED");
                    setTimeout(() => router.push('/project/builder'), 2000);
                } else {
                    addMessage("ai", "I saved your details offline. Redirecting you...");
                    setState("COMPLETED");
                    setTimeout(() => router.push('/project/builder'), 2000);
                }
            }, 1500);
            return;
        }

        setOriginalIdea(text);
        setState("ANALYZING");

        try {
            const result = await MockAiService.analyzeIdea(text);
            setProposal(result);
            setComplexity(result.complexity);

            setState("PROPOSAL");

            // Presenting the proposal
            addMessage("ai", "Analyzing feasible topics...");

            setTimeout(() => {
                addMessage("ai", (
                    <div>
                        <p>That idea is a bit basic. How about we <strong className="text-primary">twist</strong> it?</p>
                        <p className="mt-2">Instead, let's build a <span className="text-accent font-bold">"{result.twist}"</span>.</p>
                        <ul className="mt-3 space-y-2 text-sm">
                            {result.reasoning.map((r, i) => (
                                <li key={i} className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span> {r}
                                </li>
                            ))}
                        </ul>
                    </div>
                ));
                setState("NEGOTIATION");
            }, 1500);

        } catch (error) {
            addMessage("ai", "My systems are overloaded. Try again.");
            setState("INITIAL");
        }
    };

    const handleAction = (action: "accept" | "simplify" | "harder") => {
        if (action === "accept") {
            addMessage("user", "I love it. Let's do it.");
            setTimeout(() => {
                addMessage("ai", "Excellent choice. To generate the full abstract and chapter outline, I need your WhatsApp number to create your file.");
                setState("CLOSING");
            }, 1000);
        }
        // Can implement other actions later
    };

    return {
        messages,
        state,
        complexity,
        handleUserMessage,
        handleAction
    };
}
