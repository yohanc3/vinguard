import { Page } from "playwright"
import { acquirePage, releasePage } from "./browser-pool"
import { logger } from "../../logger"

export interface ScrapedListing {
    miles: string | null
    price: string | null
    photos: string[]
    details: string | null
}

function urlSummary(url: string): { host: string; pathLen: number } {
    try {
        const u = new URL(url)
        return { host: u.host, pathLen: u.pathname.length }
    } catch {
        return { host: "(invalid)", pathLen: 0 }
    }
}

async function bypassLoginModal(page: Page, verbose: boolean): Promise<void> {
    if (verbose) {
        logger.debug({ message: "scraper.playwright.bypass_modal_begin" })
    }
    try {
        const closeModalButton = page.getByLabel("Close")
        await closeModalButton.click({ delay: 100 })

        if (await closeModalButton.isVisible().catch(() => false)) {
            await closeModalButton.click()
            if (verbose) {
                logger.debug({ message: "scraper.playwright.bypass_modal_second_click" })
            }
        } else if (verbose) {
            logger.debug({ message: "scraper.playwright.bypass_modal_first_click_only" })
        }
    } catch {
        if (verbose) {
            logger.debug({ message: "scraper.playwright.bypass_modal_skipped" })
        }
    }
}

async function scrapeListingData(page: Page, url: string, verbose: boolean): Promise<ScrapedListing> {
    const { host } = urlSummary(url)
    const tGoto = Date.now()
    if (verbose) {
        logger.debug({
            message: "scraper.playwright.goto_begin",
            host,
            waitUntil: "domcontentloaded",
        })
    }
    const response = await page.goto(url, { waitUntil: "domcontentloaded" })
    if (verbose) {
        logger.debug({
            message: "scraper.playwright.goto_done",
            ms: Date.now() - tGoto,
            httpStatus: response?.status() ?? null,
            finalUrlLength: page.url().length,
        })
    }

    // await bypassLoginModal(page, verbose)
    const emailLocator = page.getByRole('textbox', { name: 'Email or mobile number' })
    await emailLocator.waitFor({state: 'visible'})

    if (verbose) {
        logger.debug({
            message: "scraper.playwright.view_email_and_password",
        })
    }

    const passwordLocator = page.getByRole('textbox', { name: 'Password' })
    await passwordLocator.waitFor({state: 'visible'})

    if (verbose) {
        logger.debug({
            message: "scraper.playwright.write_email_and_password",
        })
    }

    await emailLocator.fill(process.env.FACEBOOK_EMAIL!)
    await passwordLocator.fill(process.env.FACEBOOK_PASSWORD!)

    const seeMore = page.locator("span", { hasText: "See more" }).last()
    const seeMoreVisible = await seeMore.isVisible().catch(() => false)
    if (seeMoreVisible) {
        const tClick = Date.now()
        await seeMore.click()
        if (verbose) {
            logger.debug({
                message: "scraper.playwright.see_more_clicked",
                ms: Date.now() - tClick,
            })
        }
    } else if (verbose) {
        logger.debug({ message: "scraper.playwright.see_more_skipped" })
    }

    const tEval = Date.now()
    if (verbose) {
        logger.debug({ message: "scraper.playwright.dom_evaluate_begin" })
    }
    const data = await page.evaluate(() => {
        function getText(el: Element | null | undefined): string | null {
            return el?.textContent?.trim() ?? null
        }

        const allSpans = document.querySelectorAll("span")

        const milesEl = Array.from(allSpans).find((el) => el.innerText?.includes("Driven"))
        const miles = getText(milesEl)?.replace("Driven", "")?.replace("miles", "")?.trim() ?? null

        const priceEl = Array.from(allSpans).find((el) => el.innerText?.includes("$"))
        const price = getText(priceEl)?.replace("$", "")?.replace(",", "") ?? null

        const detailsEl = Array.from(allSpans).find((el) => el.innerText?.includes("See less"))
        const details = detailsEl?.innerText?.replace("See less", "").trim() ?? null

        const productPhotos = document.querySelectorAll('img[alt*="Product photo"]')
        const photos = Array.from(productPhotos)
            .map((img) => (img as HTMLImageElement).src)
            .filter((src) => src)

        return { miles, price, details, photos }
    })
    if (verbose) {
        logger.debug({
            message: "scraper.playwright.dom_evaluate_done",
            ms: Date.now() - tEval,
            photoCount: data.photos.length,
            hasMiles: Boolean(data.miles),
            hasPrice: Boolean(data.price),
            hasDetails: Boolean(data.details),
        })
    }

    return data
}

export async function scrapeWithPlaywright(
    url: string,
    verbose: boolean,
    jobId?: string,
): Promise<ScrapedListing> {
    const tRun = Date.now()
    const { host } = urlSummary(url)
    if (verbose) {
        logger.debug({ message: "scraper.playwright.scrape_begin", host, jobId: jobId ?? null })
    }

    const sessionOpts = jobId !== undefined ? { jobId } : undefined
    const page = await acquirePage(verbose, sessionOpts)

    try {
        const result = await scrapeListingData(page, url, verbose)
        if (verbose) {
            logger.debug({
                message: "scraper.playwright.scrape_done",
                ms: Date.now() - tRun,
                host,
                photoCount: result.photos.length,
            })
        }
        return result
    } catch (err) {
        if (verbose) {
            logger.debug({
                message: "scraper.playwright.scrape_error",
                ms: Date.now() - tRun,
                host,
                errMessage: err instanceof Error ? err.message : "unknown",
                errName: err instanceof Error ? err.name : "unknown",
            })
        }
        throw err
    } finally {
        await releasePage(page, verbose, sessionOpts)
    }
}
