# 🚀 Parallel Agent Execution Plan

**Created:** 2025-12-29  
**Goal:** Enable 3-5 parallel agents via git worktrees to complete remaining tasks without merge conflicts.

---

## 📊 Task Dependency Analysis

### File Conflict Zones (⚠️ Cannot Parallelize)

| Conflict Zone | Files | Tasks Affected |
|---------------|-------|----------------|
| **Prisma Schema** | `prisma/schema.prisma` | All DB-related tasks |
| **Global CSS** | `src/app/globals.css` | Design Audit, Polish |
| **ChapterOutliner** | `ChapterOutliner.tsx` | Design Audit (Refactor), Pricing, Polish |
| **Chat Route** | `src/app/api/chat/route.ts` | Agent Jay, Notifications |
| **BuilderAiService** | `builderAiService.ts` | Project Assistant, Chapter Writing |

### Safe Parallel Zones (✅ No Conflicts)

| Zone | Files | Notes |
|------|-------|-------|
| **Admin Features** | `src/app/admin/`, `src/features/admin/` | Isolated admin routes/components |
| **New Pages** | `src/app/(saas)/dashboard/` | Creating new pages = no conflicts |
| **New Services** | `src/services/notification.service.ts` | New file = safe |
| **Marketing Polish** | `src/features/marketing/` | Isolated feature |
| **Error Boundaries** | `src/components/ui/ErrorBoundary.tsx` | New/isolated components |

---

## 🏗️ Execution Strategy

### Phase 1: Pre-Flight (SEQUENTIAL - Main Branch)

**Duration:** 30 min  
**Agent Count:** 1 (You or primary agent)

These tasks MUST be done on main first to prevent conflicts:

| Task | Description | Files | Why Sequential |
|------|-------------|-------|----------------|
| **1A** | Apply `.blur-content` utility class | `globals.css` | Shared dependency |
| **1B** | Split `ChapterOutliner.tsx` into 3 files | `ChapterOutliner.tsx` → `OutlinePreview.tsx`, `PaywallGate.tsx`, `PostPaymentDashboard.tsx` | Critical refactor, blocks other tasks |
| **1C** | Add missing Prisma models (if any) | `prisma/schema.prisma` | DB migrations |

**Commit & Push to `main` after Phase 1.**

---

### Phase 2: Parallel Wave 1 (3 Agents)

**Duration:** 2-3 hours  
**Agent Count:** 3 parallel worktrees

| Worktree | Branch | Task | Files Touched | Conflict Risk |
|----------|--------|------|---------------|---------------|
| **Agent-A** | `feat/admin-sales-automation` | Admin Sales Automation | `src/features/admin/`, `src/services/notification.service.ts`, `src/app/api/admin/` | ✅ SAFE |
| **Agent-B** | `feat/user-dashboard` | Implement User Dashboard (from design_audit C-03) | `src/app/(saas)/dashboard/`, `src/features/dashboard/` | ✅ SAFE (New files) |
| **Agent-C** | `feat/design-polish-mobile` | Mobile Responsive Polish (from design_audit) | `src/features/marketing/`, `src/features/builder/components/TopicSelector.tsx`, `AbstractGenerator.tsx` | ✅ SAFE (Different components from Phase 1) |

#### Agent-A: Admin Sales Automation
```
📂 Files to Create/Modify:
- src/services/notification.service.ts (CREATE)
- src/app/api/admin/leads/[id]/send-payment-link/route.ts (CREATE)
- src/features/admin/components/SendPaymentLinkButton.tsx (CREATE)
- src/features/admin/components/AdminLeadCard.tsx (MODIFY)
```

#### Agent-B: User Dashboard
```
📂 Files to Create:
- src/app/(saas)/dashboard/page.tsx (CREATE)
- src/features/dashboard/components/ProjectCard.tsx (CREATE)
- src/features/dashboard/components/ResourceDownloads.tsx (CREATE)
- src/features/dashboard/components/StatusTimeline.tsx (CREATE)
- src/features/dashboard/components/UpsellBanner.tsx (CREATE)
```

#### Agent-C: Mobile Responsive Polish
```
📂 Files to Modify:
- src/features/marketing/components/Hero.tsx
- src/features/builder/components/TopicSelector.tsx
- src/features/builder/components/AbstractGenerator.tsx
- src/features/builder/components/PricingOverlay.tsx
```

