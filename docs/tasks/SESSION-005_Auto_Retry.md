# 🎯 Task: Robust Auto-Retry Mechanism

**Objective:** Implement an invisible auto-retry system for failed chat requests.
**Priority:** High
**Scope:** `useChatFlow.tsx`

---

## 📋 Requirements

### Functional Requirements
- **[REQ-001]** Automatically retry the `sendMessage` or `reload` call if it fails due to network error.
- **[REQ-002]** Limit retries to 3 attempts.
- **[REQ-003]** Only show error UI if all retries fail.

### Technical Requirements
- **[TECH-001]** Implement a wrapper around the fetch or `onError` handler in `useChat`.
- **[TECH-002]** Since `useChat` handles its own state, we might need a custom `processUserMessage` function that calls `append` or `reload` with retry logic.

---

## 🏗️ Implementation Plan

### Phase 1: Logic Design
- [ ] Create a `retryWithBackoff` utility or logic in `useChatFlow`.

### Phase 2: Implementation
- [ ] Wrap the `sendMessage` call in a retry loop.
- [ ] Handle `onError` from `useChat` to trigger retry if possible (might be tricky with streaming).

---

## 📁 Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/features/bot/hooks/useChatFlow.tsx` | Modify | Add retry logic |

---

## ✅ Success Criteria

- [ ] Simulating a network failure triggers a retry without user action.
- [ ] Chat eventually recovers or shows error after 3 tries.
