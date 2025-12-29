import React from "react";
import { ProjectCard } from "@/features/dashboard/components/ProjectCard";
import { ResourceDownloads } from "@/features/dashboard/components/ResourceDownloads";
import { UpsellBanner } from "@/features/dashboard/components/UpsellBanner";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";

export default async function DashboardPage() {
    const user = await getCurrentUser();

    const projects = await prisma.project.findMany({
        where: { userId: user?.id },
        orderBy: { updatedAt: 'desc' },
        include: {
            documents: {
                select: {
                    id: true,
                    projectId: true,
                    fileName: true,
                    fileType: true,
                    fileUrl: true,
                    status: true,
                    title: true, // Useful for metadata
                    processedAt: true,
                    // Exclude fileData (Bytes) to avoid serialization error
                }
            }
        }
    });

    const hasProjects = projects.length > 0;
    // For now, we take the most recent project as the active one
    const activeProject = projects[0];

    return (
        <>
            {hasProjects ? (
                <>
                    <ProjectCard project={activeProject} />
                    <ResourceDownloads documents={activeProject.documents} />
                    <UpsellBanner />
                </>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-400">No projects found.</p>
                    <button className="mt-4 px-6 py-2 bg-primary rounded-xl font-bold text-sm">
                        Start New Project
                    </button>
                </div>
            )}
        </>
    );
}
