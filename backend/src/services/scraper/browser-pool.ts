import { chromium, Browser, BrowserContext, Page } from "playwright"
import { logger } from "../../logger"

let browser: Browser | null = null
let context: BrowserContext | null = null

const MAX_TABS = 4
const activePages = new Set<Page>()

export async function getBrowser(verbose: boolean): Promise<Browser> {
  if (!browser) {
    const t0 = Date.now()
    if (verbose) {
      logger.debug({
        message: "scraper.browser_pool.launch_begin",
        headless: true,
      })
    }
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-dev-shm-usage",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
      ],
    })
    if (verbose) {
      logger.debug({
        message: "scraper.browser_pool.launch_done",
        ms: Date.now() - t0,
      })
    }
  }
  return browser
}

async function getContext(verbose: boolean): Promise<BrowserContext> {
  if (!context) {
    const t0 = Date.now()
    if (verbose) {
      logger.debug({ message: "scraper.browser_pool.context_create_begin" })
    }
    const b = await getBrowser(verbose)
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
    if (verbose) {
      logger.debug({
        message: "scraper.browser_pool.context_create_done",
        ms: Date.now() - t0,
      })
    }
  }
  return context
}

export async function acquirePage(verbose: boolean): Promise<Page> {
  const tAcquire = Date.now()
  if (verbose) {
    logger.debug({
      message: "scraper.browser_pool.acquire_begin",
      activePages: activePages.size,
      maxTabs: MAX_TABS,
    })
  }

  let waited = false
  while (activePages.size >= MAX_TABS) {
    if (verbose && !waited) {
      logger.debug({
        message: "scraper.browser_pool.acquire_wait_pool_full",
        activePages: activePages.size,
      })
      waited = true
    }
    await new Promise(function wait(res) {
      setTimeout(res, 200)
    })
  }

  if (verbose && waited) {
    logger.debug({
      message: "scraper.browser_pool.acquire_wait_done",
      waitMs: Date.now() - tAcquire,
      activePages: activePages.size,
    })
  }

  const tNew = Date.now()
  const ctx = await getContext(verbose)
  const page = await ctx.newPage()
  activePages.add(page)
  if (verbose) {
    logger.debug({
      message: "scraper.browser_pool.new_page_opened",
      ms: Date.now() - tNew,
      activePagesAfter: activePages.size,
    })
  }

  return page
}

export async function releasePage(page: Page, verbose: boolean): Promise<void> {
  const t0 = Date.now()
  if (verbose) {
    logger.debug({
      message: "scraper.browser_pool.page_close_begin",
      activePagesBefore: activePages.size,
    })
  }

  try {
    await page.close()
  } catch (err) {
    if (verbose) {
      logger.debug({
        message: "scraper.browser_pool.page_close_error",
        errMessage: err instanceof Error ? err.message : "unknown",
      })
    }
  }

  activePages.delete(page)
  if (verbose) {
    logger.debug({
      message: "scraper.browser_pool.page_close_done",
      ms: Date.now() - t0,
      activePagesAfter: activePages.size,
    })
  }
}

export function getActivePageCount(): number {
  return activePages.size
}
