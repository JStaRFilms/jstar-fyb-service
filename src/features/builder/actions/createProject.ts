"use server";

import { prisma } from "@/lib/prisma";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";

const createProjectSchema = z.object({
    topic: z.string().min(1),
    twist: z.string().optional(),
    abstract: z.string().min(1)
});

// Helper to get or create anonymous ID
async function getAnonymousId(): Promise<string> {
    const cookieStore = await cookies();
    let anonymousId = cookieStore.get('anonymous_id')?.value;

    if (!anonymousId) {
        anonymousId = `anon_${crypto.randomUUID()}`;
        // Note: Cookie will be set by client, we just generate the ID
    }
    return anonymousId;
}

export async function createProjectAction(input: z.infer<typeof createProjectSchema>) {
    try {
        const { topic, twist, abstract } = createProjectSchema.parse(input);

        // Get authenticated user (if any)
        const { user } = await withAuth();

        // For anonymous users, use anonymousId
        const anonymousId = user ? null : await getAnonymousId();

        // Create the project with ownership
        const project = await prisma.project.create({
            data: {
                topic,
                twist: twist || "",
                abstract,
                userId: user?.id || null,
                anonymousId: anonymousId,
            }
        });

        return { success: true, projectId: project.id };
    } catch (error) {
        console.error("Failed to create project:", error);
        return { success: false, error: "Failed to create project" };
    }
}
