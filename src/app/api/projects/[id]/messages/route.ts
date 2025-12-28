import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { z } from "zod";

const createMessageSchema = z.object({
    role: z.enum(["customer", "admin"]),
    content: z.string().min(1)
});

// Helper to verify project ownership
async function verifyProjectOwnership(projectId: string, userId?: string) {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { userId: true, anonymousId: true }
    });

    if (!project) return { exists: false, authorized: false };

    // Owner check: matches userId OR is anonymous project
    const isOwner = project.userId ? project.userId === userId : true;
    return { exists: true, authorized: isOwner };
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { user } = await withAuth();

        // Authorization check
        const { exists, authorized } = await verifyProjectOwnership(id, user?.id);
        if (!exists) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }
        if (!authorized) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const validation = createMessageSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: "Invalid message" }, { status: 400 });
        }

        const message = await prisma.projectMessage.create({
            data: {
                projectId: id,
                role: validation.data.role,
                content: validation.data.content
            }
        });

        return NextResponse.json({ success: true, message });

    } catch (error) {
        console.error("[CreateProjectMessage] Error:", error);
        return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { user } = await withAuth();

        // Authorization check
        const { exists, authorized } = await verifyProjectOwnership(id, user?.id);
        if (!exists) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }
        if (!authorized) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const messages = await prisma.projectMessage.findMany({
            where: { projectId: id },
            orderBy: { createdAt: "asc" }
        });

        return NextResponse.json({ messages });

    } catch (error) {
        console.error("[GetProjectMessages] Error:", error);
        return NextResponse.json({ error: "Failed to get messages" }, { status: 500 });
    }
}
