# Content Generation APIs Storage Integration

## Overview

This document outlines the integration of content generation APIs with the database to properly store generated content in the appropriate database models.

## Changes Made

### 1. API Updates

#### `/api/generate/outline` - Chapter Outline Storage
- **File**: `src/app/api/generate/outline/route.ts`
- **Changes**:
  - Added imports for `prisma` and `getCurrentUser`
  - Added database storage logic after successful outline generation
  - Creates or updates `ChapterOutline` records linked to projects
  - Handles both authenticated and anonymous users
  - Includes error handling for database operations
  - **Enhanced**: Now uses `streamObject` with structured output for better reliability

#### `/api/generate/abstract` - Project Abstract Storage
- **File**: `src/app/api/generate/abstract/route.ts`
- **Changes**:
  - Added imports for `prisma` and `getCurrentUser`
  - Added database storage logic after successful abstract generation
  - Updates the `Project` model with the generated abstract
  - Creates new projects if they don't exist
  - Includes error handling for database operations
  - **Enhanced**: Added "no title" instruction to prevent AI from adding headers

#### `/api/generate/chapter` - Chapter Content Storage
- **File**: `src/app/api/generate/chapter/route.ts`
- **Changes**:
  - Added database storage logic for chapter content
  - Updates `ChapterOutline` records with chapter-specific content
  - Stores content in JSON format with chapter number keys
  - Includes error handling for database operations
  - Handles both primary and fallback generation paths
  - **Enhanced**: Now supports real-time streaming with database persistence

### 2. Database Storage Logic

#### Chapter Outline Storage
```typescript
await prisma.chapterOutline.upsert({
    where: { projectId: project.id },
    update: {
        content: JSON.stringify(outlineData.chapters),
        updatedAt: new Date()
    },
    create: {
        projectId: project.id,
        content: JSON.stringify(outlineData.chapters)
    }
});
```

#### Project Abstract Storage
```typescript
await prisma.project.update({
    where: { id: project.id },
    data: {
        twist: twist,
        abstract: abstractText,
        updatedAt: new Date()
    }
});
```

#### Chapter Content Storage
```typescript
await prisma.chapterOutline.update({
    where: { projectId: projectId },
    data: {
        content: JSON.stringify({
            ...JSON.parse(project.outline?.content || '{}'),
            [`chapter_${chapterNumber}`]: chapterContent
        }),
        updatedAt: new Date()
    }
});
```

### 3. Frontend Component Updates

#### ChapterOutliner Component
- **File**: `src/features/builder/components/ChapterOutliner.tsx`
- **Changes**:
  - Added `useEffect` to fetch stored outlines on component mount
  - Fetches from `/api/projects/[id]/outline` endpoint
  - Displays stored content when available
  - **Enhanced**: Now includes smart paywall logic - only shows placeholders until payment
  - **Enhanced**: Added wipe reveal animation for streaming chapter content

#### AbstractGenerator Component
- **File**: `src/features/builder/components/AbstractGenerator.tsx`
- **Changes**:
  - Added `useEffect` to fetch stored abstracts on component mount
  - Fetches from `/api/projects/[id]/abstract` endpoint
  - Displays stored abstract when available
  - **Enhanced**: Added edit/refinement functionality with instruction-based regeneration

#### ChapterGenerator Component
- **File**: `src/features/builder/components/ChapterGenerator.tsx`
- **Changes**:
  - Added `useEffect` to fetch stored chapters on component mount
  - Fetches from `/api/projects/[id]/chapters` endpoint
  - Displays stored chapter content when available
  - Added `useEffect` import
  - **Enhanced**: Now uses `useObject` hook for structured streaming
  - **Enhanced**: Added download functionality for generated chapters

### 4. New API Endpoints

#### `/api/projects/[id]/outline`
- **File**: `src/app/api/projects/[id]/outline/route.ts`
- **Purpose**: Fetch stored chapter outline for a project
- **Authentication**: Required
- **Authorization**: Project ownership verification
- **Response**: JSON with outline data

#### `/api/projects/[id]/abstract`
- **File**: `src/app/api/projects/[id]/abstract/route.ts`
- **Purpose**: Fetch stored abstract for a project
- **Authentication**: Required
- **Authorization**: Project ownership verification
- **Response**: JSON with abstract text

#### `/api/projects/[id]/chapters`
- **File**: `src/app/api/projects/[id]/chapters/route.ts`
- **Purpose**: Fetch stored chapter content for a project
- **Authentication**: Required
- **Authorization**: Project ownership verification
- **Response**: JSON with chapter content

#### `/api/projects/[id]/progress`
- **File**: `src/app/api/projects/[id]/progress/route.ts`
- **Purpose**: Fetch comprehensive project progress tracking
- **Authentication**: Required
- **Authorization**: Project ownership verification
- **Response**: JSON with progress percentage, content progress, document progress, AI generation status

### 5. Builder AI Service Updates

#### Chapter Content Generation
- **File**: `src/features/builder/services/builderAiService.ts`
- **Changes**:
  - Modified `generateChapterContent` to store content in database
  - Added database storage logic within the service method
  - Ensures content is persisted even if API streaming fails
  - **Enhanced**: Now uses real database-connected AI services instead of mock data
  - **Enhanced**: Context-aware generation using project history and similar projects

