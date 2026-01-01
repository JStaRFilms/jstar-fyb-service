'use client';
import { motion } from 'framer-motion';
import { Crown, ArrowRight, MessageCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PRICING_CONFIG } from '@/config/pricing';
import { getProjectBillingDetails, type BillingDetails } from '@/app/actions/billing';

interface UpsellBridgeProps {
    className?: string;
    projectId?: string | null;
}

export function UpsellBridge({ className, projectId }: UpsellBridgeProps) {
    const [billing, setBilling] = useState<BillingDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBilling = async () => {
            if (!projectId) {
                setLoading(false);
                return;
            }
            try {
                const details = await getProjectBillingDetails(projectId);
                setBilling(details);
            } catch (error) {
                console.error('Failed to load billing:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBilling();
    }, [projectId]);

    if (loading) {
        return (
            <div className={`h-64 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${className}`}>
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    // Default to Paper track / DIY Paper price if no billing info (e.g. pre-payment)
    const currentTrack = billing?.currentTrack || 'PAPER';
    const totalPaid = billing?.totalPaid || 0;
    const isAgency = billing?.isAgencyMode || false;

    // Determine Upsell Target based on Track
    // Paper Track -> Paper Defense (80k)
    // Software Track -> Code & Go (120k)
    const targetTier = currentTrack === 'SOFTWARE'
        ? PRICING_CONFIG.AGENCY.SOFTWARE.find(t => t.id === 'AGENCY_CODE_GO')!
        : PRICING_CONFIG.AGENCY.PAPER.find(t => t.id === 'AGENCY_PAPER_DEFENSE')!;

    const FULL_AGENCY_PRICE = targetTier.price;
    const DISCOUNT_PRICE = Math.max(0, FULL_AGENCY_PRICE - totalPaid);

    // If they already paid fully (or more), show "Concierge Active" state
    const isFullyPaid = isAgency || totalPaid >= FULL_AGENCY_PRICE;

    if (isFullyPaid) {
        return (
            <div className={`relative overflow-hidden ${className}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent rounded-2xl border border-green-500/20" />
                <div className="relative glass-panel rounded-2xl p-8 border-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-full text-green-400">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Agency Mode Active</h3>
                            <p className="text-gray-400 text-sm">Our experts are handling your project. Check your email for updates.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // WhatsApp pre-filled message
    const whatsappMessage = encodeURIComponent(
        `Hi J-Star! I'm on the ${currentTrack} track and paid ₦${totalPaid.toLocaleString()}. I'd like to upgrade to the "${targetTier.label}" plan for the difference of ₦${DISCOUNT_PRICE.toLocaleString()}. Project ID: ${projectId}`
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
                    {/* Header */}
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-bold uppercase tracking-wider rounded-full mb-4 border border-yellow-500/20">
                            <Crown className="w-3 h-3" />
                            Stuck? We got you.
                        </div>
                        <h3 className="text-2xl md:text-3xl font-display font-bold">
                            Upgrade to <span className="text-gradient">Done-For-You</span>
                        </h3>
                    </div>

                    {/* Content Body */}
                    <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
                        {/* Description */}
                        <div className="flex-1">
                            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                                Running out of time? Upgrade to <strong>{targetTier.label}</strong>.
                                {totalPaid > 0 && (
                                    <> We'll deduct the <span className="text-white font-bold">₦{totalPaid.toLocaleString()}</span> you already paid.</>
                                )}
                            </p>
                        </div>

                        {/* Progress Card */}
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
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-1/2 animate-shimmer" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-5 text-center font-medium opacity-80">
                                Includes {currentTrack === 'SOFTWARE' ? 'Code, Docs & Defense' : 'Writing & Defense'}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
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
                            href={`https://wa.me/2348152657887?text=${whatsappMessage}`}
                            target="_blank"
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Claim Upgrade
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
