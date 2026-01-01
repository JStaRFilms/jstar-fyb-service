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
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
                    <p className="text-gray-400 max-w-sm">
                        Click the <span className="text-primary font-medium">+ New Project</span> button above to start building your first project.
                    </p>
                </div>
            )}
        </>
    );
}
