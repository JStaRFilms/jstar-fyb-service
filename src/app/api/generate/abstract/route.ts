import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

// Create Groq provider using OpenAI SDK compatibility
const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
});

export const maxDuration = 120;

export async function POST(req: Request) {
    const { topic, twist, instruction } = await req.json();

    const systemPrompt = `You are an expert academic research consultant. 
  Your goal is to write a compelling, technically sound project abstract.
  
  Topic: ${topic}
  ${twist ? `Unique Twist/Approach: ${twist}` : ''}
  
  Style: Academic yet accessible, distinction-grade quality.
  Format: 2-3 paragraphs.
  
  Structure:
  1. Context/Problem Statement
  2. The Proposed Solution (incorporating the twist)
  3. Methodology & Expected Outcomes
  
  ${instruction ? `REFINEMENT INSTRUCTION: ${instruction}` : ''}
  `;

    const result = streamText({
        model: groq('openai/gpt-oss-120b'), // Reverting to known Groq model
        system: systemPrompt,
        prompt: `Write the abstract for "${topic}".`,
    });

    return result.toTextStreamResponse();
}
