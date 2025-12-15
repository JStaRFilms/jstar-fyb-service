import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ComplexityMeterProps {
    score: 1 | 2 | 3 | 4 | 5; // 1 = Easy, 5 = Hard
}

export function ComplexityMeter({ score }: ComplexityMeterProps) {
    return (
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 w-fit">
            <span className="text-xs text-gray-400 font-mono uppercase">Complexity</span>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => {
                    const isActive = level <= score;
                    let colorClass = "bg-white/10";

                    if (isActive) {
                        if (level <= 2) colorClass = "bg-green-500";
                        else if (level <= 4) colorClass = "bg-yellow-500";
                        else colorClass = "bg-red-500";
                    }

                    return (
                        <motion.div
                            key={level}
                            initial={false}
                            animate={{
                                height: isActive ? 16 : 16,
                                backgroundColor: isActive
                                    ? (level <= 2 ? "#22c55e" : level <= 4 ? "#eab308" : "#ef4444")
                                    : "rgba(255,255,255,0.1)",
                                boxShadow: isActive ? `0 0 10px ${level <= 2 ? "#22c55e" : level <= 4 ? "#eab308" : "#ef4444"}` : "none"
                            }}
                            className={cn(
                                "w-2 rounded-sm transition-all duration-300",
                                isActive && "animate-pulse-glow" // Custom animation defined in globals.css
                            )}
                        />
                    );
                })}
            </div>
        </div>
    );
}
