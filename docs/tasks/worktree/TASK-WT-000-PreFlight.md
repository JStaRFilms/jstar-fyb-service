# 🎯 TASK-WT-000: Pre-Flight (SEQUENTIAL - MUST DO FIRST)

**Branch:** `main` (NO WORKTREE - Do directly on main)  
**Est. Time:** 45 minutes  
**Priority:** 🔴 BLOCKING - All other tasks depend on this

---

## ⚠️ WHY THIS MUST BE FIRST

These changes touch **shared files** that multiple worktree tasks depend on. If you skip this and start branching, you'll get merge conflicts later.

---

## Task 1A: Add `.blur-content` CSS Utility (15 min)

**File:** `src/app/globals.css`

Add this utility class (referenced by design audit C-01):

```css
/* Paywall blur effect for locked content */
.blur-content {
  filter: blur(8px);
  user-select: none;
  pointer-events: none;
  opacity: 0.5;
}

/* Gradual reveal for paywall overlay */
.paywall-gradient {
  background: linear-gradient(
    to top,
    var(--color-bg) 0%,
    var(--color-bg) 20%,
    transparent 100%
  );
}
```

---

## Task 1B: Refactor ChapterOutliner.tsx (30 min)

**Current Problem:** `ChapterOutliner.tsx` is 331 lines (violates 200-line rule) and mixes:
- Payment verification logic
- Content display
- Child component orchestration
- Store integration

**Goal:** Split into 3 focused components.

### Step 1: Create `src/features/builder/components/OutlinePreview.tsx`
Extract lines ~229-275 (the content display):
```tsx
// OutlinePreview.tsx
// Handles: Abstract display, chapter listing, markdown rendering
export function OutlinePreview({ 
  topic, 
  twist, 
  abstract, 
  chapters,
  isPaid 
}: OutlinePreviewProps) {
  return (
    <div className="glass-panel p-6 rounded-t-2xl">
      {/* Topic + twist header */}
      {/* Abstract preview */}
      {/* Chapter list */}
    </div>
  );
}
```

### Step 2: Create `src/features/builder/components/PaywallGate.tsx`
Extract/create paywall overlay logic:
```tsx
// PaywallGate.tsx
// Handles: Blur effect, lock overlay, payment CTA
export function PaywallGate({ 
  children, 
  isPaid, 
  onUnlock 
}: PaywallGateProps) {
  if (isPaid) return <>{children}</>;
  
  return (
    <div className="relative">
      {/* Visible teaser content */}
      <div className="blur-content">
        {children}
      </div>
      
      {/* Paywall overlay */}
      <div className="absolute inset-0 paywall-gradient flex flex-col items-center justify-end pb-10 z-10">
        <Lock className="w-8 h-8 text-primary mb-4" />
        <h3>Unlock Full Project</h3>
        <PricingOverlay onUnlock={onUnlock} />
      </div>
    </div>
  );
}
```

### Step 3: Create `src/features/builder/hooks/usePaymentVerification.ts`
Extract lines ~37-58 (payment verification useEffect):
```typescript
// usePaymentVerification.ts
export function usePaymentVerification(projectId: string) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'success' | 'failed' | null>(null);
  
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const reference = searchParams.get('reference');
    
    if (reference) {
      // Verify payment with Paystack...
    }
  }, []);
  
  return { isVerifying, verificationResult };
}
```

### Step 4: Slim down `ChapterOutliner.tsx`
After extraction, it should:
- Import and use `OutlinePreview`, `PaywallGate`, `usePaymentVerification`
- Only handle orchestration logic
- Be under 150 lines

---

## Task 1C: Integrate ProgressIndicator (Optional - 10 min)

**File:** `src/app/(saas)/project/builder/page.tsx` or equivalent

The `ProgressIndicator.tsx` component exists but isn't visible in the builder page.

```tsx
// Add to builder layout
import { ProgressIndicator } from '@/features/builder/components/ProgressIndicator';

export default function BuilderPage() {
  return (
    <div>
      <header className="sticky top-0 z-50 bg-dark/90 backdrop-blur-md border-b border-white/5">
        <ProgressIndicator currentStep={currentStep} />
      </header>
      
      <main>
        <ChapterOutliner />
      </main>
    </div>
  );
}
```

---

## Verification Checklist

Before starting any worktree branches, confirm:

- [ ] `.blur-content` and `.paywall-gradient` classes exist in `globals.css`
- [ ] `OutlinePreview.tsx` exists and exports component
- [ ] `PaywallGate.tsx` exists and exports component
- [ ] `usePaymentVerification.ts` hook exists
- [ ] `ChapterOutliner.tsx` is under 200 lines
- [ ] App builds without errors: `pnpm build`
- [ ] Commit changes: `git add . && git commit -m "refactor: pre-flight cleanup for parallel development"`
- [ ] Push to main: `git push origin main`

---

## DO NOT TOUCH

- ❌ API routes (leave for specific tasks)
- ❌ Admin components
- ❌ Bot/Chat components
- ❌ Marketing components
- ❌ Prisma schema

---

## After Completion

Once this task is done and pushed to `main`, you can spawn parallel agents for:

1. **TASK-WT-001** - Admin Sales Automation
2. **TASK-WT-002** - User Dashboard  
3. **TASK-WT-003** - Mobile Polish

Each agent creates a worktree branch from the updated `main`.
