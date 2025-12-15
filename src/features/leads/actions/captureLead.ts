'use server';

import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const LeadSchema = z.object({
    whatsapp: z.string().regex(/^\d{10,15}$/, "Invalid WhatsApp number: must be 10-15 digits"),
    department: z.string(),
    topic: z.string(),
    twist: z.string(),
    complexity: z.number().min(1).max(5),
});

export type LeadData = z.infer<typeof LeadSchema>;

export async function captureLead(data: LeadData) {
    try {
        const validated = LeadSchema.parse(data);

        // Upsert style: if exists, we might want to update or just return it.
        // For now, let's try create, and if it fails due to unique constraint, fetch existing.
        try {
            const lead = await prisma.lead.create({
                data: {
                    whatsapp: validated.whatsapp,
                    department: validated.department,
                    topic: validated.topic,
                    twist: validated.twist,
                    complexity: validated.complexity,
                    status: "NEW"
                }
            });
            console.log("✅ Lead Captured:", lead.id);
            return { success: true, id: lead.id };
        } catch (dbError: any) {
            // Prisma Unique Constraint Violation Code P2002
            if (dbError.code === 'P2002') {
                console.log("ℹ️ Lead already exists, fetching existing...");
                const existing = await prisma.lead.findUnique({
                    where: { whatsapp: validated.whatsapp }
                });
                return { success: true, id: existing?.id, note: "Lead already existed" };
            }
            throw dbError;
        }

    } catch (error) {
        console.error("❌ Failed to capture lead:", error);
        return { success: false, error: "Failed to save lead" };
    }
}
