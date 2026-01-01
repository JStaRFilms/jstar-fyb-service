# 🎯 Task: Eliminate Erroneous "Retry" Button

**Objective:** Prevent the "Retry" button from appearing when the AI has successfully executed a tool but hasn't returned a text response.
**Priority:** High
**Scope:** `useChatFlow.tsx` and `ChatInterface.tsx`

---

## 📋 Requirements

### Functional Requirements
- **[REQ-001]** The "Retry" button must NOT appear if the AI is currently executing a tool (even if no text is generated yet).
- **[REQ-002]** The 'error' state should be differentiate between actual network/API errors and "no text response" scenarios which are valid tool executions.

### Technical Requirements
- **[TECH-001]** Modify `useChatFlow` logic where it might be setting an error state or where the UI interprets a lack of content as an error.

---

## 🏗️ Implementation Plan

### Phase 1: Diagnosis
- [ ] Analyze `ChatInterface.tsx` to see when the Retry button is rendered.
- [ ] Check `useChatFlow` for error handling logic.

### Phase 2: Fix
- [ ] Adjust the condition for showing the Retry button.
- [ ] Ensure that if `isLoading` is true (tool execution), the error is suppressed or retry is hidden.

---

## 📁 Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/features/bot/components/ChatInterface.tsx` | Modify | Update logic for showing Retry button |
| `src/features/bot/hooks/useChatFlow.tsx` | Modify | Adjust error state handling if necessary |

---

## ✅ Success Criteria

- [ ] "Retry" button does not show when AI calls a tool like `setComplexity` without text.
- [ ] "Retry" button still shows for genuine network errors.
