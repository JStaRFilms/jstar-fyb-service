# FR-009: Authentication System

## Goal
Secure the application and manage user accounts using WorkOS AuthKit. Provide a seamless login/signup experience for SaaS users and Agency clients.

## Status: ✅ Completed

---

## Component Breakdown

### Server Actions (`src/features/auth/actions.ts`)
| Action | Purpose |
|--------|---------|
| `signInAction` | Redirects user to WorkOS Sign In |
| `signUpAction` | Redirects user to WorkOS Sign Up |
| `signOutAction` | Clears session and redirects to Home |

### Routes
| Route | Purpose |
|-------|---------|
| `/auth/login` | Server component that triggers `signInAction` |
| `/auth/register` | Server component that triggers `signUpAction` |
| `/callback` | WorkOS redirect destination (handles session creation) |

> [!NOTE]
> **Instant Redirects:** The `/auth/login` and `/auth/register` routes are "headless" (return `null`). They execute the redirect on the server before the browser renders anything, ensuring a snappy transition to WorkOS.

---

## Technical Flow

### 1. Unified Access Control
Middleware (`middleware.ts`) protects all routes except:
- `/` (Home)
- `/api/chat`
- `/api/webhook`
- `/error`

### 2. Sign Up Flow
1. User clicks "Get Started" or "Launch Builder".
2. Navigates to `/auth/register`.
3. Page calls `signUpAction()` -> Redirects to WorkOS Hosted UI.
4. User completes signup.
5. WorkOS redirects back to `/callback`.
6. Session is established; user is redirected to the original destination.

---

## Multi-App WorkOS Strategy

Since the user maintains multiple "J Star" projects, here is the recommended configuration:

> [!TIP]
> **Use a Separate WorkOS Project**
> Create a new "Project" in your WorkOS Dashboard specifically for the FYB Service. 
> 
> **Why?**
> 1. **Isolated Redirect URIs:** Avoid collision between `jstar.com/callback` and `fyb.jstar.com/callback`.
> 2. **Custom Branding:** You can set the logo and brand name specifically to "J Star FYB Service" for the Hosted UI.
> 3. **Modular API Keys:** Rotate or change keys for this app without breaking your main site.

If you eventually want unified SSO (one login for all J Star sites), you would move to a single project with multiple redirect targets, but for now, **separate projects** is the "VibeCode" way for speed and modularity.

---

## Implementation Checklist
- [x] Create `/auth/login/page.tsx`
- [x] Create `/auth/register/page.tsx`
- [x] Create `/callback/page.tsx` (Handled by AuthKit middleware/default)
- [x] Verify `WORKOS_REDIRECT_URI` in `.env.local`
- [x] Update Navbar/Hero links to use these routes
