# 🎯 Task: Admin Sales Automation

**Objective:** Add "Send Payment Link" functionality to Admin dashboard and real-time notifications when new leads arrive.
**Priority:** High (Revenue-critical)
**Scope:** Admin dashboard enhancements, notification system, payment link generation.

---

## 🧠 The Vision

Turn the Admin Dashboard into a **Sales Command Center**:
1. Get pinged instantly when a hot lead drops their WhatsApp
2. View lead/project details in the dashboard
3. One-click generate and send payment links (no manual Paystack work)
4. Track who paid, who didn't

---

## 📋 Requirements

### Functional Requirements
- **[REQ-001]** Notification ping when new Lead is captured (Discord/Telegram)
- **[REQ-002]** "Send Payment Link" button on Admin Project Detail page
- **[REQ-003]** Dropdown to select tier (Paper Express, Defense Ready, etc.)
- **[REQ-004]** Generated Paystack link copied to clipboard or sent via WhatsApp API
- **[REQ-005]** Track which payment links were generated (audit log)
- **[REQ-006]** Bot reads `?tier=` and `?price=` from URL and pre-fills context + stores in Lead

### Technical Requirements
- **[TECH-001]** Use Discord Webhook OR Telegram Bot API for notifications
- **[TECH-002]** Reuse existing PaystackService for link generation
- **[TECH-003]** Store generated Payment records with status "PENDING_MANUAL"
- **[TECH-004]** Admin-only API routes (check session role)

---

## 🏗️ Implementation Plan

### Phase 1: Notification System
- [ ] Choose platform: Discord (easier) or Telegram (you already use it)
- [ ] Create `/src/services/notification.service.ts`
- [ ] Implement `sendLeadNotification(lead)` function
- [ ] Call notification in `saveLeadAction` after successful save
- [ ] Add env vars: `DISCORD_WEBHOOK_URL` or `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`

```typescript
// notification.service.ts
export async function sendLeadNotification(lead: Lead) {
    const message = `🔥 **New Lead!**
    
📱 WhatsApp: ${lead.whatsapp}
🎓 Dept: ${lead.department}
📝 Topic: ${lead.topic}
💡 Twist: ${lead.twist}
⚡ Complexity: ${lead.complexity}/5

[View in Dashboard](${APP_URL}/admin/leads)`;

    // Discord
    await fetch(process.env.DISCORD_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message })
    });
}
```

### Phase 2: Payment Link Generation (Admin)
- [ ] Create `/api/admin/generate-payment-link/route.ts`
- [ ] Accept: `{ projectId, tier, email }`
- [ ] Generate Paystack link with custom amount based on tier
- [ ] Create Payment record with status "PENDING_MANUAL"
- [ ] Return the payment URL

```typescript
// Tier pricing map
const TIER_PRICES = {
    PAPER_EXPRESS: 60000,
    PAPER_DEFENSE: 80000,
    PAPER_PREMIUM: 100000,
    SOFTWARE_BASIC: 120000,
    SOFTWARE_STANDARD: 200000,
    SOFTWARE_PREMIUM: 320000,
};
```

### Phase 3: Admin UI Enhancement
- [ ] Modify `AdminProjectDetail.tsx`
- [ ] Add "Send Payment Link" button
- [ ] Add tier selection dropdown
- [ ] Add email input (pre-filled if available)
- [ ] Show copy-to-clipboard + WhatsApp deep link

```
┌──────────────────────────────────────────────┐
│  Project: [Topic Name]                       │
│  Status: OUTLINE_GENERATED                   │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ Send Payment Link                       │  │
│  │                                        │  │
│  │ Tier: [Defense Ready ▼]                │  │
│  │ Email: [student@gmail.com]             │  │
│  │                                        │  │
│  │ [Generate Link]                        │  │
│  │                                        │  │
│  │ Link: https://paystack.com/pay/xxxx   │  │
│  │ [📋 Copy] [📱 WhatsApp]                │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### Phase 4: Audit & Tracking
- [ ] Add `/admin/payments` page (already in PostPayment_Features task)
- [ ] Show all Payment records with status (PENDING, SUCCESS, FAILED)
- [ ] Filter by manual vs automated payments

---

## 📁 Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/services/notification.service.ts` | Create | Discord/Telegram notification sender |
| `src/features/bot/actions/chat.ts` | Modify | Call notification on lead save |
| `src/app/api/admin/generate-payment-link/route.ts` | Create | Generate Paystack links for manual sales |
| `src/features/admin/components/AdminProjectDetail.tsx` | Modify | Add payment link UI |
| `src/features/admin/components/PaymentLinkGenerator.tsx` | Create | Reusable payment link component |
| `.env` | Modify | Add DISCORD_WEBHOOK_URL or Telegram vars |
| `.env.example` | Modify | Document new env vars |

---

## ✅ Success Criteria

### Code Quality
- [ ] TypeScript compliant
- [ ] Admin routes protected (check role)
- [ ] Error handling for failed notifications (don't crash flow)

### Performance
- [ ] Notification sends in < 500ms
- [ ] Payment link generation in < 1s

### Functionality
- [ ] You receive Discord/Telegram ping on new lead (within seconds)
- [ ] You can generate payment links from Admin dashboard
- [ ] Links work and track back to the correct project

### User Experience
- [ ] One-click copy payment link
- [ ] WhatsApp deep link opens pre-filled message
- [ ] Clear visual feedback on success/failure

---

## 🔗 Dependencies

**Depends on:**
- [x] `PaystackService` for payment initialization
- [x] `Lead` model and `saveLeadAction`
- [x] Admin dashboard exists (`/admin/leads`, `/admin/projects`)

**Related files:**
- `src/services/paystack.service.ts`
- `src/features/bot/actions/chat.ts` (saveLeadAction)
- `src/features/admin/components/AdminProjectDetail.tsx`

---

## 🔔 Notification Platform Choice

### Discord (Recommended for MVP)
- **Pros:** One URL, no bot setup, rich embeds
- **Cons:** Need Discord account
- **Setup:** Create webhook in server settings → Copy URL → Add to `.env`

### Telegram
- **Pros:** You already use it, mobile notifications
- **Cons:** Need bot token + chat ID setup
- **Setup:** Talk to @BotFather → Create bot → Get token → Get chat ID

**Decision:** Start with Discord, add Telegram later if needed.

---

## 🚀 Getting Started

1. Create a Discord webhook in your server
2. Add `DISCORD_WEBHOOK_URL` to `.env`
3. Implement Phase 1 (notification service)
4. Test by submitting a lead via the bot
5. Implement Phase 2-3 (payment link generation)

---

*Generated by /spawn_task workflow*
