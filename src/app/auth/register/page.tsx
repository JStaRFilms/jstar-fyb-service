'use client';

import { useEffect } from 'react';
import { signUpAction } from '@/features/auth/actions';

export default function RegisterPage() {
    useEffect(() => {
        // Trigger sign-up redirect on client side to avoid server-side infinite loop
        signUpAction();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
                <p className="text-slate-400">Redirecting to sign up...</p>
            </div>
        </div>
    );
}
