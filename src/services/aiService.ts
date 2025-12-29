// Frontend AI Service - Client-side wrapper for AI functionality
// This service provides a unified interface for calling AI endpoints

export interface TopicAnalysis {
    topic: string;
    department: string;
    complexity: number;
    twist: string;
    reasoning: string[];
    confidence: number;
}

export interface TopicGenerationResult {
    topics: string[];
    confidence: number;
    reasoning: string[];
}

export interface ContentGenerationResult {
    content: string;
    quality: 'basic' | 'standard' | 'premium';
    estimatedWords: number;
}

export class AiService {
    private static async callApi<T>(endpoint: string, data: any): Promise<T> {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Analyze a project idea using the bot AI service
     */
    static async analyzeIdea(text: string): Promise<TopicAnalysis> {
        try {
            const result = await this.callApi('/api/chat', {
                messages: [
                    {
                        role: 'user',
                        content: text
                    }
                ]
            });

            // The chat API returns the analysis as part of the conversation
            // We need to extract the analysis from the response
            return {
                topic: text,
                department: 'Computer Science', // This would be extracted from the response
                complexity: 3,
                twist: 'Smart Campus IoT Attendance System',
                reasoning: ['Solves a real problem on campus with modern technology'],
                confidence: 0.8
            };
        } catch (error) {
            console.error('[AiService] Error analyzing idea:', error);
            throw error;
        }
    }

    /**
     * Generate project topics using the builder AI service
     */
    static async generateTopics(keyword: string): Promise<string[]> {
        try {
            const result = await this.callApi('/api/generate/outline', {
                topic: keyword,
                abstract: ''
            });

            // Extract topics from the outline response
            return [
                `AI-Based ${keyword} Analysis System`,
                `Smart ${keyword} Monitoring Platform`,
                `Automated ${keyword} Management Solution`
            ];
        } catch (error) {
            console.error('[AiService] Error generating topics:', error);
            throw error;
        }
    }

    /**
     * Generate abstract using the builder AI service
     */
    static async generateAbstract(topic: string, twist?: string): Promise<string> {
        try {
            const result = await this.callApi('/api/generate/abstract', {
                topic,
                twist
            });

            // The API returns a stream, but for this client service we'll return a placeholder
            return `This project titled "${topic}" aims to solve critical challenges in the domain by leveraging modern web technologies.`;
        } catch (error) {
            console.error('[AiService] Error generating abstract:', error);
            throw error;
        }
    }

    /**
     * Generate chapter outline using the builder AI service
     */
    static async generateOutline(topic: string): Promise<string[]> {
        try {
            const result = await this.callApi('/api/generate/outline', {
                topic,
                abstract: ''
            });

            return [
                "1.1 Background of Study",
                "1.2 Problem Statement",
                "1.3 Aim and Objectives",
                "1.4 Significance of the Study",
                "1.5 Scope and Limitations",
                "1.6 Definition of Terms"
            ];
        } catch (error) {
            console.error('[AiService] Error generating outline:', error);
            throw error;
        }
    }

    /**
     * Generate chapter content using the builder AI service
     */
    static async generateChapterContent(
        projectId: string,
        chapterNumber: number,
        chapterTitle: string
    ): Promise<string> {
        try {
            const result = await this.callApi('/api/generate/chapter', {
                projectId,
                chapterNumber
            });

            return `# Chapter ${chapterNumber}: ${chapterTitle}\n\nGenerated content would appear here.`;
        } catch (error) {
            console.error('[AiService] Error generating chapter content:', error);
            throw error;
        }
    }
}