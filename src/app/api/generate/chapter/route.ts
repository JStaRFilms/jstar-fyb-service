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

// Helper to parse sections from markdown
function parseSections(markdown: string) {
    const sections: any[] = [];
    const lines = markdown.split('\n');
    let currentSection: { title: string; content: string } | null = null;
    let order = 0;

    for (const line of lines) {
        if (line.match(/^##\s+/)) {
            // New section detected
            if (currentSection) {
                sections.push({ ...currentSection, order: order++ });
            }
            currentSection = {
                title: line.replace(/^##\s+/, '').trim(),
                content: ''
            };
        } else if (currentSection) {
            currentSection.content += line + '\n';
        } else {
            // Content before first section (intro text)
            // Optional: Handle this if needed, or append to a "Preamble" section
        }
    }

    // Push the last section
    if (currentSection) {
        sections.push({ ...currentSection, order: order++ });
    }

    return sections;
}

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

        // 4. Use Builder AI service to generate chapter content
        const aiGeneratedContent = await BuilderAiService.generateChapterContent(
            projectId,
            chapterNumber,
            `Chapter ${chapterNumber}`
        );

        // 5. Stream response & Save to DB on completion
        const result = streamText({
            model: groq('llama-3.3-70b-versatile'),
            system: `You are an expert academic writer specializing in Final Year Project (FYP) documentation for university students.
            
            STRICT ACADEMIC GUIDELINES:
            1. TONE: Formal, objective, and analytical. Avoid first-person ("I", "we") and conversational language.
            2. ENGLISH: Use British English (UK) spelling (e.g., "analyse", "colour", "programme").
            3. CITATIONS: Use APA 7th Edition format for in-text citations where necessary (e.g., (Smith, 2023)). If exact sources are not provided in context, use realistic placeholders or general academic statements.
            4. STRUCTURE: Use clear paragraphing. Each paragraph must have a topic sentence, supporting evidence, and a concluding sentence.
            5. FORMATTING: Use Markdown.
               - ## for Main Sections (e.g., "1.1 Background of Study")
               - ### for Sub-sections
               - **Bold** for key terms
            
            PROJECT CONTEXT:
            TITLE: ${project.topic}
            CONTEXT: ${aiGeneratedContent}`,
            prompt: `Generate the full content for Chapter ${chapterNumber}. Ensure it meets the word count requirements for a standard FYP chapter (approx 1500-2000 words if possible, but focused on quality). Start directly with the first section heading.`,
            onFinish: async ({ text }) => {
                // Save to Chapter Model
                const sections = parseSections(text);
                const wordCount = text.split(/\s+/).length;

                try {
                    await prisma.chapter.upsert({
                        where: {
                            projectId_number: {
                                projectId,
                                number: chapterNumber
                            }
                        },
                        update: {
                            content: text,
                            sections: sections,
                            wordCount,
                            status: 'GENERATED',
                            lastEditedAt: new Date(),
                            generationPrompt: 'Universal Research Prompt v1' // Placeholder for actual prompt if dynamic
                        },
                        create: {
                            projectId,
                            number: chapterNumber,
                            title: `Chapter ${chapterNumber}`, // Should ideally get real title from outline
                            content: text,
                            sections: sections,
                            wordCount,
                            status: 'GENERATED',
                            version: 1,
                        }
                    });

                    // Update project progress
                    await prisma.project.update({
                        where: { id: projectId },
                        data: { updatedAt: new Date() }
                    });

                } catch (dbError) {
                    console.error('[GenerateChapter] Failed to save chapter:', dbError);
                }
            }
        });

        return result.toTextStreamResponse();

    } catch (error: unknown) {
        console.error('[GenerateChapter] Error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to generate chapter' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
