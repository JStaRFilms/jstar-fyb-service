import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { InAppNotificationService } from '@/services/inapp-notification.service';
import type { NotificationFrequency } from '@/types/notification.types';

/**
 * GET /api/notifications/preferences
 * Get notification preferences for the authenticated user
 */
export async function GET() {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const preferences = await InAppNotificationService.getUserPreferences(
            session.user.id
        );

        return NextResponse.json(preferences);
    } catch (error) {
        console.error('Failed to get notification preferences:', error);
        return NextResponse.json(
            { error: 'Failed to get notification preferences' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/notifications/preferences
 * Update notification preferences for the authenticated user
 */
export async function PUT(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate frequency if provided
        if (body.frequency) {
            const validFrequencies: NotificationFrequency[] = ['immediate', 'daily', 'weekly', 'never'];
            if (!validFrequencies.includes(body.frequency)) {
                return NextResponse.json(
                    { error: `Invalid frequency. Must be one of: ${validFrequencies.join(', ')}` },
                    { status: 400 }
                );
            }
        }

        const result = await InAppNotificationService.updatePreferences(
            session.user.id,
            {
                emailEnabled: body.emailEnabled,
                inAppEnabled: body.inAppEnabled,
                categories: body.categories,
                frequency: body.frequency,
            }
        );

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to update preferences' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to update notification preferences:', error);
        return NextResponse.json(
            { error: 'Failed to update notification preferences' },
            { status: 500 }
        );
    }
}
