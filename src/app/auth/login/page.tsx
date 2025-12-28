'use client';

import { useEffect } from 'react';
import { signInAction } from '@/features/auth/actions';

export default function LoginPage() {
    useEffect(() => {
        // Trigger sign-in redirect on client side to avoid server-side infinite loop
        signInAction();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
                <p className="text-slate-400">Redirecting to sign in...</p>
            </div>
        </div>
    );
}
