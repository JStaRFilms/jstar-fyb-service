# AI SDK Integration Patterns

## Overview
This document describes how Vercel AI SDK v5 is used throughout the J Star FYB Service application.

## SDK Version
- `ai`: ^5.x (Vercel AI SDK Core)
- `@ai-sdk/react`: ^1.x (React hooks)
- `@ai-sdk/openai`: ^1.x (OpenAI-compatible providers)

---

## Provider Setup (Groq)

```typescript
// src/app/api/chat/route.ts
import { createOpenAI } from '@ai-sdk/openai';

const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
});

// Usage
streamText({
    model: groq('moonshotai/kimi-k2-instruct-0905'),
    // or: groq('llama-3.3-70b-versatile')
});
```

---

## Pattern 1: Chat with Tools (useChat)

**Use Case:** Interactive chat with function calling (FR-002)

### Server (`/api/chat/route.ts`)
```typescript
import { convertToModelMessages, streamText, tool, UIMessage } from 'ai';

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();
    const modelMessages = convertToModelMessages(messages);

    const result = streamText({
        model: groq('...'),
        system: '...',
        messages: modelMessages,
        tools: {
            myTool: tool({
                description: '...',
                inputSchema: z.object({ ... }),
                execute: async (input) => ({ result: '...' }),
            }),
        },
    });

    return result.toUIMessageStreamResponse();
}
```

### Client
```typescript
import { useChat } from '@ai-sdk/react';

const { messages, sendMessage, status } = useChat();

// Send message
await sendMessage({ text: 'Hello' });

// Check loading
const isLoading = status === 'streaming' || status === 'submitted';
```

---

## Pattern 2: Text Completion (useCompletion)

**Use Case:** Single-shot text generation (Abstract Generator)

### Server (`/api/generate/abstract/route.ts`)
```typescript
import { streamText } from 'ai';

const result = streamText({
    model: groq('...'),
    system: '...',
    prompt: `Write abstract for "${topic}"`,
});

return result.toTextStreamResponse(); // NOT toDataStreamResponse()
```

### Client
```typescript
import { useCompletion } from '@ai-sdk/react';

const { completion, complete, isLoading, setCompletion } = useCompletion({
    api: '/api/generate/abstract',
    streamProtocol: 'text', // REQUIRED for toTextStreamResponse()
    onFinish: (prompt, completion) => {
        // Save result
    }
});

// Trigger generation
await complete('', { body: { topic, twist } });
```

---

## Pattern 3: Structured Object (useObject)

**Use Case:** Streaming structured data (Outline Generator - TO BE IMPLEMENTED)

### Server
```typescript
import { streamObject } from 'ai';

const result = streamObject({
    model: groq('...'),
    schema: z.object({
        chapters: z.array(z.object({
            title: z.string(),
            content: z.string(),
        }))
    }),
    prompt: '...',
});

return result.toTextStreamResponse();
```

### Client
```typescript
import { useObject } from '@ai-sdk/react';

const { object, isLoading } = useObject({
    api: '/api/generate/outline',
    schema: outlineSchema,
});

// Render partial object as it streams
{object?.chapters?.map(ch => <Chapter key={ch.title} {...ch} />)}
```

---

## Tool Detection in Client

To detect when the AI calls a tool (e.g., `setComplexity`):

```typescript
useEffect(() => {
    for (const m of messages) {
        if (m.parts) {
            for (const part of m.parts) {
                if (part.type === 'tool-invocation' && part.toolName === 'setComplexity') {
                    const level = part.args?.level || part.result?.level;
                    // Handle tool result
                }
            }
        }
    }
}, [messages]);
```

---

## Retry Logic & Error Handling

For AI-specific retry logic, see the pattern below. For global application error handling and custom error classes (e.g., `ApiError`), see `docs/features/App_Stability_and_Error_Handling.md`.

```typescript
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function streamTextWithRetry(config, retries = MAX_RETRIES) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return streamText(config);
        } catch (error) {
            if (attempt < retries) {
                await delay(RETRY_DELAY_MS * Math.pow(2, attempt - 1));
            }
        }
    }
    throw new Error('All retries failed');
}
```

---

## Type Safety & SDK Patterns

### Proper Tool Definition
Always use `inputSchema` rather than `parameters` for tool definitions to ensure consistency with the J Star FYB codebase patterns.

### Explicit Message Typing
When mapping messages from requests, explicitly type them as `CoreMessage[]` from `ai` to avoid overload resolution issues in `streamText`.

```typescript
import { streamText, type CoreMessage } from 'ai';

const coreMessages: CoreMessage[] = messages.map((m: any) => ({
    role: m.role as 'user' | 'assistant' | 'system',
    content: m.content
}));
```

### Multi-Step Control
While `maxSteps` is preferred in newer AI SDK versions, some configurations in this project use `stopWhen: stepCountIs(n)` for more granular control or legacy compatibility.

---

## Reference
See `docs/Vercel Ai SDK.md` for full SDK documentation.
