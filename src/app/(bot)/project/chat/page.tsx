import { ArrowLeft, Bot, User, Check, Mic, Plus, SendHorizontal } from "lucide-react";
import Link from "next/link";

export default function ChatPage() {
    return (
        <div className="bg-dark h-[100dvh] font-sans text-white flex flex-col overflow-hidden">
            {/* Header: Mobile Optimized */}
            <header className="h-16 flex items-center justify-between px-4 border-b border-white/5 bg-dark/80 backdrop-blur-md z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <Link href="/" className="p-2 rounded-full hover:bg-white/5 text-gray-400">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-display font-bold text-lg tracking-wide">Project Consultant</h1>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs text-gray-400 font-mono">Topia AI Active</span>
                        </div>
                    </div>
                </div>

                {/* Complexity Meter Widget */}
                <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <span className="text-xs text-gray-400 font-mono uppercase">Complexity</span>
                    <div className="flex gap-1">
                        <div className="w-2 h-4 rounded-sm bg-green-500"></div>
                        <div className="w-2 h-4 rounded-sm bg-green-500"></div>
                        <div className="w-2 h-4 rounded-sm bg-yellow-500"></div>
                        <div className="w-2 h-4 rounded-sm bg-white/10"></div>
                        <div className="w-2 h-4 rounded-sm bg-white/10"></div>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth pb-32">
                {/* AI Welcome */}
                <div className="flex gap-4 max-w-2xl">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                        <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <div className="px-5 py-4 glass-panel rounded-tr-3xl rounded-br-3xl rounded-bl-3xl text-gray-200 leading-relaxed shadow-lg">
                            <p>Scanning academic trends... 🤖</p>
                            <p className="mt-2">I&apos;m your Project Consultant. Tell me, what&apos;s your department and what kind of &quot;vibe&quot; do you want for your project? (e.g., &quot;Computer Science, something with AI but not too hard&quot;)</p>
                        </div>
                        <span className="text-xs text-gray-500 ml-2">10:42 AM</span>
                    </div>
                </div>

                {/* User Reply */}
                <div className="flex gap-4 max-w-2xl ml-auto flex-row-reverse">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0 border border-accent/30">
                        <User className="w-5 h-5 text-accent" />
                    </div>
                    <div className="space-y-2">
                        <div className="px-5 py-4 glass-panel bg-accent/5 rounded-tl-3xl rounded-bl-3xl rounded-br-3xl text-white leading-relaxed shadow-lg border-accent/20">
                            <p>I&apos;m in Computer Science. I want something cool with Crypto but I don&apos;t want to fail.</p>
                        </div>
                        <span className="text-xs text-gray-500 mr-2 text-right block">10:43 AM</span>
                    </div>
                </div>

                {/* AI Suggestion + Logic */}
                <div className="flex gap-4 max-w-2xl">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                        <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-4 w-full">
                        <div className="px-5 py-4 glass-panel rounded-tr-3xl rounded-br-3xl rounded-bl-3xl text-gray-200 leading-relaxed shadow-lg">
                            <p>Crypto is risky if you don&apos;t know Solidity. How about we <strong>twist</strong> it?</p>
                            <p className="mt-2">Instead of a full Exchange, let&apos;s build a <span className="text-accent font-bold">&quot;Blockchain-Based Fake News Detector&quot;</span>.</p>
                            <ul className="mt-3 space-y-2 text-sm">
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Easy Code (Hashing logic)</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Sounds Complex (Impresses Lecturers)</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Modern Topic</li>
                            </ul>
                        </div>

                        {/* Interactive Chips */}
                        <div className="flex flex-wrap gap-2">
                            <button className="px-4 py-2 rounded-full glass-panel hover:bg-primary/20 border border-white/10 text-xs font-mono uppercase tracking-wide hover:border-primary transition-all">
                                Accept topic
                            </button>
                            <button className="px-4 py-2 rounded-full glass-panel hover:bg-accent/20 border border-white/10 text-xs font-mono uppercase tracking-wide hover:border-accent transition-all">
                                Make it simpler
                            </button>
                            <button className="px-4 py-2 rounded-full glass-panel hover:bg-red-500/20 border border-white/10 text-xs font-mono uppercase tracking-wide hover:border-red-500 transition-all">
                                Too boring
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Complexity Meter (Inline) */}
                <div className="md:hidden flex items-center justify-between p-3 rounded-lg bg-white/5 mt-4 mx-2">
                    <span className="text-xs text-muted uppercase">Project Complexity</span>
                    <div className="flex gap-1">
                        <div className="w-2 h-3 rounded-sm bg-green-500"></div>
                        <div className="w-2 h-3 rounded-sm bg-green-500"></div>
                        <div className="w-2 h-3 rounded-sm bg-yellow-500"></div>
                        <div className="w-2 h-3 rounded-sm bg-white/10"></div>
                    </div>
                </div>
            </main>

            {/* Input Area */}
            <footer className="p-4 bg-dark/80 backdrop-blur-xl border-t border-white/5 shrink-0 z-30">
                <form className="flex gap-3 relative max-w-4xl mx-auto">
                    <button type="button" className="p-4 rounded-xl glass-panel text-gray-400 hover:text-white transition-colors md:hidden">
                        <Plus className="w-6 h-6" />
                    </button>
                    <div className="flex-1 relative">
                        <input type="text" placeholder="Type your reply..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all font-light" />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
                            <Mic className="w-5 h-5" />
                        </button>
                    </div>
                    <button type="submit" className="p-4 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all hover:scale-105">
                        <SendHorizontal className="w-6 h-6" />
                    </button>
                </form>
            </footer>
        </div>
    );
}
