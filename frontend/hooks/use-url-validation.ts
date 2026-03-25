import { useState, useEffect } from "react"
import { validateListingUrl } from "#/lib/validation"

export function useUrlValidation(url: string) {
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [error, setError] = useState<string | undefined>()

  useEffect(function() {
    if (url.length === 0) {
      setIsValid(null)
      setError(undefined)
      return
    }

    const result = validateListingUrl(url)
    setIsValid(result.isValid)
    setError(result.error)
  }, [url])

  return { isValid, error }
}
