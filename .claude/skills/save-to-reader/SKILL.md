---
name: save-to-reader
description: Save a web URL or local file (Markdown, PDF, text) to Deep Paper Reader for later reading with AI-powered translation. Use when user says "/save-to-reader", "save to reader", "save this article", "add to reader", "保存到阅读器", or wants to send a document or web page to Deep Paper Reader. User-invoked only.
---

Save `$ARGUMENTS` (a URL or file path) to Deep Paper Reader.

## Prerequisites

Verify env vars `READER_URL` and `READER_PASSWORD` are set. If missing, tell user to add them to shell profile.

## Determine Input Type

Check if `$ARGUMENTS` starts with `http://` or `https://` (URL) or is a file path.

### URL

```bash
curl -s -X POST "${READER_URL}/api/documents" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${READER_PASSWORD}" \
  -d "{\"url\": \"$ARGUMENTS\"}"
```

### File (.md, .txt, .pdf)

1. Read file content:
   - `.md` / `.txt` — read with the Read tool
   - `.pdf` — extract text: `pdftotext "$ARGUMENTS" -`
2. Use filename (without extension) as title
3. Write JSON to temp file (handles large content and special characters):

```bash
jq -n --arg t "TITLE" --arg c "CONTENT" '{title:$t,content:$c}' > /tmp/reader-upload.json
curl -s -X POST "${READER_URL}/api/documents" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${READER_PASSWORD}" \
  -d @/tmp/reader-upload.json
rm /tmp/reader-upload.json
```

## Response Handling

- **201**: Success. Show the `title` from the response.
- **401**: Wrong password.
- **502/422**: URL fetch or extraction failed.
- **503**: Blob storage not configured.