**Merge Strategy:** All 3 branches merge cleanly since they touch different files.

---

### Phase 3: Merge Wave 1 → Main

**Duration:** 15 min  
**Agent Count:** 1

```bash
git checkout main
git pull origin main
git merge feat/admin-sales-automation
git merge feat/user-dashboard  
git merge feat/design-polish-mobile
git push origin main
```

---

### Phase 4: Parallel Wave 2 (3 Agents)

**Duration:** 2-3 hours  
**Agent Count:** 3 parallel worktrees

| Worktree | Branch | Task | Files Touched | Conflict Risk |
|----------|--------|------|---------------|---------------|
| **Agent-D** | `feat/payment-webhooks` | Payment Webhooks & Verification | `src/app/api/pay/webhook/`, `src/services/paystack.service.ts` | ✅ SAFE |
| **Agent-E** | `feat/project-detail-modal` | Project Detail Modal (from design_audit C-04) | `src/features/marketing/components/ProjectDetailModal.tsx`, `src/features/marketing/components/ProjectGallery.tsx` | ✅ SAFE |
| **Agent-F** | `feat/error-states-polish` | Error States & Boundaries | `src/components/ui/ErrorBoundary.tsx`, `src/lib/errors.ts` | ✅ SAFE |

---

### Phase 5: Parallel Wave 3 (2 Agents - Careful Zone)

**Duration:** 1-2 hours  
**Agent Count:** 2 parallel worktrees

⚠️ These tasks touch some shared files - coordinate carefully.

| Worktree | Branch | Task | Files Touched | Conflict Risk |
|----------|--------|------|---------------|---------------|
| **Agent-G** | `feat/notifications-system` | Notifications System (JEFF-004) | `src/app/api/notifications/`, `src/features/notifications/` | 🟡 MEDIUM (may touch shared hooks) |
| **Agent-H** | `feat/document-viewer` | Document Viewer (JEFF-005) | `src/features/builder/components/DocumentViewer.tsx`, `src/app/api/documents/[id]/view/` | ✅ SAFE |

---

## 🚫 Cannot Parallelize (SEQUENTIAL ONLY)

These tasks touch too many shared files and MUST be done sequentially on main:

| Task | Reason | Dependencies |
|------|--------|--------------|
| **ChapterOutliner Refactor** | Touches God Component, used by multiple features | Must be Phase 1 |
| **Prisma Schema Changes** | Single source of truth, migrations affect all | Must be Phase 1 |
| **JEFF-003 (Full)** | Payment integration touches billing, webhooks, schema | Break into sub-tasks |

---

## 📋 Worktree-Compatible Task Cards

### TASK-WT-001: Admin Sales Automation
```yaml
Branch: feat/admin-sales-automation
Est. Time: 2 hours
Conflict Zone: NONE

Files to CREATE:
  - src/services/notification.service.ts
  - src/app/api/admin/leads/[id]/send-payment-link/route.ts
  - src/features/admin/components/SendPaymentLinkButton.tsx

Files to MODIFY:
  - src/features/admin/components/AdminLeadCard.tsx (add button)
  - src/app/admin/leads/page.tsx (add mobile card view)

Dependencies:
  - PaystackService (read-only)
  - Lead model in Prisma (read-only)

DO NOT TOUCH:
  - prisma/schema.prisma
  - src/app/api/chat/route.ts
  - Any builder/* files
```

### TASK-WT-002: User Dashboard
```yaml
Branch: feat/user-dashboard
Est. Time: 3 hours
Conflict Zone: NONE

Files to CREATE:
  - src/app/(saas)/dashboard/page.tsx
  - src/app/(saas)/dashboard/layout.tsx
  - src/features/dashboard/components/ProjectCard.tsx
  - src/features/dashboard/components/ResourceDownloads.tsx
  - src/features/dashboard/components/StatusTimeline.tsx
  - src/features/dashboard/components/UpsellBanner.tsx
  - src/features/dashboard/components/MobileBottomNav.tsx

Files to READ (not modify):
  - prisma/schema.prisma (Project model)
  - src/lib/auth-server.ts

DO NOT TOUCH:
  - Any existing components
  - Builder feature files
  - Admin feature files
```

