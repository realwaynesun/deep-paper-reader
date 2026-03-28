---
name: save-to-reader
description: Save a web URL to Deep Paper Reader for later reading with AI-powered translation. Use when user says "/save-to-reader", "save to reader", "save this article", "add to reader", "保存到阅读器", or wants to bookmark a web page for reading in Deep Paper Reader. User-invoked only.
---

Save `$ARGUMENTS` (a URL) to Deep Paper Reader. The API fetches the page, extracts content via Readability, converts to markdown, and stores in Vercel Blob.

## Prerequisites

Verify env vars are set before calling:
- `READER_URL` — deployed reader URL (e.g. `https://deep-paper-reader.vercel.app`)
- `READER_PASSWORD` — password for API authentication

If either is missing, tell the user to set them in their shell profile.

## Execution

```bash
curl -s -X POST "${READER_URL}/api/documents" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${READER_PASSWORD}" \
  -d "{\"url\": \"$ARGUMENTS\"}"
```

## Response Handling

- **201**: Success. Show the `title` field from the JSON response.
- **401**: Wrong password. Tell user to check `READER_PASSWORD`.
- **502**: URL unreachable or returned an error.
- **422**: Page content could not be extracted (likely a JS-rendered SPA).
- **503**: Blob storage not configured on the server.
