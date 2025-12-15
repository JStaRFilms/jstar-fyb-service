'use client';

import { useBuilderStore } from "@/features/builder/store/useBuilderStore";
import { useState, useEffect, useRef } from "react";
import { Loader2, Sparkles, Send, Check, RefreshCw, Bot, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AbstractGenerator() {
    const { data, updateData, setStep } = useBuilderStore();

    // Abstract Editing State
    const [abstract, setAbstract] = useState(data.abstract || "");
    const [refineInput, setRefineInput] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [abstract]);

    // Simulation of AI Streaming
    const streamAbstract = (newText: string) => {
        setIsGenerating(true);
        setAbstract("");
        let i = 0;
        const interval = setInterval(() => {
            setAbstract(newText.slice(0, i));
            i++;
            if (i > newText.length) {
                clearInterval(interval);
                setIsGenerating(false);
                updateData({ abstract: newText });
            }
        }, 8); // Slightly faster
    };

    // Initial Auto-Start
    useEffect(() => {
        if (!data.abstract) {
            const initialDraft = `This project, titled "${data.topic}", aims to revolutionize the industry by incorporating ${data.twist || "advanced approaches"}. The proposed system leverages a scalable architecture to ensure robustness... \n\nKey objectives include:\n1. Designing a secure authentication module.\n2. Implementing distinct user roles.\n3. Evaluating performance metrics under load.\n\nThe expected outcome is a fully functional prototype demonstrating the viability of integrating ${data.twist || "this technology"} into modern workflows.`;
            streamAbstract(initialDraft);
        }
    }, []);

    const handleRefine = () => {
        if (!refineInput) return;
        const refinedDraft = `${abstract} \n\n(Refined: "${refineInput}") -> Updated validation metrics and added security compliance content.`;
        streamAbstract(refinedDraft);
        setRefineInput("");
    };

    const handleApprove = () => {
        updateData({ abstract });
        setStep('OUTLINE');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header / Status */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-bold text-white mb-1">Project Context</h2>
                    <p className="text-sm text-gray-400">Review and refine the AI-generated abstract before structuring the chapters.</p>
                </div>
                {isGenerating && (
                    <div className="flex items-center gap-2 text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="font-mono text-xs uppercase tracking-wider font-bold">AI Writing...</span>
                    </div>
                )}
            </div>

            {/* Main Editor Glass Panel */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative"
            >
                {/* Editor Toolbar */}
                <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-accent/80">
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Abstract Editor</span>
                    </div>

                    <button
                        onClick={() => streamAbstract(data.abstract || abstract)}
                        className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5"
                        disabled={isGenerating}
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                        Regenerate
                    </button>
                </div>

                {/* Text Area */}
                <div className="p-8 bg-gradient-to-b from-transparent to-black/20">
                    <textarea
                        ref={textareaRef}
                        value={abstract}
                        onChange={(e) => setAbstract(e.target.value)}
                        disabled={isGenerating}
                        className="w-full min-h-[300px] bg-transparent border-none focus:ring-0 text-lg font-serif leading-relaxed text-gray-200 resize-none p-0 placeholder-gray-700 focus:outline-none selection:bg-primary/30"
                        placeholder="Waiting for AI generation..."
                    />
                </div>

                {/* AI Command Bar */}
                <div className="p-5 bg-black/40 border-t border-white/5">
                    <div className="flex flex-col md:flex-row gap-4 items-center">

                        {/* Refine Input */}
                        <div className="relative flex-1 w-full group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                            <div className="relative flex items-center bg-black/60 border border-white/10 rounded-xl overflow-hidden focus-within:border-white/20 transition-colors">
                                <div className="pl-4 text-primary">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={refineInput}
                                    onChange={(e) => setRefineInput(e.target.value)}
                                    disabled={isGenerating}
                                    placeholder="Give instructions to refine (e.g. 'Make it more academic')"
                                    className="w-full bg-transparent border-none px-4 py-3.5 text-sm text-white focus:ring-0 placeholder-gray-500 font-light"
                                    onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                                />
                                <button
                                    onClick={handleRefine}
                                    disabled={!refineInput || isGenerating}
                                    className="mr-2 p-2 bg-white/10 rounded-lg hover:bg-primary hover:text-white transition-all disabled:opacity-0 disabled:scale-90"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Divider for Mobile */}
                        <div className="w-full h-px bg-white/10 md:hidden" />

                        {/* Approve Button */}
                        <button
                            onClick={handleApprove}
                            disabled={isGenerating}
                            className="w-full md:w-auto px-8 py-3.5 bg-green-600 hover:bg-green-500 rounded-xl font-display font-bold text-sm uppercase tracking-wide shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_30px_rgba(22,163,74,0.5)] transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:scale-100 disabled:shadow-none text-white"
                        >
                            <Check className="w-5 h-5" />
                            Confirm & Generate
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
