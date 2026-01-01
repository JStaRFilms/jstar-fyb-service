# App Stability & Error Handling

## Overview
This system provides comprehensive error handling, user-friendly feedback, and offline state detection to ensure a resilient user experience. It avoids "white screen" crashes and informs users when connectivity is lost.

## Architecture
- **Service/File:** `src/lib/errors.ts`
- **Hook:** `src/hooks/useNetworkStatus.ts`
- **UI Components:** `src/components/ui/ErrorBoundary.tsx`, `src/components/ui/ErrorFallback.tsx`, `src/components/ui/OfflineIndicator.tsx`
- **Toast Notifications:** `sonner` (via `Toaster` in layout)

## Key Components

### 1. Custom Error Classes (`src/lib/errors.ts`)
Standardized error types for different failure scenarios:
- `ApiError`: For failed API requests with status codes and user-friendly messages.
- `NetworkError`: Specifically for connectivity issues.
- `PaymentError`: For transaction-related failures.
- `getUserFriendlyMessage(error)`: A helper to translate tech errors into human-readable strings.

### 2. Error Boundary (`src/components/ui/ErrorBoundary.tsx`)
A global React Error Boundary that wraps the entire application in `layout.tsx`. It catches rendering errors and prevents the entire app from crashing.

### 3. Error Fallback UI (`src/components/ui/ErrorFallback.tsx`)
The visual interface shown when an error is caught.
- **Friendly Message:** Human-readable text.
- **Retry Action:** Button to reset the error state and attempt re-render.
- **Technical Details:** Collapsible section for developers to see the stack trace and error object.

### 4. Toast Notifications (`sonner`)
- **Library:** `sonner` (integrated via `Toaster` in `layout.tsx`).
- **Usage:** Replaces disruptive `alert()` calls for non-critical feedback.
- **Types:**
    - `toast.success("Message")`: Green checkmark.
    - `toast.error("Message")`: Red warning.
    - `toast("Message")`: Neutral info.

### 5. Offline Detection (`src/components/ui/OfflineIndicator.tsx`)
Uses the `useNetworkStatus` hook to detect when the browser goes offline.
- **Auto-Banner:** An orange banner appears at the top of the screen after a 2-second delay if the user is offline.
- **Real-time Updates:** Disappears instantly when the connection is restored.

## Integration
In `src/app/layout.tsx`:
```tsx
<Toaster position="top-center" richColors />
<ErrorBoundary>
  {children}
</ErrorBoundary>
<OfflineIndicator />
```

## Data Flow
```mermaid
flowchart TD
    App[App Runtime] -->|Uncaught Error| EB[Error Boundary]
    EB -->|Renders| EF[Error Fallback UI]
    EF -->|Click Retry| EB
    
    App -->|Action Success| Toast[Sonner Toast]
    App -->|Action Fail| Toast
    
    Hook[useNetworkStatus] -->|State Change| OI[Offline Indicator]
    OI -->|Render| UI[User Interface Banner]
```

## Changelog
### 2025-12-29: Initial Implementation
- Created global Error Boundary and Fallback UI.
- Implemented Offline Indicator with 2s debounce.
- Created custom error hierarchy in `src/lib/errors.ts`.

### 2025-12-31: Refined Error Components
- Enhanced `OfflineIndicator` styling and responsiveness.
- Improved error messaging in `ErrorFallback.tsx`.
- Integrated `sonner` for toast notifications.
- Replaced legacy `alert()` calls with toasts in Builder and Admin.
