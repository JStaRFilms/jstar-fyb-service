# Escalation Handoff Report

**Generated:** 2026-01-02T07:23:42+01:00  
**Original Issue:** Builder page reverts to ABSTRACT step after chapter generation, causing duplicate project creation

---

## PART 1: THE DAMAGE REPORT

### 1.1 Original Goal
Fix a race condition where:
1. User generates a chapter successfully (saved to DB)
2. Page refresh reverts to ABSTRACT step (instead of staying on OUTLINE)
3. User must click "Confirm and Generate" which creates a NEW project
4. This leads to duplicate projects in the database

### 1.2 Observed Failure / Error
No hard error - the system "works" but with incorrect behavior:

```
[BuilderPage] Loaded user's UNLOCKED project: cmjwhgrir001cfskwmo6vj40z
GET /project/builder 200
```

Server correctly loads the UNLOCKED project with outline data, but client-side the `step` state becomes `ABSTRACT` instead of `OUTLINE`.

**Evidence from logs:**
- Server loads correct project with `isUnlocked: true`
- Client renders ABSTRACT step instead of OUTLINE
- Clicking "Confirm & Generate" in AbstractGenerator triggers new project creation

### 1.3 Failed Approach
Multiple fix attempts were made:

1. **Reset `hasServerHydrated` flag** on each navigation (BuilderClient.tsx line 49)
2. **Added hydration guard** - block rendering until `loadProject` completes (BuilderClient.tsx lines 107-118)
3. **Force-clear localStorage handoff** in `loadProject` (useBuilderStore.ts line 262-264)
4. **Replace data entirely** instead of merging in `loadProject` (useBuilderStore.ts lines 274-285)
5. **Prioritize UNLOCKED projects** in page.tsx query (lines 36-47)
6. **Pass projectId to outline API** to prevent duplicate creation

None of these fixes resolved the core issue.

### 1.4 Key Files Involved
- `src/app/(saas)/project/builder/page.tsx` - Server component, fetches project
- `src/app/(saas)/project/builder/BuilderClient.tsx` - Client component, hydration logic
- `src/features/builder/store/useBuilderStore.ts` - Zustand store with persist middleware
- `src/features/builder/components/AbstractGenerator.tsx` - Triggers outline generation
- `src/features/builder/components/ChapterOutliner.tsx` - Renders outline step, contains ChapterGenerator

### 1.5 Best-Guess Diagnosis

**ROOT CAUSE HYPOTHESIS:**
The `step` is being determined by `loadProject` based on `projectData.outline?.length`:

```typescript
step: (projectData.outline && projectData.outline.length > 0) ? 'OUTLINE'
    : projectData.abstract ? 'ABSTRACT'
        : projectData.topic ? 'ABSTRACT'
            : 'TOPIC',
```

**The problem:** `serverProject.outline` is coming from `page.tsx` as `parsedOutline` (lines 63-70):

```typescript
let parsedOutline: Chapter[] = [];
if (recentProject.outline && recentProject.outline.content) {
    try {
        parsedOutline = JSON.parse(recentProject.outline.content);
    } catch (e) {
        console.error("Failed to parse outline content", e);
    }
}
```

**CRITICAL INSIGHT:** The `ChapterOutline` table is SEPARATE from the `Chapter` table!
- `include: { outline: true }` in Prisma includes `ChapterOutline` (the 5-chapter structure)
- But actual generated chapter CONTENT is in the `Chapter` table
- If `ChapterOutline.content` is empty/null/invalid JSON, `parsedOutline` stays as `[]`
- This causes `step` to become `ABSTRACT` instead of `OUTLINE`

**Secondary issue:** Even if outline exists, the Zustand persist middleware may hydrate stale data BEFORE `loadProject` runs, causing components to render with wrong projectId.

---

## PART 2: FULL FILE CONTENTS (Self-Contained)

