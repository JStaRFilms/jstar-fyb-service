# FR-006: Admin Sales Automation

## Overview
A suite of tools for the Admin Lead Management interface to streamline sales and payments. It allows admins to manually generate payment links for leads, track conversions, and receive real-time notifications.

## Architecture
- **API:** `src/app/api/admin/leads/[id]/send-payment-link/route.ts`
- **Services:** 
  - `PaystackService` (`src/services/paystack.service.ts`)
  - `NotificationService` (`src/services/notification.service.ts`)
- **UI:** `src/features/admin/components/SendPaymentLinkButton.tsx`

## Key Capabilities

### Manual Payment Link Generation
Admins can select a pricing tier (Basic, Standard, Premium) for any lead. The system:
- Generates a unique Paystack transaction reference.
- Creates a secure checkout URL.
- Associates the potential payment with the Lead ID.

### Real-Time Notifications
Integration with external webhooks (Discord/Telegram) to notify admins of:
- New Leads Captured
- Payment Links Generated
- Successful Payments

### Enhanced Lead Card
The `AdminLeadCard` now includes:
- "Send Payment Link" action
- WhatsApp deep linking
- Quick status toggles

## Configuration
| Environment Variable | Description |
|----------------------|-------------|
| `PAYSTACK_SECRET_KEY` | Paystack API Secret for transaction initialization |
| `DISCORD_WEBHOOK_URL`| (Optional) URL for admin notifications |

## Hotfixes
### 2025-12-29: Fix Next.js 15 Async Params
- **Problem:** API route failed because `params` was accessed synchronously.
- **Solution:** Updated route to `await params` before extracting `id`.
