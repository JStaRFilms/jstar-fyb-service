'use client';

import { useBuilderStore } from "@/features/builder/store/useBuilderStore";
import { useEffect, useRef } from "react";
import { Lock, ShieldCheck, Check, Loader2, RefreshCw } from "lucide-react";
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { outlineSchema } from '../schemas/outlineSchema';
import ReactMarkdown from 'react-markdown';
import { SkeletonChapter } from "@/components/ui/Skeleton";

// Static placeholder chapters shown before payment (no API calls wasted)
const PLACEHOLDER_CHAPTERS = [
    { title: "Introduction", content: "Background of study, problem statement, research objectives, and scope of the project." },
    { title: "Literature Review", content: "Analysis of existing systems, theoretical framework, and critical evaluation of related work." },
    { title: "Methodology", content: "System analysis, design methodology, data flow diagrams, and implementation plan." },
];

export function ChapterOutliner() {
    const { data, isPaid, unlockPaywall, updateData } = useBuilderStore();
    const hasSubmittedRef = useRef(false);

    const { object, submit, isLoading, error } = useObject({
        api: '/api/generate/outline',
        schema: outlineSchema,
        onFinish: ({ object }) => {
            if (object?.chapters) {
                updateData({ outline: object.chapters });
                console.log('[ChapterOutliner] Outline saved to store:', object.chapters);
            }
        },
        onError: (err) => {
            console.error('[ChapterOutliner] Generation error:', err);
        }
    });

    // ONLY trigger generation AFTER payment (save API calls!)
    useEffect(() => {
        if (isPaid && data.abstract && data.topic && !hasSubmittedRef.current && !data.outline?.length) {
            hasSubmittedRef.current = true;
            console.log('[ChapterOutliner] Payment confirmed, generating real outline...');
            submit({ topic: data.topic, abstract: data.abstract });
        }
    }, [isPaid, data.abstract, data.topic, data.outline?.length, submit]);

    // Use streamed chapters after payment, otherwise placeholders
    // Show placeholders until real content starts streaming in
    const streamedChapters = object?.chapters || [];
    const displayChapters = isPaid
        ? (streamedChapters.length > 0 ? streamedChapters : data.outline || [])
        : PLACEHOLDER_CHAPTERS;
    const displayTitle = object?.title || data.topic || "Project Title";

    // Truncate abstract for preview
    const abstractPreview = data.abstract
        ? data.abstract.slice(0, 180) + '...'
        : "Loading abstract...";

    const handleRetry = () => {
        hasSubmittedRef.current = false;
        submit({ topic: data.topic, abstract: data.abstract });
    };

    // Check if we're actively streaming content after payment
    const isStreaming = isPaid && isLoading;

    // Error state (only after payment)
    if (isPaid && error && (!object?.chapters || object.chapters.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <div className="text-red-500 mb-4 text-center">
                    <p className="font-bold">Generation Failed</p>
                    <p className="text-sm text-gray-400 mt-1">Something went wrong. Please try again.</p>
                </div>
                <button
                    onClick={handleRetry}
                    className="flex items-center gap-2 px-6 py-3 bg-primary/20 border border-primary/40 rounded-xl text-primary hover:bg-primary/30 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Retry Generation
                </button>
            </div>
        );
    }

    return (
        <>
            {/* Success State Header */}
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-500 mb-4 border border-green-500/20">
                    {isPaid && isLoading ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                        <Check className="w-8 h-8" />
                    )}
                </div>
                <h1 className="text-3xl font-display font-bold mb-2">
                    {isPaid && isLoading ? 'Generating Your Project...' : 'Structure Generated'}
                </h1>
                <p className="text-gray-400">
                    {isPaid && isLoading
                        ? 'AI is crafting your distinction-grade outline...'
                        : "We've crafted a distinction-grade abstract and outline for your project."}
                </p>
            </div>

            {/* The Content */}
            <div className="relative">

                {/* Visible Teaser - glass-panel */}
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-6 rounded-t-2xl border-b border-white/5">
                    <span className="text-xs font-mono text-accent uppercase tracking-wider mb-2 block">Project Title</span>
                    <h2 className="text-xl font-bold leading-tight">{displayTitle}</h2>

                    <div className="mt-6">
                        <span className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2 block">Abstract Preview</span>
                        <div className="text-gray-300 leading-relaxed text-sm prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown>{abstractPreview}</ReactMarkdown>
                        </div>
                    </div>
                </div>

                {/* Content Panel - glass-panel */}
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-6 rounded-b-2xl border-t-0 relative overflow-hidden min-h-[280px]">

                    {/* Show static placeholders when locked, streaming content after payment */}
                    <div className={`space-y-6 ${!isPaid ? 'blur-[8px] select-none pointer-events-none opacity-50' : ''}`}>
                        {displayChapters.length > 0 ? (
                            displayChapters.map((chapter, i) => (
                                <div
                                    key={i}
                                    className={`animate-wipe-reveal animate-wipe-delay-${i + 1}`}
                                    style={{ opacity: 0 }} // Start hidden, animation reveals
                                >
                                    <h3 className="font-bold text-lg mb-2">
                                        Chapter {i + 1}: {chapter?.title || 'Loading...'}
                                    </h3>
                                    <p className="text-gray-400 text-sm">
                                        {chapter?.content || 'Generating content...'}
                                    </p>
                                </div>
                            ))
                        ) : isStreaming ? (
                            // Skeleton while waiting for first chapter
                            [...Array(3)].map((_, i) => (
                                <SkeletonChapter key={i} />
                            ))
                        ) : null}
                    </div>

                    {/* Paywall Overlay - positioned near top */}
                    {!isPaid && (
                        <div className="absolute inset-0 bg-gradient-to-b from-dark/90 via-dark/70 to-dark/50 flex flex-col items-center justify-start pt-8 z-10 px-6 text-center">
                            <Lock className="w-12 h-12 text-primary mb-4" />
                            <h3 className="text-2xl font-display font-bold mb-2">Unlock Full Project</h3>
                            <p className="text-gray-400 text-sm mb-6 max-w-sm">Get the complete 5-chapter source code, documentation, and implementation guide.</p>

                            <button
                                onClick={unlockPaywall}
                                className="w-full max-w-xs py-4 bg-primary rounded-xl font-display font-bold uppercase tracking-wide shadow-[0_0_30px_rgba(139,92,246,0.4)] animate-pulse hover:scale-105 transition-transform"
                            >
                                Pay ₦15,000 to Unlock
                            </button>
                            <p className="mt-4 text-xs text-gray-500 flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3" /> Secured by Paystack
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </>
    );
}
