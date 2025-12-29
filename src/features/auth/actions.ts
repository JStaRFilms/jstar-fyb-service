'use server';

import { redirect } from 'next/navigation';

// Better Auth handles sign-in/sign-up via client-side authClient.signIn/signUp
// These server actions are now just redirects to the auth pages

export async function signInAction() {
    redirect('/login');
}

export async function signUpAction() {
    redirect('/signup');
}

export async function signOutAction() {
    // Better Auth signOut is handled client-side via authClient.signOut()
    // This server action just redirects after clearing session
    redirect('/');
}
