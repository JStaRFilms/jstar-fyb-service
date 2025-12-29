import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const updateStatusSchema = z.object({
    status: z.enum([
        "OUTLINE_GENERATED",
        "RESEARCH_IN_PROGRESS",
        "RESEARCH_COMPLETE",
        "WRITING_IN_PROGRESS",
        "PROJECT_COMPLETE"
    ])
});

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();

        // First check if project exists and user owns it
        const existing = await prisma.project.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!existing) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Authorization: only owner can change status
        if (existing.userId && existing.userId !== user?.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const validation = updateStatusSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const project = await prisma.project.update({
            where: { id },
            data: { status: validation.data.status }
        });

        return NextResponse.json({ success: true, project });

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }
        console.error("[UpdateProjectStatus] Error:", error);
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
}
