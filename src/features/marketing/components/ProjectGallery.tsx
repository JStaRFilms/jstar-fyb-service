'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Code2 } from 'lucide-react';

const PROJECTS = [
    {
        title: "E-Commerce AI Agent",
        category: "Computer Science",
        tech: ["Next.js", "OpenAI", "Stripe"],
        gradient: "from-purple-500 to-indigo-500"
    },
    {
        title: "Hospital Management System",
        category: "Information Tech",
        tech: ["React", "Firebase", "Tailwind"],
        gradient: "from-cyan-500 to-blue-500"
    },
    {
        title: "Crypto Fraud Detection",
        category: "Cybersecurity",
        tech: ["Python", "Machine Learning", "FastAPI"],
        gradient: "from-pink-500 to-rose-500"
    },
    {
        title: "Smart Campus IoT",
        category: "Computer Eng.",
        tech: ["C++", "Arduino", "MQTT"],
        gradient: "from-emerald-500 to-teal-500"
    }
];

export function ProjectGallery() {
    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-display font-bold mb-6"
                    >
                        Recent <span className="text-gradient">Masterpieces</span>
                    </motion.h2>
                    <p className="text-gray-400 max-w-xl mx-auto">
                        See what distinction looks like. Real projects executed for real students.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {PROJECTS.map((project, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ type: "spring", stiffness: 50, damping: 10, delay: index * 0.2 }}
                            whileHover={{ y: -10, scale: 1.02, transition: { type: "spring", stiffness: 200 } }}
                            className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer will-change-transform"
                        >
                            {/* Card Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
                            <div className="absolute inset-0 border border-white/5 rounded-2xl group-hover:border-white/20 transition-colors" />

                            {/* Content */}
                            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-mono uppercase tracking-widest text-white/60 bg-white/5 px-2 py-1 rounded">
                                            {project.category}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-display font-bold text-white mb-2 leading-tight">
                                        {project.title}
                                    </h3>

                                    <div className="flex flex-wrap gap-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                        {project.tech.map((tech) => (
                                            <span key={tech} className="text-[10px] bg-black/50 text-white/80 px-2 py-1 rounded border border-white/10">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2 text-sm font-bold text-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        View Case Study <ExternalLink className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            {/* Icon Decoration */}
                            <div className="absolute top-4 right-4 bg-white/5 p-2 rounded-lg backdrop-blur-sm border border-white/10 opacity-50 group-hover:opacity-100 transition-opacity">
                                <Code2 className="w-5 h-5 text-white" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
