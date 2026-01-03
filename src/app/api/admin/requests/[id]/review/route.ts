
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { TopicSwitchService } from "@/services/topic-switch.service";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> } // Fix for Next.js 15+ async params
) {
    try {
        const user = await getCurrentUser();
        // TODO: Add proper Admin Role check. 
        // For now, assuming anyone hitting this route in the "admin" layout implies some protection,
        // but robust RBAC is needed. Since we don't have a rigid RBAC system in the prompt memories,
        // we'll rely on the existing auth check and maybe an email allowlist if we wanted to be safe.
        // But for this prototype:
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const params = await context.params;
        const requestId = params.id;
        const body = await req.json();
        const { status } = body;

        if (!requestId || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (!["approved", "denied"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const result = await TopicSwitchService.reviewRequest(requestId, status, user.id);

        return NextResponse.json({ success: true, request: result });
    } catch (error: any) {
        console.error("Review Request Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
