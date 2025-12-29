import { auth } from "./auth";
import { headers } from "next/headers";

/**
 * Get the current session on the server side.
 * Works in API routes and Server Actions.
 */
export async function getSession() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    return session;
}

/**
 * Get the current user on the server side.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
    const session = await getSession();
    return session?.user ?? null;
}
