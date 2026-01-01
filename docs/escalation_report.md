# Escalation Handoff Report

**Generated:** 2025-12-31T22:34 (WAT)
**Original Issue:** Chat Persistence Bug - Messages disappear after page refresh

---

## PART 1: THE DAMAGE REPORT

### 1.1 Original Goal
Fix the chat history persistence bug where chat messages are saved to the database but disappear when the user refreshes the page. The chat should load previous messages from the database on page load.

### 1.2 Observed Failure / Error
**Behavior:** 
- Messages ARE being saved to the database (confirmed via Prisma Studio - 21+ conversations exist with messages)
- Messages DO NOT appear after page refresh
- Console shows `[useChatFlow] Loaded 2 messages from DB` but UI shows nothing

**Critical Finding - ID Mismatch:**
- Frontend localStorage has UUID: `980a59f4-7ff2-48b8-9d08-705061afbae9`
- Database conversations have SHORT ALPHANUMERIC IDs: `hkBJNpKZ3HjRzvKQ`, `2qFJg9Ck6AHrBP3p`
- ALL 21+ conversations in DB have `userId: null` (even when user is logged in)
- The `anonymousId` injected in the custom fetch is NOT reaching the API - it falls back to the AI SDK's internal `id`

**Confirmed via Prisma Studio:**
- 21 conversations exist with messages
- All have `anonymousId` in short alphanumeric format (from SDK's internal ID)
- None have the UUID format from localStorage

### 1.3 Failed Approach
Multiple attempts were made:

1. **Modified `getLatestConversation`** - Added fallback lookup by `anonymousId` when `userId` lookup fails. Didn't work because the IDs don't match.

2. **Changed `anonymousId` initialization** - Tried lazy `useState` initialization to read from localStorage synchronously. Still failed.

3. **Direct localStorage read in fetch** - Modified the custom fetch function to read `anonymousId` directly from localStorage instead of using refs. Still failed.

4. **Used Vercel AI SDK patterns** - Tried using `initialMessages` prop and `id` prop on `useChat`. Messages load to state but don't render.

**Root Cause Analysis:**
The issue is in how the `useChat` hook's custom fetch works. The `anonymousId` is being injected into the request body:
```typescript
body.anonymousId = anonymousIdRef.current; // or localStorage.getItem(...)
```

But by the time the request reaches the API, the `anonymousId` is either empty or not present, causing the fallback:
```typescript
const effectiveAnonymousId = anonymousId || id || `sdk-${Date.now()}`;
```
This uses the SDK's internal `id` instead of our localStorage UUID.

### 1.4 Key Files Involved
- `src/features/bot/hooks/useChatFlow.tsx` - The chat hook that manages state and calls useChat
- `src/features/bot/actions/chat.ts` - Server actions for saving/retrieving conversations
- `src/app/api/chat/route.ts` - API route that saves conversations in onFinish callback

### 1.5 Best-Guess Diagnosis
1. **Vercel AI SDK's `useChat` may not properly support custom body injection** - The custom fetch function modifies the body, but the SDK might be overwriting or ignoring it.

2. **The SDK's internal `id` is used for chat identification** - The AI SDK generates its own short alphanumeric ID for each chat session, and this is what ends up in the request.

3. **Hydration issues** - React hydration errors were observed which could affect client-side state initialization.

4. **Timing issue with refs** - The `anonymousIdRef.current` might still be empty when the first request is made, before the useEffect runs.

**Recommended Solution:**
Use the AI SDK's built-in mechanisms properly:
1. Pass `id` prop to `useChat` with our localStorage UUID
2. Use `body` configuration option in `useChat` instead of custom fetch
3. Or: Stop using custom fetch and pass anonymousId as a header instead

---

## PART 2: FULL FILE CONTENTS (Self-Contained)

### File: `src/features/bot/hooks/useChatFlow.tsx`
```typescript
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { saveLeadAction } from "../actions/chat";

export interface Message {
    id: string;
    role: "ai" | "user";
    content: React.ReactNode;
    toolInvocations?: any[];
    timestamp: string;
}

export type ChatState = "INITIAL" | "ANALYZING" | "PROPOSAL" | "NEGOTIATION" | "CLOSING" | "COMPLETED";

export interface ConfirmedTopic {
    topic: string;
    twist: string;
}

export function useChatFlow(userId?: string) {
    const router = useRouter();
    const [state, setState] = useState<ChatState>("INITIAL");
    const [complexity, setComplexity] = useState<1 | 2 | 3 | 4 | 5>(1);
    const [conversationId, setConversationId] = useState<string | undefined>();
    const [anonymousId, setAnonymousId] = useState<string>("");
    const [confirmedTopic, setConfirmedTopic] = useState<ConfirmedTopic | null>(null);
    const [hasProvidedPhone, setHasProvidedPhone] = useState(false);

    // Use refs to access current values in fetch without stale closures
    const conversationIdRef = useRef(conversationId);
    const anonymousIdRef = useRef(anonymousId);

    // Initialize anonymousId immediately if possible (client-side only)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            let id = localStorage.getItem("jstar_anonymous_id");
            if (!id) {
                id = crypto.randomUUID();
                localStorage.setItem("jstar_anonymous_id", id);
            }
            setAnonymousId(id);
            anonymousIdRef.current = id; // Update ref immediately
        }
    }, []);

    // Keep refs in sync with state
    useEffect(() => {
        conversationIdRef.current = conversationId;
    }, [conversationId]);

    useEffect(() => {
        anonymousIdRef.current = anonymousId;
    }, [anonymousId]);

    // Standard AI SDK useChat with custom fetch to inject headers dynamically
    const {
        messages: aiMessages,
        sendMessage,
        status,
        error,
        regenerate,
        setMessages
    } = useChat({
        // Use custom fetch to dynamically inject anonymousId/conversationId at request-time
        fetch: async (url: RequestInfo | URL, options?: RequestInit) => {
            const body = JSON.parse(options?.body as string || '{}');

            // Inject current values from refs (not stale closure values)
            body.anonymousId = anonymousIdRef.current;
            body.conversationId = conversationIdRef.current;

            return fetch(url, {
                ...options,
                body: JSON.stringify(body),
            });
        },
    } as any) as any;

    // Sync initial messages if we found a conversation
    const hasSyncedHistory = useRef(false);
    useEffect(() => {
        if (!hasSyncedHistory.current && anonymousId && anonymousId !== "") {
            const syncHistory = async () => {
                const { getLatestConversation } = await import("../actions/chat");
                const latest = await getLatestConversation({ anonymousId, userId });
                if (latest && latest.messages.length > 0) {
                    setConversationId(latest.id);
                    setMessages(latest.messages.map((m: any) => ({
                        id: m.id,
                        role: m.role as any,
                        content: m.content as string,
                        parts: [{ type: 'text' as const, text: m.content as string }],
                        createdAt: new Date(m.createdAt)
                    })));
                }
                hasSyncedHistory.current = true;
            };
            syncHistory();
        }
    }, [anonymousId, userId, setMessages]);

    const isLoading = status === 'streaming' || status === 'submitted';

    // Transform AI SDK messages to our UI format
    const messages: Message[] = aiMessages
        .map((m: any) => {
            let textContent = '';
            if (m.parts) {
                const textPart = m.parts.find((p: any) => p.type === 'text');
                textContent = textPart?.text || '';
            } else if (typeof m.content === 'string') {
                textContent = m.content;
            }

            const toolParts = m.parts?.filter((p: any) =>
                p.type === 'tool-invocation' ||
                p.type === 'tool-result' ||
                p.type?.startsWith('tool-')
            );

            return {
                id: m.id,
                role: (m.role === 'user' ? 'user' : 'ai') as 'user' | 'ai',
                content: textContent,
                toolInvocations: toolParts,
                timestamp: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
            };
        })
        .filter((m: any) => m.content && (typeof m.content === 'string' ? m.content.trim() : true));

    // ... rest of file (tool watching, phone detection, handlers) ...
    // [TRUNCATED FOR BREVITY - see full file in codebase]

    return {
        messages,
        state,
        complexity,
        isLoading,
        confirmedTopic,
        hasProvidedPhone,
        error,
        regenerate,
        handleUserMessage,
        handleAction,
        handleSelectTopic,
        proceedToBuilder
    };
}
```

### File: `src/features/bot/actions/chat.ts` (Key Functions)
```typescript
'use server';

import { prisma } from '@/lib/prisma';
import { CoreMessage } from 'ai';
import { z } from 'zod';

// ... validation schemas ...

export async function saveConversation({
    conversationId,
    anonymousId,
    userId,
    messages,
}: SaveConversationParams) {
    // ... validation ...

    // Find or Create Conversation
    let conversation;
    if (conversationId) {
        conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
        });
    }

    if (!conversation) {
        const firstMessageContent = serializeMessageContent(messages[0]?.content || '');
        conversation = await prisma.conversation.create({
            data: {
                anonymousId,  // <-- This receives the SDK's id, not our UUID
                userId,
                title: firstMessageContent.slice(0, 50) || 'New Chat',
            },
        });
    }

    // Sync messages via transaction
    await prisma.$transaction([
        prisma.message.deleteMany({ where: { conversationId: conversation.id } }),
        prisma.message.createMany({ data: messagesToCreate }),
    ]);

    return { success: true, conversationId: conversation.id };
}

export async function getLatestConversation({
    anonymousId,
    userId
}: { anonymousId?: string; userId?: string; }) {
    if (!anonymousId && !userId) return null;

    // If userId is provided, only return that user's conversations
    if (userId) {
        return await prisma.conversation.findFirst({
            where: { userId: userId },
            include: { messages: { orderBy: { createdAt: 'asc' } } },
            orderBy: { updatedAt: 'desc' }
        });
    }

    // Anonymous session - find by anonymousId with userId: null
    if (anonymousId) {
        return await prisma.conversation.findFirst({
            where: {
                anonymousId: anonymousId,
                userId: null  // <-- This is correct for security
            },
            include: { messages: { orderBy: { createdAt: 'asc' } } },
            orderBy: { updatedAt: 'desc' }
        });
    }

    return null;
}
```

### File: `src/app/api/chat/route.ts` (Key Section)
```typescript
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validation = chatSchema.safeParse(body);
        // ...

        const { messages, conversationId, anonymousId, id } = validation.data;

        // Fallback for identification - THIS IS WHERE THE PROBLEM HAPPENS
        // If anonymousId is empty/undefined, it falls back to SDK's `id`
        const effectiveAnonymousId = anonymousId || id || `sdk-${Date.now()}`;

        // ... process messages ...

        const result = await streamTextWithRetry({
            model: groq('moonshotai/kimi-k2-instruct-0905'),
            // ...
            onFinish: async ({ text, toolCalls }) => {
                // Save with effectiveAnonymousId (which is SDK's id, not our UUID)
                if (text) {
                    await saveConversation({
                        conversationId,
                        anonymousId: effectiveAnonymousId,  // <-- Wrong ID gets saved
                        messages: [
                            ...modelMessages,
                            { role: 'assistant', content: text }
                        ]
                    });
                }
            },
        });

        return result.toUIMessageStreamResponse();
    } catch (error: any) {
        // ...
    }
}
```

---

## PART 3: DIRECTIVE FOR ORCHESTRATOR

**Attention: Senior AI Orchestrator**

You have received this Escalation Handoff Report. A local agent has failed to solve this problem after multiple attempts.

**Your Directive:**

1. **Analyze the Failure:** The core issue is an ID mismatch between:
   - The localStorage UUID (`jstar_anonymous_id`) used by the frontend
   - The short alphanumeric ID generated by Vercel AI SDK's internal chat ID system
   
   The custom fetch in `useChat` attempts to inject `anonymousId` but it either:
   - Isn't being included in the actual request body
   - Is being overwritten by the SDK
   - Is empty at request time due to React timing/hydration issues

2. **Formulate a New Plan:** Consider these approaches:
   
   **Approach A: Use AI SDK's `body` config properly**
   ```typescript
   useChat({
       id: anonymousIdFromLocalStorage, // Use our UUID as the chat ID
       body: {
           anonymousId: anonymousIdFromLocalStorage,
           conversationId: conversationIdRef.current,
       },
   });
   ```
   
   **Approach B: Use headers instead of body**
   ```typescript
   useChat({
       headers: {
           'x-anonymous-id': anonymousIdFromLocalStorage,
       },
   });
   ```
   Then read from headers in the API route.
   
   **Approach C: Simplify - Don't rely on AI SDK's ID**
   - Generate the conversation ID on the frontend
   - Pass it as the `id` prop to useChat
   - Use this same ID for database lookups

3. **Key Considerations:**
   - Ensure the `anonymousId` is available BEFORE any useChat request fires
   - Consider using `useMemo` or lazy initialization that runs synchronously
   - The hydration error might be masking other issues - investigate this
   - Review the Vercel AI SDK documentation for proper `body` or `id` prop usage

4. **Verification:**
   - After fix, send a message via chat
   - Check Prisma Studio to verify the conversation is saved with the UUID format
   - Refresh the page
   - Verify messages appear in the UI

**Begin your analysis now.**
