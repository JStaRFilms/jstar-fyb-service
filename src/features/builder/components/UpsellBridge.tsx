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

            <div className="relative glass-panel rounded-2xl p-8 md:p-10 border-0">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Crown className="w-32 h-32 rotate-12" />
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-bold uppercase tracking-wider rounded-full mb-4 border border-yellow-500/20">
                            <Crown className="w-3 h-3" />
                            Stuck? We got you.
                        </div>

                        <h3 className="text-2xl md:text-3xl font-display font-bold mb-3">
                            Upgrade to <span className="text-gradient">Done-For-You</span>
                        </h3>

                        <p className="text-gray-400 mb-6">
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
                    <div className="bg-black/40 rounded-xl p-4 md:w-80 border border-white/5 backdrop-blur-sm">
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-400">DIY Timeline</span>
                                    <span className="text-yellow-500">Stalled...</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-[40%] bg-yellow-500/50" />
                                </div>
                            </div>

                            <div className="relative">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-white font-bold">Agency Speed</span>
                                    <span className="text-green-400">Done in 5 days</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-[95%] bg-gradient-to-r from-primary to-accent" />
                                </div>
                                {/* Shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-1/2 animate-shimmer" />
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-3 text-center">
                            Includes Defense Training & Slides
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
