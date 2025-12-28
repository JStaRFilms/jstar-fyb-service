import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY!
});

const extractionSchema = z.object({
    title: z.string().describe("Full title of the research paper"),
    author: z.string().describe("Author(s) of the paper"),
    year: z.string().describe("Publication year"),
    objective: z.string().describe("Main objective or research question"),
    motivation: z.string().describe("Why this research was conducted"),
    methodology: z.string().describe("Research methodology used"),
    contribution: z.string().describe("Key contributions or findings"),
    limitations: z.string().describe("Limitations mentioned in the paper")
});

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Validate ID format (cuid or uuid)
        if (!id || (!/^c[a-z0-9]{24}$/i.test(id) && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))) {
            return NextResponse.json({ error: "Invalid document ID format" }, { status: 400 });
        }

        // Get the document
        const doc = await prisma.researchDocument.findUnique({
            where: { id },
            select: { fileData: true, mimeType: true, fileName: true }
        });

        if (!doc) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        if (!doc.fileData) {
            return NextResponse.json({ error: "No file data - this is a link document" }, { status: 400 });
        }

        // Convert to base64 for Gemini
        const base64Data = Buffer.from(doc.fileData).toString("base64");

        // Call Gemini with the PDF
        const result = await generateObject({
            model: google("gemini-2.5-flash"),
            schema: extractionSchema,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Analyze this research paper and extract the following metadata:
- Title
- Author(s)
- Publication Year
- Objective/Research Question
- Motivation
- Methodology
- Key Contributions
- Limitations

Be concise but accurate.`
                        },
                        {
                            type: "file",
                            data: base64Data,
                            mediaType: doc.mimeType || "application/pdf"
                        }
                    ]
                }
            ]
        });

        // Update the document with extracted data
        const updated = await prisma.researchDocument.update({
            where: { id },
            data: {
                title: result.object.title,
                author: result.object.author,
                year: result.object.year,
                objective: result.object.objective,
                motivation: result.object.motivation,
                methodology: result.object.methodology,
                contribution: result.object.contribution,
                limitations: result.object.limitations,
                status: "PROCESSED"
            }
        });

        return NextResponse.json({ success: true, extraction: result.object });

    } catch (error) {
        console.error("[ExtractDocument] Error:", error);

        // Mark as failed
        const { id } = await params;
        await prisma.researchDocument.update({
            where: { id },
            data: { status: "FAILED" }
        });

        return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
    }
}
