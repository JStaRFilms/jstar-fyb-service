import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-server';
import { BuilderAiService } from '@/features/builder/services/builderAiService';

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
    projectId: z.string().min(1, 'Project ID is required'),
    chapterNumber: z.number().min(1).max(5),
});

export async function POST(req: Request) {
    try {
        // 1. Authenticate user
        const user = await getCurrentUser();
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 2. Parse and validate request
        const body = await req.json();
        const validation = requestSchema.safeParse(body);

        if (!validation.success) {
            return new Response(
                JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const { projectId, chapterNumber } = validation.data;

        // 3. Fetch project and verify ownership + unlock status
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { outline: true }
        });

        if (!project) {
            return new Response(JSON.stringify({ error: 'Project not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (project.userId !== user.id) {
            return new Response(JSON.stringify({ error: 'Forbidden' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!project.isUnlocked) {
            return new Response(JSON.stringify({ error: 'Project not unlocked. Please complete payment.' }), {
                status: 402,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 4. Use the new Builder AI service to generate chapter content with context
        try {
            const aiGeneratedContent = await BuilderAiService.generateChapterContent(
                projectId,
                chapterNumber,
                `Chapter ${chapterNumber}`
            );

            // Stream the enhanced chapter content
            const result = streamText({
                model: groq('llama-3.3-70b-versatile'),
                system: `You are an expert academic writer specializing in final year project documentation for Nigerian universities.
                
Write in formal academic English. Use proper paragraph structure. Ensure content is original and plagiarism-free.
Do NOT include references to specific years or dates that would make the content outdated.
Format headings using markdown (## for main sections, ### for subsections).

PROJECT CONTEXT:
PROJECT TITLE: ${project.topic}
PROJECT ABSTRACT: ${project.abstract || 'Not provided'}
PROJECT TWIST/UNIQUE ANGLE: ${project.twist || 'Not specified'}
EXISTING OUTLINE: ${project.outline?.content || 'No outline available'}

CONTEXT FROM BUILDER AI:
${aiGeneratedContent}

Use this context to generate a comprehensive chapter that builds upon the existing project context and AI-generated content.`,
                prompt: `Generate Chapter ${chapterNumber} with enhanced context and project-specific details.`,
            });

            // Store the chapter content in the database
            const chapterContent = await result.text;
            if (chapterContent) {
                try {
                    // Update the chapter outline with the generated content
                    await prisma.chapterOutline.update({
                        where: { projectId: projectId },
                        data: {
                            content: JSON.stringify({
                                ...JSON.parse(project.outline?.content || '{}'),
                                [`chapter_${chapterNumber}`]: chapterContent
                            }),
                            updatedAt: new Date()
                        }
                    });
                } catch (dbError) {
                    console.error('[GenerateChapter] Failed to store chapter in database:', dbError);
                    // Continue with the response even if database storage fails
                }
            }

            return result.toTextStreamResponse();
        } catch (aiError) {
            console.error('[GenerateChapter] Error using Builder AI service:', aiError);

            // Fallback to original implementation
            const projectContext = `
PROJECT TITLE: ${project.topic}

PROJECT ABSTRACT:
${project.abstract || 'Not provided'}

PROJECT TWIST/UNIQUE ANGLE:
${project.twist || 'Not specified'}

EXISTING OUTLINE:
${project.outline?.content || 'No outline available'}
`;

            const result = streamText({
                model: groq('llama-3.3-70b-versatile'),
                system: `You are an expert academic writer specializing in final year project documentation for Nigerian universities.
                
Write in formal academic English. Use proper paragraph structure. Ensure content is original and plagiarism-free.
Do NOT include references to specific years or dates that would make the content outdated.
Format headings using markdown (## for main sections, ### for subsections).

PROJECT CONTEXT:
${projectContext}`,
                prompt: `Generate Chapter ${chapterNumber} with standard academic structure.`,
            });

            // Store the chapter content in the database (fallback)
            const fallbackChapterContent = await result.text;
            if (fallbackChapterContent) {
                try {
                    // Update the chapter outline with the generated content
                    await prisma.chapterOutline.update({
                        where: { projectId: projectId },
                        data: {
                            content: JSON.stringify({
                                ...JSON.parse(project.outline?.content || '{}'),
                                [`chapter_${chapterNumber}`]: fallbackChapterContent
                            }),
                            updatedAt: new Date()
                        }
                    });
                } catch (dbError) {
                    console.error('[GenerateChapter] Failed to store chapter in database (fallback):', dbError);
                    // Continue with the response even if database storage fails
                }
            }

            return result.toTextStreamResponse();
        }

    } catch (error: unknown) {
        console.error('[GenerateChapter] Error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to generate chapter' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
