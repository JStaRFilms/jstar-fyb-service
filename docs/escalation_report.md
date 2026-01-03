# Escalation Handoff Report

**Generated:** 2026-01-03T06:48:30+01:00
**Original Issue:** Academic Copilot in V2 Workspace not using project-specific chat API

---

## PART 1: THE DAMAGE REPORT

### 1.1 Original Goal
Create an **Academic Copilot** chat component for the V2 workspace that uses the project-specific chat API (`/api/projects/[id]/chat`) instead of the generic Jay onboarding API (`/api/chat`).

The project-specific API has:
- Full project context (topic, twist, abstract, outline, chapters, research documents)
- A system prompt that knows the student's project and should NEVER ask "what is your topic?"
- Tools for searching uploaded research documents

### 1.2 Observed Failure / Error
Despite explicitly setting `api: /api/projects/${projectId}/chat` in the `useChat` hook configuration, ALL requests are being sent to `/api/chat` (Jay's generic endpoint).

**Terminal Logs (Evidence):**
```
[Chat API] Processing 1 messages. Last: "hi..."
 POST /api/chat 200 in 943ms (compile: 9ms, proxy.ts: 10ms, render: 924ms)
[Chat API] Processing 1 messages. Last: "hi..."
 POST /api/chat 200 in 1154ms (compile: 9ms, proxy.ts: 11ms, render: 1134ms)
```

**Expected:**
```
[Academic Copilot API] Processing 1 messages...
 POST /api/projects/cmjwqoq6w00018dzn84akps1p/chat 200 in XXXms
```

**UI Symptom:**
The Academic Copilot behaves identically to Jay - asks "What's your department/course?" and suggests new topics, even though the project already has a topic and 5 generated chapters.

### 1.3 Failed Approaches
1. **Set `api` prop explicitly**: `api: /api/projects/${projectId}/chat` - IGNORED
2. **Added unique `id` prop**: `id: academic-copilot-${projectId}` - IGNORED  
3. **Added debug logging**: Console shows correct URL, but network requests go elsewhere
4. **Added `body` prop with projectId**: Body is likely not even being sent to correct endpoint
5. **Verified projectId is not undefined**: Added guards and logging - projectId IS defined

### 1.4 Key Files Involved
- `src/features/builder/components/v2/AcademicCopilot.tsx` - The problematic component
- `src/app/api/projects/[id]/chat/route.ts` - The target API (never gets hit)
- `src/app/api/chat/route.ts` - Jay's API (always gets hit instead)
- `src/features/bot/hooks/useChatFlow.tsx` - Jay's chat hook (uses same `useChat` from SDK)

### 1.5 Best-Guess Diagnosis

**Hypothesis 1: SDK Default Fallback**
The `@ai-sdk/react` `useChat` hook may have a hardcoded default of `/api/chat` that is being used regardless of the `api` prop. This could be:
- A bug in the SDK version
- The `api` prop being overridden somewhere globally
- A caching/memoization issue where the hook was first initialized with no `api` prop

**Hypothesis 2: Shared Hook Instance**
React may be reusing a hook instance from Jay's `/chat` page that was previously mounted. The `id` prop should prevent this, but it's not working.

**Hypothesis 3: TypeScript "as any" Problem**
We use `as any` to bypass type mismatches. This might be stripping the `api` prop at runtime:
```typescript
const { ... } = useChat({ api: apiEndpoint, ... } as any) as any;
```

**Hypothesis 4: Proxy/Middleware Rewrite**
Next.js middleware or proxy configuration might be rewriting `/api/projects/*/chat` to `/api/chat`.

---

## PART 2: FULL FILE CONTENTS (Self-Contained)

### File: `src/features/builder/components/v2/AcademicCopilot.tsx`
```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import {
    BrainCircuit,
    Send,
    Sparkles,
    Search,
    FileText,
    AlertCircle,
    Loader2,
    Quote,
    ArrowRight,
    Terminal,
    ChevronDown,
    Layout
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AcademicCopilotProps {
    projectId: string;
    activeChapterId?: string;
    activeChapterNumber?: number;
}

export function AcademicCopilot({ projectId, activeChapterId, activeChapterNumber }: AcademicCopilotProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [localInput, setLocalInput] = useState('');

    // Debug: Log the API endpoint being used
    const apiEndpoint = projectId ? `/api/projects/${projectId}/chat` : '/api/chat';
    console.log('[AcademicCopilot] Using API endpoint:', apiEndpoint, 'projectId:', projectId);

    // Using 'as any' as a workaround for mismatched AI SDK types in this project environment
    // CRITICAL: The 'api' prop MUST be explicitly set to override the default '/api/chat'
    const { messages, sendMessage, status, error, setMessages } = useChat({
        api: apiEndpoint,
        id: projectId ? `academic-copilot-${projectId}` : 'academic-copilot-fallback',
        initialMessages: [],
        body: {
            projectId,
            chapterId: activeChapterId,
            chapterNumber: activeChapterNumber
        }
    } as any) as any;

    const isLoading = status === 'streaming' || status === 'submitted';

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // CRITICAL: Guard against undefined projectId AFTER all hooks
    if (!projectId) {
        console.error('[AcademicCopilot] projectId is undefined!');
        return (
            <div className="flex items-center justify-center h-full text-red-400 text-sm p-4">
                Error: Project ID is missing. Please refresh the page.
            </div>
        );
    }

    const quickActions = [
        { id: 'fact-check', icon: Search, label: 'Deep Fact Check', color: 'text-accent', prompt: 'Fact check the last paragraph I wrote using my research library.' },
        { id: 'suggest-edits', icon: Sparkles, label: 'Suggest Edits', color: 'text-primary', prompt: 'Based on my uploaded papers, suggest improvements for this section.' },
        { id: 'cite-source', icon: Quote, label: 'Find Citations', color: 'text-green-400', prompt: 'Find a direct quote from my library that supports the methodology used here.' },
        { id: 'draft-intro', icon: FileText, label: 'Draft Intro', color: 'text-yellow-400', prompt: 'Using the project abstract and research, draft an introduction for this chapter.' }
    ];

    const handleQuickAction = (prompt: string) => {
        setLocalInput(prompt);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!localInput.trim() || isLoading) return;

        const userMessage = localInput;
        setLocalInput('');

        try {
            // Use the correct message format expected by useChat
            await sendMessage({
                role: 'user',
                content: userMessage,
            });
        } catch (err) {
            console.error('[AcademicCopilot] Send failed:', err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-dark/20 overflow-hidden relative">
            {/* ... UI JSX truncated for brevity ... */}
        </div>
    );
}
```

### File: `src/app/api/projects/[id]/chat/route.ts`
```typescript
import { streamText, tool, stepCountIs, type CoreMessage } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { GeminiFileSearchService } from '@/lib/gemini-file-search';

export const maxDuration = 300;

// Validate environment variables
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
}

// Create Gemini provider using the AI SDK
const google = createGoogleGenerativeAI({
    apiKey: geminiApiKey,
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = await params;
    const body = await req.json();
    const { messages, conversationId } = body;

    // 1. Fetch Project with enhanced context
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            outline: true,
            chapters: {
                select: { number: true, title: true, status: true, version: true }
            },
            documents: {
                where: { status: 'PROCESSED' },
                select: {
                    id: true,
                    title: true,
                    author: true,
                    year: true,
                    summary: true,
                    documentType: true
                }
            },
            messages: {
                take: 20,
                orderBy: { createdAt: 'desc' },
                select: { role: true, content: true }
            }
        }
    });

    if (!project) {
        return new Response('Project not found', { status: 404 });
    }

    // ... context building code ...

    const systemPrompt = `You are the Academic Copilot for J Star FYB Service...
    - **Topic:** ${project.topic}
    - **NEVER ask what their topic is** - you already know it
    ...`;

    const result = streamText({
        model: google('gemini-2.5-flash'),
        system: systemPrompt,
        messages: coreMessages,
        stopWhen: stepCountIs(5),
        tools: {
            searchProjectDocuments: tool({ ... }),
            saveUserContext: tool({ ... })
        },
        onFinish: async ({ text }) => { ... },
    });

    return result.toUIMessageStreamResponse();
}
```

### File: `src/app/api/chat/route.ts` (Jay's API - the one being incorrectly hit)
```typescript
import { createGroq } from '@ai-sdk/groq';
import { streamText, stepCountIs } from 'ai';
import { SYSTEM_PROMPT } from '@/features/bot/prompts/system';
import { chatTools } from '@/features/bot/tools/definitions';

// ... Jay's system prompt asks for department and suggests topics ...

export async function POST(req: Request) {
    // No projectId - this is generic onboarding
    const { messages, anonymousId, conversationId, userId } = await req.json();
    
    console.log(`[Chat API] Processing ${messages.length} messages...`);
    
    // Uses GROQ + Llama, NOT Gemini
    const result = streamText({
        model: groq('llama-3.3-70b-versatile'),
        system: SYSTEM_PROMPT, // Jay's personality
        messages,
        tools: chatTools, // suggestTopics, etc.
    });

    return result.toDataStreamResponse();
}
```

---

## PART 3: DIRECTIVE FOR ORCHESTRATOR

**Attention: Senior AI Orchestrator**

You have received this Escalation Handoff Report. A local agent has failed to solve this problem.

**Your Directive:**

1. **Analyze the Failure:** Based on Part 1 (the report) and Part 2 (the code), diagnose the TRUE root cause. The `useChat` hook from `@ai-sdk/react` is ignoring the `api` prop despite it being explicitly set. Potential causes:
   - SDK bug or version incompatibility
   - The `as any` type assertions stripping props
   - A global provider or context overriding the config
   - Next.js middleware/proxy rewriting URLs

2. **Investigation Steps:**
   - Check the `@ai-sdk/react` version in `package.json`
   - Review the `useChat` source code or documentation for how `api` is handled
   - Check if there's a `ChatProvider` or similar context wrapping the app
   - Test with a minimal reproduction (hardcode URL without variables)

3. **Potential Fixes to Try:**
   - **Option A**: Use `fetch` prop with custom fetch function that explicitly hits the correct URL
   - **Option B**: Ditch `useChat` entirely and use raw `fetch` + state management
   - **Option C**: Check if there's a global `api` config being set in a provider
   - **Option D**: Update or pin the `@ai-sdk/react` version

4. **Execute or Hand Off:** Implement the fix yourself or generate a clear step-by-step prompt for a Builder agent.

**Begin your analysis now.**
