'use server';

import { prisma } from '@/lib/prisma';
import { PRICING_CONFIG, PricingTrack } from '@/config/pricing';

export type BillingDetails = {
    totalPaid: number;
    currentTrack: PricingTrack;
    isAgencyMode: boolean;
};

export async function getProjectBillingDetails(projectId: string): Promise<BillingDetails> {
    if (!projectId) {
        return { totalPaid: 0, currentTrack: 'PAPER', isAgencyMode: false };
    }

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                payments: {
                    where: { status: 'SUCCESS' } // Only count successful payments
                }
            }
        });

        if (!project) {
            throw new Error('Project not found');
        }

        const totalPaid = project.payments.reduce((sum, p) => sum + p.amount, 0);

        // Infer Track based on payment history
        // Heuristic: If they paid >= 20k (Software DIY price), assume Software track.
        // Otherwise default to Paper track.
        const currentTrack: PricingTrack = totalPaid >= PRICING_CONFIG.SAAS.SOFTWARE.price
            ? 'SOFTWARE'
            : 'PAPER';

        const isAgencyMode = project.mode === 'CONCIERGE';

        return {
            totalPaid,
            currentTrack,
            isAgencyMode
        };

    } catch (error) {
        console.error('Failed to get billing details:', error);
        return { totalPaid: 0, currentTrack: 'PAPER', isAgencyMode: false };
    }
}
