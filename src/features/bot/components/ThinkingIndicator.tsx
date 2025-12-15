import { Bot } from "lucide-react";
import { motion } from "framer-motion";

export function ThinkingIndicator() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex gap-4 max-w-2xl"
        >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 shadow-lg shadow-primary/20">
                <Bot className="w-5 h-5 text-primary animate-pulse" />
            </div>

            <div className="space-y-2">
                <div className="px-5 py-4 bg-primary/5 border border-primary/20 rounded-tr-[1.5rem] rounded-bl-[1.5rem] rounded-br-[1.5rem] rounded-tl-[0.25rem] text-gray-200 backdrop-blur-md flex items-center gap-2">
                    <span className="text-sm">Analyzing academic trends</span>
                    <span className="flex gap-1">
                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1 h-1 bg-white rounded-full" />
                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1 h-1 bg-white rounded-full" />
                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1 h-1 bg-white rounded-full" />
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
