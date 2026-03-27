import { Page } from "playwright"
import { acquirePage, releasePage } from "./browser-pool"

export interface ScrapedListing {
  miles: string | null
  price: string | null
  images: string[]
  details: string | null
}

function transformDotlessClass(cl: string): string {
  return "." + cl.replace(/\s+/g, ".")
}

const listingPriceParentClass = "xyamay9 xv54qhq x18d9i69 xf7dkkf"
const listingPriceClass =
  "x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x676frb x1lkfr7t x1lbecb7 x1s688f xzsf02u"

const listingDetailsParentClass = "xz9dl7a xyri2b xsag5q8 x1c1uobl x126k92a"
const listingDetailsClass =
  "x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x6prxxf xvq8zen xo1l8bm xzsf02u"

const listingImagesParentClass =
  "x6s0dn4 x78zum5 x1y1aw1k xwib8y2 xu6gjpd x11xpdln x1r7x56h xuxw1ft xc9qbxq xw2csxc x10wlt62 xish69e"
const listingImagesClass = "x1fmog5m xu25z0z x140muxe xo1y3bh x5yr21d xl1xv1r xh8yej3"

async function bypassLoginModal(page: Page): Promise<void> {
  try {
    const closeModalButton = page.getByLabel("Close")
    await closeModalButton.waitFor({ state: "visible", timeout: 3000 })
    await closeModalButton.click({ delay: 100 })
    console.log("[Scraper] Login modal closed")
  } catch {
    console.log("[Scraper] No login modal found")
  }
}

async function scrapeListingData(page: Page, url: string): Promise<ScrapedListing> {
  console.log(`[Scraper] Navigating to ${url}`)
  await page.goto(url)

  await bypassLoginModal(page)

  // Open "See more" to get full details
  try {
    const seeMoreLocator = page.locator('div[role="button"]', { hasText: "See more" })
    await seeMoreLocator.waitFor({ state: "visible", timeout: 5000 })
    await seeMoreLocator.click({ delay: 100 })
  } catch {
    console.log("[Scraper] No 'See more' button found")
  }

  // Extract miles
  let miles: string | null = null
  try {
    const milesLocator = page.getByText("Driven")
    const milesText = await milesLocator.evaluate((el) => el.innerHTML)
    miles = milesText?.replace("Driven", "").replace("miles", "").trim() || null
  } catch {
    console.log("[Scraper] Could not extract miles")
  }

  // Extract price
  let price: string | null = null
  try {
    const priceLocator = page
      .locator(transformDotlessClass(listingPriceParentClass))
      .locator("span" + transformDotlessClass(listingPriceClass))
    const priceText = await priceLocator.innerHTML()
    price = priceText?.replace("$", "").replace(",", "") || null
  } catch {
    console.log("[Scraper] Could not extract price")
  }

  // Extract details
  let details: string | null = null
  try {
    const detailsLocator = page
      .locator(transformDotlessClass(listingDetailsParentClass))
      .locator("span" + transformDotlessClass(listingDetailsClass))
    details = await detailsLocator.evaluate((el) => {
      return Array.from(el.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent)
        .join("")
        .trim()
    })
  } catch {
    console.log("[Scraper] Could not extract details")
  }

  // Extract images
  let images: string[] = []
  try {
    images = await page
      .locator("div" + transformDotlessClass(listingImagesParentClass))
      .locator("img" + transformDotlessClass(listingImagesClass))
      .evaluateAll((imgs) =>
        imgs.map((img) => img.getAttribute("src")).filter((src): src is string => src !== null)
      )
  } catch {
    console.log("[Scraper] Could not extract images")
  }

  console.log(`[Scraper] Extracted: miles=${miles}, price=${price}, images=${images.length}`)

  return { miles, price, images, details }
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
