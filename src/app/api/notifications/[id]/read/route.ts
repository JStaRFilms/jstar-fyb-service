import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { InAppNotificationService } from '@/services/inapp-notification.service';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * PATCH /api/notifications/[id]/read
 * Mark a specific notification as read
 */
export async function PATCH(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;

        const result = await InAppNotificationService.markAsRead(
            id,
            session.user.id
        );

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to mark as read' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
        return NextResponse.json(
            { error: 'Failed to mark notification as read' },
            { status: 500 }
        );
    }
}
