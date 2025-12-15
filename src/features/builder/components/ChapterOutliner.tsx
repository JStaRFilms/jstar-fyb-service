'use client';

import { useBuilderStore } from "@/features/builder/store/useBuilderStore";
import { useState, useEffect } from "react";
import { Lock, ShieldCheck, Check, Loader2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';

// Placeholder chapters for display when outline is still loading or empty
const PLACEHOLDER_CHAPTERS = [
    { title: "Introduction", content: "Background of study, problem statement, research objectives, and scope..." },
    { title: "Literature Review", content: "Analysis of existing systems, theoretical framework, and methodology analysis..." },
    { title: "System Methodology", content: "System analysis, design methodology, and implementation strategies..." },
];

export function ChapterOutliner() {
    const { data, isPaid, unlockPaywall, updateData } = useBuilderStore();
    const [isGenerating, setIsGenerating] = useState(true);
    const [outline, setOutline] = useState<{ title: string; content: string }[]>(data.outline || []);

    useEffect(() => {
        // Simulate outline generation (will be replaced with real AI later)
        if (data.abstract && outline.length === 0) {
            const timer = setTimeout(() => {
                const generatedOutline = [
                    { title: "Introduction", content: "Background of study, problem statement, research objectives, and scope of the project." },
                    { title: "Literature Review", content: "Analysis of existing systems, theoretical framework, and critical evaluation of related work." },
                    { title: "System Methodology", content: "System analysis, design methodology, data flow diagrams, and implementation plan." },
                    { title: "Implementation & Results", content: "System development, testing procedures, results analysis, and performance evaluation." },
                    { title: "Conclusion & Recommendations", content: "Summary of findings, limitations, future work, and recommendations for improvement." },
                ];
                setOutline(generatedOutline);
                updateData({ outline: generatedOutline });
                setIsGenerating(false);
            }, 2000);
            return () => clearTimeout(timer);
        } else if (outline.length > 0) {
            setIsGenerating(false);
        }
    }, [data.abstract]);

    // Truncate abstract for preview
    const abstractPreview = data.abstract
        ? data.abstract.slice(0, 180) + '...'
        : "Loading abstract...";

    // Use real outline or placeholders for display
    const displayOutline = outline.length > 0 ? outline : PLACEHOLDER_CHAPTERS;
    const displayTitle = data.topic || "Project Title";

    if (isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <span className="mt-4 font-display font-bold text-sm tracking-widest uppercase text-white animate-pulse">Generating Structure...</span>
            </div>
        );
    }

    return (
        <>
            {/* Success State */}
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-500 mb-4 border border-green-500/20">
                    <Check className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-display font-bold mb-2">Structure Generated</h1>
                <p className="text-gray-400">We've crafted a distinction-grade abstract and outline for your project.</p>
            </div>

            {/* The Content (Locked State) */}
            <div className="relative">

                {/* Visible Teaser - glass-panel */}
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-6 rounded-t-2xl border-b border-white/5">
                    <span className="text-xs font-mono text-accent uppercase tracking-wider mb-2 block">Project Title</span>
                    <h2 className="text-xl font-bold leading-tight">{displayTitle}</h2>

                    <div className="mt-6">
                        <span className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2 block">Abstract Preview</span>
                        <p className="text-gray-300 leading-relaxed text-sm">
                            {abstractPreview}
                        </p>
                    </div>
                </div>

                {/* Blurred/Locked Content - glass-panel */}
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-6 rounded-b-2xl border-t-0 relative overflow-hidden">
                    {/* blur-content - Always show chapters (real or placeholder) */}
                    <div className="blur-[8px] select-none pointer-events-none opacity-50 space-y-6">
                        {displayOutline.map((chapter, i) => (
                            <div key={i}>
                                <h3 className="font-bold text-lg mb-2">Chapter {i + 1}: {chapter.title}</h3>
                                <p className="text-gray-400 text-sm">{chapter.content}</p>
                            </div>
                        ))}
                    </div>

                    {/* Paywall Overlay - Always visible when not paid */}
                    {!isPaid && (
                        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/80 to-transparent flex flex-col items-center justify-end pb-10 z-10 px-6 text-center">
                            <Lock className="w-12 h-12 text-primary mb-4" />
                            <h3 className="text-2xl font-display font-bold mb-2">Unlock Full Project</h3>
                            <p className="text-gray-400 text-sm mb-6 max-w-sm">Get the complete 5-chapter source code, documentation, and implementation guide.</p>

                            <button
                                onClick={unlockPaywall}
                                className="w-full py-4 bg-primary rounded-xl font-display font-bold uppercase tracking-wide shadow-[0_0_30px_rgba(139,92,246,0.4)] animate-pulse hover:scale-105 transition-transform"
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
