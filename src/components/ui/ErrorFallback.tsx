'use client';

import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getUserFriendlyMessage } from '@/lib/errors';

interface ErrorFallbackProps {
    error: Error | null;
    resetErrorBoundary?: () => void;
    className?: string;
}

export function ErrorFallback({ error, resetErrorBoundary, className }: ErrorFallbackProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const message = error ? getUserFriendlyMessage(error) : 'Something went wrong';

    return (
        <div className={cn("flex flex-col items-center justify-center p-8 text-center min-h-[200px] w-full", className)}>
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>

            <h3 className="text-lg font-display font-bold text-foreground mb-2">
                Something went wrong
            </h3>

            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                {message}
            </p>

            <div className="flex flex-col items-center gap-4">
                {resetErrorBoundary && (
                    <button
                        onClick={resetErrorBoundary}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-colors text-sm font-bold shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                )}

                {error && (
                    <div className="mt-4 w-full max-w-md">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mx-auto transition-colors"
                        >
                            {isExpanded ? 'Hide' : 'Show'} technical details
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        {isExpanded && (
                            <div className="mt-3 p-4 bg-muted/50 rounded-lg text-left overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <p className="font-mono text-xs text-red-500/80 break-all">
                                    {error.toString()}
                                </p>
                                {error.stack && (
                                    <pre className="mt-2 text-[10px] text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                                        {error.stack}
                                    </pre>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
