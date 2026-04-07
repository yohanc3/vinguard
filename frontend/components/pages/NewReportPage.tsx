"use client"

import { useState, useEffect } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { StepIndicator } from "@/components/new-report/step-indicator"
import { NewReportStepListingCard } from "@/components/new-report/new-report-step-listing-card"
import { NewReportStepCarfaxCard } from "@/components/new-report/new-report-step-carfax-card"
import { NewReportStepReviewCard } from "@/components/new-report/new-report-step-review-card"
import { NewReportStepNavigation } from "@/components/new-report/new-report-step-navigation"
import type { NewReportPageProps, Step, ScrapeResult } from "@/components/new-report/new-report-page-types"
import { STEPS } from "@/components/new-report/new-report-page-types"
import { useUrlValidation } from "@/hooks/use-url-validation"
import { usePdfExtraction } from "@/hooks/use-pdf-extraction"
import { useTRPC } from "@/lib/trpc"
import { useMutation, useQuery } from "@tanstack/react-query"

export function NewReportPage({ onBack, onComplete }: NewReportPageProps) {
  const trpc = useTRPC()
  const [currentStep, setCurrentStep] = useState<Step>(1)

  const [listingUrl, setListingUrl] = useState("")
  const [scrapeJobId, setScrapeJobId] = useState<string | null>(null)
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null)
  const [scrapeError, setScrapeError] = useState<string | null>(null)

  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [carfaxText, setCarfaxText] = useState<string | null>(null)
  const [carReportKey, setCarReportKey] = useState<string | null>(null)

  const [isPdfPipelineBusy, setIsPdfPipelineBusy] = useState(false)
  const [pdfUploadError, setPdfUploadError] = useState<string | null>(null)
  const [createReportError, setCreateReportError] = useState<string | null>(null)

  const { isValid: urlValid } = useUrlValidation(listingUrl)
  const { extractText, error: pdfError } = usePdfExtraction()

  const startScrapeMutation = useMutation(trpc.scrape.startScrape.mutationOptions())

  const scrapeStatusQuery = useQuery({
    ...trpc.scrape.getScrapeStatus.queryOptions({ jobId: scrapeJobId ?? "" }),
    enabled: Boolean(scrapeJobId),
    refetchInterval: function(query) {
      const status = query.state.data?.status
      if (status === "completed" || status === "failed") return false
      return 1500
    },
  })

  const getUploadUrlMutation = useMutation(trpc.files.getPresignedUploadUrl.mutationOptions())
  const createReportMutation = useMutation({
    ...trpc.cars.createReport.mutationOptions(),
    onError: function onCreateReportError(err) {
      const message = err instanceof Error ? err.message : "Failed to create report"
      setCreateReportError(message)
    },
  })

  useEffect(function handleScrapeComplete() {
    if (scrapeStatusQuery.data?.status === "completed" && scrapeStatusQuery.data.result) {
      setScrapeResult(scrapeStatusQuery.data.result as ScrapeResult)
      setScrapeError(null)
    } else if (scrapeStatusQuery.data?.status === "failed") {
      setScrapeError(scrapeStatusQuery.data.error ?? "Scrape failed")
    }
  }, [scrapeStatusQuery.data])

  async function handleStartScrape() {
    setScrapeError(null)
    setScrapeResult(null)
    try {
      const result = await startScrapeMutation.mutateAsync({ url: listingUrl })
      setScrapeJobId(result.jobId)
    } catch (err) {
      setScrapeError(err instanceof Error ? err.message : "Failed to start scrape")
    }
  }

  async function handlePdfUpload(file: File) {
    setPdfFile(file)
    setCarfaxText(null)
    setCarReportKey(null)
    setPdfUploadError(null)
    setIsPdfPipelineBusy(true)
    try {
      const text = await extractText(file)
      setCarfaxText(text)

      const key = `carfax/${Date.now()}-${file.name}`
      const { url } = await getUploadUrlMutation.mutateAsync({
        key,
        contentType: file.type,
      })

      const putRes = await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })

      if (!putRes.ok) {
        throw new Error(`Upload failed (${putRes.status})`)
      }

      setCarReportKey(key)
    } catch (err) {
      console.error("PDF upload error:", err)
      setPdfUploadError(err instanceof Error ? err.message : "PDF processing failed")
      setCarfaxText(null)
      setCarReportKey(null)
    } finally {
      setIsPdfPipelineBusy(false)
    }
  }

  async function handleCreateReport() {
    if (!scrapeResult || !carfaxText || !carReportKey) return

    setCreateReportError(null)
    try {
      const result = await createReportMutation.mutateAsync({
        marketplaceListing: listingUrl.trim(),
        scrapeResult,
        carfaxText,
        carReportKey,
      })
      onComplete(result.carId)
    } catch (err) {
      console.error("Create report error:", err)
    }
  }

  function canProceedStep1() {
    return scrapeResult !== null
  }

  function canProceedStep2() {
    return carfaxText !== null && carReportKey !== null
  }

  function canProceedStep3() {
    return scrapeResult !== null && carfaxText !== null && carReportKey !== null
  }

  function nextStep() {
    if (currentStep < 3) setCurrentStep((currentStep + 1) as Step)
  }

  function prevStep() {
    if (currentStep > 1) setCurrentStep((currentStep - 1) as Step)
  }

  const isScraping = scrapeJobId !== null && !scrapeResult && !scrapeError

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onBack={onBack} backLabel="Cancel" title="New Report" />

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-10">
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>

        {currentStep === 1 && (
          <NewReportStepListingCard
            listingUrl={listingUrl}
            setListingUrl={setListingUrl}
            urlValid={urlValid}
            isScraping={isScraping}
            scrapeResult={scrapeResult}
            scrapeError={scrapeError}
            handleStartScrape={handleStartScrape}
          />
        )}

        {currentStep === 2 && (
          <NewReportStepCarfaxCard
            pdfFile={pdfFile}
            carfaxText={carfaxText}
            carReportKey={carReportKey}
            isPdfPipelineBusy={isPdfPipelineBusy}
            pdfError={pdfError}
            pdfUploadError={pdfUploadError}
            handlePdfUpload={handlePdfUpload}
          />
        )}

        {currentStep === 3 && (
          <NewReportStepReviewCard
            scrapeResult={scrapeResult}
            pdfFile={pdfFile}
            createReportError={createReportError}
            createReportMutationIsPending={createReportMutation.isPending}
            handleCreateReport={handleCreateReport}
            canProceedStep3={canProceedStep3}
          />
        )}

        <NewReportStepNavigation
          currentStep={currentStep}
          prevStep={prevStep}
          nextStep={nextStep}
          canProceedStep1={canProceedStep1}
          canProceedStep2={canProceedStep2}
          isPdfPipelineBusy={isPdfPipelineBusy}
          carfaxText={carfaxText}
        />
      </main>
    </div>
  )
}
