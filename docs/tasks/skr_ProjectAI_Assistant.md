# 🎯 Task: Project-Aware AI Assistant (The "Project Copilot")

**Objective:** Build an AI chatbot that has full context of the user's project - their topic, abstract, chapters, progress, and can help them write, refine, and answer questions.
**Priority:** High (Major value-add feature)
**Scope:** New chat system for paid users, integrated with project data.

---

## 🧠 The Vision

Think **NotebookLM** but for Final Year Projects. The AI should:
- Know the project topic, abstract, and all generated chapters
- Remember previous conversations about this project
- Help write specific sections (e.g., "Write my methodology")
- Answer questions about academic formatting
- Suggest improvements to existing content
- Be available 24/7 unlike the Admin in Concierge mode

---

## 📋 Requirements

### Functional Requirements
- **[REQ-001]** Chat UI accessible from Builder dashboard (paid users only)
- **[REQ-002]** AI has access to: Topic, Abstract, All Chapters, Research Documents
- **[REQ-003]** Conversation history persists across sessions
- **[REQ-004]** User can ask questions like "Improve my problem statement"
- **[REQ-005]** AI can generate content that integrates with existing chapters
- **[REQ-006]** Conversations are linked to specific Project ID

### Technical Requirements
- **[TECH-001]** Use Vercel AI SDK with streaming responses
- **[TECH-002]** Context injection via system prompt (project data)
- **[TECH-003]** Store conversations in DB linked to `projectId`
- **[TECH-004]** Token limits: Truncate older messages if context too large
- **[TECH-005]** RAG consideration: For large projects with documents

---

## 🏗️ Implementation Plan

### Phase 1: Database Schema
- [ ] Create `ProjectConversation` model (links to Project)
- [ ] Create `ProjectChatMessage` model 
- [ ] Run `prisma db push`

```prisma
model ProjectConversation {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  messages  ProjectChatMessage[]
}

model ProjectChatMessage {
  id             String   @id @default(cuid())
  conversationId String
  conversation   ProjectConversation @relation(fields: [conversationId], references: [id])
  role           String   // 'user' | 'assistant'
  content        String
  createdAt      DateTime @default(now())
}
```

### Phase 2: API Endpoint
- [ ] Create `/api/projects/[id]/chat/route.ts`
- [ ] Accept streaming chat requests
- [ ] Inject project context into system prompt
- [ ] Save messages to DB after completion

```typescript
// System prompt template
const systemPrompt = `
You are an AI assistant for a Final Year Project.

## Project Context
- **Topic:** ${project.topic}
- **Twist:** ${project.twist}
- **Abstract:** ${project.abstract}

## Generated Chapters
${chapters.map(c => `### ${c.title}\n${c.content}`).join('\n\n')}

## Your Role
- Help the student write, refine, and improve their project
- Answer questions about academic writing and formatting
- Suggest improvements to existing content
- Be encouraging but maintain academic standards
`;
```

### Phase 3: Frontend Component
- [ ] Create `ProjectAssistant.tsx` component
- [ ] Add to Builder layout (visible after payment)
- [ ] Implement chat UI with streaming
- [ ] Show typing indicators
- [ ] Allow copying AI responses

### Phase 4: Context Management
- [ ] Implement context truncation for long conversations
- [ ] Add "New Chat" button to start fresh context
- [ ] Show conversation history list
- [ ] Allow switching between past conversations

### Phase 5: Advanced Features (Future)
- [ ] RAG: Index uploaded research documents
- [ ] "Insert into Chapter X" button on AI responses
- [ ] Voice input support
- [ ] Export chat as PDF

---

## 📁 Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `prisma/schema.prisma` | Modify | Add ProjectConversation, ProjectChatMessage |
| `src/app/api/projects/[id]/chat/route.ts` | Create | AI chat endpoint with streaming |
| `src/features/builder/components/ProjectAssistant.tsx` | Create | The chat UI component |
| `src/features/builder/hooks/useProjectChat.ts` | Create | Custom hook for chat logic |
| `src/features/builder/components/ChapterOutliner.tsx` | Modify | Add ProjectAssistant to layout |

---

## ✅ Success Criteria

### Code Quality
- [ ] TypeScript compliant
- [ ] Streaming works without buffering lag
- [ ] Error handling for API failures

### Performance
- [ ] First token appears in < 500ms
- [ ] Context injection doesn't exceed token limits
- [ ] Older messages truncated gracefully

### Functionality
- [ ] AI knows the project topic and chapters
- [ ] Conversations persist across page reloads
- [ ] User can start new conversations
- [ ] Past conversations are accessible

### User Experience
- [ ] Chat is easy to find in Builder
- [ ] Responses feel helpful and contextual
- [ ] Clear indication when AI is "thinking"

---

## 🔗 Dependencies

**Depends on:**
- [x] Project model with topic, abstract, outline
- [x] Payment/unlock system (feature is for paid users only)
- [x] Vercel AI SDK already installed

**Related files:**
- `src/features/builder/store/useBuilderStore.ts` - Project state
- `src/features/bot/components/ChatInterface.tsx` - Reference implementation
- `src/app/api/generate/abstract/route.ts` - AI streaming pattern

---

## 🎨 UI Mockup

```
┌─────────────────────────────────────────────────────────────┐
│  [Builder Dashboard]                      [🤖 AI Assistant] │
├─────────────────────────────────────────────────────────────┤
│                                           ┌───────────────┐ │
│  [Chapters]  [Documents]  [Chat]          │  Your Project │ │
│                                           │  Copilot      │ │
│  Chapter 1: Introduction                  │               │ │
│  Chapter 2: Literature...                 │  "How can I   │ │
│  Chapter 3: Methodology...                │   improve my  │ │
│                                           │   abstract?"  │ │
│                                           │               │ │
│                                           │  [Send]       │ │
│                                           └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 Key Differentiator

Unlike the "Sales Bot" (App 2) which funnels to lead capture, this AI:
- Is available **only after payment**
- Has **deep context** of their specific project
- Is positioned as a **productivity tool** not a salesperson
- Remembers **everything** across sessions

---

## 🚀 Getting Started

1. Read this task prompt completely
2. Start with Phase 1: Database Schema
3. Test each phase before moving on
4. Focus on core chat functionality first, advanced features later

---

*Generated by /spawn_task workflow*
