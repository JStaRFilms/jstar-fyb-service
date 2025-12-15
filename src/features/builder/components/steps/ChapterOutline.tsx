'use client';

import { useEffect, useState } from 'react';
import { useBuilderStore } from '../../store/useBuilderStore';
import { MockBuilderAi } from '../../services/mockBuilderAi';
import { motion } from 'framer-motion';
import { Check, Lock, ShieldCheck } from 'lucide-react';

export function ChapterOutline() {
    const { selectedTopic, generatedAbstract, generatedOutline, setOutline } = useBuilderStore();
    const [loading, setLoading] = useState(!generatedOutline);

    useEffect(() => {
        if (!selectedTopic) return;
        if (generatedOutline) {
            setLoading(false);
            return;
        }

        const generate = async () => {
            try {
                const result = await MockBuilderAi.generateOutline(selectedTopic);
                setOutline(result);
            } finally {
                setLoading(false);
            }
        };
        generate();
    }, [selectedTopic, generatedOutline, setOutline]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-green-500 animate-spin" />
                <h2 className="text-xl font-display font-bold animate-pulse">Structuring Content...</h2>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Success Header */}
            <div className="text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-500 mb-4 border border-green-500/20"
                >
                    <Check className="w-8 h-8" />
                </motion.div>
                <h1 className="text-3xl font-display font-bold mb-2">Structure Generated</h1>
                <p className="text-gray-400">We've crafted a distinction-grade abstract and outline.</p>
            </div>

            {/* Content Container */}
            <div className="relative">

                {/* Visible Teaser (Abstract) */}
                <div className="glass-panel p-6 rounded-t-3xl border-b border-white/5 bg-white/5">
                    <span className="text-xs font-mono text-accent uppercase tracking-wider mb-2 block">Project Title</span>
                    <h2 className="text-xl font-bold leading-tight mb-6">{selectedTopic}</h2>

                    <div>
                        <span className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2 block">Abstract Preview</span>
                        <p className="text-gray-300 leading-relaxed text-sm line-clamp-3">
                            {generatedAbstract}
                        </p>
                    </div>
                </div>

                {/* Blurred Content (Paywall) */}
                <div className="glass-panel p-6 rounded-b-3xl border-t-0 relative overflow-hidden bg-white/5">
                    <div className="space-y-8 select-none pointer-events-none opacity-50 blur-[6px]">
                        {generatedOutline?.slice(0, 3).map((chapter, i) => (
                            <div key={i}>
                                <h3 className="font-bold text-lg mb-2 text-white">{chapter}</h3>
                                <p className="text-gray-400 text-sm">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                                    exercitation ullamco.
                                </p>
                            </div>
                        ))}
                        <div>
                            <h3 className="font-bold text-lg mb-2 text-white">Chapter 2: Literature Review</h3>
                            <p className="text-gray-400 text-sm">Blurred content placeholder...</p>
                        </div>
                    </div>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/80 to-transparent flex flex-col items-center justify-end pb-10 z-10 px-6 text-center">
                        <Lock className="w-12 h-12 text-primary mb-4" />
                        <h3 className="text-2xl font-display font-bold mb-2 text-white">Unlock Full Project</h3>
                        <p className="text-gray-400 text-sm mb-6 max-w-sm">
                            Get the complete 5-chapter source code, documentation, and implementation guide.
                        </p>

                        <button className="w-full py-4 bg-primary text-white rounded-xl font-display font-bold uppercase tracking-wide hover:scale-105 transition-transform shadow-[0_0_30px_rgba(139,92,246,0.4)]">
                            Pay ₦15,000 to Unlock
                        </button>

                        <p className="mt-4 text-xs text-gray-500 flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3" /> Secured by Paystack
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
