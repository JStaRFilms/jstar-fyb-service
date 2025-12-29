import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest
) {
    try {
        const session = await auth.api.getSession({
            headers: await request.headers,
        });

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get project analytics for the user
        const projects = await prisma.project.findMany({
            where: {
                OR: [
                    { userId: session.user.id },
                    { anonymousId: (session.user as any).anonymousId }
                ]
            },
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

        return NextResponse.json({
            success: true,
            analytics: {
                totalProjects,
                completedProjects,
                inProgressProjects,
                outlineGenerated,
                paidProjects,
                completionRate: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0,
                avgProjectDuration: Math.round(avgDuration / (1000 * 60 * 60 * 24)), // in days
                projects
            }
        });

    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}