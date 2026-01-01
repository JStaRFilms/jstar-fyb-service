/**
 * useChatToolHandlers Hook
 * Handles effects of AI tool invocations and intelligent state triggers.
 */

import { useEffect } from "react";
import { ChatState, ConfirmedTopic } from "./types";

// Helper for phone detection
export const detectPhoneNumber = (text: string): string | null => {
    const cleanedText = text.replace(/[\s\-().]/g, '');
    const phoneRegex = /^\+?\d{10,15}$/;
    if (phoneRegex.test(cleanedText)) return cleanedText;
    const extractMatch = text.match(/(?:\+?\d[\d\s\-().]{9,17}\d)/);
    if (extractMatch) {
        const extracted = extractMatch[0].replace(/[\s\-().]/g, '');
        if (extracted.length >= 10 && extracted.length <= 15) return extracted;
    }
    return null;
};

interface UseChatToolHandlersProps {
    aiMessages: any[];
    state: ChatState;
    setState: (state: ChatState) => void;
    hasProvidedPhone: boolean;
    setComplexity: (complexity: 1 | 2 | 3 | 4 | 5) => void;
    setConfirmedTopic: (topic: ConfirmedTopic) => void;
    userId?: string;
}

export function useChatToolHandlers({
    aiMessages,
    state,
    setState,
    hasProvidedPhone,
    setComplexity,
    setConfirmedTopic,
    userId
}: UseChatToolHandlersProps) {

    useEffect(() => {
        if (!aiMessages?.length) return;

        const lastMessage = aiMessages[aiMessages.length - 1];
        if (lastMessage.role !== 'assistant') return;

        // Vercel AI SDK structure: type = "tool-{toolName}", state = "output-available"
        const toolCalls = lastMessage.parts?.filter((p: any) => p.type?.startsWith('tool-'));

        if (toolCalls) {
            for (const tool of toolCalls) {
                const toolType = tool.type as string;

                // tool-setComplexity
                if (toolType === 'tool-setComplexity' && tool.state === 'output-available') {
                    const level = tool.output?.level || tool.input?.level;
                    if (level) setComplexity(level as 1 | 2 | 3 | 4 | 5);
                }

                // tool-requestContactInfo
                if (toolType === 'tool-requestContactInfo' && tool.state === 'output-available') {
                    if (state !== "CLOSING") {
                        setState("CLOSING");
                    }
                }

                // tool-confirmTopic
                if (toolType === 'tool-confirmTopic' && tool.state === 'output-available') {
                    const topic = tool.output?.topic || tool.input?.topic;
                    const twist = tool.output?.twist || tool.input?.twist;
                    if (topic) {
                        setConfirmedTopic({ topic, twist: twist || '' });
                        setState("COMPLETED");
                        // Persist confirmed topic locally as backup
                        localStorage.setItem('jstar_confirmed_topic', JSON.stringify({
                            topic,
                            twist: twist || '',
                            confirmedAt: new Date().toISOString(),
                            userId: userId || null
                        }));
                    }
                }
            }
        }

        // ============================================================
        // INTELLIGENT TRIGGER (State Logic - "WhatsApp" keyword)
        // ============================================================
        let content = '';
        if (lastMessage.parts) {
            const textPart = lastMessage.parts.find((p: any) => p.type === 'text');
            content = textPart?.text || '';
        } else if (typeof lastMessage.content === 'string') {
            content = lastMessage.content;
        }

        // HEURISTIC: Check if user RECENTLY provided phone to avoid false positives
        let recentlyProvidedPhone = false;
        if (content.toLowerCase().includes('whatsapp')) {
            const lookbackCount = 3;
            const startCheck = Math.max(0, aiMessages.length - 1 - lookbackCount);
            for (let k = aiMessages.length - 2; k >= startCheck; k--) {
                const prevMsg = aiMessages[k];
                if (prevMsg && prevMsg.role === 'user') {
                    let prevContent = '';
                    if (typeof prevMsg.content === 'string') prevContent = prevMsg.content;
                    else if (prevMsg.parts) prevContent = prevMsg.parts.find((p: any) => p.type === 'text')?.text || '';

                    if (detectPhoneNumber(prevContent)) {
                        recentlyProvidedPhone = true;
                        break;
                    }
                }
            }
        }

        // If AI mentions WhatsApp, user hasn't provided it, and we aren't already closing -> Force CLOSING
        if (content.toLowerCase().includes('whatsapp') &&
            state !== 'CLOSING' &&
            state !== 'COMPLETED' &&
            !hasProvidedPhone &&
            !recentlyProvidedPhone
        ) {
            console.log('[useChatToolHandlers] Detected "whatsapp" keyword, forcing CLOSING state.');
            setState("CLOSING");
        }

    }, [aiMessages, state, hasProvidedPhone, setState, setComplexity, setConfirmedTopic, userId]);
}
