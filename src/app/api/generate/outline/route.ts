import { streamObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';

const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
});

export const maxDuration = 120;

const outlineSchema = z.object({
    title: z.string().describe("Refined academic title of the project"),
    chapters: z.array(z.object({
        title: z.string().describe("Chapter title (e.g., Introduction, Methodology)"),
        content: z.string().describe("Brief summary of what this chapter covers (2-3 sentences)")
    })).describe("The 5 standard chapters for a final year project")
});

export async function POST(req: Request) {
    const { topic, abstract } = await req.json();

    const result = streamObject({
        model: groq('openai/gpt-oss-120b'),
        schema: outlineSchema,
        system: `You are an expert academic curriculum designer.
    Create a 5-chapter distinction-grade project outline based on the verified abstract.
    
    Topic: ${topic}
    Abstract: ${abstract}
    
    The chapters should strictly follow standard structure:
    1. Introduction
    2. Literature Review
    3. Methodology
    4. Implementation/Results
    5. Conclusion/Evaluation
    
    Ensure the content descriptions are specific to the project's domain (e.g., if blockchain, mention consensus algorithms; if AI, mention model training).`,
        prompt: "Generate the project outline structure.",
    });

    return result.toTextStreamResponse();
}
