import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

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
        console.error("[UpdateProjectStatus] Error:", error);
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
}
