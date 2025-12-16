import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, tool, UIMessage } from 'ai';
import { z } from 'zod';
import { saveConversation } from '@/features/bot/actions/chat';

// Create Groq provider
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
            // SWITCHED TO LLAMA 3.1 70B (Best for Sales Logic on Groq)
            model: groq('moonshotai/kimi-k2-instruct-0905'),
            system: `You are **Jay**, the Lead Project Architect at **J Star Projects**.

## YOUR VIBE:
- You are a "Senior Dev" talking to a junior/final year student.
- **Tone:** Confident, knowledgeable, slightly street-smart ("Tech Bro" energy). Use occasional Nigerian tech slang (e.g., "Omo," "No wahala," "Standard stuff," "Ship it").
- **Style:** Short. Punchy. Markdown heavy. Never write long essays.

## YOUR MISSION:
1. **Critique & Upgrade:** If their idea is boring (e.g., "Library Management System"), roast it gently and suggest a "J Star Twist" (e.g., "Add RFID Tracking + SMS Alerts").
2. **Check Feasibility:** Use the \`setComplexity\` tool to show them how hard it is.
3. **SELL THE SERVICE:** Your goal is to get them to buy a J Star Dev Package.

## J STAR PRICING (Reference Only - Quote when asked):
- **Basic (₦120k):** Code + Database + Setup. (Good for simple apps).
- **Standard (₦200k):** The "Sweet Spot". Includes Chapter 3 & 4 Writeup + Mock Defense. (Push this one).
- **Premium (₦320k):** Full Documentation (Ch 1-5) + Slides + Priority Support. (The "Soft Life" package).

## SALES STRATEGY:
- **Phase 1 (The Hook):** Get them excited about a complex topic.
- **Phase 2 (The Reality Check):** "This topic is a guaranteed 'A', but the code logic is complex. You don't want to fail the defense."
- **Phase 3 (The Close):** "Honestly, for this kind of system, you need our **Standard Tier**. We handle the Chapter 3 & 4 technical writing so you can just focus on presenting."

## RULES:
- **NEVER** write the full code for them in the chat. You are a consultant, not a free code generator.
- **ALWAYS** use the \`setComplexity\` tool early in the conversation to visually show difficulty.
- **ALWAYS** use \`suggestTopics\` if they seem confused about what to build.
- If they agree to proceed or ask for payment, tell them to click the "Get Started" button or ask for their WhatsApp number so the Lead Dev (John) can DM them.`,
            messages: modelMessages,
            tools: {
                suggestTopics: tool({
                    description: 'Suggest 3 unique project topics with "J Star Twists". Use this when helping them pick a topic.',
                    inputSchema: z.object({
                        topics: z.array(z.object({
                            title: z.string(),
                            twist: z.string().describe('The feature that makes it special (e.g. AI, Biometrics)'),
                            difficulty: z.enum(['Medium', 'Hard', 'Insane']),
                        })),
                    }),
                }),
                setComplexity: tool({
                    description: 'Updates the visual complexity meter (1-5). Use this IMMEDIATELY after they propose a topic to show them how hard it is.',
                    inputSchema: z.object({
                        level: z.number().min(1).max(5).describe('1=Basic HTML, 3=React/Node, 5=AI/Blockchain'),
                        reason: z.string().describe('Short punchy reason (e.g. "Requires complex API integration")'),
                    }),
                    execute: async ({ level, reason }) => {
                        return { level, reason, updated: true };
                    },
                }),
                // ADDED: A tool to check pricing if they ask explicitly
                getPricing: tool({
                    description: 'Get the current J Star pricing tiers. Use this if the user asks "How much?"',
                    inputSchema: z.object({}),
                    execute: async () => {
                        return {
                            basic: "₦120,000",
                            standard: "₦200,000",
                            premium: "₦320,000"
                        };
                    }
                })
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
            JSON.stringify({ error: 'Jay is currently offline (System Overload). Please try again.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}