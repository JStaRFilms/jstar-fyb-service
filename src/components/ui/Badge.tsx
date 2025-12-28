import { cn } from "@/lib/utils";

interface BadgeProps {
    children: React.ReactNode;
    className?: string;
}

export function Badge({ children, className }: BadgeProps) {
    return (
        <span className={cn("px-2 py-1 rounded text-xs font-bold", className)}>
            {children}
        </span>
    );
}
