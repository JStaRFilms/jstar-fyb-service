import { NextRequest, NextResponse } from 'next/server';
import { PaystackService } from '@/services/paystack.service';
import { BillingService, PaymentData } from '@/services/billing.service';

export async function POST(req: NextRequest) {
    try {
        // 1. Get signature and body
        const signature = req.headers.get('x-paystack-signature');
        if (!signature) {
            return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
        }

        const bodyText = await req.text();

        // 2. Verify signature
        if (!PaystackService.verifyWebhookSignature(bodyText, signature)) {
            console.error('[Webhook] Invalid signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const event = JSON.parse(bodyText);
        console.log(`[Webhook] Received event: ${event.event}`, event.data.reference);

        // 3. Handle events
        switch (event.event) {
            case 'charge.success':
                await BillingService.recordPayment(event.data as PaymentData);
                break;

            case 'transfer.success':
                // Optional: Handle transfers if we implement refunds or payouts
                console.log('[Webhook] Transfer success:', event.data);
                break;

            case 'subscription.create':
                // Optional: Handle value-added subscriptions if added later
                console.log('[Webhook] Subscription created:', event.data);
                break;

            default:
                console.log(`[Webhook] Unhandled event type: ${event.event}`);
        }

        return NextResponse.json({ received: true }, { status: 200 });

    } catch (error: any) {
        console.error('[Webhook] Error processing event:', error);
        return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
    }
}
