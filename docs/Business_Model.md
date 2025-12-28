# J-Star FYB: Business Model & Pricing Matrix

## Two Types of Students

| Type | What They Submit | Examples |
|------|------------------|----------|
| **Paper-Only** | Written Research Paper (Chapters 1-5) | Social Sciences, Arts, Education, Business Admin |
| **Software + Paper** | Written Paper + Working Software | Computer Science, Engineering, IT |

---

## Product Lines

### 1️⃣ The AI Builder (SaaS - Self-Service)

**For:** Budget-conscious students who want to DIY with AI assistance.

| Tier | Price | What They Get |
|------|-------|---------------|
| **Free Teaser** | ₦0 | Topic Selection + Abstract + Chapter Outline (preview) |
| **DIY Unlock** | ₦15,000 | Full Chapter 1-5 AI Generation + Formatting |
| *(For Software students only)* | +₦5,000 | Code Snippets + Database Schema |

**Total for Paper-Only:** ₦15,000  
**Total for Software:** ₦20,000

---

### 2️⃣ The Agency (Done-For-You - Humans Write It)

**For:** Students who want professionals to handle everything.

#### A) Paper-Only Students (Research Papers)

| Tier | Price | What They Get |
|------|-------|---------------|
| **Paper Express** | ₦60,000 | Chapters 1-5 Written by Humans |
| **Paper + Defense** | ₦80,000 | Above + Mock Defense Session |
| **Paper Premium** | ₦100,000 | Above + Presentation Slides + Priority Support |

#### B) Software + Paper Students (As shown on your landing page)

| Tier | Price | What They Get |
|------|-------|---------------|
| **The Code & Go** | ₦120,000 | Complete Source Code + DB Script + Install Guide |
| **Defense Ready** | ₦200,000 | Above + Chapters 3&4 + Mock Defense |
| **The Soft Life** | ₦320,000 | Above + Full Docs (Ch 1-5) + Slides + Priority |

> **Note:** Prices shown are for groups of 5. Per-person cost = Price ÷ Group Size.

---

## The Upsell Funnel

```
┌─────────────────────────────────────────────────────────────────┐
│                         STUDENT LANDS                            │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CHAT WITH AI CONSULTANT                       │
│         (Free - Qualifies Lead, Refines Topic)                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
              ┌─────────────────┴─────────────────┐
              │                                   │
              ▼                                   ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│      LOW BUDGET          │         │      HIGH BUDGET         │
│   "I want to DIY it"     │         │   "Do it for me"         │
└───────────┬─────────────┘         └───────────┬─────────────┘
            │                                   │
            ▼                                   ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│     AI BUILDER SAAS      │         │    AGENCY SERVICE        │
│      ₦15k - ₦20k         │         │    ₦60k - ₦320k          │
└───────────┬─────────────┘         └─────────────────────────┘
            │
            │ (Gets stuck writing code?)
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      UPSELL TO AGENCY                            │
│   "Stuck? Hire us for ₦120k (minus the ₦15k you already paid)"  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary Cheat Sheet

| Student Type | Just Want AI Help | Want Humans to Do It |
|--------------|-------------------|---------------------|
| **Paper-Only** | ₦15,000 (SaaS) | ₦60k - ₦100k (Agency) |
| **Software + Paper** | ₦20,000 (SaaS) | ₦120k - ₦320k (Agency) |

---

## Implementation Notes

### In the Code:
```typescript
// Pricing constants (move to DB later for admin control)
const PRICING = {
  saas: {
    paper_only: 15000,
    software: 20000,
  },
  agency_paper: {
    express: 60000,
    defense: 80000,
    premium: 100000,
  },
  agency_software: {
    basic: 120000,
    standard: 200000,
    premium: 320000,
  }
};
```

### On the Landing Page:
- Show **Software tiers** by default (your current pricing component)
- Add a toggle: "Building Software?" Yes/No
- If No → Show Paper-Only pricing

---

*Last Updated: December 2024*
