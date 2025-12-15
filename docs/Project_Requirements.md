# Project Requirements: J Star FYB Service

## Functional Requirements

| Requirement ID | Description | User Story | Expected Behavior / Outcome | Status |
| :--- | :--- | :--- | :--- | :--- |
| FR-001 | **Agency Landing Page (Marketing)** | As a visitor, I want to see a high-end, "sexy" landing page with 3D elements and scroll animations, so that I trust the agency's quality. | - Hero section with countdown<br>- Pricing Key Components<br>- Project Gallery<br>- Sticky CTA | MUS |
| FR-002 | **AI Sales Consultant (Bot)** | As a student with a vague idea, I want to chat with an AI that refines my idea and suggests a "twist", so that I can get approval. | - Chat interface in `/project/chat`<br>- Proposes topics<br>- Quantifies complexity<br>- Funnels to Lead Capture | MUS |
| FR-003 | **Lead Capture** | As the agency owner, I want to capture the phone numbers of interested students, so that I can close the sale manually. | - Bot asks for WhatsApp number<br>- Saves to DB<br>- Triggers notification (Discord/Telegram) | MUS |
| FR-004 | **SaaS Project Builder (Wizard)** | As a lower-budget student, I want a DIY tool to generate my project abstract and outline, so that I can start writing myself. | - Step 1: Topic Selection<br>- Step 2: Abstract Gen<br>- Step 3: Chapter 1 Outline<br>- Restricted access after Step 3 | MUS |
| FR-005 | **SaaS Paywall Logic** | As the business owner, I want to restrict full content generation behind a payment, so that I generate revenue. | - Blur content after Step 3<br>- Prompt for payment (₦15k) to unlock | MUS |
| FR-006 | **Payments Integration** | As a user, I want to pay via Paystack/Flutterwave, so that I can unlock the full SaaS features. | - Integration with Paystack/Flutterwave<br>- Webhook handling to update `hasPaid` status | Future |
| FR-007 | **Full Chapter Generation** | As a paid user, I want to generate full academic chapters (1-3) and code snippets, so that I save time. | - Generate verbose academic content<br>- Generate code boilerplate | Future |
| FR-008 | **Upsell Bridge** | As a stuck DIY user, I want to easily hire the agency to finish the code, so that I don't fail. | - "Stuck? Hire us" button in SaaS dashboard<br>- Connects to Agency sales flow | Future |
