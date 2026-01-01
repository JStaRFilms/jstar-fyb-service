'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
    InAppNotification,
    NotificationsResponse,
    UserNotificationPreference,
    UpdatePreferencesRequest,
} from '@/types/notification.types';

interface UseNotificationsOptions {
    autoRefresh?: boolean;
    refreshInterval?: number; // in milliseconds
}

interface UseNotificationsReturn {
    notifications: InAppNotification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    preferences: UserNotificationPreference | null;

    // Actions
    refresh: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (notificationId: string) => Promise<void>;
    updatePreferences: (updates: UpdatePreferencesRequest) => Promise<void>;
    loadPreferences: () => Promise<void>;
}

/**
 * Hook for managing notifications state and actions
 */
export function useNotifications(
    options: UseNotificationsOptions = {}
): UseNotificationsReturn {
    const { autoRefresh = false, refreshInterval = 30000 } = options;

    const [notifications, setNotifications] = useState<InAppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [preferences, setPreferences] = useState<UserNotificationPreference | null>(null);

    /**
     * Fetch notifications from API
     */
    const refresh = useCallback(async () => {
        try {
            setError(null);
            const response = await fetch('/api/notifications');

            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }

            const data: NotificationsResponse = await response.json();
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            console.error('Failed to fetch notifications:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Load user preferences
     */
    const loadPreferences = useCallback(async () => {
        try {
            const response = await fetch('/api/notifications/preferences');

            if (!response.ok) {
                throw new Error('Failed to fetch preferences');
            }

            const data: UserNotificationPreference = await response.json();
            setPreferences(data);
        } catch (err) {
            console.error('Failed to fetch preferences:', err);
        }
    }, []);

    /**
     * Mark a single notification as read
     */
    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PATCH',
            });

            if (!response.ok) {
                throw new Error('Failed to mark as read');
            }

            // Update local state optimistically
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, readAt: new Date() } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
            // Refresh to sync state
            await refresh();
        }
    }, [refresh]);

    /**
     * Mark all notifications as read
     */
    const markAllAsRead = useCallback(async () => {
        try {
            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'PATCH',
            });

            if (!response.ok) {
                throw new Error('Failed to mark all as read');
            }

            // Update local state optimistically
            setNotifications(prev =>
                prev.map(n => ({ ...n, readAt: n.readAt || new Date() }))
            );
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
            // Refresh to sync state
            await refresh();
        }
    }, [refresh]);

    /**
     * Delete a notification
     */
    const deleteNotification = useCallback(async (notificationId: string) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete notification');
            }

            // Update local state optimistically
            const notification = notifications.find(n => n.id === notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));

            if (notification && !notification.readAt) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Failed to delete notification:', err);
            // Refresh to sync state
            await refresh();
        }
    }, [notifications, refresh]);

    /**
     * Update notification preferences
     */
    const updatePreferences = useCallback(async (updates: UpdatePreferencesRequest) => {
        try {
            const response = await fetch('/api/notifications/preferences', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                throw new Error('Failed to update preferences');
            }

            // Update local state
            setPreferences(prev => prev ? { ...prev, ...updates } : null);
        } catch (err) {
            console.error('Failed to update preferences:', err);
            // Refresh to sync state
            await loadPreferences();
        }
    }, [loadPreferences]);

    // Initial fetch
    useEffect(() => {
        refresh();
        loadPreferences();
    }, [refresh, loadPreferences]);

    // Auto-refresh interval
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(refresh, refreshInterval);
        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, refresh]);

    return {
        notifications,
        unreadCount,
        isLoading,
        error,
        preferences,
        refresh,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        updatePreferences,
        loadPreferences,
    };
}
