'use client';

import { useBuilderStore } from "@/features/builder/store/useBuilderStore";
import { useState } from "react";
import { Lock, ShieldCheck, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function ChapterOutliner() {
    const { data, updateData, isPaid, unlockPaywall } = useBuilderStore();
    const [outline, setOutline] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Initial Trigger for generation simulation (auto-start or manual)
    const startGeneration = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setOutline([
                { title: "Introduction", content: "Background of study, problem statement, and objectives." },
                { title: "Literature Review", content: "Analysis of existing systems and theoretical framework." },
                { title: "Methodology", content: "System analysis, design, and implementation strategies." },
                { title: "System Implementation", content: "Result analysis, testing, and deployment details." },
                { title: "Conclusion", content: "Summary of findings, limitations, and future work." }
            ]);
            setIsGenerating(false);
        }, 1500);
    };

    if (outline.length === 0 && !isGenerating) {
        return (
            <div className="text-center py-20">
                <button
                    onClick={startGeneration}
                    className="px-8 py-4 bg-primary rounded-xl font-display font-bold text-lg hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(139,92,246,0.4)] animate-pulse"
                >
                    Generate Full Project Structure
                </button>
            </div>
        )
    }

    if (isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-primary">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <span className="font-mono tracking-widest uppercase animate-pulse">Crafting Project Structure...</span>
            </div>
        )
    }

    return (
        <div>
            {/* Success State Header */}
            <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-500 mb-4 border border-green-500/20">
                    <Check className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-display font-bold mb-2 text-white">Structure Generated</h1>
                <p className="text-gray-400">We've crafted a distinction-grade abstract and outline for your project.</p>
            </div>

            <div className="relative animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">

                {/* Visible Teaser (Glass Panel) */}
                <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-6 rounded-t-2xl border-b border-white/5">
                    <span className="text-xs font-mono text-accent uppercase tracking-wider mb-2 block">Project Title</span>
                    <h2 className="text-xl font-display font-bold leading-tight mb-6 text-white">{data.topic}</h2>

                    <div className="mt-6">
                        <span className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2 block">Abstract Preview</span>
                        <p className="text-gray-300 leading-relaxed text-sm font-light">
                            {data.abstract || "Abstract generation pending..."}
                            <span className="text-gray-600"> [truncated]</span>
                        </p>
                    </div>
                </div>

                {/* Blurred/Locked Content */}
                <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 border-t-0 p-6 rounded-b-2xl relative overflow-hidden">
                    <div className="space-y-8 filter blur-sm opacity-50 select-none pointer-events-none">
                        {outline.map((chapter, i) => (
                            <div key={i}>
                                <h3 className="font-bold text-lg mb-2 text-white font-display">Chapter {i + 1}: {chapter.title}</h3>
                                <p className="text-gray-400 text-sm">{chapter.content} Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                            </div>
                        ))}
                    </div>

                    {/* Paywall Overlay (FR-005) */}
                    {!isPaid && (
                        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/95 to-transparent flex flex-col items-center justify-end pb-10 z-10 px-6 text-center">
                            <Lock className="w-12 h-12 text-primary mb-4" />
                            <h3 className="text-2xl font-display font-bold mb-2 text-white">Unlock Full Project</h3>
                            <p className="text-gray-400 text-sm mb-6 max-w-sm">Get the complete 5-chapter source code, documentation, and implementation guide.</p>

                            <button
                                onClick={unlockPaywall}
                                className="w-full py-4 bg-primary rounded-xl font-display font-bold uppercase tracking-wide shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-[1.02] transition-transform text-white"
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
        </div>
    );
}
