import { Lock, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

interface PricingOverlayProps {
    onUnlock: () => void;
}

export function PricingOverlay({ onUnlock }: PricingOverlayProps) {
    return (
        <div className="relative overflow-hidden rounded-xl md:rounded-2xl border border-primary/20 bg-dark/50 backdrop-blur-xl p-4 md:p-8">
            {/* Background Effects */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/10 blur-[100px] rounded-full" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                {/* Value Prop */}
                <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                        <Sparkles className="w-3 h-3" />
                        Premium Access
                    </div>
                    <h3 className="text-2xl font-display font-bold text-white mb-2">
                        Ready to Build the Real Thing?
                    </h3>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                        You've got the outline. Now unlock the full <strong className="text-white">Deep Research</strong>, <strong className="text-white">5-Chapter Write-up</strong>, and <strong className="text-white">Project Materials</strong>.
                    </p>

                    <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span>Detailed Chapter Content (10,000+ words)</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span>Complete Project Material & Datasets</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span>Defense Slides & Script</span>
                        </li>
                    </ul>
                </div>

                {/* CTA Card */}
                <div className="w-full md:w-80 bg-white/5 border border-white/10 rounded-xl p-6 text-center shadow-2xl">
                    <div className="mb-6">
                        <span className="text-gray-400 text-sm line-through">₦25,000</span>
                        <div className="text-4xl font-display font-bold text-white">₦15,000</div>
                        <span className="text-xs text-primary font-bold">LIMITED TIME OFFER</span>
                    </div>

                    <button
                        onClick={onUnlock}
                        className="w-full py-4 bg-primary hover:bg-primary/90 rounded-lg font-bold text-white uppercase tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25 mb-4 flex items-center justify-center gap-2"
                    >
                        <Lock className="w-4 h-4" />
                        Unlock Now
                    </button>

                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Secured by Paystack</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
