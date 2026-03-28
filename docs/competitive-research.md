# Foreign Language Reading Tools - Competitive Research

> Research date: 2026-03-28

## 1. Top Commercial Products

### Immersive Translate (沉浸式翻译)

- **URL**: https://immersivetranslate.com/
- **Type**: Browser extension
- **Open source**: Partial (GitHub 17.4K stars)
- **Users**: 20M+, Chrome 2024 Best Extension
- **Content types**: Web pages, PDF, EPUB, subtitle files (SRT), TXT, video subtitles, manga/images
- **Key features**: Bilingual side-by-side display preserving original layout. Supports 10+ translation engines including LLMs (GPT, DeepSeek, Gemini). Free tier is generous.
- **Pricing**: Free tier + Pro subscription
- **Note**: Dominant in the CJK user market. The benchmark product in this space.

### LingQ

- **URL**: https://www.lingq.com/
- **Type**: Web/mobile app
- **Open source**: No
- **Users**: Millions, 49 languages
- **Content types**: Web articles, books, podcasts, video transcripts, imported text
- **Key features**: Import any content, click-to-translate, word status tracking (known/learning/new), spaced repetition review. Massive built-in content library.
- **Pricing**: Free (limited) / Premium $10/month / Premium Plus $37/month
- **Note**: Strongest for intermediate+ learners doing extensive reading. Founded by polyglot Steve Kaufmann.

### Readlang

- **URL**: https://readlang.com/
- **Type**: Web app + Chrome extension
- **Open source**: No
- **Content types**: Web pages, TXT, EPUB, Kindle. **No PDF support**.
- **Key features**: Instant word/phrase translation while reading. Automatic flashcard creation from looked-up words.
- **Pricing**: Free / Premium ~$5/month
- **Note**: Simplest and most focused reading tool. Good free tier.

### Language Reactor

- **URL**: https://www.languagereactor.com/
- **Type**: Chrome extension
- **Open source**: No
- **Content types**: Netflix, YouTube, podcasts (added Feb 2025), public domain ebooks
- **Key features**: Dual-language subtitles with popup dictionary, advanced playback controls. AI dictionary (added Aug 2024).
- **Pricing**: Free (core) / Pro subscription
- **Note**: Originally "Language Learning with Netflix." The go-to tool for video-based language learning.

### Trancy

- **URL**: https://www.trancy.org/
- **Type**: Chrome extension
- **Open source**: No
- **Content types**: Netflix, YouTube, Disney+, Udemy, Coursera, TED, Amazon Prime, web pages, PDF
- **Key features**: AI bilingual subtitles, GPT-powered grammar analysis, pronunciation scoring, vocabulary flashcards, web + PDF translation.
- **Note**: Widest streaming platform support. Most complete Language Reactor alternative.

### Kindle (Amazon Built-in)

- **Type**: Built into Kindle devices and apps
- **Open source**: No
- **Users**: Hundreds of millions
- **Content types**: Kindle ebooks
- **Key features**: Built-in dictionary lookup, Word Wise (inline simple definitions above difficult words), Vocabulary Builder (flashcards from looked-up words), instant translation via Bing.
- **Note**: Seamlessly integrated reading experience. Word Wise auto-displays hints without tapping.

### Readwise Reader

- **URL**: https://readwise.io/read
- **Type**: Read-it-later app
- **Open source**: No
- **Content types**: Web articles, PDF, newsletters, ebooks, YouTube transcripts, Twitter threads
- **Key features**: AI assistant (Ghostreader) for translation/summarization. Spaced repetition for highlights.
- **Pricing**: $9.99/month (annual)
- **Note**: Not language-learning-specific but powerful for foreign language reading with customizable AI prompts.

### DeepL Document Translation

- **URL**: https://www.deepl.com/
- **Type**: Web app + API
- **Open source**: No
- **Content types**: PDF, DOCX, PPTX, plain text
- **Key features**: High-quality neural translation with layout preservation. OCR for scanned PDFs.
- **Pricing**: Free (3 files/month) / Pro plans
- **Note**: Industry leader for European language pairs. Best translation quality for formal/professional content.

### Other Commercial Products

| Product | Type | Focus | Note |
|---------|------|-------|------|
| **Beelinguapp** | Mobile app | Parallel text stories with audio | 4M+ downloads, 14+ languages |
| **FluentU** | Web/mobile | Real-world video learning | Interactive subtitles, 10 languages, $29.99/month |
| **Lingopie** | Streaming service | TV/movie based learning | Independent streaming platform, not an extension |
| **Migaku** | Extension + app | Streaming content | AI word explanations, evolved from Anki add-ons |
| **Eppika** | Mobile app | Adapted bestseller books | Graded A1-C1 with audio narration |
| **BookTranslator** | Web app | Whole-book AI translation | Full book in ~1 minute, bilingual output |
| **O.Translator** | Web app | AI document translation | Multi-model, up to 500MB PDF |

