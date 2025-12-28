import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, tool, UIMessage, stepCountIs } from 'ai';
import { z } from 'zod';
import { saveConversation } from '@/features/bot/actions/chat';
import { SYSTEM_PROMPT } from '@/features/bot/prompts/system';

// Validate environment variables
const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
    throw new Error('GROQ_API_KEY environment variable is required');
}

// Create Groq provider
const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: groqApiKey,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 120;

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
            const result = await streamText(config);
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

const chatSchema = z.object({
    messages: z.array(z.any()).min(1),
    conversationId: z.string().optional(),
    anonymousId: z.string().optional()
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validation = chatSchema.safeParse(body);

        // Debug validation failures
        if (!validation.success) {
            console.error('[Chat API] Validation failed:', JSON.stringify(validation.error.format(), null, 2));
            console.error('[Chat API] Request Body:', JSON.stringify(body, null, 2));
            // We continue anyway to not break the UI, but saving will fail later.
        }

        const { messages, conversationId, anonymousId } = body;

        // Cast to unknown first to satisfy strict type overlap checks for UIMessage
        const modelMessages = convertToModelMessages(messages as unknown as UIMessage[]);

        const result = await streamTextWithRetry({
            // FIX 1: Use Llama 3.3 70B (Best for Tool Calling on Groq)
            model: groq('moonshotai/kimi-k2-instruct'),

            // FIX 2: Enable multi-step (Crucial for tools to execute properly)
            stopWhen: stepCountIs(5),

            system: SYSTEM_PROMPT,
            messages: modelMessages,
            tools: {
                suggestTopics: tool({
                    description: `MANDATORY tool for suggesting project topics. You MUST call this tool when presenting topic options.
TRIGGER: After learning the user's department/course.
SYNTAX: suggestTopics({ topics: [{ title: "...", twist: "...", difficulty: "Safe Bet" | "Insane Mode" }] })
POSITIVE: User says "I study Computer Science" → Call suggestTopics with 2 options.
NEGATIVE: Never write topics as plain text. If you want to suggest topics, you MUST use this tool.`,
                    inputSchema: z.object({
                        topics: z.array(z.object({
                            title: z.string(),
                            twist: z.string().describe('The feature that makes it special'),
                            difficulty: z.enum(['Safe Bet', 'Insane Mode']),
                        })),
                    }),
                    execute: async ({ topics }) => {
                        console.log('[TOOL CALL] suggestTopics:', JSON.stringify(topics, null, 2));
                        return { topics, suggested: true };
                    },
                }),
                setComplexity: tool({
                    description: 'Updates the visual complexity meter (1-5). Use this IMMEDIATELY after they propose a topic to show them how hard it is.',
                    inputSchema: z.object({
                        level: z.number().min(1).max(5).describe('1=Basic HTML, 3=React/Node, 5=AI/Blockchain'),
                        reason: z.string().describe('Short punchy reason (e.g. "Requires complex API integration")'),
                    }),
                    execute: async ({ level, reason }) => {
                        console.log('[TOOL CALL] setComplexity:', { level, reason });
                        return { level, reason, updated: true };
                    },
                }),
                getPricing: tool({
                    description: 'Get the current J Star pricing tiers.',
                    inputSchema: z.object({}),
                    execute: async () => {
                        console.log('[TOOL CALL] getPricing: Fetching pricing tiers');
                        return {
                            basic: "₦120,000",
                            standard: "₦200,000",
                            premium: "₦320,000"
                        };
                    }
                }),
                measureConviction: tool({
                    description: 'Internal tool to track user interest (0-100). Call this when user shows interest or hesitation.',
                    inputSchema: z.object({
                        score: z.number().min(0).max(100).describe('Estimated conviction score based on user sentiment'),
                        reason: z.string().describe('Why you gave this score'),
                    }),
                    execute: async ({ score, reason }) => {
                        console.log('[TOOL CALL] measureConviction:', { score, reason });
                        return { score, reason, tracked: true };
                    }
                }),
                requestContactInfo: tool({
                    description: `MANDATORY tool to collect user's WhatsApp number.
TRIGGER: When user agrees to a topic and seems ready to proceed.
SYNTAX: requestContactInfo({ reason: "To send the architecture specs" })
POSITIVE: User says "ok let's do this" → Call requestContactInfo.
NEGATIVE: Never say "drop your WhatsApp" or "send me your number" in plain text. You MUST use this tool.`,
                    inputSchema: z.object({
                        reason: z.string().describe('Context for asking (e.g. "To send architecture")'),
                    }),
                    execute: async ({ reason }) => {
                        console.log('[TOOL CALL] requestContactInfo:', { reason });
                        return { reason, requesting: true };
                    }
                }),
                confirmTopic: tool({
                    description: `MANDATORY tool to finalize the topic after getting WhatsApp.
TRIGGER: After user provides their phone number (e.g. "08012345678").
SYNTAX: confirmTopic({ topic: "Project Title", twist: "The unique angle" })
POSITIVE: User shares phone → Call confirmTopic with the agreed topic.
NEGATIVE: Never end conversation or say "we're done" without calling this tool.`,
                    inputSchema: z.object({
                        topic: z.string().describe('The confirmed project topic title'),
                        twist: z.string().describe('The unique angle/twist'),
                    }),
                    execute: async ({ topic, twist }) => {
                        console.log('[TOOL CALL] confirmTopic:', { topic, twist });
                        return { topic, twist, confirmed: true };
                    }
                })
            },
            onFinish: async ({ text, toolCalls }) => {
                // Debug: Log what we received from the client
                console.log('[Chat API] onFinish - conversationId:', conversationId, 'anonymousId:', anonymousId);

                // Early exit if we don't have a valid identifier
                const hasValidId = (anonymousId && anonymousId.trim() !== "") || conversationId;
                if (!hasValidId) {
                    console.warn('[Chat API] Skipping save: No valid anonymousId or conversationId');
                    return;
                }

                if (text) {
                    try {
                        await saveConversation({
                            conversationId,
                            anonymousId,
                            messages: [
                                ...modelMessages,
                                { role: 'assistant', content: text }
                            ]
                        });
                    } catch (saveError) {
                        // Don't let save errors break the stream
                        console.error('[Chat API] Save failed:', saveError);
                    }
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