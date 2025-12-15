# J Star Projects: Technical Master Plan & Architecture

## 1. Project Overview

**Goal:** Build a comprehensive platform for final year students comprising:

1. **Agency Landing Page:** To sell high-ticket "Done-For-You" development services (₦120k - ₦320k).
    
2. **AI Sales Consultant:** A lead-gen chatbot that vets ideas and closes sales.
    
3. **Project Builder SaaS:** A DIY tool (₦15k - ₦20k) for students to generate abstracts, outlines, and code snippets.
    

**Repo Visibility:** Private (Proprietary Business Logic).

## 2. Architecture & Routing Strategy

Framework: Next.js 14+ (App Router).

Styling: Tailwind CSS + Framer Motion (for the "Sexy" vibe).

Database: Postgres (via Supabase or Neon) OR Firebase (if you prefer NoSQL).

Payments: Paystack or Flutterwave.

### Routing Structure

Since you want this linked to `/project`, we will use Next.js Route Groups to separate the logical "Apps" while keeping them in one repo.

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

**Can you link it to `/project`?**

- **Yes.** If this is a new repo, you can deploy it to a subdomain (e.g., `projects.jstar.com`) or use Vercel Rewrites on your main domain to point `/project` to this deployment.
    
- **Recommendation:** Build it as `app/project/...` inside this repo so the paths are native.
    

## 3. App 1: The Landing Page (Marketing)

**Core Function:** Conversion. Convince the user to either "Chat with AI" or "Buy Now".

### Key Components

1. **Hero Section:** High-energy copy, "Christmas Sale" countdown timer (FOMO trigger).
    
2. **Pricing Calculator:** The Component you already have (Slider for group size).
    
3. **Project Gallery:** Cards showing "E-commerce", "Biometric Attendance", "AI Chatbot" with "Sold Out" or "Available" tags.
    
4. **Sticky CTA:** "Not sure? Ask our AI for free."
    

### Business Logic

- **Discount Logic:** If `currentDate < Dec 31`, apply `isChristmasSale` flag to strikethrough old prices.
    
- **Group Pricing:** Dynamic JS calculation (displayed price = base_price / group_size).
    

## 4. App 2: The AI Sales Consultant (The Lead Magnet)

**Core Function:** Lead Qualification & Sales Psychology.

### The Flow

1. **User Input:** "I want to build a library app."
    
2. **Bot Response:** "Library apps are common. To get an 'A', we need to add a twist. How about a 'Library App with RFID tracking'? I can generate the abstract for that." (Value Add).
    
3. **The Hook:** After 3 turns, Bot says: "This looks solid. To build this with the RFID module, you need our **Standard Tier**. Want me to get a human dev to quote you?"
    
4. **Data Capture:** "Great, what's your WhatsApp number so the Lead Dev can message you?" -> **Save to DB**.
    

### System Prompt Strategy (The "Salesperson Persona")

- **Role:** Senior Project Supervisor & Sales Associate.
    
- **Tone:** Encouraging, Academic but Street-smart.
    
- **Guardrails:**
    
    - NEVER write the full code for free in the chat.
        
    - ALWAYS steer the conversation towards "Feasibility" and "Complexity" (which justifies hiring a pro).
        
    - If asked for price, quote the range and direct to the Pricing Section.
        

## 5. App 3: The Project Builder SaaS (The Gold Mine)

**Core Function:** Self-service tool for lower-budget students.

### Features

1. **The "Wizard" Workflow:**
    
    - **Step 1: Topic Selection:** User inputs keywords -> AI generates 3 Defense-ready topics.
        
    - **Step 2: Abstract Gen:** User picks topic -> AI writes Abstract.
        
    - **Step 3: Chapter 1 Outline:** Generates Intro, Problem Statement, Objectives.
        
2. **Paywall:** After Step 3, blur the rest. "Unlock Full Chapter 1-3 Generation + Code Snippets for ₦15,000".
    

### Tech Specs

- **State Management:** Use `Zustand` or React Context to hold the "Project State" as they move through steps.
    
- **AI Integration:** Heavy use of LLM (Gemini/OpenAI) with structured JSON output to fill the UI templates.
    

## 6. API Endpoints Design (Backend)

We need robust endpoints to handle the logic.

### For the Chatbot

- `POST /api/chat/message`:
    
    - **Input:** `{ message, conversationHistory, context }`
        
    - **Logic:** Calls LLM with "Sales System Prompt".
        
    - **Output:** `{ text, suggestion_chips, is_sales_pitch: boolean }`
        
- `POST /api/chat/capture-lead`:
    
    - **Input:** `{ phone, name, project_topic_summary }`
        
    - **Action:** Save to DB, Send Notification to John Sax (Telegram/Discord Webhook).
        

### For the SaaS Builder

- `POST /api/builder/generate-topic`:
    
    - **Input:** `{ department, interests }`
        
    - **Output:** List of 3 topics.
        
- `POST /api/builder/generate-chapter`:
    
    - **Input:** `{ topic, chapter_number }`
        
    - **Check:** `if (!user.hasPaid) return 402 Payment Required`
        
    - **Action:** Generate lengthy academic content.
        

### For Payments

- `POST /api/payment/initialize`:
    
    - **Input:** `{ email, amount, plan_type (saas | agency_deposit) }`
        
    - **Action:** Call Paystack API -> Return Checkout URL.
        
- `POST /api/payment/webhook`:
    
    - **Action:** Verify transaction -> Update User DB (`hasPaid = true`) -> Send Receipt Email.
        

## 7. Database Schema (Quick Draft)

**Table: Users**

- `id` (UUID)
    
- `email`
    
- `phone` (WhatsApp)
    
- `role` (student | admin)
    

**Table: Projects (SaaS)**

- `id`
    
- `user_id`
    
- `topic`
    
- `current_step` (e.g., 'chapter_2')
    
- `generated_data` (JSON)
    

**Table: Leads (From Bot)**

- `id`
    
- `phone`
    
- `interest_level` (Warm | Hot)
    
- `proposed_topic`
    

## 8. Missing "Business Logic" to Consider

1. **The "Upsell" Bridge:**
    
    - Inside App 3 (SaaS), if they get stuck on "Implementation", have a prominent button: **"Stuck? Hire us to finish the code for ₦120k (minus the 15k you already paid)."**
        
    - This converts SaaS users into Agency clients.
        
2. **Notification System:**
    
    - You need to know _immediately_ when a "Hot Lead" drops their number in the bot. Connect the `/api/chat/capture-lead` endpoint to a Discord or Telegram webhook so you get a ping on your phone instantly.
        
3. **Session Persistence:**
    
    - The Chatbot should save conversation to `localStorage` or DB so if they refresh, they don't lose the brainstorming context.