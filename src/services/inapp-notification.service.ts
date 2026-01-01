import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type {
    InAppNotification,
    CreateNotificationRequest,
    GetNotificationsOptions,
    NotificationsResponse,
    UserNotificationPreference,
    UpdatePreferencesRequest,
    NotificationActionResult,
} from '@/types/notification.types';

/**
 * In-App Notification Service
 * Handles user-facing notifications stored in the database
 */
export const InAppNotificationService = {
    /**
     * Create a new notification for a user
     */
    async createNotification(
        request: CreateNotificationRequest
    ): Promise<InAppNotification> {
        const notification = await prisma.inAppNotification.create({
            data: {
                userId: request.userId,
                type: request.type,
                title: request.title,
                message: request.message,
                data: request.data as Prisma.InputJsonValue | undefined,
                priority: request.priority || 'medium',
            },
        });

        return notification as InAppNotification;
    },

    /**
     * Get notifications for a user with pagination and filtering
     */
    async getUserNotifications(
        userId: string,
        options: GetNotificationsOptions = {}
    ): Promise<NotificationsResponse> {
        const {
            page = 1,
            limit = 20,
            readStatus = null,
            type,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = options;

        const skip = (page - 1) * limit;

        // Build where clause
        const where: Record<string, unknown> = { userId };

        if (readStatus !== null) {
            where.readAt = readStatus ? { not: null } : null;
        }

        if (type) {
            where.type = type;
        }

        // Get notifications with pagination
        const [notifications, total, unreadCount] = await Promise.all([
            prisma.inAppNotification.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.inAppNotification.count({ where }),
            prisma.inAppNotification.count({
                where: { userId, readAt: null },
            }),
        ]);

        return {
            notifications: notifications as InAppNotification[],
            unreadCount,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    /**
     * Get unread notification count for a user
     */
    async getUnreadCount(userId: string): Promise<number> {
        return prisma.inAppNotification.count({
            where: { userId, readAt: null },
        });
    },

    /**
     * Mark a specific notification as read
     */
    async markAsRead(
        notificationId: string,
        userId: string
    ): Promise<NotificationActionResult> {
        try {
            await prisma.inAppNotification.updateMany({
                where: { id: notificationId, userId },
                data: { readAt: new Date() },
            });
            return { success: true };
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    },

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string): Promise<NotificationActionResult> {
        try {
            await prisma.inAppNotification.updateMany({
                where: { userId, readAt: null },
                data: { readAt: new Date() },
            });
            return { success: true };
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    },

    /**
     * Delete a notification
     */
    async deleteNotification(
        notificationId: string,
        userId: string
    ): Promise<NotificationActionResult> {
        try {
            await prisma.inAppNotification.deleteMany({
                where: { id: notificationId, userId },
            });
            return { success: true };
        } catch (error) {
            console.error('Failed to delete notification:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    },

    /**
     * Get user notification preferences (or create defaults)
     */
    async getUserPreferences(
        userId: string
    ): Promise<UserNotificationPreference> {
        let preferences = await prisma.userNotificationPreference.findUnique({
            where: { userId },
        });

        // Create default preferences if not found
        if (!preferences) {
            preferences = await prisma.userNotificationPreference.create({
                data: {
                    userId,
                    emailEnabled: true,
                    inAppEnabled: true,
                    frequency: 'immediate',
                    categories: {
                        payment: true,
                        project: true,
                        system: true,
                        reminder: true,
                        chapter: true,
                    },
                },
            });
        }

        return preferences as UserNotificationPreference;
    },

    /**
     * Update user notification preferences
     */
    async updatePreferences(
        userId: string,
        updates: UpdatePreferencesRequest
    ): Promise<NotificationActionResult> {
        try {
            await prisma.userNotificationPreference.upsert({
                where: { userId },
                update: updates,
                create: {
                    userId,
                    emailEnabled: updates.emailEnabled ?? true,
                    inAppEnabled: updates.inAppEnabled ?? true,
                    frequency: updates.frequency ?? 'immediate',
                    categories: updates.categories ?? {
                        payment: true,
                        project: true,
                        system: true,
                        reminder: true,
                        chapter: true,
                    },
                },
            });
            return { success: true };
        } catch (error) {
            console.error('Failed to update preferences:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    },

    /**
     * Create notifications for common events
     */
    async notifyPaymentSuccess(
        userId: string,
        data: { amount: number; reference: string; projectId?: string }
    ): Promise<InAppNotification> {
        return this.createNotification({
            userId,
            type: 'payment',
            title: 'Payment Successful',
            message: `Your payment of ₦${data.amount.toLocaleString()} was successful.`,
            data,
            priority: 'high',
        });
    },

    async notifyChapterGenerated(
        userId: string,
        data: { chapterTitle: string; projectId: string }
    ): Promise<InAppNotification> {
        return this.createNotification({
            userId,
            type: 'chapter',
            title: 'Chapter Generated',
            message: `Your chapter "${data.chapterTitle}" is ready for review.`,
            data,
            priority: 'medium',
        });
    },

    async notifyProjectComplete(
        userId: string,
        data: { projectId: string; projectTitle: string }
    ): Promise<InAppNotification> {
        return this.createNotification({
            userId,
            type: 'project',
            title: 'Project Complete',
            message: `Your project "${data.projectTitle}" has been completed!`,
            data,
            priority: 'high',
        });
    },

    async notifySystemMessage(
        userId: string,
        title: string,
        message: string,
        data?: Record<string, unknown>
    ): Promise<InAppNotification> {
        return this.createNotification({
            userId,
            type: 'system',
            title,
            message,
            data,
            priority: 'low',
        });
    },
};
