import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { cookies } from "next/headers";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get the project
        const project = await prisma.project.findUnique({
            where: { id },
            select: { id: true, userId: true, anonymousId: true, topic: true }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Case 1: Already owned by this user
        if (project.userId === user.id) {
            return NextResponse.json({ success: true, message: "Already owned" });
        }

        // Case 2: Owned by someone else
        if (project.userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Case 3: Anonymous Project (Claim it!)
        // Verify the anonymous ID cookie matches
        const cookieStore = await cookies();
        const anonymousCookie = cookieStore.get('anonymous_id')?.value;

        // Security: Only allow claim if they have the matching cookie
        // This prevents users from claiming random anonymous projects by ID guessing
        if (!project.anonymousId || project.anonymousId !== anonymousCookie) {
            console.warn(`[ClaimProject] Mismatch: Cookie ${anonymousCookie} vs DB ${project.anonymousId}`);
            // We return 403 but usually we might want to be lenient in dev? 
            // No, be strict.
            return NextResponse.json({ error: "Forbidden: Ownership mismatch" }, { status: 403 });
        }

        // Check if we need to migrate content from an anonymous session
        // This handles the "Paid for a link but started anonymously" flow
        const isTargetEmpty = !project.topic || project.topic.trim() === '';

        let didMerge = false;

        // Try to find a source project if target is empty
        if (isTargetEmpty) {
            // Reuse cookieStore from line 40 - check both cookie names
            const mergeAnonymousCookie = anonymousCookie || cookieStore.get('jstar_anonymous_id')?.value;

            if (mergeAnonymousCookie) {
                const sourceProject = await prisma.project.findFirst({
                    where: {
                        anonymousId: mergeAnonymousCookie,
                        topic: { not: '' } // Must have content
                    },
                    orderBy: { updatedAt: 'desc' },
                    include: { outline: true }
                });

                if (sourceProject) {
                    console.log(`[ClaimProject] Smart Merge: Copying content from ${sourceProject.id} to ${project.id}`);

                    // Copy content directly
                    await prisma.$transaction([
                        prisma.project.update({
                            where: { id: project.id },
                            data: {
                                topic: sourceProject.topic,
                                twist: sourceProject.twist,
                                abstract: sourceProject.abstract,
                                // note: we don't overwrite mode here, relying on billing service or default
                            }
                        }),
                        // Copy Outline if exists
                        ...(sourceProject.outline ? [
                            prisma.chapterOutline.upsert({
                                where: { projectId: project.id },
                                create: {
                                    projectId: project.id,
                                    content: sourceProject.outline.content
                                },
                                update: {
                                    content: sourceProject.outline.content
                                }
                            })
                        ] : [])
                    ]);
                    didMerge = true;
                }
            }
        }

        // Update the project and link relevant leads
        await prisma.$transaction([
            prisma.project.update({
                where: { id },
                data: {
                    userId: user.id,
                    anonymousId: null // Clear anonymous ID once claimed
                }
            }),
            // Also link any leads created with this anonymous cookie to the user
            ...(project.anonymousId ? [
                prisma.lead.updateMany({
                    where: { anonymousId: project.anonymousId },
                    data: { userId: user.id }
                })
            ] : [])
        ]);

        // Optional: Clear the cookie? No, might have other projects.

        return NextResponse.json({ success: true, project: { id, userId: user.id } });

    } catch (error) {
        console.error("[ClaimProject] Error:", error);
        return NextResponse.json({ error: "Failed to claim project" }, { status: 500 });
    }
}
