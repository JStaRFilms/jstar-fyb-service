import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaystackService } from "@/services/paystack.service";
import { NotificationService } from "@/services/notification.service";
import { z } from "zod";

const sendPaymentBodySchema = z.object({
    amount: z.number().positive(),
    tier: z.string(), // "Basic", "Standard", "Premium"
});

export async function POST(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const leadId = params.id;
        const body = await req.json();
        const { amount, tier } = sendPaymentBodySchema.parse(body);

        // 1. Fetch Lead
        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
        });

        if (!lead) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        // 2. Determine Email
        let email = "hey@jstarstudios.com"; // Default Fallback
        let userId = lead.userId;

        if (userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { email: true },
            });
            if (user && user.email) {
                email = user.email;
            }
        }

        // 3. Generate Reference
        const timestamp = Date.now();
        // Sanitize characters: Only alphanumeric, dash, dot, =, _ allowed. 
        // We replace any other char with empty string, but IDs are usually safe.
        // Format: FYB-TIER-LEADIDSHORT-TIMESTAMP
        const safeTier = (tier || "UNKNOWN").toUpperCase().replace(/[^A-Z0-9]/g, '');
        const safeLeadId = (leadId || "UNKNOWN").slice(0, 8).replace(/[^a-zA-Z0-9]/g, '');
        // Use strictly alphanumeric reference to prevent "Invalid character" errors
        const reference = `FYB${safeTier}${safeLeadId}${timestamp}`;

        // 4. Initialize Paystack
        const paymentData = await PaystackService.initializePayment({
            email,
            amount,
            reference,
            metadata: {
                leadId,
                tier,
                custom_fields: [
                    { display_name: "Project Topic", variable_name: "project_topic", value: lead.topic },
                    { display_name: "Tier", variable_name: "tier", value: tier }
                ]
            },
            callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/project/builder?payment_ref=${reference}` // Redirect back to builder
        });

        // 5. Notify (Optional - Internal Log)
        await NotificationService.notifyPaymentLinkSent(leadId, amount, tier);

        return NextResponse.json({
            success: true,
            authorizationUrl: paymentData.authorizationUrl,
            reference: paymentData.reference,
            emailUsed: email
        });

    } catch (error) {
        console.error("[SendPaymentLink] Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}
