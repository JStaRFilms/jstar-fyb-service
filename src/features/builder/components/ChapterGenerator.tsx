'use client';

import { useState, useCallback } from 'react';
import { BookOpen, Loader2, Download, ChevronDown, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChapterGeneratorProps {
    projectId: string;
}

interface GeneratedChapter {
    number: number;
    title: string;
    content: string;
    isGenerating: boolean;
}

const CHAPTER_INFO = [
    { number: 1, title: 'Introduction', description: 'Background, problem statement, objectives, scope' },
    { number: 2, title: 'Literature Review', description: 'Related works, theoretical framework, critiques' },
    { number: 3, title: 'Methodology', description: 'System design, DFDs, architecture, tools' },
    { number: 4, title: 'Implementation & Results', description: 'Development, testing, evaluation' },
    { number: 5, title: 'Conclusion', description: 'Summary, recommendations, future work' },
];

export function ChapterGenerator({ projectId }: ChapterGeneratorProps) {
    const [chapters, setChapters] = useState<Record<number, GeneratedChapter>>({});
    const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const generateChapter = useCallback(async (chapterNumber: number) => {
        setError(null);

        // Mark as generating
        setChapters(prev => ({
            ...prev,
            [chapterNumber]: {
                number: chapterNumber,
                title: CHAPTER_INFO[chapterNumber - 1].title,
                content: '',
                isGenerating: true
            }
        }));

        // Auto-expand
        setExpandedChapter(chapterNumber);

        try {
            const response = await fetch('/api/generate/chapter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId, chapterNumber })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate chapter');
            }

            // Stream the response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let content = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    content += chunk;

                    // Update state with streamed content
                    setChapters(prev => ({
                        ...prev,
                        [chapterNumber]: {
                            ...prev[chapterNumber],
                            content,
                            isGenerating: true
                        }
                    }));
                }
            }

            // Mark as complete
            setChapters(prev => ({
                ...prev,
                [chapterNumber]: {
                    ...prev[chapterNumber],
                    content,
                    isGenerating: false
                }
            }));

        } catch (err) {
            console.error('[ChapterGenerator] Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate chapter');

            // Clear generating state
            setChapters(prev => ({
                ...prev,
                [chapterNumber]: {
                    ...prev[chapterNumber],
                    isGenerating: false
                }
            }));
        }
    }, [projectId]);

    const downloadChapter = useCallback((chapter: GeneratedChapter) => {
        const blob = new Blob([chapter.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Chapter_${chapter.number}_${chapter.title.replace(/\s+/g, '_')}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, []);

    const downloadAllChapters = useCallback(() => {
        const generatedChapters = Object.values(chapters).filter(c => c.content && !c.isGenerating);
        if (generatedChapters.length === 0) return;

        const fullContent = generatedChapters
            .sort((a, b) => a.number - b.number)
            .map(c => `# Chapter ${c.number}: ${c.title}\n\n${c.content}`)
            .join('\n\n---\n\n');

        const blob = new Blob([fullContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Full_Project_Documentation.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [chapters]);

    const completedCount = Object.values(chapters).filter(c => c.content && !c.isGenerating).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-primary" />
                        Chapter Generator
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        Generate full academic content for each chapter
                    </p>
                </div>

                {completedCount > 0 && (
                    <button
                        onClick={downloadAllChapters}
                        className="flex items-center gap-2 px-4 py-2 bg-accent/20 border border-accent/30 rounded-xl text-accent hover:bg-accent/30 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Download All ({completedCount})
                    </button>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Chapter Cards */}
            <div className="space-y-4">
                {CHAPTER_INFO.map((info) => {
                    const chapter = chapters[info.number];
                    const isGenerating = chapter?.isGenerating;
                    const isGenerated = chapter?.content && !isGenerating;
                    const isExpanded = expandedChapter === info.number;

                    return (
                        <div
                            key={info.number}
                            className="glass-panel rounded-2xl overflow-hidden"
                        >
                            {/* Chapter Header */}
                            <div className="p-5 flex items-center justify-between">
                                <button
                                    onClick={() => setExpandedChapter(isExpanded ? null : info.number)}
                                    className="flex items-center gap-4 flex-1 text-left"
                                    disabled={!isGenerated}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${isGenerated ? 'bg-green-500/20 text-green-400' :
                                            isGenerating ? 'bg-primary/20 text-primary' :
                                                'bg-white/5 text-gray-500'
                                        }`}>
                                        {isGenerating ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : isGenerated ? (
                                            <CheckCircle2 className="w-5 h-5" />
                                        ) : (
                                            info.number
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-white">
                                            Chapter {info.number}: {info.title}
                                        </h3>
                                        <p className="text-sm text-gray-500">{info.description}</p>
                                    </div>

                                    {isGenerated && (
                                        isExpanded ? (
                                            <ChevronDown className="w-5 h-5 text-gray-500 ml-auto" />
                                        ) : (
                                            <ChevronRight className="w-5 h-5 text-gray-500 ml-auto" />
                                        )
                                    )}
                                </button>

                                <div className="flex items-center gap-2 ml-4">
                                    {isGenerated && (
                                        <button
                                            onClick={() => downloadChapter(chapter)}
                                            className="p-2 text-gray-400 hover:text-accent transition-colors"
                                            title="Download chapter"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                    )}

                                    {!isGenerating && (
                                        <button
                                            onClick={() => generateChapter(info.number)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${isGenerated
                                                    ? 'border border-white/10 text-gray-400 hover:border-white/20'
                                                    : 'bg-primary text-white hover:bg-primary/90'
                                                }`}
                                        >
                                            <BookOpen className="w-4 h-4" />
                                            {isGenerated ? 'Regenerate' : 'Generate'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {(isExpanded || isGenerating) && chapter?.content && (
                                <div className="px-5 pb-5 border-t border-white/5">
                                    <div className="mt-4 prose prose-invert prose-sm max-w-none max-h-[500px] overflow-y-auto">
                                        <ReactMarkdown>{chapter.content}</ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
