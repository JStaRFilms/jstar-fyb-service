'use client';

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import Link from "next/link";

function ServiceCompleteContent() {
    const searchParams = useSearchParams();
    const reference = searchParams.get('ref');

    const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');

    useEffect(() => {
        if (!reference) {
            setStatus('failed');
            return;
        }

        // Verify the payment
        fetch('/api/pay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStatus('success');
                } else {
                    setStatus('failed');
                }
            })
            .catch(() => setStatus('failed'));
    }, [reference]);

    return (
        <div className="min-h-screen bg-dark text-white flex items-center justify-center p-8">
            <div className="max-w-md w-full text-center">
                {status === 'verifying' && (
                    <div className="space-y-4">
                        <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
                        <h1 className="text-2xl font-bold">Verifying Payment...</h1>
                        <p className="text-gray-400">Please wait while we confirm your purchase.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold">Purchase Complete!</h1>
                        <p className="text-gray-400">
                            Thank you for your purchase. Our team will begin working on your request
                            and you'll be notified when it's ready.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/dashboard"
                                className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
                            >
                                Back to Dashboard
                            </Link>
                            <Link
                                href="/services"
                                className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors"
                            >
                                Browse More Services
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                            <XCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold">Payment Failed</h1>
                        <p className="text-gray-400">
                            There was an issue processing your payment. Please try again or contact support.
                        </p>
                        <Link
                            href="/services"
                            className="inline-block px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
                        >
                            Try Again
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ServiceCompletePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-dark text-white flex items-center justify-center p-8">
                <div className="max-w-md w-full text-center space-y-4">
                    <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
                    <h1 className="text-2xl font-bold">Loading...</h1>
                </div>
            </div>
        }>
            <ServiceCompleteContent />
        </Suspense>
    );
}
