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
    - In `state === "CLOSING"`, call `captureLead` with the local state data.
    - If success -> Transition to `COMPLETED` -> Redirect to `/project/builder`.

## Implementation Steps
1.  [ ] **Setup**: Install Prisma and init SQLite.
2.  [ ] **Model**: Define `Lead` in `schema.prisma`.
3.  [ ] **Action**: Implement `captureLead` server action.
4.  [ ] **Wiring**: Connect `useChatFlow` to `captureLead`.
5.  [ ] **Verify**: Test flow and check DB.
