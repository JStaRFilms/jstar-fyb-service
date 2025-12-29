'use client';

import { WifiOff } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function OfflineIndicator() {
    const { isOffline } = useNetworkStatus();
    const [shouldRender, setShouldRender] = useState(false);

    // Delay showing the offline indicator slightly to avoid flickering on page load or quick blips
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (isOffline) {
            timeout = setTimeout(() => setShouldRender(true), 2000);
        } else {
            setShouldRender(false);
        }
        return () => clearTimeout(timeout);
    }, [isOffline]);

    if (!shouldRender) return null;

    return (
        <div className={cn(
            "fixed top-0 left-0 right-0 z-[100] bg-orange-500 text-white text-xs font-medium py-1.5 px-4 text-center shadow-md flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300",
        )}>
            <WifiOff className="w-3 h-3" />
            <span>You are currently offline. Check your internet connection.</span>
        </div>
    );
}
