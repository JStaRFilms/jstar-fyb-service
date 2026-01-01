'use client';

import { signOut } from "@/lib/auth-client";
import { LogOut } from "lucide-react";
import { useState } from "react";

export function ProfileClient() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSignOut = async () => {
        setIsLoading(true);
        try {
            await signOut({
                fetchOptions: {
                    onSuccess: () => {
                        window.location.href = "/auth/login";
                    },
                },
            });
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 font-bold transition-all disabled:opacity-50"
        >
            <LogOut className="w-5 h-5" />
            {isLoading ? "Signing out..." : "Sign Out"}
        </button>
    );
}
