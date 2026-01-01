import { createGroq } from '@ai-sdk/groq';
import { generateObject } from 'ai';
import { z } from 'zod';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

const extractionSchema = z.object({
    topic: z.string().describe('The main project topic discussed'),
    twist: z.string().describe('The unique angle or feature that makes it special'),
    department: z.string().describe('The academic department (e.g., Computer Science, Engineering)'),
    complexity: z.coerce.number().min(1).max(5).describe('Complexity level 1-5'),
});

export type ExtractedTopic = z.infer<typeof extractionSchema>;

/**
 * Extracts structured topic data from a conversation history.
 * Uses a lightweight LLM call with structured output.
 */
export async function extractTopicFromConversation(
    messages: { role: string; content: string }[]
): Promise<ExtractedTopic | null> {
    try {
        // Filter to only meaningful messages
        const relevantMessages = messages
            .filter(m => m.content && m.content.trim() !== '')
            .slice(-10) // Only last 10 messages for context
            .map(m => `${m.role}: ${m.content}`)
            .join('\n');

        if (!relevantMessages) {
            return null;
        }

        const { object } = await generateObject({
            model: groq('openai/gpt-oss-20b'), // Fast & cheap model for extraction
            schema: extractionSchema,
            prompt: `You are analyzing a conversation between a student and an AI assistant about a final year project.

CONVERSATION:
${relevantMessages}

Extract the following from this conversation:
1. The main project TOPIC they agreed on
2. The unique TWIST or special feature
3. Their academic DEPARTMENT
4. The project COMPLEXITY (1=easy, 5=very hard)

If any field is unclear, make your best guess based on context. Never leave fields empty.`,
        });

        console.log('[TopicExtractor] Extracted:', object);
        return object;
    } catch (error) {
        console.error('[TopicExtractor] Failed:', error);
        return null;
    }
}