### File: `src/app/(saas)/project/builder/page.tsx`
```tsx
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { ProjectData } from "@/features/builder/store/useBuilderStore";
import { BuilderClient } from "./BuilderClient"; // We'll assume it's in the same folder
import { Chapter } from "@/features/builder/schemas/outlineSchema";

interface PageProps {
    searchParams: Promise<{ projectId?: string; payment_ref?: string }>;
}

export default async function BuilderPage({ searchParams }: PageProps) {
    const user = await getCurrentUser();
    const params = await searchParams;
    const targetProjectId = params?.projectId; // From upgrade callback URL

    let serverProject: Partial<ProjectData> | null = null;

    if (user) {
        let recentProject = null;

        // Priority 1: If projectId is specified in URL (e.g., from upgrade callback), load THAT project
        if (targetProjectId) {
            console.log(`[BuilderPage] Loading specific project from URL: ${targetProjectId}`);
            recentProject = await prisma.project.findUnique({
                where: { id: targetProjectId },
                include: { outline: true }
            });
            // Security: Verify the project belongs to this user (or is anonymous and claimable)
            if (recentProject && recentProject.userId && recentProject.userId !== user.id) {
                console.warn(`[BuilderPage] User ${user.id} tried to access project ${targetProjectId} owned by ${recentProject.userId}`);
                recentProject = null; // Don't load someone else's project
            }
        }

        // Priority 2: Try to load the user's UNLOCKED (paid) project first
        // This prevents accidentally loading a stale unpaid draft if multiple projects exist
        if (!recentProject) {
            recentProject = await prisma.project.findFirst({
                where: { userId: user.id, isUnlocked: true },
                orderBy: { updatedAt: 'desc' },
                include: { outline: true }
            });
            if (recentProject) {
                console.log(`[BuilderPage] Loaded user's UNLOCKED project: ${recentProject.id}`);
            }
        }

        // Priority 3: Fall back to most recent project (even if not paid)
        if (!recentProject) {
            recentProject = await prisma.project.findFirst({
                where: { userId: user.id },
                orderBy: { updatedAt: 'desc' },
                include: { outline: true }
            });
            if (recentProject) {
                console.log(`[BuilderPage] Loaded user's most recent project: ${recentProject.id}`);
            }
        }

        if (recentProject) {
            // Map to ProjectData
            let parsedOutline: Chapter[] = [];
            if (recentProject.outline && recentProject.outline.content) {
                try {
                    parsedOutline = JSON.parse(recentProject.outline.content);
                } catch (e) {
                    console.error("Failed to parse outline content", e);
                }
            }

            serverProject = {
                userId: user.id,
                projectId: recentProject.id,
                topic: recentProject.topic,
                twist: recentProject.twist || "",
                abstract: recentProject.abstract || "",
                outline: parsedOutline,
                // @ts-ignore - casting string to literal type
                mode: recentProject.mode as any,
                // @ts-ignore - casting string to literal type
                status: recentProject.status as any,
            };
        }
    }

    // @ts-ignore
    const isUnlocked = serverProject ? (await prisma.project.findUnique({ where: { id: serverProject.projectId! }, select: { isUnlocked: true } }))?.isUnlocked : false;

    return (
        <Suspense fallback={<div className="min-h-screen bg-dark flex items-center justify-center text-white/50">Loading Builder...</div>}>
            <BuilderClient serverProject={serverProject} serverIsPaid={isUnlocked || false} />
        </Suspense>
    );
}
```

---

### File: `src/app/(saas)/project/builder/BuilderClient.tsx`
```tsx
'use client';

import { Suspense } from "react";
import { useBuilderStore, ProjectData } from "@/features/builder/store/useBuilderStore";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TopicSelector } from "@/features/builder/components/TopicSelector";
import { AbstractGenerator } from "@/features/builder/components/AbstractGenerator";
import { ChapterOutliner } from "@/features/builder/components/ChapterOutliner";
import { X, Loader2 } from "lucide-react";
import Link from "next/link";

import { useSession } from "@/lib/auth-client";
import { mergeAnonymousData } from "@/features/bot/actions/chat";
import { usePaymentVerification } from "@/features/builder/hooks/usePaymentVerification";

interface BuilderClientProps {
    serverProject?: Partial<ProjectData> | null;
    serverIsPaid?: boolean;
}

