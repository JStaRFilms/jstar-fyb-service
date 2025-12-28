import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaystackService } from "@/services/paystack.service";

export async function POST(req: Request) {
    try {
        const { reference } = await req.json();

        if (!reference) {
            return NextResponse.json({ error: "Reference required" }, { status: 400 });
        }

        // 1. Verify with Paystack
        const verifyRes = await PaystackService.verifyPayment(reference);

        if (!verifyRes.success || !verifyRes.data) {
            return NextResponse.json({ error: "Verification failed at gateway" }, { status: 400 });
        }

        const data = verifyRes.data;

        // 2. Validate Status
        if (data.status !== 'success') {
            // Update DB to Failed if it was pending
            await prisma.payment.updateMany({
                where: { reference: reference },
                data: { status: 'FAILED' }
            });
            return NextResponse.json({ error: "Transaction not successful" }, { status: 400 });
        }

        // 3. Update Database (Idempotent update)
        // Find the payment
        const payment = await prisma.payment.findUnique({
            where: { reference: reference },
            include: { project: true }
        });

        if (!payment) {
            return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
        }

        if (payment.status === 'SUCCESS') {
            return NextResponse.json({ success: true, message: "Already verified" });
        }

        // Update Payment and Project in transaction
        await prisma.$transaction([
            prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: 'SUCCESS',
                    gatewayResponse: JSON.stringify(data)
                }
            }),
            prisma.project.update({
                where: { id: payment.projectId },
                data: { isUnlocked: true }
            })
        ]);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("[PaymentVerify] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
