'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';

export function StickyCTA() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show CTA after receiving some scroll depth (e.g., 500px)
            if (window.scrollY > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.5 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 100, scale: 0.5 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="fixed bottom-8 right-8 z-50 flex items-center gap-4"
                >
                    {/* Tooltip */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="hidden md:block bg-dark border border-white/10 px-4 py-2 rounded-lg shadow-xl"
                    >
                        <span className="text-sm font-bold text-white">Have a question?</span>
                    </motion.div>

                    <motion.button
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse-glow"
                    >
                        <MessageSquare className="w-8 h-8 text-white" />
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