export function BuilderClient({ serverProject, serverIsPaid = false }: BuilderClientProps) {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const { step, updateData, syncWithUser, hydrateFromChat, loadProject, isPaid, unlockPaywall } = useBuilderStore();
    const searchParams = useSearchParams();

    // CRITICAL: Track local hydration state to prevent rendering with stale data
    const [isHydrated, setIsHydrated] = useState(false);

    // CRITICAL: Run payment verification at the TOP LEVEL so it runs on ALL steps, not just OUTLINE
    const { isVerifying, verificationResult } = usePaymentVerification(isPaid, unlockPaywall);

    // Scroll to top on mount to prevent starting at upgrade section
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // ========== CONSOLIDATED HYDRATION LOGIC ==========
    // This single effect handles all state hydration in the correct order to prevent race conditions.
    // Priority: Server Data > Chat Handoff > localStorage (zustand persist handles this passively)
    useEffect(() => {
        // Wait for auth to resolve before doing anything
        if (isPending) return;

        // 🔧 FIX: Reset hasServerHydrated to allow fresh data on each navigation/tab
        // This ensures that server data (especially isPaid) can always override stale localStorage
        useBuilderStore.setState({ hasServerHydrated: false });

        // STEP 1: Check for Fresh Chat Handoff (Top Priority)
        // If a new handoff exists (e.g. user just clicked "Build"), it overrides any existing server draft
        // UNLESS the server draft is PAID and matches the handoff (Prevent Downgrade)
        const hasFreshHandoff = hydrateFromChat(session?.user?.id, serverProject, serverIsPaid);

        if (hasFreshHandoff) {
            console.log('[BuilderClient] Fresh chat handoff applied. Skipping server load.');
            // Mark as hydrated even for handoff case
            setIsHydrated(true);
            return;
        }

        // STEP 2: Load server project if available (Secondary Priority)
        // Only if no fresh handoff occurred
        if (serverProject) {
            loadProject(serverProject, serverIsPaid);
            console.log('[BuilderClient] Hydrated from server', { projectId: serverProject.projectId, isPaid: serverIsPaid });
        }

        // STEP 3: Sync with current user (only runs destructive reset on actual logout/account-switch)
        syncWithUser(session?.user?.id || null);

        // CRITICAL: Mark hydration complete AFTER all state updates
        setIsHydrated(true);

    }, [isPending, serverProject, serverIsPaid, session?.user?.id, loadProject, syncWithUser, hydrateFromChat]);

    // 1. Auth Guard: Redirect to Login if not authenticated
    useEffect(() => {
        if (!isPending && !session) {
            const params = searchParams.toString();
            const callbackUrl = params ? `/project/builder?${params}` : '/project/builder';
            router.push(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        }
    }, [isPending, session, searchParams, router]);

    useEffect(() => {
        if (!isPending && session?.user?.id) {
            const anonymousId = localStorage.getItem("jstar_anonymous_id");
            if (anonymousId) {
                mergeAnonymousData(anonymousId, session.user.id).then(() => {
                    localStorage.removeItem("jstar_anonymous_id");
                });
            }
        }
    }, [session?.user?.id, isPending]);

    useEffect(() => {
        const topic = searchParams.get('topic');
        const twist = searchParams.get('twist');
        if (topic && twist) updateData({ topic, twist });
    }, [searchParams, updateData]);

    // Helper to determine step index
    const getStepIndex = () => ['TOPIC', 'ABSTRACT', 'OUTLINE'].indexOf(step);

    // ========== HYDRATION LOADING STATE ==========
    // Block rendering of main content until hydration is complete to prevent stale data issues
    if (!isHydrated || isPending) {
        return (
            <div className="w-full flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-gray-400 text-sm">Loading your project...</p>
                </div>
            </div>
        );
    }


    return (
        <div className="w-full">
            {/* Payment Verification Loading Overlay */}
            {isVerifying && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                        <p className="text-white font-bold text-lg">Verifying Payment...</p>
                        <p className="text-gray-400 text-sm">Please wait while we confirm your payment.</p>
                    </div>
                </div>
            )}
            {/* Progress Toolbar */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display font-bold text-2xl text-white">Project Builder</h2>
                </div>

                {/* Steps Progress */}
                <div className="flex items-center gap-2">
                    {['TOPIC', 'ABSTRACT', 'OUTLINE'].map((s, i) => {
                        const currentIndex = getStepIndex();
                        const isCompleted = currentIndex > i;
                        const isActive = currentIndex === i;

                        return (
                            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 relative overflow-hidden ${isCompleted ? 'bg-green-500' :
                                isActive ? 'bg-primary' : 'bg-white/10'
                                }`}>
                                {isActive && (
                                    <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]" />
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-between mt-2 text-xs font-mono text-gray-500 uppercase">
                    <span className={getStepIndex() >= 0 ? "text-white" : ""}>Topic</span>
                    <span className={getStepIndex() >= 1 ? "text-white" : ""}>Context</span>
                    <span className={getStepIndex() >= 2 ? "text-primary font-bold" : ""}>Generate</span>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="relative">
                <AnimatePresence mode="wait">
                    {step === 'TOPIC' && (
                        <motion.div
                            key="topic"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <TopicSelector />
                        </motion.div>
                    )}

                    {step === 'ABSTRACT' && (
                        <motion.div
                            key="abstract"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <AbstractGenerator />
                        </motion.div>
                    )}

                    {step === 'OUTLINE' && (
                        <motion.div
                            key="outline"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <ChapterOutliner />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
```

---

### File: `src/features/builder/store/useBuilderStore.ts`
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Chapter } from '../schemas/outlineSchema';

/**
 * IMPORTANT: State Hydration Priority
 * 
 * This store uses Zustand's persist middleware with localStorage.
 * The hydration order is CRITICAL to prevent race conditions:
 * 
 * 1. Zustand instantly hydrates `data` from localStorage (SYNC)
 * 2. Server component fetches fresh data from DB (ASYNC)
 * 3. BuilderClient.tsx calls loadProject() with server data
 * 
 * The `hasServerHydrated` flag prevents localStorage from overwriting
 * server data AFTER loadProject() is called. It is reset on each
 * navigation in BuilderClient.tsx to allow fresh data.
 * 
 * NEVER persist `isPaid` to localStorage - server is ALWAYS source of truth.
 */

export type BuilderStep = 'TOPIC' | 'ABSTRACT' | 'OUTLINE' | 'PAYWALL';
export type ProjectMode = 'DIY' | 'CONCIERGE' | null;
export type ProjectStatus = 'OUTLINE_GENERATED' | 'RESEARCH_IN_PROGRESS' | 'RESEARCH_COMPLETE' | 'WRITING_IN_PROGRESS' | 'PROJECT_COMPLETE';

// Re-export for consumers
export type { Chapter };

export interface ProjectData {
    userId: string | null;
    projectId: string | null;
    topic: string;
    twist: string;
    abstract: string;
    outline: Chapter[];
    mode: ProjectMode;
    status: ProjectStatus;
}

interface BuilderState {
    step: BuilderStep;
    data: ProjectData;
    isGenerating: boolean;
    isPaid: boolean;
    isFromChat: boolean;
    hasServerHydrated: boolean; // Prevents localStorage from overwriting server data

    setStep: (step: BuilderStep) => void;
    updateData: (data: Partial<ProjectData>) => void;
    setGenerating: (isGenerating: boolean) => void;
    unlockPaywall: () => void;
    setMode: (mode: ProjectMode) => void;
    hydrateFromChat: (userId?: string | null, existingProject?: Partial<ProjectData> | null, existingIsPaid?: boolean) => boolean;
    clearChatData: () => void;
    syncWithUser: (userId: string | null) => void;
    loadProject: (data: Partial<ProjectData>, isPaid?: boolean) => void;
}

const CHAT_HANDOFF_KEY = 'jstar_confirmed_topic';

export const useBuilderStore = create<BuilderState>()(
    persist(
        (set, get) => ({
            step: 'TOPIC',
            data: {
                userId: null,
                projectId: null,
                topic: '',
                twist: '',
                abstract: '',
                outline: [],
                mode: null,
                status: 'OUTLINE_GENERATED'
            },
            isGenerating: false,
            isPaid: false,
            isFromChat: false,
            hasServerHydrated: false,

            setStep: (step) => set({ step }),
            updateData: (newData) => set((state) => ({
                data: { ...state.data, ...newData }
            })),
            setGenerating: (isGenerating) => set({ isGenerating }),
            unlockPaywall: () => set({ isPaid: true }),
            setMode: (mode) => set((state) => ({
                data: { ...state.data, mode }
            })),

            // Hydrate topic/twist from localStorage (set by chat handoff)
            hydrateFromChat: (currentUserId, existingProject, existingIsPaid) => {
                if (typeof window === 'undefined') return false;

                // Don't overwrite if server already hydrated
                if (get().hasServerHydrated) {
                    console.log('[Builder] Server already hydrated, skipping chat hydration');
                    return false;
                }

                const stored = localStorage.getItem(CHAT_HANDOFF_KEY);
                if (!stored) return false;

                try {
                    const { topic, twist, confirmedAt, userId: handoffUserId } = JSON.parse(stored);

                    // Check if data belongs to current user
                    if (currentUserId && handoffUserId && currentUserId !== handoffUserId) {
                        console.warn('[Builder] Handoff data mismatch (different user)');
                        localStorage.removeItem(CHAT_HANDOFF_KEY);
                        return false;
                    }

                    // Check if data is stale (older than 24 hours)
                    const confirmedDate = new Date(confirmedAt);
                    const now = new Date();
                    const hoursOld = (now.getTime() - confirmedDate.getTime()) / (1000 * 60 * 60);
                    if (hoursOld > 24) {
                        localStorage.removeItem(CHAT_HANDOFF_KEY);
                        return false;
                    }

                    // CRITICAL FIX: Prevent downgrading a Paid Project
                    if (existingIsPaid) {
                        console.log('[Builder] Server project is PAID. Ignoring chat handoff to prevent downgrade.', {
                            serverTopic: existingProject?.topic,
                            handoffTopic: topic
                        });
                        localStorage.removeItem(CHAT_HANDOFF_KEY);
                        return false;
                    }

                    // If handoff is VERY fresh (<5 mins), valid user intent overrides server state
                    const minutesOld = hoursOld * 60;
                    const isFreshHandoff = minutesOld < 5;

                    if (isFreshHandoff) {
                        console.log('[Builder] Fresh handoff detected, overriding server data', { minutesOld });
                        set({
                            data: {
                                ...get().data,
                                topic,
                                twist: twist || '',
                                abstract: '',
                                outline: [],
                                projectId: null,
                                status: 'OUTLINE_GENERATED'
                            },
                            step: 'TOPIC',
                            isFromChat: true,
                            isPaid: false
                        });
                        localStorage.removeItem(CHAT_HANDOFF_KEY);
                        return true;
                    }

                    // Standard hydration (only if empty)
                    if (!get().data.topic) {
                        set({
                            data: { ...get().data, topic, twist: twist || '', userId: currentUserId || null },
                            isFromChat: true
                        });
                        return true;
                    }
                    return false;
                } catch (e) {
                    console.error('[Builder] Failed to parse chat handoff data:', e);
                    localStorage.removeItem(CHAT_HANDOFF_KEY);
                    return false;
                }
            },

            // Clear chat handoff data and reset form
            clearChatData: () => {
                localStorage.removeItem(CHAT_HANDOFF_KEY);
                set({
                    data: { userId: get().data.userId, projectId: null, topic: '', twist: '', abstract: '', outline: [], mode: null, status: 'OUTLINE_GENERATED' },
                    isFromChat: false,
                    step: 'TOPIC'
                });
            },

            // Sync state with current authenticated user
            syncWithUser: (userId) => {
                const { data: currentData, hasServerHydrated } = get();

                if (hasServerHydrated) {
                    console.log('[Builder] Server already hydrated, skipping syncWithUser reset');
                    return;
                }

                // CASE 1: Transitioning from Anonymous to Authenticated
                if (currentData.userId === null && userId !== null && currentData.topic) {
                    console.log('[Builder] Claiming anonymous session data for user', userId);
                    set((state) => ({
                        data: { ...state.data, userId }
                    }));
                    return;
                }

                // CASE 2: Explicit logout
                if (currentData.userId !== null && userId === null) {
                    console.log('[Builder] Logout detected. Clearing store.');
                    set({
                        data: {
                            userId: null,
                            projectId: null,
                            topic: '',
                            twist: '',
                            abstract: '',
                            outline: [],
                            mode: null,
                            status: 'OUTLINE_GENERATED'
                        },
                        step: 'TOPIC',
                        isPaid: false,
                        isFromChat: false,
                        hasServerHydrated: false
                    });
                    localStorage.removeItem(CHAT_HANDOFF_KEY);
                    return;
                }

                // CASE 3: Account switch
                if (currentData.userId !== null && userId !== null && currentData.userId !== userId) {
                    console.log('[Builder] Account switch detected.', { old: currentData.userId, new: userId });
                    set({
                        data: {
                            userId,
                            projectId: null,
                            topic: '',
                            twist: '',
                            abstract: '',
                            outline: [],
                            mode: null,
                            status: 'OUTLINE_GENERATED'
                        },
                        step: 'TOPIC',
                        isPaid: false,
                        isFromChat: false,
                        hasServerHydrated: false
                    });
                    localStorage.removeItem(CHAT_HANDOFF_KEY);
                }
            },

            // Load a full project object (e.g. from server)
            loadProject: (projectData, isPaid = false) => {
                console.log('[Builder] Hydrating from server project', { id: projectData.projectId, isPaid, outlineLen: projectData.outline?.length });

                // CRITICAL: Clear stale chat handoff
                if (typeof window !== 'undefined') {
                    localStorage.removeItem(CHAT_HANDOFF_KEY);
                }

                set((state) => ({
                    // Determine step based on data presence
                    step: (projectData.outline && projectData.outline.length > 0) ? 'OUTLINE'
                        : projectData.abstract ? 'ABSTRACT'
                            : projectData.topic ? 'ABSTRACT'
                                : 'TOPIC',
                    data: {
                        userId: null,
                        projectId: null,
                        topic: '',
                        twist: '',
                        abstract: '',
                        outline: [],
                        mode: null,
                        status: 'OUTLINE_GENERATED' as const,
                        ...projectData
                    },
                    isPaid: isPaid ?? false,
                    isFromChat: false,
                    hasServerHydrated: true
                }));
            }
        }),
        {
            name: 'jstar-builder-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                data: state.data,
                isFromChat: state.isFromChat
            }),
        }
    )
);
```

---

## PART 3: DIRECTIVE FOR ORCHESTRATOR

**Attention: Senior AI Orchestrator**

You have received this Escalation Handoff Report. A local agent has failed to solve this problem after multiple attempts.

**Your Directive:**

1. **Analyze the Failure:** The hypothesis is that `ChapterOutline.content` is empty/null when loaded, causing `parsedOutline` to be `[]`, which sets `step` to `ABSTRACT`.

2. **Verify the Database State:** 
   - Is `ChapterOutline` being created/updated when outline is generated?
   - Check `POST /api/projects/[id]/outline` and `POST /api/generate/outline` routes
   - Confirm the `content` field contains valid JSON

3. **Investigate Alternative Causes:**
   - Is Zustand persist middleware re-hydrating stale `outline: []` AFTER `loadProject` runs?
   - Is `loadProject` being called multiple times?
   - Is there a timing issue with React's concurrent rendering?

4. **Formulate a New Plan:** Generate a complete implementation plan that:
   - Ensures `ChapterOutline.content` is always populated
   - OR changes step determination to account for chapters in the `Chapter` table
   - OR implements a more robust hydration mechanism

5. **Consider Architectural Changes:**
   - Should `step` be persisted to localStorage?
   - Should the server pass `step` explicitly instead of deriving it?
   - Should we use React's `useSyncExternalStore` instead of Zustand persist?

**Key Database Tables:**
- `Project` - has outline relation (one-to-one with ChapterOutline)
- `ChapterOutline` - stores the 5-chapter structure (JSON in `content` field)
- `Chapter` - stores actual generated chapter content (separate table!)

**Prisma Schema (relevant parts):**
```prisma
model Project {
  id          String   @id @default(cuid())
  topic       String
  abstract    String?
  isUnlocked  Boolean @default(false)
  outline     ChapterOutline?
  chapters    Chapter[]
  // ...
}

model ChapterOutline {
  id        String   @id @default(cuid())
  projectId String   @unique
  project   Project  @relation(fields: [projectId], references: [id])
  content   String   // JSON of the 5-chapter outline structure
}

model Chapter {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id])
  number    Int      // 1-5
  title     String
  content   String   @db.Text // The full generated markdown
}
```

**Begin your analysis now.**
