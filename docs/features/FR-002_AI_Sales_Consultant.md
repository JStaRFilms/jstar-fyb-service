# FR-002: AI Sales Consultant (Bot)

## Goal
A "Hacker/Consultant" style chat interface where students find a project topic. The AI acts as a "Project Consultant", rejecting boring ideas and suggesting "twisted" academic versions.

## Component Breakdown

### Server Components (RSC)
- `src/app/(bot)/project/chat/page.tsx`: Layout wrapper, fetches initial script if needed.

### Client Components (`use client`)
- `src/features/bot/components/ChatInterface.tsx`: Main container, handles scroll, input, and messages.
- `src/features/bot/components/MessageBubble.tsx`: Styled bubbles for AI (Glass/Purple) and User (Glass/Blue).
- `src/features/bot/components/ComplexityMeter.tsx`: Visual widget showing project difficulty (Green->Yellow->Red).
- `src/features/bot/components/ThinkingIndicator.tsx`: "Scanning academic trends..." animation.

## Logic & Data Flow
### State Management (`useChatFlow.ts`)
A simple state machine:
1.  **INITIAL**: AI Greeting ("What's your department?").
2.  **ANALYZING_INPUT**: User types idea -> Mock delay -> AI Analysis.
3.  **PROPOSAL**: AI suggests a "Twist" (e.g., "Blockchain Fake News Detector").
4.  **NEGOTIATION**: User accepts or asks for simpler/harder.
5.  **CLOSING**: Bot asks for WhatsApp number (Transition to FR-003).

### Mock AI Service (`src/features/bot/services/mockAi.ts`)
- `analyzeIdea(department, text)`: Returns a pre-set "Twist".
- `calculateComplexity(text)`: Returns 1-5 score.

## Database Schema
No DB interaction yet (until FR-003 Lead Capture).

## Implementation Steps
1.  [ ] **Setup**: Create `src/features/bot` and `src/app/(bot)` structure.
2.  [ ] **UI Components**: Build `MessageBubble`, `ComplexityMeter`, `ChatInterface` from `chat.html`.
3.  [ ] **Mock AI**: Implement `mockAi.ts` with hardcoded "smart" responses.
4.  [ ] **State Machine**: Implement `useChatFlow` handle the conversation steps.
5.  [ ] **Page Assembly**: Wire everything into `src/app/(bot)/project/chat/page.tsx`.
