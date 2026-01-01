import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        // Authenticate user
        const user = await getCurrentUser();
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Fetch project and verify ownership
        const project = await prisma.project.findUnique({
            where: { id },
            include: { outline: true }
        });

        if (!project) {
            return new Response(JSON.stringify({ error: 'Project not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (project.userId !== user.id) {
            return new Response(JSON.stringify({ error: 'Forbidden' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Return stored chapters
        const chapters = project.outline?.content ? JSON.parse(project.outline.content) : {};

        return new Response(JSON.stringify({
            success: true,
            chapters: chapters
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('[GetChapters] Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch chapters' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}