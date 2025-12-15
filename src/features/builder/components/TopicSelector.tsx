'use client';

import { useBuilderStore } from "@/features/builder/store/useBuilderStore";
import { useState } from "react";
import { Sparkles } from "lucide-react";

export function TopicSelector() {
    const { data, updateData, setStep } = useBuilderStore();
    const [topic, setTopic] = useState(data.topic);
    const [twist, setTwist] = useState(data.twist);

    const handleConfirm = () => {
        if (!topic.trim()) return;
        updateData({ topic, twist });
        setStep('ABSTRACT');
    };

    return (
        <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-display font-bold mb-2 text-white">Project Foundation</h2>
            <p className="text-gray-400 mb-8 text-sm">Define the core subject and the unique innovative angle.</p>

            <div className="space-y-6 mb-8">
                <div>
                    <label className="block text-xs font-mono uppercase text-accent mb-2">Project Topic</label>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-light"
                        placeholder="e.g. AI-Powered Fraud Detection"
                    />
                </div>

                <div>
                    <label className="block text-xs font-mono uppercase text-accent mb-2">The "Twist" (Unique Angle)</label>
                    <textarea
                        value={twist}
                        onChange={(e) => setTwist(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all h-32 resize-none font-light leading-relaxed"
                        placeholder="e.g. Using Blockchain for immutable audit trails and Zero-Knowledge Proofs for privacy..."
                    />
                </div>
            </div>

            <button
                onClick={handleConfirm}
                disabled={!topic.trim()}
                className="w-full py-4 bg-primary rounded-xl font-display font-bold uppercase tracking-wide shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-white flex items-center justify-center gap-2"
            >
                <Sparkles className="w-5 h-5" />
                Generate Abstract
            </button>
        </div>
    );
}
