import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";

/**
 * GET /api/services/purchased?projectId=xxx
 * Returns list of service IDs that have been purchased for a project
 * 
 * Detection method: Add-on payment references start with "SVC" followed by the service ID
 * e.g., "SVCADDONDEFENSESPEECH1234567890"
 */
export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ services: [] });
        }

        const projectId = req.nextUrl.searchParams.get('projectId');
        if (!projectId) {
            return NextResponse.json({ services: [] });
        }

        // Find successful payments for this project that are add-ons
        // Add-on payment references start with "SVC" followed by the sanitized service ID
        const payments = await prisma.payment.findMany({
            where: {
                projectId: projectId,
                status: 'SUCCESS',
                reference: {
                    startsWith: 'SVC'
                }
            },
            select: {
                reference: true
            }
        });

        // Extract service IDs from payment references
        // Reference format: SVC{SERVICEID}{TIMESTAMP}
        // Service IDs in config: ADDON_DEFENSE_SPEECH, ADDON_CODE_REVIEW, etc.
        const serviceIds = [
            'ADDON_DEFENSE_SPEECH',
            'ADDON_CODE_REVIEW',
            'ADDON_CHAPTER_EDIT',
            'ADDON_RUSH_DELIVERY'
        ];

        const purchasedServices: string[] = [];

        for (const payment of payments) {
            // Check which service ID is contained in the reference
            for (const serviceId of serviceIds) {
                const sanitized = serviceId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                if (payment.reference.toUpperCase().includes(sanitized)) {
                    purchasedServices.push(serviceId);
                    break; // Only match once per payment
                }
            }
        }

        return NextResponse.json({ services: [...new Set(purchasedServices)] });

    } catch (error) {
        console.error("[PurchasedServices] Error:", error);
        return NextResponse.json({ services: [] });
    }
}
