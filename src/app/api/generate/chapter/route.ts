import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
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
    projectId: z.string().min(1, 'Project ID is required'),
    chapterNumber: z.number().min(1).max(5),
});

// Academic chapter prompts
const CHAPTER_PROMPTS: Record<number, { title: string; prompt: string }> = {
    1: {
        title: 'Introduction',
        prompt: `Write a comprehensive Chapter 1: Introduction for this final year project.

Include:
- Background of the Study (set the context, explain why this topic matters)
- Statement of the Problem (clearly articulate the gap/issue being addressed)
- Aim and Objectives (1 aim, 4-5 SMART objectives)
- Significance of the Study (academic and practical benefits)
- Scope and Limitations (what is covered, what is not)
- Definition of Terms (key concepts explained)

Write in formal academic language. Use proper paragraphs. Approximately 2000-2500 words.`
    },
    2: {
        title: 'Literature Review',
        prompt: `Write a comprehensive Chapter 2: Literature Review for this final year project.

Include:
- Introduction to the chapter
- Conceptual Framework (define key concepts theoretically)
- Theoretical Framework (relevant theories supporting the work)
- Review of Related Works (at least 10 studies, compare and contrast)
- Critique of Existing Systems (strengths and weaknesses)
- Summary of Literature Review

Use proper academic citations format (Author, Year). Write in formal language. Approximately 3000-4000 words.`
    },
    3: {
        title: 'Methodology',
        prompt: `Write a comprehensive Chapter 3: Methodology for this final year project.

Include:
- Introduction to the chapter
- Research Design (methodology approach - SDLC, Agile, etc.)
- System Analysis (analysis of current/existing system)
- Proposed System (description of what will be built)
- System Requirements (functional and non-functional)
- Data Flow Diagrams (describe Level 0, Level 1 diagrams)
- Entity Relationship Diagram (describe entities and relationships)
- System Architecture (describe the technical architecture)
- Implementation Tools (programming languages, frameworks, databases)

Write in formal academic language. Approximately 2500-3000 words.`
    },
    4: {
        title: 'Implementation and Results',
        prompt: `Write a comprehensive Chapter 4: System Implementation and Results for this final year project.

Include:
- Introduction to the chapter
- Development Environment Setup
- Implementation of Modules (describe each module/feature implemented)
- System Screenshots (describe what screens would show - user interface descriptions)
- Testing Methodology (unit testing, integration testing, user acceptance testing)
- Test Cases and Results (sample test cases with expected vs actual results)
- System Evaluation (how well does the system meet objectives)
- Discussion of Results

Write in formal academic language. Approximately 2500-3000 words.`
    },
    5: {
        title: 'Conclusion and Recommendations',
        prompt: `Write a comprehensive Chapter 5: Summary, Conclusion and Recommendations for this final year project.

Include:
- Summary of the Study (recap each chapter briefly)
- Conclusion (what was achieved, how objectives were met)
- Contributions to Knowledge (what new insights were gained)
- Recommendations (for future work, for practitioners)
- Limitations Encountered (challenges faced during the project)
- Suggestions for Future Work (how the system can be extended)

Write in formal academic language. Approximately 1500-2000 words.`
    }
};

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

        // 4. Get chapter prompt
        const chapterConfig = CHAPTER_PROMPTS[chapterNumber];
        if (!chapterConfig) {
            return new Response(JSON.stringify({ error: 'Invalid chapter number' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 5. Build context from project data
        const projectContext = `
PROJECT TITLE: ${project.topic}

PROJECT ABSTRACT:
${project.abstract || 'Not provided'}

PROJECT TWIST/UNIQUE ANGLE:
${project.twist || 'Not specified'}

EXISTING OUTLINE:
${project.outline?.content || 'No outline available'}
`;

        // 6. Stream the chapter content
        const result = streamText({
            model: groq('llama-3.3-70b-versatile'),
            system: `You are an expert academic writer specializing in final year project documentation for Nigerian universities.
            
Write in formal academic English. Use proper paragraph structure. Ensure content is original and plagiarism-free.
Do NOT include references to specific years or dates that would make the content outdated.
Format headings using markdown (## for main sections, ### for subsections).

PROJECT CONTEXT:
${projectContext}`,
            prompt: chapterConfig.prompt,
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
