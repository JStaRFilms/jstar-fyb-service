# 🎯 Task: Hide "Ghost" Empty Message Bubbles

**Objective:** Do not render an empty chat bubble when the AI sends a message that only contains a tool invocation.
**Priority:** Medium
**Scope:** `MessageBubble.tsx` or `ChatInterface.tsx`.

---

## 📋 Requirements

### Functional Requirements
- **[REQ-001]** If a message has no visible text content, the bubble should not be rendered.
- **[REQ-002]** If a message has tool invocations but no text, checking for "content" length should account for this.

### Technical Requirements
- **[TECH-001]** Update the rendering loop in `ChatInterface.tsx` or the component in `MessageBubble.tsx`.

---

## 🏗️ Implementation Plan

### Phase 1: Identification
- [ ] Find where the messages are mapped in `ChatInterface.tsx`.

### Phase 2: Logic Update
- [ ] Filter messages before mapping, or return `null` in the component if content is empty and it's an AI message with only tool calls.

---

## 📁 Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/features/bot/components/ChatInterface.tsx` | Modify | Logic to skip empty bubbles |
| `src/features/bot/components/MessageBubble.tsx` | Modify | Ensure it doesn't render empty box |

---

## ✅ Success Criteria

- [ ] No empty gray/blue bubbles in chat.
- [ ] Tools still execute (if they have UI components, those might still need to show, but "ghost" text bubbles should go).
