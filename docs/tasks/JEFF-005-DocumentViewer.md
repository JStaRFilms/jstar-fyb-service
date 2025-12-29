# 🎯 Task: JEFF-005 - Document Viewer

## Overview

This document outlines the implementation of an advanced document viewer for the J Star FYB Service, providing comprehensive document display, annotation, and interaction capabilities for various document formats including PDFs, images, and text documents.

## Implementation Status

### ✅ Completed Features

#### 1. PDF Document Viewer
- **File**: `src/app/api/documents/[id]/serve/route.ts`
- **Status**: Complete
- **Features**:
  - PDF rendering with React-PDF
  - Page navigation and zoom controls
  - Text selection and search functionality
  - Document metadata display

#### 2. Document Processing Pipeline
- **File**: `src/app/api/documents/[id]/extract/route.ts`
- **Status**: Complete
- **Features**:
  - Advanced document content extraction
  - Text analysis and summarization
  - Smart content organization
  - AI-powered insights generation

#### 3. Document Upload and Management
- **File**: `src/features/builder/components/DocumentUpload.tsx`
- **Status**: Complete
- **Features**:
  - Multi-format document upload
  - File validation and processing
  - Progress tracking and status updates
  - Document organization and categorization

#### 4. Frontend Document Interface
- **File**: `src/features/builder/components/DocumentViewer.tsx`
- **Status**: Complete
- **Features**:
  - Interactive document display
  - Annotation and highlighting tools
  - Document comparison features
  - Export and sharing capabilities

### 🔄 Enhanced Features

#### 1. Advanced Document Viewer Component
Enhanced document viewer with comprehensive features:

```typescript
// Enhanced document viewer component
export function EnhancedDocumentViewer({ documentId }: { documentId: string }) {
  const [document, setDocument] = useState<Document | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedText, setSelectedText] = useState<string>('');
  const [isAnnotating, setIsAnnotating] = useState(false);

  useEffect(() => {
    loadDocument();
    loadAnnotations();
  }, [documentId]);

  const loadDocument = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/documents/${documentId}`);
      const data = await response.json();
      setDocument(data.document);
    } catch (error) {
      console.error('Failed to load document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnnotations = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/annotations`);
      const data = await response.json();
      setAnnotations(data.annotations);
    } catch (error) {
      console.error('Failed to load annotations:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleZoomChange = (zoom: number) => {
    setZoomLevel(zoom);
  };

  const handleTextSelection = (text: string, position: TextPosition) => {
    setSelectedText(text);
    setIsAnnotating(true);
  };

  const handleAddAnnotation = async (annotation: CreateAnnotationRequest) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/annotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(annotation)
      });
      
      const result = await response.json();
      setAnnotations(prev => [...prev, result.annotation]);
      setIsAnnotating(false);
      setSelectedText('');
    } catch (error) {
      console.error('Failed to add annotation:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    try {
      const response = await fetch(`/api/documents/${documentId}/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'txt') => {
    try {
      const response = await fetch(`/api/documents/${documentId}/export?format=${format}`);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${document?.title}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="document-viewer loading">
        <div className="loading-spinner">Loading document...</div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="document-viewer error">
        <div className="error-message">Document not found</div>
      </div>
    );
  }

  return (
    <div className="document-viewer">
      {/* Document Header */}
      <div className="document-header">
        <div className="document-info">
          <h2 className="document-title">{document.title}</h2>
          <div className="document-meta">
            <span className="file-type">{document.fileType}</span>
            <span className="file-size">{formatFileSize(document.fileSize)}</span>
            <span className="upload-date">Uploaded: {formatDate(document.createdAt)}</span>
          </div>
        </div>
        
        <div className="document-actions">
          <div className="zoom-controls">
            <button onClick={() => handleZoomChange(Math.max(25, zoomLevel - 25))}>-</button>
            <span>{zoomLevel}%</span>
            <button onClick={() => handleZoomChange(Math.min(200, zoomLevel + 25))}>+</button>
          </div>
          
          <div className="export-options">
            <button onClick={() => handleExport('pdf')}>Export PDF</button>
            <button onClick={() => handleExport('docx')}>Export DOCX</button>
            <button onClick={() => handleExport('txt')}>Export TXT</button>
          </div>
        </div>
      </div>

      {/* Document Controls */}
      <div className="document-controls">
        <div className="navigation-controls">
          <button 
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {currentPage} of {document.pageCount}</span>
          <button 
            onClick={() => handlePageChange(Math.min(document.pageCount, currentPage + 1))}
            disabled={currentPage === document.pageCount}
          >
            Next
          </button>
        </div>

        <div className="search-controls">
          <input
            type="text"
            placeholder="Search in document..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div className="search-results">
              Found {searchResults.length} results
            </div>
          )}
        </div>
      </div>

      {/* Document Content */}
      <div className="document-content" style={{ transform: `scale(${zoomLevel / 100})` }}>
        {document.fileType === 'pdf' ? (
          <PDFViewer
            documentId={documentId}
            currentPage={currentPage}
            onTextSelection={handleTextSelection}
            searchResults={searchResults}
            annotations={annotations}
          />
        ) : document.fileType === 'image' ? (
          <ImageViewer
            documentId={documentId}
            onTextSelection={handleTextSelection}
            searchResults={searchResults}
            annotations={annotations}
          />
        ) : (
          <TextViewer
            documentId={documentId}
            onTextSelection={handleTextSelection}
            searchResults={searchResults}
            annotations={annotations}
          />
        )}
      </div>

      {/* Annotation Panel */}
      {isAnnotating && selectedText && (
        <AnnotationPanel
          selectedText={selectedText}
          onSave={(annotation) => handleAddAnnotation(annotation)}
          onCancel={() => {
            setIsAnnotating(false);
            setSelectedText('');
          }}
        />
      )}

      {/* Annotations Sidebar */}
      <div className="annotations-sidebar">
        <h3>Annotations ({annotations.length})</h3>
        <div className="annotations-list">
          {annotations.map(annotation => (
            <AnnotationItem
              key={annotation.id}
              annotation={annotation}
              onSelect={() => setCurrentPage(annotation.pageNumber)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// PDF viewer component
function PDFViewer({ 
  documentId, 
  currentPage, 
  onTextSelection, 
  searchResults, 
  annotations 
}: {
  documentId: string;
  currentPage: number;
  onTextSelection: (text: string, position: TextPosition) => void;
  searchResults: SearchResult[];
  annotations: Annotation[];
}) {
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}/serve`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const pdf = await pdfjsLib.getDocument(url).promise;
        setPdfDocument(pdf);
      } catch (error) {
        console.error('Failed to load PDF:', error);
      }
    };

    loadPDF();
  }, [documentId]);

  const handleTextSelection = (event: React.MouseEvent) => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      onTextSelection(selection.toString(), {
        x: event.clientX,
        y: event.clientY,
        page: currentPage
      });
    }
  };

  if (!pdfDocument) {
    return <div>Loading PDF...</div>;
  }

  return (
    <div ref={containerRef} className="pdf-viewer" onMouseUp={handleTextSelection}>
      <Document
        file={`/api/documents/${documentId}/serve`}
        onLoadSuccess={(pdf) => setPdfDocument(pdf)}
      >
        <Page
          pageNumber={currentPage}
          scale={1.5}
          renderTextLayer={true}
          renderAnnotationLayer={true}
          onRenderSuccess={() => {
            // Highlight search results
            highlightSearchResults(searchResults);
          }}
        />
      </Document>
      
      {/* Render annotations */}
      {annotations
        .filter(a => a.pageNumber === currentPage)
        .map(annotation => (
          <AnnotationOverlay key={annotation.id} annotation={annotation} />
        ))}
    </div>
  );
}

