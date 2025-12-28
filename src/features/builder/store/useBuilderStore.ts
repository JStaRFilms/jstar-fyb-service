import { create } from 'zustand';

export type BuilderStep = 'TOPIC' | 'ABSTRACT' | 'OUTLINE' | 'PAYWALL';

interface ProjectData {
    topic: string;
    twist: string;
    abstract: string;
    outline: any[]; // define stricter type later
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
    hydrateFromChat: () => boolean;
    clearChatData: () => void;
}

const CHAT_HANDOFF_KEY = 'jstar_confirmed_topic';

export const useBuilderStore = create<BuilderState>((set, get) => ({
    step: 'TOPIC',
    data: {
        topic: '',
        twist: '',
        abstract: '',
        outline: []
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

    // Hydrate topic/twist from localStorage (set by chat handoff)
    hydrateFromChat: () => {
        if (typeof window === 'undefined') return false;

        const stored = localStorage.getItem(CHAT_HANDOFF_KEY);
        if (!stored) return false;

        try {
            const { topic, twist, confirmedAt } = JSON.parse(stored);

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
                    data: { ...get().data, topic, twist: twist || '' },
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
            data: { topic: '', twist: '', abstract: '', outline: [] },
            isFromChat: false,
            step: 'TOPIC'
        });
    }
}));
