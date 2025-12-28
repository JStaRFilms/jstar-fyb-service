import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateModeSchema = z.object({
    mode: z.enum(["DIY", "CONCIERGE"])
});

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
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
        console.error("[UpdateProjectMode] Error:", error);
        return NextResponse.json({ error: "Failed to update mode" }, { status: 500 });
    }
}
