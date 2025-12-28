# 🎯 Task: Evolution of "Jay" Chatbot (Vibe Pitch)

**Objective:** Transform "Jay" from a robotic assistant into a persuasive "Vibe Pitcher" co-founder persona. Implement dynamic topic suggestion loops and "conviction-based" lead capture.
**Priority:** High
**Scope:** `src/features/bot` and `src/app/api/chat`
**Agent:** Agent A (Jay)

---

## 📋 Requirements

### Functional Requirements
- **[REQ-001]** **Persona Shift**: System prompt must reflect a "Pro Dev/Co-founder" vibe. Direct, persuasive, not generic support.
- **[REQ-002]** **Dynamic Pitching**:
    - If user is confused, suggest 2 distinct paths: "Easy but sounds complex" vs "Complex but manageable".
    - "Pitch" the chosen idea. Sell the benefits.
- **[REQ-003]** **Conviction Check**:
    - Do NOT ask for contact info immediately.
    - Wait for user agreement/excitement ("Conviction").
    - ONLY then ask for WhatsApp/Contact info.
- **[REQ-004]** **Lead Capture**: Integrate with `saveLeadAction` upon successful capture.

### Technical Requirements
- **[TECH-001]** Use `vercel/ai` SDK `streamText` or `streamUI`.
- **[TECH-002]** Maintain `zod` validation for all structured outputs.

---

## 🏗️ Implementation Plan

### Phase 1: Prompt Engineering
- [ ] Refactor System Prompt in `src/app/api/chat/route.ts`.
- [ ] Test "Vibe" with manual queries.

### Phase 2: Logic Refactor
- [ ] Refactor `useChatFlow.tsx` to handle the new "Pitch Loop".
- [ ] Remove rigid state machine (`INITIAL` -> `ANALYZING`) if it limits the "Vibe".
- [ ] Implement the "Contrast Pitch" logic (Easy vs Hard options).

### Phase 3: Conviction & Capture
- [ ] Add tool: `measureConviction(score: number)` (Internal thought process or actual tool).
- [ ] Trigger `requestContactInfo` only when conviction > threshold.

---

## 📁 Files to Create/Modify
| File | Action | Purpose |
|------|--------|---------|
| `src/app/api/chat/route.ts` | Modify | Update System Prompt & Tools |
| `src/features/bot/hooks/useChatFlow.tsx` | Modify | Update client-side state logic |
| `src/features/bot/prompts/system.ts` | Create | (Optional) Extract system prompt for easier editing |

---

## 🚀 Getting Started
1. Checkout your branch `agent-jay`.
2. Run the `setup_agent.ps1` script to sync env vars.
3. Start with **Phase 1: Prompt Engineering**.
