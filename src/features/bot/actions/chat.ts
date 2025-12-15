'use server';

import { prisma } from '@/lib/prisma';
import { CoreMessage } from 'ai';

type SaveConversationParams = {
    conversationId?: string;
    anonymousId?: string; // For guest users
    userId?: string;      // For auth users (future)
    messages: CoreMessage[];
};

export async function saveConversation({
    conversationId,
    anonymousId,
    userId,
    messages,
}: SaveConversationParams) {
    try {
        // 1. Identification Strategy
        // We need either a conversationId (existing) or an anonymousId/userId (new)

        // Find or Create Conversation
        let conversation;

        if (conversationId) {
            conversation = await prisma.conversation.findUnique({
                where: { id: conversationId },
            });
        }

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    anonymousId,
                    userId,
                    title: messages[0]?.content?.toString().slice(0, 50) || 'New Chat',
                },
            });
        }

        // 2. Sync Messages
        // This is a naive "sync all" approach. For production, diffing/appending is better.
        // For now, we'll just ensure the last message is saved to avoid duplicates if possible,
        // OR just delete all and re-save (inefficient but safe for MVP).
        // BETTER: Just append the new ones. But we receive the whole history.

        // Let's implement an "Append Only" strategy request from client? 
        // No, client usually sends full history.

        // Efficient Strategy:
        // Delete all messages for this conversation and re-insert. (Safe, simple, fast enough for < 100 msgs)

        await prisma.message.deleteMany({
            where: { conversationId: conversation.id },
        });

        await prisma.message.createMany({
            data: messages.map((m) => ({
                conversationId: conversation.id,
                role: m.role,
                content: m.content as string, // handling text only for now
            })),
        });

        return { success: true, conversationId: conversation.id };
    } catch (error) {
        console.error('Failed to save chat:', error);
        return { success: false, error };
    }
}

export async function getConversation(conversationId: string) {
    return await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: true }
    });
}
