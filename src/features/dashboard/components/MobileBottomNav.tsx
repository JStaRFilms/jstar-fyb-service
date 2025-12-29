import React from "react";
import Link from "next/link";
import { Folder, Home, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const MobileBottomNav = () => {
    return (
        <nav className="fixed bottom-0 w-full bg-dark/90 backdrop-blur-xl border-t border-white/10 z-50 md:hidden">
            <div className="flex justify-around items-center h-20 pb-2">
                <Link href="/" className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
                    <Home className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
                </Link>
                <Link href="/dashboard" className="flex flex-col items-center gap-1 text-primary">
                    <Folder className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Projects</span>
                </Link>
                <Link href="/profile" className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
                    <User className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Me</span>
                </Link>
            </div>
        </nav>
    );
};
