import { cn } from "@/lib/utils";

interface ProgressProps {
    value: number;
    className?: string;
    max?: number;
}

export function Progress({ value, className, max = 100 }: ProgressProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
        <div className={cn("w-full bg-gray-200 rounded-full h-2", className)}>
            <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
}