import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { InAppNotificationService } from '@/services/inapp-notification.service';
import type {
    GetNotificationsOptions,
    NotificationType,
    NotificationPriority
} from '@/types/notification.types';

/**
 * GET /api/notifications
 * Fetch notifications for the authenticated user
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);

        const options: GetNotificationsOptions = {
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '20'),
            sortBy: (searchParams.get('sortBy') as 'createdAt' | 'readAt') || 'createdAt',
            sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
        };

        // Parse read status
        const readStatusParam = searchParams.get('readStatus');
        if (readStatusParam === 'true') {
            options.readStatus = true;
        } else if (readStatusParam === 'false') {
            options.readStatus = false;
        }

        // Parse type filter
        const typeParam = searchParams.get('type');
        if (typeParam) {
            options.type = typeParam as NotificationType;
        }

        const result = await InAppNotificationService.getUserNotifications(
            session.user.id,
            options
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to get notifications:', error);
        return NextResponse.json(
            { error: 'Failed to get notifications' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/notifications
 * Create a new notification (admin/system use)
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate required fields
        if (!body.userId || !body.type || !body.title || !body.message) {
            return NextResponse.json(
                { error: 'Missing required fields: userId, type, title, message' },
                { status: 400 }
            );
        }

        // Validate type
        const validTypes: NotificationType[] = ['payment', 'project', 'system', 'reminder', 'chapter'];
        if (!validTypes.includes(body.type)) {
            return NextResponse.json(
                { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
                { status: 400 }
            );
        }

        // Validate priority if provided
        if (body.priority) {
            const validPriorities: NotificationPriority[] = ['low', 'medium', 'high', 'urgent'];
            if (!validPriorities.includes(body.priority)) {
                return NextResponse.json(
                    { error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` },
                    { status: 400 }
                );
            }
        }

        const notification = await InAppNotificationService.createNotification({
            userId: body.userId,
            type: body.type,
            title: body.title,
            message: body.message,
            data: body.data,
            priority: body.priority,
        });

        return NextResponse.json(notification, { status: 201 });
    } catch (error) {
        console.error('Failed to create notification:', error);
        return NextResponse.json(
            { error: 'Failed to create notification' },
            { status: 500 }
        );
    }
}