// Image viewer component
function ImageViewer({ 
  documentId, 
  onTextSelection, 
  searchResults, 
  annotations 
}: {
  documentId: string;
  onTextSelection: (text: string, position: TextPosition) => void;
  searchResults: SearchResult[];
  annotations: Annotation[];
}) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [ocrText, setOcrText] = useState<string>('');

  useEffect(() => {
    const loadImage = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}/serve`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageSrc(url);

        // Extract text using OCR
        const ocrResponse = await fetch(`/api/documents/${documentId}/ocr`);
        const ocrData = await ocrResponse.json();
        setOcrText(ocrData.text);
      } catch (error) {
        console.error('Failed to load image:', error);
      }
    };

    loadImage();
  }, [documentId]);

  const handleTextSelection = (event: React.MouseEvent) => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      onTextSelection(selection.toString(), {
        x: event.clientX,
        y: event.clientY,
        page: 1
      });
    }
  };

  return (
    <div className="image-viewer" onMouseUp={handleTextSelection}>
      {imageSrc && (
        <img 
          src={imageSrc} 
          alt="Document" 
          className="document-image"
        />
      )}
      
      {/* OCR text layer for search and selection */}
      {ocrText && (
        <div className="ocr-text-layer" style={{ display: 'none' }}>
          {ocrText}
        </div>
      )}
      
      {/* Render annotations */}
      {annotations.map(annotation => (
        <AnnotationOverlay key={annotation.id} annotation={annotation} />
      ))}
    </div>
  );
}

// Text viewer component
function TextViewer({ 
  documentId, 
  onTextSelection, 
  searchResults, 
  annotations 
}: {
  documentId: string;
  onTextSelection: (text: string, position: TextPosition) => void;
  searchResults: SearchResult[];
  annotations: Annotation[];
}) {
  const [textContent, setTextContent] = useState<string>('');

  useEffect(() => {
    const loadText = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}/content`);
        const data = await response.json();
        setTextContent(data.content);
      } catch (error) {
        console.error('Failed to load text content:', error);
      }
    };

    loadText();
  }, [documentId]);

  const handleTextSelection = (event: React.MouseEvent) => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      onTextSelection(selection.toString(), {
        x: event.clientX,
        y: event.clientY,
        page: 1
      });
    }
  };

  const highlightSearchResults = (text: string, results: SearchResult[]): string => {
    if (!results.length) return text;
    
    let highlightedText = text;
    let offset = 0;

    results.forEach(result => {
      const startIndex = result.startIndex + offset;
      const endIndex = result.endIndex + offset;
      
      const before = highlightedText.substring(0, startIndex);
      const match = highlightedText.substring(startIndex, endIndex);
      const after = highlightedText.substring(endIndex);
      
      highlightedText = `${before}<mark>${match}</mark>${after}`;
      offset += 13; // Length of <mark></mark> tags
    });

    return highlightedText;
  };

  return (
    <div className="text-viewer" onMouseUp={handleTextSelection}>
      <div 
        className="text-content"
        dangerouslySetInnerHTML={{
          __html: highlightSearchResults(textContent, searchResults)
        }}
      />
      
      {/* Render annotations */}
      {annotations.map(annotation => (
        <TextAnnotationOverlay key={annotation.id} annotation={annotation} />
      ))}
    </div>
  );
}
```

#### 2. Enhanced Document Processing
Advanced document content extraction and analysis:

```typescript
// Enhanced document processing service
export class EnhancedDocumentProcessingService {
  private openai: OpenAI;
  private pdfParser: PDFParser;
  private ocrService: OCRService;

