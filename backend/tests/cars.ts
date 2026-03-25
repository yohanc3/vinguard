/**
 * Cars CRUD tests (Palantir)
 */

import { expect } from "bun:test"
import { testState, TEST_CAR, UPDATED_CAR_DATA } from "./state"

export async function runCarsTests() {
    console.log("\n" + "─".repeat(60))
    console.log("2. Cars CRUD Tests (Palantir)")
    console.log("─".repeat(60))

    await checkPalantirConnectivity()

    if (!testState.palantirAvailable) {
        console.log("  ⊘ 2.1-2.6 Skipped (Palantir unavailable)")
        return
    }

    await testCreateCar()
    await testFetchCar()
    await testUpdateCar()
    await testVerifyUpdate()
    await testDeleteCar()
    await testVerifyDelete()
}

async function checkPalantirConnectivity() {
    console.log("  [Palantir] Checking connectivity...")

    const res = await testState.app!.request("/trpc/cars.list", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })

    if (res.status === 200) {
        testState.palantirAvailable = true
        const json = (await res.json()) as { result: { data: { totalCount: string } } }
        console.log(`  [Palantir] ✓ Connected (${json.result.data.totalCount} cars in ontology)\n`)
    } else {
        const errorText = await res.text()

        if (errorText.includes("Unauthorized") || errorText.includes("401")) {
            console.log("  [Palantir] ✗ API key unauthorized.")
            console.log("  [Palantir] Check PALANTIR_AIP_API_KEY in .env\n")
        } else {
            console.log("  [Palantir] ✗ Connection failed:", errorText.substring(0, 150), "\n")
        }

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

    console.log(`  ✓ 2.1 Create car: ID ${testState.createdCarId}`)
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

    console.log(`  ✓ 2.2 Fetch car: ${car.make} ${car.model}`)
}

async function testUpdateCar() {
    expect(testState.createdCarId).not.toBeNull()

    const before = await testState.app!.request(
        `/trpc/cars.getById?input=${encodeURIComponent(JSON.stringify({ id: testState.createdCarId }))}`,
        { method: "GET" }
    )

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
    console.log("  ✓ 2.3 Update car: success")
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

    console.log(`  ✓ 2.4 Verify update: price=${car.listingPrice}, color=${car.exteriorColor}`)
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
    console.log(`  ✓ 2.5 Delete car: ID ${testState.createdCarId}`)
}

async function testVerifyDelete() {
    expect(testState.createdCarId).not.toBeNull()

    const res = await testState.app!.request(
        `/trpc/cars.getById?input=${encodeURIComponent(JSON.stringify({ id: testState.createdCarId }))}`,
        { method: "GET" }
    )

    expect(res.status).not.toBe(200)
    console.log("  ✓ 2.6 Verify delete: car no longer exists")
}
