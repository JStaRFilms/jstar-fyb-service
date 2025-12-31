import React from "react";
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
        redirect("/auth/login");
    }

    return (
        <SaasShell user={user}>
            {children}
        </SaasShell>
    );
}
