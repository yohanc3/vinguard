import { chromium, Browser, BrowserContext, Page } from "playwright"
import { join } from "node:path"
import { randomBytes } from "node:crypto"
import { logger } from "../../logger"

let browser: Browser | null = null

const MAX_TABS = 4
const activePages = new Set<Page>()

/** Contexts we started Playwright tracing on (must call stop before close). */
const tracingActiveByContext = new WeakMap<BrowserContext, boolean>()

function volumeBasePath(): string {
    const raw = (process.env.VOLUME_PATH ?? "/app/data").trim()
    return raw.replace(/\/+$/, "") || "/app/data"
}

function tracesDirPath(): string {
    return join(volumeBasePath(), "traces")
}

function isPlaywrightTracingEnabled(): boolean {
    return process.env.PLAYWRIGHT_TRACING === "true"
}

export interface PageSessionOptions {
    jobId?: string
}

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
            headless: false,
            args: [
                "--no-sandbox",
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
                "--disable-web-security",
                "--disable-features=VizDisplayCompositor",
                "--remote-debugging-port=9222",
                "--remote-debugging-address=0.0.0.0"
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

export async function acquirePage(verbose: boolean, opts?: PageSessionOptions): Promise<Page> {
    const jobId = opts?.jobId
    const tAcquire = Date.now()
    if (verbose) {
        logger.debug({
            message: "scraper.browser_pool.acquire_begin",
            activePages: activePages.size,
            maxTabs: MAX_TABS,
            jobId: jobId ?? null,
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
    const b = await getBrowser(verbose)
    const ctx = await b.newContext({
        viewport: { width: 1080, height: 1920 },
        userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        locale: "en-US",
        timezoneId: "America/New_York",
    })

    await ctx.addInitScript(`
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    `)

    const tracingOn = isPlaywrightTracingEnabled()
    if (tracingOn) {
        const tracesDir = tracesDirPath()
        const tTrace = Date.now()
        await ctx.tracing.start({
            screenshots: true,
            snapshots: true,
            sources: true,
        })
        tracingActiveByContext.set(ctx, true)
        console.log(
            JSON.stringify({
                message: "scraper.trace.start",
                jobId: jobId ?? null,
                tracesDir,
                ms: Date.now() - tTrace,
            }),
        )
    } else {
        tracingActiveByContext.set(ctx, false)
    }

    if (verbose) {
        logger.debug({
            message: "scraper.browser_pool.context_create_done",
            ms: Date.now() - tNew,
            perTabContext: true,
        })
    }

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

export async function releasePage(
    page: Page,
    verbose: boolean,
    opts?: PageSessionOptions,
): Promise<void> {
    const jobId = opts?.jobId
    const t0 = Date.now()
    if (verbose) {
        logger.debug({
            message: "scraper.browser_pool.page_close_begin",
            activePagesBefore: activePages.size,
            jobId: jobId ?? null,
        })
    }

    const ctx = page.context()
    const shouldStopTrace = tracingActiveByContext.get(ctx) === true

    if (shouldStopTrace) {
        const suffix = randomBytes(4).toString("hex")
        const tracePath = join(
            tracesDirPath(),
            `trace-${jobId ?? "unknown"}-${Date.now()}-${suffix}.zip`,
        )
        const tStop = Date.now()
        try {
            await ctx.tracing.stop({ path: tracePath })
            console.log(
                JSON.stringify({
                    message: "scraper.trace.saved",
                    jobId: jobId ?? null,
                    tracePath,
                    ms: Date.now() - tStop,
                }),
            )
        } catch (err) {
            console.log(
                JSON.stringify({
                    message: "scraper.trace.stop_error",
                    jobId: jobId ?? null,
                    errMessage: err instanceof Error ? err.message : "unknown",
                }),
            )
        }
        tracingActiveByContext.delete(ctx)
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

    try {
        await ctx.close()
    } catch (err) {
        console.log(
            JSON.stringify({
                message: "scraper.browser_pool.context_close_error",
                jobId: jobId ?? null,
                errMessage: err instanceof Error ? err.message : "unknown",
            }),
        )
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
