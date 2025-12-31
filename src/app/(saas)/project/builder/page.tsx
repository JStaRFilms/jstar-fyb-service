import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { ProjectData } from "@/features/builder/store/useBuilderStore";
import { BuilderClient } from "./BuilderClient"; // We'll assume it's in the same folder
import { Chapter } from "@/features/builder/schemas/outlineSchema";

export default async function BuilderPage() {
    const user = await getCurrentUser();
    let serverProject: Partial<ProjectData> | null = null;

    if (user) {
        // Find the most recent incomplete project or just the most recent one?
        // Dashboard picks the most recent. Let's do the same.
        // Also maybe exclude 'PROJECT_COMPLETE' if we want to force new?
        // For now, let's just pick the latest project period, to match Dashboard.
        const recentProject = await prisma.project.findFirst({
            where: { userId: user.id },
            orderBy: { updatedAt: 'desc' },
            include: {
                outline: true
            }
        });

        if (recentProject) {
            // Map to ProjectData
            let parsedOutline: Chapter[] = [];
            if (recentProject.outline && recentProject.outline.content) {
                try {
                    parsedOutline = JSON.parse(recentProject.outline.content);
                } catch (e) {
                    console.error("Failed to parse outline content", e);
                }
            }

            serverProject = {
                userId: user.id,
                projectId: recentProject.id,
                topic: recentProject.topic,
                twist: recentProject.twist || "",
                abstract: recentProject.abstract || "",
                outline: parsedOutline,
                // @ts-ignore - casting string to literal type
                mode: recentProject.mode as any,
                // @ts-ignore - casting string to literal type
                status: recentProject.status as any,
            };
        }
    }

    // @ts-ignore
    const isUnlocked = serverProject ? (await prisma.project.findUnique({ where: { id: serverProject.projectId! }, select: { isUnlocked: true } }))?.isUnlocked : false;

    return (
        <Suspense fallback={<div className="min-h-screen bg-dark flex items-center justify-center text-white/50">Loading Builder...</div>}>
            <BuilderClient serverProject={serverProject} serverIsPaid={isUnlocked || false} />
        </Suspense>
    );
}
