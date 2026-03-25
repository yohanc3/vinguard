const SUPPORTED_PLATFORMS_PATTERN = /^https?:\/\/(www\.)?(facebook\.com|craigslist\.org|marketplace\.facebook\.com|cars\.com|autotrader\.com|cargurus\.com)/i

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/i

export function validateListingUrl(url: string): { isValid: boolean; error?: string } {
  if (url.length === 0) return { isValid: false }
  
  if (!SUPPORTED_PLATFORMS_PATTERN.test(url)) {
    return { 
      isValid: false, 
      error: "Please enter a valid listing URL from a supported platform" 
    }
  }
  
  return { isValid: true }
}

export function validateVin(vin: string): { isValid: boolean; error?: string } {
  if (vin.length === 0) return { isValid: false }
  
  if (!VIN_PATTERN.test(vin)) {
    return { 
      isValid: false, 
      error: "VIN must be exactly 17 characters (letters and numbers only, no I, O, or Q)" 
    }
  }
  
  return { isValid: true }
}
