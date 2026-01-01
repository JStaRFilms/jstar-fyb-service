# FR-003: Lead Capture (Database)

## Goal
To persist the sales data generated in FR-002. When a user completes the chat, their "Twist", "Complexity", "Department", and "WhatsApp" are saved to a SQLite database.

## Component Breakdown

### Dependencies (New)
- `prisma`: ORM.
- `@prisma/client`: Runtime client.
- `sqlite`: Database (Dev).

### Schema (`prisma/schema.prisma`)
```prisma
model Lead {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  
  whatsapp  String
  department String
  topic     String   // The original idea
  twist     String   // The AI generated twist
  complexity Int
}
```

### Server Actions
- `src/features/leads/actions/captureLead.ts`:
    - `function captureLead(data: LeadData): Promise<Result>`
    - Validates input (Zod).
    - Writes to DB.
    - (Optional) Sends Discord Webhook.

## Integration
- **Hook**: `src/features/bot/hooks/useChatFlow.tsx`
    - In `state === "CLOSING"`, captures WhatsApp number and calls `saveLeadAction`.
    - Automatically links to authenticated WorkOS `userId` if the user is signed in.
    - **Intelligent Trigger**: 
        - Scans AI messages for "WhatsApp" keyword.
        - Injects synthetic tool calls if the AI forgets to trigger the UI explicitly.
        - **Smart Loop Prevention**: Suppresses triggers if user already provided a phone number in the current session or last 3 messages.
- **Action**: `src/features/bot/actions/chat.ts`
    - `saveLeadAction`: Validates and upserts lead data into the SQLite database.
    - **Anonymous Tracking**: Captures `anonymousId` from cookies to link leads to users post-signup.

## Implementation Steps
1.  [x] **Setup**: Prisma configured for SQLite.
2.  [x] **Model**: `Lead` model added to `schema.prisma`.
3.  [x] **Action**: `saveLeadAction` implemented in bot actions.
4.  [x] **Wiring**: Integrated into `useChatFlow` and `ChatInterface`.
5.  [x] **Verify**: Verified for type safety via `tsc`.
