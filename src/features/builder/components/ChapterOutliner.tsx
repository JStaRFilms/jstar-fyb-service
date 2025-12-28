'use client';

import { useBuilderStore } from "@/features/builder/store/useBuilderStore";
import { useEffect, useRef } from "react";
import { Lock, ShieldCheck, Check, Loader2, RefreshCw } from "lucide-react";
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { outlineSchema } from '../schemas/outlineSchema';
import ReactMarkdown from 'react-markdown';
import { SkeletonChapter } from "@/components/ui/Skeleton";
import { DocumentUpload } from "./DocumentUpload";
import { PricingOverlay } from "@/features/builder/components/PricingOverlay";
import { ProjectActionCenter } from "./ProjectActionCenter";
import { ModeSelection } from "./ModeSelection";
import { ConciergeWaiting } from "./ConciergeWaiting";

// Static placeholder chapters shown before payment (no API calls wasted)
const PLACEHOLDER_CHAPTERS = [
    { title: "Introduction", content: "Background of study, problem statement, research objectives, and scope of the project." },
    { title: "Literature Review", content: "Analysis of existing systems, theoretical framework, and critical evaluation of related work." },
    { title: "Methodology", content: "System analysis, design methodology, data flow diagrams, and implementation plan." },
];

export function ChapterOutliner() {
    const { data, isPaid, unlockPaywall, updateData, setMode } = useBuilderStore();
    const hasSubmittedRef = useRef(false);

    // Handle unlock - persist to DB then update store
    const handleUnlock = async () => {
        if (!data.projectId) {
            console.error('[ChapterOutliner] No projectId for unlock');
            return;
        }

        try {
            await fetch(`/api/projects/${data.projectId}/unlock`, { method: 'POST' });
            unlockPaywall();
        } catch (error) {
            console.error('[ChapterOutliner] Failed to unlock:', error);
        }
    };

    const { object, submit, isLoading, error } = useObject({
        api: '/api/generate/outline',
        schema: outlineSchema,
        onFinish: ({ object }) => {
            if (object?.chapters) {
                updateData({ outline: object.chapters });
            }
        },
        onError: (err) => {
            console.error('[ChapterOutliner] Generation error:', err);
        }
    });

    // Use streamed chapters immediately
    const streamedChapters = object?.chapters || [];
    // If we have streamed chapters, use them. Else if we have stored outline, use that.
    const displayChapters = streamedChapters.length > 0 ? streamedChapters : (data.outline || []);
    const displayTitle = object?.title || data.topic || "Project Title";

    // Trigger generation automatically if we have topic/abstract but no outline yet
    useEffect(() => {
        if (data.abstract && data.topic && !hasSubmittedRef.current && !data.outline?.length && !isLoading) {
            hasSubmittedRef.current = true;
            console.log('[ChapterOutliner] Generating free outline...');
            submit({ topic: data.topic, abstract: data.abstract });
        }
    }, [data.abstract, data.topic, data.outline?.length, submit, isLoading]);
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

                    {/* Show streamed content immediately */}
                    <div className="space-y-6">
                        {displayChapters.length > 0 ? (
                            displayChapters.map((chapter, i) => (
                                <div
                                    key={i}
                                    className={`animate-wipe-reveal animate-wipe-delay-${i + 1}`}
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
                        ) : (
                            <div className="text-gray-500 text-center py-10">
                                Waiting for content...
                            </div>
                        )}
                    </div>
                </div>

                {/* Pricing Overlay - Show if not paid */}
                {!isPaid ? (
                    <div className="mt-8">
                        <PricingOverlay onUnlock={handleUnlock} />
                    </div>
                ) : data.mode === null ? (
                    // Mode not selected yet - show selection
                    <div className="mt-16">
                        <ModeSelection
                            projectId={data.projectId!}
                            onModeSelected={(mode) => setMode(mode)}
                        />
                    </div>
                ) : data.mode === "CONCIERGE" ? (
                    // Concierge mode - show waiting view
                    <div className="mt-16">
                        <ConciergeWaiting projectId={data.projectId!} status={data.status} />
                    </div>
                ) : (
                    // DIY mode - show action center + document upload
                    <>
                        <div className="mt-16">
                            <ProjectActionCenter />
                        </div>
                        {data.projectId && (
                            <div className="mt-16">
                                <DocumentUpload projectId={data.projectId} />
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
