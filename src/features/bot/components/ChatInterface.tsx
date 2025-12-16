'use client';

import { useEffect, useRef, useState } from "react";
import { Mic, SendHorizontal, Plus, ArrowLeft, LogOut, User } from "lucide-react";
import Link from "next/link";
import { MessageBubble } from "./MessageBubble";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { ComplexityMeter } from "./ComplexityMeter";
import { SuggestionChips } from "./SuggestionChips";
import { useChatFlow } from "../hooks/useChatFlow";
import { ProposalCard } from "./ProposalCard";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { mergeAnonymousConversations } from "../actions/chat";
import { signInAction, signOutAction } from "@/features/auth/actions";

export function ChatInterface() {
    const { messages, state, complexity, isLoading, confirmedTopic, handleUserMessage, handleAction, proceedToBuilder } = useChatFlow();
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auth & Persistence
    const { user } = useAuth();

    useEffect(() => {
        const anonymousId = localStorage.getItem("jstar_anonymous_id");
        if (user && anonymousId) {
            // User just logged in, but has an anonymous history
            // Merge it!
            mergeAnonymousConversations(anonymousId, user.id || "")
                .then(() => {
                    // console.log("Merged history");
                    // specific cleanup if needed, keeping anonymousId is fine for session continuity
                });
        }
    }, [user]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, state]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        handleUserMessage(inputValue);
        setInputValue("");
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-dark text-white overflow-hidden font-sans">
            {/* Header */}
            <header className="h-16 flex items-center justify-between px-4 border-b border-white/5 bg-dark/80 backdrop-blur-md z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <Link href="/" className="p-2 rounded-full hover:bg-white/5 text-gray-400">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-display font-bold text-lg tracking-wide hidden md:block">Project Consultant</h1>
                        <h1 className="font-display font-bold text-lg tracking-wide md:hidden">Jay</h1>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs text-gray-400 font-mono">Active</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Complexity Widget - Desktop */}
                    <div className="hidden md:block">
                        <ComplexityMeter score={complexity} />
                    </div>

                    {/* Auth Button */}
                    {user ? (
                        <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold ring-2 ring-white/10">
                                {user.firstName?.charAt(0) || "U"}
                            </div>
                            <button
                                onClick={() => signOutAction()}
                                className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-red-400 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => signInAction()}
                            className="px-4 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 text-xs font-bold text-primary transition-all flex items-center gap-2"
                        >
                            <User className="w-3 h-3" />
                            Sign In to Save
                        </button>
                    )}
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth pb-32">
                <AnimatePresence>
                    {messages.map((msg) => (
                        <div key={msg.id} className="flex flex-col gap-2">
                            <MessageBubble
                                role={msg.role}
                                content={msg.content}
                                timestamp={msg.timestamp}
                            />
                            {/* Render Tool Invocations (Proposals) */}
                            {msg.role === 'ai' && msg.toolInvocations?.map((tool: any) => {
                                if (tool.toolName === 'suggestTopics' && tool.state === 'result') {
                                    return (
                                        <div key={tool.toolCallId} className="ml-0 md:ml-14 animate-in fade-in slide-in-from-bottom-2">
                                            <ProposalCard
                                                topics={tool.result.topics}
                                                onAccept={(topic) => handleAction("accept")}
                                            />
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    ))}
                </AnimatePresence>

                {/* Smart Suggestion Chips - shown after last AI message */}
                {messages.length > 0 && messages[messages.length - 1].role === 'ai' && (
                    <div className="ml-0 md:ml-14 max-w-2xl">
                        <SuggestionChips
                            confirmedTopic={confirmedTopic}
                            onAction={handleAction}
                            onProceed={proceedToBuilder}
                            isLoading={isLoading}
                        />
                    </div>
                )}

                {state === "ANALYZING" && <ThinkingIndicator />}

                <div ref={messagesEndRef} />
            </main>

            {/* Mobile Complexity Meter */}
            <div className="md:hidden absolute bottom-[88px] left-0 right-0 px-4 pointer-events-none">
                <div className="bg-dark/90 backdrop-blur-md border border-white/10 rounded-lg p-2 flex justify-between items-center pointer-events-auto">
                    <span className="text-xs text-gray-400 font-mono uppercase">Complexity</span>
                    <div className="scale-75 origin-right">
                        <ComplexityMeter score={complexity} />
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <footer className="p-4 bg-dark/80 backdrop-blur-xl border-t border-white/5 shrink-0 z-30">
                <form onSubmit={onSubmit} className="flex gap-3 relative max-w-4xl mx-auto">
                    <button type="button" className="p-4 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors md:hidden">
                        <Plus className="w-6 h-6" />
                    </button>

                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={state === "CLOSING" ? "Enter your WhatsApp number..." : "Type your reply..."}
                            disabled={state === "ANALYZING"}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all font-light disabled:opacity-50"
                        />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
                            <Mic className="w-5 h-5" />
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="p-4 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        <SendHorizontal className="w-6 h-6" />
                    </button>
                </form>
            </footer>
        </div>
    );
}
