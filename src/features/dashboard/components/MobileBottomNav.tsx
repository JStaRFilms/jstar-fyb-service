import React from "react";
import Link from "next/link";
import { Folder, Home, User, MessageSquare, Hammer } from "lucide-react";
import { cn } from "@/lib/utils";

export const MobileBottomNav = ({ hasActiveProject }: { hasActiveProject?: boolean }) => {
    return (
        <nav className="fixed bottom-0 w-full bg-dark/90 backdrop-blur-xl border-t border-white/10 z-50 md:hidden">
            <div className="grid grid-cols-5 items-end h-20 pb-4 px-2">
                {/* 1. Home */}
                <Link href="/" className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors pb-1">
                    <Home className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
                </Link>

                {/* 2. Projects */}
                <Link href="/dashboard" className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors pb-1">
                    <Folder className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Projects</span>
                </Link>

                {/* 3. FAB (Build) - Centered & Raised */}
                <div className="flex justify-center relative -top-6">
                    <Link
                        href="/project/builder"
                        className="flex items-center justify-center w-14 h-14 bg-primary rounded-full shadow-lg shadow-primary/40 text-white hover:scale-105 transition-transform ring-4 ring-dark"
                    >
                        <Hammer className="w-6 h-6 fill-current" />
                    </Link>
                </div>

                {/* 4. Chat (New) */}
                <Link href="/chat" className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors pb-1">
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Chat</span>
                </Link>

                {/* 5. Me */}
                <Link href="/profile" className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors pb-1">
                    <User className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Me</span>
                </Link>
            </div>
        </nav>
    );
};
