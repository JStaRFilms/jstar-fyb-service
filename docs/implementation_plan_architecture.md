# Implementation Plan: Vibe Pitch & Pricing Strategy

This plan addresses the user's desire to make the "Jay" chatbot more natural and persuasive, and to restructure the project builder to prove value (generate outline) before asking for payment.

## User Review Required
> [!IMPORTANT]
> **Pricing Strategy Change**: The Paywall will be moved. Users will now be able to generate the **Chapter 1-5 Outline** for free. The payment will be required to "Unlock Full Project" (Deep research, full content generation).

> [!NOTE]
> **NotebookLM Workflow**: The extraction of data from PDFs using NotebookLM is a manual "Human-in-the-Loop" process for now. We will build the data structures to receive this data, but the parsing itself is external.

## Proposed Changes

### Feature: "Jay" Chatbot Evolution
#### [MODIFY] [useChatFlow.tsx](file:///c:/CreativeOS/01_Projects/Code/Personal_Stuff/Final%20Year%20Project%20service/2025-12-15_jstar-fyb-service/src/features/bot/hooks/useChatFlow.tsx)
- Remove rigid state machine (`INITIAL` -> `ANALYZING` etc.) in favor of a more flexible "Conversation Loop".
- Add a new state `CONVICTION` where the bot detects user buy-in.
- Update `handleUserMessage` to be less regex-dependent for the initial flow, but strict on the phone number capture.

#### [MODIFY] [route.ts (Chat API)](file:///c:/CreativeOS/01_Projects/Code/Personal_Stuff/Final%20Year%20Project%20service/2025-12-15_jstar-fyb-service/src/app/api/chat/route.ts)
- **CRITICAL**: Rewrite the System Prompt.
- **New Persona**: "Jay" is a peer/co-founder, not a support bot.
- **Logic**:
    1.  Listen to user confusion.
    2.  Suggest mixed difficulty topics (Easy-sounding but complex, Complex-sounding but manageable).
    3.  "Pitch" the choice. Sell the benefits.
    4.  Ask for contact info ONLY when they agree.

### Feature: Project Builder & Pricing
#### [MODIFY] [ProjectBuilder Page]
- *Path to be determined (likely `src/app/project/builder/page.tsx` or similar)*
- logic to auto-trigger Outline Generation upon arrival if a topic is passed.
- Display the Outline clearly.

#### [NEW] [PricingOverlay.tsx]
- Create a component that "locks" the deeper features (Research, Full Writing) but leaves the Outline visible.
- "Unlock Your Full Project" CTA.

### Feature: Backend Data Models (Schema) & Documentation
#### [MODIFY] [schema.prisma](file:///c:/CreativeOS/01_Projects/Code/Personal_Stuff/Final%20Year%20Project%20service/2025-12-15_jstar-fyb-service/prisma/schema.prisma)
- Add fields to `Project` or `Research` model to store the extraction metrics.
- **[NEW]** Add `documents` relation to Project for storing file URLs (PDFs) uploaded by the user/admin.
- **[NEW]** Add fields for `extraction_status` (Pending, Completed).

#### [NEW] Document Upload & Admin Flow
- Allow Admin (User) to upload source PDFs.
- Store file references so "Client" users can download/view them later.
- These PDFs are the source for the NotebookLM extraction.

