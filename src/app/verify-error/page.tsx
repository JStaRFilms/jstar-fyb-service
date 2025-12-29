'use client';

import { useState } from 'react';
import { ApiError, PaymentError } from '@/lib/errors';

export default function VerifyErrorPage() {
    const [shouldThrow, setShouldThrow] = useState<string | null>(null);

    if (shouldThrow === 'generic') {
        throw new Error('This is a generic verification error.');
    }
    if (shouldThrow === 'api') {
        throw new ApiError('API Request Failed', 500, 'We could not fetch the verification data. Please try again.');
    }
    if (shouldThrow === 'payment') {
        throw new PaymentError('Payment Declined', 'card_declined');
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
            <h1 className="text-2xl font-bold font-display">Error Verification Page</h1>
            <p className="text-muted-foreground">Click a button to trigger an error and test the ErrorBoundary.</p>

            <div className="flex flex-wrap gap-4">
                <button
                    onClick={() => setShouldThrow('generic')}
                    className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20"
                >
                    Generic Error
                </button>
                <button
                    onClick={() => setShouldThrow('api')}
                    className="px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg hover:bg-blue-500/20"
                >
                    API Error
                </button>
                <button
                    onClick={() => setShouldThrow('payment')}
                    className="px-4 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg hover:bg-green-500/20"
                >
                    Payment Error
                </button>
            </div>

            <div className="mt-8 p-4 border rounded-lg max-w-md">
                <h2 className="font-bold mb-2">Offline Test</h2>
                <p className="text-sm text-gray-500">
                    To test the offline indicator:
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>Open DevTools (F12)</li>
                        <li>Go to the Network tab</li>
                        <li>Change "No throttling" to "Offline"</li>
                        <li>Wait 2 seconds for the banner to appear</li>
                    </ol>
                </p>
            </div>
        </div>
    );
}
