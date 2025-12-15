# FR-001: Agency Landing Page (Marketing)

## Goal
Create a high-impact, "sexy" landing page to build trust and convert visitors. The design must be "Overkill Sexy" with 3D elements, floating effects, and scroll animations.

## Component Breakdown

### Server Components (RSC)
- `src/app/(marketing)/page.tsx`: Main layout and structure.
- `src/features/marketing/components/ProjectGallery.tsx`: Loading project data (if dynamic) or static list.

### Client Components (`use client`)
- `src/features/marketing/components/Hero.tsx`:
    - Needs `framer-motion` for 3D/floating effects.
    - Countdown timer logic.
- `src/features/marketing/components/Pricing.tsx`:
    - interactive hover states for cards.
- `src/features/marketing/components/StickyCTA.tsx`:
    - Listens to scroll position to appear/disappear.

## Logic & Data Flow
- **Data**: Static content for the MVP. No database fetch required yet.
- **Interactivity**:
    - **Countdown**: Client-side calculation.
    - **Scroll**: Sticky CTA triggers on scroll threshold.
    - **Navigation**: Links to `/project/chat` (FR-002) and `/project/build` (FR-004).

## Database Schema
No changes required.

## Implementation Steps
1. [ ] **Setup**: Create `src/features/marketing` folder structure.
2. [ ] **Hero Section**: Implement with text gradients, "sexy" typography, and countdown.
3. [ ] **Pricing Section**: Implement card layout with hover effects.
4. [ ] **Project Gallery**: Implement grid of sample projects (placeholders).
5. [ ] **Sticky CTA**: Implement bottom-right floating button.
6. [ ] **Page Assembly**: Combine all into `src/app/(marketing)/page.tsx`.
