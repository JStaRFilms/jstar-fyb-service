'use client';

import { motion } from 'framer-motion';
import { Zap, Crown, Check, Star } from 'lucide-react';
import Link from 'next/link';

export function Pricing() {
    return (
        <section className="py-32 relative">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-display font-bold mb-6"
                    >
                        Choose Your <span className="text-accent">Mode</span>
                    </motion.h2>
                    <p className="text-gray-400 max-w-xl mx-auto">
                        We offer two paths to glory. Do it yourself with our AI tools,
                        or let the agency handle the heavy lifting.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {/* Option 1: DIY SaaS */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 60, damping: 12, delay: 0.2 }}
                        whileHover={{ scale: 1.02, y: -5, transition: { type: "spring", stiffness: 300 } }}
                        className="glass-panel p-10 rounded-3xl relative overflow-hidden group border border-white/5 hover:border-accent/50 transition-colors duration-500 will-change-transform"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-8 text-accent group-hover:scale-110 transition-transform duration-300">
                            <Zap className="w-8 h-8" />
                        </div>

                        <h3 className="text-3xl font-display font-bold mb-4 text-white">The DIY Builder</h3>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            Use our AI wizard to generate your abstract, outline, and chapter 1 instantly. Perfect for
                            students on a budget who need a jumpstart.
                        </p>

                        <ul className="space-y-4 mb-8 text-sm text-gray-300">
                            <li className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-accent" />
                                Instant Abstract Generation
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-accent" />
                                Smart Topic Refiner
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-accent" />
                                Chapter 1 Blueprint
                            </li>
                        </ul>

                        <Link
                            href="/project/builder"
                            className="w-full py-4 border border-accent/30 rounded-xl text-accent font-bold uppercase tracking-wider hover:bg-accent hover:text-black transition-all flex items-center justify-center"
                        >
                            Launch Builder
                        </Link>
                    </motion.div>

                    {/* Option 2: Agency */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 60, damping: 12, delay: 0.4 }}
                        whileHover={{ scale: 1.05, y: -10, transition: { type: "spring", stiffness: 300 } }}
                        className="glass-panel p-10 rounded-3xl relative overflow-hidden group border border-white/5 hover:border-primary/50 transition-colors duration-500 ring-1 ring-primary/20"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <div className="absolute top-0 right-0 px-4 py-2 bg-primary text-xs font-bold uppercase text-white">
                            Best Value
                        </div>

                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 text-primary group-hover:scale-110 transition-transform duration-300">
                            <Crown className="w-8 h-8" />
                        </div>

                        <h3 className="text-3xl font-display font-bold mb-4 text-white">Full Agency Service</h3>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            Sit back and relax. We handle everything from the system implementation to the final
                            documentation binding. Guaranteed distinction.
                        </p>

                        <ul className="space-y-4 mb-8 text-sm text-gray-300">
                            <li className="flex items-center gap-3">
                                <Star className="w-4 h-4 text-primary" />
                                Complete Software Build
                            </li>
                            <li className="flex items-center gap-3">
                                <Star className="w-4 h-4 text-primary" />
                                5-Chapter Documentation
                            </li>
                            <li className="flex items-center gap-3">
                                <Star className="w-4 h-4 text-primary" />
                                Defense Coaching
                            </li>
                        </ul>

                        <Link
                            href="/project/consult"
                            className="w-full py-4 bg-primary rounded-xl font-display font-bold uppercase tracking-wider hover:scale-105 transition-transform shadow-lg shadow-primary/25 text-white flex items-center justify-center"
                        >
                            Consult an Expert
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
