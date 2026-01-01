import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { SaasShell } from "@/features/ui/SaasShell";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (!user) {
        const headersList = await headers();
        const currentPath = headersList.get("x-current-path") || "/dashboard";
        redirect(`/auth/login?callbackUrl=${encodeURIComponent(currentPath)}`);
    }

    const latestProject = await prisma.project.findFirst({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' }
    });

    const hasActiveProject = !!latestProject;

    return (
        <SaasShell user={user} hasActiveProject={hasActiveProject}>
            {children}
        </SaasShell>
    );
}
