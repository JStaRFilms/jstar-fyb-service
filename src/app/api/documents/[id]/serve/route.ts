import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Validate ID format
        if (!id || (!/^c[a-z0-9]{24}$/i.test(id) && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))) {
            return NextResponse.json({ error: "Invalid document ID format" }, { status: 400 });
        }

        // Get the document
        const doc = await prisma.researchDocument.findUnique({
            where: { id },
            select: {
                fileData: true,
                mimeType: true,
                fileName: true,
                fileType: true
            }
        });

        if (!doc) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        if (!doc.fileData) {
            return NextResponse.json({ error: "No file data available" }, { status: 400 });
        }

        // Set appropriate headers for file download/view
        const headers = new Headers();
        headers.set('Content-Type', doc.mimeType || 'application/octet-stream');
        headers.set('Content-Disposition', `inline; filename="${doc.fileName}"`);
        headers.set('Cache-Control', 'public, max-age=31536000');

        return new NextResponse(new Uint8Array(doc.fileData), {
            headers
        });

    } catch (error) {
        console.error("[ServeDocument] Error:", error);
        return NextResponse.json({ error: "Failed to serve document" }, { status: 500 });
    }
}
