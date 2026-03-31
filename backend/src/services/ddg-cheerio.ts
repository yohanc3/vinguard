import * as cheerio from "cheerio"

export interface DdgSource {
  url: string
  title?: string
  extractedText: string
}

const headers: Record<string, string> = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim()
}

function sliceText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars)
}

export async function searchDuckDuckGoPlain(query: string): Promise<string[]> {
  // Parse DDG HTML and extract the real destination URLs (no redirect fetching).
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
  const res = await fetch(url, { method: "GET", headers })
  if (!res.ok) throw new Error(`DDG request failed: ${res.status}`)

  const html = await res.text()
  const $ = cheerio.load(html)

  // Organic results
  const anchors = $("a.result__a").toArray()
  const results: string[] = []

  for (let i = 0; i < anchors.length && results.length < 5; i++) {
    const el = anchors[i]
    let link = $(el).attr("href") || ""
    if (!link) continue

    // Handle DDG redirect wrapper:
    //   /l/?uddg=<DEST>&rut=<TOKEN>...
    // Convert it to the destination URL.
    link = link.replace(/^https?:\/\/duckduckgo\.com\/l\/\?uddg=/, "")
    link = link.replace(/^\/\/duckduckgo\.com\/l\/\?uddg=/, "")
    link = link.replace(/^\/l\/\?uddg=/, "")

    try {
      link = decodeURIComponent(link)
    } catch {
      // best-effort
    }

    // cut everything after "rut" if present
    const rutIndex = link.indexOf("rut")
    if (rutIndex !== -1) {
      link = link.slice(0, rutIndex)
      link = link.replace(/[?&]$/, "")
    }

    try {
      const abs = new URL(link).toString()
      if (abs.startsWith("http://") || abs.startsWith("https://")) results.push(abs)
    } catch {
      // ignore invalid
    }
  }

  return results
}

export async function extractFromSources(
  urls: string[],
  maxSources: number,
  maxCharsPerSource: number,
): Promise<DdgSource[]> {
  const sliced = urls.slice(0, maxSources)

  const results: DdgSource[] = []
    
console.log("urls to fetch")
  for (const url of sliced) {
    if (!url || !(url.startsWith("http://") || url.startsWith("https://"))) continue
    console.log("[ddg-cheerio] extractFromSources processing url", url)
    
    try {
      console.log("fetching url")
      const res = await fetch(url, { method: "GET", headers })
      if (!res.ok) continue
    
      console.log("transforming html into text") 
      const html = await res.text()
      const $ = cheerio.load(html)
      
      console.log("[ddg-cheerio] extractFromSources removing non-content")
      $("script, style, noscript, header, footer, nav, form").remove()

      const candidates = ["main", "article", "body"]
      let extracted = ""

      for (const sel of candidates) {
        const el = $(sel).first()
        const text = el.text()
        const normalized = normalizeWhitespace(text)
        if (normalized && normalized.length > extracted.length) extracted = normalized
      }

      results.push({
        url,
        extractedText: sliceText(extracted || "", maxCharsPerSource),
      })
    } catch (err) {
      console.log("[ddg-cheerio] extractFromSources error for", url, err)
      continue
    }
  }

  return results
}

export async function extractFromSourcesParallel(
  urls: string[],
  maxSources: number,
  maxCharsPerSource: number,
): Promise<DdgSource[]> {
  const sliced = urls.slice(0, maxSources)
  console.log("[ddg-cheerio] extractFromSourcesParallel start", { count: sliced.length })

  const results = await Promise.all(
    sliced.map(async function extractOne(url): Promise<DdgSource | null> {
      if (!url || !(url.startsWith("http://") || url.startsWith("https://"))) return null

      try {
        console.log("[ddg-cheerio] extractFromSourcesParallel fetching", url)
        const res = await fetch(url, { method: "GET", headers })
        if (!res.ok) return null

        const html = await res.text()
        const $ = cheerio.load(html)
        $("script, style, noscript, header, footer, nav, form").remove()

        const candidates = ["main", "article", "body"]
        let extracted = ""
        for (const sel of candidates) {
          const el = $(sel).first()
          const text = el.text()
          const normalized = normalizeWhitespace(text)
          if (normalized && normalized.length > extracted.length) extracted = normalized
        }

        return {
          url,
          extractedText: sliceText(extracted || "", maxCharsPerSource),
        }
      } catch {
        return null
      }
    }),
  )

  return results.filter((r): r is DdgSource => r !== null)
}

export async function getDdGContextHiddenLimits(params: {
  queries: string[]
  maxSources: number
  maxCharsPerSource: number
  ddgMaxSources: number
}): Promise<{ sources: DdgSource[] }> {
  const all: DdgSource[] = []

  for (const q of params.queries) {
    const urls = await searchDuckDuckGoPlain(q)
    const extracted = await extractFromSources(urls, params.maxSources, params.maxCharsPerSource)
    all.push(...extracted)
  }

  return { sources: all.slice(0, params.maxSources) }
}

