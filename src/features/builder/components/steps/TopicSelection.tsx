'use client';

import { useState } from 'react';
import { Search, ArrowRight, Loader2 } from 'lucide-react';
import { useBuilderStore } from '../../store/useBuilderStore';
import { MockBuilderAi } from '../../services/mockBuilderAi';
import { motion } from 'framer-motion';

export function TopicSelection() {
    const { topicKeyword, setKeyword, selectTopic, nextStep } = useBuilderStore();
    const [topics, setTopics] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topicKeyword.trim()) return;

        setLoading(true);
        setTopics([]); // clear old

        try {
            const results = await MockBuilderAi.generateTopics(topicKeyword);
            setTopics(results);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (topic: string) => {
        selectTopic(topic);
        nextStep();
    };

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-display font-bold">What are you building?</h1>
                <p className="text-gray-400">Enter a keyword (e.g., "Crypto", "Hospital", "IoT") and we'll generate distinction-grade topics.</p>
            </div>

            <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
                <input
                    type="text"
                    value={topicKeyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="e.g. Artificial Intelligence..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-6 pr-14 py-5 text-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all font-light"
                />
                <button
                    type="submit"
                    disabled={loading || !topicKeyword.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-primary rounded-xl text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                </button>
            </form>

            {/* Results */}
            {topics.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid gap-4 mt-8"
                >
                    <h2 className="text-sm font-mono text-gray-500 uppercase tracking-widest text-center mb-2">Select a Topic</h2>
                    {topics.map((t, i) => (
                        <motion.button
                            key={i}
                            onClick={() => handleSelect(t)}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="text-left group flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/50 hover:bg-white/10 transition-all"
                        >
                            <span className="font-display font-medium text-lg pr-4 md:text-xl">{t}</span>
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-accent group-hover:text-dark transition-colors shrink-0">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </motion.button>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
