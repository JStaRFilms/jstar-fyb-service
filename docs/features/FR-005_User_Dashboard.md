# FR-005: User Dashboard

## Overview
The User Dashboard is the central hub for authenticated users (Project Owners) to manage their projects. It provides a high-level view of active projects, status tracking, resource downloads, and quick actions. It replaces the previous verified-only access model with a persistent dashboard.

## Architecture
- **Page:** `src/app/(saas)/dashboard/page.tsx`
- **Layout:** `src/app/(saas)/dashboard/layout.tsx`
- **Components:** `src/features/dashboard/components/*`
- **Dependencies:** Prisma (Project model), Auth (Session)

## Key Components

### ProjectCard
Displays a summary of a single project, including:
- Dynamic status badge (Active, Completed, etc.)
- Progress indicator
- Quick actions (View, Download)

### StatusTimeline
A visual stepper showing the project's lifecycle:
1. Topic Approved
2. Payment (Pending -> Verified)
3. Generation in Progress
4. Final Review
5. Completed

### UpsellSystem
Components that drive revenue:
- **UpsellBanner:** "Need a Human Touch?" promotional banner.
- **UpsellBridge:** "Done-For-You" visualization in the Builder flow.

### ResourceDownloads
A dedicated section for downloading generated assets:
- PDF Documentation
- DOCX Editable Drafts
- Research Materials

### UpsellBanner
"Need a Human Touch?" promotional banner connecting users to premium agency services.

## Data Flow
```mermaid
flowchart TD
    A[User] -->|Auth| B[Dashboard Page]
    B -->|Fetch| C[Prisma: Project]
    C -->|Return| B
    B -->|Render| D[ProjectList]
    D -->|Select| E[ProjectCard]
    E -->|Click| F[Builder / Download]
```
