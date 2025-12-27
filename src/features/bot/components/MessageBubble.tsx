import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
    role: "ai" | "user";
    content: React.ReactNode;
    timestamp?: string;
}

export function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
    const isAi = role === "ai";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className={cn(
                "flex gap-4 max-w-2xl text-left",
                !isAi && "ml-auto flex-row-reverse"
            )}
        >
            {/* Avatar */}
            <div
                className={cn(
                    "w-10 h-10 rounded-full hidden md:flex items-center justify-center shrink-0 border shadow-lg overflow-hidden",
                    isAi
                        ? "bg-primary/20 border-primary/30 shadow-primary/20"
                        : "bg-accent/20 border-accent/30 shadow-accent/20"
                )}
            >
                {isAi ? (
                    <img src="/images/jay-portrait.png" alt="Jay" className="w-full h-full object-cover" />
                ) : (
                    <User className="w-5 h-5 text-accent" />
                )}
            </div>

            {/* Content */}
            <div className="space-y-2 w-full">
                <div
                    className={cn(
                        "px-5 py-4 leading-relaxed shadow-lg backdrop-blur-md border",
                        isAi
                            ? "bg-primary/5 border-primary/20 rounded-tr-[1.5rem] rounded-bl-[1.5rem] rounded-br-[1.5rem] rounded-tl-[0.25rem] text-gray-200"
                            : "bg-accent/5 border-accent/20 rounded-tl-[1.5rem] rounded-bl-[1.5rem] rounded-br-[0.25rem] rounded-tr-[1.5rem] text-white"
                    )}
                >
                    {isAi && typeof content === 'string' ? (
                        <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-a:text-primary prose-ul:text-gray-300 prose-ol:text-gray-300">
                            <ReactMarkdown>{content}</ReactMarkdown>
                        </div>
                    ) : (
                        content
                    )}
                </div>
                {timestamp && (
                    <span className={cn("text-xs text-gray-500 block", !isAi && "text-right")}>
                        {timestamp}
                    </span>
                )}
            </div>
        </motion.div>
    );
}

