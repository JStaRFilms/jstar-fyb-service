import React from "react";
import { ProjectCard } from "@/features/dashboard/components/ProjectCard";
import { ResourceDownloads } from "@/features/dashboard/components/ResourceDownloads";
import { UpsellBanner } from "@/features/dashboard/components/UpsellBanner";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";

export default async function DashboardPage() {
    const user = await getCurrentUser();

    // Fetch user projects (ensure this matches your schema)
    // For now, we'll assume the mockup data structure or fetch real data if schema allows
    // const projects = await prisma.project.findMany({ where: { userId: user?.id } });

    // Placeholder for when we have real data connection
    const hasProjects = true;
    const mockProject = {
        topic: "Fake News Detector",
        abstract: "Blockchain-Based Fake News Detection System using SHA-256 Hashing Algorithm",
        status: "GENERATING",
        progressPercentage: 60
    };

    return (
        <>
            {hasProjects ? (
                <>
                    <ProjectCard project={mockProject} />
                    <ResourceDownloads />
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
