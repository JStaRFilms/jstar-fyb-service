/**
 * Shared types for Chat Flow hooks
 */

export interface Message {
    id: string;
    role: "ai" | "user";
    content: React.ReactNode;
    toolInvocations?: any[];
    timestamp: string;
}

export type ChatState = "INITIAL" | "ANALYZING" | "PROPOSAL" | "NEGOTIATION" | "CLOSING" | "COMPLETED";

export interface ConfirmedTopic {
    topic: string;
    twist: string;
}

export interface ChatPersistenceOptions {
    userId?: string;
    anonymousId: string;
    conversationId?: string;
}
