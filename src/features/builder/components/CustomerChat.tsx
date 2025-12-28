"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, X, Loader2 } from "lucide-react";

interface CustomerChatProps {
    projectId: string;
}

type Message = {
    id: string;
    role: string;
    content: string;
    createdAt: Date;
};

export function CustomerChat({ projectId }: CustomerChatProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch messages on mount
    useEffect(() => {
        if (isOpen) {
            fetchMessages();
        }
    }, [isOpen, projectId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/messages`);
            const data = await res.json();
            setMessages(data.messages || []);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    };

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        setIsLoading(true);
        const tempMsg: Message = {
            id: Date.now().toString(),
            role: "customer",
            content: newMessage,
            createdAt: new Date()
        };
        setMessages([...messages, tempMsg]);
        setNewMessage("");

        try {
            await fetch(`/api/projects/${projectId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: "customer", content: newMessage })
            });
        } catch (error) {
            console.error("Failed to send message:", error);
        }

        setIsLoading(false);
    };

    return (
        <>
            {/* Floating Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-primary rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-110 transition-transform z-50"
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <MessageCircle className="w-6 h-6 text-white" />
                )}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-80 h-[450px] bg-dark border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50">
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 bg-white/5">
                        <h3 className="font-bold text-white">Chat with J-Star</h3>
                        <p className="text-xs text-gray-500">We typically reply within a few hours</p>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.length === 0 ? (
                            <p className="text-center text-gray-500 text-sm py-8">
                                No messages yet. Say hi! 👋
                            </p>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === "customer"
                                            ? "ml-auto bg-primary text-white"
                                            : "bg-white/10 text-gray-300"
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-white/5">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Type a message..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !newMessage.trim()}
                                className="p-2 bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                ) : (
                                    <Send className="w-4 h-4 text-white" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
