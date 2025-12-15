import { X, Check, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function BuilderPage() {
    return (
        <div className="bg-dark min-h-screen pb-32 font-sans text-white">
            {/* Progress Header */}
            <header className="sticky top-0 z-50 bg-dark/90 backdrop-blur-md border-b border-white/5 pb-4 pt-6">
                <div className="container mx-auto px-6">
                    <div className="flex items-center justify-between mb-4">
                        <Link href="/" className="text-gray-400 hover:text-white">
                            <X className="w-6 h-6" />
                        </Link>
                        <span className="font-display font-bold uppercase tracking-widest text-sm">Project Builder</span>
                        <span className="w-6"></span> {/* Spacer */}
                    </div>

                    {/* Steps */}
                    <div className="flex items-center gap-2">
                        <div className="h-1 flex-1 bg-green-500 rounded-full"></div> {/* Step 1 */}
                        <div className="h-1 flex-1 bg-green-500 rounded-full"></div> {/* Step 2 */}
                        <div className="h-1 flex-1 bg-primary rounded-full relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                        </div> {/* Step 3 (Active) */}
                    </div>
                    <div className="flex justify-between mt-2 text-xs font-mono text-gray-500 uppercase">
                        <span>Topic</span>
                        <span>Context</span>
                        <span className="text-primary font-bold">Generate</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8 md:max-w-3xl">
                {/* Success State */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-500 mb-4 border border-green-500/20">
                        <Check className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-display font-bold mb-2">Structure Generated</h1>
                    <p className="text-gray-400">We&apos;ve crafted a distinction-grade abstract and outline for your project.</p>
                </div>

                {/* The Content (Locked State) */}
                <div className="relative">
                    {/* Visible Teaser */}
                    <div className="glass-panel p-6 rounded-t-2xl border-b border-white/5">
                        <span className="text-xs font-mono text-accent uppercase tracking-wider mb-2 block">Project Title</span>
                        <h2 className="text-xl font-bold leading-tight">Blockchain-Based Fake News Detection System using SHA-256 Hashing Algorithm</h2>

                        <div className="mt-6">
                            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2 block">Abstract Preview</span>
                            <p className="text-gray-300 leading-relaxed text-sm">
                                In an era of rampant misinformation, the integrity of digital media is paramount. This project
                                proposes a decentralized approach to verifying news authenticity utilizing the immutability of
                                blockchain technology...
                            </p>
                        </div>
                    </div>

                    {/* Blurred/Locked Content */}
                    <div className="glass-panel p-6 rounded-b-2xl border-t-0 relative overflow-hidden">
                        <div className="space-y-6 filter blur-[8px] select-none pointer-events-none opacity-50">
                            <div>
                                <h3 className="font-bold text-lg mb-2">Chapter 1: Introduction</h3>
                                <p className="text-gray-400 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2">1.1 Background of Study</h3>
                                <p className="text-gray-400 text-sm">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.</p>
                                <p className="text-gray-400 text-sm mt-2">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2">1.2 Problem Statement</h3>
                                <p className="text-gray-400 text-sm">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.</p>
                            </div>
                        </div>

                        {/* Paywall Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/80 to-transparent flex flex-col items-center justify-end pb-10 z-10 px-6 text-center">
                            <Lock className="w-12 h-12 text-primary mb-4" />
                            <h3 className="text-2xl font-display font-bold mb-2">Unlock Full Project</h3>
                            <p className="text-gray-400 text-sm mb-6 max-w-sm">Get the complete 5-chapter source code, documentation, and implementation guide.</p>

                            <button className="w-full py-4 bg-primary rounded-xl font-display font-bold uppercase tracking-wide glow-box animate-pulse hover:scale-105 transition-transform">
                                Pay ₦15,000 to Unlock
                            </button>
                            <p className="mt-4 text-xs text-gray-500 flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3" /> Secured by Paystack
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
