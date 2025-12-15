# FR-004: SaaS Project Builder (The Wizard)

## Goal
To build a multi-step "Wizard" processing tool where users can generate their project materials self-service.

## Logic Flow
1.  **Step 1: Topic Selection**
    *   User inputs interest (e.g., "Crypto").
    *   System generates 3 card options.
    *   User selects one.
2.  **Step 2: Abstract Generation**
    *   System simulates "Writing Abstract...".
    *   Displays full abstract.
    *   User clicks "Next".
3.  **Step 3: Chapter 1 Outline**
    *   System generates Introduction, Problem Statement, Objectives.
    *   **PAYWALL MASK**: The rest of the content (Chapter 2, 3, Code) is blurred/locked.

## State Management (`zustand`)
```typescript
interface BuilderState {
  currentStep: number;
  topic: string; // The selected topic
  abstract: string;
  outline: string[];
  
  // Actions
  setTopic: (topic: string) => void;
  nextStep: () => void;
  prevStep: () => void;
}
```

## Component Architecture
*   `WizardLayout`: Progress bar (Steps 1-3) + Navigation buttons.
*   `TopicCard`: Selectable card component.
*   `PaywallBlur`: Overlay component for locked content.

## Mock AI Service Extensions
*   `generateTopics(keyword: string)`: Returns 3 topics.
*   `generateAbstract(topic: string)`: Returns paragraph.
*   `generateOutline(topic: string)`: Returns list of headers.