## Orchestration Strategy (Parallel Execution)
To enable parallel work (as requested), we must lock the **Data Contract** first.
1.  **Step 1 (Main Agent)**: Implement `schema.prisma` changes and push to DB. Define the "Shared Types". [COMPLETE]
2.  **Step 2 (Parallel)**:
    -   **Agent A**: Work on "Jay" Chatbot Flow (Phase 2).
    -   **Agent B**: Work on Project Builder UI & Pricing (Phase 3).
    -   (Agents can run effectively in `git worktree` sessions or just parallel windows if files don't overlap).

## 🛡️ Merge Protocol

### When to Merge
- Agents should only merge when their `Task.md` Checklist is complete (or a Phase is complete).
- **Run Tests** before merging.

### How to Merge (Squash Strategy)
Since we are using `worktrees` with feature branches (`agent-jay`, `agent-builder`):

1.  **Agent A (Jay)** finishes work.
2.  Switch to Main: `git checkout main` (or `master`)
3.  Squash Merge:
    ```bash
    git merge --squash agent-jay
    git commit -m "feat(bot): implement vibe pitch and conviction capture"
    ```
4.  **Resolve Conflicts**: If Agent B merged first, Agent A might have conflicts in `package.json` or `schema.prisma`.
    - **Rule**: `schema.prisma` on `main` is the Truth.

## 🚀 Handoff Instructions

### For Agent A (Chatbot)
- **Path**: `../2025-12-15_jstar-fyb-service-agent-jay`
- **Context**: `docs/tasks/Agent_Jay_Chatbot.md`
- **Goal**: Make Jay cool. Make him sell.

### For Agent B (Builder)
- **Path**: `../2025-12-15_jstar-fyb-service-agent-builder`
- **Context**: `docs/tasks/Agent_Builder_Pricing.md`
- **Goal**: Show the outline. Hide the rest. Upload the docs.

## Verification Plan

### Automated Tests
- **Chat Flow**: Use the browser tool to simulate a user talking to "Jay".
    - Test Case 1: Act confused -> Verify Jay suggests topics.
    - Test Case 2: Select a topic -> Verify Jay pitches it.
    - Test Case 3: Agree -> Verify Jay asks for WhatsApp.
- **Lead Capture**: Verify `saveLeadAction` is called with correct data.

### Manual Verification
1.  **The "Vibe" Check**: Talk to the bot. Does it feel like a "bro" pitching an idea?
2.  **The "Free Sample" Check**: Go to builder. Can I see the Chapter 1-5 outline without paying?
3.  **The "Paywall" Check**: Try to click "Generate Full Project". Am I blocked?
# Implementation Plan & Architecture

## Overview

This document provides a comprehensive implementation plan and architectural overview for the J Star FYB Service, detailing the technical stack, database schema, API design, and deployment strategy.

## Technical Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand for global state, React Context for local state
- **UI Components**: Custom components with glassmorphism and animations
- **AI Integration**: Vercel AI SDK for chat and content generation

### Backend
- **Runtime**: Node.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: WorkOS for enterprise authentication
- **AI Services**: OpenAI GPT-4o, Google Gemini
- **File Storage**: Local storage with future cloud integration

### Infrastructure
- **Hosting**: Vercel (recommended) or any Node.js compatible platform
- **Database**: Neon PostgreSQL (recommended) or any PostgreSQL provider
- **Environment**: Environment variables for configuration
- **Monitoring**: Built-in error handling and logging

## Architecture Overview

### Application Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (marketing)/       # Agency landing page
│   ├── (bot)/            # AI consultant chat
│   ├── (saas)/           # SaaS builder interface
│   ├── api/              # API routes
│   └── auth/             # Authentication pages
├── features/             # Feature modules
│   ├── auth/            # Authentication logic
│   ├── bot/             # Chat functionality
│   ├── builder/         # Project builder
│   ├── marketing/       # Landing page components
│   └── admin/           # Admin dashboard
├── components/          # Shared UI components
├── services/            # Business logic services
├── lib/                 # Utilities and configuration
├── hooks/               # Custom React hooks
└── types/               # TypeScript type definitions
```

### Database Schema

#### Core Models
```prisma
// User Management
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  projects      Project[]
  leads         Lead[]
}

// Project Management
model Project {
  id                 String   @id @default(cuid())
  topic              String
  twist              String?
  abstract           String?
  progressPercentage Int      @default(0)
  contentProgress    Json?
  documentProgress   Json?
  aiGenerationStatus Json?
  timeTracking       Json?
  milestones         Json?
  estimatedCompletion DateTime?
  actualCompletion   DateTime?
  userId             String?
  user               User?    @relation(fields: [userId], references: [id])
  outline            ChapterOutline?
  documents          Document[]
  conversations      ProjectConversation[]
}