---

## 2. Open-Source Projects (GitHub)

### zotero-pdf-translate (10.6K stars)

- **URL**: https://github.com/windingwind/zotero-pdf-translate
- **What it does**: Zotero plugin for translating PDF, EPUB, annotations, and notes
- **Content types**: PDF, EPUB, web pages, annotations
- **Key features**: Supports 20+ translation services including LLM APIs. Deeply integrated with Zotero.
- **Note**: The most popular academic paper reading translation tool. Ideal for researchers.

### bilingual_book_maker (9.1K stars)

- **URL**: https://github.com/yihong0618/bilingual_book_maker
- **What it does**: Creates bilingual EPUB/TXT/SRT/PDF books using AI translation
- **Key features**: Batch-translates entire books into bilingual editions. Supports GPT-4, Claude, Gemini, DeepSeek, Llama.
- **Note**: CLI tool. Strong community, active development.

### BabelDOC (8.0K stars)

- **URL**: https://github.com/funstory-ai/BabelDOC
- **What it does**: Scientific paper translation with bilingual comparison layout
- **Content types**: PDF (academic papers)
- **Key features**: Preserves math formulas and tables. Bilingual side-by-side layout.
- **Note**: Purpose-built for academic papers.

### FluentRead 流畅阅读 (6.6K stars)

- **URL**: https://github.com/Bistutu/FluentRead
- **What it does**: Open-source browser translation plugin with bilingual display
- **Content types**: Web pages
- **Key features**: Supports 20+ translation engines including traditional MT and LLMs. Supports Ollama for local models.
- **Note**: Fully open source alternative to Immersive Translate.

### Read Frog 陪读蛙 (5.0K stars)

- **URL**: https://github.com/mengxi-ream/read-frog
- **What it does**: Open-source immersive translation browser extension
- **Content types**: Web pages, YouTube subtitles
- **Key features**: Bilingual mode or translation-only. Connects to 20+ AI providers. Uses Mozilla Readability for clean article extraction.
- **Note**: Active development (last updated Jan 2026).

### Yomitan (2.4K stars)

- **URL**: https://github.com/yomidevs/yomitan
- **What it does**: Popup dictionary browser extension (successor to Yomichan)
- **Content types**: Any web page text
- **Key features**: Hover for definitions/readings/pitch accent/stroke order. Automatic Anki flashcard creation via AnkiConnect.
- **Note**: Gold standard for Japanese reading. Expanding to other languages.

### jidoujisho (1.6K stars)

- **URL**: https://github.com/arianneorpilla/jidoujisho
- **What it does**: Mobile immersion language learning suite (Flutter/Dart)
- **Content types**: Videos, EPUB/HTMLZ ebooks, pre-processed manga (Mokuro)
- **Key features**: Built-in video player + reader + dictionary + flashcard creator. All-in-one mobile app.
- **Note**: Strong Japanese focus.

### LUTE v3 (1.3K stars)

- **URL**: https://github.com/LuteOrg/lute-v3
- **What it does**: Self-hosted web app for learning languages through reading
- **Content types**: Plain text, imported articles
- **Key features**: Click words for definitions, track vocabulary status, spaced repetition review. Installable via `pip install lute3`.
- **Note**: Privacy-first, self-hosted. Modern Python/Flask rewrite of classic LWT (Learning with Texts).

---

## 3. Supporting Tools

### Anki

- **URL**: https://apps.ankiweb.net/
- **Open source**: Yes (AGPL)
- **What it does**: Spaced repetition flashcard system. The de facto standard for vocabulary retention.
- **Note**: Many reading tools (Yomitan, jidoujisho, Kindle, Migaku) export directly to Anki. FSRS algorithm (added 2023) is state-of-the-art for memory scheduling. 1,600+ add-ons.

---

## 4. Feature Inspiration

Features from these tools that would be useful for personal reading workflow:

| Feature | Reference | Note |
|---------|----------|------|
| Bilingual side-by-side display | Immersive Translate, BabelDOC | Original + translation side by side, rather than panel |
| Anki export for looked-up terms | Yomitan, jidoujisho | One-click export terms to Anki for review |
| Vocabulary highlighting | LingQ, Kindle Word Wise | Visually mark known/unknown words in text |
| Local model support (Ollama) | FluentRead | Offline use, no API cost |
