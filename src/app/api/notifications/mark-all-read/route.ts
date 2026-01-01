import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { InAppNotificationService } from '@/services/inapp-notification.service';

/**
 * PATCH /api/notifications/mark-all-read
 * Mark all notifications as read for the authenticated user
 */
export async function PATCH() {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const result = await InAppNotificationService.markAllAsRead(session.user.id);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to mark all as read' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
        return NextResponse.json(
            { error: 'Failed to mark all notifications as read' },
            { status: 500 }
        );
    }
}
