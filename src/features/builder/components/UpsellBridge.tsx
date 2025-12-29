'use client';
import { motion } from 'framer-motion';
import { Crown, ArrowRight, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface UpsellBridgeProps {
    className?: string;
}

export function UpsellBridge({ className }: UpsellBridgeProps) {
    // Pricing logic
    const FULL_AGENCY_PRICE = 120000;
    const ALREADY_PAID = 15000; // DIY access
    const DISCOUNT_PRICE = FULL_AGENCY_PRICE - ALREADY_PAID;

    // WhatsApp pre-filled message
    const whatsappMessage = encodeURIComponent(
        `Hi J-Star! I bought the DIY plan but honestly I'm stuck/busy. I'd like to upgrade to the Agency "Code & Go" package for ₦${DISCOUNT_PRICE.toLocaleString()}.`
    );

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Gradient Border */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-transparent rounded-2xl border border-white/10" />

            <div className="relative glass-panel rounded-2xl p-5 sm:p-8 md:p-10 border-0">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Crown className="w-32 h-32 rotate-12" />
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 relative z-10">
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-bold uppercase tracking-wider rounded-full mb-4 border border-yellow-500/20">
                            <Crown className="w-3 h-3" />
                            Stuck? We got you.
                        </div>

                        <h3 className="text-2xl md:text-3xl font-display font-bold mb-3">
                            Upgrade to <span className="text-gradient">Done-For-You</span>
                        </h3>

                        <p className="text-gray-400 mb-5 text-sm sm:text-base">
                            Running out of time? Let our senior engineers build your entire project (Source Code + Documentation).
                            We'll deduct the <span className="text-white font-bold">₦{ALREADY_PAID.toLocaleString()}</span> you already paid.
                        </p>

                        <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                            <div className="text-left">
                                <p className="text-xs text-gray-500 line-through">
                                    ₦{FULL_AGENCY_PRICE.toLocaleString()}
                                </p>
                                <p className="text-2xl font-bold text-white">
                                    ₦{DISCOUNT_PRICE.toLocaleString()}
                                </p>
                            </div>

                            <div className="w-px h-10 bg-white/10 hidden md:block" />

                            <Link
                                href={`https://wa.me/2348123456789?text=${whatsappMessage}`}
                                target="_blank"
                                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Claim Discount
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                    </div>

                    {/* Visual: Progress Bar Stalled -> Completed */}
                    <div className="bg-black/40 rounded-2xl p-6 sm:p-8 md:w-[420px] border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                        {/* Ambient Glow behind card */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-50" />

                        <div className="relative space-y-6">
                            {/* DIY Section */}
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-gray-400 text-xs uppercase tracking-wider font-medium">DIY Timeline</span>
                                    <span className="text-yellow-500/80 text-xs font-mono">Stalled...</span>
                                </div>
                                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div className="h-full w-[35%] bg-yellow-500/30 rounded-full" />
                                </div>
                            </div>

                            {/* Agency Section (The Hero) */}
                            <div className="relative">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-white font-bold text-lg font-display bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Agency Speed</span>
                                    <span className="text-green-400 font-bold text-sm bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]">Done in 5 days</span>
                                </div>
                                <div className="h-4 bg-black/50 rounded-full overflow-hidden border border-white/10 relative shadow-inner">
                                    <div className="absolute inset-0 bg-primary/20 animate-pulse" />
                                    <div className="h-full w-[95%] bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-shimmer rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]" />
                                </div>
                                {/* Decorative Sparkle */}
                                <div className="absolute -right-1 -top-1">
                                    <span className="flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                            <span>Includes Defense Training</span>
                            <span className="w-1 h-1 rounded-full bg-gray-700" />
                            <span>PowerPoint Slides</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
