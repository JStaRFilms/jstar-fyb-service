import { prisma } from "@/lib/prisma";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface InitializePaymentParams {
    email: string;
    amount: number; // in Naira (will be converted to kobo)
    reference: string;
    callbackUrl?: string;
    metadata?: any;
}

export const PaystackService = {
    async initializePayment({ email, amount, reference, callbackUrl, metadata }: InitializePaymentParams) {
        if (!PAYSTACK_SECRET) throw new Error("PAYSTACK_SECRET_KEY is missing");

        const params = {
            email,
            amount: amount * 100, // Convert to kobo
            reference,
            callback_url: callbackUrl || `${APP_URL}/project/builder`,
            metadata: JSON.stringify(metadata || {}),
        };

        const res = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        const data = await res.json();

        if (!res.ok || !data.status) {
            console.error('[PaystackService] Init failed:', data);
            throw new Error(data.message || 'Payment initialization failed');
        }

        return {
            authorizationUrl: data.data.authorization_url,
            accessCode: data.data.access_code,
            reference: data.data.reference,
        };
    },

    async verifyPayment(reference: string) {
        if (!PAYSTACK_SECRET) throw new Error("PAYSTACK_SECRET_KEY is missing");

        const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET}`,
            },
        });

        const data = await res.json();

        if (!res.ok || !data.status) {
            return { success: false, data: null };
        }

        // Return the full transaction data
        return { success: true, data: data.data };
    }
};
