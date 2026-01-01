/**
 * Secure logging utility that prevents information disclosure
 */

export enum LogLevel {
    ERROR = 'ERROR',
    WARN = 'WARN',
    INFO = 'INFO',
    DEBUG = 'DEBUG'
}

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: string;
    userId?: string;
    requestId?: string;
    ip?: string;
}

/**
 * Sanitize sensitive information from log messages
 */
function sanitizeLogMessage(message: any): string {
    if (typeof message === 'string') {
        // Remove sensitive patterns
        return message
            .replace(/password[:\s]*['"][^'"]*['"]/gi, 'password: [REDACTED]')
            .replace(/secret[:\s]*['"][^'"]*['"]/gi, 'secret: [REDACTED]')
            .replace(/key[:\s]*['"][^'"]*['"]/gi, 'key: [REDACTED]')
            .replace(/token[:\s]*['"][^'"]*['"]/gi, 'token: [REDACTED]')
            .replace(/api[_-]?key[:\s]*['"][^'"]*['"]/gi, 'apiKey: [REDACTED]')
            .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP_REDACTED]') // IP addresses
            .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]'); // Email addresses
    }

    if (typeof message === 'object' && message !== null) {
        return JSON.stringify(message, (key, value) => {
            if (typeof value === 'string') {
                return sanitizeLogMessage(value);
            }
            return value;
        });
    }

    return String(message);
}

/**
 * Get client IP address safely
 */
function getClientIP(): string {
    // This would need to be implemented based on your request context
    // For now, return a placeholder
    return 'unknown';
}

/**
 * Get current request ID (would be set by middleware)
 */
function getRequestId(): string {
    // This would be set by request middleware
    return 'unknown';
}

/**
 * Get current user ID (would be set by auth middleware)
 */
function getCurrentUserId(): string | undefined {
    // This would be set by auth middleware
    return undefined;
}

/**
 * Format log entry
 */
function formatLogEntry(level: LogLevel, message: any, context?: string): LogEntry {
    return {
        timestamp: new Date().toISOString(),
        level,
        message: sanitizeLogMessage(message),
        context,
        userId: getCurrentUserId(),
        requestId: getRequestId(),
        ip: getClientIP()
    };
}

/**
 * Write log entry to console
 */
function writeLog(entry: LogEntry) {
    const logString = JSON.stringify(entry);

    switch (entry.level) {
        case LogLevel.ERROR:
            console.error(logString);
            break;
        case LogLevel.WARN:
            console.warn(logString);
            break;
        case LogLevel.INFO:
        case LogLevel.DEBUG:
        default:
            console.log(logString);
            break;
    }
}

/**
 * Main logging functions
 */
export const logger = {
    error: (message: any, context?: string) => {
        const entry = formatLogEntry(LogLevel.ERROR, message, context);
        writeLog(entry);
    },

    warn: (message: any, context?: string) => {
        const entry = formatLogEntry(LogLevel.WARN, message, context);
        writeLog(entry);
    },

    info: (message: any, context?: string) => {
        const entry = formatLogEntry(LogLevel.INFO, message, context);
        writeLog(entry);
    },

    debug: (message: any, context?: string) => {
        if (process.env.NODE_ENV === 'development') {
            const entry = formatLogEntry(LogLevel.DEBUG, message, context);
            writeLog(entry);
        }
    }
};

/**
 * Security event logging
 */
export const securityLogger = {
    authFailure: (details: { userId?: string; ip?: string; reason: string }) => {
        logger.warn('Authentication failure', JSON.stringify({
            type: 'AUTH_FAILURE',
            userId: details.userId || 'anonymous',
            ip: details.ip || getClientIP(),
            reason: details.reason
        }));
    },

    dataAccess: (details: { userId: string; resource: string; action: string }) => {
        logger.info('Data access', JSON.stringify({
            type: 'DATA_ACCESS',
            userId: details.userId,
            resource: details.resource,
            action: details.action
        }));
    },

    suspiciousActivity: (details: { userId?: string; activity: string; details: any }) => {
        logger.warn('Suspicious activity detected', JSON.stringify({
            type: 'SUSPICIOUS_ACTIVITY',
            userId: details.userId || 'anonymous',
            activity: details.activity,
            details: sanitizeLogMessage(details.details)
        }));
    }
};

/**
 * Error handler with security considerations
 */
export function handleSecurityError(error: Error, context?: string): void {
    logger.error({
        message: error.message,
        stack: error.stack,
        context
    }, 'SECURITY_ERROR');

    // Don't expose stack traces in production
    if (process.env.NODE_ENV === 'production') {
        console.error('Security error occurred. Check logs for details.');
    }
}