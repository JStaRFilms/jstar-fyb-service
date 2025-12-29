# 🎯 TASK-WT-001: Admin Sales Automation

**Branch:** `feat/admin-sales-automation`  
**Est. Time:** 2 hours  
**Conflict Risk:** ✅ NONE

---

## Objective

Implement "Send Payment Link" functionality in Admin dashboard and real-time lead notifications via Discord/Telegram webhook.

---

## Files to CREATE

### 1. `src/services/notification.service.ts`
```typescript
// Implement Discord/Telegram webhook notifications
export const NotificationService = {
    async notifyNewLead(lead: Lead) { /* ... */ },
    async notifyPaymentReceived(payment: Payment) { /* ... */ }
}
```

### 2. `src/app/api/admin/leads/[id]/send-payment-link/route.ts`
```typescript
// POST endpoint to generate and send Paystack payment link
// Uses PaystackService.initializePayment()
// Returns { authorizationUrl, reference }
```

### 3. `src/features/admin/components/SendPaymentLinkButton.tsx`
```typescript
// Button component with:
// - Tier selection dropdown (Basic, Standard, Premium)
// - Loading state
// - Success/error toasts
// - Copy link to clipboard option
```

---

## Files to MODIFY

### `src/features/admin/components/AdminLeadCard.tsx`
- Add `<SendPaymentLinkButton />` component
- Add WhatsApp deep link button
- Add call button

### `src/app/admin/leads/page.tsx`
- Add mobile card view (currently only table)
- Add stats cards (Total Leads, Revenue, Paid Users, Pending)

---

## Dependencies (READ-ONLY)

- `src/services/paystack.service.ts` - PaystackService.initializePayment()
- `prisma/schema.prisma` - Lead model (already exists)

---

## DO NOT TOUCH

- ❌ `prisma/schema.prisma`
- ❌ `src/app/api/chat/route.ts`
- ❌ Any `builder/*` files
- ❌ Any `bot/*` files
- ❌ `globals.css`

---

## Acceptance Criteria

- [ ] Admin can click "Send Payment Link" on any lead
- [ ] Admin can select pricing tier before sending
- [ ] Payment link is generated via Paystack
- [ ] Discord/Telegram notification fires on new lead
- [ ] Mobile card view works on small screens
- [ ] Stats cards show at top of admin leads page

---

## Testing

```bash
# 1. Navigate to /admin/leads
# 2. Click "Send Payment Link" on a lead
# 3. Select tier and confirm
# 4. Verify Paystack link is generated
# 5. Verify Discord webhook fires (if configured)
```
