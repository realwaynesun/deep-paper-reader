# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000, uses Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint (flat config, eslint.config.mjs)
npx shadcn add <component>  # Add new shadcn/ui component
```

No test framework is configured yet.

## Architecture

**Deep Paper Reader** is a Next.js 16 App Router application for reading PDFs, Markdown files, and web pages with AI-powered translation, term explanation, and structure analysis. PDFs stay client-side (blob URLs); web pages are fetched server-side and converted to markdown via Readability + Turndown; only selected text is sent to AI providers.

### Data Flow

1. User uploads PDF/Markdown or pastes a URL
2. PDF → blob URL in React state; URL → `/api/fetch-url` extracts content with Readability → Turndown → markdown
3. `react-pdf` renders PDF pages; `react-markdown` renders Markdown/web content
3. Text selection triggers classification: 1-3 words → "ask" (explain term), 4+ words → "translate"
4. Client sends selected text + context via custom headers (`x-ai-provider`, `x-ai-model`, `x-ai-api-key`) to API routes
5. API routes use Vercel AI SDK `streamText()` → streaming response back to client

### Feature Modules (`src/features/`)

Each feature is self-contained with its own component(s) and hook:

- **pdf-viewer** — PDF rendering with zoom, page tracking via IntersectionObserver
- **selection** — Text selection detection, context capture (±200 chars), action classification
- **ask** — Term explanation popover (floating-ui positioned near selection)
- **translate** — Passage translation in slide-out Sheet panel
- **structure** — Paper outline/TOC generated from full text, hierarchical JSON
- **settings** — AI provider/model/key config stored in localStorage via React Context
- **reader** — Main layout composing all features together
- **markdown-viewer** — Renders Markdown files and web content (accepts File or raw string)
- **documents** — Saved document list + hook for CRUD operations via Vercel Blob

### API Routes (`src/app/api/`)

All three routes follow the same pattern: Zod validation → `getModelFromRequest()` → `streamText()` with system prompt.

- `POST /api/translate` — Translates passage to Chinese, preserves technical terms
- `POST /api/ask` — Explains selected term in context (meaning, definition, etymology)
- `POST /api/summarize` — Generates hierarchical paper structure as JSON
- `POST /api/fetch-url` — Fetches URL, extracts article with Readability, returns markdown (server-side to avoid CORS)
- `GET /api/documents` — List saved documents (from Vercel Blob manifest)
- `POST /api/documents` — Save a URL as document (fetch + extract + store in Vercel Blob)
- `GET/DELETE /api/documents/[id]` — Get or delete a saved document
- `POST /api/auth/login` — Validate password, set HttpOnly cookie
- `POST /api/auth/logout` — Clear auth cookie

### Key Decisions

- **SSR disabled for ReaderView** — `dynamic(() => ..., { ssr: false })` because react-pdf requires browser APIs
- **Canvas aliased to false** in webpack config — prevents pdfjs-dist worker issues in Next.js
- **Client-side API key storage** — Keys in localStorage, sent per-request via headers (no server-side key storage required)
- **Streaming responses** — All AI endpoints stream for real-time display
- **DocumentSource union type** — `page.tsx` exports `DocumentSource = { type: "file", file } | { type: "web", web: { title, content } }`, consumed by ReaderView
- **URL fetch is server-side only** — `/api/fetch-url` runs on server to bypass CORS; JS-rendered SPAs may return empty content
- **Password protection via middleware** — `READER_PASSWORD` env var; when unset, auth is disabled (dev mode). Browser uses HttpOnly cookie, API uses Bearer token.
- **Document storage via Vercel Blob** — `BLOB_READ_WRITE_TOKEN` env var; manifest pattern with `_index.json` for listing. Graceful 503 when not configured.
- **URL extraction shared** — `src/lib/extract-url.ts` used by both `/api/fetch-url` and `/api/documents`
