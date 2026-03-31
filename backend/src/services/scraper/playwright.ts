import { Page } from "playwright"
import { acquirePage, releasePage } from "./browser-pool"

export interface ScrapedListing {
  miles: string | null
  price: string | null
  photos: string[]
  details: string | null
}

async function bypassLoginModal(page: Page): Promise<void> {
  try {
    const closeModalButton = page.getByLabel("Close")
    await closeModalButton.click({ delay: 100 })

    if (await closeModalButton.isVisible().catch(() => false)) {
      await closeModalButton.click()
    }
    console.log("[Scraper] Login modal closed")
  } catch {
    console.log("[Scraper] No login modal found")
  }
}

async function scrapeListingData(page: Page, url: string): Promise<ScrapedListing> {
  const start = Date.now()
  console.log(`[Scraper] Navigating to ${url}`)

  await page.goto(url, { waitUntil: "domcontentloaded" })

  await bypassLoginModal(page)

  // Click "See more" if visible
  const seeMore = page.locator("span", { hasText: "See more" }).last()
  if (await seeMore.isVisible().catch(() => false)) {
    await seeMore.click()
  }

  // Extract all data in a single DOM traversal
  const data = await page.evaluate(() => {
    function getText(el: Element | null | undefined): string | null {
      return el?.textContent?.trim() ?? null
    }

    const allSpans = document.querySelectorAll("span")

    // Miles
    const milesEl = Array.from(allSpans).find((el) => el.innerText?.includes("Driven"))
    const miles = getText(milesEl)?.replace("Driven", "")?.replace("miles", "")?.trim() ?? null

    // Price
    const priceEl = Array.from(allSpans).find((el) => el.innerText?.includes("$"))
    const price = getText(priceEl)?.replace("$", "")?.replace(",", "") ?? null

    // Details
    const detailsEl = Array.from(allSpans).find((el) => el.innerText?.includes("See less"))
    const details = detailsEl?.innerText?.replace("See less", "").trim() ?? null

    // Photos
    const productPhotos = document.querySelectorAll('img[alt*="Product photo"]')
    const photos = Array.from(productPhotos)
      .map((img) => (img as HTMLImageElement).src)
      .filter((src) => src)

    return { miles, price, details, photos }
  })

  const elapsed = Date.now() - start
  console.log(
    `[Scraper] Extracted in ${elapsed}ms: miles=${data.miles}, price=${data.price}, photos=${data.photos.length}`
  )

  return data
}

export async function scrapeWithPlaywright(url: string): Promise<ScrapedListing> {
  const page = await acquirePage()

  try {
    const result = await scrapeListingData(page, url)
    return result
  } finally {
    await releasePage(page)
  }
}
