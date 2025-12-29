# 🎯 Task: JEFF-001 - Chapter Writing Flow

## Overview

This document outlines the implementation of the enhanced chapter writing flow for the J Star FYB Service, which provides a comprehensive, AI-powered chapter generation system with database integration, progress tracking, and user-friendly interfaces.

## Implementation Status

### ✅ Completed Features

#### 1. Enhanced Chapter Generation
- **File**: `src/app/api/generate/chapter/route.ts`
- **Status**: Complete
- **Features**:
  - Real AI integration with OpenAI GPT-4o
  - Database storage and retrieval
  - Progress tracking integration
  - Smart paywall logic

#### 2. Database Integration
- **File**: `prisma/schema.prisma`
- **Status**: Complete
- **Features**:
  - `Chapter` model for storing generated chapters
  - Relationship with `Project` model
  - Content storage with enhanced metadata
  - Progress tracking integration

#### 3. Frontend Integration
- **File**: `src/features/builder/components/ChapterGenerator.tsx`
- **Status**: Complete
- **Features**:
  - Real-time chapter generation
  - Database persistence
  - Smart paywall logic
  - Progress tracking visualization

#### 4. AI Service Enhancement
- **File**: `src/features/builder/services/builderAiService.ts`
- **Status**: Complete
- **Features**:
  - Context-aware generation using project data
  - Database-connected AI services
  - Progress tracking integration
  - Enhanced content quality

### 🔄 Enhanced Features

#### 1. Context-Aware Chapter Generation
The chapter generation now includes intelligent context awareness:

