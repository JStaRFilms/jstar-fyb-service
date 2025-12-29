import React from "react";
import { MobileBottomNav } from "@/features/dashboard/components/MobileBottomNav";
import { getCurrentUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Generate initials for avatar
    const initials = user.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "JO";

    return (
        <div className="bg-dark min-h-screen text-white font-sans pb-24 md:pb-0">
            {/* Header */}
            <header className="flex justify-between items-center px-6 py-6 sticky top-0 bg-dark/80 backdrop-blur-md z-40 border-b border-white/5">
                <div>
                    <h1 className="text-xl font-bold font-display">My Projects</h1>
                    <p className="text-xs text-gray-400">Welcome back, {user.name?.split(" ")[0]}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent font-bold">
                    {initials}
                </div>
            </header>

            {/* Main Content */}
            <main className="px-6 py-6 space-y-8 max-w-lg mx-auto md:max-w-4xl">
                {children}
            </main>

            {/* Mobile Navigation */}
            <MobileBottomNav />
        </div>
    );
}
