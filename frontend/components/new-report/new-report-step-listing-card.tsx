"use client"

import {
  Link2,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { ScrapeResult } from "@/components/new-report/new-report-page-types"

interface NewReportStepListingCardProps {
  listingUrl: string
  setListingUrl: (value: string) => void
  urlValid: boolean | null
  isScraping: boolean
  scrapeResult: ScrapeResult | null
  scrapeError: string | null
  handleStartScrape: () => void
}

export function NewReportStepListingCard({
  listingUrl,
  setListingUrl,
  urlValid,
  isScraping,
  scrapeResult,
  scrapeError,
  handleStartScrape,
}: NewReportStepListingCardProps) {
  return (
    <Card className="bg-card/50 border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <Link2 className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-xl text-foreground">Paste Listing URL</CardTitle>
            <CardDescription>
              Enter the URL of the vehicle listing from Facebook Marketplace or other platforms
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={listingUrl}
              onChange={(e) => setListingUrl(e.target.value)}
              placeholder="https://www.facebook.com/marketplace/item/..."
              disabled={isScraping || scrapeResult !== null}
              className={`pl-12 pr-12 h-14 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground font-mono text-sm ${
                urlValid === true
                  ? "border-emerald-500/50 focus:border-emerald-500"
                  : urlValid === false
                  ? "border-rose-500/50 focus:border-rose-500"
                  : "focus:border-primary/50"
              }`}
            />
            {urlValid !== null && !isScraping && !scrapeResult && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {urlValid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                )}
              </div>
            )}
          </div>

          {urlValid === false && (
            <p className="text-sm text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Please enter a valid listing URL from a supported platform
            </p>
          )}

          {scrapeError && (
            <p className="text-sm text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {scrapeError}
            </p>
          )}
        </div>

        {/* Scrape Status */}
        {isScraping && (
          <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            <div>
              <p className="text-sm font-medium text-blue-300">Fetching listing data...</p>
              <p className="text-xs text-blue-400/70">This may take a few seconds</p>
            </div>
          </div>
        )}

        {/* Scrape Success */}
        {scrapeResult && (
          <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <p className="text-sm font-medium text-emerald-600">Listing fetched successfully</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Price:</span>
                <span className="ml-2 text-foreground font-medium">{scrapeResult.price ?? "N/A"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Mileage:</span>
                <span className="ml-2 text-foreground font-medium">{scrapeResult.miles ?? "N/A"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Photos:</span>
                <span className="ml-2 text-foreground font-medium">{scrapeResult.photos.length} images</span>
              </div>
            </div>
          </div>
        )}

        {/* Fetch Button */}
        {!scrapeResult && (
          <Button
            onClick={handleStartScrape}
            disabled={!urlValid || isScraping}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white"
          >
            {isScraping ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                Fetch Listing
              </>
            )}
          </Button>
        )}

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Supported Platforms</p>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-lg border border-border">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-muted-foreground">Facebook Marketplace</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
