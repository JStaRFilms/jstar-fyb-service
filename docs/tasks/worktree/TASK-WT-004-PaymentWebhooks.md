# 🎯 TASK-WT-004: Payment Webhooks

**Branch:** `feat/payment-webhooks`  
**Est. Time:** 2 hours  
**Conflict Risk:** ✅ NONE

---

## Objective

Implement Paystack webhook handling for payment verification, subscription management, and billing records.

---

## Files to CREATE

### 1. `src/app/api/pay/webhook/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    // 1. Verify webhook signature
    const signature = req.headers.get('x-paystack-signature');
    const body = await req.text();
    
    if (!verifySignature(body, signature)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    
    const event = JSON.parse(body);
    
    // 2. Handle events
    switch (event.event) {
        case 'charge.success':
            await handleChargeSuccess(event.data);
            break;
        case 'transfer.success':
            await handleTransferSuccess(event.data);
            break;
        case 'subscription.create':
            await handleSubscriptionCreate(event.data);
            break;
        // ... more events
    }
    
    return NextResponse.json({ received: true });
}

function verifySignature(body: string, signature: string | null): boolean {
    if (!signature) return false;
    const secret = process.env.PAYSTACK_SECRET_KEY!;
    const hash = createHmac('sha512', secret).update(body).digest('hex');
    return hash === signature;
}
```

### 2. `src/services/billing.service.ts`
```typescript
export const BillingService = {
    async recordPayment(data: PaymentData) { /* ... */ },
    async updateProjectUnlock(projectId: string) { /* ... */ },
    async sendReceiptEmail(userId: string, paymentId: string) { /* ... */ },
    async getPaymentHistory(userId: string) { /* ... */ }
}
```

---

## Files to MODIFY

### `src/services/paystack.service.ts`
Add webhook signature verification method:
```typescript
verifyWebhookSignature(body: string, signature: string): boolean {
    const hash = createHmac('sha512', PAYSTACK_SECRET).update(body).digest('hex');
    return hash === signature;
}
```

---

## Dependencies (READ-ONLY)

- `prisma/schema.prisma` - Payment, Project models
- `src/lib/prisma.ts` - Prisma client

---

## DO NOT TOUCH

- ❌ Builder components
- ❌ Admin components
- ❌ Chat API routes
- ❌ `prisma/schema.prisma`
- ❌ Frontend files

---

## Webhook Events to Handle

| Event | Action |
|-------|--------|
| `charge.success` | Update payment status, unlock project, send notification |
| `charge.failed` | Log failure, notify user |
| `subscription.create` | Record subscription, update user tier |
| `subscription.disable` | Downgrade user, revoke access |
| `transfer.success` | Record payout (for refunds) |

---

## Environment Variables

Ensure these are set:
```env
PAYSTACK_SECRET_KEY=sk_live_xxx
PAYSTACK_WEBHOOK_SECRET=xxx (optional, for extra security)
```

---

## Acceptance Criteria

- [ ] Webhook endpoint validates Paystack signature
- [ ] `charge.success` unlocks project and records payment
- [ ] Billing records are created for each transaction
- [ ] Failed webhooks are logged for debugging
- [ ] Idempotent handling (same event twice = no duplicate records)

---

## Testing

```bash
# Use Paystack's webhook testing tool or ngrok:
# 1. Expose local server: ngrok http 3000
# 2. Configure webhook URL in Paystack dashboard
# 3. Make a test payment
# 4. Verify project unlocks and billing record created
```
