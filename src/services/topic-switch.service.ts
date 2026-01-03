
import { prisma } from "@/lib/prisma";
import { ProjectsService } from "./projects.service";
import { TopicSwitchRequest } from "@prisma/client";

export class TopicSwitchService {

    /**
     * Creates a topic switch request.
     */
    static async createRequest(data: {
        userId: string;
        projectId: string;
        reason: string;
        explanation?: string;
        proofUrl?: string;
        fee?: number;
    }) {
        // Validation: Check if project belongs to user
        const project = await prisma.project.findUnique({
            where: { id: data.projectId }
        });

        if (!project || project.userId !== data.userId) {
            throw new Error("Project not found or access denied");
        }

        if (!project.isLocked) {
            throw new Error("Project is not locked. You can simply edit the topic.");
        }

        // Check for existing pending requests
        const existingDefault = await prisma.topicSwitchRequest.findFirst({
            where: {
                projectId: data.projectId,
                status: "pending"
            }
        });

        if (existingDefault) {
            throw new Error("A pending switch request already exists.");
        }

        return prisma.topicSwitchRequest.create({
            data: {
                userId: data.userId,
                projectId: data.projectId,
                reason: data.reason,
                explanation: data.explanation,
                proofUrl: data.proofUrl,
                fee: data.fee || null, // If fee logic is handled elsewhere (e.g. payment link), store it here
            }
        });
    }

    /**
     * Reviews a request (Admin or System).
     */
    static async reviewRequest(requestId: string, status: "approved" | "denied", adminId?: string) {
        const request = await prisma.topicSwitchRequest.findUnique({
            where: { id: requestId }
        });

        if (!request) throw new Error("Request not found");
        if (request.status !== "pending") throw new Error("Request already resolved");

        const updateData: any = {
            status,
            resolvedAt: new Date(),
            resolvedBy: adminId || "system"
        };

        const updatedRequest = await prisma.topicSwitchRequest.update({
            where: { id: requestId },
            data: updateData
        });

        if (status === "approved") {
            await ProjectsService.unlockProject(request.projectId);
            // Optional: Archive or Reset project content?
            // For now, unlocking allows them to go back to builder and "Create New" or "Edit".
            // If the UI blocks "Create New" based on "Has Locked Project", unlocking removes that block.
        }

        return updatedRequest;
    }

    /**
     * Auto-approve paid switch requests (if payment integration calls this)
     */
    static async processPaidSwitch(requestId: string) {
        return this.reviewRequest(requestId, "approved");
    }
}
