# Project Detail Modal

## Goal
To provide a rich, immersive case study view for projects in the marketing gallery, enabling potential clients (students) to see the depth and quality of the "distinction-level" work.

## Data Structure
The modal will receive a `Project` object (or fetch detailed data based on ID).

```typescript
interface Project {
  id: string;
  title: string;
  category: string;
  heroImage: string;
  summary: string;
  techStack: {
    name: string;
    icon?: string; // or lucide icon name
    category: 'frontend' | 'backend' | 'db' | 'infra';
  }[];
  metrics: {
    codeQuality: number; // 0-100
    documentation: number; // 0-100
    testing: number; // 0-100
  };
  features: {
    title: string;
    description: string;
    icon: string;
  }[];
  deliverables: string[];
  screenshots: string[];
}
```

## Component Architecture

- **ProjectDetailModal**: The orchestrator. Handles layout, animation, and closing logic.
  - **ScreenshotCarousel**: Displays project images.
  - **TechStackPills**: Displays technologies used.
  - **ProjectMetrics**: Visualizes project quality stats.
  - **DeliverablesList**: Checklist of what was delivered.

## Visual Design
- **Backdrop**: Blurred fade-in custom backdrop.
- **Animation**: `AnimatePresence` for smooth entry/exit.
- **Layout**: 
  - Desktop: Two-column layout (Content Left, Sticky Sidebar Right).
  - Mobile: Single column, stacked.
- **Styling**: Glassmorphism, gradients consistent with "Recent Masterpieces" section.
