# 🎯 Task: Project Builder & Pricing Strategy

**Objective:** Refactor the Project Builder to offer a "Free Sample" (Chapter 1-5 Outline) before the paywall. Implement the "Result Reveal" UI and Document Support.
**Priority:** High
**Scope:** `src/features/builder` and `src/app/project/builder`
**Agent:** Agent B (Builder)

---

## 📋 Requirements

### Functional Requirements
- **[REQ-001]** **Free Sample Flow**:
    - Users landing on `/builder` with a confirmed topic should see the "Proposed Outline" generated immediately (or loading).
    - **NO Paywall** for the Outline itself.
- **[REQ-002]** **The Unlocked Paywall**:
    - After the outline is shown, display the "Unlock Full Project" CTA.
    - Locking "Deep Research", "Full Writing", and "Source Code" behind the paywall.
- **[REQ-003]** **Document Support**:
    - UI for Users/Admins to upload PDF sources.
    - List view of uploaded documents.

### Technical Requirements
- **[TECH-001]** Use `useObject` (AI SDK) for Outline streaming.
- **[TECH-002]** Integrate new Prisma models: `Project` and `ResearchDocument`.
- **[TECH-003]** Implement `PricingOverlay` component.

---

## 🏗️ Implementation Plan

### Phase 1: Free Sample (Outline)
- [ ] Connect `ProjectBuilder` page to `api/generate/outline`.
- [ ] Auto-trigger generation if `topic` is present in URL or LocalStorage.
- [ ] Render the outline in a clean, readable UI.

### Phase 2: The Lock (Pricing)
- [ ] Create `PricingOverlay.tsx`.
- [ ] Wrap the "Next Steps" (Research/Writing) in the locked state.
- [ ] Implement the "Unlock" action (Mock payment or actual integration if ready).

### Phase 3: Documents
- [ ] Add `DocumentUpload` component (Dropzone).
- [ ] Add `DocumentList` component.
- [ ] Connect to `api/documents/upload` (Need to scaffold this).

---

## 📁 Files to Create/Modify
| File | Action | Purpose |
|------|--------|---------|
| `src/features/builder/components/ProjectBuilder.tsx` | Modify | Core logic for outline generation |
| `src/features/builder/components/PricingOverlay.tsx` | Create | The Paywall UI |
| `src/features/builder/components/DocumentUpload.tsx` | Create | File processing UI |

---

## 🚀 Getting Started
1. Checkout your branch `agent-builder`.
2. Run the `setup_agent.ps1` script to sync env vars.
3. Start with **Phase 1: Free Sample**.
