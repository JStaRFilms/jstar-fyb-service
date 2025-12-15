'use client';

import { useBuilderStore } from "@/features/builder/store/useBuilderStore";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TopicSelector } from "@/features/builder/components/TopicSelector";
import { AbstractGenerator } from "@/features/builder/components/AbstractGenerator";
import { ChapterOutliner } from "@/features/builder/components/ChapterOutliner";
import { X, Check } from "lucide-react";
import Link from "next/link";

export default function BuilderPage() {
    const { step, setStep, updateData } = useBuilderStore();
    const searchParams = useSearchParams();

    useEffect(() => {
        const topic = searchParams.get('topic');
        const twist = searchParams.get('twist');
        if (topic && twist) {
            updateData({ topic, twist });
        }
    }, [searchParams]);

    // Helper to determine step index
    const getStepIndex = () => ['TOPIC', 'ABSTRACT', 'OUTLINE'].indexOf(step);

    return (
        <div className="min-h-screen bg-dark pb-32">
            {/* Progress Header */}
            <header className="sticky top-0 z-50 bg-dark/90 backdrop-blur-md border-b border-white/5 pb-4 pt-6">
                <div className="container mx-auto px-6 max-w-3xl">
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
            <main className="container mx-auto px-6 py-8 max-w-3xl relative">
                <AnimatePresence mode="wait">
                    {step === 'TOPIC' && (
                        <motion.div
                            key="topic"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <TopicSelector />
                        </motion.div>
                    )}

                    {step === 'ABSTRACT' && (
                        <motion.div
                            key="abstract"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <AbstractGenerator />
                        </motion.div>
                    )}

                    {step === 'OUTLINE' && (
                        <motion.div
                            key="outline"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <ChapterOutliner />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
