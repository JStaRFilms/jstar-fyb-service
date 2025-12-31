'use client';

import { motion } from 'framer-motion';
import { Zap, Crown, Check, Star, FileText, Code2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { PRICING_CONFIG } from '@/config/pricing';

const PRICING = {
    saas: {
        paperOnly: {
            price: PRICING_CONFIG.SAAS.PAPER.price,
            features: ['AI-Generated Abstract', 'Full Chapter 1-5 Outline', 'Formatting Templates', 'Unlimited Revisions']
        },
        software: {
            price: PRICING_CONFIG.SAAS.SOFTWARE.price,
            features: ['Everything in Paper-Only', 'Code Snippets & Boilerplate', 'Database Schema Generator', 'Tech Stack Recommendations']
        }
    },
    agency: {
        paperOnly: PRICING_CONFIG.AGENCY.PAPER.map(t => ({
            name: t.label,
            price: t.price,
            id: t.id,
            features: t.id === 'AGENCY_PAPER_EXPRESS'
                ? ['Chapters 1-5 Written', 'APA/IEEE Formatting', 'Plagiarism Check']
                : t.id === 'AGENCY_PAPER_DEFENSE'
                    ? ['Everything in Express', 'Mock Defense Session', 'Presentation Slides']
                    : ['Everything in Defense', 'Priority Support', 'Unlimited Revisions'],
            popular: t.popular || false
        })),
        software: PRICING_CONFIG.AGENCY.SOFTWARE.map(t => ({
            name: t.label,
            price: t.price,
            id: t.id,
            features: t.id === 'AGENCY_CODE_GO'
                ? ['Complete Source Code', 'Database Setup Script', 'Installation Guide']
                : t.id === 'AGENCY_DEFENSE_READY'
                    ? ['Everything in Code & Go', 'Chapter 3 & 4 Write-up', 'Mock Defense Session']
                    : ['Full Documentation (Ch 1-5)', 'Presentation Slides', 'Priority Support'],
            popular: t.popular || false
        }))
    }
};

export function Pricing() {
    const [projectType, setProjectType] = useState<'paper' | 'software'>('software');

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
    };

    return (
        <section id="pricing" className="py-32 relative">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-display font-bold mb-6"
                    >
                        Simple, <span className="text-accent">Transparent</span> Pricing
                    </motion.h2>
                    <p className="text-gray-400 max-w-xl mx-auto mb-8">
                        Choose your path. DIY with our AI, or let professionals handle it.
                    </p>

                    {/* Project Type Toggle */}
                    <div className="inline-flex items-center gap-2 p-1.5 bg-white/5 rounded-full border border-white/10">
                        <button
                            onClick={() => setProjectType('paper')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${projectType === 'paper' ? 'bg-accent text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            <FileText className="w-4 h-4" />
                            Paper Only
                        </button>
                        <button
                            onClick={() => setProjectType('software')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${projectType === 'software' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Code2 className="w-4 h-4" />
                            Software + Paper
                        </button>
                    </div>
                </div>

                {/* DIY Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20"
                >
                    <h3 className="text-center text-sm font-bold text-gray-500 uppercase tracking-widest mb-8">
                        <Zap className="inline w-4 h-4 mr-2 text-accent" />
                        Self-Service AI Builder
                    </h3>

                    <div className="max-w-md mx-auto">
                        <div className="glass-panel p-8 rounded-3xl border border-accent/20 hover:border-accent/50 transition-colors text-center">
                            <div className="text-5xl font-display font-bold text-white mb-2">
                                {formatPrice(projectType === 'paper' ? PRICING.saas.paperOnly.price : PRICING.saas.software.price)}
                            </div>
                            <p className="text-gray-500 text-sm mb-6">One-time payment</p>

                            <ul className="space-y-3 mb-8 text-left">
                                {(projectType === 'paper' ? PRICING.saas.paperOnly.features : PRICING.saas.software.features).map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                        <Check className="w-4 h-4 text-accent flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/project/builder"
                                className="block w-full py-4 border border-accent/30 rounded-xl text-accent font-bold uppercase tracking-wider hover:bg-accent hover:text-black transition-all"
                            >
                                Start Building Free →
                            </Link>
                            <p className="text-xs text-gray-600 mt-3">Pay only when you're ready to unlock</p>
                        </div>
                    </div>
                </motion.div>

                {/* Agency Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="text-center text-sm font-bold text-gray-500 uppercase tracking-widest mb-8">
                        <Crown className="inline w-4 h-4 mr-2 text-primary" />
                        Done-For-You Agency
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {(projectType === 'paper' ? PRICING.agency.paperOnly : PRICING.agency.software).map((tier, i) => (
                            <motion.div
                                key={tier.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`glass-panel p-6 rounded-2xl relative ${tier.popular ? 'border-2 border-primary ring-1 ring-primary/20' : 'border border-white/10'}`}
                            >
                                {tier.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-xs font-bold uppercase text-white rounded-full">
                                        Most Popular
                                    </div>
                                )}

                                <h4 className="text-lg font-bold text-white mb-2">{tier.name}</h4>
                                <div className="text-3xl font-display font-bold text-white mb-1">
                                    {formatPrice(tier.price)}
                                </div>
                                <p className="text-xs text-gray-500 mb-4">per group of 5</p>

                                <ul className="space-y-2 mb-6">
                                    {tier.features.map((f, j) => (
                                        <li key={j} className="flex items-start gap-2 text-sm text-gray-400">
                                            <Star className={`w-3 h-3 mt-1 flex-shrink-0 ${tier.popular ? 'text-primary' : 'text-gray-600'}`} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href={`/project/consult?tier=${encodeURIComponent(tier.name)}&price=${tier.price}&type=${projectType}`}
                                    className={`block w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider text-center transition-all ${tier.popular ? 'bg-primary text-white hover:bg-primary/90' : 'border border-white/20 text-white hover:bg-white/5'}`}
                                >
                                    Get Started
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    <p className="text-center text-gray-600 text-sm mt-8">
                        Already paid for DIY? We'll deduct that from your Agency upgrade. 🤝
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
