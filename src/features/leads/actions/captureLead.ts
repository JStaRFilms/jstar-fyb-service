'use server';

import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const LeadSchema = z.object({
    whatsapp: z.string().min(10, "Invalid WhatsApp number"),
    department: z.string(),
    topic: z.string(),
    twist: z.string(),
    complexity: z.number().min(1).max(5),
});

export type LeadData = z.infer<typeof LeadSchema>;

export async function captureLead(data: LeadData) {
    try {
        const validated = LeadSchema.parse(data);

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

        // Future: Discord Webhook here
        // if (process.env.DISCORD_WEBHOOK_URL) ...

        return { success: true, id: lead.id };
    } catch (error) {
        console.error("❌ Failed to capture lead:", error);
        return { success: false, error: "Failed to save lead" };
    }
}
