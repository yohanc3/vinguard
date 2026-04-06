import * as cheerio from "cheerio"

export interface DdgSource {
    url: string,
    extractedText: string,
    title: string
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

export async function extractFromSourcesParallel(
    urls: string[],
    maxSources: number,
    maxCharsPerSource: number,
): Promise<DdgSource[]> {
    const sliced = urls.slice(0, maxSources)

    const urlPromises = sliced.map(async function extractOne(url): Promise<DdgSource | null> {
        if (!url || !(url.startsWith("http://") || url.startsWith("https://"))) return null

        try {
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

            const siteName = 
                $('meta[property="og:site_name"]').attr("content") ||
                $('meta[property="og:title"]').attr("content") ||
                $("title").text();
    
            return {
                url,
                extractedText: sliceText(extracted || "", maxCharsPerSource),
                title: siteName
            }
        } catch {
            return null
        }
    })

    const results = await Promise.allSettled(urlPromises)

    const fulfilledResults: DdgSource[] = []

    for (const result of results) {

        if (result.status === "fulfilled" && result.value) {
            fulfilledResults.push(result.value)
        }
    }

    return fulfilledResults
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
        const extracted = await extractFromSourcesParallel(urls, params.maxSources, params.maxCharsPerSource)
        all.push(...extracted)
    }

    return { sources: all.slice(0, params.maxSources) }
}

