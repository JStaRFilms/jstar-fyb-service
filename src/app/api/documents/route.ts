import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const projectId = url.searchParams.get("projectId");

        if (!projectId) {
            return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
        }

        const documents = await prisma.researchDocument.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            documents
        });

    } catch (error) {
        console.error("[GetDocuments] Error:", error);
        return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
    }
}