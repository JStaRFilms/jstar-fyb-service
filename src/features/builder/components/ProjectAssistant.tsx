// @ts-nocheck
'use client';

import { useChat } from '@ai-sdk/react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function ProjectAssistant({ projectId }: { projectId: string }) {
    const chatHelpers: any = useChat({
        api: `/api/projects/${projectId}/chat`,
        onError: (e) => {
            console.error('[ProjectAssistant] Chat error:', e);
            alert('Failed to send message: ' + e.message);
        },
        onFinish: (message) => {
            console.log('[ProjectAssistant] Stream finished:', message);
        }
    });
    // Destructure what we can, and fallback manually
    const { messages, isLoading, append } = chatHelpers;

    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        console.log('[ProjectAssistant] Sending message:', userMessage);
        setInput(''); // Clear input immediately

        try {
            await append({
                role: 'user',
                content: userMessage,
            });
            console.log('[ProjectAssistant] Append successful');
        } catch (err) {
            console.error('[ProjectAssistant] Append failed:', err);
            alert('Failed to send message');
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[600px] w-full">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-400" />
                <div>
                    <h3 className="font-bold text-white text-sm">Project Copilot</h3>
                    <p className="text-xs text-gray-400">Context-aware AI Assistant</p>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        <Bot className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p>I know your project details.</p>
                        <p className="text-xs mt-1 opacity-70">Ask me to write a section, improve your abstract, or explain a concept.</p>
                    </div>
                )}

                {messages.map((m: any) => (
                    <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                            }`}>
                            {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${m.role === 'user' ? 'bg-blue-500/10 text-blue-100 rounded-tr-sm' : 'bg-white/10 text-gray-200 rounded-tl-sm'
                            }`}>
                            {m.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                            <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 text-gray-400 text-xs flex items-center">
                            Thinking...
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-white/5">
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your project..."
                        className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="p-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}
