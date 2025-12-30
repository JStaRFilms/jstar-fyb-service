'use client';

import { useState } from 'react';
import type {
    UserNotificationPreference,
    UpdatePreferencesRequest,
    NotificationFrequency,
    NotificationType,
} from '@/types/notification.types';

interface NotificationPreferencesModalProps {
    preferences: UserNotificationPreference;
    onUpdate: (updates: UpdatePreferencesRequest) => Promise<void>;
    onClose: () => void;
}

const FREQUENCY_OPTIONS: { value: NotificationFrequency; label: string }[] = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'daily', label: 'Daily Digest' },
    { value: 'weekly', label: 'Weekly Summary' },
    { value: 'never', label: 'Never' },
];

const CATEGORY_OPTIONS: { value: NotificationType; label: string; description: string }[] = [
    { value: 'payment', label: 'Payments', description: 'Payment confirmations and updates' },
    { value: 'project', label: 'Projects', description: 'Project status and completions' },
    { value: 'chapter', label: 'Chapters', description: 'Chapter generation updates' },
    { value: 'reminder', label: 'Reminders', description: 'Deadline and action reminders' },
    { value: 'system', label: 'System', description: 'System announcements and updates' },
];

/**
 * Modal for managing notification preferences
 */
export function NotificationPreferencesModal({
    preferences,
    onUpdate,
    onClose,
}: NotificationPreferencesModalProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [localPrefs, setLocalPrefs] = useState({
        emailEnabled: preferences.emailEnabled,
        inAppEnabled: preferences.inAppEnabled,
        frequency: preferences.frequency as NotificationFrequency,
        categories: (preferences.categories || {
            payment: true,
            project: true,
            chapter: true,
            reminder: true,
            system: true,
        }) as Record<NotificationType, boolean>,
    });

    const handleSave = async () => {
        setIsUpdating(true);
        try {
            await onUpdate(localPrefs);
            onClose();
        } finally {
            setIsUpdating(false);
        }
    };

    const toggleCategory = (category: NotificationType) => {
        setLocalPrefs(prev => ({
            ...prev,
            categories: {
                ...prev.categories,
                [category]: !prev.categories[category],
            },
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-dark-card border border-white/10 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">
                        Notification Settings
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[60vh] space-y-6">
                    {/* Channel Toggles */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-300">Channels</h3>

                        <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 cursor-pointer">
                            <div>
                                <span className="text-sm text-white">In-App Notifications</span>
                                <p className="text-xs text-gray-500">Show notifications in the app</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={localPrefs.inAppEnabled}
                                onChange={e => setLocalPrefs(prev => ({ ...prev, inAppEnabled: e.target.checked }))}
                                className="w-5 h-5 rounded accent-brand-primary"
                            />
                        </label>

                        <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 cursor-pointer">
                            <div>
                                <span className="text-sm text-white">Email Notifications</span>
                                <p className="text-xs text-gray-500">Receive updates via email</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={localPrefs.emailEnabled}
                                onChange={e => setLocalPrefs(prev => ({ ...prev, emailEnabled: e.target.checked }))}
                                className="w-5 h-5 rounded accent-brand-primary"
                            />
                        </label>
                    </div>

                    {/* Frequency */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-300">Email Frequency</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {FREQUENCY_OPTIONS.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => setLocalPrefs(prev => ({ ...prev, frequency: option.value }))}
                                    className={`
                    p-3 rounded-xl text-sm transition-all
                    ${localPrefs.frequency === option.value
                                            ? 'bg-brand-primary text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }
                  `}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-300">Categories</h3>
                        <div className="space-y-2">
                            {CATEGORY_OPTIONS.map(category => (
                                <label
                                    key={category.value}
                                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 cursor-pointer"
                                >
                                    <div>
                                        <span className="text-sm text-white">{category.label}</span>
                                        <p className="text-xs text-gray-500">{category.description}</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={localPrefs.categories[category.value] ?? true}
                                        onChange={() => toggleCategory(category.value)}
                                        className="w-5 h-5 rounded accent-brand-primary"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-4 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isUpdating}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-brand-primary text-white font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
                    >
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
