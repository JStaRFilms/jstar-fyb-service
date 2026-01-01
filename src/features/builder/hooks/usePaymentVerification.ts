'use client';

import { useState, useEffect } from 'react';

interface PaymentVerificationResult {
    isVerifying: boolean;
    verificationResult: 'success' | 'failed' | null;
}

/**
 * Custom hook to handle Paystack payment verification on page return.
 * Checks URL for ?reference= and verifies with backend.
 */
export function usePaymentVerification(
    isPaid: boolean,
    unlockPaywall: () => void
): PaymentVerificationResult {
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<'success' | 'failed' | null>(null);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const reference = searchParams.get('reference');

        if (reference && !isPaid && !isVerifying) {
            setIsVerifying(true);

            fetch('/api/pay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference })
            })
                .then(res => res.json())
                .then(resData => {
                    if (resData.success) {
                        unlockPaywall();
                        setVerificationResult('success');
                        // Clean URL
                        window.history.replaceState({}, '', '/project/builder');
                    } else {
                        console.error('Payment verification failed', resData);
                        setVerificationResult('failed');
                        alert(`Payment failed: ${resData.error || 'Unknown error'}`);
                    }
                })
                .catch(err => {
                    console.error('Payment verification error:', err);
                    setVerificationResult('failed');
                })
                .finally(() => setIsVerifying(false));
        }
    }, [isPaid, unlockPaywall]);

    return { isVerifying, verificationResult };
}
