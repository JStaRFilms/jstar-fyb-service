import Link from "next/link";
import { Code, Cpu, Check, Zap, Crown, Star, ArrowRight } from "lucide-react";

export default function Home() {
    return (
        <div className="bg-dark min-h-screen font-sans text-white overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-md border-b border-white/5 bg-dark/50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="text-2xl font-display font-bold tracking-widest uppercase">
                        J Star<span className="text-primary">.FYB</span>
                    </div>
                    <div className="hidden md:flex gap-8 text-sm font-medium tracking-wide">
                        <Link href="#" className="hover:text-primary transition-colors">Experience</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Pricing</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Showcase</Link>
                    </div>
                    <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-primary hover:border-primary transition-all duration-300 font-bold text-xs uppercase tracking-wider">
                        Start Project
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-dark to-dark opacity-40"></div>
                <div className="absolute top-20 right-20 w-64 h-64 bg-accent/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px]"></div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    {/* Floating Hero Elements */}
                    <div className="absolute top-0 left-10 w-24 h-24 glass-panel rounded-2xl animate-float-slow flex items-center justify-center border-l-4 border-l-accent opacity-60 hidden md:flex">
                        <Code className="w-10 h-10 text-accent" />
                    </div>
                    <div className="absolute bottom-40 right-10 w-32 h-32 glass-panel rounded-full animate-float-fast flex items-center justify-center border-r-4 border-r-primary opacity-60 hidden md:flex">
                        <Cpu className="w-12 h-12 text-primary" />
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-mono uppercase tracking-wider text-gray-300">Accepting New Projects</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-display font-bold leading-tight mb-8">
                        Don&apos;t Just Pass.<br />
                        <span className="text-gradient">Dominate.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                        The ultimate cheat code for your final year project.
                        Full documentation, code foundations, and agency-grade execution.
                    </p>

                    <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                        <Link href="/project/builder" className="w-full md:w-auto">
                            <button className="px-10 py-5 bg-primary rounded-xl font-display font-bold tracking-wide uppercase hover:scale-105 transition-transform duration-300 glow-box w-full">
                                Get Started Now
                            </button>
                        </Link>
                        <button className="px-10 py-5 glass-panel rounded-xl font-display font-bold tracking-wide uppercase hover:bg-white/10 transition-colors w-full md:w-auto border-white/10">
                            See Examples
                        </button>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce">
                    <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
                    <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"></div>
                </div>
            </section>

            {/* Marquee */}
            <div className="border-y border-white/5 bg-black/20 backdrop-blur-sm py-8 overflow-hidden">
                <div className="flex whitespace-nowrap animate-scroll gap-12 text-gray-500 font-display font-bold text-2xl uppercase tracking-widest opacity-40">
                    <span>Computer Science</span> <span>•</span>
                    <span>Engineering</span> <span>•</span>
                    <span>Architecture</span> <span>•</span>
                    <span>Business Admin</span> <span>•</span>
                    <span>Microbiology</span> <span>•</span>
                    <span>Computer Science</span> <span>•</span>
                    <span>Engineering</span> <span>•</span>
                    <span>Architecture</span> <span>•</span>
                    <span>Business Admin</span> <span>•</span>
                    <span>Microbiology</span> <span>•</span>
                </div>
            </div>

            {/* The Method Section */}
            <section className="py-32 relative">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Choose Your <span className="text-accent">Mode</span></h2>
                        <p className="text-gray-400 max-w-xl mx-auto">We offer two paths to glory. Do it yourself with our AI tools,
                            or let the agency handle the heavy lifting.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">

                        {/* Option 1: DIY SaaS */}
                        <div className="glass-panel p-10 rounded-3xl relative overflow-hidden group hover:border-accent/50 transition-all duration-500">
                            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-8 text-accent">
                                <Zap className="w-8 h-8" />
                            </div>
                            <h3 className="text-3xl font-display font-bold mb-4">The DIY Builder</h3>
                            <p className="text-gray-400 mb-8 leading-relaxed">
                                Use our AI wizard to generate your abstract, outline, and chapter 1 instantly. Perfect for
                                students on a budget who need a jumpstart.
                            </p>
                            <ul className="space-y-4 mb-8 text-sm text-gray-300">
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-accent" /> Instant Abstract Generation</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-accent" /> Smart Topic Refiner</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-accent" /> Chapter 1 Blueprint</li>
                            </ul>
                            <Link href="/project/builder">
                                <button className="w-full py-4 border border-accent/30 rounded-xl text-accent font-bold uppercase tracking-wider hover:bg-accent hover:text-black transition-all">
                                    Launch Builder
                                </button>
                            </Link>
                        </div>

                        {/* Option 2: Agency */}
                        <div className="glass-panel p-10 rounded-3xl relative overflow-hidden group hover:border-primary/50 transition-all duration-500 ring-1 ring-primary/20">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="absolute top-0 right-0 px-4 py-2 bg-primary text-xs font-bold uppercase">Best Value</div>

                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 text-primary">
                                <Crown className="w-8 h-8" />
                            </div>
                            <h3 className="text-3xl font-display font-bold mb-4 text-white">Full Agency Service</h3>
                            <p className="text-gray-400 mb-8 leading-relaxed">
                                Sit back and relax. We handle everything from the system implementation to the final
                                documentation binding. Guaranteed distinction.
                            </p>
                            <ul className="space-y-4 mb-8 text-sm text-gray-300">
                                <li className="flex items-center gap-3"><Star className="w-4 h-4 text-primary" /> Complete Software Build</li>
                                <li className="flex items-center gap-3"><Star className="w-4 h-4 text-primary" /> 5-Chapter Documentation</li>
                                <li className="flex items-center gap-3"><Star className="w-4 h-4 text-primary" /> Defense Coaching</li>
                            </ul>
                            <Link href="/project/chat">
                                <button className="w-full py-4 bg-primary rounded-xl font-display font-bold uppercase tracking-wider hover:scale-105 transition-transform shadow-lg shadow-primary/25">
                                    Consult an Expert
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-black py-20">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-display font-bold mb-8">Ready to graduate in style?</h2>
                    <p className="text-gray-500 mb-8">J Star FYB Service © 2025. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
