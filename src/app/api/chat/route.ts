import { createOpenAI } from '@ai-sdk/openai';
import { convertToCoreMessages, streamText, tool } from 'ai';
import { z } from 'zod';
import { saveConversation } from '@/features/bot/actions/chat';

// Create Groq provider using OpenAI compatibility
const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages, conversationId, anonymousId } = await req.json();

    const coreMessages = convertToCoreMessages(messages);

    const result = streamText({
        model: groq('moonshotai/kimi-k2-instruct-0905'), // User requested "Jay" -> Groq is fast.
        system: `You are Jay, an elite Project Consultant for a high-end agency.
    
    Your Goal:
    1. Help students find a unique "twist" for their Final Year Project.
    2. Be charismatic, professional, but slightly edgy ("VibeCoder" style).
    3. Reject boring ideas. Suggest complex, impressive ones.
    4. Start small, then upsell the complexity.
    
    Persuade them that they need a "SaaS" or "AI" component.
    `,
        messages: coreMessages,
        tools: {
            suggestTopics: tool({
                description: 'Suggest 3 unique project topics with twists.',
                inputSchema: z.object({
                    topics: z.array(z.object({
                        title: z.string(),
                        twist: z.string(),
                        difficulty: z.enum(['Medium', 'Hard', 'Insane']),
                    })),
                }),
            }),
        },
        onFinish: async ({ text, toolCalls }) => {
            // Async save to DB (fire and forget for speed)
            // handling both user and assistant messages is complex in onFinish
            // Simplification: Client sends message -> Save User Message -> Stream -> Save Assistant Message
            // But for now, let's just use the server action for explicit saving or periodic sync.
            // Actually, standard practice: Save conversation on completion.

            if (conversationId) {
                await saveConversation({
                    conversationId,
                    messages: [
                        ...coreMessages,
                        { role: 'assistant', content: text }
                    ]
                });
            }
        },
    });

    return result.toUIMessageStreamResponse();
}
