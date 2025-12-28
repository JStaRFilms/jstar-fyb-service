import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const createMessageSchema = z.object({
    role: z.enum(["customer", "admin"]),
    content: z.string().min(1)
});

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
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
