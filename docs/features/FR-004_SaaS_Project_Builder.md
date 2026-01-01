# FR-004: SaaS Project Builder (Wizard)

## Goal
A multi-step "Wizard" where users generate their Final Year Project materials: topic selection, abstract generation, and chapter outline. Includes paywall for premium content.

## Status: ✅ Fully Implemented

---

## Component Breakdown

### Server Components
| File | Purpose |
|------|---------|
| [page.tsx](file:///c:/CreativeOS/01_Projects/Code/Personal_Stuff/Final%20Year%20Project%20service/2025-12-15_jstar-fyb-service/src/app/(saas)/project/builder/page.tsx) | **Async Server Component**. Fetches Project + `isUnlocked` status from DB. Hydrates Client. |
| [abstract/route.ts](file:///c:/CreativeOS/01_Projects/Code/Personal_Stuff/Final%20Year%20Project%20service/2025-12-15_jstar-fyb-service/src/app/api/generate/abstract/route.ts) | Groq AI endpoint for abstract (`streamText`) |
| [outline/route.ts](file:///c:/CreativeOS/01_Projects/Code/Personal_Stuff/Final%20Year%20Project%20service/2025-12-15_jstar-fyb-service/src/app/api/generate/outline/route.ts) | Groq AI endpoint for outline (`streamObject`) |
| [projects/[id]/outline](file:///c:/CreativeOS/01_Projects/Code/Personal_Stuff/Final%20Year%20Project%20service/2025-12-15_jstar-fyb-service/src/app/api/projects/[id]/outline/route.ts) | **GET/POST**. Auto-saves outline to `ChapterOutline` model. |
| [generate/chapter](file:///c:/CreativeOS/01_Projects/Code/Personal_Stuff/Final%20Year%20Project%20service/2025-12-15_jstar-fyb-service/src/app/api/generate/chapter/route.ts) | **POST**. Gen + Stream Chapter. Saves to `Project.contentProgress`. |

### Client Components (`'use client'`)
| File | Purpose |
|------|---------|
| [BuilderClient.tsx](file:///c:/CreativeOS/01_Projects/Code/Personal_Stuff/Final%20Year%20Project%20service/2025-12-15_jstar-fyb-service/src/app/(saas)/project/builder/BuilderClient.tsx) | Main client wrapper. Receives `serverProject` prop for instant hydration. |
| [TopicSelector.tsx](file:///c:/CreativeOS/01_Projects/Code/Personal_Stuff/Final%20Year%20Project%20service/2025-12-15_jstar-fyb-service/src/features/builder/components/TopicSelector.tsx) | Step 1: Topic + Twist input |
| [AbstractGenerator.tsx](file:///c:/CreativeOS/01_Projects/Code/Personal_Stuff/Final%20Year%20Project%20service/2025-12-15_jstar-fyb-service/src/features/builder/components/AbstractGenerator.tsx) | Step 2: AI-generated abstract with edit/preview toggle |
| [ChapterOutliner.tsx](file:///c:/CreativeOS/01_Projects/Code/Personal_Stuff/Final%20Year%20Project%20service/2025-12-15_jstar-fyb-service/src/features/builder/components/ChapterOutliner.tsx) | Step 3: Outline display + **Auto-Save** + paywall overlay |
| [ChapterGenerator.tsx](file:///c:/CreativeOS/01_Projects/Code/Personal_Stuff/Final%20Year%20Project%20service/2025-12-15_jstar-fyb-service/src/features/builder/components/ChapterGenerator.tsx) | Step 4: Full chapter content generation (Markdown) |

### Schemas
| File | Purpose |
|------|---------|
| [outlineSchema.ts](file:///c:/CreativeOS/01_Projects/Code/Personal_Stuff/Final%20Year%20Project%20service/2025-12-15_jstar-fyb-service/src/features/builder/schemas/outlineSchema.ts) | Shared Zod schema for client + server outline generation |

---

## State Management

### Zustand Store (`useBuilderStore`)
```typescript
interface BuilderState {
    // ...
    // Updated Actions
    loadProject: (data: Partial<ProjectData>, isPaid?: boolean) => void; // NOW accepts payment status
}
```

### User Data Hydration
The Builder now uses a **Hybrid Hydration Strategy**:

1.  **Server-Side (Primary)**:
    - `page.tsx` fetches the latest project (`prisma.project.findFirst`) + payment status (`isUnlocked`).
    - Passes full `ProjectData` + `serverIsPaid` to `BuilderClient`.
    - `useBuilderStore.loadProject()` initializes state immediately.
    - **Benefit**: Fixes sync issues across devices and ensures payment status is truthful.

2.  **Client-Side (Handoff)**:
    - **Fresh Override Strategy**:
        - `hydrateFromChat()` checks if handoff data is **< 5 minutes old**.
        - If FRESH: It **overrides** any existing server draft (forcing "New Project" state).
        - If STALE/EMPTY: It only hydrates if the current project is empty.
    - **Outcome**: Users coming effectively from Chat always see their new topic, even if they have an old draft.

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
- Model: `llama-3.3-70b-versatile` (Groq) - Switched for speed/reliability
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

## Changelog
### 2025-12-28: Real AI + Paywall
- Replaced placeholder content with Real AI (`llama-3.3-70b-versatile`).
- Implemented "Smart Paywall" (No API calls until payment).
- Added wipe-reveal animation for streaming chapters.
- Integrated `ProjectAssistant` (The Copilot) into the Builder UI.

### 2025-12-31: Navigation Unification
- Integrated Builder into shared `SaasShell`.
- Replaced custom Builder header with integrated "Progress Toolbar".
- Added context-aware navigation (Hammer Icon) in `MobileBottomNav`.

### 2025-12-31: State Persistence Fixes
- Added `hasServerHydrated` flag to prevent localStorage from overwriting server data.
- Removed `step` and `isPaid` from localStorage persistence - server is source of truth.
- Fixed `syncWithUser()` to only reset on actual logout/account switch, not on every page load.
- `loadProject()` now clears stale chat handoff localStorage.
- `hydrateFromChat()` now checks `hasServerHydrated` before attempting hydration.
- Fixed PDF upload validation (broken EOF check was rejecting valid PDFs).
- Abstract generation API no longer creates duplicate projects (only updates existing).

### 2026-01-01: Critical Handoff Fix
- **Problem**: Login via Chat Handoff was loading old server drafts instead of the new chat topic.
- **Solution**: Implemented "Freshness Override" in `BuilderClient`. If chat data is < 5 mins old, it takes priority over server data.
- **Logic**: `hydrateFromChat` now accepts a user ID and performs a time-check before wiping/setting state.

