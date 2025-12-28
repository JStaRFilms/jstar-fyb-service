import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const updateModeSchema = z.object({
    mode: z.enum(["DIY", "CONCIERGE"])
});

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { user } = await withAuth();

        // First check if project exists and user owns it
        const existing = await prisma.project.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!existing) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Authorization: only owner can change mode
        if (existing.userId && existing.userId !== user?.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const validation = updateModeSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
        }

        const { mode } = validation.data;

        const project = await prisma.project.update({
            where: { id },
            data: {
                mode,
                status: mode === "CONCIERGE" ? "RESEARCH_IN_PROGRESS" : "OUTLINE_GENERATED"
            }
        });

        return NextResponse.json({ success: true, project });

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }
        console.error("[UpdateProjectMode] Error:", error);
        return NextResponse.json({ error: "Failed to update mode" }, { status: 500 });
    }
}
