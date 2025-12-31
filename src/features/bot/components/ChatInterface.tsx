'use client';

import { useEffect, useRef, useState } from "react";
import { Mic, SendHorizontal, Plus, ArrowLeft, LogOut, User, AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { MessageBubble } from "./MessageBubble";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { ComplexityMeter } from "./ComplexityMeter";
import { SuggestionChips } from "./SuggestionChips";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useChatFlow } from "../hooks/useChatFlow";
import { ProposalCard } from "./ProposalCard";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { mergeAnonymousData } from "../actions/chat";
import { signInAction, signOutAction } from "@/features/auth/actions";

export function ChatInterface() {
    const { data: session } = useSession();
    const user = session?.user;
    const { messages, state, complexity, isLoading, confirmedTopic, hasProvidedPhone, error, regenerate, handleUserMessage, handleAction, handleSelectTopic, proceedToBuilder } = useChatFlow(user?.id);
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const anonymousId = localStorage.getItem("jstar_anonymous_id");
        if (user && anonymousId) {
            // User just logged in, but has an anonymous history
            // Merge it!
            mergeAnonymousData(anonymousId, user.id || "")
                .then(() => {
                    // console.log("Merged history");
                    // specific cleanup if needed, keeping anonymousId is fine for session continuity
                })
                .catch((err) => {
                    console.error("Failed to merge anonymous history:", err);
                });
        }
    }, [user, user?.id]);

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
                                {user.name?.charAt(0) || "U"}
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
                <ErrorBoundary>
                    {/* Error Alert */}
                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            <p className="text-sm flex-1">Something went wrong. Please try again.</p>
                            <button
                                onClick={() => regenerate?.()}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs font-bold transition-colors"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Retry
                            </button>
                        </div>
                    )}
                    <AnimatePresence>
                        {messages.map((msg) => (
                            <div key={msg.id} className="flex flex-col gap-2">
                                <MessageBubble
                                    role={msg.role}
                                    content={msg.content}
                                    timestamp={msg.timestamp}
                                />
                                {/* Render Tool Invocations (Proposals) */}
                                {msg.role === 'ai' && msg.toolInvocations?.map((tool: any, idx: number) => {
                                    // Vercel AI SDK structure:
                                    // - type: "tool-suggestTopics" (name embedded)
                                    // - state: "output-available" 
                                    // - data in input/output

                                    if (tool.type === 'tool-suggestTopics' && tool.state === 'output-available') {
                                        const topics = tool.output?.topics || tool.input?.topics;
                                        return (
                                            <div key={tool.toolCallId || `tool-${idx}`} className="ml-0 md:ml-14 animate-in fade-in slide-in-from-bottom-2">
                                                <ProposalCard
                                                    topics={topics}
                                                    onAccept={(topic) => handleSelectTopic(topic)}
                                                />
                                            </div>
                                        );
                                    }

                                    // Handle requestContactInfo - Show WhatsApp request card
                                    if (tool.type === 'tool-requestContactInfo' && tool.state === 'output-available') {
                                        const reason = tool.output?.reason || tool.input?.reason || 'To proceed with your project';
                                        return (
                                            <motion.div
                                                key={tool.toolCallId || `tool-contact-${idx}`}
                                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={{ duration: 0.4, ease: 'easeOut' }}
                                                className="ml-0 md:ml-14 max-w-md"
                                            >
                                                <div className="bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30 rounded-2xl p-5 shadow-lg shadow-primary/5">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                                                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.468a.75.75 0 00.942.942l4.434-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.137 0-4.146-.569-5.879-1.56l-.41-.252-4.26 1.437 1.437-4.26-.252-.41A9.935 9.935 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-display font-bold text-white">Ready to lock it in! 🔐</h3>
                                                            <p className="text-xs text-gray-400">{reason}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-300 mb-3">
                                                        Drop your WhatsApp number below and I'll send you the full breakdown. 👇
                                                    </p>
                                                    <form
                                                        onSubmit={(e) => {
                                                            e.preventDefault();
                                                            const form = e.target as HTMLFormElement;
                                                            const input = form.elements.namedItem('whatsapp') as HTMLInputElement;
                                                            if (input.value.trim()) {
                                                                handleUserMessage(input.value.trim());
                                                                input.value = '';
                                                            }
                                                        }}
                                                        className="flex gap-2"
                                                    >
                                                        <div className="flex-1 relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">📲</span>
                                                            <input
                                                                type="tel"
                                                                name="whatsapp"
                                                                placeholder="+234 812 345 6789"
                                                                className="w-full bg-dark/50 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary/50 transition-all"
                                                                autoComplete="tel"
                                                            />
                                                        </div>
                                                        <button
                                                            type="submit"
                                                            className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-all hover:scale-105 shadow-lg shadow-primary/20"
                                                        >
                                                            Send
                                                        </button>
                                                    </form>
                                                </div>
                                            </motion.div>
                                        );
                                    }

                                    return null;
                                })}
                            </div>
                        ))}
                    </AnimatePresence>

                    {/* Smart Suggestion Chips - shown after last AI message */}
                    {messages.length > 0 && messages[messages.length - 1].role === 'ai' && (
                        <div className="ml-0 md:ml-14 max-w-2xl space-y-4">
                            {/* Fallback Context Card - When bot stuck but we have user's info */}
                            {hasProvidedPhone && !confirmedTopic && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30 rounded-2xl p-4 shadow-lg"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center shrink-0">
                                            <span className="text-xl">✅</span>
                                        </div>
                                        <div>
                                            <h3 className="font-display font-bold text-white text-sm">Got Your Info!</h3>
                                            <p className="text-xs text-gray-300 mt-1">
                                                We've saved your details. Jay got a bit tangled up, but no worries — you can head straight to the Builder to start your project!
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <SuggestionChips
                                confirmedTopic={confirmedTopic}
                                onAction={handleAction}
                                onProceed={proceedToBuilder}
                                isLoading={isLoading}
                                hasProvidedPhone={hasProvidedPhone}
                            />
                        </div>
                    )}

                    {state === "ANALYZING" && <ThinkingIndicator />}

                    <div ref={messagesEndRef} />
                </ErrorBoundary>
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
