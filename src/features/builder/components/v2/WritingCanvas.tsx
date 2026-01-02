'use client';

import { Bold, Italic, List, Sparkles, Maximize2 } from 'lucide-react';

interface WritingCanvasProps {
    title?: string;
    content?: string;
    onValidChange?: (content: string) => void;
}

export function WritingCanvas({ title, content, onValidChange }: WritingCanvasProps) {
    return (
        <div className="flex-1 flex flex-col relative bg-[#050508] h-full">

            {/* Editor Toolbar */}
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-dark/50 backdrop-blur z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <span className="text-gray-500 text-sm hidden md:inline-block">{title || 'Select a section...'}</span>
                </div>
                <div className="flex items-center gap-2 bg-black/20 rounded-lg p-1">
                    <button className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors">
                        <Bold className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors">
                        <Italic className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors">
                        <List className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-1"></div>
                    <button className="px-3 py-1.5 bg-primary/20 text-primary text-xs font-bold rounded hover:bg-primary/30 transition-colors flex items-center gap-2">
                        <Sparkles className="w-3 h-3" /> Enhance
                    </button>
                </div>
                <div className="w-4 md:w-24"></div>
            </div>

            {/* Scrollable Canvas */}
            <div className="flex-1 overflow-y-auto w-full flex justify-center p-4 md:p-8 bg-[#050508] custom-scrollbar">
                <div className="w-full max-w-5xl pb-32">
                    <textarea
                        className="w-full h-[1500px] bg-transparent outline-none text-lg md:text-xl leading-relaxed text-gray-200 resize-none font-serif placeholder-gray-700 focus:placeholder-gray-600 transition-colors px-4 overflow-hidden"
                        spellCheck={false}
                        placeholder="Start writing or generate content..."
                        defaultValue={content}
                        onChange={(e) => onValidChange?.(e.target.value)}
                    />
                </div>
            </div>

            {/* FAB: Focus Mode */}
            <button
                className="absolute bottom-8 right-8 w-12 h-12 bg-black/50 hover:bg-primary border border-white/10 hover:border-primary rounded-full flex items-center justify-center transition-all group shadow-2xl z-20"
                title="Focus Mode"
            >
                <Maximize2 className="w-5 h-5 text-gray-400 group-hover:text-white" />
            </button>

        </div>
    );
}