### TASK-WT-003: Mobile Responsive Polish
```yaml
Branch: feat/design-polish-mobile
Est. Time: 2 hours
Conflict Zone: NONE

Files to MODIFY:
  - src/features/marketing/components/Hero.tsx (padding, typography)
  - src/features/builder/components/TopicSelector.tsx (p-8 → p-4 md:p-8)
  - src/features/builder/components/AbstractGenerator.tsx (min-height)
  - src/features/builder/components/PricingOverlay.tsx (spacing)
  - src/features/builder/components/ChapterGenerator.tsx (spacing)

Pattern: 
  - Replace `p-8` with `p-4 md:p-8`
  - Replace `mb-10` with `mb-6 md:mb-10`
  - Replace `text-3xl` with `text-2xl md:text-3xl`

DO NOT TOUCH:
  - ChapterOutliner.tsx (handled in Phase 1)
  - Any API routes
  - Prisma schema
```

### TASK-WT-004: Payment Webhooks
```yaml
Branch: feat/payment-webhooks
Est. Time: 2 hours
Conflict Zone: NONE

Files to CREATE:
  - src/app/api/pay/webhook/route.ts
  - src/services/billing.service.ts

Files to MODIFY:
  - src/services/paystack.service.ts (add verifyWebhookSignature)

DO NOT TOUCH:
  - Builder components
  - Admin components
  - Chat API
```

### TASK-WT-005: Project Detail Modal
```yaml
Branch: feat/project-detail-modal
Est. Time: 2 hours  
Conflict Zone: NONE

Files to CREATE:
  - src/features/marketing/components/ProjectDetailModal.tsx
  - src/features/marketing/components/ScreenshotCarousel.tsx
  - src/features/marketing/components/TechStackPills.tsx
  - src/features/marketing/components/DeliverablesList.tsx

Files to MODIFY:
  - src/features/marketing/components/ProjectGallery.tsx (add modal trigger)

DO NOT TOUCH:
  - Builder feature
  - Admin feature
  - API routes
```

### TASK-WT-006: Error States Polish
```yaml
Branch: feat/error-states-polish
Est. Time: 1.5 hours
Conflict Zone: NONE

Files to CREATE:
  - src/components/ui/ErrorBoundary.tsx
  - src/lib/errors.ts
  - src/components/ui/ErrorDisplay.tsx

Files to MODIFY:
  - src/app/layout.tsx (wrap with ErrorBoundary)

DO NOT TOUCH:
  - Feature-specific files
  - API routes (handled by API middleware)
```

---

## 🎯 Quick Reference: Agent Spawning

### Spawn 3 Parallel Agents (Wave 1)
```
Agent A: "Implement Admin Sales Automation per TASK-WT-001. Create notification service, payment link API, and admin UI components."

Agent B: "Create User Dashboard per TASK-WT-002. New page at /dashboard with project cards, status timeline, and download section."

Agent C: "Apply mobile responsive polish per TASK-WT-003. Fix padding, margins, and typography across marketing and builder components."
```

### Spawn 3 Parallel Agents (Wave 2)
```
Agent D: "Implement payment webhooks per TASK-WT-004. Create webhook route and billing service."

Agent E: "Create Project Detail Modal per TASK-WT-005. Marketing feature for case study showcase."

Agent F: "Implement error boundaries and states per TASK-WT-006. Global error handling."
```

---

## ✅ Summary

| Phase | Agents | Tasks | Duration |
|-------|--------|-------|----------|
| **1 - Pre-Flight** | 1 | ChapterOutliner refactor, CSS utilities | 30 min |
| **2 - Wave 1** | 3 | Admin Sales, Dashboard, Mobile Polish | 2-3 hrs |
| **3 - Merge 1** | 1 | Merge 3 branches | 15 min |
| **4 - Wave 2** | 3 | Webhooks, Modal, Error States | 2-3 hrs |
| **5 - Merge 2** | 1 | Merge 3 branches | 15 min |
| **6 - Wave 3** | 2 | Notifications, Document Viewer | 1-2 hrs |
| **7 - Final Merge** | 1 | Final merge + test | 30 min |

**Total Parallel Capacity:** 8 distinct tasks across 3 waves  
**Total Wall-Clock Time:** ~7-9 hours (vs ~20+ hours sequential)
