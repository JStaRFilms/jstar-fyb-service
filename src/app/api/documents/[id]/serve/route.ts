import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // Params is a Promise in Next.js 15+
) {
    try {
        const { id } = await params;

        // Validate ID format (cuid)
        if (!id || !/^c[a-z0-9]{24}$/i.test(id) && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            return new NextResponse("Invalid document ID", { status: 400 });
        }

        // Get auth context (optional - documents may be accessed anonymously via project)
        const user = await getCurrentUser();

        // Fetch document with project ownership check
        const doc = await prisma.researchDocument.findUnique({
            where: { id },
            select: {
                fileData: true,
                mimeType: true,
                fileName: true,
                project: {
                    select: {
                        userId: true,
                        anonymousId: true
                    }
                }
            }
        });

        if (!doc || !doc.fileData) {
            return new NextResponse("File not found", { status: 404 });
        }

        // Authorization: User must own the project, or it was created anonymously
        // For anonymous projects, we allow access (they're public by nature)
        if (doc.project?.userId && user?.id !== doc.project.userId) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const headers = new Headers();
        headers.set("Content-Type", doc.mimeType || "application/octet-stream");
        headers.set("Content-Disposition", `inline; filename="${doc.fileName}"`);

        return new NextResponse(Buffer.from(doc.fileData), {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error("[DocumentServe] Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
