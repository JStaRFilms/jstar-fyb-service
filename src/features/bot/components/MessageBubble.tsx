import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import { ComplexityMeter } from "./ComplexityMeter";

interface MessageBubbleProps {
    role: "ai" | "user";
    content: React.ReactNode;
    timestamp?: string;
    onRetry?: () => void;
    toolInvocations?: any[];
}

export function MessageBubble({ role, content, timestamp, onRetry, toolInvocations }: MessageBubbleProps) {
    const isAi = role === "ai";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className={cn(
                "flex gap-4 max-w-2xl text-left group",
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
            <div className="space-y-2 w-full flex flex-col">
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

                    {/* Task 4: Inline Complexity Meter */}
                    {isAi && toolInvocations && toolInvocations.map((tool, idx) => {
                        if (tool.type === 'tool-setComplexity') {
                            const level = tool.output?.level || tool.input?.level || tool.args?.level;
                            if (level) {
                                return (
                                    <div key={idx} className="mt-3 p-3 bg-dark/30 rounded-lg border border-white/5">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-gray-400 font-mono uppercase">Complexity Updated</span>
                                            <span className="text-xs font-bold text-primary">Level {level}</span>
                                        </div>
                                        <div className="scale-90 origin-left">
                                            <ComplexityMeter score={level} />
                                        </div>
                                    </div>
                                );
                            }
                        }
                        return null;
                    })}
                </div>
                {/* Meta Row: Timestamp + Retry */}
                <div className={cn("flex items-center gap-2", !isAi && "justify-end")}>
                    {onRetry && !isAi && (
                        <button
                            onClick={onRetry}
                            className="p-1 rounded-full text-gray-500 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                            title="Retry this message"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>
                        </button>
                    )}
                    {timestamp && (
                        <span className="text-xs text-gray-500 block">
                            {timestamp}
                        </span>
                    )}

                </div>
            </div>
        </motion.div>
    );
}

