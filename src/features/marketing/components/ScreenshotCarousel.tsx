'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ScreenshotCarouselProps {
    screenshots: string[];
    onSelect: (index: number) => void;
    selectedIndex: number;
}

export function ScreenshotCarousel({ screenshots, onSelect, selectedIndex }: ScreenshotCarouselProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div className="h-32 bg-black/40 border-t border-white/5 p-4 flex gap-4 overflow-x-auto items-center backdrop-blur-sm custom-scrollbar" ref={containerRef}>
            {screenshots.map((src, index) => {
                const isSelected = selectedIndex === index;

                return (
                    <button
                        key={index}
                        onClick={() => onSelect(index)}
                        className={cn(
                            "flex-shrink-0 w-40 h-24 rounded-xl overflow-hidden relative group transition-all duration-300",
                            isSelected
                                ? "border-2 border-purple-500 ring-4 ring-purple-500/10"
                                : "border border-white/10 hover:border-white/30 opacity-70 hover:opacity-100"
                        )}
                    >
                        {/* Note: In a real app we'd use Next.js Image, but for now we'll use a placeholder or the simplified <img> if src is external */}
                        <div className="w-full h-full bg-slate-800 relative">
                            {/* Placeholder for actual image to prevent broken images in dev without assets */}
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                <ImageIcon className="w-6 h-6 text-white/20" />
                            </div>

                            {/* Real image overlay */}
                            {src && src.startsWith('http') && (
                                <img
                                    src={src}
                                    alt={`Screenshot ${index + 1}`}
                                    className="w-full h-full object-cover absolute inset-0"
                                />
                            )}
                        </div>

                        {/* Hover Eye Icon */}
                        {!isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
