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

    setStep: (step: BuilderStep) => void;
    updateData: (data: Partial<ProjectData>) => void;
    setGenerating: (isGenerating: boolean) => void;
    unlockPaywall: () => void;
}

export const useBuilderStore = create<BuilderState>((set) => ({
    step: 'TOPIC',
    data: {
        topic: '',
        twist: '',
        abstract: '',
        outline: []
    },
    isGenerating: false,
    isPaid: false,

    setStep: (step) => set({ step }),
    updateData: (newData) => set((state) => ({
        data: { ...state.data, ...newData }
    })),
    setGenerating: (isGenerating) => set({ isGenerating }),
    unlockPaywall: () => set({ isPaid: true })
}));
