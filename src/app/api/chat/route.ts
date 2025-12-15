import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, tool, UIMessage } from 'ai';
import { z } from 'zod';
import { saveConversation } from '@/features/bot/actions/chat';

// Create Groq provider using OpenAI compatibility
const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Helper to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry wrapper for streamText
async function streamTextWithRetry(
    config: Parameters<typeof streamText>[0],
    retries = MAX_RETRIES
): Promise<ReturnType<typeof streamText>> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const result = streamText(config);
            return result;
        } catch (error) {
            lastError = error as Error;
            console.error(`[Chat API] Attempt ${attempt}/${retries} failed:`, error);

            if (attempt < retries) {
                // Exponential backoff: 1s, 2s, 4s...
                const waitTime = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
                console.log(`[Chat API] Retrying in ${waitTime}ms...`);
                await delay(waitTime);
            }
        }
    }

    throw lastError || new Error('All retry attempts failed');
}

export async function POST(req: Request) {
    try {
        const { messages, conversationId, anonymousId }: { messages: UIMessage[], conversationId?: string, anonymousId?: string } = await req.json();

        const modelMessages = convertToModelMessages(messages);

        const result = await streamTextWithRetry({
            model: groq('moonshotai/kimi-k2-instruct-0905'),
            system: `You are Jay, an elite Project Consultant for a high-end agency.
        
        Your Goal:
        1. Help students find a unique "twist" for their Final Year Project.
        2. Be charismatic, professional, but slightly edgy ("VibeCoder" style).
        3. Reject boring ideas. Suggest complex, impressive ones.
        4. Start small, then upsell the complexity.
        
        Persuade them that they need a "SaaS" or "AI" component.
        
        IMPORTANT: Always respond with something meaningful. Never leave a response blank.
        `,
            messages: modelMessages,
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
                if (conversationId && text) {
                    await saveConversation({
                        conversationId,
                        messages: [
                            ...modelMessages,
                            { role: 'assistant', content: text }
                        ]
                    });
                }
            },
        });

        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error('[Chat API] Fatal error after retries:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to generate response. Please try again.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
