# 🎯 Task: Multi-Step AI Execution

**Objective:** Ensure the AI can perform an action (tool call) and then generate a follow-up text response in the same turn.
**Priority:** High
**Scope:** Server-side API `route.ts`.

---

## 📋 Requirements

### Functional Requirements
- **[REQ-001]** The AI should be able to call a tool (e.g., `confirmTopic`) and then immediately say "I've confirmed your topic..." without waiting for a new user message.

### Technical Requirements
- **[TECH-001]** Enable `maxSteps` (or `maxToolRoundtrips` in Vercel AI SDK) in `src/app/api/chat/route.ts`.
- **[TECH-002]** Ensure `useChat` in frontend can handle multiple steps if required (usually handled automatically by SDK).

---

## 🏗️ Implementation Plan

### Phase 1: Configuration
- [ ] Open `src/app/api/chat/route.ts`.
- [ ] Add `maxSteps: 5` (or appropriate number) to the `streamText` or `createDataStreamResponse` call.

---

## 📁 Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/app/api/chat/route.ts` | Modify | Enable multi-step execution |

---

## ✅ Success Criteria

- [ ] AI can call a tool and speak in one turn.
- [ ] No "stop after tool call" behavior.
