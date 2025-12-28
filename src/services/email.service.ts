import { Resend } from 'resend';
import { PaymentReceiptEmail } from '@/emails/PaymentReceipt';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'J-Star Projects <noreply@jstarstudios.com>'; // Or 'onboarding@resend.dev' for testing

interface SendReceiptParams {
    email: string;
    name: string;
    amount: number;
    reference: string;
    projectTopic: string;
    date: Date;
}

export const EmailService = {
    async sendPaymentReceipt({ email, name, amount, reference, projectTopic, date }: SendReceiptParams) {
        if (!process.env.RESEND_API_KEY) {
            console.warn('[EmailService] RESEND_API_KEY missing, skipping email');
            return false;
        }

        try {
            const data = await resend.emails.send({
                from: FROM_EMAIL,
                to: email,
                subject: 'Payment Receipt - J-Star Projects',
                react: PaymentReceiptEmail({
                    name,
                    amount,
                    reference,
                    projectTopic,
                    date
                }) as React.ReactElement,
            });

            if (data.error) {
                console.error('[EmailService] Resend error:', data.error);
                return false;
            }

            console.log('[EmailService] Email sent:', data.data?.id);
            return true;
        } catch (error) {
            console.error('[EmailService] Failed to send email:', error);
            return false;
        }
    }
};
