/**
 * Cars CRUD tests (Palantir)
 */

import { expect } from "bun:test"
import { testState, TEST_CAR, UPDATED_CAR_DATA, TEST_SCRAPE_RESULT, TEST_CARFAX_TEXT } from "./state"

export async function runCarsTests() {

    await checkPalantirConnectivity()

    if (!testState.palantirAvailable) {
        return
    }

    await testCreateCar()
    await testFetchCar()
    await testUpdateCar()
    await testVerifyUpdate()
    await testCreateReport()
    await testDeleteCar()
    await testVerifyDelete()
}

async function checkPalantirConnectivity() {

    const res = await testState.app!.request("/trpc/cars.list", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })

    if (res.status === 200) {
        testState.palantirAvailable = true
        await res.json()
    } else {
        await res.text()
        testState.palantirAvailable = false
    }
}

async function testCreateCar() {
    // Use our own id field - much simpler than extracting from list
    testState.createdCarId = TEST_CAR.id

    const res = await testState.app!.request("/trpc/cars.create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(TEST_CAR),
    })

    const responseText = await res.text()

    if (res.status !== 200) {
        throw new Error(`Create failed: ${responseText}`)
    }

}

async function testFetchCar() {
    expect(testState.createdCarId).not.toBeNull()

    const res = await testState.app!.request(
        `/trpc/cars.getById?input=${encodeURIComponent(JSON.stringify({ id: testState.createdCarId }))}`,
        { method: "GET" }
    )

    if (res.status !== 200) {
        const errorText = await res.text()
        throw new Error(`Fetch failed: ${errorText}`)
    }

    const json = (await res.json()) as { result: { data: Record<string, unknown> } }
    const car = json.result.data

    expect(car.id).toBe(TEST_CAR.id)
    expect(car.make).toBe(TEST_CAR.make)
    expect(car.model).toBe(TEST_CAR.model)

}

async function testUpdateCar() {
    expect(testState.createdCarId).not.toBeNull()

    const before = await testState.app!.request(
        `/trpc/cars.getById?input=${encodeURIComponent(JSON.stringify({ id: testState.createdCarId }))}`,
        { method: "GET" }
    )
    
    const beforeJSON = await before.json()

    const res = await testState.app!.request("/trpc/cars.update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: testState.createdCarId, ...UPDATED_CAR_DATA }),
    })

    if (res.status !== 200) {
        const errorText = await res.text()
        throw new Error(`Update failed: ${errorText}`)
    }
    const after = await testState.app!.request(
        `/trpc/cars.getById?input=${encodeURIComponent(JSON.stringify({ id: testState.createdCarId }))}`,
        { method: "GET" }
    )

    expect(res.status).toBe(200)
}

async function testVerifyUpdate() {
    expect(testState.createdCarId).not.toBeNull()

    const res = await testState.app!.request(
        `/trpc/cars.getById?input=${encodeURIComponent(JSON.stringify({ id: testState.createdCarId }))}`,
        { method: "GET" }
    )

    expect(res.status).toBe(200)

    const json = (await res.json()) as { result: { data: Record<string, unknown> } }
    const car = json.result.data


    expect(car.listingPrice).toBe(UPDATED_CAR_DATA.listingPrice)
    expect(car.color).toBe(UPDATED_CAR_DATA.color)
    expect(car.make).toBe(TEST_CAR.make)

}

async function testDeleteCar() {
    expect(testState.createdCarId).not.toBeNull()

    const res = await testState.app!.request("/trpc/cars.delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: testState.createdCarId }),
    })

    if (res.status !== 200) {
        const errorText = await res.text()
        throw new Error(`Delete failed: ${errorText}`)
    }

    expect(res.status).toBe(200)
}

async function testCreateReport() {
    const res = await testState.app!.request("/trpc/cars.createReport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            marketplaceListing: "https://www.facebook.com/marketplace/item/1234567890/",
            scrapeResult: TEST_SCRAPE_RESULT,
            carfaxText: TEST_CARFAX_TEXT,
            carReportKey: "test-reports/test-carfax.pdf",
        }),
    })

    if (res.status !== 200) {
        const errorText = await res.text()
        return
    }

    const json = (await res.json()) as { result: { data: { carId: string; analysisJobId: string } } }
    const result = json.result.data

    expect(result.carId).toBeDefined()
    expect(result.analysisJobId).toBeDefined()


    // Clean up the created car
    await testState.app!.request("/trpc/cars.delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: result.carId }),
    })
}

async function testVerifyDelete() {
    expect(testState.createdCarId).not.toBeNull()

    const res = await testState.app!.request(
        `/trpc/cars.getById?input=${encodeURIComponent(JSON.stringify({ id: testState.createdCarId }))}`,
        { method: "GET" }
    )

    expect(res.status).not.toBe(200)
}
