import { streamText, tool, stepCountIs, type CoreMessage } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { GeminiFileSearchService } from '@/lib/gemini-file-search';

export const maxDuration = 300;

// Validate environment variables
const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
    throw new Error('GROQ_API_KEY environment variable is required');
}

// Create Groq provider (using dedicated @ai-sdk/groq for proper compatibility)
const groq = createGroq({
    apiKey: groqApiKey,
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = await params;
    const body = await req.json();
    const { messages, conversationId } = body;

    // 1. Fetch Project
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            outline: true,
            chapters: {
                select: { number: true, title: true, status: true, version: true }
            },
            documents: {
                where: { status: 'PROCESSED' },
                select: {
                    id: true,
                    title: true,
                    author: true,
                    year: true,
                    summary: true,
                    documentType: true
                }
            }
        }
    });

    if (!project) {
        return new Response('Project not found', { status: 404 });
    }

    // 2. Resolve Conversation ID
    let activeConversationId = conversationId;
    if (!activeConversationId) {
        const conv = await prisma.projectConversation.create({
            data: { projectId }
        });
        activeConversationId = conv.id;
    }

    // 3. Prepare Context
    const outlineData = project.outline?.content
        ? (typeof project.outline.content === 'string' ? project.outline.content : JSON.stringify(project.outline.content))
        : 'No outline available';

    // 3b. Prepare Research Context (Summaries)
    const researchContext = project.documents.length > 0
        ? project.documents.map(d =>
            `- [${d.documentType}] "${d.title}" by ${d.author || 'Unknown'} (${d.year || 'n.d'}): ${d.summary ? d.summary.substring(0, 200) + '...' : 'No summary'}`
        ).join('\n')
        : 'No research documents uploaded yet.';

    // 3c. Prepare Chapter Context (Status)
    const chapterContext = project.chapters.length > 0
        ? project.chapters.map(c => `- Chapter ${c.number}: ${c.title} (${c.status}, v${c.version})`).join('\n')
        : 'No chapters generated yet.';

    const systemPrompt = `You are an expert academic research assistant and writing copilot.

## Project Context
- **Topic:** ${project.topic}
- **Twist:** ${project.twist || 'None'}
- **Abstract:** ${project.abstract || 'Not generated yet'}

## Research Library (Summaries)
${researchContext}

## Current Progress
${chapterContext}

## Generated Outline
${outlineData}

## Your Role
- Help the student write, refine, and improve their project.
- **WRITING TASKS**: Use the *Research Library* context above to synthesize content. Avoid plagiarism.
- **RESEARCH QUESTIONS**: If the user asks for specific quotes, facts, or citations from the files, USE THE "searchProjectDocuments" TOOL.
- Be encouraging but maintain academic standards.
`;

    // 4. Stream Response
    // Defensive check: ensure messages is a valid array before mapping
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        console.error('[Project Chat API] Invalid messages array:', messages);
        return new Response(JSON.stringify({ error: 'Messages array is required and must not be empty' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Explicitly type messages for the AI SDK
    const coreMessages: CoreMessage[] = messages.map((m: any) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
    }));

    const result = streamText({
        model: groq('openai/gpt-oss-120b'), // openai/gpt-oss-120b
        system: systemPrompt,
        messages: coreMessages,
        stopWhen: stepCountIs(5), // Allow tool usage steps
        tools: {
            searchProjectDocuments: tool({
                description: `Search the full text of uploaded research documents for specific information, quotes, or evidence. Use this when the user asks questions like "What does Paper X say about Y?" or "Find quotes about Z".`,
                inputSchema: z.object({
                    query: z.string().describe('The search query for the research library'),
                }),
                execute: async ({ query }: { query: string }) => {
                    try {
                        if (!project.fileSearchStoreId) return "No research library index found. Please upload documents first.";

                        const result = await GeminiFileSearchService.generateWithGrounding(
                            query,
                            [project.fileSearchStoreId]
                        );

                        // Format the grounded result for the chat model
                        return `Here is the information found in the documents:\n\n${result.text}\n\nSOURCES/CITATIONS:\n${JSON.stringify(result.groundingChunks)}`;
                    } catch (error: any) {
                        console.error('[Chat Tool] Search failed:', error);
                        return `Search failed: ${error.message}`;
                    }
                }
            })
        },
        onFinish: async ({ text }) => {
            // Save User Message (last one)
            const lastUserMessage = messages[messages.length - 1];
            if (lastUserMessage && lastUserMessage.role === 'user') {
                await prisma.projectChatMessage.create({
                    data: {
                        conversationId: activeConversationId,
                        role: 'user',
                        content: lastUserMessage.content
                    }
                });
            }

            // Save Assistant Message
            await prisma.projectChatMessage.create({
                data: {
                    conversationId: activeConversationId,
                    role: 'assistant',
                    content: text
                }
            });
        },
    });

    return result.toUIMessageStreamResponse();
}
