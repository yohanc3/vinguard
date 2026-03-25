import { useState, useEffect } from "react"
import { validateVin } from "#/lib/validation"

export function useVinValidation(vin: string) {
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [error, setError] = useState<string | undefined>()

  useEffect(function() {
    if (vin.length === 0) {
      setIsValid(null)
      setError(undefined)
      return
    }

    const result = validateVin(vin)
    setIsValid(result.isValid)
    setError(result.error)
  }, [vin])

  return { isValid, error }
}
