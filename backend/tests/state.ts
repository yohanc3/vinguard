/**
 * Shared test state across test files
 */

import type { Hono } from "hono"

export const testState = {
  app: null as Hono | null,
  authToken: null as string | null,
  userId: null as number | null,
  createdCarId: null as string | null,
  palantirAvailable: false,
}

export const TEST_USER = {
    email: `test-${Date.now()}@vinguard.test`,
    password: "SecureTestPassword123!",
}

// Generate unique ID for each test run
const testRunId = Date.now().toString()

export const TEST_CAR = {
    id: `test-car-${testRunId}`,
    userId: "test-user-1",
    vin: "4T1BF1FK5CU123456",
    make: "TestMake",
    model: "TestModel",
    year: 2024,
    trim: "Sport",
    color: "Silver",
    bodyStyle: "Sedan",
    engineType: "V6",
    cylinders: 6,
    msrp: 35000,
    listingPrice: 32000,
    listingMileage: "15000",
    listingDetails: ["Single owner", "Clean title", "No accidents"],
    listingPictures: ["https://example.com/pic1.jpg", "https://example.com/pic2.jpg"],
    odometerReadings: [5000, 10000, 15000],
    numberOfPreviousOwners: 1,
    stateOfRegistration: "CA",
    titleStatus: "Clean",
    salvageRecord: "None",
    floodDamageHistory: "None",
    fairMarketValueHigh: 34000,
    fairMarketValueLow: 30000,
    carReport: "https://example.com/report",
}

export const UPDATED_CAR_DATA = {
    listingPrice: 33500,
    color: "Midnight Black",
}

export const TEST_SCRAPE_RESULT = {
    miles: "45000",
    price: "$15,500",
    photos: ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"],
    details: "2019 Honda Accord Sport. Clean title, single owner. Recently serviced.",
}

export const TEST_CARFAX_TEXT = `
CARFAX Vehicle History Report
VIN: 1HGCV1F34KA123456
2019 Honda Accord Sport

Vehicle Information:
- Year: 2019
- Make: Honda
- Model: Accord
- Trim: Sport
- Body Style: Sedan
- Engine: 1.5L I4 Turbo
- Cylinders: 4

Ownership History:
- Number of Owners: 1
- State of Registration: California

Title Information:
- Title Status: Clean
- No Salvage Record
- No Flood Damage

Odometer Readings:
- 12,500 miles (Jan 2020)
- 25,000 miles (Jan 2021)
- 38,000 miles (Jan 2022)
- 45,000 miles (Jan 2023)

Service History:
- Regular oil changes every 5,000 miles
- Brake service at 30,000 miles
- Tire rotation every 7,500 miles

Recalls:
- No open recalls

Estimated Value:
- Fair Market Value: $16,000 - $18,000
`
