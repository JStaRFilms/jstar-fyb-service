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
- `src/features/marketing/components/Navbar.tsx`:
    - Floating navigation with blur effect.
    - NEW: Added direct "Agency" funnel link.
- `src/features/marketing/components/Footer.tsx`:
    - NEW: Added "Full Agency Service" CTA.

### Assets
- `public/images/jay-portrait.png`: High-end portrait of the Lead Architect, used for agency branding.

## Logic & Data Flow
- **Data**: Static content for the MVP. No database fetch required yet.
- **Interactivity**:
    - **Countdown**: Client-side calculation.
    - **Scroll**: Sticky CTA triggers on scroll threshold.
    - **Navigation**: 
        - SaaS Path: Links to `/auth/register` -> `/project/builder`.
        - Agency Path: Links to `/project/consult` (Jay's Page).
    - **Portraits**: Grayscale-to-color hover effects on Jay's imagery.

## Database Schema
No changes required.

## Implementation Steps
1. [x] **Setup**: Create `src/features/marketing` folder structure.
2. [x] **Hero Section**: Implement with text gradients, "sexy" typography, and countdown.
3. [x] **Pricing Section**: Implement card layout with hover effects.
4. [x] **Project Gallery**: Implement grid of sample projects (placeholders).
5. [x] **Sticky CTA**: Implement bottom-right floating button.
6. [x] **Accessibility**: Added "Agency" links across Hero, Navbar, and Footer for funnel clarity.
7. [x] **Page Assembly**: Combine all into `src/app/(marketing)/page.tsx`.
