import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-server';

interface SimpleProgressUpdate {
    projectId: string;
    milestone: string;
    phase: string;
    details?: any;
}

export class SimpleProgressTrackingService {
    /**
     * Update project progress with milestone completion
     * Works with current schema using existing fields
     */
    static async updateProgress({
        projectId,
        milestone,
        phase,
        details
    }: SimpleProgressUpdate): Promise<boolean> {
        try {
            const session = await getCurrentUser();
            if (!session) {
                throw new Error('Unauthorized');
            }

            // Validate project access
            const project = await prisma.project.findUnique({
                where: {
                    id: projectId,
                    userId: session.id
                }
            });

            if (!project) {
                throw new Error('Project not found');
            }

            // Update progress based on milestone
            const updates: any = {};
            const now = new Date();

            switch (milestone) {
                case 'OUTLINE_GENERATED':
                    updates.outlineGenerated = true;
                    updates.status = 'OUTLINE_GENERATED';
                    break;

                case 'RESEARCH_IN_PROGRESS':
                    updates.status = 'RESEARCH_IN_PROGRESS';
                    break;

                case 'RESEARCH_COMPLETE':
                    updates.status = 'RESEARCH_COMPLETE';
                    break;

                case 'WRITING_IN_PROGRESS':
                    updates.status = 'WRITING_IN_PROGRESS';
                    break;

                case 'ABSTRACT_GENERATED':
                    updates.status = 'WRITING_IN_PROGRESS'; // Still in writing phase
                    break;

                case 'PROJECT_COMPLETE':
                    updates.status = 'PROJECT_COMPLETE';
                    break;
            }

            // Update project
            await prisma.project.update({
                where: { id: projectId },
                data: updates
            });

            return true;

        } catch (error) {
            console.error('Progress update error:', error);
            throw error;
        }
    }

    /**
     * Get project progress data
     * Returns calculated progress based on current status
     */
    static async getProgress(projectId: string): Promise<any> {
        try {
            const session = await getCurrentUser();
            if (!session) {
                throw new Error('Unauthorized');
            }

            const project = await prisma.project.findUnique({
                where: {
                    id: projectId,
                    userId: session.id
                }
            });

            if (!project) {
                return null;
            }

            // Calculate progress percentage based on status
            let progressPercentage = 0;
            let phaseProgress = 'outline';

            switch (project.status) {
                case 'OUTLINE_GENERATED':
                    progressPercentage = 25;
                    phaseProgress = 'outline';
                    break;
                case 'RESEARCH_IN_PROGRESS':
                    progressPercentage = 35;
                    phaseProgress = 'research';
                    break;
                case 'RESEARCH_COMPLETE':
                    progressPercentage = 50;
                    phaseProgress = 'research';
                    break;
                case 'WRITING_IN_PROGRESS':
                    progressPercentage = 75;
                    phaseProgress = 'writing';
                    break;
                case 'PROJECT_COMPLETE':
                    progressPercentage = 100;
                    phaseProgress = 'completed';
                    break;
                default:
                    progressPercentage = 0;
                    phaseProgress = 'pending';
            }

            return {
                progressPercentage,
                phaseProgress,
                status: project.status,
                outlineGenerated: project.outlineGenerated,
                isUnlocked: project.isUnlocked,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt
            };

        } catch (error) {
            console.error('Progress retrieval error:', error);
            throw error;
        }
    }

    /**
     * Get project analytics for admin dashboard
     */
    static async getProjectAnalytics(): Promise<any> {
        try {
            const projects = await prisma.project.findMany({
                select: {
                    id: true,
                    topic: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                    outlineGenerated: true,
                    isUnlocked: true
                }
            });

            // Calculate basic analytics
            const totalProjects = projects.length;
            const completedProjects = projects.filter(p => p.status === 'PROJECT_COMPLETE').length;
            const inProgressProjects = projects.filter(p =>
                p.status === 'WRITING_IN_PROGRESS' ||
                p.status === 'RESEARCH_IN_PROGRESS' ||
                p.status === 'RESEARCH_COMPLETE'
            ).length;
            const outlineGenerated = projects.filter(p => p.outlineGenerated).length;
            const paidProjects = projects.filter(p => p.isUnlocked).length;

            // Calculate average project duration
            const avgDuration = projects.length > 0
                ? projects.reduce((acc, project) => {
                    const duration = project.updatedAt.getTime() - project.createdAt.getTime();
                    return acc + duration;
                }, 0) / projects.length
                : 0;

            return {
                totalProjects,
                completedProjects,
                inProgressProjects,
                outlineGenerated,
                paidProjects,
                completionRate: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0,
                avgProjectDuration: Math.round(avgDuration / (1000 * 60 * 60 * 24)), // in days
                projects
            };

        } catch (error) {
            console.error('Analytics error:', error);
            throw error;
        }
    }
}