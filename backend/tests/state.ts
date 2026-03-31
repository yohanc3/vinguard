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
