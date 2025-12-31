'use client';

import { Suspense } from "react";
import { useBuilderStore } from "@/features/builder/store/useBuilderStore";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TopicSelector } from "@/features/builder/components/TopicSelector";
import { AbstractGenerator } from "@/features/builder/components/AbstractGenerator";
import { ChapterOutliner } from "@/features/builder/components/ChapterOutliner";
import { X } from "lucide-react";
import Link from "next/link";

import { useSession } from "@/lib/auth-client";
import { mergeAnonymousData } from "@/features/bot/actions/chat";

function BuilderContent() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const { step, updateData, syncWithUser, hydrateFromChat } = useBuilderStore();
    const searchParams = useSearchParams();

    // 1. Auth Guard: Redirect to Login if not authenticated
    // Crucial: Preserve query params (e.g., payment reference) in callbackUrl
    useEffect(() => {
        if (!isPending && !session) {
            const params = searchParams.toString();
            const callbackUrl = params ? `/project/builder?${params}` : '/project/builder';
            router.push(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        }
    }, [isPending, session, searchParams, router]);

    // Sync store with current user - but wait for session to load!
    useEffect(() => {
        if (!isPending) {
            syncWithUser(session?.user?.id || null);
        }
    }, [session?.user?.id, isPending, syncWithUser]);

    // Hydrate from chat if needed
    useEffect(() => {
        if (!isPending) {
            hydrateFromChat(session?.user?.id);
        }
    }, [hydrateFromChat, session?.user?.id, isPending]);

    useEffect(() => {
        if (!isPending && session?.user?.id) {
            const anonymousId = localStorage.getItem("jstar_anonymous_id");
            if (anonymousId) {
                mergeAnonymousData(anonymousId, session.user.id).then(() => {
                    localStorage.removeItem("jstar_anonymous_id");
                });
            }
        }
    }, [session?.user?.id, isPending]);

    useEffect(() => {
        const topic = searchParams.get('topic');
        const twist = searchParams.get('twist');
        if (topic && twist) updateData({ topic, twist });
    }, [searchParams, updateData]);

    // Helper to determine step index
    const getStepIndex = () => ['TOPIC', 'ABSTRACT', 'OUTLINE'].indexOf(step);

    return (
        <div className="min-h-screen bg-dark pb-32">
            {/* Progress Header */}
            <header className="sticky top-0 z-50 bg-dark/90 backdrop-blur-md border-b border-white/5 pb-4 pt-6">
                <div className="container mx-auto px-6">
                    <div className="flex items-center justify-between mb-4">
                        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </Link>
                        <span className="font-display font-bold uppercase tracking-widest text-sm text-white">Project Builder</span>
                        <span className="w-6"></span> {/* Spacer */}
                    </div>

                    {/* Steps Progress */}
                    <div className="flex items-center gap-2">
                        {['TOPIC', 'ABSTRACT', 'OUTLINE'].map((s, i) => {
                            const currentIndex = getStepIndex();
                            const isCompleted = currentIndex > i;
                            const isActive = currentIndex === i;

                            return (
                                <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 relative overflow-hidden ${isCompleted ? 'bg-green-500' :
                                    isActive ? 'bg-primary' : 'bg-white/10'
                                    }`}>
                                    {isActive && (
                                        <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-2 text-xs font-mono text-gray-500 uppercase">
                        <span className={getStepIndex() >= 0 ? "text-white" : ""}>Topic</span>
                        <span className={getStepIndex() >= 1 ? "text-white" : ""}>Context</span>
                        <span className={getStepIndex() >= 2 ? "text-primary font-bold" : ""}>Generate</span>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="container mx-auto px-6 py-8 md:max-w-3xl relative">
                <AnimatePresence mode="wait">
                    {step === 'TOPIC' && (
                        <motion.div
                            key="topic"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <TopicSelector />
                        </motion.div>
                    )}

                    {step === 'ABSTRACT' && (
                        <motion.div
                            key="abstract"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <AbstractGenerator />
                        </motion.div>
                    )}

                    {step === 'OUTLINE' && (
                        <motion.div
                            key="outline"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <ChapterOutliner />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

export default function BuilderPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-dark flex items-center justify-center text-white/50">Loading Builder...</div>}>
            <BuilderContent />
        </Suspense>
    );
}
