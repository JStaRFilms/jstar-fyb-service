import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const project = await prisma.project.update({
            where: { id },
            data: { isUnlocked: true }
        });

        return NextResponse.json({ success: true, project });

    } catch (error) {
        console.error("[UnlockProject] Error:", error);
        return NextResponse.json({ error: "Failed to unlock project" }, { status: 500 });
    }
}
