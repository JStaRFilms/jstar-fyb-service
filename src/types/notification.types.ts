/**
 * Notification System Types
 * Shared types for in-app notifications
 */

// Notification priority levels
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

// Notification types/categories
export type NotificationType =
    | 'payment'
    | 'project'
    | 'system'
    | 'reminder'
    | 'chapter';

// Frequency for notification delivery
export type NotificationFrequency = 'immediate' | 'daily' | 'weekly' | 'never';

// Core notification interface (matches Prisma model)
export interface InAppNotification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, unknown> | null;
    priority: NotificationPriority;
    readAt: Date | null;
    dismissedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

// User notification preferences (matches Prisma model)
export interface UserNotificationPreference {
    id: string;
    userId: string;
    emailEnabled: boolean;
    inAppEnabled: boolean;
    categories?: Record<NotificationType, boolean> | null;
    frequency: NotificationFrequency;
    createdAt: Date;
    updatedAt: Date;
}

// API Request types
export interface CreateNotificationRequest {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    priority?: NotificationPriority;
}

export interface GetNotificationsOptions {
    page?: number;
    limit?: number;
    readStatus?: boolean | null; // null = all, true = read, false = unread
    type?: NotificationType;
    sortBy?: 'createdAt' | 'readAt';
    sortOrder?: 'asc' | 'desc';
}

export interface UpdatePreferencesRequest {
    emailEnabled?: boolean;
    inAppEnabled?: boolean;
    categories?: Record<NotificationType, boolean>;
    frequency?: NotificationFrequency;
}

// API Response types
export interface NotificationsResponse {
    notifications: InAppNotification[];
    unreadCount: number;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface NotificationActionResult {
    success: boolean;
    error?: string;
}