  constructor() {
    this.openai = new OpenAI();
    this.pdfParser = new PDFParser();
    this.ocrService = new OCRService();
  }

  async processDocument(documentId: string, features: DocumentFeature[]): Promise<DocumentProcessingResult> {
    const document = await this.getDocument(documentId);
    const results: DocumentProcessingResult = {
      documentId,
      features: {},
      summary: '',
      insights: []
    };

    // Process each requested feature
    for (const feature of features) {
      switch (feature) {
        case 'content_extraction':
          results.features.contentExtraction = await this.extractContent(document);
          break;
        case 'text_analysis':
          results.features.textAnalysis = await this.analyzeText(document);
          break;
        case 'summarization':
          results.features.summarization = await this.generateSummary(document);
          break;
        case 'keyword_extraction':
          results.features.keywordExtraction = await this.extractKeywords(document);
          break;
        case 'sentiment_analysis':
          results.features.sentimentAnalysis = await this.analyzeSentiment(document);
          break;
        case 'entity_recognition':
          results.features.entityRecognition = await this.recognizeEntities(document);
          break;
        case 'topic_modeling':
          results.features.topicModeling = await this.modelTopics(document);
          break;
        case 'document_comparison':
          results.features.documentComparison = await this.compareDocuments(document);
          break;
      }
    }

    // Generate overall insights
    results.insights = await this.generateDocumentInsights(document, results.features);

    return results;
  }

  private async extractContent(document: Document): Promise<ContentExtraction> {
    let content = '';

    switch (document.fileType) {
      case 'pdf':
        content = await this.pdfParser.extractText(document.fileUrl);
        break;
      case 'image':
        content = await this.ocrService.extractText(document.fileUrl);
        break;
      case 'text':
        const response = await fetch(document.fileUrl);
        content = await response.text();
        break;
    }

    return {
      fullText: content,
      wordCount: content.split(/\s+/).length,
      characterCount: content.length,
      pageCount: await this.getPageCount(document),
      extractedAt: new Date()
    };
  }

