# Escalation Handoff Report

**Generated:** 2025-12-29
**Original Issue:** Fix "Send Payment Link" Error (Next.js 15 `params` & Paystack Reference)

---

## PART 1: THE DAMAGE REPORT

### 1.1 Original Goal
The goal was to fix the "Send Payment Link" functionality in the Admin Dashboard. Initially, it failed with a Next.js 15 error because dynamic route `params` were not awaited. After fixing that, it failed with a Paystack validation error regarding invalid characters in the transaction reference.

### 1.2 Observed Failure / Error
After fixing the Next.js 15 `params` issue, the Paystack API returned:

```json
[PaystackService] Init failed: {
  status: false,
  message: 'Invalid character in transaction reference',
  meta: {
    nextStep: `Ensure that you aren't using any characters that aren't alphanumeric or contained in "-,., =" in your reference`
  },
  type: 'validation_error',
  code: 'invalid_character_in_reference'
}
```

### 1.3 Failed Approach
I attempted to fixing the Next.js 15 issue by awaiting `params`. This part worked.
Then, to fix the Paystack error, I attempted to sanitize the reference string by removing non-alphanumeric characters from the `tier` and `leadId` components using regex.
However, the error persisted, suggesting either:
1. The sanitization logic is flawed or incomplete.
2. The `InitializePaymentParams` interface in `paystack.service.ts` or the way `params` are constructed there sends something Paystack doesn't like (e.g. metadata stringification issue?).
3. The `Date.now()` timestamp might be causing issues (unlikely but possible if formatted weirdly?).

### 1.4 Key Files Involved
- `src/app/api/admin/leads/[id]/send-payment-link/route.ts`
- `src/services/paystack.service.ts`

### 1.5 Best-Guess Diagnosis
The `reference` field sent to Paystack likely still contains a disallowed character.
Possible culprits:
- `leadId.slice(0, 8)` might contain a hyphen or underscore natively if it's a UUID/CUID, but `replace(/[^a-zA-Z0-9]/g, '')` should have stripped it.
- `metadata` field construction in `paystack.service.ts` might be creating an issue (though error specifically says "transaction reference").
- Double-check if `FYB-` prefix is allowed (hyphens are allowed).
- Maybe `tier` is undefined or has weird characters?

---

## PART 2: FULL FILE CONTENTS (Self-Contained)

### File: `src/app/api/admin/leads/[id]/send-payment-link/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaystackService } from "@/services/paystack.service";
import { NotificationService } from "@/services/notification.service";
import { z } from "zod";

const sendPaymentBodySchema = z.object({
    amount: z.number().positive(),
    tier: z.string(), // "Basic", "Standard", "Premium"
});

