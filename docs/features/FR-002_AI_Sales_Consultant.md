# FR-002: AI Sales Consultant (Jay)

## Goal
An AI-powered chat interface where students find a project topic through guided conversation with "Jay" - the Lead Project Architect. Jay acts as a sales consultant who critiques boring ideas, suggests impressive "J Star Twists", and guides users toward purchasing J Star Dev Packages.

## Status: ✅ Implemented

---

## Component Breakdown

### Server Components
| File | Purpose |
|------|---------|
| `src/app/(saas)/chat/page.tsx` | Route wrapper, renders ChatInterface |
| `src/app/api/chat/route.ts` | Groq AI endpoint with streaming, tools, and retry logic |
| `src/features/bot/actions/chat.ts` | Server actions for conversation persistence |

### Client Components (`'use client'`)
| File | Purpose |
|------|---------|
| `src/features/bot/components/ChatInterface.tsx` | Main container, handles scroll, input, messages |
| `src/features/bot/components/MessageBubble.tsx` | Styled bubbles with markdown rendering (react-markdown) |
| `src/features/bot/components/ComplexityMeter.tsx` | Visual 1-5 difficulty meter (AI-controlled) |
| `src/features/bot/components/SuggestionChips.tsx` | Action buttons: Accept/Simplify/Harder + "Proceed to Builder" |
| `src/features/bot/hooks/useChatFlow.tsx` | State machine, tool detection, chat→builder handoff |

---

## Logic & Data Flow

### AI Provider Setup
```typescript
// Groq via OpenAI-compatible SDK
const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
});
// Model: moonshotai/kimi-k2-instruct-0905 (Best for Tool Calling)
```

### System Prompt (Jay's Persona)
- **Tone:** Senior Dev talking to junior student. Nigerian tech slang ("Omo", "No wahala").
- **Style:** Short, punchy, markdown-heavy. Never writes essays.
- **Mission:** Critique boring ideas, suggest J Star Twists, sell dev packages.
- **Pricing Reference:** Basic ₦120k, Standard ₦200k, Premium ₦320k.

### AI Tools (Function Calling)
| Tool | Description | Returns |
|------|-------------|---------|
| `suggestTopics` | Suggests 3 project topics with twists | `{ topics: [{ title, twist, difficulty }] }` |
| `setComplexity` | Updates the complexity meter (1-5) | `{ level, reason, updated: true }` |
| `getPricing` | Returns J Star pricing tiers | `{ basic, standard, premium }` |
| `confirmTopic` | Confirms topic and triggers builder handoff | `{ topic, twist, confirmed: true }` |

### State Machine (`useChatFlow`)
```
INITIAL → ANALYZING → PROPOSAL → NEGOTIATION → CLOSING
```

### Chat → Builder Handoff

#### Flow
1. User chats with Jay → gets topic suggestion
2. **Smart Suggestion Chips** appear: "Accept Topic", "Make it Simpler", "Too Boring"
3. User clicks "Accept Topic" → AI calls `confirmTopic` tool
4. Chips switch to **"Proceed to Builder"** button (manual trigger)
5. User clicks → saves to `localStorage`, redirects to `/project/builder`
6. Builder's `useBuilderStore.hydrateFromChat()` pre-fills topic/twist

#### State Tracking
```typescript
// useChatFlow.tsx
const [confirmedTopic, setConfirmedTopic] = useState<{topic: string, twist: string} | null>(null);
```

#### Manual Proceed Function (Reliable)
```typescript
const proceedToBuilder = () => {
    if (confirmedTopic) {
        localStorage.setItem('jstar_confirmed_topic', JSON.stringify({
            topic: confirmedTopic.topic,
            twist: confirmedTopic.twist,
            confirmedAt: new Date().toISOString()
        }));
    }
    router.push('/project/builder');
};
```

---

## Reliability Features

### Retry Logic
```typescript
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // Exponential backoff: 1s, 2s, 4s
```

### Empty Message Filter
Client filters out blank AI responses to prevent gray bubbles in UI.

### Error Handling
Returns user-friendly error: "Jay is currently offline (System Overload)."

### Data Persistence Guard
- **Fallback Identifier:** If `anonymousId` is missing/empty, falls back to SDK's `id` or ephemeral ID to prevent "Skipping save" errors.
- **Atomic Saves:** Ensures conversation is saved even if one message fails.

---

## Database Schema
Uses existing Prisma schema from FR-003:
- `Conversation` table stores messages as JSON
- `Lead` table captures user info

---

## Dependencies
- `ai` (Vercel AI SDK v5)
- `@ai-sdk/react` (useChat hook)
- `@ai-sdk/openai` (Groq provider)
- `react-markdown` (Message rendering)
- `zod` (Tool input validation)

---

## Implementation Checklist
- [x] Groq AI integration with streaming
- [x] Jay system prompt with Nigerian slang
- [x] Tool: suggestTopics
- [x] Tool: setComplexity (updates UI meter)
- [x] Tool: getPricing
- [x] Tool: confirmTopic (chat→builder handoff)
- [x] Retry logic with exponential backoff
- [x] Empty message filtering
- [x] Markdown rendering in MessageBubble
- [x] Mobile-optimized UI (no bot icon on mobile)
