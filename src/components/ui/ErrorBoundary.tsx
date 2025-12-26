"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("[ErrorBoundary] Uncaught error:", error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
                    <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                        <AlertTriangle className="w-7 h-7 text-red-500" />
                    </div>
                    <h3 className="text-lg font-display font-bold text-white mb-2">
                        Something went wrong
                    </h3>
                    <p className="text-sm text-gray-400 mb-6 max-w-sm">
                        {this.state.error?.message || "An unexpected error occurred. Please try again."}
                    </p>
                    <button
                        onClick={this.handleRetry}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary/20 border border-primary/40 rounded-xl text-primary hover:bg-primary/30 transition-colors text-sm font-bold"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
