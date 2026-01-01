# FR-009: Authentication System

## Goal
Secure the application and manage user accounts using **Better-Auth** with Prisma. Provide a seamless login/signup experience for SaaS users and Agency clients.

## Status: ✅ Completed

---

## Component Breakdown

### Library (`src/lib/auth-client.ts`, `src/lib/auth.ts`)
- **Library:** `better-auth`
- **Adapter:** Prisma Adapter
- **Providers:** Email/Password, Google

### Routes
| Route | Purpose |
|-------|---------|
| `/auth/login` | Client component using `signIn.email` / `signIn.social` |
| `/auth/register` | Client component using `signUp.email` / `signIn.social` |
| `/profile` | User profile management and Sign Out |

---

## Technical Flow

### 1. Unified Access Control
Middleware (`middleware.ts`) protects all routes except static assets and public API routes.
- **Header Injection:** Middleware injects `x-current-path` header to allow Server Components to know the current URL.
- **Admin Auth:** Basic Auth for `/admin` routes.

### 2. Redirect Logic
- **Layouts:** `ProjectLayout` and `DashboardLayout` check for authentication.
- **Unauthenticated:** Redirects to `/auth/login?callbackUrl=...` using the `x-current-path` header.
- **Authenticated:** Users are redirected back to their original destination after login.

### 3. Sign Up Flow
1. User clicks "Get Started" (redirects to `/dashboard` if already logged in).
2. Navigates to `/auth/register`.
3. Completes signup or social login.
4. Session is established via cookies.
5. User is redirected to `/dashboard` or the `callbackUrl`.

---

## Implementation Checklist
- [x] Configure Better-Auth with Prisma
- [x] Create `/auth/login/page.tsx`
- [x] Create `/auth/register/page.tsx`
- [x] Create `/profile/page.tsx`
- [x] Implement Middleware for Admin Auth and Path Injection
- [x] Update Navbar/Hero links to use conditional forwarding