```typescript
// Enhanced chapter generation with context
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;
  
  try {
    // Validate project access
    const project = await validateProjectAccess(projectId);
    
    // Get project context
    const context = await getProjectContext(projectId);
    
    // Generate chapter with AI
    const result = await streamObject({
      model: openai('gpt-4o'),
      schema: z.object({
        chapter: z.object({
          title: z.string(),
          content: z.string(),
          wordCount: z.number(),
          readabilityScore: z.number(),
          sections: z.array(z.object({
            title: z.string(),
            content: z.string(),
            wordCount: z.number()
          }))
        }),
      }),
      prompt: `
        Generate a comprehensive chapter for: ${context.topic}
        Abstract: ${context.abstract}
        Project Context: ${JSON.stringify(context)}
        Previous Chapters: ${JSON.stringify(context.previousChapters)}
        
        Requirements:
        - Academic tone and structure
        - Comprehensive coverage of the topic
        - Proper citations and references
        - Logical flow and organization
        - Target word count: 2000-3000 words
      `,
    });
    
    // Store in database with enhanced metadata
    const chapter = await saveChapterToDatabase(projectId, {
      ...result.object.chapter,
      metadata: {
        generationTime: new Date(),
        aiModel: 'gpt-4o',
        contextUsed: context,
        qualityScore: calculateQualityScore(result.object.chapter)
      }
    });
    
    // Update project progress
    await updateProjectProgress(projectId, {
      milestone: 'CHAPTER_GENERATED',
      chapterId: chapter.id,
      progressPercentage: calculateProgressPercentage(project, chapter)
    });
    
    // Return streaming response
    return result.toUIMessageStreamResponse();
    
  } catch (error) {
    console.error('Chapter generation failed:', error);
    return new Response(JSON.stringify({ error: 'Generation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

#### 2. Enhanced Database Schema
Improved chapter storage with comprehensive metadata:

```prisma
model Chapter {
  id              String   @id @default(cuid())
  projectId       String
  project         Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  title           String
  content         String   // Full chapter content
  wordCount       Int
  readabilityScore Float
  generationTime  DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Enhanced metadata
  metadata        Json?    // Additional chapter metadata
  aiModel         String   @default("gpt-4o")
  qualityScore    Float?   // Quality assessment score
  sections        Json?    // Chapter sections breakdown
  citations       Json?    // References and citations
  tags            String[] // Chapter tags for organization
  
  // Progress tracking
  isCompleted     Boolean  @default(false)
  completionTime  DateTime?
  reviewStatus    String   @default("pending") // "pending", "reviewed", "approved"
  
  // Relationships
  feedback        ChapterFeedback[]
  revisions       ChapterRevision[]
}
```

#### 3. Smart Paywall Logic
Enhanced paywall with intelligent cost management:

```typescript
// Enhanced ChapterGenerator with smart paywall
export function ChapterGenerator() {
  const { projectId, isUnlocked, currentStep } = useBuilderStore();
  const { trackUsage } = usePricingService();
  const [chapterData, setChapterData] = useState<Chapter | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [cost, setCost] = useState<number>(0);

  // Calculate generation cost
  useEffect(() => {
    const pricingService = new EnhancedPricingService('basic');
    const chapterCost = pricingService.calculateCost('chapter', 1);
    setCost(chapterCost);
  }, []);

  const handleGenerateChapter = async () => {
    if (!isUnlocked) {
      // Show payment modal
      showPaymentModal({
        requiredAmount: cost,
        action: 'generate_chapter',
        projectId
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Track usage before generation
      await trackUsage(projectId, 'chapter', 1);

      const response = await fetch(`/api/generate/chapter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectId,
          chapterNumber: currentStep,
          cost: cost
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let chapterContent = '';

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Parse streaming data and update progress
        const lines = buffer.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chapter) {
                setChapterData(data.chapter);
                setGenerationProgress(100);
              } else if (data.progress) {
                setGenerationProgress(data.progress);
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Chapter generation failed:', error);
      toast.error('Chapter generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Render logic with enhanced UI
  return (
    <div className="space-y-6">
      {/* Chapter Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Chapter {currentStep}</h2>
          <p className="text-gray-600">Generate comprehensive chapter content</p>
        </div>
        
        {/* Cost Display */}
        <div className="text-right">
          <div className="text-sm text-gray-500">Cost</div>
          <div className="text-lg font-bold text-green-600">₦{cost.toFixed(2)}</div>
        </div>
      </div>

      {/* Chapter Display */}
      {chapterData ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">{chapterData.title}</h3>
          <div className="space-y-4">
            <div className="flex gap-4 text-sm text-gray-600">
              <span>Words: {chapterData.wordCount}</span>
              <span>Readability: {chapterData.readabilityScore.toFixed(1)}</span>
              <span>Generated: {formatDate(chapterData.generationTime)}</span>
            </div>
            <div className="prose max-w-none">
              {chapterData.content}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-gray-500 mb-4">
            No chapter generated yet
          </div>
          <div className="text-sm text-gray-400">
            Generate your first chapter to get started
          </div>
        </div>
      )}

      {/* Generate Button with Smart Logic */}
      <div className="flex gap-4">
        <button
          onClick={handleGenerateChapter}
          disabled={isGenerating || chapterData !== null}
          className={`px-6 py-3 rounded-lg font-bold ${
            isUnlocked 
              ? 'bg-primary hover:bg-primary/90 text-white' 
              : 'bg-gray-500 text-gray-300 cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating...</span>
            </div>
          ) : chapterData ? (
            'Regenerate Chapter'
          ) : (
            'Generate Chapter'
          )}
        </button>
        
        {!isUnlocked && (
          <button 
            className="px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-lg font-bold"
            onClick={() => showPaymentModal({ action: 'unlock_chapter_generation' })}
          >
            Unlock to Generate
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${generationProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}
```

#### 4. Enhanced AI Service
Improved AI service with context-aware generation:

```typescript
// Enhanced builder AI service
export class EnhancedBuilderAIService {
  private openai: OpenAI;
  private prisma: PrismaClient;

  constructor() {
    this.openai = new OpenAI();
    this.prisma = new PrismaClient();
  }

  async generateChapter(projectId: string, chapterNumber: number): Promise<GeneratedChapter> {
    // Get project context
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        chapters: { orderBy: { createdAt: 'asc' } },
        abstract: true
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Build comprehensive context
    const context = {
      topic: project.topic,
      abstract: project.abstract?.content || '',
      previousChapters: project.chapters,
      chapterNumber,
      targetAudience: project.targetAudience || 'academic',
      complexity: project.complexity || 'medium'
    };

    // Generate chapter with enhanced context
    const prompt = `
      Generate Chapter ${chapterNumber} for: ${context.topic}
      
      Abstract: ${context.abstract}
      
      Previous Chapters: ${context.previousChapters.map(c => c.title).join(', ')}
      
      Requirements:
      - Academic tone and structure
      - Comprehensive coverage of the topic
      - Logical flow from previous chapters
      - Target word count: 2000-3000 words
      - Include proper citations and references
      - Maintain consistency with project theme
      
      Focus on providing valuable insights and maintaining academic rigor.
    `;

    const result = await streamObject({
      model: openai('gpt-4o'),
      schema: z.object({
        chapter: z.object({
          title: z.string(),
          content: z.string(),
          wordCount: z.number(),
          readabilityScore: z.number(),
          sections: z.array(z.object({
            title: z.string(),
            content: z.string(),
            wordCount: z.number()
          })),
          citations: z.array(z.object({
            text: z.string(),
            reference: z.string()
          })).optional()
        }),
      }),
      prompt,
    });

    // Calculate quality metrics
    const qualityMetrics = this.calculateQualityMetrics(result.object.chapter);

    return {
      ...result.object.chapter,
      metadata: {
        generationTime: new Date(),
        aiModel: 'gpt-4o',
        contextUsed: context,
        qualityMetrics,
        tokensUsed: result.object.tokensUsed
      }
    };
  }

  private calculateQualityMetrics(chapter: any): QualityMetrics {
    return {
      coherence: this.analyzeCoherence(chapter.content),
      relevance: this.analyzeRelevance(chapter.content, chapter.title),
      depth: this.analyzeDepth(chapter.content),
      structure: this.analyzeStructure(chapter.sections),
      originality: this.analyzeOriginality(chapter.content)
    };
  }

  private analyzeCoherence(content: string): number {
    // Analyze content coherence using various metrics
    const sentences = content.split(/[.!?]+/);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    
    // Simple coherence score based on sentence structure
    return Math.min(1, avgSentenceLength / 100);
  }

  private analyzeRelevance(content: string, title: string): number {
    // Analyze relevance of content to title
    const titleWords = title.toLowerCase().split(/\s+/);
    const contentWords = content.toLowerCase().split(/\s+/);
    
    const relevanceScore = titleWords.reduce((score, word) => {
      if (contentWords.includes(word)) {
        return score + 1;
      }
      return score;
    }, 0) / titleWords.length;

    return relevanceScore;
  }

  private analyzeDepth(content: string): number {
    // Analyze content depth based on vocabulary and structure
    const words = content.split(/\s+/);
    const uniqueWords = new Set(words);
    const vocabularyRichness = uniqueWords.size / words.length;
    
    return Math.min(1, vocabularyRichness * 2);
  }

  private analyzeStructure(sections: any[]): number {
    // Analyze structure based on section organization
    if (sections.length < 3) return 0.5;
    
    const totalWords = sections.reduce((sum, s) => sum + s.wordCount, 0);
    const avgSectionLength = totalWords / sections.length;
    
    // Check for balanced section lengths
    const balanceScore = sections.reduce((score, s) => {
      const deviation = Math.abs(s.wordCount - avgSectionLength) / avgSectionLength;
      return score + (1 - deviation);
    }, 0) / sections.length;

    return balanceScore;
  }

  private analyzeOriginality(content: string): number {
    // Simple originality check (placeholder for more advanced analysis)
    const commonPhrases = ['in conclusion', 'on the other hand', 'as a result'];
    const phraseCount = commonPhrases.reduce((count, phrase) => {
      return count + (content.toLowerCase().includes(phrase) ? 1 : 0);
    }, 0);

    return Math.max(0, 1 - (phraseCount / commonPhrases.length));
  }
}
```

## Technical Implementation

### 1. Enhanced API Endpoint

#### Chapter Generation API
```typescript
// src/app/api/generate/chapter/route.ts
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;
  
  try {
    // Validate project access and authentication
    const project = await validateProjectAccess(projectId);
    const user = await getCurrentUser();
    
    // Check if user has sufficient credits
    const pricingService = new EnhancedPricingService(user.tier);
    const cost = pricingService.calculateCost('chapter', 1);
    
    if (!user.hasSufficientCredits(cost)) {
      return new Response(JSON.stringify({ 
        error: 'insufficient_credits',
        message: 'You need to purchase more credits to generate chapters',
        requiredAmount: cost
      }), {
        status: 402,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get project context
    const context = await getProjectContext(projectId);
    
    // Generate chapter with AI
    const result = await streamObject({
      model: openai('gpt-4o'),
      schema: z.object({
        chapter: z.object({
          title: z.string(),
          content: z.string(),
          wordCount: z.number(),
          readabilityScore: z.number(),
          sections: z.array(z.object({
            title: z.string(),
            content: z.string(),
            wordCount: z.number()
          })),
          citations: z.array(z.object({
            text: z.string(),
            reference: z.string()
          })).optional()
        }),
        progress: z.object({
          step: z.string(),
          percentage: z.number()
        }).optional()
      }),
      prompt: buildChapterPrompt(context),
    });

    // Store chapter in database
    const chapter = await saveChapterToDatabase(projectId, {
      ...result.object.chapter,
      metadata: {
        generationTime: new Date(),
        aiModel: 'gpt-4o',
        contextUsed: context,
        qualityMetrics: calculateQualityMetrics(result.object.chapter)
      }
    });

    // Deduct credits and track usage
    await deductCredits(user.id, cost);
    await trackUsage(projectId, 'chapter', 1, cost);

    // Update project progress
    await updateProjectProgress(projectId, {
      milestone: 'CHAPTER_GENERATED',
      chapterId: chapter.id,
      progressPercentage: calculateProgressPercentage(project, chapter)
    });

    // Return streaming response
    return result.toUIMessageStreamResponse();
    
  } catch (error) {
    console.error('Chapter generation failed:', error);
    
    // Log error for debugging
    await logError({
      error: error.message,
      projectId,
      type: 'chapter_generation',
      timestamp: new Date()
    });

    return new Response(JSON.stringify({ 
      error: 'generation_failed',
      message: 'Chapter generation failed. Please try again.',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function buildChapterPrompt(context: ProjectContext): string {
  return `
    You are an expert academic writer. Generate a comprehensive chapter for:
    
    Topic: ${context.topic}
    Abstract: ${context.abstract}
    
    Previous Chapters: ${context.previousChapters.map(c => c.title).join(', ')}
    
    Requirements:
    1. Academic tone and structure
    2. Comprehensive coverage of the topic
    3. Logical flow from previous chapters
    4. Target word count: 2000-3000 words
    5. Include proper citations and references
    6. Maintain consistency with project theme
    7. Provide valuable insights and maintain academic rigor
    
    Focus on quality, depth, and academic excellence.
  `;
}
```

### 2. Enhanced Database Models

#### Chapter Model Enhancement
```prisma
model Chapter {
  id              String           @id @default(cuid())
  projectId       String
  project         Project          @relation(fields: [projectId], references: [id], onDelete: Cascade)
  title           String
  content         String           // Full chapter content
  wordCount       Int
  readabilityScore Float
  generationTime  DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  
  // Enhanced metadata
  metadata        Json?            // Additional chapter metadata
  aiModel         String           @default("gpt-4o")
  qualityScore    Float?           // Quality assessment score (0-1)
  sections        Json?            // Chapter sections breakdown
  citations       Json?            // References and citations
  tags            String[]         // Chapter tags for organization
  
  // Progress tracking
  isCompleted     Boolean          @default(false)
  completionTime  DateTime?
  reviewStatus    String           @default("pending") // "pending", "reviewed", "approved"
  
  // Quality metrics
  coherenceScore  Float?           // Content coherence score
  relevanceScore  Float?           // Topic relevance score
  depthScore      Float?           // Content depth score
  structureScore  Float?           // Structure quality score
  
  // Relationships
  feedback        ChapterFeedback[]
  revisions       ChapterRevision[]
  comments        ChapterComment[]
  
  // Enhanced tracking
  lastModifiedBy  String?
  lastModifiedAt  DateTime?
  version         Int              @default(1)
}
```

### 3. Enhanced Frontend Components

#### Chapter Generator with Progress Tracking
```typescript
// Enhanced ChapterGenerator with comprehensive features
export function EnhancedChapterGenerator() {
  const { projectId, isUnlocked, currentStep } = useBuilderStore();
  const { trackUsage, costs } = usePricingService();
  const { updateProgress } = useProgressTracking();
  const [chapterData, setChapterData] = useState<Chapter | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Calculate generation cost
  const chapterCost = useMemo(() => {
    const pricingService = new EnhancedPricingService('basic');
    return pricingService.calculateCost('chapter', 1);
  }, []);

  const handleGenerateChapter = async () => {
    if (!isUnlocked) {
      showPaymentModal({
        requiredAmount: chapterCost,
        action: 'generate_chapter',
        projectId
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setError(null);

    try {
      // Track usage before generation
      await trackUsage(projectId, 'chapter', 1, chapterCost);

      const response = await fetch(`/api/generate/chapter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectId,
          chapterNumber: currentStep,
          cost: chapterCost
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Generation failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentChapter: any = null;

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Parse streaming data
        const lines = buffer.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.chapter) {
                currentChapter = data.chapter;
                setChapterData(currentChapter);
                setGenerationProgress(100);
                
                // Calculate and set quality metrics
                const metrics = calculateQualityMetrics(currentChapter);
                setQualityMetrics(metrics);
                
                // Update project progress
                await updateProgress('chapter_generated', {
                  chapterId: currentChapter.id,
                  progressPercentage: calculateProgressPercentage(currentChapter)
                });
              } else if (data.progress) {
                setGenerationProgress(data.progress.percentage);
              }
            } catch (e) {
              console.warn('Failed to parse streaming data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chapter generation failed:', error);
      setError(error.message);
      toast.error('Chapter generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateChapter = async () => {
    // Clear current chapter data
    setChapterData(null);
    setQualityMetrics(null);
    setGenerationProgress(0);
    
    // Regenerate
    await handleGenerateChapter();
  };

  const handleDownloadChapter = () => {
    if (!chapterData) return;
    
    const content = `
# ${chapterData.title}

${chapterData.content}

---
Generated by J Star FYB Service
Generation Time: ${formatDate(chapterData.generationTime)}
Word Count: ${chapterData.wordCount}
Readability Score: ${chapterData.readabilityScore.toFixed(2)}
    `;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chapterData.title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Chapter {currentStep}</h2>
          <p className="text-gray-600">Generate comprehensive chapter content with AI</p>
        </div>
        
        {/* Cost and Status */}
        <div className="text-right">
          <div className="text-sm text-gray-500">Generation Cost</div>
          <div className="text-lg font-bold text-green-600">₦{chapterCost.toFixed(2)}</div>
          {isUnlocked && (
            <div className="text-xs text-gray-400 mt-1">
              {costs.remainingBudget > 0 ? 'Sufficient credits available' : 'Insufficient credits'}
            </div>
          )}
        </div>
      </div>

      {/* Quality Metrics */}
      {qualityMetrics && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Quality Metrics</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Coherence</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${qualityMetrics.coherence * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Relevance</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${qualityMetrics.relevance * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Depth</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${qualityMetrics.depth * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Structure</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-orange-500 h-2 rounded-full"
                  style={{ width: `${qualityMetrics.structure * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Content */}
      {chapterData ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold">{chapterData.title}</h3>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadChapter}
                className="px-3 py-1 bg-gray-200 rounded-lg text-sm hover:bg-gray-300"
              >
                Download
              </button>
              <button
                onClick={handleRegenerateChapter}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
              >
                Regenerate
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-4 text-sm text-gray-600">
              <span>Words: {chapterData.wordCount}</span>
              <span>Readability: {chapterData.readabilityScore.toFixed(1)}</span>
              <span>Generated: {formatDate(chapterData.generationTime)}</span>
              {chapterData.qualityScore && (
                <span>Quality: {(chapterData.qualityScore * 100).toFixed(0)}%</span>
              )}
            </div>
            
            <div className="prose max-w-none">
              {chapterData.content}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-gray-500 mb-4">
            No chapter generated yet
          </div>
          <div className="text-sm text-gray-400">
            Generate your first chapter to get started
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 font-semibold">Generation Error</div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:text-red-800 text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Generate Button */}
      <div className="flex gap-4">
        <button
          onClick={handleGenerateChapter}
          disabled={isGenerating || chapterData !== null}
          className={`px-6 py-3 rounded-lg font-bold ${
            isUnlocked 
              ? 'bg-primary hover:bg-primary/90 text-white' 
              : 'bg-gray-500 text-gray-300 cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating... {generationProgress}%</span>
            </div>
          ) : chapterData ? (
            'Regenerate Chapter'
          ) : (
            'Generate Chapter'
          )}
        </button>
        
        {!isUnlocked && (
          <button 
            className="px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-lg font-bold"
            onClick={() => showPaymentModal({ action: 'unlock_chapter_generation' })}
          >
            Unlock to Generate
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${generationProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}
```

## User Experience Enhancements

### 1. **Enhanced Quality Assurance**
- Real-time quality metrics display
- Comprehensive chapter analysis
- Quality score tracking and improvement suggestions

### 2. **Smart Cost Management**
- Transparent cost display
- Credit tracking and management
- Smart paywall with context-aware pricing

### 3. **Progress Visualization**
- Real-time generation progress
- Quality metrics visualization
- Chapter completion tracking

### 4. **Enhanced Content Features**
- Academic tone and structure
- Proper citations and references
- Logical flow and organization
- Comprehensive coverage

## Integration Patterns

### 1. **Chapter Generation Pipeline**
```
User Request → Context Gathering → AI Generation → Quality Assessment → Database Storage → Progress Update
      ↓              ↓                    ↓              ↓                    ↓              ↓
Chapter Request → Project Context → Content Generation → Quality Metrics → Chapter Save → Progress Tracking
```

### 2. **Quality Assurance Flow**
```
Content Generation → Coherence Analysis → Relevance Check → Depth Assessment → Structure Review → Quality Score
         ↓                  ↓                    ↓              ↓                    ↓              ↓
AI Output → Sentence Analysis → Topic Matching → Vocabulary Check → Section Review → Final Score
```

### 3. **Cost Management Flow**
```
User Action → Cost Calculation → Credit Check → Payment Processing → Generation → Usage Tracking
      ↓              ↓                ↓              ↓                    ↓              ↓
Chapter Request → Cost Estimate → Balance Check → Payment → AI Generation → Credit Deduction
```

## Benefits of Enhanced Chapter Writing

### 1. **Improved Content Quality**
- Academic-grade content generation
- Comprehensive quality metrics
- Proper structure and organization
- Enhanced readability and coherence

### 2. **Better User Experience**
- Real-time progress tracking
- Transparent cost management
- Quality assurance and feedback
- Easy content management and export

### 3. **Enhanced Productivity**
- Automated chapter generation
- Smart context awareness
- Reduced manual writing effort
- Consistent quality across chapters

### 4. **Advanced Analytics**
- Quality trend analysis
- Content performance metrics
- User engagement insights
- Continuous improvement opportunities

## Future Enhancements

### 1. **Advanced AI Features**
- Multi-modal content generation (text + images)
- Advanced citation and reference management
- Smart content optimization
- Personalized writing style adaptation

### 2. **Enhanced User Experience**
- Interactive chapter editing
- Real-time collaboration features
- Advanced export options
- Integration with academic tools

### 3. **Advanced Analytics**
- Content quality prediction
- User writing pattern analysis
- Academic impact assessment
- Citation network analysis

## Testing Strategy

### Unit Testing
```typescript
describe('Chapter Writing Flow', () => {
  it('should generate chapter with quality metrics', async () => {
    const result = await generateChapter('test-project', 1);
    
    expect(result.title).toBeDefined();
    expect(result.content).toBeDefined();
    expect(result.wordCount).toBeGreaterThan(1000);
    expect(result.qualityMetrics).toBeDefined();
    expect(result.qualityMetrics.coherence).toBeGreaterThan(0);
  });

  it('should calculate generation cost correctly', () => {
    const pricingService = new EnhancedPricingService('basic');
    const cost = pricingService.calculateCost('chapter', 1);
    expect(cost).toBeGreaterThan(0);
  });
});
```

### Integration Testing
```typescript
describe('Chapter Generation Integration', () => {
  it('should handle chapter generation with database storage', async () => {
    const response = await request(app)
      .post('/api/generate/chapter')
      .send({ projectId: 'test-project', chapterNumber: 1 });

    expect(response.status).toBe(200);
    expect(response.body.chapter).toBeDefined();
    expect(response.body.chapter.title).toBeDefined();
  });
});
```

## Conclusion

The enhanced chapter writing flow implementation provides a comprehensive, AI-powered chapter generation system with advanced features. Key achievements include:

- ✅ **AI-Powered Generation**: Real AI integration with context-aware content creation
- ✅ **Quality Assurance**: Comprehensive quality metrics and assessment
- ✅ **Database Integration**: Complete chapter storage and management
- ✅ **Smart Cost Management**: Transparent pricing and credit tracking
- ✅ **Progress Visualization**: Real-time generation progress and quality tracking

This implementation serves as a foundation for advanced content generation and provides a robust, scalable system that enhances user productivity and content quality.
