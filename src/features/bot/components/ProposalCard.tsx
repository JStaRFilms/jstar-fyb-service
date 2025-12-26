import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Topic {
    title: string;
    twist: string;
    difficulty: "Medium" | "Hard" | "Insane";
}

interface ProposalCardProps {
    topics: Topic[];
    onAccept: (topic: Topic) => void;
}

export function ProposalCard({ topics, onAccept }: ProposalCardProps) {
    if (!topics || topics.length === 0) return null;

    // For now, let's assume single topic logic or show all 3?
    // The previous flow showed one "Twist".
    // The new tool returns 3. Let's show a carousel or list.
    // User asked for "Suggestions pop up properly".

    return (
        <div className="flex flex-col gap-4 w-full max-w-xl">
            <div className="text-sm text-gray-400 mb-2">I've analyzed your request. Here are 3 twisted angles:</div>
            {topics.map((topic, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors cursor-pointer group"
                    onClick={() => onAccept(topic)}
                >
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{topic.twist}</h3>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-black/20 border border-white/5 
                            ${topic.difficulty === 'Insane' ? 'text-red-400 border-red-900/30' :
                                topic.difficulty === 'Hard' ? 'text-yellow-400 border-yellow-900/30' : 'text-green-400 border-green-900/30'}`}>
                            {topic.difficulty}
                        </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">Based on: <span className="text-gray-500 italic">{topic.title}</span></p>

                    <button className="text-xs flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <Check className="w-3 h-3" /> Select this topic
                    </button>
                </motion.div>
            ))}
        </div>
    );
}
