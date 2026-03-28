import { JSDOM } from "jsdom"
import { Readability } from "@mozilla/readability"
import TurndownService from "turndown"

export async function extractUrlContent(
  url: string
): Promise<{ title: string; content: string }> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`)
  }

  const html = await res.text()
  const dom = new JSDOM(html, { url })
  const article = new Readability(dom.window.document).parse()

  if (!article?.content) {
    throw new Error("Could not extract article content")
  }

  const turndown = new TurndownService({ headingStyle: "atx" })
  return {
    title: article.title ?? url,
    content: turndown.turndown(article.content),
  }
}
