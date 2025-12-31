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
            select: { userId: true, anonymousId: true }
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
            prisma.lead.updateMany({
                where: { anonymousId: anonymousCookie },
                data: { userId: user.id }
            })
        ]);

        // Optional: Clear the cookie? No, might have other projects.

        return NextResponse.json({ success: true, project: { id, userId: user.id } });

    } catch (error) {
        console.error("[ClaimProject] Error:", error);
        return NextResponse.json({ error: "Failed to claim project" }, { status: 500 });
    }
}
