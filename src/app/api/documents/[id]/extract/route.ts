import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject, generateText } from "ai";
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
    limitations: z.string().describe("Limitations mentioned in the paper"),
    documentType: z.string().describe("Type of document (research paper, report, thesis, etc.)"),
    category: z.string().describe("Academic category or field of study"),
    keywords: z.array(z.string()).describe("Key terms and concepts from the document"),
    summary: z.string().describe("Brief summary of the document content"),
    insights: z.array(z.string()).describe("Key insights and findings"),
    themes: z.array(z.string()).describe("Major themes and topics covered")
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
            select: { fileData: true, mimeType: true, fileName: true, projectId: true }
        });

        if (!doc) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        if (!doc.fileData) {
            return NextResponse.json({ error: "No file data - this is a link document" }, { status: 400 });
        }

        // Prepare content for Gemini
        let geminiContent: { type: "text" | "file", text?: string, data?: string, mediaType?: string }[] = [];

        // Check if it's a DOCX file
        if (doc.mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            const mammoth = require("mammoth");
            const result = await mammoth.extractRawText({ buffer: doc.fileData });
            const text = result.value;

            geminiContent = [
                {
                    type: "text",
                    // Pass extracted text directly
                    text: `Analyze this research document (extracted text from DOCX) and extract comprehensive metadata for academic content generation. Document Text:\n\n${text.substring(0, 100000)}...` // limit text if huge
                }
            ];
        } else {
            // Assume PDF or supported image, convert to base64
            const base64Data = Buffer.from(doc.fileData).toString("base64");
            geminiContent = [
                {
                    type: "text",
                    text: `Analyze this research document and extract comprehensive metadata for academic content generation.`
                },
                {
                    type: "file",
                    data: base64Data,
                    mediaType: doc.mimeType || "application/pdf"
                }
            ];
        }

        // Common prompt suffix
        const extractionPrompt = `Provide:

1. **Document Identification:**
   - Title
   - Author(s)
   - Publication Year
   - Document Type (research paper, report, thesis, etc.)
   - Academic Category/Field of Study

2. **Research Context:**
   - Objective/Research Question
   - Motivation (why this research was conducted)
   - Methodology used

3. **Content Analysis:**
   - Key Contributions/Findings
   - Limitations mentioned
   - Key Terms and Concepts (keywords)
   - Major Themes and Topics covered

4. **Content Summary:**
   - Brief summary of the document content
   - Key insights and findings

Be thorough and accurate in your analysis.`;

        // Update content instructions if it's text-only, otherwise append
        if (geminiContent[0].type === "text") {
            geminiContent[0].text = geminiContent[0].text + "\n\n" + extractionPrompt;
        }

        // Step 1: Extract structured metadata
        const metadataResult = await generateObject({
            model: google("gemini-2.5-flash"),
            schema: extractionSchema,
            messages: [
                {
                    role: "user",
                    content: geminiContent as any
                }
            ]
        });

        // Helper to construct messages for subsequent steps
        const buildContent = (prompt: string) => {
            // Check if we have text-only content (from Mammoth)
            if (geminiContent[0].type === "text" && geminiContent.length === 1) {
                return [
                    {
                        type: "text",
                        text: `${prompt}\n\nDocument Context:\n${(geminiContent[0] as any).text.substring(0, 100000)}`
                    }
                ] as any;
            }
            // Otherwise, we have text + file (PDF/Image)
            else {
                return [
                    {
                        type: "text",
                        text: prompt
                    },
                    {
                        type: "file",
                        data: (geminiContent[1] as any).data,
                        mediaType: (geminiContent[1] as any).mediaType
                    }
                ] as any;
            }
        };

        // Step 2: Extract full text content for AI content generation
        const contentResult = await generateText({
            model: google("gemini-2.5-flash"),
            messages: [
                {
                    role: "user",
                    content: buildContent(`Extract the full text content from this document, preserving the structure and key information. Focus on:

1. **Introduction and Background** - Extract the main concepts and context
2. **Literature Review** - Key findings and related work
3. **Methodology** - Detailed approach and techniques used
4. **Results and Analysis** - Findings, data, and interpretations
5. **Discussion** - Implications and significance
6. **Conclusion** - Summary and future work

Provide the extracted content in a structured format that can be used for AI content generation. Include important quotes, statistics, and technical details that would be valuable for creating academic content.`)
                }
            ]
        });

        // Step 3: Generate AI-ready insights for content generation
        const insightsResult = await generateText({
            model: google("gemini-2.5-flash"),
            messages: [
                {
                    role: "user",
                    content: buildContent(`Based on this research document, generate insights that would be valuable for AI content generation. Provide:

1. **Content Generation Prompts** - Specific prompts that could be used to generate related content
2. **Knowledge Gaps** - Areas where additional research or explanation would be valuable
3. **Application Ideas** - How this research could be applied in practical scenarios
4. **Related Topics** - Other areas of study that connect to this research
5. **Teaching Points** - Key concepts that would be important for educational content

Format this as structured insights that can guide AI content creation.`)
                }
            ]
        });

        // Update the document with comprehensive extracted data
        const updated = await prisma.researchDocument.update({
            where: { id },
            data: {
                // Basic metadata
                title: metadataResult.object.title,
                author: metadataResult.object.author,
                year: metadataResult.object.year,
                documentType: metadataResult.object.documentType,
                category: metadataResult.object.category,

                // Research context
                objective: metadataResult.object.objective,
                motivation: metadataResult.object.motivation,
                methodology: metadataResult.object.methodology,

                // Content analysis
                contribution: metadataResult.object.contribution,
                limitations: metadataResult.object.limitations,
                keywords: JSON.stringify(metadataResult.object.keywords),
                themes: JSON.stringify(metadataResult.object.themes),
                insights: JSON.stringify(metadataResult.object.insights),

                // Content and insights
                summary: metadataResult.object.summary,
                extractedContent: contentResult.text,
                aiInsights: insightsResult.text,
                status: "PROCESSED"
            }
        });

        // Step 4: Update project status to indicate research documents are available
        await prisma.project.update({
            where: { id: doc.projectId },
            data: {
                status: "RESEARCH_COMPLETE",
                updatedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            extraction: {
                metadata: metadataResult.object,
                content: contentResult.text,
                insights: insightsResult.text
            }
        });

    } catch (error) {
        console.error("[ExtractDocument] Error:", error);

        // Mark as failed
        const { id } = await params;
        try {
            await prisma.researchDocument.update({
                where: { id },
                data: { status: "FAILED" }
            });
        } catch (updateError) {
            console.error("[ExtractDocument] Failed to update document status:", updateError);
        }

        return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
    }
}
