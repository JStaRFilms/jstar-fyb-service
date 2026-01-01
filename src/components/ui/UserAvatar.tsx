'use client';

import { cn } from "@/lib/utils";

interface UserAvatarProps {
    name?: string | null;
    image?: string | null;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * Consistent user avatar component that shows user.image if available,
 * otherwise falls back to initials with gradient background.
 */
export function UserAvatar({ name, image, size = 'md', className }: UserAvatarProps) {
    // Generate initials
    const initials = name
        ? name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "U";

    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
    };

    if (image) {
        return (
            <img
                src={image}
                alt={name || 'User'}
                className={cn(
                    "rounded-full ring-2 ring-white/10 object-cover",
                    sizeClasses[size],
                    className
                )}
            />
        );
    }

    return (
        <div
            className={cn(
                "rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold ring-2 ring-white/10",
                sizeClasses[size],
                className
            )}
        >
            {initials}
        </div>
    );
}
