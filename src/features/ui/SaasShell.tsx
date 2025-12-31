'use client';

import React from "react";
import { MobileBottomNav } from "@/features/dashboard/components/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Plus, Hammer } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SaasShellProps {
    children: React.ReactNode;
    user: {
        name?: string | null;
        image?: string | null;
    };
    headerContent?: React.ReactNode;
    fullWidth?: boolean;
    hasActiveProject?: boolean;
}

export const SaasShell = ({ children, user, headerContent, fullWidth = false, hasActiveProject = false }: SaasShellProps) => {
    // Generate initials for avatar
    const initials = user.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "JO";

    const pathname = usePathname();
    const isDashboard = pathname === "/dashboard";

    return (
        <div className="bg-dark min-h-screen text-white font-sans pb-24 md:pb-0">
            {/* Header */}
            <header className="flex justify-between items-center px-6 py-6 sticky top-0 bg-dark/80 backdrop-blur-md z-40 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold font-display">
                            {headerContent ? (
                                <span className="font-normal text-gray-400">My Projects / </span>
                            ) : "My Projects"}
                        </h1>
                        {!headerContent && (
                            <p className="text-xs text-gray-400">Welcome back, {user.name?.split(" ")[0]}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Desktop Project Button - Only show on Dashboard */}
                    {isDashboard && (
                        <Button
                            asChild
                            variant="default"
                            size="sm"
                            className="hidden md:flex bg-primary hover:bg-primary/90 text-white font-bold"
                        >
                            <Link href="/project/builder">
                                {hasActiveProject ? (
                                    <>
                                        <Hammer className="w-4 h-4 mr-2" />
                                        Continue Project
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        New Project
                                    </>
                                )}
                            </Link>
                        </Button>
                    )}

                    {/* Custom Header Content (e.g. Builder Progress) */}
                    {headerContent}

                    <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent font-bold">
                        {initials}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className={cn(
                "px-6 py-6 space-y-8 mx-auto",
                fullWidth ? "w-full" : "max-w-lg md:max-w-4xl"
            )}>
                {children}
            </main>

            {/* Mobile Navigation */}
            <MobileBottomNav hasActiveProject={hasActiveProject} />
        </div>
    );
};
