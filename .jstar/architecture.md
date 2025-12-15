# Project Architecture Overview

## Project Overview

**Goal:** Build a comprehensive platform for final year students comprising:

1. **Agency Landing Page:** To sell high-ticket "Done-For-You" development services (₦120k - ₦320k).
   
2. **AI Sales Consultant:** A lead-gen chatbot that vets ideas and closes sales.
   
3. **Project Builder SaaS:** A DIY tool (₦15k - ₦20k) for students to generate abstracts, outlines, and code snippets.

**Repo Visibility:** Private (Proprietary Business Logic).

## Architecture & Routing Strategy

Framework: Next.js 14+ (App Router).

Styling: Tailwind CSS + Framer Motion (for the "Sexy" vibe).

Database: Postgres (via Supabase or Neon) OR Firebase (if you prefer NoSQL).

Payments: Paystack or Flutterwave.

### Routing Structure

Using Next.js Route Groups to separate the logical "Apps" while keeping them in one repo.

```
app/
├── (marketing)          // APP 1: Agency Landing Page
│   └── project/         // Base URL: [jstar.com/project](https://jstar.com/project)
│       ├── page.tsx     // The Pricing/Landing Page
│       ├── portfolio/   // Past projects gallery
│       └── layout.tsx   // Specific marketing layout
│
├── (bot)                // APP 2: AI Consultant
│   └── project/chat/    // Base URL: [jstar.com/project/chat](https://jstar.com/project/chat)
│       └── page.tsx     // The Full-screen Chat Interface
│
├── (saas)               // APP 3: Project Builder Tool (Protected)
│   └── project/builder/ // Base URL: [jstar.com/project/builder](https://jstar.com/project/builder)
│       ├── dashboard/   // User's project dashboard
│       ├── workflow/    // The "Wizard" (Step 1, Step 2...)
│       └── layout.tsx   // SaaS layout (Sidebar, User Auth)
│
└── api/                 // Backend Endpoints
```

## App Breakdown

### App 1: The Landing Page (Marketing)
- Hero Section with countdown
- Pricing Calculator
- Project Gallery
- Sticky CTA

### App 2: The AI Sales Consultant
- Chat interface for idea refinement
- Lead capture with WhatsApp number

### App 3: The Project Builder SaaS
- Wizard workflow for topic selection, abstract gen, chapter outlines
- Paywall after step 3

## Database Schema

**Users Table:**
- id (UUID)
- email
- phone (WhatsApp)
- role (student | admin)

**Projects Table (SaaS):**
- id
- user_id
- topic
- current_step
- generated_data (JSON)

**Leads Table (From Bot):**
- id
- phone
- interest_level
- proposed_topic

## API Endpoints

- `/api/chat/message` - Handle chatbot messages
- `/api/chat/capture-lead` - Save leads
- `/api/builder/generate-topic` - Generate topics
- `/api/builder/generate-chapter` - Generate chapters (paid only)
- `/api/payment/initialize` - Start payments
- `/api/payment/webhook` - Handle payment confirmations