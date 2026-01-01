# FR-013: Expert Services Store

## Overview
À la carte expert services for DIY users who want professional help without upgrading to the full Agency tier.

## Architecture
- **Config:** `src/config/pricing.ts` (`PRICING_CONFIG.ADD_ONS`)
- **Listing Page:** `src/app/(saas)/services/page.tsx`
- **Detail/Checkout:** `src/app/(saas)/services/[serviceId]/page.tsx`
- **Confirmation:** `src/app/(saas)/services/complete/page.tsx`
- **Purchase API:** `src/app/api/services/purchase/route.ts`
- **Purchased Check:** `src/app/api/services/purchased/route.ts`

## Available Services
| Service | Price | Description |
|---------|-------|-------------|
| Defense Speech Writing | ₦25,000 | Professional speech for your defense |
| Code Review & Debug | ₦20,000 | Expert review of software code |
| Chapter Editing | ₦10,000 | Per-chapter polish and editing |
| Rush Delivery | ₦15,000 | 48-hour priority processing |
| AI Deep Research | ₦5,000 | Automated research synthesis using Gemini Deep Research Agent |

## User Flow
1. User clicks "Hire an Expert" from Dashboard or Builder
2. Views services listing at `/services`
3. Selects a service → `/services/[serviceId]` checkout page
4. Clicks "Proceed to Payment" → Paystack redirect
5. After payment → `/services/complete` confirmation
6. Service shows as "Purchased" with green checkmark on listing

## Integration
- Uses existing `Payment` model
- Payment references prefixed with `SVC` + sanitized service ID
- Purchased detection via reference pattern (not gatewayResponse)
- Links to user's current `projectId` from Builder store

## Entry Points
- **Dashboard:** `UpsellBanner.tsx` → "Hire an Expert" button
- **Builder (future):** Can add link to services from UpsellBridge

## Hotfixes
### 2026-01-01: Purchased Services Detection
- **Problem:** `gatewayResponse` was overwritten after Paystack verification, losing `serviceId`.
- **Solution:** Detect purchased services via payment reference pattern instead.
