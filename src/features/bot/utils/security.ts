/**
 * Security utilities for Chat API
 * Handles input sanitization and validation.
 */

// Input validation schema with security limits
export const MAX_MESSAGE_LENGTH = 10000; // Prevent excessively long inputs

/**
 * CRITICAL SECURITY FIX: Enhanced sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
        return '';
    }

    // CRITICAL SECURITY FIX: Comprehensive input sanitization
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: URLs
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .replace(/[<>]/g, '') // Remove HTML tags
        .replace(/data:\s*text\/html/gi, '') // Remove data URLs
        .replace(/vbscript:/gi, '') // Remove vbscript
        .replace(/file:\s*\/\//gi, '') // Remove file:// URLs
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .trim();
}

/**
 * CRITICAL SECURITY FIX: Enhanced validate and sanitize message content
 */
export function validateAndSanitizeMessage(message: any): string {
    let content = '';

    try {
        if (message && typeof message === 'object') {
            if (message.content && typeof message.content === 'string') {
                content = message.content;
            } else if (message.parts && Array.isArray(message.parts)) {
                // CRITICAL SECURITY FIX: Extract text from parts with validation
                const textParts: string[] = [];
                for (const part of message.parts) {
                    if (part && typeof part === 'object' && part.type === 'text' && part.text && typeof part.text === 'string') {
                        textParts.push(part.text);
                    }
                }
                content = textParts.join(' ');
            }
        } else if (typeof message === 'string') {
            content = message;
        }

        // CRITICAL SECURITY FIX: Sanitize the content and limit length
        const sanitized = sanitizeInput(content);

        // CRITICAL SECURITY FIX: Additional length validation
        if (sanitized.length > MAX_MESSAGE_LENGTH) {
            return sanitized.slice(0, MAX_MESSAGE_LENGTH);
        }

        return sanitized;
    } catch (error) {
        console.error('[Chat API] Message sanitization failed:', error);
        return '';
    }
}
