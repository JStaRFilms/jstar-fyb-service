import { createGroq } from '@ai-sdk/groq';
import { streamText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { saveConversation } from '@/features/bot/actions/chat';
import { SYSTEM_PROMPT } from '@/features/bot/prompts/system';

// Validate environment variables
const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
    throw new Error('GROQ_API_KEY environment variable is required');
}

// Create Groq provider (using dedicated @ai-sdk/groq for proper compatibility)
const groq = createGroq({
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

// Input validation schema with security limits
const MAX_MESSAGE_LENGTH = 10000; // Prevent excessively long inputs
const MAX_MESSAGES = 50; // Limit history size per request

const chatSchema = z.object({
    messages: z.array(z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.union([
            z.string().max(MAX_MESSAGE_LENGTH),
            z.array(z.any())
        ]),
        parts: z.array(z.any()).optional()
    })).min(1).max(MAX_MESSAGES),
    conversationId: z.string().uuid().optional(),
    anonymousId: z.string().optional()
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validation = chatSchema.safeParse(body);

        if (!validation.success) {
            console.error('[Chat API] Validation failed:', JSON.stringify(validation.error.format(), null, 2));
            console.error('[Chat API] Request Body:', JSON.stringify(body, null, 2));
            return new Response(JSON.stringify({ error: 'Invalid input', details: validation.error }), { status: 400 });
        }

        const { messages, conversationId, anonymousId } = validation.data;

        // Defensive check: ensure messages is a valid array before converting
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            console.error('[Chat API] Invalid messages array:', messages);
            return new Response(JSON.stringify({ error: 'Messages array is required and must not be empty' }), { status: 400 });
        }

        // Safely convert messages to model format
        // Handle text content, tool calls, and tool results
        const modelMessages = messages.map((m: any) => {
            // Extract text content from parts or content
            let textContent = '';

            if (m.parts && Array.isArray(m.parts)) {
                // Collect all text parts
                const textParts: string[] = [];

                for (const part of m.parts) {
                    if (part.type === 'text' && part.text) {
                        textParts.push(part.text);
                    }
                    // Convert tool results to readable text (so context is preserved)
                    else if (part.type === 'tool-result' && part.result) {
                        // Don't include tool results in history - they create issues with Groq
                        // The AI already knows what tools it called from context
                    }
                    // Skip tool invocations entirely - Groq can't process them
                }

                textContent = textParts.join('\n').trim();
            } else if (typeof m.content === 'string') {
                textContent = m.content;
            }

            return {
                role: m.role as 'user' | 'assistant' | 'system',
                content: textContent
            };
        }).filter((m: any) => m.content && m.content.trim() !== ''); // Remove empty messages

        // Debug: Log summary (not full history)
        console.log(`[Chat API] Processing ${modelMessages.length} messages. Last: "${modelMessages[modelMessages.length - 1]?.content?.slice(0, 50)}..."`);

        const result = await streamTextWithRetry({
            // FIX 1: Use Llama 3.3 70B (Best for Tool Calling on Groq)
            model: groq('moonshotai/kimi-k2-instruct-0905'),

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