'use client';

import { MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Mock history for now, or fetch from API
const history = [
    { id: '1', title: 'AI Fraud Detection', date: 'Today' },
    { id: '2', title: 'SaaS Builder Platform', date: 'Yesterday' },
];

export function ChatHistory() {
    return (
        <aside className="w-64 border-r border-white/5 bg-dark/50 hidden lg:flex flex-col">
            <div className="p-4">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/20 hover:border-primary/50 group">
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    <span className="font-display font-bold text-sm">New Chat</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 space-y-4">
                <div className="px-2">
                    <h3 className="text-xs font-mono uppercase text-gray-500 mb-2">Recent</h3>
                    <div className="space-y-1">
                        {history.map(chat => (
                            <Link
                                key={chat.id}
                                href={`/project/chat/${chat.id}`}
                                className="block px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-gray-300 hover:text-white transition-colors truncate"
                            >
                                {chat.title}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent"></div>
                    <div>
                        <div className="text-sm font-bold text-white">Guest User</div>
                        <div className="text-xs text-gray-500">Sign in to save</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