// Content Generation
model ChapterOutline {
  id        String   @id @default(cuid())
  projectId String   @unique
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  content   String   // JSON content
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Document Processing
model Document {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  filename  String
  mimetype  String
  size      Int
  content   String?  // Extracted content
  metadata  Json?    // Extracted metadata
  createdAt DateTime @default(now())
}

// Chat and Communication
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

// Lead Management
model Lead {
  id          String   @id @default(cuid())
  name        String?
  email       String?
  phone       String?
  topic       String?
  twist       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
}
```

## API Design

### Content Generation Endpoints

#### Abstract Generation
```typescript
// POST /api/generate/abstract
interface GenerateAbstractRequest {
  projectId: string;
  topic: string;
  twist: string;
}

interface GenerateAbstractResponse {
  abstract: string;
  success: boolean;
}
```

#### Outline Generation
```typescript
// POST /api/generate/outline
interface GenerateOutlineRequest {
  projectId: string;
  topic: string;
  abstract: string;
}

interface GenerateOutlineResponse {
  chapters: ChapterOutline[];
  success: boolean;
}
```

#### Chapter Generation
```typescript
// POST /api/generate/chapter
interface GenerateChapterRequest {
  projectId: string;
  chapterNumber: number;
  chapterTitle: string;
}

interface GenerateChapterResponse {
  content: string;
  success: boolean;
}
```

### Project Management Endpoints

#### Progress Tracking
```typescript
// GET /api/projects/[id]/progress
interface ProjectProgressResponse {
  progressPercentage: number;
  contentProgress: ContentProgress;
  documentProgress: DocumentProgress;
  aiGenerationStatus: AIGenerationStatus;
  timeTracking: TimeTracking;
  milestones: Milestone[];
}

// POST /api/projects/[id]/progress
interface UpdateProgressRequest {
  progressPercentage: number;
  phase: string;
  status: string;
}
```

#### Document Processing
```typescript
// POST /api/documents/upload
interface DocumentUploadRequest {
  projectId: string;
  file: File;
}

// GET /api/documents/[id]/extract
interface DocumentExtractionResponse {
  content: string;
  metadata: DocumentMetadata;
  success: boolean;
}
```

### Chat Endpoints

#### Project Chat
```typescript
// POST /api/projects/[id]/chat
interface ProjectChatRequest {
  message: string;
  conversationId?: string;
}

interface ProjectChatResponse {
  message: string;
  conversationId: string;
  timestamp: string;
}
```

## AI Integration Architecture

### Service Layer
```typescript
// AI Service Interface
interface AiService {
  generateText(prompt: string): Promise<string>;
  generateObject<T>(schema: z.ZodSchema<T>, prompt: string): Promise<T>;
  streamText(prompt: string): AsyncGenerator<string>;
  streamObject<T>(schema: z.ZodSchema<T>, prompt: string): AsyncGenerator<T>;
}

// Builder AI Service
class BuilderAiService implements AiService {
  private async getProjectContext(projectId: string): Promise<ProjectContext>;
  async generateTopicSuggestions(department: string, interests: string[]): Promise<TopicSuggestion[]>;
  async generateAbstract(projectId: string, topic: string, twist: string): Promise<string>;
  async generateOutline(projectId: string, topic: string, abstract: string): Promise<ChapterOutline[]>;
  async generateChapterContent(projectId: string, chapterNumber: number): Promise<string>;
}
```

### Database Integration
```typescript
// Content Storage Pattern
class ContentStorageService {
  async saveAbstract(projectId: string, abstract: string): Promise<void>;
  async saveOutline(projectId: string, outline: ChapterOutline[]): Promise<void>;
  async saveChapter(projectId: string, chapterNumber: number, content: string): Promise<void>;
  
  async getAbstract(projectId: string): Promise<string | null>;
  async getOutline(projectId: string): Promise<ChapterOutline[] | null>;
  async getChapter(projectId: string, chapterNumber: number): Promise<string | null>;
}
```

## Frontend Architecture

### State Management
```typescript
// Zustand Store
interface BuilderState {
  projectId: string | null;
  currentStep: number;
  topic: string;
  abstract: string;
  outline: ChapterOutline[];
  chapters: Record<string, string>;
  progress: number;
  isUnlocked: boolean;
  isLoading: boolean;
  error: string | null;
}

// Custom Hooks
const useBuilderStore = create<BuilderState>((set, get) => ({
  // State and actions
}));

const useProgressTracking = (projectId: string) => {
  // Progress calculation and updates
};

const useProjectChat = (projectId: string) => {
  // Chat functionality
};
```

### Component Architecture
```typescript
// Builder Layout
function BuilderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-dark">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <ProjectAssistant />
    </div>
  );
}

