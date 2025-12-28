# Implementation Plan: Vibe Pitch & Pricing Strategy

This plan addresses the user's desire to make the "Jay" chatbot more natural and persuasive, and to restructure the project builder to prove value (generate outline) before asking for payment.

## User Review Required
> [!IMPORTANT]
> **Pricing Strategy Change**: The Paywall will be moved. Users will now be able to generate the **Chapter 1-5 Outline** for free. The payment will be required to "Unlock Full Project" (Deep research, full content generation).

> [!NOTE]
> **NotebookLM Workflow**: The extraction of data from PDFs using NotebookLM is a manual "Human-in-the-Loop" process for now. We will build the data structures to receive this data, but the parsing itself is external.

## Proposed Changes

### Feature: "Jay" Chatbot Evolution
#### [MODIFY] [useChatFlow.tsx](file:///c:/CreativeOS/01_Projects/Code/Personal_Stuff/Final%20Year%20Project%20service/2025-12-15_jstar-fyb-service/src/features/bot/hooks/useChatFlow.tsx)
- Remove rigid state machine (`INITIAL` -> `ANALYZING` etc.) in favor of a more flexible "Conversation Loop".
- Add a new state `CONVICTION` where the bot detects user buy-in.
- Update `handleUserMessage` to be less regex-dependent for the initial flow, but strict on the phone number capture.

#### [MODIFY] [route.ts (Chat API)](file:///c:/CreativeOS/01_Projects/Code/Personal_Stuff/Final%20Year%20Project%20service/2025-12-15_jstar-fyb-service/src/app/api/chat/route.ts)
- **CRITICAL**: Rewrite the System Prompt.
- **New Persona**: "Jay" is a peer/co-founder, not a support bot.
- **Logic**:
    1.  Listen to user confusion.
    2.  Suggest mixed difficulty topics (Easy-sounding but complex, Complex-sounding but manageable).
    3.  "Pitch" the choice. Sell the benefits.
    4.  Ask for contact info ONLY when they agree.

### Feature: Project Builder & Pricing
#### [MODIFY] [ProjectBuilder Page]
- *Path to be determined (likely `src/app/project/builder/page.tsx` or similar)*
- logic to auto-trigger Outline Generation upon arrival if a topic is passed.
- Display the Outline clearly.

#### [NEW] [PricingOverlay.tsx]
- Create a component that "locks" the deeper features (Research, Full Writing) but leaves the Outline visible.
- "Unlock Your Full Project" CTA.

### Feature: Backend Data Models (Schema) & Documentation
#### [MODIFY] [schema.prisma](file:///c:/CreativeOS/01_Projects/Code/Personal_Stuff/Final%20Year%20Project%20service/2025-12-15_jstar-fyb-service/prisma/schema.prisma)
- Add fields to `Project` or `Research` model to store the extraction metrics.
- **[NEW]** Add `documents` relation to Project for storing file URLs (PDFs) uploaded by the user/admin.
- **[NEW]** Add fields for `extraction_status` (Pending, Completed).

#### [NEW] Document Upload & Admin Flow
- Allow Admin (User) to upload source PDFs.
- Store file references so "Client" users can download/view them later.
- These PDFs are the source for the NotebookLM extraction.

## Orchestration Strategy (Parallel Execution)
To enable parallel work (as requested), we must lock the **Data Contract** first.
1.  **Step 1 (Main Agent)**: Implement `schema.prisma` changes and push to DB. Define the "Shared Types". [COMPLETE]
2.  **Step 2 (Parallel)**:
    -   **Agent A**: Work on "Jay" Chatbot Flow (Phase 2).
    -   **Agent B**: Work on Project Builder UI & Pricing (Phase 3).
    -   (Agents can run effectively in `git worktree` sessions or just parallel windows if files don't overlap).

## 🛡️ Merge Protocol

### When to Merge
- Agents should only merge when their `Task.md` Checklist is complete (or a Phase is complete).
- **Run Tests** before merging.

### How to Merge (Squash Strategy)
Since we are using `worktrees` with feature branches (`agent-jay`, `agent-builder`):

1.  **Agent A (Jay)** finishes work.
2.  Switch to Main: `git checkout main` (or `master`)
3.  Squash Merge:
    ```bash
    git merge --squash agent-jay
    git commit -m "feat(bot): implement vibe pitch and conviction capture"
    ```
4.  **Resolve Conflicts**: If Agent B merged first, Agent A might have conflicts in `package.json` or `schema.prisma`.
    - **Rule**: `schema.prisma` on `main` is the Truth.

## 🚀 Handoff Instructions

### For Agent A (Chatbot)
- **Path**: `../2025-12-15_jstar-fyb-service-agent-jay`
- **Context**: `docs/tasks/Agent_Jay_Chatbot.md`
- **Goal**: Make Jay cool. Make him sell.

### For Agent B (Builder)
- **Path**: `../2025-12-15_jstar-fyb-service-agent-builder`
- **Context**: `docs/tasks/Agent_Builder_Pricing.md`
- **Goal**: Show the outline. Hide the rest. Upload the docs.

## Verification Plan

### Automated Tests
- **Chat Flow**: Use the browser tool to simulate a user talking to "Jay".
    - Test Case 1: Act confused -> Verify Jay suggests topics.
    - Test Case 2: Select a topic -> Verify Jay pitches it.
    - Test Case 3: Agree -> Verify Jay asks for WhatsApp.
- **Lead Capture**: Verify `saveLeadAction` is called with correct data.

### Manual Verification
1.  **The "Vibe" Check**: Talk to the bot. Does it feel like a "bro" pitching an idea?
2.  **The "Free Sample" Check**: Go to builder. Can I see the Chapter 1-5 outline without paying?
3.  **The "Paywall" Check**: Try to click "Generate Full Project". Am I blocked?
