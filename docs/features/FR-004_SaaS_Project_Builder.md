# FR-004: SaaS Project Builder (Wizard)

## Goal
A multi-step "Wizard" where users generate their Final Year Project materials: topic selection, abstract generation, and chapter outline. Includes paywall for premium content.

## Status: ✅ Implemented (Chat Handoff Complete, Outline uses mock data pending real AI)

---

## Component Breakdown

### Server Components
| File | Purpose |
|------|---------|
| `src/app/(saas)/project/builder/page.tsx` | Route wrapper, renders BuilderWizard |
| `src/app/api/generate/abstract/route.ts` | Groq AI endpoint for abstract (streamText) |
| `src/app/api/generate/outline/route.ts` | Outline endpoint (currently returns mock, pending streamObject) |

### Client Components (`'use client'`)
| File | Purpose |
|------|---------|
| `src/features/builder/components/BuilderWizard.tsx` | Main wizard container, step router |
| `src/features/builder/components/TopicSelector.tsx` | Step 1: Topic + Twist input |
| `src/features/builder/components/AbstractGenerator.tsx` | Step 2: AI-generated abstract with edit/preview toggle |
| `src/features/builder/components/ChapterOutliner.tsx` | Step 3: Outline display + paywall overlay |

---

## State Management

### Zustand Store (`useBuilderStore`)
```typescript
interface BuilderState {
    step: 'TOPIC' | 'ABSTRACT' | 'OUTLINE' | 'PAYWALL';
    data: {
        topic: string;
        twist: string;
        abstract: string;
        outline: any[];
    };
    isGenerating: boolean;
    isPaid: boolean;
    isFromChat: boolean;  // True if user came from Jay chat

    setStep: (step: BuilderStep) => void;
    updateData: (data: Partial<ProjectData>) => void;
    setGenerating: (isGenerating: boolean) => void;
    unlockPaywall: () => void;
    hydrateFromChat: () => boolean;  // Loads topic/twist from localStorage
    clearChatData: () => void;       // Clears handoff data and resets form
}
```

### Chat → Builder Handoff

#### Trigger: Smart Suggestion Chips (`SuggestionChips.tsx`)
When user clicks "Proceed to Builder" in chat:
1. `proceedToBuilder()` saves `{ topic, twist, confirmedAt }` to `localStorage`
2. Redirects to `/project/builder`

#### Hydration: `useBuilderStore.hydrateFromChat()`
On component mount:
1. Check `localStorage` for `jstar_confirmed_topic`
2. Validate freshness (24-hour expiry check)
3. If valid, populate `data.topic`, `data.twist`, set `isFromChat: true`
4. TopicSelector renders "Topic imported from Jay" badge

#### Reset: `useBuilderStore.clearChatData()`
User clicks "Clear & Start Fresh":
1. Remove `jstar_confirmed_topic` from `localStorage`
2. Reset form data to empty
3. Set `isFromChat: false`

---

## Feature: Abstract Generator

### AI Integration
- Uses `useCompletion` hook from `@ai-sdk/react`
- API: `/api/generate/abstract`
- Streaming protocol: `text` (via `toTextStreamResponse()`)

### UI Features
| Feature | Description |
|---------|-------------|
| **Auto-start** | Generates abstract on mount if empty |
| **Refinement** | User can type instructions to refine (e.g., "Make it more academic") |
| **Regenerate** | Button to regenerate from scratch |
| **Edit/Preview Toggle** | Switch between raw textarea and rendered markdown |
| **Markdown Rendering** | Uses `react-markdown` with prose styling |

### System Prompt (Abstract AI)
- Topic + Twist input
- Academic yet accessible style
- 2-3 paragraph structure: Context, Solution, Methodology

---

## Feature: Chapter Outliner

### Current State
- Uses mock data (5 placeholder chapters)
- Displays paywall blur overlay for non-paid users
- Paywall includes package tier cards

### Pending: Real AI Outline
- Will use `streamObject` with Zod schema
- Will render chapters as they stream
- See `docs/tasks/RealAIOutlineGeneration.md`

---

## Dependencies
- `zustand` (state management)
- `ai` + `@ai-sdk/react` (AI streaming)
- `react-markdown` (markdown rendering)
- `framer-motion` (animations)
- `lucide-react` (icons)

---

## Implementation Checklist
- [x] Zustand store with step navigation
- [x] TopicSelector component
- [x] AbstractGenerator with useCompletion
- [x] Abstract refinement (instruction-based regeneration)
- [x] Edit/Preview toggle with markdown rendering
- [x] ChapterOutliner UI with paywall overlay
- [x] Chat → Builder handoff (localStorage + hydrate)
- [x] 24-hour stale data check
- [x] Clear handoff data action
- [ ] Real AI outline (streamObject) - **Spawned as task**
