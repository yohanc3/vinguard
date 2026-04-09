const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/i

export function validateVin(vin: string): { isValid: boolean; error?: string } {
  if (vin.length === 0) return { isValid: false }

  if (!VIN_PATTERN.test(vin)) {
    return {
      isValid: false,
      error: "VIN must be exactly 17 characters (letters and numbers only, no I, O, or Q)",
    }
  }

  return { isValid: true }
}
