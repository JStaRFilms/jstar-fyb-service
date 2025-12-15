import { create } from 'zustand';

export type BuilderStep = 1 | 2 | 3;

interface BuilderState {
    currentStep: BuilderStep;
    topicKeyword: string;
    selectedTopic: string | null;
    generatedAbstract: string | null;
    generatedOutline: string[] | null;

    // Actions
    setKeyword: (keyword: string) => void;
    selectTopic: (topic: string) => void;
    setAbstract: (abstract: string) => void;
    setOutline: (outline: string[]) => void;
    nextStep: () => void;
    prevStep: () => void;
    reset: () => void;
}

export const useBuilderStore = create<BuilderState>((set) => ({
    currentStep: 1,
    topicKeyword: "",
    selectedTopic: null,
    generatedAbstract: null,
    generatedOutline: null,

    setKeyword: (keyword) => set({ topicKeyword: keyword }),
    selectTopic: (topic) => set({ selectedTopic: topic }),
    setAbstract: (abstract) => set({ generatedAbstract: abstract }),
    setOutline: (outline) => set({ generatedOutline: outline }),

    nextStep: () => set((state) => ({
        currentStep: Math.min(state.currentStep + 1, 3) as BuilderStep
    })),

    prevStep: () => set((state) => ({
        currentStep: Math.max(state.currentStep - 1, 1) as BuilderStep
    })),

    reset: () => set({
        currentStep: 1,
        topicKeyword: "",
        selectedTopic: null,
        generatedAbstract: null,
        generatedOutline: null
    })
}));
