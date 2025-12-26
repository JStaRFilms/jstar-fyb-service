'use server';

import { prisma } from '@/lib/prisma';
import { CoreMessage } from 'ai';
import { z } from 'zod';

// Input validation schema
const saveConversationSchema = z.object({
    conversationId: z.string().uuid().optional(),
    anonymousId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    messages: z.array(z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.union([z.string(), z.array(z.any())]), // CoreMessage content can be string | Part[]
    })).min(1, 'Messages array cannot be empty'),
}).refine(
    (data) => {
        // Either conversationId is provided, OR at least one identifier (anonymousId/userId)
        const hasConversationId = !!data.conversationId;
        const hasIdentifier = !!data.anonymousId || !!data.userId;
        return hasConversationId || hasIdentifier;
    },
    { message: 'Either conversationId or at least one of anonymousId/userId must be provided' }
);

type SaveConversationParams = {
    conversationId?: string;
    anonymousId?: string; // For guest users
    userId?: string;      // For auth users (future)
    messages: CoreMessage[];
};

// Helper to safely serialize CoreMessage content
function serializeMessageContent(content: string | any[]): string {
    if (typeof content === 'string') {
        return content;
    }
    if (Array.isArray(content)) {
        // For multipart content (text + images, etc.), extract text parts
        return content
            .map(part => typeof part === 'string' ? part : part.text || '')
            .join(' ')
            .trim();
    }
    return JSON.stringify(content);
}

export async function saveConversation({
    conversationId,
    anonymousId,
    userId,
    messages,
}: SaveConversationParams) {
    try {
        // Validate inputs
        const validation = saveConversationSchema.safeParse({
            conversationId,
            anonymousId,
            userId,
            messages,
        });

        if (!validation.success) {
            console.error('Validation failed:', validation.error);
            return { success: false, error: 'Invalid input parameters' };
        }

        // 1. Identification Strategy
        // We need either a conversationId (existing) or an anonymousId/userId (new)

        // Find or Create Conversation
        let conversation;

        try {
            if (conversationId) {
                conversation = await prisma.conversation.findUnique({
                    where: { id: conversationId },
                });
            }
        } catch (error) {
            console.error('[saveConversation] Failed to find conversation:', error);
            return { success: false, error: 'Failed to retrieve conversation' };
        }

        if (!conversation) {
            try {
                const firstMessageContent = serializeMessageContent(messages[0]?.content || '');
                conversation = await prisma.conversation.create({
                    data: {
                        anonymousId,
                        userId,
                        title: firstMessageContent.slice(0, 50) || 'New Chat',
                    },
                });
            } catch (error) {
                console.error('[saveConversation] Failed to create conversation:', error);
                return { success: false, error: 'Failed to create conversation' };
            }
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

        try {
            await prisma.message.deleteMany({
                where: { conversationId: conversation.id },
            });
        } catch (error) {
            console.error('[saveConversation] Failed to delete old messages:', error);
            return { success: false, error: 'Failed to update conversation history' };
        }

        try {
            await prisma.message.createMany({
                data: messages.map((m) => ({
                    conversationId: conversation.id,
                    role: m.role,
                    content: serializeMessageContent(m.content), // Safe serialization
                })),
            });
        } catch (error) {
            console.error('[saveConversation] Failed to save messages:', error);
            return { success: false, error: 'Failed to save messages' };
        }

        return { success: true, conversationId: conversation.id };
    } catch (error) {
        console.error('[saveConversation] Unexpected error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

export async function getConversation(conversationId: string) {
    return await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: true }
    });
}

export async function mergeAnonymousConversations(anonymousId: string, userId: string) {
    try {
        await prisma.conversation.updateMany({
            where: { anonymousId: anonymousId, userId: null },
            data: { userId: userId },
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to merge chats:', error);
        return { success: false, error };
    }
}
