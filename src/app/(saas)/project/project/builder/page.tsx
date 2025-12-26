'use client';

import { Suspense } from "react";
import { useBuilderStore } from "@/features/builder/store/useBuilderStore";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TopicSelector } from "@/features/builder/components/TopicSelector";
import { AbstractGenerator } from "@/features/builder/components/AbstractGenerator";
import { ChapterOutliner } from "@/features/builder/components/ChapterOutliner";

function BuilderContent() {
    const { step, setStep, updateData } = useBuilderStore();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Hydrate from URL if redirected from Chat
        const topic = searchParams.get('topic');
        const twist = searchParams.get('twist');
        if (topic && twist) {
            updateData({ topic, twist });
            // Ideally we might want to confirm this in the UI
        }
    }, [searchParams, updateData]);

    return (
        <div className="min-h-screen bg-dark text-white p-4 md:p-8 flex flex-col items-center">
            {/* Progress / Header */}
            <header className="w-full max-w-4xl mb-12 flex justify-between items-center">
                <h1 className="font-display font-bold text-2xl tracking-wide">Project Builder</h1>
                <div className="flex gap-2">
                    {['TOPIC', 'ABSTRACT', 'OUTLINE'].map((s, i) => (
                        <div key={s} className={`h-2 w-12 rounded-full transition-colors ${['TOPIC', 'ABSTRACT', 'OUTLINE'].indexOf(step) >= i ? 'bg-primary' : 'bg-white/10'
                            }`} />
                    ))}
                </div>
            </header>

            {/* Main Content Area */}
            <main className="w-full max-w-4xl flex-1 relative">
                <AnimatePresence mode="wait">
                    {step === 'TOPIC' && (
                        <motion.div
                            key="topic"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full"
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
