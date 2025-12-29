import React from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineStepProps {
    label: string;
    subLabel?: string;
    status: "completed" | "current" | "pending";
    stepNumber?: number;
}

const TimelineStep = ({ label, subLabel, status, stepNumber }: TimelineStepProps) => {
    return (
        <div className="flex items-center gap-4">
            <div
                className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-all",
                    status === "completed" && "bg-green-500/20 text-green-500 border-transparent",
                    status === "current" && "bg-primary/20 text-primary border-primary/50 animate-pulse",
                    status === "pending" && "bg-white/5 text-gray-500 border-white/10"
                )}
            >
                {status === "completed" ? (
                    <Check className="w-4 h-4" />
                ) : (
                    <span className="text-xs font-bold">{stepNumber}</span>
                )}
            </div>
            <div className="flex-1">
                <p className={cn("text-sm font-bold", status === "pending" && "text-gray-500")}>{label}</p>
                {subLabel && <p className="text-xs text-accent">{subLabel}</p>}
            </div>
        </div>
    );
};

export const StatusTimeline = ({ status, progress }: { status: string; progress: number }) => {
    // Map project status to timeline steps
    const steps = [
        { label: "Topic Approved", status: "completed" },
        { label: "Payment Verified", status: "completed" },
        {
            label: "Generating...",
            subLabel: "Estimated time: 2 mins",
            status: status === "GENERATING" ? "current" : (progress > 0 ? "completed" : "pending"),
            stepNumber: 3
        }
    ];

    return (
        <div className="space-y-4 mb-8">
            <TimelineStep label="Topic Approved" subLabel="Dec 14, 2025" status="completed" />
            <TimelineStep label="Payment Verified" subLabel="₦15,000 paid" status="completed" />
            <TimelineStep
                label="Generating Chapter 1..."
                subLabel={status === "GENERATING" ? "Estimated time: 2 mins" : undefined}
                status={status === "GENERATING" ? "current" : "pending"}
                stepNumber={3}
            />
        </div>
    );
};
