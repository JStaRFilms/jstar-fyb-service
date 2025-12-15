'use client';

import Link from 'next/link';
import { useBuilderStore } from '../store/useBuilderStore';
import { X } from 'lucide-react';

interface Props {
    children: React.ReactNode;
}

export function WizardLayout({ children }: Props) {
    const { currentStep } = useBuilderStore();

    return (
        <div className="min-h-screen bg-dark text-white font-sans pb-32">
            {/* Progress Header */}
            <header className="sticky top-0 z-50 bg-dark/90 backdrop-blur-md border-b border-white/5 pb-4 pt-6">
                <div className="container mx-auto px-6 max-w-3xl">
                    <div className="flex items-center justify-between mb-4">
                        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </Link>
                        <span className="font-display font-bold uppercase tracking-widest text-sm">Project Builder</span>
                        <span className="w-6"></span> {/* Spacer */}
                    </div>

                    {/* Steps */}
                    <div className="flex items-center gap-2">
                        <StepIndicator step={1} current={currentStep} />
                        <StepIndicator step={2} current={currentStep} />
                        <StepIndicator step={3} current={currentStep} />
                    </div>

                    <div className="flex justify-between mt-2 text-xs font-mono text-gray-500 uppercase">
                        <span className={currentStep >= 1 ? "text-white" : ""}>Topic</span>
                        <span className={currentStep >= 2 ? "text-white" : ""}>Context</span>
                        <span className={currentStep >= 3 ? "text-primary font-bold" : ""}>Generate</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8 md:max-w-3xl">
                {children}
            </main>
        </div>
    );
}

function StepIndicator({ step, current }: { step: number; current: number }) {
    const isActive = current === step;
    const isCompleted = current > step;

    if (isCompleted) {
        return <div className="h-1 flex-1 bg-green-500 rounded-full transition-all duration-500" />;
    }

    if (isActive) {
        return (
            <div className="h-1 flex-1 bg-primary rounded-full relative overflow-hidden">
                <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]" />
            </div>
        );
    }

    return <div className="h-1 flex-1 bg-white/10 rounded-full" />;
}
