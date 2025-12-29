# 🎯 TASK-WT-003: Mobile Responsive Polish

**Branch:** `feat/design-polish-mobile`  
**Est. Time:** 2 hours  
**Conflict Risk:** ✅ NONE

---

## Objective

Fix mobile responsive issues identified in the design audit. Apply consistent padding, margins, and typography scaling across components.

---

## Pattern Replacements

Apply these patterns throughout the listed files:

| Find | Replace With |
|------|--------------|
| `p-8` | `p-4 md:p-8` |
| `p-6` (where excessive) | `p-4 md:p-6` |
| `mb-10` | `mb-6 md:mb-10` |
| `mt-16` | `mt-8 md:mt-16` |
| `text-3xl` | `text-2xl md:text-3xl` |
| `text-4xl` | `text-3xl md:text-4xl` |
| `min-h-[350px]` | `min-h-[200px] md:min-h-[350px]` |

---

## Files to MODIFY

### 1. `src/features/marketing/components/Hero.tsx`
- [ ] Consider hiding countdown timer on mobile or making compact
- [ ] Verify floating icons stay hidden on mobile (`hidden md:flex`)

### 2. `src/features/builder/components/TopicSelector.tsx`
- [ ] `p-8` padding is excessive → `p-4 md:p-8`
- [ ] Review chat handoff badge spacing

### 3. `src/features/builder/components/AbstractGenerator.tsx`
- [ ] `min-h-[350px]` textarea too tall for mobile
- [ ] Toolbar buttons may crowd on 320px width

### 4. `src/features/builder/components/PricingOverlay.tsx`
- [ ] CTA card width `md:w-80` - verify mobile fallback
- [ ] Spacing between elements

### 5. `src/features/builder/components/ChapterGenerator.tsx`
- [ ] Content container spacing
- [ ] Download button positioning

### 6. `src/features/builder/components/ProgressIndicator.tsx`
- [ ] Step labels may overflow on mobile
- [ ] Progress bar sizing

---

## DO NOT TOUCH

- ❌ `ChapterOutliner.tsx` (handled in Phase 1 refactor)
- ❌ Any API routes
- ❌ `prisma/schema.prisma`
- ❌ `globals.css` (handled in Phase 1)
- ❌ Admin components
- ❌ Bot/Chat components

---

## Testing Viewports

Test on these viewport widths:
- 320px (iPhone SE)
- 375px (iPhone 12 Mini)
- 390px (iPhone 12/13)
- 768px (iPad)
- 1024px (Desktop)

---

## Acceptance Criteria

- [ ] No horizontal scrolling on any mobile viewport
- [ ] All text is readable without zooming
- [ ] Buttons are tap-friendly (min 44px height)
- [ ] Content is above the fold on initial load
- [ ] No excessive whitespace on mobile
- [ ] Graceful transitions between breakpoints

---

## Testing

```bash
# 1. Open browser DevTools
# 2. Set viewport to 320px width
# 3. Navigate through: / → /chat → /project/builder
# 4. Verify no overflow, text legible
# 5. Repeat for 375px, 390px, 768px
```
