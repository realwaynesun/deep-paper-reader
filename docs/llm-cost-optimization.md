# LLM 调用优化调研

> 调研日期: 2026-03-28

## 当前项目现状

| 方面 | 状态 | 说明 |
|------|------|------|
| 流式响应 | 已实现 | Vercel AI SDK `streamText()` |
| 客户端缓存 | 已实现 | localStorage LRU，500条上限，translate/ask 命中后跳过 API |
| 请求取消 | 已实现 | AbortController |
| 输入截断 | 已实现 | summarize 截取前 100K 字符 |
| Token 计数 | 未实现 | |
| 服务端缓存 | 未实现 | |
| 批量请求 | 未实现 | |
| 模型降级/路由 | 未实现 | |
| 重试/回退 | 未实现 | |

---

## 1. 各家 API 价格对比（2026.03）

### 按百万 token 计价

| Provider | Model | Input | Output | 备注 |
|----------|-------|-------|--------|------|
| **Google** | Gemini 2.5 Flash | **免费** | **免费** | 250 req/day, 10 RPM |
| **Google** | Gemini 2.5 Pro | **免费** | **免费** | 100 req/day, 5 RPM |
| **DeepSeek** | V3.2 | $0.28 | $0.42 | cache 命中 $0.028（90% off） |
| **DeepSeek** | V4 | $0.30 | $0.50 | GPT-5 级别质量 |
| **Groq** | Llama 3.3 70B | $0.59 | $0.79 | 免费额度: 1K req/day |
| **Groq** | Qwen3 32B | $0.29 | $0.59 | 免费额度: 1K req/day |
| **OpenAI** | GPT-4o Mini | $0.15 | $0.60 | |
| **OpenAI** | GPT-4o | $2.50 | $10.00 | |
| **Anthropic** | Haiku 3 | $0.25 | $1.25 | |
| **Anthropic** | Haiku 4.5 | $1.00 | $5.00 | |
| **Anthropic** | Sonnet 4.6 | $3.00 | $15.00 | |

### 实际使用成本估算

一段学术论文（~200词）翻译一次：约 300 input tokens + 300 output tokens

| Provider | 单次翻译成本 | 每天 200 次 |
|----------|------------|------------|
| Gemini 免费档 | $0 | $0 |
| DeepSeek V3.2 | $0.0002 | $0.04/天 |
| GPT-4o Mini | $0.0002 | $0.04/天 |
| Claude Sonnet 4.6 | $0.005 | $1.00/天 |
| GPT-4o | $0.004 | $0.80/天 |

**结论：个人使用场景下，Gemini 免费档或 DeepSeek 就够了，月成本接近 $0。**

---

## 2. 缓存策略

### 2.1 API 级别的 Prompt Caching（各厂商自带）

各家都支持对 **相同 system prompt 前缀** 复用计算缓存，无需代码改动即可生效：

| Provider | 节省比例 | 最低 token 数 | TTL | 需要配置 |
|----------|---------|-------------|-----|---------|
| OpenAI | 50% | 1,024 | 5-10 min | 自动 |
| Anthropic | **90%** | 1,024-4,096 | 5 min / 1 hr | 加一个字段 `cache_control` |
| Google | **90%** | 1,024 (2.5+) | 自定义 | 自动（implicit） |

对本项目意义：translate/ask/summarize 三个路由的 system prompt 固定不变，每次请求都能命中 prompt cache，**系统提示部分成本自动降 50-90%**。

### 2.2 客户端响应缓存（已实现 → 可升级）

**当前实现：** localStorage + LRU（500 条）
- 缓存 key = `{type}:{normalized_text}`
- 命中则直接返回，不调 API

**可优化方向：**

| 升级 | 说明 | 收益 |
|------|------|------|
| localStorage → IndexedDB | 容量从 5MB 提升到数百 MB | 支持重度用户长期积累 |
| Vercel AI SDK Middleware | 框架原生支持缓存 streamText | 缓存后可模拟流式回放 |
| 缓存 summarize 结果 | 目前 summarize 未缓存 | 避免重复分析同一篇论文 |

### 2.3 语义缓存（本项目不需要）

GPTCache 等工具通过 embedding 相似度匹配"语义相近"的查询。但本项目的查询是模板化的（固定 prompt + 选中文本），精确匹配已经够用，语义缓存是过度设计。

### 2.4 翻译工具的缓存实践

