import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // Params is a Promise in Next.js 15+
) {
    try {
        const { id } = await params;

        const doc = await prisma.researchDocument.findUnique({
            where: { id },
            select: {
                fileData: true,
                mimeType: true,
                fileName: true
            }
        });

        if (!doc || !doc.fileData) {
            return new NextResponse("File not found", { status: 404 });
        }

        const headers = new Headers();
        headers.set("Content-Type", doc.mimeType || "application/octet-stream");
        headers.set("Content-Disposition", `inline; filename="${doc.fileName}"`);

        return new NextResponse(doc.fileData, {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error("[DocumentServe] Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
