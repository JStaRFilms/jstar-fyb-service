"use client";

import { useState } from "react";
import { Wrench, HeartHandshake, ArrowRight, Loader2 } from "lucide-react";

interface ModeSelectionProps {
    projectId: string;
    onModeSelected: (mode: "DIY" | "CONCIERGE") => void;
}

export function ModeSelection({ projectId, onModeSelected }: ModeSelectionProps) {
    const [selectedMode, setSelectedMode] = useState<"DIY" | "CONCIERGE" | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSelect = async (mode: "DIY" | "CONCIERGE") => {
        setSelectedMode(mode);
        setIsSubmitting(true);

        try {
            // Update project mode in DB
            await fetch(`/api/projects/${projectId}/mode`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mode })
            });

            onModeSelected(mode);
        } catch (error) {
            console.error("Failed to set mode:", error);
            setIsSubmitting(false);
            setSelectedMode(null);
        }
    };

    return (
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-8 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[100px] rounded-full" />

            <div className="relative z-10">
                <div className="text-center mb-8">
                    <h3 className="text-2xl font-display font-bold text-white mb-2">
                        🎉 Project Unlocked!
                    </h3>
                    <p className="text-gray-400">
                        How would you like to proceed with your project?
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {/* DIY Option */}
                    <button
                        onClick={() => handleSelect("DIY")}
                        disabled={isSubmitting}
                        className={`group relative bg-black/40 border rounded-xl p-6 text-left transition-all hover:scale-[1.02] ${selectedMode === "DIY"
                                ? "border-primary ring-2 ring-primary/20"
                                : "border-white/10 hover:border-primary/50"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-primary/20 text-primary rounded-xl">
                                <Wrench className="w-6 h-6" />
                            </div>
                            {selectedMode === "DIY" && isSubmitting && (
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            )}
                        </div>
                        <h4 className="font-bold text-lg text-white mb-2 group-hover:text-primary transition-colors">
                            I'll Handle It
                        </h4>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Upload your own research papers and run the AI extraction yourself.
                        </p>
                        <div className="mt-4 text-xs text-primary font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            Self-Service <ArrowRight className="w-3 h-3" />
                        </div>
                    </button>

                    {/* Concierge Option */}
                    <button
                        onClick={() => handleSelect("CONCIERGE")}
                        disabled={isSubmitting}
                        className={`group relative bg-black/40 border rounded-xl p-6 text-left transition-all hover:scale-[1.02] ${selectedMode === "CONCIERGE"
                                ? "border-accent ring-2 ring-accent/20"
                                : "border-white/10 hover:border-accent/50"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-accent/20 text-accent rounded-xl">
                                <HeartHandshake className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-accent/10 text-accent px-2 py-1 rounded-full">
                                Recommended
                            </span>
                        </div>
                        <h4 className="font-bold text-lg text-white mb-2 group-hover:text-accent transition-colors">
                            Let J-Star Handle It
                        </h4>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Sit back while our team handles the research and writing for you.
                        </p>
                        <div className="mt-4 text-xs text-accent font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            Full Service <ArrowRight className="w-3 h-3" />
                        </div>
                    </button>
                </div>

                <p className="text-center text-xs text-gray-600">
                    Same price, your choice. You can always message us if you need help.
                </p>
            </div>
        </div>
    );
}
