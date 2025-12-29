import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * Paystack Webhook Handler
 * 
 * Receives events from Paystack to ensure payments are recorded
 * even if user closes their browser before returning to callback.
 * 
 * Paystack webhook docs: https://paystack.com/docs/payments/webhooks
 */

// Verify Paystack webhook signature
function verifyPaystackSignature(body: string, signature: string | null): boolean {
    if (!signature) return false;

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
        console.error('[Webhook] PAYSTACK_SECRET_KEY is not set');
        return false;
    }

    const hash = crypto
        .createHmac('sha512', secret)
        .update(body)
        .digest('hex');

    return hash === signature;
}

export async function POST(req: NextRequest) {
    try {
        // 1. Get raw body for signature verification
        const body = await req.text();
        const signature = req.headers.get('x-paystack-signature');

        // 2. Verify signature
        if (!verifyPaystackSignature(body, signature)) {
            console.warn('[Webhook] Invalid signature received');
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            );
        }

        // 3. Parse event
        const event = JSON.parse(body);
        console.log(`[Webhook] Received event: ${event.event}`);

        // 4. Handle charge.success event
        if (event.event === 'charge.success') {
            const data = event.data;
            const reference = data.reference;

            if (!reference) {
                console.error('[Webhook] No reference in event data');
                return NextResponse.json({ received: true });
            }

            // 5. Find payment record
            const payment = await prisma.payment.findUnique({
                where: { reference },
                include: {
                    project: true,
                    user: true
                }
            });

            if (!payment) {
                console.warn(`[Webhook] Payment not found for reference: ${reference}`);
                return NextResponse.json({ received: true });
            }

            // 6. Idempotent check - skip if already processed
            if (payment.status === 'SUCCESS') {
                console.log(`[Webhook] Payment already processed: ${reference}`);
                return NextResponse.json({ received: true, message: 'Already processed' });
            }

            // 7. Update Payment and unlock Project atomically
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

            console.log(`[Webhook] Payment verified and project unlocked: ${reference}`);

            // Send Email Receipt
            try {
                // Dynamic import to avoid circular dep issues in some edge cases, though standard import is fine
                const { EmailService } = await import('@/services/email.service');
                await EmailService.sendPaymentReceipt({
                    email: payment.user.email,
                    name: payment.user.name || 'Student',
                    amount: payment.amount,
                    reference: payment.reference,
                    projectTopic: payment.project.topic,
                    date: new Date()
                });
            } catch (err) {
                console.error('[Webhook] Failed to send receipt email:', err);
                // Don't fail the request, just log
            }
        }

        // Always return 200 to acknowledge receipt
        return NextResponse.json({ received: true });

    } catch (error: unknown) {
        console.error('[Webhook] Error processing webhook:', error);
        // Still return 200 to prevent Paystack from retrying
        // Log error for debugging but don't expose details
        return NextResponse.json({ received: true, error: 'Processing error logged' });
    }
}

// Paystack only uses POST for webhooks
export async function GET() {
    return NextResponse.json(
        { message: 'Paystack webhook endpoint. Use POST.' },
        { status: 405 }
    );
}
