"use client"

import { Car } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface NewReportStepListingCardProps {
  listingYear: string
  setListingYear: (value: string) => void
  listingModel: string
  setListingModel: (value: string) => void
  listingPrice: string
  setListingPrice: (value: string) => void
  listingDescription: string
  setListingDescription: (value: string) => void
}

export function NewReportStepListingCard({
  listingYear,
  setListingYear,
  listingModel,
  setListingModel,
  listingPrice,
  setListingPrice,
  listingDescription,
  setListingDescription,
}: NewReportStepListingCardProps) {
  return (
    <Card className="bg-card/50 border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <Car className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-xl text-foreground">Enter listing details</CardTitle>
            <CardDescription>
              Add the year, model, asking price, and description from the vehicle listing
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="listing-year">Year</Label>
            <Input
              id="listing-year"
              value={listingYear}
              onChange={function onYearChange(e) {
                setListingYear(e.target.value)
              }}
              placeholder="e.g. 2018"
              className="h-11 bg-secondary/50 border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="listing-model">Model</Label>
            <Input
              id="listing-model"
              value={listingModel}
              onChange={function onModelChange(e) {
                setListingModel(e.target.value)
              }}
              placeholder="e.g. Honda Civic EX"
              className="h-11 bg-secondary/50 border-border"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="listing-price">Asking price</Label>
          <Input
            id="listing-price"
            value={listingPrice}
            onChange={function onPriceChange(e) {
              setListingPrice(e.target.value)
            }}
            placeholder="e.g. $12,500 or 12500"
            className="h-11 bg-secondary/50 border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="listing-description">Description</Label>
          <Textarea
            id="listing-description"
            value={listingDescription}
            onChange={function onDescriptionChange(e) {
              setListingDescription(e.target.value)
            }}
            placeholder="Condition, mileage if mentioned, features, seller notes…"
            rows={5}
            className="bg-secondary/50 border-border resize-y min-h-[120px]"
          />
        </div>
      </CardContent>
    </Card>
  )
}
