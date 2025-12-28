import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AdminProjectDetail } from "@/features/admin/components/AdminProjectDetail";

async function getProject(id: string) {
    return prisma.project.findUnique({
        where: { id },
        include: {
            documents: {
                orderBy: { createdAt: "desc" }
            },
            messages: {
                orderBy: { createdAt: "asc" }
            },
            outline: true
        }
    });
}

export default async function AdminProjectPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const project = await getProject(id);

    if (!project) {
        notFound();
    }

    return <AdminProjectDetail project={project} />;
}
