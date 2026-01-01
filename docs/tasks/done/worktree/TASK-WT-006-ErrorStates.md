# 🎯 TASK-WT-006: Error States & Boundaries

**Branch:** `feat/error-states-polish`  
**Est. Time:** 1.5 hours  
**Conflict Risk:** ✅ NONE

---

## Objective

Implement comprehensive error handling and user-friendly error states throughout the application.

---

## Files to CREATE

### 1. `src/components/ui/ErrorBoundary.tsx`
```tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // TODO: Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### 2. `src/components/ui/ErrorFallback.tsx`
```tsx
// User-friendly error display:
// - Friendly illustration/icon
// - Clear error message (not technical)
// - Recovery actions (Retry, Go Home, Contact Support)
// - Collapsible technical details for devs
```

### 3. `src/lib/errors.ts`
```typescript
// Custom error classes
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public userMessage: string
  ) {
    super(message);
  }
}

export class NetworkError extends Error {
  constructor(message = 'Unable to connect. Check your internet.') {
    super(message);
  }
}

export class PaymentError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

// Error message mapping
export const getUserFriendlyMessage = (error: Error): string => {
  if (error instanceof NetworkError) return error.message;
  if (error instanceof PaymentError) return 'Payment failed. Please try again.';
  if (error.message.includes('fetch')) return 'Connection lost. Please retry.';
  return 'Something went wrong. We\'ve been notified.';
};
```

### 4. `src/components/ui/OfflineIndicator.tsx`
```tsx
// Shows when user goes offline:
// - Fixed banner at top
// - "You're offline" message
// - Auto-hides when back online
```

### 5. `src/hooks/useNetworkStatus.ts`
```typescript
// Hook for online/offline detection:
// - Returns { isOnline, isOffline }
// - Triggers on navigator.onLine changes
```

---

## Files to MODIFY

### `src/app/layout.tsx`
Wrap app with ErrorBoundary:
```tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <OfflineIndicator />
      </body>
    </html>
  );
}
```

---

## Error States to Handle

| Error Type | Display | Recovery Options |
|------------|---------|------------------|
| Network Error | Toast + Retry button | Retry, Work Offline |
| API Error (4xx) | Inline error message | Fix input, Try again |
| API Error (5xx) | Full-page error | Retry, Contact support |
| Payment Error | Modal with details | Try different method |
| Auth Error | Redirect to login | Log in, Reset password |
| Generation Error | Inline with retry | Retry generation |

---

## DO NOT TOUCH

- ❌ Feature-specific components (builder, bot, admin, marketing)
- ❌ API routes (they have their own error handling)
- ❌ `prisma/schema.prisma`
- ❌ `globals.css`

---

## Acceptance Criteria

- [ ] App doesn't crash on unhandled errors
- [ ] User sees friendly error message, not stack trace
- [ ] Retry button works for transient errors
- [ ] Offline indicator shows when connection lost
- [ ] Error details available for developers (collapsed)
- [ ] Navigation still works after error

---

## Testing

```bash
# 1. Force an error in any component
# 2. Verify ErrorBoundary catches it
# 3. Verify friendly message displays
# 4. Click "Retry" - page should reload
# 5. Toggle network offline in DevTools
# 6. Verify offline indicator appears
```
