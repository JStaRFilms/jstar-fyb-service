# FR-004: SaaS Project Builder (Wizard)

## Goal
A multi-step "Wizard" where users generate their Final Year Project materials: topic selection, abstract generation, and chapter outline. Includes paywall for premium content.

## Status: ✅ Fully Implemented

---

## Component Breakdown

### Server Components
| File | Purpose |
|------|---------|
| [page.tsx](file:///c:/CreativeOS/01_Projects/Code/Personal_Stuff/Final%20Year%20Project%20service/2025-12-15_jstar-fyb-service/src/app/(saas)/project/builder/page.tsx) | Route wrapper, renders BuilderWizard |
| [abstract/route.ts](file:///c:/CreativeOS/01_Projects/Code/Personal_Stuff/Final%20Year%20Project%20service/2025-12-15_jstar-fyb-service/src/app/api/generate/abstract/route.ts) | Groq AI endpoint for abstract (`streamText`) |
| [outline/route.ts](file:///c:/CreativeOS/01_Projects/Code/Personal_Stuff/Final%20Year%20Project%20service/2025-12-15_jstar-fyb-service/src/app/api/generate/outline/route.ts) | Groq AI endpoint for outline (`streamObject`) |

### Client Components (`'use client'`)
| File | Purpose |
|------|---------|
| [BuilderWizard.tsx](file:///c:/CreativeOS/01_Projects/Code/Personal_Stuff/Final%20Year%20Project%20service/2025-12-15_jstar-fyb-service/src/features/builder/components/BuilderWizard.tsx) | Main wizard container, step router |
| [TopicSelector.tsx](file:///c:/CreativeOS/01_Projects/Code/Personal_Stuff/Final%20Year%20Project%20service/2025-12-15_jstar-fyb-service/src/features/builder/components/TopicSelector.tsx) | Step 1: Topic + Twist input |
| [AbstractGenerator.tsx](file:///c:/CreativeOS/01_Projects/Code/Personal_Stuff/Final%20Year%20Project%20service/2025-12-15_jstar-fyb-service/src/features/builder/components/AbstractGenerator.tsx) | Step 2: AI-generated abstract with edit/preview toggle |
| [ChapterOutliner.tsx](file:///c:/CreativeOS/01_Projects/Code/Personal_Stuff/Final%20Year%20Project%20service/2025-12-15_jstar-fyb-service/src/features/builder/components/ChapterOutliner.tsx) | Step 3: Outline display + paywall overlay |

### Schemas
| File | Purpose |
|------|---------|
| [outlineSchema.ts](file:///c:/CreativeOS/01_Projects/Code/Personal_Stuff/Final%20Year%20Project%20service/2025-12-15_jstar-fyb-service/src/features/builder/schemas/outlineSchema.ts) | Shared Zod schema for client + server outline generation |

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
        outline: Chapter[];  // { title: string; content: string }[]
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
- Model: `openai/gpt-oss-120b` (Groq)
- Streaming protocol: `text` (via `toTextStreamResponse()`)

### System Prompt
```
You are an expert academic research consultant.
- Topic + Twist input
- Academic yet accessible style
- 2-3 paragraph structure: Context, Solution, Methodology
- Do NOT include a title or heading like "Abstract" at the start
- Start directly with content
- Do NOT use markdown formatting
```

### UI Features
| Feature | Description |
|---------|-------------|
| **Auto-start** | Generates abstract on mount if empty |
| **Refinement** | User can type instructions to refine |
| **Regenerate** | Button to regenerate from scratch |
| **Edit/Preview Toggle** | Switch between raw textarea and rendered markdown |
| **Markdown Rendering** | Uses `react-markdown` with prose styling |

---

## Feature: Chapter Outliner (Real AI)

### AI Integration
- Uses `useObject` hook from `@ai-sdk/react` (experimental)
- API: `/api/generate/outline`
- Model: `llama-3.3-70b-versatile` (Groq)
- Streaming protocol: `object` (via `toTextStreamResponse()`)

### Shared Zod Schema (`outlineSchema.ts`)
```typescript
export const outlineSchema = z.object({
    title: z.string().describe("Refined academic title of the project"),
    chapters: z.array(z.object({
        title: z.string().describe("Chapter title"),
        content: z.string().describe("Brief summary (2-3 sentences)")
    })).describe("The 5 standard chapters")
});
```

### Smart Paywall (API Call Optimization)

> [!IMPORTANT]
> **Generation only triggers AFTER payment** to save API costs and prevent hackers. Unlocking is handled automatically via Paystack Webhooks (see [FR-007: Payment Infrastructure](file:///c:/CreativeOS/01_Projects/Code/Personal_Stuff/Final%20Year%20Project%20service/2025-12-15_jstar-fyb-service-agent-webhooks/docs/features/FR-007_Payment_Infrastructure.md)).

#### Flow:
1. **Before Payment**: Shows 3 static placeholder chapters (blurred)
2. **Paywall Overlay**: Lock icon + "Pay ₦15,000 to Unlock" button
3. **After Payment**: `isPaid` → `true` → triggers `submit()` → streams real chapters
4. **Streaming**: Chapters appear one-by-one with wipe reveal animation

#### Placeholder Chapters (No API Call)
```typescript
const PLACEHOLDER_CHAPTERS = [
    { title: "Introduction", content: "Background of study..." },
    { title: "Literature Review", content: "Analysis of existing systems..." },
    { title: "Methodology", content: "System analysis, design methodology..." },
];
```

### Wipe Reveal Animation (globals.css)
```css
@keyframes wipe-reveal {
    0% { clip-path: inset(0 0 100% 0); opacity: 0; }
    10% { opacity: 1; }
    100% { clip-path: inset(0 0 0 0); opacity: 1; }
}

.animate-wipe-reveal { animation: wipe-reveal 0.8s ease-out forwards; }
.animate-wipe-delay-1 { animation-delay: 0s; }
.animate-wipe-delay-2 { animation-delay: 0.3s; }
.animate-wipe-delay-3 { animation-delay: 0.6s; }
.animate-wipe-delay-4 { animation-delay: 0.9s; }
.animate-wipe-delay-5 { animation-delay: 1.2s; }
```

### Error Handling
- Error state with retry button if generation fails
- `onError` callback logs to console
- Only shown after payment when generation is attempted

---

## Dependencies
- `zustand` (state management)
- `ai` + `@ai-sdk/react` (AI streaming)
- `react-markdown` (markdown rendering)
- `framer-motion` (animations)
- `lucide-react` (icons)
- `zod` (schema validation)

---

## Implementation Checklist
- [x] Zustand store with step navigation
- [x] TopicSelector component
- [x] AbstractGenerator with `useCompletion`
- [x] Abstract refinement (instruction-based regeneration)
- [x] Edit/Preview toggle with markdown rendering
- [x] Abstract system prompt: no title prefix, no markdown
- [x] ChapterOutliner UI with paywall overlay
- [x] Chat → Builder handoff (localStorage + hydrate)
- [x] 24-hour stale data check
- [x] Clear handoff data action
- [x] **Real AI outline with `streamObject`**
- [x] **Shared Zod schema (client + server)**
- [x] **Smart paywall: no API calls until payment**
- [x] **Wipe reveal animation for streaming chapters**
- [x] **Error handling with retry button**