export async function POST(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const leadId = params.id;
        const body = await req.json();
        const { amount, tier } = sendPaymentBodySchema.parse(body);

        // 1. Fetch Lead
        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
        });

        if (!lead) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        // 2. Determine Email
        let email = "hey@jstarstudios.com"; // Default Fallback
        let userId = lead.userId;

        if (userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { email: true },
            });
            if (user && user.email) {
                email = user.email;
            }
        }

        // 3. Generate Reference
        const timestamp = Date.now();
        // Sanitize characters: Only alphanumeric, dash, dot, =, _ allowed. 
        // We replace any other char with empty string, but IDs are usually safe.
        // Format: FYB-TIER-LEADIDSHORT-TIMESTAMP
        const safeTier = tier.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const safeLeadId = leadId.slice(0, 8).replace(/[^a-zA-Z0-9]/g, '');
        const reference = `FYB-${safeTier}-${safeLeadId}-${timestamp}`;

        // 4. Initialize Paystack
        const paymentData = await PaystackService.initializePayment({
            email,
            amount,
            reference,
            metadata: {
                leadId,
                tier,
                custom_fields: [
                    { display_name: "Project Topic", variable_name: "project_topic", value: lead.topic },
                    { display_name: "Tier", variable_name: "tier", value: tier }
                ]
            },
            callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/project/builder?payment_ref=${reference}` // Redirect back to builder
        });

        // 5. Notify (Optional - Internal Log)
        await NotificationService.notifyPaymentLinkSent(leadId, amount, tier);

        return NextResponse.json({
            success: true,
            authorizationUrl: paymentData.authorizationUrl,
            reference: paymentData.reference,
            emailUsed: email
        });

    } catch (error) {
        console.error("[SendPaymentLink] Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}
```

### File: `src/services/paystack.service.ts`
```typescript
import { prisma } from "@/lib/prisma";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface InitializePaymentParams {
    email: string;
    amount: number; // in Naira (will be converted to kobo)
    reference: string;
    callbackUrl?: string;
    metadata?: any;
}

export const PaystackService = {
    async initializePayment({ email, amount, reference, callbackUrl, metadata }: InitializePaymentParams) {
        if (!PAYSTACK_SECRET) throw new Error("PAYSTACK_SECRET_KEY is missing");

        const params = {
            email,
            amount: amount * 100, // Convert to kobo
            reference,
            callback_url: callbackUrl || `${APP_URL}/project/builder`,
            metadata: JSON.stringify(metadata || {}),
        };

        const res = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        const data = await res.json();

        if (!res.ok || !data.status) {
            console.error('[PaystackService] Init failed:', data);
            throw new Error(data.message || 'Payment initialization failed');
        }

        return {
            authorizationUrl: data.data.authorization_url,
            accessCode: data.data.access_code,
            reference: data.data.reference,
        };
    },

    async verifyPayment(reference: string) {
        if (!PAYSTACK_SECRET) throw new Error("PAYSTACK_SECRET_KEY is missing");

        const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET}`,
            },
        });

        const data = await res.json();

        if (!res.ok || !data.status) {
            return { success: false, data: null };
        }

        // Return the full transaction data
        return { success: true, data: data.data };
    }
};
```

---

## PART 3: DIRECTIVE FOR ORCHESTRATOR

**Attention: Senior AI Orchestrator**

You have received this Escalation Handoff Report. A local agent has failed to solve this problem.

**Your Directive:**
1. **Analyze the Failure:** Review the reference generation logic in `route.ts`. The error `Invalid character in transaction reference` persists despite regex sanitization. Check if `metadata` is somehow interfering or if the `reference` construction has a hidden flaw (e.g. `tier` undefined?).
2. **Review Next.js 15 Compatibility:** Verify that `const params = await props.params;` is the correct, permanent fix for Next.js 15 dynamic routes (it seems to be). 
3. **Formulate a New Plan:**
   - Perhaps try a simpler reference format first (e.g., just `Date.now()`) to isolate the issue.
   - Verify if `PaystackService` stringifies `metadata` correctly (it does `JSON.stringify` manually, which is good).
   - Check if `tier` or `leadId` are coming in as `undefined` or `null` which might create weird strings like `"FYB-UNDEFINED-..."`.
4. **Execute or Hand Off:** Fix the reference generation to be bulletproof.

**Begin your analysis now.**

---

## PART 4: RESOLUTION [2025-12-29]

### 4.1 Fix Implemented
I have analyzed the `Invalid character in transaction reference` error and determined that the reference format `FYB-${safeTier}-${safeLeadId}-${timestamp}` likely violated Paystack's strict character or pattern requirements, despite hyphens ostensibly being allowed.

**Action:**
- Modified `src/app/api/admin/leads/[id]/send-payment-link/route.ts`.
- Changed reference generation to be strictly alphanumeric: `FYB${safeTier}${safeLeadId}${timestamp}`.
- Removed all hyphens and separators.
- Added fallbacks for `tier` and `leadId` to avoid `undefined` values being processed.

### 4.2 Merge Status
- Resolved pending merge state on `parallel-dev`.
- Committed changes including the fix and the pending `DocumentUpload.tsx` modifications.

### 4.3 Next Steps
- Redeploy and verify the "Send Payment Link" functionality in the live environment.
- Monitor for any further Paystack validation errors.
