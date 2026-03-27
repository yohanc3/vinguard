import { chromium, Browser, BrowserContext, Page } from "playwright"

let browser: Browser | null = null
let context: BrowserContext | null = null

const MAX_TABS = 4
const activePages = new Set<Page>()

export async function getBrowser(): Promise<Browser> {
  if (!browser) {
    console.log("[BrowserPool] Launching browser...")
    browser = await chromium.launch({
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-dev-shm-usage",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
      ],
    })
    console.log("[BrowserPool] Browser launched")
  }
  return browser
}

async function getContext(): Promise<BrowserContext> {
  if (!context) {
    const b = await getBrowser()
    context = await b.newContext({
      viewport: { width: 1080, height: 1920 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      locale: "en-US",
      timezoneId: "America/New_York",
    })

    await context.addInitScript(`
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    `)
  }
  return context
}

export async function acquirePage(): Promise<Page> {
  while (activePages.size >= MAX_TABS) {
    await new Promise((res) => setTimeout(res, 200))
  }

  const ctx = await getContext()
  const page = await ctx.newPage()
  activePages.add(page)

  console.log(`[BrowserPool] Page acquired (${activePages.size}/${MAX_TABS} active)`)
  return page
}

export async function releasePage(page: Page): Promise<void> {
  try {
    await page.close()
  } catch {}

  activePages.delete(page)
  console.log(`[BrowserPool] Page released (${activePages.size}/${MAX_TABS} active)`)
}

export function getActivePageCount(): number {
  return activePages.size
}
