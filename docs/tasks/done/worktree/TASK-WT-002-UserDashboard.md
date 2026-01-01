# 🎯 TASK-WT-002: User Dashboard

**Branch:** `feat/user-dashboard`  
**Est. Time:** 3 hours  
**Conflict Risk:** ✅ NONE (All new files)

---

## Objective

Implement the missing User Dashboard page where users can view/manage their paid projects, download resources, and track progress.

---

## Files to CREATE

### 1. `src/app/(saas)/dashboard/page.tsx`
```tsx
// Main dashboard page with:
// - Project list
// - Active project card with status
// - Quick actions
```

### 2. `src/app/(saas)/dashboard/layout.tsx`
```tsx
// Dashboard layout with:
// - Header with "My Projects" title
// - User avatar
// - Navigation
```

### 3. `src/features/dashboard/components/ProjectCard.tsx`
```tsx
// Active project card with:
// - Status badge (Active with green pulse)
// - Project title and description
// - Progress percentage
// - Quick action buttons (Abstract, Full Doc)
```

### 4. `src/features/dashboard/components/StatusTimeline.tsx`
```tsx
// Visual timeline showing:
// - Topic Approved ✓
// - Payment Verified ✓
// - Generating... (animated)
// - Chapter 1, 2, 3...
```

### 5. `src/features/dashboard/components/ResourceDownloads.tsx`
```tsx
// Downloads section with:
// - File cards (DOC, PDF icons)
// - Download buttons
// - Loading state for in-progress files
```

### 6. `src/features/dashboard/components/UpsellBanner.tsx`
```tsx
// "Need a Human Touch?" upsell banner
// Links to agency consultation
```

### 7. `src/features/dashboard/components/MobileBottomNav.tsx`
```tsx
// Mobile bottom navigation:
// - Home
// - Projects
// - Me (Profile)
```

---

## Dependencies (READ-ONLY)

- `prisma/schema.prisma` - Project model
- `src/lib/auth-server.ts` - getCurrentUser()
- `src/lib/prisma.ts` - Prisma client

---

## DO NOT TOUCH

- ❌ Any existing components in `builder/`, `bot/`, `marketing/`, `admin/`
- ❌ `prisma/schema.prisma`
- ❌ `globals.css`
- ❌ Any API routes

---

## Mockup Reference

From `docs/mockups/dashboard.html`:
- Header with "My Projects" + avatar
- Active Project Card with status badge
- Status timeline with checkmarks
- Resources/Downloads section
- Mobile bottom nav

---

## Acceptance Criteria

- [ ] User can navigate to `/dashboard`
- [ ] Dashboard shows list of user's projects
- [ ] Active project shows status timeline
- [ ] Download buttons work for completed resources
- [ ] Mobile bottom navigation is functional
- [ ] Upsell banner links to agency consultation

---

## Testing

```bash
# 1. Log in as a user with a paid project
# 2. Navigate to /dashboard
# 3. Verify project card displays correctly
# 4. Click download buttons
# 5. Test on mobile viewport
```
