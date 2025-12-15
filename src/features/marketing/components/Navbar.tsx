'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';


export function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                "fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent",
                scrolled ? "bg-dark/80 backdrop-blur-md border-white/5 py-4" : "bg-transparent py-6"
            )}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="text-2xl font-display font-bold tracking-widest uppercase hover:opacity-80 transition-opacity">
                    J Star<span className="text-primary">.FYB</span>
                </Link>

                <div className="hidden md:flex gap-8 text-sm font-medium tracking-wide">
                    <Link href="#experience" className="hover:text-primary transition-colors text-white/80">Experience</Link>
                    <Link href="#pricing" className="hover:text-primary transition-colors text-white/80">Pricing</Link>
                    <Link href="#showcase" className="hover:text-primary transition-colors text-white/80">Showcase</Link>
                </div>

                <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-primary hover:border-primary transition-all duration-300 font-bold text-xs uppercase tracking-wider text-white">
                    Start Project
                </button>
            </div>
        </nav>
    );
}
