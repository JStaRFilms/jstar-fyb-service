# Project Detail Modal

## Overview
A high-fidelity, immersive case study viewer for projects in the marketing gallery. It provides localized details, technical metrics, and interactive screenshot carousels for premium "distinction-level" project displays.

## Architecture
- **Feature Directory:** `src/features/marketing/`
- **Data Source:** `src/features/marketing/data/projects.ts`
- **Main Component:** `src/features/marketing/components/ProjectDetailModal.tsx`

## Key Components

### ProjectDetailModal
The orchestrator component. Handles backdrop blurring, entry/exit animations via `AnimatePresence`, and keyboard navigation (Esc, Arrows).

### ScreenshotCarousel
`src/features/marketing/components/ScreenshotCarousel.tsx`
Horizontal scrolling gallery with touch support and selection state highlighting.

### ProjectMetrics
`src/features/marketing/components/ProjectMetrics.tsx`
Visualizes numerical data like Code Quality and Performance scores in a glassmorphism grid.

### TechStackPills
`src/features/marketing/components/TechStackPills.tsx`
Renders technology badges with specific visual styles for AI-related tools.

### DeliverablesList
`src/features/marketing/components/DeliverablesList.tsx`
Checked list of project artifacts delivered to the client.

## Data Structure
The modal and its children use the `ProjectDetail` interface:

```typescript
export interface ProjectDetail {
    id: string;
    title: string;
    category: string;
    summary: string;
    description: string;
    heroImage: string;
    techStack: string[];
    metrics: {
        codeQuality: number;
        performance: string;
    };
    features: {
        title: string;
        desc: string;
    }[];
    deliverables: string[];
    screenshots: string[];
    gradient: string; // Tailwind gradient classes
}
```

## Maintenance
To add or update projects shown in the gallery/modal:
1. Open `src/features/marketing/data/projects.ts`
2. Add or modify an object in the `PROJECTS` array.
3. The UI will automatically update based on the array content.

## Visual Design
- **Theme:** Deep space / Cyber (consistent with J-Star brand).
- **Effects:** Glassmorphism (blur: 24px), noise texture overlays, and spring-based animations.
- **Responsiveness:** Toggles between a sidebar-detailed view (Desktop) and a stacked scrollable view (Mobile).
