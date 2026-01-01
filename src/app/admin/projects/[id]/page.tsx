import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AdminProjectDetail } from "@/features/admin/components/AdminProjectDetail";

// Force dynamic rendering to prevent static build failures
export const dynamic = 'force-dynamic';

async function getProject(id: string) {
    return prisma.project.findUnique({
        where: { id },
        include: {
            documents: {
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    fileName: true,
                    fileType: true,
                    fileUrl: true,
                    status: true,
                    createdAt: true,
                }
            },
            messages: {
                orderBy: { createdAt: "asc" }
            },
            outline: true
        }
    });
}

import { getProjectBillingDetails } from "@/app/actions/billing";

export default async function AdminProjectPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    // Parallel fetch for speed
    const [project, billing] = await Promise.all([
        getProject(id),
        getProjectBillingDetails(id)
    ]);

    if (!project) {
        notFound();
    }

    return <AdminProjectDetail project={project} billing={billing} />;
}
