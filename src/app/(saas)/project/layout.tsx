import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { SaasShell } from "@/features/ui/SaasShell";

export default async function ProjectLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (!user) {
        const headersList = await headers();
        const currentPath = headersList.get("x-current-path") || "/project/builder";
        redirect(`/auth/login?callbackUrl=${encodeURIComponent(currentPath)}`);
    }

    return (
        <SaasShell user={user}>
            {children}
        </SaasShell>
    );
}
