'use client';

import { Rocket, RefreshCw, ThumbsUp, ArrowDown, ArrowUp } from 'lucide-react';
import type { ConfirmedTopic } from '@/features/bot/hooks/useChatFlow';

interface SuggestionChipsProps {
    confirmedTopic: ConfirmedTopic | null;
    onAction: (action: 'accept' | 'simplify' | 'harder') => void;
    onProceed: () => void;
    isLoading: boolean;
}

export function SuggestionChips({
    confirmedTopic,
    onAction,
    onProceed,
    isLoading
}: SuggestionChipsProps) {
    if (isLoading) return null;

    // Topic confirmed → Show prominent "Proceed to Builder" button
    if (confirmedTopic) {
        return (
            <div className="flex flex-wrap gap-2 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <button
                    onClick={onProceed}
                    className="flex items-center gap-2 px-5 py-3 rounded-full bg-primary hover:bg-primary/90 text-white font-display font-bold uppercase tracking-wide shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] hover:scale-105 transition-all"
                >
                    <Rocket className="w-4 h-4" />
                    Proceed to Builder
                </button>
                <button
                    onClick={() => onAction('simplify')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/10 hover:bg-accent/20 hover:border-accent text-gray-300 text-xs font-mono uppercase tracking-wide transition-all"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Change Topic
                </button>
            </div>
        );
    }

    // Normal state → Show negotiation chips
    return (
        <div className="flex flex-wrap gap-2 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button
                onClick={() => onAction('accept')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/10 hover:bg-primary/20 hover:border-primary text-gray-300 text-xs font-mono uppercase tracking-wide transition-all"
            >
                <ThumbsUp className="w-3.5 h-3.5" />
                Accept Topic
            </button>
            <button
                onClick={() => onAction('simplify')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/10 hover:bg-accent/20 hover:border-accent text-gray-300 text-xs font-mono uppercase tracking-wide transition-all"
            >
                <ArrowDown className="w-3.5 h-3.5" />
                Make it Simpler
            </button>
            <button
                onClick={() => onAction('harder')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/10 hover:bg-red-500/20 hover:border-red-500 text-gray-300 text-xs font-mono uppercase tracking-wide transition-all"
            >
                <ArrowUp className="w-3.5 h-3.5" />
                Too Boring
            </button>
        </div>
    );
}
