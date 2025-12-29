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

            <div className="relative glass-panel rounded-2xl p-5 sm:p-8 border-0">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Crown className="w-32 h-32 rotate-12" />
                </div>

                <div className="relative z-10 flex flex-col gap-8">
                    {/* 1. Header Section (Full Width) */}
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-bold uppercase tracking-wider rounded-full mb-4 border border-yellow-500/20">
                            <Crown className="w-3 h-3" />
                            Stuck? We got you.
                        </div>
                        <h3 className="text-2xl md:text-3xl font-display font-bold">
                            Upgrade to <span className="text-gradient">Done-For-You</span>
                        </h3>
                    </div>

                    {/* 2. Content Body (Split) */}
                    <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
                        {/* Left: Description */}
                        <div className="flex-1">
                            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                                Running out of time? Let our senior engineers build your entire project (Source Code + Documentation).
                                We'll deduct the <span className="text-white font-bold">₦{ALREADY_PAID.toLocaleString()}</span> you already paid.
                            </p>
                        </div>

                        {/* Right: Progress Card */}
                        <div className="bg-black/40 rounded-2xl p-6 w-full lg:w-[400px] border border-white/5 backdrop-blur-sm shadow-xl shrink-0">
                            <div className="space-y-6">
                                <div>
                                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm mb-2">
                                        <span className="text-gray-400 font-medium">DIY Timeline</span>
                                        <span className="text-yellow-500 font-bold whitespace-nowrap">Stalled...</span>
                                    </div>
                                    <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full w-[40%] bg-yellow-500/50" />
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm mb-2">
                                        <span className="text-white font-bold text-base">Agency Speed</span>
                                        <span className="text-green-400 font-bold shadow-green-500/20 drop-shadow-sm whitespace-nowrap text-base">Done in 5 days</span>
                                    </div>
                                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full w-[95%] bg-gradient-to-r from-primary to-accent shadow-[0_0_15px_rgba(139,92,246,0.3)]" />
                                    </div>
                                    {/* Shine effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-1/2 animate-shimmer" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-5 text-center font-medium opacity-80">
                                Includes Defense Training & Slides
                            </p>
                        </div>
                    </div>

                    {/* 3. Footer Actions (Price + Button) */}
                    <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/5">
                        <div className="text-left">
                            <p className="text-xs text-gray-500 line-through">
                                ₦{FULL_AGENCY_PRICE.toLocaleString()}
                            </p>
                            <p className="text-3xl font-bold text-white">
                                ₦{DISCOUNT_PRICE.toLocaleString()}
                            </p>
                        </div>

                        <Link
                            href={`https://wa.me/2348123456789?text=${whatsappMessage}`}
                            target="_blank"
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Claim Discount
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
