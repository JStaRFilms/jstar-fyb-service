"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createProjectSchema = z.object({
    topic: z.string().min(1),
    twist: z.string().optional(),
    abstract: z.string().min(1)
});

export async function createProjectAction(input: z.infer<typeof createProjectSchema>) {
    try {
        const { topic, twist, abstract } = createProjectSchema.parse(input);

        // Create the project
        const project = await prisma.project.create({
            data: {
                topic,
                twist: twist || "",
                abstract,
                // userId: ... (would come from auth)
                // anonymousId: ... (if tracking anonymously)
            }
        });

        return { success: true, projectId: project.id };
    } catch (error) {
        console.error("Failed to create project:", error);
        return { success: false, error: "Failed to create project" };
    }
}
