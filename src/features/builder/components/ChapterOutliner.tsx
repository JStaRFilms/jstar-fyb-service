'use client';

import { useBuilderStore } from "@/features/builder/store/useBuilderStore";
import { useState, useEffect } from "react";
import { Lock, ShieldCheck, Check, Loader2 } from "lucide-react";

export function ChapterOutliner() {
    const { data, isPaid, unlockPaywall } = useBuilderStore();
    const [outline, setOutline] = useState<any[]>(data.outline || []);
    const [isGenerating, setIsGenerating] = useState(outline.length === 0);

    useEffect(() => {
        if (outline.length === 0) {
            setTimeout(() => {
                setOutline([
                    { title: "Introduction", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
                    { title: "1.1 Background of Study", content: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit." },
                    { title: "1.2 Problem Statement", content: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit." },
                ]);
                setIsGenerating(false);
            }, 1500);
        }
    }, []);

    // Truncate abstract for preview (matches mockup: short teaser ending with ...)
    const abstractPreview = data.abstract
        ? data.abstract.slice(0, 180) + '...'
        : "In an era of rampant misinformation, the integrity of digital media is paramount. This project proposes a decentralized approach to verifying news authenticity utilizing the immutability of blockchain technology...";

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
                    <h2 className="text-xl font-bold leading-tight">{data.topic || "Blockchain-Based Fake News Detection System using SHA-256 Hashing Algorithm"}</h2>

                    <div className="mt-6">
                        <span className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2 block">Abstract Preview</span>
                        <p className="text-gray-300 leading-relaxed text-sm">
                            {abstractPreview}
                        </p>
                    </div>
                </div>

                {/* Blurred/Locked Content - glass-panel */}
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-6 rounded-b-2xl border-t-0 relative overflow-hidden">
                    {/* blur-content */}
                    <div className="blur-[8px] select-none pointer-events-none opacity-50 space-y-6">
                        {outline.map((chapter, i) => (
                            <div key={i}>
                                <h3 className="font-bold text-lg mb-2">{i === 0 ? `Chapter 1: ${chapter.title}` : chapter.title}</h3>
                                <p className="text-gray-400 text-sm">{chapter.content}</p>
                                {i === 1 && <p className="text-gray-400 text-sm mt-2">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>}
                            </div>
                        ))}
                    </div>

                    {/* Paywall Overlay */}
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
