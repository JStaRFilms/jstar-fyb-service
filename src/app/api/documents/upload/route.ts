import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

// Limit file size to 4MB (Serverless limit safe zone)
const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ACCEPTED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const link = formData.get("link") as string | null;
        const projectId = formData.get("projectId") as string;

        if (!projectId) {
            return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
        }

        // Case 1: External Link
        if (link) {
            // Validate URL
            try {
                new URL(link);
            } catch {
                return NextResponse.json({ error: "Invalid URL provided" }, { status: 400 });
            }

            const doc = await prisma.researchDocument.create({
                data: {
                    projectId,
                    fileName: "External Link", // User can rename later if we add that feature
                    fileType: "link",
                    fileUrl: link,
                    status: "PENDING"
                }
            });

            return NextResponse.json({ success: true, doc });
        }

        // Case 2: File Upload
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json({ error: "File exceeds 4MB limit" }, { status: 400 });
            }

            if (!ACCEPTED_TYPES.includes(file.type)) {
                return NextResponse.json({ error: "Only PDF and DOCX files are allowed" }, { status: 400 });
            }

            const buffer = Buffer.from(await file.arrayBuffer());

            const doc = await prisma.researchDocument.create({
                data: {
                    projectId,
                    fileName: file.name,
                    fileType: file.type.split('/')[1], // 'pdf' or 'vnd...'
                    mimeType: file.type,
                    fileData: buffer,
                    status: "PENDING"
                }
            });

            return NextResponse.json({ success: true, doc });
        }

        return NextResponse.json({ error: "No file or link provided" }, { status: 400 });

    } catch (error) {
        console.error("[DocumentUpload] Error:", error);
        return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
    }
}
