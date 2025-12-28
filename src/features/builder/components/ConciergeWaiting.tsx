import { MessageCircle, Clock, CheckCircle2 } from "lucide-react";
import { CustomerChat } from "./CustomerChat";

interface ConciergeWaitingProps {
    projectId: string;
    status: string;
}

const STATUS_STEPS = [
    { key: "RESEARCH_IN_PROGRESS", label: "Research in Progress", description: "Our team is finding the best sources for your project." },
    { key: "RESEARCH_COMPLETE", label: "Research Complete", description: "Sources gathered and analyzed." },
    { key: "WRITING_IN_PROGRESS", label: "Writing in Progress", description: "Chapters are being written." },
    { key: "PROJECT_COMPLETE", label: "Project Complete", description: "Your project is ready!" },
];

export function ConciergeWaiting({ projectId, status }: ConciergeWaitingProps) {
    const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === status);

    return (
        <>
            <div className="rounded-2xl border border-accent/20 bg-accent/5 p-8 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/10 blur-[100px] rounded-full" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-accent/20 rounded-lg text-accent">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-display font-bold text-white">We're On It</h3>
                            <p className="text-sm text-gray-400">The J-Star team is working on your project.</p>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="space-y-4 mb-8">
                        {STATUS_STEPS.map((step, i) => {
                            const isComplete = i < currentStepIndex;
                            const isCurrent = i === currentStepIndex;

                            return (
                                <div
                                    key={step.key}
                                    className={`flex items-start gap-4 p-4 rounded-xl transition-all ${isCurrent ? "bg-white/5 border border-accent/30" :
                                        isComplete ? "opacity-60" : "opacity-30"
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isComplete ? "bg-green-500/20 text-green-500" :
                                        isCurrent ? "bg-accent/20 text-accent animate-pulse" : "bg-white/5 text-gray-600"
                                        }`}>
                                        {isComplete ? (
                                            <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                            <span className="text-xs font-bold">{i + 1}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold ${isCurrent ? "text-white" : "text-gray-400"}`}>
                                            {step.label}
                                        </h4>
                                        <p className="text-xs text-gray-500">{step.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Inline hint */}
                    <p className="text-center text-xs text-gray-500">
                        💬 Use the chat button in the corner to message us
                    </p>
                </div>
            </div>

            {/* Floating Chat */}
            <CustomerChat projectId={projectId} />
        </>
    );
}
