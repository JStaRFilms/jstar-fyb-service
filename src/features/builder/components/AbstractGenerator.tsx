'use client';

import { useBuilderStore } from "@/features/builder/store/useBuilderStore";
import { useState, useEffect, useRef } from "react";
import { Loader2, Sparkles, Send, Check, RefreshCw, Bot, Edit3, Eye, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCompletion } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import { SkeletonText } from "@/components/ui/Skeleton";
import { createProjectAction } from "@/features/builder/actions/createProject";

export function AbstractGenerator() {
    const { data, updateData, setStep } = useBuilderStore();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // AI Completion Hook
    const { completion, complete, isLoading, setCompletion } = useCompletion({
        api: '/api/generate/abstract',
        streamProtocol: 'text', // Required for toTextStreamResponse()
        initialCompletion: data.abstract,
        onFinish: (prompt, completion) => {
            updateData({ abstract: completion });
        }
    });

    // Local refinement input
    const [refineInput, setRefineInput] = useState("");
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [completion]);

    // Initial Auto-Start
    useEffect(() => {
        if (!data.abstract && !isLoading) {
            complete("", { body: { topic: data.topic, twist: data.twist } });
        }
    }, []);

    // Fetch stored abstract if we have a project ID and no abstract yet
    useEffect(() => {
        const fetchStoredAbstract = async () => {
            if (data.projectId && !data.abstract && !isLoading) {
                try {
                    const response = await fetch(`/api/projects/${data.projectId}/abstract`);
                    if (response.ok) {
                        const result = await response.json();
                        if (result.abstract) {
                            updateData({ abstract: result.abstract });
                            setCompletion(result.abstract);
                        }
                    }
                } catch (error) {
                    console.error('[AbstractGenerator] Failed to fetch stored abstract:', error);
                }
            }
        };
        fetchStoredAbstract();
    }, [data.projectId, data.abstract, isLoading]);

    const handleRefine = () => {
        if (!refineInput) return;
        complete("", { body: { topic: data.topic, twist: data.twist, instruction: refineInput } });
        setRefineInput("");
    };

    const handleApprove = async () => {
        setIsPreviewMode(true);

        // Save to DB
        const res = await createProjectAction({
            topic: data.topic,
            twist: data.twist,
            abstract: completion
        });

        if (res.success && res.projectId) {
            updateData({ abstract: completion, projectId: res.projectId });
            setStep('OUTLINE');
        } else {
            alert("Failed to create project. Please try again.");
            setIsPreviewMode(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header / Status */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-bold text-white mb-1">Project Context</h2>
                    <p className="text-sm text-gray-400">Review and refine the AI-generated abstract before structuring the chapters.</p>
                </div>
                {isLoading && (
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

                    <div className="flex items-center gap-2">
                        {/* Preview/Edit Toggle */}
                        {!isLoading && (
                            <button
                                onClick={() => setIsPreviewMode(!isPreviewMode)}
                                className={`text-xs transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${isPreviewMode ? 'bg-primary/20 text-primary' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                            >
                                {isPreviewMode ? <Pencil className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                {isPreviewMode ? 'Edit' : 'Preview'}
                            </button>
                        )}

                        <button
                            onClick={() => complete("", { body: { topic: data.topic, twist: data.twist } })}
                            className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5"
                            disabled={isLoading}
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                            Regenerate
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8 bg-gradient-to-b from-transparent to-black/20 min-h-[350px]">
                    {isLoading || isPreviewMode ? (
                        <div className="prose prose-invert prose-lg max-w-none font-serif leading-relaxed prose-headings:font-display prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white">
                            {completion ? (
                                <ReactMarkdown>{completion}</ReactMarkdown>
                            ) : (
                                <SkeletonText lines={6} />
                            )}
                        </div>
                    ) : (
                        <textarea
                            ref={textareaRef}
                            value={completion}
                            onChange={(e) => {
                                setCompletion(e.target.value);
                                updateData({ abstract: e.target.value });
                            }}
                            className="w-full min-h-[300px] bg-transparent border-none focus:ring-0 text-lg font-serif leading-relaxed text-gray-200 resize-none p-0 placeholder-gray-700 focus:outline-none selection:bg-primary/30"
                            placeholder="Waiting for AI generation..."
                        />
                    )}
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
                                    disabled={isLoading}
                                    placeholder="Give instructions to refine (e.g. 'Make it more academic')"
                                    className="w-full bg-transparent border-none px-4 py-3.5 text-sm text-white focus:ring-0 placeholder-gray-500 font-light"
                                    onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                                />
                                <button
                                    onClick={handleRefine}
                                    disabled={!refineInput || isLoading}
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
                            disabled={isLoading}
                            className="w-full md:w-auto px-8 py-3.5 bg-green-600 hover:bg-green-500 rounded-xl font-display font-bold text-sm uppercase tracking-wide shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_30px_rgba(22,163,74,0.5)] transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:scale-100 disabled:shadow-none text-white"
                        >
                            <Check className="w-5 h-5" />
                            Confirm & Generate
                        </button>
                    </div>
                </div>
            </motion.div >
        </div >
    );
}
