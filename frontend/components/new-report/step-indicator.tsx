import { CheckCircle2 } from "lucide-react"

interface Step {
  number: number
  label: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  function getStepStatus(stepNumber: number) {
    if (stepNumber < currentStep) return "complete"
    if (stepNumber === currentStep) return "current"
    return "upcoming"
  }

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const status = getStepStatus(step.number)
        return (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  status === "complete"
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : status === "current"
                    ? "bg-background border-emerald-500 text-emerald-600"
                    : "bg-background border-border text-muted-foreground"
                }`}
              >
                {status === "complete" ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span className="font-mono font-bold">{step.number}</span>
                )}
              </div>
              <div className="hidden sm:block">
                <p
                  className={`text-sm font-medium ${
                    status === "current" ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 ${
                  status === "complete" ? "bg-emerald-500" : "bg-border"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