#### AI Service Architecture
- **File**: `src/features/builder/services/builderAiService.ts`
- **Changes**:
  - Replaced mock AI service with real database-connected implementation
  - Uses project context, user history, and similar projects for better recommendations
  - Supports multi-level content generation (topics, abstracts, outlines, chapters)
  - **Enhanced**: Context-aware generation with project-specific information

### 6. Progress Tracking System

#### Database Schema Enhancement
```prisma
model Project {
  // Existing fields...
  
  // Enhanced Progress Tracking
  progressPercentage Int     @default(0) // 0-100
  contentProgress    Json?   // JSON object tracking content generation progress
  documentProgress   Json?   // JSON object tracking document processing
  aiGenerationStatus Json?   // JSON object tracking AI generation status
  timeTracking       Json?   // JSON object tracking time spent on each phase
  milestones         Json?   // JSON object tracking milestone completions
  estimatedCompletion DateTime? // Estimated completion date
  actualCompletion   DateTime? // Actual completion date
}
```

#### Progress Tracking API
- **File**: `src/app/api/projects/[id]/progress/route.ts`
- **Purpose**: Update and retrieve comprehensive project progress
- **Features**: Real-time progress updates, milestone tracking, time tracking
- **Integration**: Works with all content generation endpoints

### 7. Project Assistant Integration

#### Database Schema
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

#### Project Assistant Component
- **File**: `src/features/builder/components/ProjectAssistant.tsx`
- **Purpose**: Context-aware AI assistant for paid users
- **Features**: Full project context, conversation history, content generation assistance
- **Integration**: Linked to specific Project ID with persistent conversations

## Database Schema Integration

The integration works with the enhanced Prisma schema:

```prisma
model Project {
  id          String   @id @default(cuid())
  topic       String
  twist       String?
  abstract    String?
  userId      String?
  
  // Enhanced Progress Tracking
  progressPercentage Int     @default(0) // 0-100
  contentProgress    Json?   // JSON object tracking content generation progress
  documentProgress   Json?   // JSON object tracking document processing
  aiGenerationStatus Json?   // JSON object tracking AI generation status
  timeTracking       Json?   // JSON object tracking time spent on each phase
  milestones         Json?   // JSON object tracking milestone completions
  estimatedCompletion DateTime? // Estimated completion date
  actualCompletion   DateTime? // Actual completion date
  
  // Project Assistant
  conversations ProjectConversation[]
  
  // ... other fields
}

model ChapterOutline {
  id        String   @id @default(cuid())
  projectId String   @unique
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  content   String   // JSON content
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Error Handling

All database operations include proper error handling:

```typescript
try {
    // Database operation
} catch (dbError) {
    console.error('[Operation] Failed to store content:', dbError);
    // Continue with the response even if database storage fails
}
```

This ensures that content generation continues to work even if database storage encounters issues.

## Content Storage Format

### Chapter Outlines
Stored as JSON array of chapter objects:
```json
[
  {
    "title": "Introduction",
    "content": "Background of study, problem statement..."
  },
  {
    "title": "Literature Review", 
    "content": "Analysis of existing systems..."
  }
]
```

### Chapter Content
Stored as JSON object with chapter number keys:
```json
{
  "chapter_1": "# Chapter 1: Introduction\n\nContent here...",
  "chapter_2": "# Chapter 2: Literature Review\n\nContent here..."
}
```

### Progress Tracking
Stored as structured JSON:
```json
{
  "outline": {
    "completed": true,
    "timestamp": "2025-12-29T10:00:00Z"
  },
  "research": {
    "status": "in_progress",
    "timestamp": "2025-12-29T11:00:00Z"
  },
  "writing": {
    "status": "completed",
    "timestamp": "2025-12-29T15:00:00Z"
  }
}
```

## Benefits

1. **Persistent Storage**: Generated content is saved and can be accessed later
2. **User Ownership**: Content is linked to authenticated users
3. **Anonymous Support**: Anonymous users can also have content stored temporarily
4. **Error Resilience**: Content generation continues even if database storage fails
5. **Frontend Integration**: Components automatically fetch and display stored content
6. **Data Relationships**: Proper relationships between projects and their content
7. **Progress Tracking**: Comprehensive tracking of project completion status
8. **Context-Aware AI**: AI services use real project data for better recommendations
9. **Project Assistant**: Persistent, context-aware chat assistant for paid users

## Testing

The integration includes:
- API endpoint testing for content generation and storage
- Frontend component testing for content display
- Database relationship verification
- Error handling validation
- Progress tracking functionality testing
- Project Assistant conversation persistence testing

## Future Enhancements

Potential improvements include:
- Content versioning for multiple iterations
- Content sharing between users
- Advanced search and filtering of stored content
- Content export functionality
- Real-time collaboration features
- Enhanced progress analytics and reporting
- Integration with external document processing services
- Advanced RAG (Retrieval-Augmented Generation) capabilities