// Step Components
function TopicSelector() {
  // Topic selection logic
}

function AbstractGenerator() {
  // Abstract generation with streaming
}

function ChapterOutliner() {
  // Outline generation and display
}

function ChapterGenerator() {
  // Chapter content generation
}
```

## Security Implementation

### Authentication Flow
```typescript
// WorkOS Integration
class AuthService {
  async signIn(email: string, password: string): Promise<User>;
  async signUp(email: string, password: string): Promise<User>;
  async signOut(): Promise<void>;
  async getCurrentUser(): Promise<User | null>;
}

// Middleware
function withAuth<T>(handler: NextApiHandler<T>): NextApiHandler<T> {
  return async (req, res) => {
    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return handler(req, res);
  };
}
```

### Input Validation
```typescript
// Zod Schemas
const ProjectSchema = z.object({
  topic: z.string().min(5).max(200),
  twist: z.string().optional(),
  abstract: z.string().optional(),
});

const ChatMessageSchema = z.object({
  message: z.string().min(1).max(1000),
  projectId: z.string(),
});
```

## Deployment Strategy

### Environment Configuration
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/jstar_fyb"
DIRECT_URL="postgresql://user:password@localhost:5432/jstar_fyb"

# AI Services
OPENAI_API_KEY="sk-your-openai-key"
GOOGLE_API_KEY="your-google-key"

# Authentication
WORKOS_API_KEY="your-workos-key"
WORKOS_CLIENT_ID="your-workos-client-id"

# Application
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://your-domain.com"
```

### Build and Deploy
```bash
# Install dependencies
pnpm install

# Build the application
pnpm build

# Run migrations
pnpm db:migrate

# Start the application
pnpm start

# Development
pnpm dev
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm build
      - run: pnpm db:migrate
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Monitoring and Analytics

### Error Tracking
```typescript
// Error Handler
class ErrorHandler {
  static handle(error: Error, context: string) {
    console.error(`[${context}] ${error.message}`, error);
    // Send to error tracking service
  }
}

// Global Error Boundary
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  // Error boundary implementation
}
```

### Performance Monitoring
```typescript
// Performance Logger
class PerformanceLogger {
  static measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    return fn().finally(() => {
      const end = performance.now();
      console.log(`${name}: ${end - start}ms`);
    });
  }
}
```

## Testing Strategy

### Unit Testing
```typescript
// Jest + Testing Library
describe('BuilderAiService', () => {
  it('should generate topic suggestions', async () => {
    const service = new BuilderAiService();
    const suggestions = await service.generateTopicSuggestions('CS', ['AI']);
    expect(suggestions).toHaveLength(3);
  });
});
```

### Integration Testing
```typescript
// API Testing
describe('API Endpoints', () => {
  it('should generate abstract', async () => {
    const response = await request(app)
      .post('/api/generate/abstract')
      .send({ projectId: 'test', topic: 'AI', twist: 'Blockchain' });
    
    expect(response.status).toBe(200);
    expect(response.body.abstract).toBeDefined();
  });
});
```

### E2E Testing
```typescript
// Playwright
test('user can create a project', async ({ page }) => {
  await page.goto('/project/builder');
  await page.fill('[data-testid="topic-input"]', 'AI Chatbot');
  await page.click('[data-testid="generate-btn"]');
  await expect(page.locator('[data-testid="abstract"]')).toBeVisible();
});
```

## Future Enhancements

### Scalability Improvements
- Database sharding for large user base
- Redis caching for frequently accessed data
- CDN integration for static assets
- Microservices architecture for complex features

### Advanced Features
- Real-time collaboration tools
- Advanced document processing with OCR
- Multi-language support
- Mobile app development
- Advanced analytics and reporting

### AI Enhancements
- RAG (Retrieval-Augmented Generation) integration
- Multi-modal AI capabilities
- Advanced content analysis
- Personalized AI assistant

This comprehensive implementation plan provides a solid foundation for building and deploying the J Star FYB Service with scalability, security, and maintainability in mind.
