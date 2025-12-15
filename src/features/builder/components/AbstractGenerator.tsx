'use client';

import { useBuilderStore } from "@/features/builder/store/useBuilderStore";
import { useState } from "react";
// import { useObject } from "@ai-sdk/react"; // Assuming we will use this later
// For now, mock the generation to ensure flow works before hooking up the API route
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function AbstractGenerator() {
    const { data, updateData, setStep } = useBuilderStore();
    const [abstract, setAbstract] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const startGeneration = async () => {
        setIsGenerating(true);
        // Mock streaming effect
        const mockAbstract = `This project, titled "${data.topic}", aims to revolutionize the industry by incorporating ${data.twist || "advanced AI techniques"}. The proposed system leverages a microservices architecture to ensure scalability and robustness...`;

        let i = 0;
        const interval = setInterval(() => {
            setAbstract(mockAbstract.slice(0, i));
            i++;
            if (i > mockAbstract.length) {
                clearInterval(interval);
                setIsGenerating(false);
                updateData({ abstract: mockAbstract });
            }
        }, 10);
    };

    return (
        <div className="p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4 font-display">Generating Abstract</h2>

            {/* Generation Area */}
            <div className="min-h-[200px] p-6 bg-black/30 rounded-xl border border-white/5 mb-6 font-serif leading-relaxed text-gray-300">
                {abstract ? abstract : <span className="text-gray-600 italic">Click generate to start the AI writer...</span>}
            </div>

            <div className="flex gap-4">
                <button
                    onClick={startGeneration}
                    disabled={isGenerating || abstract.length > 0}
                    className="flex-1 py-4 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all disabled:opacity-50"
                >
                    {isGenerating ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin w-4 h-4" /> Writing...</span> : "Generate Draft"}
                </button>

                {abstract.length > 0 && !isGenerating && (
                    <motion.button
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => setStep('OUTLINE')}
                        className="flex-1 py-4 bg-primary rounded-xl font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                    >
                        Approve & Next
                    </motion.button>
                )}
            </div>
        </div>
    );
}
