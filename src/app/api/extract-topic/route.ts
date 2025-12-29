import { NextRequest, NextResponse } from 'next/server';
import { extractTopicFromConversation } from '@/features/bot/services/topicExtractor';
import { z } from 'zod';

const requestSchema = z.object({
    messages: z.array(z.object({
        role: z.string(),
        content: z.string(),
    })).min(1),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = requestSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        const extracted = await extractTopicFromConversation(validation.data.messages);

        if (!extracted) {
            return NextResponse.json({
                topic: 'Project Topic',
                twist: 'Unique Approach',
                department: 'Computer Science',
                complexity: 3,
            });
        }

        return NextResponse.json(extracted);
    } catch (error) {
        console.error('[ExtractTopic API] Error:', error);
        return NextResponse.json({
            topic: 'Project Topic',
            twist: 'Unique Approach',
            department: 'Computer Science',
            complexity: 3,
        });
    }
}
