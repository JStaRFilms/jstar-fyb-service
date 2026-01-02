'use client';

import { useState, useMemo } from 'react';
import { X, Bold, Heading, List, Image, Mic, Sparkles } from 'lucide-react';

interface SectionEditorProps {
    title: string;
    content: string;
    wordCount?: number;
    onClose: () => void;
    onSave: (content: string) => void;
}

export function SectionEditor({ title, content: initialContent, wordCount: initialWordCount = 0, onClose, onSave }: SectionEditorProps) {
    const [editedContent, setEditedContent] = useState(initialContent);

    // Calculate word count on the fly
    const currentWordCount = useMemo(() => {
        return editedContent.trim() ? editedContent.trim().split(/\s+/).length : 0;
    }, [editedContent]);

    const handleSave = () => {
        onSave(editedContent);
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#030014] text-white flex flex-col animate-in slide-in-from-bottom duration-300">

            {/* Top Bar */}
            <header className="px-6 py-4 flex justify-between items-center border-b border-white/5 bg-black/20 shrink-0">
                <button onClick={onClose} className="text-gray-400 hover:text-white p-2 -ml-2">
                    <X className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h2 className="font-bold text-sm text-gray-200">{title}</h2>
                    <span className="text-[10px] text-green-400 flex items-center justify-center gap-1">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div> Editing
                    </span>
                </div>
                <button onClick={handleSave} className="text-primary font-bold text-sm px-2 -mr-2">
                    Done
                </button>
            </header>

            {/* Editor Canvas */}
            <main className="flex-1 p-6 overflow-y-auto">
                <textarea
                    className="w-full h-full bg-transparent outline-none text-lg leading-loose resize-none text-gray-200 placeholder-gray-700 font-light font-sans"
                    placeholder="Structure your thoughts here..."
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                />
            </main>

            {/* Floating Formatting Pill */}
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur border border-white/10 rounded-full px-4 py-2 flex items-center gap-4 shadow-xl z-50">
                <button className="text-white hover:text-primary transition-colors"><Bold className="w-4 h-4" /></button>
                <button className="text-gray-400 hover:text-white transition-colors"><Heading className="w-4 h-4" /></button>
                <button className="text-gray-400 hover:text-white transition-colors"><List className="w-4 h-4" /></button>
                <div className="w-px h-4 bg-white/20"></div>
                <button className="text-gray-400 hover:text-white transition-colors"><Image className="w-4 h-4" /></button>
            </div>

            {/* Bottom Action Bar */}
            <footer className="h-16 border-t border-white/10 bg-black/40 px-6 flex items-center justify-between shrink-0 mb-safe">
                <span className="text-xs text-gray-500 font-mono">{currentWordCount} words</span>

                {/* Smart Action Button */}
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent rounded-lg text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                    <Sparkles className="w-4 h-4 fill-white" /> Enhance
                </button>

                <button className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                    <Mic className="w-4 h-4 text-gray-400" />
                </button>
            </footer>

        </div>
    );
}
