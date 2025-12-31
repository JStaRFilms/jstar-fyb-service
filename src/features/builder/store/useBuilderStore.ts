import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Chapter } from '../schemas/outlineSchema';

export type BuilderStep = 'TOPIC' | 'ABSTRACT' | 'OUTLINE' | 'PAYWALL';
export type ProjectMode = 'DIY' | 'CONCIERGE' | null;
export type ProjectStatus = 'OUTLINE_GENERATED' | 'RESEARCH_IN_PROGRESS' | 'RESEARCH_COMPLETE' | 'WRITING_IN_PROGRESS' | 'PROJECT_COMPLETE';

// Re-export for consumers
export type { Chapter };

interface ProjectData {
    userId: string | null;
    projectId: string | null;
    topic: string;
    twist: string;
    abstract: string;
    outline: Chapter[];
    mode: ProjectMode;
    status: ProjectStatus;
}

interface BuilderState {
    step: BuilderStep;
    data: ProjectData;
    isGenerating: boolean;
    isPaid: boolean;
    isFromChat: boolean;

    setStep: (step: BuilderStep) => void;
    updateData: (data: Partial<ProjectData>) => void;
    setGenerating: (isGenerating: boolean) => void;
    unlockPaywall: () => void;
    setMode: (mode: ProjectMode) => void;
    hydrateFromChat: (userId?: string | null) => boolean;
    clearChatData: () => void;
    syncWithUser: (userId: string | null) => void;
}

const CHAT_HANDOFF_KEY = 'jstar_confirmed_topic';

export const useBuilderStore = create<BuilderState>()(
    persist(
        (set, get) => ({
            step: 'TOPIC',
            data: {
                userId: null,
                projectId: null,
                topic: '',
                twist: '',
                abstract: '',
                outline: [],
                mode: null,
                status: 'OUTLINE_GENERATED'
            },
            isGenerating: false,
            isPaid: false,
            isFromChat: false,

            setStep: (step) => set({ step }),
            updateData: (newData) => set((state) => ({
                data: { ...state.data, ...newData }
            })),
            setGenerating: (isGenerating) => set({ isGenerating }),
            unlockPaywall: () => set({ isPaid: true }),
            setMode: (mode) => set((state) => ({
                data: { ...state.data, mode }
            })),

            // Hydrate topic/twist from localStorage (set by chat handoff)
            hydrateFromChat: (currentUserId) => {
                if (typeof window === 'undefined') return false;

                const stored = localStorage.getItem(CHAT_HANDOFF_KEY);
                if (!stored) return false;

                try {
                    const { topic, twist, confirmedAt, userId: handoffUserId } = JSON.parse(stored);

                    // Check if data belongs to current user
                    if (currentUserId && handoffUserId && currentUserId !== handoffUserId) {
                        console.warn('[Builder] Handoff data mismatch (different user)');
                        localStorage.removeItem(CHAT_HANDOFF_KEY);
                        return false;
                    }

                    // Check if data is stale (older than 24 hours)
                    const confirmedDate = new Date(confirmedAt);
                    const now = new Date();
                    const hoursOld = (now.getTime() - confirmedDate.getTime()) / (1000 * 60 * 60);
                    if (hoursOld > 24) {
                        localStorage.removeItem(CHAT_HANDOFF_KEY);
                        return false;
                    }

                    // Only hydrate if we don't already have data
                    if (!get().data.topic) {
                        set({
                            data: { ...get().data, topic, twist: twist || '', userId: currentUserId || null },
                            isFromChat: true
                        });
                        return true;
                    }
                    return false;
                } catch (e) {
                    console.error('[Builder] Failed to parse chat handoff data:', e);
                    localStorage.removeItem(CHAT_HANDOFF_KEY);
                    return false;
                }
            },

            // Clear chat handoff data and reset form
            clearChatData: () => {
                localStorage.removeItem(CHAT_HANDOFF_KEY);
                set({
                    data: { userId: get().data.userId, projectId: null, topic: '', twist: '', abstract: '', outline: [], mode: null, status: 'OUTLINE_GENERATED' },
                    isFromChat: false,
                    step: 'TOPIC'
                });
            },

            // Sync state with current authenticated user
            syncWithUser: (userId) => {
                const currentData = get().data;

                // CASE 1: Transitioning from Anonymous to Authenticated
                // If we have valid generated content but no user owner, allow the new user to claim it
                if (currentData.userId === null && userId !== null && currentData.topic) {
                    console.log('[Builder] Claiming anonymous session data for user', userId);
                    set((state) => ({
                        data: { ...state.data, userId }
                    }));
                    return;
                }

                // CASE 2: User changed (Account switch or Logout)
                // If user changed, or if we have data but no userId associated, or if we are switching to null (logout)
                if (currentData.userId !== userId) {
                    console.log('[Builder] Account change detected. Syncing store.', { old: currentData.userId, new: userId });
                    set({
                        data: {
                            userId,
                            projectId: null,
                            topic: '',
                            twist: '',
                            abstract: '',
                            outline: [],
                            mode: null,
                            status: 'OUTLINE_GENERATED'
                        },
                        step: 'TOPIC',
                        isPaid: false,
                        isFromChat: false
                    });
                    // Also clear potential chat handoff if switching accounts
                    localStorage.removeItem(CHAT_HANDOFF_KEY);
                }
            }
        }),
        {
            name: 'jstar-builder-storage', // unique name
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // Only persist data and step, not UI flags like isGenerating
                step: state.step,
                data: state.data,
                isPaid: state.isPaid,
                isFromChat: state.isFromChat
            }),
        }
    )
);