| 工具 | 缓存方案 | 教训 |
|------|---------|------|
| **沉浸式翻译** | IndexedDB 按句缓存 | 早期每句一个 DB 导致存储爆炸；空/乱码响应入缓存后无法重译 |
| **bilingual_book_maker** | 断点续翻（临时 epub） | 不是真正的缓存，仅支持中断恢复 |
| **epub-translator** | 文件系统 SHA-512 哈希 | 每个 chunk 一个文件，验证行数一致性 |
| **zotero-pdf-translate** | Zotero 注释存储 | 翻译结果保存为文档注释 |

**核心教训：缓存前必须验证响应质量（非空、非乱码），否则坏结果被永久缓存。**

---

## 3. Token 优化策略

### 3.1 批量请求（最直接有效）

当前：每选中一段文本，发一次 API 请求（1 个 system prompt + 1 段文本）

优化：将多段文本合并为一次请求

```
System prompt (200 tokens) × 10次 = 2000 tokens
→ 合并后只发 1 次 = 200 tokens（节省 90%）
```

适用场景：批量翻译（如整页翻译、全文翻译）

另外 OpenAI/Anthropic 都提供 Batch API，异步处理享受 **50% 折扣**。

### 3.2 模型路由/降级

按任务复杂度选模型：

| 任务 | 推荐模型 | 原因 |
|------|---------|------|
| 单词解释 (ask) | GPT-4o Mini / Haiku | 简单查询，便宜模型即可 |
| 段落翻译 (translate) | Sonnet / GPT-4o | 需要准确性 |
| 论文结构 (summarize) | Flash / Mini | 结构化输出，不需要最强模型 |

级联策略：先用便宜模型，质量不达标再用贵模型。RouteLLM 等框架可自动路由 70-80% 请求到便宜模型，维持 95%+ 质量。

### 3.3 上下文优化

当前 ask 路由发送 ±200 字符上下文，已经很精简。

summarize 路由截取前 100K 字符 → 可以考虑先提取标题/摘要再发送，进一步减少 token。

### 3.4 Prompt 压缩（本项目不需要）

LLMLingua 等工具可压缩 2-20x，但本项目 system prompt 本身很短（< 500 tokens），压缩收益极低。

---

## 4. API Key 管理模式

### 与本项目相关的模式

| 模式 | 代表 | 适合场景 |
|------|------|---------|
| **BYOK（自带 key）** | FluentRead, Read Frog, **本项目** | 自用/技术用户 |
| **BYOK + 免费默认** | 混合模式 | 降低门槛：默认用 Gemini 免费档，高级用户自带 key |
| **共享 key + 订阅** | 沉浸式翻译 | 商业产品，需要后端基础设施 |

**本项目建议：保持 BYOK，加一个 Gemini 免费档作为默认选项（无需 API key 即可使用）。**

---

## 5. 实际行动建议（按优先级）

| 优先级 | 行动 | 成本 | 收益 |
|--------|------|------|------|
| 1 | **升级缓存到 IndexedDB** | 低 | localStorage 5MB 不够长期使用 |
| 2 | **缓存 summarize 结果** | 低 | 同一篇论文不重复分析 |
| 3 | **加入 Gemini 免费档** | 低 | 零成本使用，无需 API key |
| 4 | **加入 DeepSeek** | 低 | 极低成本，翻译质量好 |
| 5 | **Anthropic prompt cache** | 低 | system prompt 加 `cache_control` 字段即可省 90% |
| 6 | **缓存响应前验证** | 低 | 防止空/乱码响应被缓存（沉浸式翻译踩过的坑） |
| 7 | **模型路由** | 中 | ask 用便宜模型，translate 用好模型 |
| 8 | **批量翻译模式** | 中 | 整页/多段合并请求 |

---

## 参考来源

- [OpenAI Pricing](https://openai.com/api/pricing/)
- [Anthropic Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Anthropic Prompt Caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [DeepSeek Pricing](https://api-docs.deepseek.com/quick_start/pricing)
- [Groq Pricing](https://groq.com/pricing)
- [OpenRouter](https://openrouter.ai/pricing)
- [Vercel AI SDK Caching](https://ai-sdk.dev/docs/advanced/caching)
- [GPTCache](https://github.com/zilliztech/GPTCache)
- [LiteLLM](https://github.com/BerriAI/litellm)
- [Immersive Translate Cache Issue #3466](https://github.com/immersive-translate/immersive-translate/issues/3466)
- [bilingual_book_maker](https://github.com/yihong0618/bilingual_book_maker)
- [epub-translator](https://github.com/oomol-lab/epub-translator)
