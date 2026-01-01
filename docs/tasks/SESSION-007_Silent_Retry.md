# 🎯 Task: "Silent Retry" for Junk Responses

**Objective:** Automatically retry if the AI returns "junk" responses like "still thinking..." or empty content.
**Priority:** Medium
**Scope:** `useChatFlow.tsx`.

---

## 📋 Requirements

### Functional Requirements
- **[REQ-001]** Detect if the final message from AI is "junk" (filler text or empty).
- **[REQ-002]** If junk, do NOT append it to history, and instead trigger a `reload()` or re-send the last user message.

### Technical Requirements
- **[TECH-001]** Logic in `onFinish` of `useChat`.
- **[TECH-002]** If message is deemed junk, trigger `reload()`.

---

## 🏗️ Implementation Plan

### Phase 1: Logic
- [ ] Define "junk" criteria (extends Filter Filler Text task).
- [ ] Implement retry logic in `onFinish`.

---

## 📁 Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/features/bot/hooks/useChatFlow.tsx` | Modify | Add silent retry logic |

---

## ✅ Success Criteria

- [ ] "Still thinking" response triggers a regeneration automatically.
