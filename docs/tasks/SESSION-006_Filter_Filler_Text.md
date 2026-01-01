# 🎯 Task: Filter "Still Thinking" Filler Text

**Objective:** Remove or hide AI output that contains "still thinking..." or similar filler text.
**Priority:** Medium
**Scope:** `useChatFlow.tsx` or `MessageBubble.tsx`.

---

## 📋 Requirements

### Functional Requirements
- **[REQ-001]** If the AI says "I am still thinking" or "Thinking..." as a final message, it should be hidden or treated as "loading".
- **[REQ-002]** Ideally, prevent the AI from generating this in the first place (system prompt), but filtering is requested.

### Technical Requirements
- **[TECH-001]** In `useChatFlow`'s `messages` mapping, filter out content that matches filler patterns.
- **[TECH-002]** Or in `onFinish`, if the message is filler, delete it and retry (linked to Silent Retry task).

---

## 🏗️ Implementation Plan

### Phase 1: Regex Definition
- [ ] Define patterns for filler text.

### Phase 2: Filtering
- [ ] Apply filter in the `messages` export in `useChatFlow`.

---

## 📁 Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/features/bot/hooks/useChatFlow.tsx` | Modify | Filter filler text from UI |

---

## ✅ Success Criteria

- [ ] "Still thinking..." messages do not appear in chat.
