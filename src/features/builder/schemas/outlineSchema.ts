import { z } from 'zod';

/**
 * Schema for AI-generated project outline.
 * Shared between client (useObject) and server (streamObject).
 */
export const outlineSchema = z.object({
    title: z.string().describe("Refined academic title of the project"),
    chapters: z.array(z.object({
        title: z.string().describe("Chapter title (e.g., Introduction, Methodology)"),
        content: z.string().describe("Brief summary of what this chapter covers (2-3 sentences)")
    })).describe("The 5 standard chapters for a final year project")
});

export type ProjectOutline = z.infer<typeof outlineSchema>;
export type Chapter = ProjectOutline['chapters'][number];
