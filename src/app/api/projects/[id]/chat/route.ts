import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const maxDuration = 300;

// Validate environment variables
const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
    throw new Error('GROQ_API_KEY environment variable is required');
}

// Create Groq provider using OpenAI SDK compatibility
const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: groqApiKey,
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = await params;
    const body = await req.json();
    const { messages, conversationId } = body;

    // 1. Fetch Project
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { outline: true }
    });

    if (!project) {
        return new Response('Project not found', { status: 404 });
    }

    // 2. Resolve Conversation ID
    let activeConversationId = conversationId;
    if (!activeConversationId) {
        const conv = await prisma.projectConversation.create({
            data: { projectId }
        });
        activeConversationId = conv.id;
    }

    // 3. Prepare Context
    const outlineData = project.outline?.content
        ? (typeof project.outline.content === 'string' ? project.outline.content : JSON.stringify(project.outline.content))
        : 'No outline available';

    const systemPrompt = `You are an AI assistant for a Final Year Project.

## Project Context
- **Topic:** ${project.topic}
- **Twist:** ${project.twist || 'None'}
- **Abstract:** ${project.abstract || 'Not generated yet'}

## Generated Outline/Chapters
${outlineData}

## Your Role
- Help the student write, refine, and improve their project
- Answer questions about academic writing and formatting
- Suggest improvements to existing content
- Be encouraging but maintain academic standards
`;

    // 4. Stream Response
    // We map messages manually to avoid import issues
    const coreMessages = messages.map((m: any) => ({
        role: m.role,
        content: m.content
    }));

    const result = streamText({
        model: groq('openai/gpt-oss-120b'),
        system: systemPrompt,
        messages: coreMessages,
        onFinish: async ({ text }) => {
            // Save User Message (last one)
            // Note: 'messages' from client includes history. We only strictly need to save the new ones if we aren't saving them incrementally.
            // Strategy: We save the *last* user message sent in this request, and the assistant response.
            const lastUserMessage = messages[messages.length - 1];
            if (lastUserMessage && lastUserMessage.role === 'user') {
                await prisma.projectChatMessage.create({
                    data: {
                        conversationId: activeConversationId,
                        role: 'user',
                        content: lastUserMessage.content
                    }
                });
            }

            // Save Assistant Message
            await prisma.projectChatMessage.create({
                data: {
                    conversationId: activeConversationId,
                    role: 'assistant',
                    content: text
                }
            });
        },
    });

    // We can't return StreamData easily without the class, but we can return headers if needed.
    // For now, we return the simple stream. Client will get the text.
    return result.toTextStreamResponse(); // streamText result can produce DataStreamResponse
}