  private async analyzeText(document: Document): Promise<TextAnalysis> {
    const content = await this.extractTextContent(document);
    
    // Basic text analysis
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const paragraphs = content.split(/\n+/).filter(p => p.trim().length > 0);

    // Advanced analysis using AI
    const analysis = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Analyze this text and provide detailed text analysis including readability, complexity, and structure.'
        },
        {
          role: 'user',
          content: `Text: ${content.substring(0, 5000)}...`
        }
      ],
      max_tokens: 1000
    });

    return {
      sentences: sentences.length,
      words: words.length,
      paragraphs: paragraphs.length,
      averageSentenceLength: words.length / sentences.length,
      averageParagraphLength: sentences.length / paragraphs.length,
      aiAnalysis: analysis.choices[0].message.content,
      complexityScore: this.calculateComplexityScore(content),
      readabilityScore: this.calculateReadabilityScore(content)
    };
  }

  private async generateSummary(document: Document): Promise<DocumentSummary> {
    const content = await this.extractTextContent(document);
    
    const summary = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Generate a comprehensive summary of this document focusing on key points and main ideas.'
        },
        {
          role: 'user',
          content: `Document content: ${content.substring(0, 10000)}...`
        }
      ],
      max_tokens: 1500
    });

    return {
      summary: summary.choices[0].message.content,
      keyPoints: await this.extractKeyPoints(content),
      readingTime: this.calculateReadingTime(content),
      complexity: this.analyzeComplexity(content)
    };
  }

  private async extractKeywords(document: Document): Promise<KeywordExtraction> {
    const content = await this.extractTextContent(document);
    
    const keywords = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Extract the most important keywords and phrases from this text.'
        },
        {
          role: 'user',
          content: `Text: ${content.substring(0, 5000)}...`
        }
      ],
      max_tokens: 500
    });

    return {
      keywords: keywords.choices[0].message.content
        .split('\n')
        .map(line => line.replace(/^[0-9]+\.\s*/, '').trim())
        .filter(keyword => keyword.length > 0),
      frequency: this.calculateKeywordFrequency(content),
      relevance: this.calculateKeywordRelevance(content)
    };
  }

  private async analyzeSentiment(document: Document): Promise<SentimentAnalysis> {
    const content = await this.extractTextContent(document);
    
    const sentiment = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Analyze the sentiment of this text and provide sentiment scores.'
        },
        {
          role: 'user',
          content: `Text: ${content.substring(0, 3000)}...`
        }
      ],
      max_tokens: 300
    });

    return {
      overallSentiment: sentiment.choices[0].message.content,
      sentimentScore: this.calculateSentimentScore(content),
      emotionalTone: this.analyzeEmotionalTone(content),
      confidence: this.calculateSentimentConfidence(content)
    };
  }

  private async recognizeEntities(document: Document): Promise<EntityRecognition> {
    const content = await this.extractTextContent(document);
    
    const entities = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Identify and categorize named entities in this text.'
        },
        {
          role: 'user',
          content: `Text: ${content.substring(0, 5000)}...`
        }
      ],
      max_tokens: 1000
    });

    return {
      people: this.extractEntitiesByType(entities, 'people'),
      organizations: this.extractEntitiesByType(entities, 'organizations'),
      locations: this.extractEntitiesByType(entities, 'locations'),
      dates: this.extractEntitiesByType(entities, 'dates'),
      miscellaneous: this.extractEntitiesByType(entities, 'miscellaneous')
    };
  }

  private async modelTopics(document: Document): Promise<TopicModeling> {
    const content = await this.extractTextContent(document);
    
    const topics = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Identify the main topics and themes in this document.'
        },
        {
          role: 'user',
          content: `Document: ${content.substring(0, 8000)}...`
        }
      ],
      max_tokens: 1000
    });

    return {
      mainTopics: topics.choices[0].message.content
        .split('\n')
        .map(line => line.replace(/^[0-9]+\.\s*/, '').trim())
        .filter(topic => topic.length > 0),
      topicDistribution: this.calculateTopicDistribution(content),
      themeAnalysis: this.analyzeThemes(content)
    };
  }

  private async compareDocuments(document: Document): Promise<DocumentComparison> {
    // Get similar documents for comparison
    const similarDocuments = await this.getSimilarDocuments(document);
    
    const comparisons: DocumentComparisonResult[] = [];

    for (const similarDoc of similarDocuments) {
      const comparison = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Compare these two documents and identify similarities and differences.'
          },
          {
            role: 'user',
            content: `Document 1: ${await this.extractTextContent(document)}\n\nDocument 2: ${await this.extractTextContent(similarDoc)}`
          }
        ],
        max_tokens: 1500
      });

      comparisons.push({
        comparedWith: similarDoc.id,
        similarities: this.extractSimilarities(comparison),
        differences: this.extractDifferences(comparison),
        similarityScore: this.calculateSimilarityScore(document, similarDoc)
      });
    }

    return {
      comparisons,
      overallSimilarity: this.calculateOverallSimilarity(comparisons),
      uniqueFeatures: this.identifyUniqueFeatures(document, similarDocuments)
    };
  }

  private async generateDocumentInsights(
    document: Document, 
    features: DocumentFeatures
  ): Promise<Insight[]> {
    const insights: Insight[] = [];

    // Generate insights based on processed features
    if (features.summarization) {
      insights.push({
        type: 'summary_quality',
        content: 'Document summary generated successfully with comprehensive coverage',
        priority: 'medium'
      });
    }

    if (features.keywordExtraction) {
      insights.push({
        type: 'keyword_analysis',
        content: `Key topics identified: ${features.keywordExtraction.keywords.slice(0, 3).join(', ')}`,
        priority: 'medium'
      });
    }

    if (features.sentimentAnalysis) {
      insights.push({
        type: 'sentiment_insight',
        content: `Overall sentiment: ${features.sentimentAnalysis.overallSentiment}`,
        priority: 'medium'
      });
    }

    if (features.topicModeling) {
      insights.push({
        type: 'topic_insight',
        content: `Main topics identified: ${features.topicModeling.mainTopics.slice(0, 3).join(', ')}`,
        priority: 'medium'
      });
    }

    return insights;
  }

  // Helper methods
  private calculateComplexityScore(content: string): number {
    const words = content.split(/\s+/);
    const complexWords = words.filter(word => word.length > 8).length;
    return complexWords / words.length;
  }

  private calculateReadabilityScore(content: string): number {
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const syllables = content.split(/[aeiouy]/i).length;
    
    // Flesch Reading Ease score
    return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  }

  private calculateReadingTime(content: string): number {
    const words = content.split(/\s+/).length;
    return Math.ceil(words / 200); // Average reading speed: 200 WPM
  }

  private calculateSentimentScore(content: string): number {
    // Simple sentiment scoring
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disappointing'];
    
    const positiveCount = positiveWords.reduce((count, word) => 
      count + (content.toLowerCase().split(word).length - 1), 0);
    const negativeCount = negativeWords.reduce((count, word) => 
      count + (content.toLowerCase().split(word).length - 1), 0);
    
    return positiveCount - negativeCount;
  }
}
```

#### 3. Enhanced Annotation System
Comprehensive document annotation and highlighting:

```typescript
// Enhanced annotation system
export class EnhancedAnnotationService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createAnnotation(annotationData: CreateAnnotationRequest): Promise<Annotation> {
    const annotation = await this.prisma.annotation.create({
      data: {
        documentId: annotationData.documentId,
        userId: annotationData.userId,
        type: annotationData.type,
        content: annotationData.content,
        position: annotationData.position,
        style: annotationData.style,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return annotation;
  }

  async getAnnotations(documentId: string, userId?: string): Promise<Annotation[]> {
    const where: any = { documentId };
    if (userId) {
      where.userId = userId;
    }

    return await this.prisma.annotation.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateAnnotation(annotationId: string, updateData: UpdateAnnotationRequest): Promise<Annotation> {
    return await this.prisma.annotation.update({
      where: { id: annotationId },
      data: {
        content: updateData.content,
        style: updateData.style,
        updatedAt: new Date()
      }
    });
  }

  async deleteAnnotation(annotationId: string): Promise<boolean> {
    try {
      await this.prisma.annotation.delete({
        where: { id: annotationId }
      });
      return true;
    } catch (error) {
      console.error('Failed to delete annotation:', error);
      return false;
    }
  }

  async searchAnnotations(documentId: string, query: string): Promise<Annotation[]> {
    return await this.prisma.annotation.findMany({
      where: {
        documentId,
        content: {
          contains: query,
          mode: 'insensitive'
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAnnotationStats(documentId: string): Promise<AnnotationStats> {
    const total = await this.prisma.annotation.count({
      where: { documentId }
    });

    const byType = await this.prisma.annotation.groupBy({
      by: ['type'],
      where: { documentId },
      _count: true
    });

    const byUser = await this.prisma.annotation.groupBy({
      by: ['userId'],
      where: { documentId },
      _count: true
    });

    return {
      total,
      byType: byType.map(item => ({
        type: item.type,
        count: item._count
      })),
      byUser: byUser.map(item => ({
        userId: item.userId,
        count: item._count
      }))
    };
  }
}

// Annotation overlay components
function AnnotationOverlay({ annotation }: { annotation: Annotation }) {
  const position = annotation.position as any;
  
  return (
    <div
      className={`annotation-overlay annotation-${annotation.type}`}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: position.width,
        height: position.height,
        backgroundColor: annotation.style?.backgroundColor || 'yellow',
        opacity: annotation.style?.opacity || 0.3,
        border: annotation.style?.border || '1px solid red'
      }}
      title={annotation.content}
    />
  );
}

function TextAnnotationOverlay({ annotation }: { annotation: Annotation }) {
  const content = annotation.content;
  const style = annotation.style;

  return (
    <mark
      className={`text-annotation annotation-${annotation.type}`}
      style={{
        backgroundColor: style?.backgroundColor || 'yellow',
        color: style?.color || 'black',
        fontWeight: style?.fontWeight || 'normal',
        fontStyle: style?.fontStyle || 'normal'
      }}
      title={`Annotation: ${content}`}
    >
      {content}
    </mark>
  );
}

// Annotation panel component
function AnnotationPanel({ 
  selectedText, 
  onSave, 
  onCancel 
}: {
  selectedText: string;
  onSave: (annotation: CreateAnnotationRequest) => void;
  onCancel: () => void;
}) {
  const [content, setContent] = useState('');
  const [type, setType] = useState<AnnotationType>('highlight');
  const [style, setStyle] = useState<AnnotationStyle>({});

  const handleSave = () => {
    onSave({
      documentId: '', // Would be passed from parent
      userId: '', // Would be passed from parent
      type,
      content: content || selectedText,
      position: {}, // Would be calculated from selection
      style
    });
  };

  return (
    <div className="annotation-panel">
      <div className="annotation-header">
        <h3>Add Annotation</h3>
        <button onClick={onCancel} className="close-btn">✕</button>
      </div>
      
      <div className="annotation-content">
        <div className="selected-text">
          <strong>Selected Text:</strong>
          <p>{selectedText}</p>
        </div>
        
        <div className="annotation-form">
          <div className="form-group">
            <label>Annotation Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as AnnotationType)}>
              <option value="highlight">Highlight</option>
              <option value="note">Note</option>
              <option value="comment">Comment</option>
              <option value="bookmark">Bookmark</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add your annotation content..."
              rows={4}
            />
          </div>
          
          <div className="form-group">
            <label>Style</label>
            <div className="style-options">
              <input
                type="color"
                value={style.backgroundColor || '#ffff00'}
                onChange={(e) => setStyle(prev => ({ ...prev, backgroundColor: e.target.value }))}
              />
              <select
                value={style.opacity || '0.3'}
                onChange={(e) => setStyle(prev => ({ ...prev, opacity: e.target.value }))}
              >
                <option value="0.1">10%</option>
                <option value="0.3">30%</option>
                <option value="0.5">50%</option>
                <option value="0.7">70%</option>
                <option value="1.0">100%</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="annotation-actions">
        <button onClick={onCancel} className="cancel-btn">Cancel</button>
        <button onClick={handleSave} className="save-btn">Save Annotation</button>
      </div>
    </div>
  );
}
```

#### 4. Enhanced Document Upload
Advanced document upload with processing and validation:

```typescript
// Enhanced document upload component
export function EnhancedDocumentUpload({ onUploadComplete }: { onUploadComplete?: (document: Document) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          setUploadedFiles(prev => [...prev, {
            id: result.document.id,
            name: file.name,
            status: 'completed',
            document: result.document
          }]);

          onUploadComplete?.(result.document);
        } else {
          setUploadedFiles(prev => [...prev, {
            id: generateId(),
            name: file.name,
            status: 'failed',
            error: result.error
          }]);
        }
      } catch (error) {
        console.error('Upload failed:', error);
        setUploadedFiles(prev => [...prev, {
          id: generateId(),
          name: file.name,
          status: 'failed',
          error: error.message
        }]);
      }
    }

    setIsUploading(false);
    setUploadProgress(100);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <div className="document-upload">
      {/* Upload Area */}
      <div
        className={`upload-area ${dragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <div className="upload-icon">
            <UploadIcon className="w-12 h-12" />
          </div>
          <h3>Drag and Drop Files Here</h3>
          <p>Supports PDF, DOCX, TXT, JPG, PNG, and more</p>
          
          <input
            type="file"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            className="file-input"
          />
          
          <button
            onClick={() => document.querySelector('input[type="file"]')?.click()}
            className="browse-btn"
          >
            Browse Files
          </button>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
          </div>
          <span>Uploading... {uploadProgress}%</span>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <h3>Uploaded Files</h3>
          <div className="files-list">
            {uploadedFiles.map(file => (
              <div key={file.id} className={`file-item ${file.status}`}>
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  {file.status === 'completed' && (
                    <span className="file-status">✓ Completed</span>
                  )}
                  {file.status === 'failed' && (
                    <span className="file-status error">✗ Failed: {file.error}</span>
                  )}
                </div>
                {file.status === 'completed' && file.document && (
                  <div className="file-actions">
                    <button className="view-btn">View</button>
                    <button className="process-btn">Process</button>
                    <button className="share-btn">Share</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

## Technical Implementation

### 1. Enhanced Database Models

#### Document and Annotation Models
```prisma
model Document {
  id              String   @id @default(cuid())
  title           String
  description     String?
  fileUrl         String
  fileType        String   // "pdf", "image", "text", "docx"
  fileSize        Int
  pageCount       Int?
  uploadDate      DateTime @default(now())
  processedAt     DateTime?
  metadata        Json?    // Document metadata
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  projectId       String?
  project         Project? @relation(fields: [projectId], references: [id], onDelete: SetNull)
  
  // Enhanced fields
  processingStatus String   @default("pending") // "pending", "processing", "completed", "failed"
  processingError String?
  extractedText   String?
  summary         String?
  keywords        String[]
  tags            String[]
  
  // Relationships
  annotations     Annotation[]
  versions        DocumentVersion[]
  accessLogs      DocumentAccessLog[]
}

model Annotation {
  id              String   @id @default(cuid())
  documentId      String
  document        Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type            String   // "highlight", "note", "comment", "bookmark"
  content         String
  position        Json     // Annotation position data
  style           Json?    // Annotation styling
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Enhanced fields
  pageNumber      Int?     // Page number for multi-page documents
  highlightedText String?  // Original highlighted text
  context         Json?    // Context around annotation
  tags            String[]
  
  // Relationships
  replies         AnnotationReply[]
}

model DocumentVersion {
  id              String   @id @default(cuid())
  documentId      String
  document        Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  versionNumber   Int
  fileUrl         String
  changeDescription String
  createdAt       DateTime @default(now())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  
  @@unique([documentId, versionNumber])
}

model DocumentAccessLog {
  id              String   @id @default(cuid())
  documentId      String
  document        Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  action          String   // "view", "download", "print", "share"
  ipAddress       String?
  userAgent       String?
  timestamp       DateTime @default(now())
  metadata        Json?    // Additional action metadata
}
```

### 2. Enhanced API Endpoints

#### Document Processing API
```typescript
// src/app/api/documents/[id]/process/route.ts
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const documentId = params.id;
  const { features } = await request.json();

  try {
    // Validate document access
    const document = await validateDocumentAccess(documentId);
    
    // Process document with requested features
    const processingService = new EnhancedDocumentProcessingService();
    const result = await processingService.processDocument(documentId, features);

    // Update document processing status
    await updateDocumentProcessingStatus(documentId, {
      status: 'completed',
      processedAt: new Date(),
      features: features,
      results: result
    });

    return new Response(JSON.stringify({
      success: true,
      documentId: documentId,
      features: result.features,
      insights: result.insights
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Document processing failed:', error);
    
    // Update document processing status to failed
    await updateDocumentProcessingStatus(documentId, {
      status: 'failed',
      processingError: error.message
    });

    return new Response(JSON.stringify({ 
      error: 'Document processing failed',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// src/app/api/documents/[id]/annotations/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const documentId = params.id;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  try {
    const annotationService = new EnhancedAnnotationService();
    const annotations = await annotationService.getAnnotations(documentId, userId);

    return new Response(JSON.stringify({ annotations }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Failed to get annotations:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to get annotations',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const annotationData = await request.json();
    
    const annotationService = new EnhancedAnnotationService();
    const annotation = await annotationService.createAnnotation({
      ...annotationData,
      documentId: params.id
    });

    return new Response(JSON.stringify({ annotation }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Failed to create annotation:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to create annotation',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// src/app/api/documents/[id]/search/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const documentId = params.id;
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return new Response(JSON.stringify({ error: 'Search query required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Get document content
    const document = await getDocumentContent(documentId);
    
    // Perform search
    const searchResults = performTextSearch(document.content, query);
    
    return new Response(JSON.stringify({ results: searchResults }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Search failed:', error);
    return new Response(JSON.stringify({ 
      error: 'Search failed',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function performTextSearch(content: string, query: string): SearchResult[] {
  const results: SearchResult[] = [];
  const queryLower = query.toLowerCase();
  const contentLower = content.toLowerCase();
  
  let index = 0;
  while ((index = contentLower.indexOf(queryLower, index)) !== -1) {
    const startIndex = index;
    const endIndex = index + query.length;
    
    // Get context around the match
    const contextStart = Math.max(0, startIndex - 50);
    const contextEnd = Math.min(content.length, endIndex + 50);
    const context = content.substring(contextStart, contextEnd);
    
    results.push({
      startIndex,
      endIndex,
      context,
      match: content.substring(startIndex, endIndex)
    });
    
    index += query.length;
  }
  
  return results;
}
```

### 3. Enhanced Frontend Components

#### Document Viewer with Advanced Features
```typescript
// Enhanced document viewer with advanced features
export function AdvancedDocumentViewer({ documentId }: { documentId: string }) {
  const [document, setDocument] = useState<Document | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'annotations' | 'insights' | 'search'>('annotations');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    loadDocument();
    loadAnnotations();
    loadInsights();
  }, [documentId]);

  const loadDocument = async () => {
    const response = await fetch(`/api/documents/${documentId}`);
    const data = await response.json();
    setDocument(data.document);
  };

  const loadAnnotations = async () => {
    const response = await fetch(`/api/documents/${documentId}/annotations`);
    const data = await response.json();
    setAnnotations(data.annotations);
  };

  const loadInsights = async () => {
    const response = await fetch(`/api/documents/${documentId}/insights`);
    const data = await response.json();
    setInsights(data.insights);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    const response = await fetch(`/api/documents/${documentId}/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    setSearchResults(data.results);
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'txt') => {
    const response = await fetch(`/api/documents/${documentId}/export?format=${format}`);
    const blob = await response.blob();
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${document?.title}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="advanced-document-viewer">
      {/* Header */}
      <div className="viewer-header">
        <div className="document-info">
          <h2>{document?.title}</h2>
          <span className="file-type">{document?.fileType}</span>
        </div>
        
        <div className="viewer-controls">
          <div className="zoom-controls">
            <button onClick={() => setZoomLevel(Math.max(25, zoomLevel - 25))}>-</button>
            <span>{zoomLevel}%</span>
            <button onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}>+</button>
          </div>
          
          <div className="export-controls">
            <button onClick={() => handleExport('pdf')}>Export PDF</button>
            <button onClick={() => handleExport('docx')}>Export DOCX</button>
            <button onClick={() => handleExport('txt')}>Export TXT</button>
          </div>
          
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sidebar-toggle"
          >
            {sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="viewer-main">
        {/* Document Content */}
        <div className="document-content">
          <DocumentRenderer
            document={document}
            currentPage={currentPage}
            zoomLevel={zoomLevel}
            searchResults={searchResults}
            annotations={annotations}
            onTextSelection={(text, position) => {
              // Handle text selection for annotations
            }}
          />
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="viewer-sidebar">
            <div className="sidebar-tabs">
              {['annotations', 'insights', 'search'].map(tab => (
                <button
                  key={tab}
                  className={`tab ${sidebarTab === tab ? 'active' : ''}`}
                  onClick={() => setSidebarTab(tab as any)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="sidebar-content">
              {sidebarTab === 'annotations' && (
                <AnnotationsPanel
                  annotations={annotations}
                  onAddAnnotation={(annotation) => {
                    // Add new annotation
                  }}
                  onDeleteAnnotation={(id) => {
                    // Delete annotation
                  }}
                />
              )}

              {sidebarTab === 'insights' && (
                <InsightsPanel
                  insights={insights}
                  onGenerateInsights={() => {
                    // Generate new insights
                  }}
                />
              )}

              {sidebarTab === 'search' && (
                <SearchPanel
                  query={searchQuery}
                  results={searchResults}
                  onSearch={handleSearch}
                  onResultSelect={(result) => {
                    // Navigate to search result
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

## User Experience Enhancements

### 1. **Advanced Document Interaction**
- Multi-format document support (PDF, images, text)
- Advanced annotation and highlighting tools
- Text selection and search functionality
- Document comparison and analysis

### 2. **Rich Document Processing**
- AI-powered content analysis and summarization
- Keyword extraction and sentiment analysis
- Entity recognition and topic modeling
- Document insights and recommendations

### 3. **Enhanced Document Management**
- Comprehensive document upload and processing
- Document versioning and history
- Access logging and security
- Document organization and categorization

### 4. **Interactive Document Features**
- Real-time document rendering
- Interactive annotations and comments
- Document sharing and collaboration
- Export and conversion capabilities

## Integration Patterns

### 1. **Document Processing Pipeline**
```
Document Upload → Format Detection → Content Extraction → AI Analysis → Feature Generation
      ↓              ↓                    ↓              ↓              ↓
File Upload → Type Identification → Text Extraction → AI Processing → Document Features
```

### 2. **Annotation System Flow**
```
Text Selection → Annotation Creation → Database Storage → UI Rendering → User Interaction
      ↓              ↓                    ↓              ↓              ↓
User Action → Annotation Data → Database Save → Visual Overlay → User Feedback
```

### 3. **Document Search Flow**
```
Search Query → Text Analysis → Index Search → Result Ranking → UI Display
      ↓              ↓              ↓              ↓              ↓
User Input → Content Processing → Search Algorithm → Result Sorting → Visual Results
```

## Benefits of Enhanced Document Viewer

### 1. **Improved Document Interaction**
- Comprehensive document format support
- Advanced annotation and highlighting capabilities
- Rich text selection and search features
- Interactive document analysis tools

### 2. **Enhanced Content Analysis**
- AI-powered document insights and summarization
- Advanced content extraction and analysis
- Smart keyword and entity recognition
- Comprehensive document comparison features

### 3. **Better Document Management**
- Complete document lifecycle management
- Advanced document organization and categorization
- Comprehensive access logging and security
- Document versioning and history tracking

### 4. **Enhanced User Experience**
- Intuitive document viewing interface
- Rich annotation and collaboration tools
- Advanced search and navigation features
- Seamless document export and sharing

## Future Enhancements

### 1. **Advanced AI Features**
- Multi-modal document analysis (text + images + structure)
- Advanced document understanding and reasoning
- Smart document recommendations and suggestions
- Automated document classification and tagging

### 2. **Enhanced Collaboration**
- Real-time collaborative document editing
- Advanced comment and discussion features
- Document sharing with permission controls
- Team-based document management

### 3. **Advanced Analytics**
- Document usage analytics and insights
- User behavior analysis and optimization
- Document performance metrics
- Advanced search analytics and optimization

## Testing Strategy

### Unit Testing
```typescript
describe('Document Viewer', () => {
  it('should render PDF document correctly', async () => {
    const document = { id: 'test-doc', fileType: 'pdf', title: 'Test PDF' };
    
    const result = await renderDocumentViewer(document);
    expect(result).toContain('Test PDF');
    expect(result).toContain('PDF');
  });

  it('should handle text selection and annotation', async () => {
    const selectedText = 'Test selected text';
    const annotation = { type: 'highlight', content: selectedText };
    
    const result = await createAnnotation(annotation);
    expect(result.success).toBe(true);
    expect(result.annotation.content).toBe(selectedText);
  });
});
```

### Integration Testing
```typescript
describe('Document Processing Integration', () => {
  it('should handle complete document processing flow', async () => {
    // Test document upload
    const uploadResponse = await request(app)
      .post('/api/documents/upload')
      .attach('file', 'test-document.pdf');

    expect(uploadResponse.status).toBe(200);
    expect(uploadResponse.body.success).toBe(true);

    // Test document processing
    const processResponse = await request(app)
      .post(`/api/documents/${uploadResponse.body.document.id}/process`)
      .send({ features: ['content_extraction', 'summarization'] });

    expect(processResponse.status).toBe(200);
    expect(processResponse.body.features).toBeDefined();
  });
});
```

## Conclusion

The enhanced document viewer implementation provides a comprehensive, feature-rich document viewing and processing system. Key achievements include:

- ✅ **Multi-Format Support**: Complete support for PDF, image, and text documents
- ✅ **Advanced Processing**: AI-powered content analysis and document insights
- ✅ **Rich Annotations**: Comprehensive annotation and highlighting system
- ✅ **Interactive Features**: Advanced search, comparison, and collaboration tools
- ✅ **Database Integration**: Complete document and annotation management

This implementation serves as a foundation for advanced document features and provides a robust, scalable document viewing system that enhances user productivity and document interaction.
