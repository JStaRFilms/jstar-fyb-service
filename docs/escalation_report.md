# Escalation Handoff Report - RESOLVED ✅

**Generated:** 2025-12-28T02:55:00+01:00  
**Resolved:** 2025-12-28T03:10:00+01:00  
**Original Issue:** Recurring `ZodError` in `saveConversation` - "Either conversationId or at least one of anonymousId/userId must be provided"

---

## RESOLUTION SUMMARY

### Root Cause
The `useChat` hook from `@ai-sdk/react` captures the `body` object at initialization. On SSR (Server-Side Rendering), `localStorage` is not available, so `anonymousId` was initialized as `""`. This empty string got "baked in" to the `body` and was not reactive to state changes.

### Fix Applied

**File: `src/features/bot/hooks/useChatFlow.tsx`**

1. **Moved `localStorage` access to `useEffect`** - Instead of initializing `anonymousId` in `useState` (which runs during SSR), we now initialize it as `""` and populate it client-side only via `useEffect`.

2. **Used Refs for Current Values** - Created `anonymousIdRef` and `conversationIdRef` refs that stay in sync with state. This avoids stale closure issues.

3. **Custom `fetch` Wrapper** - Replaced the static `body` option with a custom `fetch` function that dynamically injects `anonymousId` and `conversationId` at request-time:

```tsx
useChat({
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
})
```

**File: `src/app/api/chat/route.ts`**

4. **Defensive `onFinish` Check** - Added early exit if no valid identifier is present, with debug logging:

```typescript
onFinish: async ({ text }) => {
    console.log('[Chat API] onFinish - conversationId:', conversationId, 'anonymousId:', anonymousId);

    const hasValidId = (anonymousId && anonymousId.trim() !== "") || conversationId;
    if (!hasValidId) {
        console.warn('[Chat API] Skipping save: No valid anonymousId or conversationId');
        return;
    }
    // ... save logic with try-catch
}
```

---

## Files Modified

| File | Change |
|------|--------|
| `src/features/bot/hooks/useChatFlow.tsx` | Custom `fetch` wrapper with refs for dynamic body injection |
| `src/app/api/chat/route.ts` | Defensive checks + debug logging in `onFinish` |

---

## Verification Steps

1. Start the dev server: `pnpm dev`
2. Open browser DevTools → Network tab
3. Send a chat message
4. Verify the POST request body contains a valid `anonymousId` UUID
5. Check server console for: `[Chat API] onFinish - conversationId: ... anonymousId: <valid-uuid>`
6. Confirm no more ZodError in logs

---

## Key Learnings

1. **SSR Hydration Pitfall**: Never access `localStorage` in `useState` initializers for Next.js apps. Always use `useEffect` for client-only initialization.

2. **useChat Body is Static**: The `body` option in `@ai-sdk/react`'s `useChat` is captured at hook initialization. Use the `fetch` option for dynamic values.

3. **Refs for Closures**: When you need current state values inside callbacks/closures (like `fetch`), use refs to avoid stale closure issues.
