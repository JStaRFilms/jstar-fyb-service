import { createGroq } from '@ai-sdk/groq';
import { streamText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { saveConversation } from '@/features/bot/actions/chat';
import { SYSTEM_PROMPT } from '@/features/bot/prompts/system';
import { validateService, getEnv } from '@/lib/env-validation';

// Validate AI service configuration at startup
if (!validateService('ai')) {
    throw new Error('AI service configuration is missing. Please set GROQ_API_KEY environment variable.');
}

// Get validated environment variables
const env = getEnv();

// Create Groq provider (using dedicated @ai-sdk/groq for proper compatibility)
const groq = createGroq({
    apiKey: env.GROQ_API_KEY,
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

/**
 * CRITICAL SECURITY FIX: Enhanced sanitize user input to prevent injection attacks
 */
function sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
        return '';
    }

    // CRITICAL SECURITY FIX: Comprehensive input sanitization
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: URLs
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .replace(/[<>]/g, '') // Remove HTML tags
        .replace(/data:\s*text\/html/gi, '') // Remove data URLs
        .replace(/vbscript:/gi, '') // Remove vbscript
        .replace(/file:\s*\/\//gi, '') // Remove file:// URLs
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .trim();
}

/**
 * CRITICAL SECURITY FIX: Enhanced validate and sanitize message content
 */
function validateAndSanitizeMessage(message: any): string {
    let content = '';

    try {
        if (message && typeof message === 'object') {
            if (message.content && typeof message.content === 'string') {
                content = message.content;
            } else if (message.parts && Array.isArray(message.parts)) {
                // CRITICAL SECURITY FIX: Extract text from parts with validation
                const textParts: string[] = [];
                for (const part of message.parts) {
                    if (part && typeof part === 'object' && part.type === 'text' && part.text && typeof part.text === 'string') {
                        textParts.push(part.text);
                    }
                }
                content = textParts.join(' ');
            }
        } else if (typeof message === 'string') {
            content = message;
        }

        // CRITICAL SECURITY FIX: Sanitize the content and limit length
        const sanitized = sanitizeInput(content);

        // CRITICAL SECURITY FIX: Additional length validation
        if (sanitized.length > MAX_MESSAGE_LENGTH) {
            return sanitized.slice(0, MAX_MESSAGE_LENGTH);
        }

        return sanitized;
    } catch (error) {
        console.error('[Chat API] Message sanitization failed:', error);
        return '';
    }
}

// AI SDK v5 message format: uses `parts` array, content is optional/deprecated
const chatSchema = z.object({
    messages: z.array(z.object({
        id: z.string().optional(),
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().max(MAX_MESSAGE_LENGTH).optional(), // Optional in v5
        parts: z.array(z.any()).optional(), // Primary format in v5
    })).min(1).max(MAX_MESSAGES),
    conversationId: z.string().uuid().optional(),
    anonymousId: z.string().optional(),
    userId: z.string().uuid().optional(), // Authenticated User ID
    id: z.string().optional(), // Conversation ID from useChat
    trigger: z.string().optional(), // AI SDK internal
}).passthrough(); // Allow additional fields from AI SDK

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validation = chatSchema.safeParse(body);

        if (!validation.success) {
            console.error('[Chat API] Validation failed:', JSON.stringify(validation.error.format(), null, 2));
            console.error('[Chat API] Request Body:', JSON.stringify(body, null, 2));
            return new Response(JSON.stringify({ error: 'Invalid input', details: validation.error }), { status: 400 });
        }

        const { messages, conversationId, anonymousId, id, userId } = validation.data;

        // Fallback for identification
        const effectiveAnonymousId = anonymousId || id || `sdk-${Date.now()}`;

        // Defensive check: ensure messages is a valid array before converting
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            console.error('[Chat API] Invalid messages array:', messages);
            return new Response(JSON.stringify({ error: 'Messages array is required and must not be empty' }), { status: 400 });
        }

        // Safely convert messages to model format with sanitization
        // Handle text content, tool calls, and tool results
        const modelMessages = messages.map((m: any) => {
            // Extract and sanitize text content
            const textContent = validateAndSanitizeMessage(m);

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
                // Client-side persistence model:
                // The API is now stateless. The client (useChatFlow) handles saving via Server Actions
                // after the stream completes.
            },
        });

        return result.toUIMessageStreamResponse();
    } catch (error: any) {
        console.error('[Chat API] Fatal error after retries:', error);

        // Detect tool call validation errors and provide graceful recovery
        const errorMessage = error?.message || '';
        const isToolCallError =
            errorMessage.includes('tool call validation failed') ||
            errorMessage.includes('Failed to call a function') ||
            errorMessage.includes('did not match schema');

        if (isToolCallError) {
            console.warn('[Chat API] Tool call failed, returning recovery message');
            // Return a text stream with a recovery message so the user can retry
            const recoveryText = "Oops! I got a bit confused there. Let me try again — could you repeat what you'd like to do? If you've already shared your WhatsApp, you can click \"Proceed to Builder\" below to continue!";

            return new Response(
                JSON.stringify({
                    error: recoveryText,
                    recoverable: true
                }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ error: 'Jay is currently offline (System Overload). Please try again.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
