'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TimelineSidebar } from './TimelineSidebar';
import { WritingCanvas } from './WritingCanvas';
import { MobileTimelineView } from './MobileTimelineView';
import { SectionEditor } from './SectionEditor';
import { MobileFloatingNav } from './MobileFloatingNav';
import { useMediaQuery } from '../../../../hooks/use-media-query';
import { Search, BrainCircuit, ArrowRight, FileText, Globe, Cloud, Loader2, Check, CloudOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Chapter {
    id: string;
    number: number;
    title: string;
    content: string;
    status: 'locked' | 'draft' | 'in-progress' | 'complete';
    wordCount: number;
    subsections: string[]; // derived from content
    version: number;
}

interface ChapterEditorProps {
    projectId: string;
    initialData?: {
        project: any;
        chapters: any;
    };
}

export function ChapterEditor({ projectId }: ChapterEditorProps) {
    // State
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [activeChapterNumber, setActiveChapterNumber] = useState(1);
    const [projectTitle, setProjectTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Save Status State
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const pendingContentRef = useRef<string | null>(null);

    // Mobile State
    const [mobileView, setMobileView] = useState<'timeline' | 'editor'>('timeline');
    const [activeSection, setActiveSection] = useState<{ title: string; content: string } | null>(null);
    const isDesktop = useMediaQuery("(min-width: 768px)");

    // Auto-clear saved status after 2s
    useEffect(() => {
        if (saveStatus === 'saved') {
            const timer = setTimeout(() => setSaveStatus('idle'), 2000);
            return () => clearTimeout(timer);
        }
    }, [saveStatus]);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Project Info for Title
                // In a real app we might bundle this, but for now separate calls or passed via props
                // Assuming we can get title from chapters endpoint or separate project endpoint
                // For now, let's fetch chapters

                const response = await fetch(`/api/projects/${projectId}/chapters`);
                const data = await response.json();

                if (data.success && data.chapters) {
                    // Start: Transform API data to Component State
                    // This logic mirrors ChapterGenerator but for V2
                    // We need to map the Record<string, string> or Chapter[] to our state

                    // Note: API returns `project.chapters` (Array) if available, or legacy object
                    // Let's handle Array format primarily as we migrated

                    let mappedChapters: Chapter[] = [];

                    if (Array.isArray(data.chapters)) {
                        mappedChapters = data.chapters.map((c: any) => ({
                            id: c.id,
                            number: c.number,
                            title: c.title,
                            content: c.content,
                            status: c.status?.toLowerCase() || 'draft',
                            wordCount: c.wordCount || 0,
                            subsections: parseSubsections(c.content),
                            version: c.version || 1
                        }));
                    } else {
                        // Legacy object support fallback
                        const CHAPTER_TITLES = ["Introduction", "Literature Review", "Methodology", "Implementation", "Conclusion"];
                        mappedChapters = Array.from({ length: 5 }, (_, i) => {
                            const num = i + 1;
                            const content = data.chapters[`chapter_${num}`] || '';
                            return {
                                id: `legacy-${num}`,
                                number: num,
                                title: CHAPTER_TITLES[i],
                                content: content,
                                status: content ? 'draft' : 'locked', // simplified
                                wordCount: content.split(/\s+/).length,
                                subsections: parseSubsections(content),
                                version: 1
                            };
                        });
                    }

                    setChapters(mappedChapters);
                }
            } catch (error) {
                console.error('Failed to load chapters', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [projectId]);

    // Helpers
    const parseSubsections = (content: string) => {
        if (!content) return [];
        return content.match(/^##\s+(.+)$/gm)?.map(s => s.replace(/^##\s+/, '')) || [];
    };

    const handleSave = useCallback(async (content: string) => {
        // Store pending content for manual save
        pendingContentRef.current = content;

        // Optimistic update
        setChapters(prev => prev.map(c =>
            c.number === activeChapterNumber
                ? { ...c, content, wordCount: content.split(/\s+/).length, subsections: parseSubsections(content) }
                : c
        ));

        // Show saving status
        setSaveStatus('saving');

        // API Call
        try {
            const response = await fetch(`/api/projects/${projectId}/chapters/${activeChapterNumber}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });

            if (response.ok) {
                setSaveStatus('saved');
                setLastSavedAt(new Date());
            } else {
                setSaveStatus('error');
            }
        } catch (error) {
            console.error('Failed to save chapter', error);
            setSaveStatus('error');
        }
    }, [activeChapterNumber, projectId]);

    // Manual save trigger
    const triggerManualSave = useCallback(() => {
        const chapter = chapters.find(c => c.number === activeChapterNumber);
        if (chapter) {
            handleSave(chapter.content);
        }
    }, [chapters, activeChapterNumber, handleSave]);

    // Save Status Indicator Component (inline)
    const SaveStatusBadge = ({ showText = true }: { showText?: boolean }) => {
        const config = {
            idle: { icon: <Cloud className="w-4 h-4" />, text: lastSavedAt ? 'Saved' : 'Ready', className: 'text-gray-400 bg-white/5' },
            saving: { icon: <Loader2 className="w-4 h-4 animate-spin" />, text: 'Saving...', className: 'text-primary bg-primary/20' },
            saved: { icon: <Check className="w-4 h-4" />, text: 'Saved!', className: 'text-green-400 bg-green-500/20' },
            error: { icon: <CloudOff className="w-4 h-4" />, text: 'Failed', className: 'text-red-400 bg-red-500/20' },
        }[saveStatus];

        return (
            <button
                onClick={triggerManualSave}
                disabled={saveStatus === 'saving'}
                className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 transition-all duration-300',
                    'hover:scale-105 active:scale-95 disabled:hover:scale-100',
                    config.className
                )}
                title={saveStatus === 'error' ? 'Click to retry' : 'Click to save now'}
            >
                {config.icon}
                {showText && (
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                        {config.text}
                    </span>
                )}
            </button>
        );
    };

    const activeChapter = chapters.find(c => c.number === activeChapterNumber);

    // Render Logic
    if (isLoading) return <div className="flex h-screen items-center justify-center text-primary animate-pulse">Loading Workspace...</div>;

    // Desktop Layout
    if (isDesktop) {
        return (
            <div className="flex h-screen w-full bg-dark text-gray-300 overflow-hidden font-sans">
                {/* Visual Shell Logic directly here since we deleted ProjectWorkspaceLayout logic essentially */}

                {/* Left Sidebar */}
                <div className="hidden md:flex shrink-0 h-full">
                    <TimelineSidebar
                        projectTitle={projectTitle || "Project Workspace"}
                        chapters={chapters}
                        activeChapterNumber={activeChapterNumber}
                        onChapterSelect={setActiveChapterNumber}
                    />
                </div>

                {/* Main Content */}
                <main className="flex-1 flex flex-col relative h-full w-full">
                    <WritingCanvas
                        title={activeChapter?.title?.toLowerCase().startsWith('chapter')
                            ? activeChapter.title
                            : `Chapter ${activeChapterNumber} / ${activeChapter?.title || 'Untitled'}`}
                        content={activeChapter?.content}
                        onValidChange={handleSave}
                        headerRight={<SaveStatusBadge />}
                    />
                </main>

                {/* Right Context Sidebar (Static Placeholder for Phase 1) */}
                <aside className="hidden lg:flex w-96 flex-col glass-panel border-l border-white/5 bg-dark/95 backdrop-blur-xl z-20">
                    {/* Context Tabs */}
                    <div className="flex border-b border-white/5 shrink-0">
                        <button className="flex-1 py-4 text-sm font-bold border-b-2 border-primary text-white">Research</button>
                        <button className="flex-1 py-4 text-sm font-bold border-b-2 border-transparent text-gray-500 hover:text-gray-300">AI Chat</button>
                        <button className="flex-1 py-4 text-sm font-bold border-b-2 border-transparent text-gray-500 hover:text-gray-300">Diagrams</button>
                    </div>

                    {/* Smart Search */}
                    <div className="p-4 border-b border-white/5 shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search references..."
                                className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm outline-none focus:border-primary/50 text-gray-300 placeholder-gray-600"
                            />
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">

                        {/* Deep Research Promo */}
                        <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-white/5 rounded-xl p-4 relative overflow-hidden group hover:border-primary/30 transition-colors cursor-pointer">
                            <div className="absolute right-0 top-0 w-20 h-20 bg-primary/20 blur-2xl rounded-full -mr-10 -mt-10"></div>
                            <div className="flex items-center gap-2 mb-2">
                                <BrainCircuit className="w-4 h-4 text-primary" />
                                <span className="text-xs font-bold text-primary uppercase tracking-wider">Research Agent</span>
                            </div>
                            <h3 className="font-bold text-sm mb-1 text-white">Deep Dive Needed?</h3>
                            <p className="text-xs text-gray-400 leading-relaxed mb-3">Let AI scan web sources and academic papers to find facts for this chapter.</p>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-white bg-primary px-2 py-1 rounded w-fit">
                                Start Job <ArrowRight className="w-3 h-3" />
                            </div>
                        </div>

                        {/* Reference List */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Saved Sources</h3>

                            {/* Source Item 1 */}
                            <div className="bg-white/5 p-3 rounded-lg flex gap-3 hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/5">
                                <div className="w-8 h-8 rounded bg-red-500/20 flex items-center justify-center shrink-0">
                                    <FileText className="w-4 h-4 text-red-400" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-200 line-clamp-1">Lagos_Urban_Planning.pdf</h4>
                                    <p className="text-[10px] text-gray-500 mt-1">Page 4 • "Waste generation stats"</p>
                                </div>
                            </div>

                            {/* Source Item 2 */}
                            <div className="bg-white/5 p-3 rounded-lg flex gap-3 hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/5">
                                <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center shrink-0">
                                    <Globe className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-200 line-clamp-1">IEEE Smart Cities Survey</h4>
                                    <p className="text-[10px] text-gray-500 mt-1">Web Link • Cited 12 times</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </aside>
            </div>
        );
    }

    // Mobile Layout
    return (
        <div className="flex flex-col min-h-screen bg-dark text-white font-sans">
            <header className="fixed top-0 w-full z-40 px-6 pt-6 pb-4 flex justify-between items-start bg-gradient-to-b from-dark via-dark/80 to-transparent pointer-events-none">
                <div className="flex flex-col pointer-events-auto mt-2">
                    <span className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">Project Workspace</span>
                    <h1 className="font-display font-bold text-2xl leading-tight text-white line-clamp-2 max-w-[200px]">{projectTitle || "Workspace"}</h1>
                </div>
                <div className="pointer-events-auto mt-2 shrink-0">
                    <SaveStatusBadge />
                </div>
            </header>

            <main className="flex-1 relative">
                <MobileTimelineView
                    chapters={chapters}
                    onChapterClick={(id) => {
                        // Find chapter by ID and set as active
                        const clickedChapter = chapters.find(c => c.id === id);
                        if (clickedChapter) {
                            setActiveChapterNumber(clickedChapter.number);
                            setMobileView('editor');
                        }
                    }}
                />
            </main>

            <MobileFloatingNav />

            {/* Editor Overlay */}
            {mobileView === 'editor' && activeChapter && (
                <SectionEditor
                    title={`Chapter ${activeChapter.number}`}
                    content={activeChapter.content}
                    wordCount={activeChapter.wordCount}
                    onClose={() => setMobileView('timeline')}
                    onSave={(content) => {
                        handleSave(content);
                        setMobileView('timeline');
                    }}
                />
            )}
        </div>
    );
}
