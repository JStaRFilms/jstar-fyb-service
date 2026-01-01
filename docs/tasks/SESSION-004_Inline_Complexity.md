# 🎯 Task: Inline Complexity Meter Display

**Objective:** Display the `ComplexityMeter` component inline within the chat stream if the AI silently updates the project complexity.
**Priority:** Medium
**Scope:** `ChatInterface.tsx` or `MessageBubble.tsx`.

---

## 📋 Requirements

### Functional Requirements
- **[REQ-001]** If a message contains a `setComplexity` tool call, render the `ComplexityMeter` (or a small notification of change) within the message list.
- **[REQ-002]** This ensures the user sees the change even if the AI doesn't explicitly speak about it.

### Technical Requirements
- **[TECH-001]** Detect `tool-setComplexity` in `MessageBubble.tsx` (or parent).
- **[TECH-002]** Render the `ComplexityMeter` component if detected.

---

## 🏗️ Implementation Plan

### Phase 1: Component Check
- [ ] Check if `ComplexityMeter` is reusable in this context.

### Phase 2: Integration
- [ ] In `MessageBubble.tsx`, check `toolInvocations`.
- [ ] If `setComplexity` is found, append the meter to the message display.

---

## 📁 Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/features/bot/components/MessageBubble.tsx` | Modify | Render inline meter |

---

## ✅ Success Criteria

- [ ] Visual indication of complexity change appears in chat history.
