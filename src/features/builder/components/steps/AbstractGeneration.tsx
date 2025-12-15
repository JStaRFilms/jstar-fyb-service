'use client';

import { useEffect, useState } from 'react';
import { useBuilderStore } from '../../store/useBuilderStore';
import { MockBuilderAi } from '../../services/mockBuilderAi';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';

export function AbstractGeneration() {
    const { selectedTopic, generatedAbstract, setAbstract, nextStep } = useBuilderStore();
    const [loading, setLoading] = useState(!generatedAbstract);

    useEffect(() => {
        if (!selectedTopic) return;
        if (generatedAbstract) {
            setLoading(false);
            return;
        }

        const generate = async () => {
            try {
                const text = await MockBuilderAi.generateAbstract(selectedTopic);
                setAbstract(text);
            } finally {
                setLoading(false);
            }
        };
        generate();
    }, [selectedTopic, generatedAbstract, setAbstract]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl">✨</span>
                    </div>
                </div>
                <h2 className="text-xl font-display font-bold animate-pulse">Drafting Abstract...</h2>
                <p className="text-gray-400 max-w-md">Our AI is analyzing academic papers to craft a distinction-grade summary.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <span className="text-xs font-mono text-accent uppercase tracking-wider mb-2 block">Selected Topic</span>
                <h1 className="text-2xl md:text-3xl font-display font-bold max-w-2xl mx-auto leading-tight">{selectedTopic}</h1>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-8 rounded-3xl border border-white/10 bg-white/5"
            >
                <h3 className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-4">Abstract Preview</h3>
                <p className="text-gray-200 leading-relaxed text-lg font-light">
                    {generatedAbstract}
                </p>
            </motion.div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={nextStep}
                    className="group flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-display font-medium tracking-wide transition-all hover:scale-105"
                >
                    Generate Chapter Outline
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
