# Project Coding Rules

## General
- Use TypeScript strict mode
- No `any` types
- All functions must have explicit return types

## Security  
- Never log sensitive data
- Validate all inputs with Zod

## Blueprint and Build Protocol (Mandatory)
This protocol governs the entire lifecycle of creating any non-trivial feature.

### Phase 1: The Blueprint (Planning & Documentation)
Before writing code, a plan MUST be created in `docs/features/FeatureName.md`. This plan must detail:
- High-Level Goal
- Component Breakdown (label "Server" or "Client")
- Logic & Data Breakdown (hooks, API routes)
- Database Schema Changes (if any)
- Step-by-Step Implementation Plan

**This plan requires human approval before proceeding.**

### Phase 2: The Build (Iterative Implementation)
Execute the plan one step at a time. Present code AND updated documentation after each step.
Wait for "proceed" signal before continuing.

### Phase 3: Finalization
Announce completion. Present final documentation. Provide integration instructions.

## Tech Stack Guidelines

> [!IMPORTANT]
> **Package Manager:** Use **pnpm** for all dependency management.

### 1. Next.js App Router Standard
- **Server First:** All components are RSC (React Server Components) by default.
- **Client Sparingly:** Only use `'use client'` for interactivity (`onClick`, `useState`) or browser APIs.
- **Data Fetching:** Fetch in RSCs. Pass data down. No `useEffect` fetching unless polling.
- **Routing:** Use Route Groups (`(marketing)`, `(bot)`, `(saas)`) to separate logical apps.

### 2. Styling & Design (The "Vibe")
- **Framework:** Tailwind CSS only. Utility-first.
- **Aesthetics:** "Overkill Sexy". High-end, premium feel.
- **Motion:** Heavy use of Framer Motion for 3D elements, floating effects, and scroll animations.
- **Theme:** Dark mode by default (implied by "premium/sexy").
- **Fonts:** Use Google Fonts (Inter/Outfit) for a clean, modern look.

### 3. Backend Logic (Service Pattern)
- **Route Handlers (`app/api/...`)**: Dumb controllers. They only parse requests and return responses.
- **Services (`src/services/*.service.ts`)**: The Brain. All business logic and DB calls go here.
- **Validation:** All inputs must be validated with **Zod**.

### 4. Database (Prisma + SQLite)
- **ORM:** Prisma.
- **Database:** SQLite (File-based, strictly typed).
- **Schema:** Defined in `prisma/schema.prisma`.
- **Migrations:** Run `npx prisma migrate dev` for strict schema changes.

### 5. State Management
- **Global State:** Zustand (for the Project Builder Wizard).
- **Local State:** `useState`/`useReducer`.