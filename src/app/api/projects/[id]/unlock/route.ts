import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { Prisma } from "@prisma/client";

export async function POST(
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

        // Authorization: only owner can unlock
        if (existing.userId && existing.userId !== user?.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const project = await prisma.project.update({
            where: { id },
            data: { isUnlocked: true }
        });

        return NextResponse.json({ success: true, project });

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }
        console.error("[UnlockProject] Error:", error);
        return NextResponse.json({ error: "Failed to unlock project" }, { status: 500 });
    }
}
