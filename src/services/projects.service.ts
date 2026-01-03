
import { prisma } from "@/lib/prisma";
import { Project } from "@prisma/client";

export class ProjectsService {
    /**
     * Checks if a user has any locked projects.
     * Returns the locked project if found, null otherwise.
     */
    static async getLockedProject(userId: string): Promise<Project | null> {
        return prisma.project.findFirst({
            where: {
                userId,
                isLocked: true,
            },
        });
    }

    /**
     * Creates a new project, enforcing the "One Locked Project" rule.
     * If the user is authenticated and has a locked project, this throws an error.
     */
    static async createProject(data: {
        topic: string;
        twist?: string;
        abstract: string;
        userId?: string | null;
        anonymousId?: string | null;
    }) {
        if (data.userId) {
            const lockedProject = await this.getLockedProject(data.userId);
            if (lockedProject) {
                throw new Error("User already has a locked project. Please switch topics via support or complete your current project.");
            }
        }

        // Also check if there's an existing UNLOCKED project we should reuse? 
        // The business logic "Prevent creating new projects (1 per account by default)" 
        // usually implies we might want to guide them to the existing one, 
        // but for now, we just block if there is a LOCKED one.
        // If they have 5 draft projects, that's fine, until they pay for one.

        return prisma.project.create({
            data: {
                topic: data.topic,
                twist: data.twist || "",
                abstract: data.abstract,
                userId: data.userId,
                anonymousId: data.anonymousId,
            }
        });
    }

    /**
     * Locks a project effectively binding the user to this topic.
     * Typically called after payment.
     */
    static async lockProject(projectId: string) {
        return prisma.project.update({
            where: { id: projectId },
            data: {
                isLocked: true,
                lockedAt: new Date(),
            }
        });
    }

    /**
     * Unlocks a project.
     * Used when a switch request is approved.
     */
    static async unlockProject(projectId: string) {
        return prisma.project.update({
            where: { id: projectId },
            data: {
                isLocked: false,
                lockedAt: null,
            }
        });
    }
}
