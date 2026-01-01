# 🎯 Task: Manual Retry Button

**Objective:** Add a manual "Retry" / "Refresh" button next to the user's message bubble.
**Priority:** Low
**Scope:** `MessageBubble.tsx`.

---

## 📋 Requirements

### Functional Requirements
- **[REQ-001]** User bubble should have a small reload icon/button.
- **[REQ-002]** Clicking it should force the AI to regenerate the response *to that specific message*.

### Technical Requirements
- **[TECH-001]** `MessageBubble.tsx` needs a new prop or logic to show the button on hover.
- **[TECH-002]** `useChat`'s `reload` function re-generates the *last* AI response. To retry a *specific* middle message is harder with basic `useChat`.
- **[TECH-003]** Constraint: If `useChat` only supports reloading the *last* turn, we might only support this for the most recent user message.

---

## 🏗️ Implementation Plan

### Phase 1: UI
- [ ] Add button to `MessageBubble.tsx`.

### Phase 2: Logic
- [ ] Connect to `reload` from `useChat`.
- [ ] Handle constraint: Hide button if it's not the latest message (unless we implement sophisticated history slicing).

---

## 📁 Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/features/bot/components/MessageBubble.tsx` | Modify | Add UI for retry |
| `src/features/bot/components/ChatInterface.tsx` | Modify | Pass reload handler |

---

## ✅ Success Criteria

- [ ] User can click retry on the last message to trigger regeneration.
