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

        // Atomic Upsert: If exists, do nothing (return it), else create.
        const lead = await prisma.lead.upsert({
            where: { whatsapp: validated.whatsapp },
            update: {}, // No updates if found
            create: {
                whatsapp: validated.whatsapp,
                department: validated.department,
                topic: validated.topic,
                twist: validated.twist,
                complexity: validated.complexity,
                status: "NEW"
            }
        });

        console.log(`✅ Lead Captured (ID: ${lead.id})`);
        return { success: true, id: lead.id };

    } catch (error) {
        console.error("❌ Failed to capture lead:", error);
        return { success: false, error: "Failed to save lead" };
    }
}
