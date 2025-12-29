# 🎯 TASK-WT-005: Project Detail Modal

**Branch:** `feat/project-detail-modal`  
**Est. Time:** 2 hours  
**Conflict Risk:** ✅ NONE

---

## Objective

Implement the Project Detail Modal for the marketing page. When users click on a project in the gallery, they should see a full case study view.

---

## Files to CREATE

### 1. `src/features/marketing/components/ProjectDetailModal.tsx`
```tsx
// Main modal component with:
// - Modal backdrop with fade-in animation
// - Hero section (50vh) with gradient overlay
// - Floating tech icons
// - Category badges
// - Large project title with gradient text
// - Quick stats (Date, Duration, Page count)
// - About section in glass panel
// - Key Features grid (4 cards)
// - Screenshots carousel
// - Sidebar with tech stack and deliverables
// - CTA buttons ("Start Similar Project", "Ask About This")
// - Navigation arrows for browsing projects
```

### 2. `src/features/marketing/components/ScreenshotCarousel.tsx`
```tsx
// Horizontal scrolling carousel:
// - Touch/drag support
// - Indicator dots
// - Lazy loading for images
```

### 3. `src/features/marketing/components/TechStackPills.tsx`
```tsx
// Tech stack display:
// - Pill badges for each technology
// - Color-coded by category (Frontend, Backend, Database, etc.)
```

### 4. `src/features/marketing/components/DeliverablesList.tsx`
```tsx
// Deliverables checklist:
// - Checkmark icons
// - List of what's included in the project
```

### 5. `src/features/marketing/components/ProjectMetrics.tsx`
```tsx
// Progress bars showing:
// - Code Quality: 95%
// - Documentation: 88%
// - Test Coverage: 92%
```

---

## Files to MODIFY

### `src/features/marketing/components/ProjectGallery.tsx`
- Add modal trigger on project card click
- Pass project data to modal
- Add keyboard navigation (Escape to close, arrows for prev/next)

---

## Dependencies (READ-ONLY)

- Project data from gallery (static or from API)
- Framer Motion for animations

---

## DO NOT TOUCH

- ❌ Builder feature files
- ❌ Admin feature files
- ❌ Bot/Chat feature files
- ❌ API routes
- ❌ `prisma/schema.prisma`
- ❌ `globals.css`

---

## Mockup Reference

From `docs/mockups/project-detail-modal.html`:
- Hero with 50vh gradient overlay
- Floating tech icons
- Category badges (Computer Science, Distinction)
- Large gradient title
- Quick stats row
- Glass panel about section
- Key Features 2x2 grid
- Screenshots horizontal scroll
- Sidebar with tech stack pills
- Project metrics progress bars
- Deliverables checklist
- CTA buttons
- Arrow navigation

---

## Accessibility

- [ ] Modal traps focus
- [ ] Escape key closes modal
- [ ] Arrow keys navigate between projects
- [ ] Screen reader announces modal open/close
- [ ] Alt text on all images

---

## Acceptance Criteria

- [ ] Clicking project card opens modal
- [ ] Modal displays all project details from mockup
- [ ] Screenshots carousel is swipeable
- [ ] Tech stack pills render correctly
- [ ] CTA buttons link to appropriate pages
- [ ] Arrow navigation works between projects
- [ ] Modal closes on backdrop click or Escape

---

## Testing

```bash
# 1. Navigate to landing page (/)
# 2. Scroll to project gallery
# 3. Click on a project card
# 4. Verify modal opens with details
# 5. Test carousel, navigation arrows
# 6. Click "Start Similar Project" → should go to /chat
# 7. Press Escape → modal closes
```
