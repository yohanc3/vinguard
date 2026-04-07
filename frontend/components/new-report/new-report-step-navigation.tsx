"use client"

import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Step } from "@/components/new-report/new-report-page-types"

interface NewReportStepNavigationProps {
  currentStep: Step
  prevStep: () => void
  nextStep: () => void
  canProceedStep1: () => boolean
  canProceedStep2: () => boolean
  isPdfPipelineBusy: boolean
  carfaxText: string | null
}

export function NewReportStepNavigation({
  currentStep,
  prevStep,
  nextStep,
  canProceedStep1,
  canProceedStep2,
  isPdfPipelineBusy,
  carfaxText,
}: NewReportStepNavigationProps) {
  return (
    <div className="flex items-center justify-between mt-8">
      <Button
        variant="ghost"
        onClick={prevStep}
        disabled={currentStep === 1}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {currentStep < 3 && (
        <Button
          onClick={nextStep}
          disabled={
            currentStep === 1
              ? !canProceedStep1()
              : !canProceedStep2() || isPdfPipelineBusy
          }
          className="bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentStep === 2 && isPdfPipelineBusy ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {carfaxText ? "Uploading..." : "Processing..."}
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      )}
    </div>
  )
}
