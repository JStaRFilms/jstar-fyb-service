import { streamObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { outlineSchema } from '@/features/builder/schemas/outlineSchema';
import { z } from 'zod';
import { BuilderAiService } from '@/features/builder/services/builderAiService';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-server';

// Validate environment variables
const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
    throw new Error('GROQ_API_KEY environment variable is required');
}

const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: groqApiKey,
});

export const maxDuration = 120;

// Input validation schema
const requestSchema = z.object({
    topic: z.string().min(1, 'Topic is required'),
    abstract: z.string().min(1, 'Abstract is required'),
});

export async function POST(req: Request) {
    const body = await req.json();

    // Validate input
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
        return new Response(
            JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const { topic, abstract } = validation.data;

    try {
        // Use the new Builder AI service to generate outline with context
        const outlineTopics = await BuilderAiService.generateOutline(topic);

        // Check for authenticated user context before streaming
        const user = await getCurrentUser();

        const result = streamObject({
            model: groq('openai/gpt-oss-120b'), // Valid Groq model
            schema: outlineSchema,
            system: `You are an expert academic curriculum designer.
        Create a 5-chapter distinction-grade project outline based on the verified abstract.
        
        Topic: ${topic}
        Abstract: ${abstract}
        
        Context from similar projects: ${outlineTopics.join(', ')}
        
        The chapters should strictly follow standard structure:
        1. Introduction
        2. Literature Review
        3. Methodology
        4. Implementation/Results
        5. Conclusion/Evaluation
        
        Ensure the content descriptions are specific to the project's domain (e.g., if blockchain, mention consensus algorithms; if AI, mention model training).
        
        Use the context from similar projects to make the outline more relevant and data-driven.`,
            prompt: "Generate the project outline structure with enhanced context.",
            onFinish: async ({ object: outlineData }) => {
                // Store the outline in the database asynchronously
                if (outlineData?.chapters) {
                    try {
                        if (user) {
                            // Find existing project or create a new one
                            let project = await prisma.project.findFirst({
                                where: {
                                    topic: topic,
                                    userId: user.id
                                }
                            });

                            if (!project) {
                                // Create new project
                                project = await prisma.project.create({
                                    data: {
                                        topic: topic,
                                        abstract: abstract,
                                        userId: user.id
                                    }
                                });
                            }

                            // Create or update the chapter outline
                            await prisma.chapterOutline.upsert({
                                where: { projectId: project.id },
                                update: {
                                    content: JSON.stringify(outlineData.chapters),
                                    updatedAt: new Date()
                                },
                                create: {
                                    projectId: project.id,
                                    content: JSON.stringify(outlineData.chapters)
                                }
                            });
                        }
                    } catch (dbError) {
                        console.error('[GenerateOutline] Failed to store outline in database:', dbError);
                    }
                }
            }
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error('[GenerateOutline] Error using Builder AI service:', error);

        // Fallback to original implementation
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
}
