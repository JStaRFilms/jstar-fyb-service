'use client';

import { useMemo } from 'react';
import type { InAppNotification, NotificationPriority } from '@/types/notification.types';

interface NotificationItemProps {
    notification: InAppNotification;
    onMarkAsRead: () => void;
    onDelete: () => void;
}

/**
 * Format relative time from date
 */
function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
}

/**
 * Get priority color classes
 */
function getPriorityStyles(priority: NotificationPriority): {
    dotColor: string;
    bgColor: string;
} {
    switch (priority) {
        case 'urgent':
            return { dotColor: 'bg-red-500', bgColor: 'bg-red-500/10' };
        case 'high':
            return { dotColor: 'bg-orange-500', bgColor: 'bg-orange-500/10' };
        case 'medium':
            return { dotColor: 'bg-blue-500', bgColor: 'bg-blue-500/10' };
        case 'low':
        default:
            return { dotColor: 'bg-gray-400', bgColor: 'bg-gray-400/10' };
    }
}

/**
 * Get notification type icon
 */
function getTypeIcon(type: string): string {
    switch (type) {
        case 'payment':
            return '💰';
        case 'project':
            return '📁';
        case 'chapter':
            return '📝';
        case 'reminder':
            return '⏰';
        case 'system':
        default:
            return '🔔';
    }
}

/**
 * Individual notification item component
 */
export function NotificationItem({
    notification,
    onMarkAsRead,
    onDelete,
}: NotificationItemProps) {
    const isRead = !!notification.readAt;
    const priorityStyles = useMemo(
        () => getPriorityStyles(notification.priority as NotificationPriority),
        [notification.priority]
    );
    const timeAgo = useMemo(
        () => formatTimeAgo(notification.createdAt),
        [notification.createdAt]
    );
    const icon = useMemo(
        () => getTypeIcon(notification.type),
        [notification.type]
    );

    return (
        <div
            className={`
        relative p-4 border-b border-white/5 transition-colors
        ${isRead ? 'bg-transparent opacity-70' : 'bg-white/[0.02]'}
        hover:bg-white/[0.04]
      `}
        >
            {/* Unread indicator */}
            {!isRead && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-brand-primary" />
            )}

            <div className="flex items-start gap-3 pl-4">
                {/* Icon */}
                <div
                    className={`
            flex-shrink-0 w-10 h-10 rounded-full
            flex items-center justify-center text-lg
            ${priorityStyles.bgColor}
          `}
                >
                    {icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        {/* Priority dot */}
                        <div className={`w-2 h-2 rounded-full ${priorityStyles.dotColor}`} />

                        {/* Title */}
                        <h4 className="font-medium text-sm text-white truncate">
                            {notification.title}
                        </h4>
                    </div>

                    {/* Message */}
                    <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                        {notification.message}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{timeAgo}</span>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            {!isRead && (
                                <button
                                    onClick={onMarkAsRead}
                                    className="text-xs text-brand-primary hover:text-brand-primary/80 transition-colors"
                                >
                                    Mark read
                                </button>
                            )}
                            <button
                                onClick={onDelete}
                                className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
