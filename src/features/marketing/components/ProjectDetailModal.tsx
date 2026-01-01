'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScreenshotCarousel } from './ScreenshotCarousel';
import { TechStackPills } from './TechStackPills';
import { ProjectMetrics } from './ProjectMetrics';
import { DeliverablesList } from './DeliverablesList';

export interface ProjectDetail {
    id: string;
    title: string;
    category: string;
    summary: string;
    description: string;
    heroImage: string; // URL or placeholder
    techStack: string[];
    metrics: {
        codeQuality: number;
        performance: string;
    };
    features: {
        title: string;
        desc: string;
    }[];
    deliverables: string[];
    screenshots: string[];
    gradient: string; // CSS class for gradient override if needed
}

interface ProjectDetailModalProps {
    project: ProjectDetail | null;
    isOpen: boolean;
    onClose: () => void;
    onNext?: () => void;
    onPrev?: () => void;
}

export function ProjectDetailModal({ project, isOpen, onClose, onNext, onPrev }: ProjectDetailModalProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight' && onNext) onNext();
            if (e.key === 'ArrowLeft' && onPrev) onPrev();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, onNext, onPrev]);

    if (!project) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="relative w-full max-w-[1400px] h-[90vh] bg-[#030014]/90 rounded-[32px] border border-white/10 shadow-2xl flex flex-col lg:flex-row overflow-hidden"
                    >

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 z-50 p-2 rounded-full bg-black/20 hover:bg-white/10 border border-white/5 transition-colors group"
                        >
                            <X className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
                        </button>

                        {/* Navigation Arrows (Desktop) */}
                        {onPrev && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/40 hover:bg-white/10 border border-white/5 transition-colors group hidden lg:flex items-center justify-center"
                            >
                                <ArrowLeft className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
                            </button>
                        )}
                        {onNext && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onNext(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/40 hover:bg-white/10 border border-white/5 transition-colors group hidden lg:flex items-center justify-center"
                            >
                                <ArrowRight className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
                            </button>
                        )}

                        {/* LEFT COLUMN: Media & Hero (60%) */}
                        <div className="w-full lg:w-[60%] relative flex flex-col h-[40vh] lg:h-full border-b lg:border-b-0 lg:border-r border-white/5">

                            {/* Hero Image Area */}
                            <div className="relative flex-grow overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black">
                                    {/* Placeholder for actual image */}
                                    <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-1000 transform group-hover:scale-105"></div>
                                    {/* Fallback gradient if image fails/is missing */}
                                    <div className={cn("absolute inset-0 opacity-20 bg-gradient-to-br", project.gradient)}></div>
                                </div>

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent opacity-90"></div>

                                {/* Checkers Pattern Overlay (Optional Texture) */}
                                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>


                                {/* Floating Chips */}
                                <div className="absolute top-8 left-8 flex gap-3 z-10">
                                    <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-widest text-white/90">
                                        {project.category}
                                    </span>
                                    <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/20 text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                                        Distinction
                                    </span>
                                </div>

                                {/* Title Block */}
                                <div className="absolute bottom-0 left-0 w-full p-8 lg:p-10 bg-gradient-to-t from-[#030014] to-transparent z-10">
                                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold mb-4 leading-tight text-white">
                                        {project.title}
                                    </h1>
                                    <p className="text-sm md:text-lg lg:text-xl text-gray-400 max-w-2xl font-light leading-relaxed">
                                        {project.summary}
                                    </p>
                                </div>
                            </div>

                            {/* Gallery Thumbnails */}
                            <div className="hidden lg:block">
                                <ScreenshotCarousel
                                    screenshots={project.screenshots}
                                    selectedIndex={0}
                                    onSelect={() => { }}
                                />
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Details (40%) */}
                        <div className="w-full lg:w-[40%] bg-[#030014] flex flex-col h-full overflow-hidden relative">

                            {/* Scrollable Content */}
                            <div className="flex-grow overflow-y-auto p-6 lg:p-10 space-y-10 custom-scrollbar" ref={scrollRef}>

                                {/* About Section */}
                                <section>
                                    <h3 className="text-sm font-mono uppercase text-gray-500 mb-4 tracking-wider">About the Project</h3>
                                    <p className="text-gray-300 leading-relaxed text-base lg:text-lg font-light">
                                        {project.description}
                                    </p>
                                </section>

                                {/* Metrics Grid */}
                                <ProjectMetrics metrics={project.metrics} />

                                {/* Tech Stack */}
                                <section>
                                    <h3 className="text-sm font-mono uppercase text-gray-500 mb-4 tracking-wider">Tech Stack</h3>
                                    <TechStackPills techStack={project.techStack} />
                                </section>

                                {/* Key Features (Grid) */}
                                <section>
                                    <h3 className="text-sm font-mono uppercase text-gray-500 mb-4 tracking-wider">Key Features</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {project.features.map((feature, i) => (
                                            <div key={i} className="glass-panel p-4 rounded-xl border border-white/5 bg-white/5">
                                                <h4 className="font-bold text-white mb-1">{feature.title}</h4>
                                                <p className="text-sm text-gray-400">{feature.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Deliverables */}
                                <section>
                                    <h3 className="text-sm font-mono uppercase text-gray-500 mb-4 tracking-wider">Deliverables</h3>
                                    <DeliverablesList deliverables={project.deliverables} />
                                </section>

                                {/* Padding for sticky footer */}
                                <div className="h-24"></div>
                            </div>

                            {/* Footer CTA (Sticky) */}
                            <div className="p-6 lg:p-8 border-t border-white/5 bg-[#030014]/95 backdrop-blur-xl absolute bottom-0 w-full z-10">
                                <button className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-display font-bold text-lg uppercase tracking-wide group relative overflow-hidden transition-all shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2">
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        Start Similar Project
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                </button>
                                <div className="mt-4 text-center">
                                    <span className="text-xs text-gray-500 cursor-pointer hover:text-white transition-colors">Have a question?</span>
                                </div>
                            </div>

                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
