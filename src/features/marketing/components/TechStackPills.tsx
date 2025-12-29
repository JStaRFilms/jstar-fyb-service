import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface TechStackPillsProps {
    techStack: string[];
    className?: string;
}

export function TechStackPills({ techStack, className }: TechStackPillsProps) {
    return (
        <div className={cn("flex flex-wrap gap-2", className)}>
            {techStack.map((tech) => {
                const isAI = tech.toLowerCase().includes('gpt') || tech.toLowerCase().includes('openai') || tech.toLowerCase().includes('ai');

                return (
                    <span
                        key={tech}
                        className={cn(
                            "px-3 py-1.5 rounded-lg border text-sm transition-colors cursor-default",
                            isAI
                                ? "text-cyan-400 border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10"
                                : "border-white/10 bg-white/5 hover:bg-white/10 text-gray-300"
                        )}
                    >
                        {isAI && <Sparkles className="w-3 h-3 inline mr-1" />}
                        {tech}
                    </span>
                );
            })}
        </div>
    );
}
