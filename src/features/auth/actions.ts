'use server';

import { getSignInUrl, getSignUpUrl, signOut } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';

export async function signInAction() {
    const url = await getSignInUrl();
    redirect(url);
}

export async function signUpAction() {
    const url = await getSignUpUrl();
    redirect(url);
}

export async function signOutAction() {
    await signOut();
    // Redirect happens automatically or we can force it
    // signOut() usually handles it or returns void? 
    // In AuthKit Next.js, signOut simply clears session.
    redirect('/');
}
