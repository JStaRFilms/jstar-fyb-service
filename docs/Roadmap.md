# Roadmap: J Star FYB Service

## MUS (Minimum Usable State)

### Issue #1: Agency Landing Page Foundation
**Labels:** `MUS`, `enhancement`, `marketing`
**User Story:** As a visitor, I want to see a high-end landing page so I trust the agency.
**Tasks:**
- [ ] Setup Next.js + Tailwind + Framer Motion
- [ ] Implement Hero Section with "Christmas Sale" Countdown
- [ ] Implement Pricing Calculator Component
- [ ] Implement Project Gallery Grid

### Issue #2: AI Sales Consultant (Chat Interface)
**Labels:** `MUS`, `enhancement`, `bot`
**User Story:** As a student, I want to chat with an AI to refine my project idea.
**Tasks:**
- [ ] Create `/project/chat` route and UI
- [ ] Integrate Vercel AI SDK / OpenAI / Gemini
- [ ] Implement System Prompt ("Salesperson Persona")
- [ ] Build "Lead Capture" flow (Phone number extraction)

### Issue #3: SaaS Wizard (Step 1-3)
**Labels:** `MUS`, `enhancement`, `saas`
**User Story:** As a DIY user, I want to generate my abstract and outline.
**Tasks:**
- [ ] Create `/project/builder` layout (Sidebar + Auth)
- [ ] Implement Zustand Store for Project State
- [ ] Build Step 1: Topic Selection Component
- [ ] Build Step 2: Abstract Generation Component
- [ ] Build Step 3: Outline Generation Component
- [ ] Implement Paywall Blur Logic after Step 3

## Future Scope

### Issue #4: Payments Integration
**Labels:** `future-scope`, `backend`
- Integrate Paystack/Flutterwave
- Implement Webhook handler
- Unblur logic

### Issue #5: Upsell Bridge
**Labels:** `future-scope`, `marketing`
- Add "Hire Us" buttons in SaaS flow
