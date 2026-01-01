import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaystackService } from "@/services/paystack.service";
import { getCurrentUser } from "@/lib/auth-server";
import { PRICING_CONFIG } from "@/config/pricing";
import { z } from "zod";

const purchaseSchema = z.object({
    serviceId: z.string(),
    projectId: z.string(),
});

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { serviceId, projectId } = purchaseSchema.parse(body);

        // Find the service
        const service = PRICING_CONFIG.ADD_ONS.find(s => s.id === serviceId);
        if (!service) {
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        // Verify project ownership
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true, userId: true, topic: true }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        if (project.userId !== user.id) {
            return NextResponse.json({ error: "Not your project" }, { status: 403 });
        }

        // Generate unique reference
        const timestamp = Date.now();
        const safeServiceId = serviceId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
        const reference = `SVC${safeServiceId}${timestamp}`;

        // Create Payment record (tracks the transaction)
        const payment = await prisma.payment.create({
            data: {
                userId: user.id,
                projectId: projectId,
                reference: reference,
                amount: service.price,
                status: 'PENDING',
                currency: 'NGN',
                gatewayResponse: JSON.stringify({ type: 'addon', serviceId })
            }
        });

        // Initialize Paystack
        const paymentData = await PaystackService.initializePayment({
            email: user.email,
            amount: service.price,
            reference,
            metadata: {
                userId: user.id,
                projectId: projectId,
                serviceId: serviceId,
                serviceName: service.label,
                paymentId: payment.id,
                isAddOn: true,
                custom_fields: [
                    { display_name: "Service", variable_name: "service", value: service.label },
                    { display_name: "Project", variable_name: "project", value: project.topic }
                ]
            },
            callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/services/complete?ref=${reference}&service=${serviceId}`
        });

        return NextResponse.json({
            success: true,
            authorizationUrl: paymentData.authorizationUrl,
            reference: paymentData.reference
        });

    } catch (error) {
        console.error("[ServicePurchase] Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}
