import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { publicProcedure, router } from "../trpc"

const PALANTIR_URL = process.env.PALANTIR_FOUNDRY_API_URL
const ONTOLOGY_RID = process.env.PALANTIR_ONTOLOGY_RID
const API_KEY = process.env.PALANTIR_AIP_API_KEY

const baseUrl = `${PALANTIR_URL}/api/v2/ontologies/${ONTOLOGY_RID}`

function getHeaders() {
    return {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
    }
}

const carSchema = z.object({
    // Palantir internal fields
    __primaryKey: z.string().optional(),
    __rid: z.string().optional(),
    __apiName: z.string().optional(),
    __title: z.string().optional(),
    // Car fields - all optional
    id: z.string().optional(),
    userId: z.string().optional(),
    make: z.string().optional(),
    model: z.string().optional(),
    year: z.number().optional(),
    trim: z.string().optional(),
    color: z.string().optional(),
    bodyStyle: z.string().optional(),
    engineType: z.string().optional(),
    cylinders: z.number().optional(),
    msrp: z.string().optional(),
    listingPrice: z.number().optional(),
    listingMileage: z.string().optional(),
    listingDetails: z.array(z.string()).optional(),
    listingPictures: z.array(z.string()).optional(),
    odometerReadings: z.array(z.string()).optional(),
    numberOfPreviousOwners: z.number().optional(),
    stateOfRegistration: z.string().optional(),
    titleStatus: z.string().optional(),
    salvageRecord: z.string().optional(),
    floodDamageHistory: z.string().optional(),
    fairMarketValueHigh: z.number().optional(),
    fairMarketValueLow: z.number().optional(),
    carReport: z.string().optional(),
})

const carInputSchema = z.object({
    id: z.string().optional(),
    userId: z.string().optional(),
    make: z.string().optional(),
    model: z.string().optional(),
    year: z.number().optional(),
    trim: z.string().optional(),
    color: z.string().optional(),
    exteriorColor: z.string().optional(),
    bodyStyle: z.string().optional(),
    engineType: z.string().optional(),
    cylinders: z.number().optional(),
    msrp: z.string().optional(),
    listingPrice: z.number().optional(),
    listingMileage: z.string().optional(),
    listingDetails: z.array(z.string()).optional(),
    listingPictures: z.array(z.string()).optional(),
    odometerReadings: z.array(z.string()).optional(),
    numberOfPreviousOwners: z.number().optional(),
    stateOfRegistration: z.string().optional(),
    titleStatus: z.string().optional(),
    salvageRecord: z.string().optional(),
    floodDamageHistory: z.string().optional(),
    fairMarketValueHigh: z.number().optional(),
    fairMarketValueLow: z.number().optional(),
    carReport: z.string().optional(),
})

const listResponseSchema = z.object({
    data: z.array(carSchema),
    totalCount: z.string(),
})

export const carsRouter = router({
    list: publicProcedure.query(async function listCars() {
        const res = await fetch(`${baseUrl}/objects/cars`, {
            method: "GET",
            headers: getHeaders(),
        })

        if (!res.ok) {
            const errorText = await res.text()
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Failed to fetch cars: ${errorText}`,
            })
        }

        const json = await res.json()
        const parsed = listResponseSchema.parse(json)

        return parsed
    }),

    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async function getCarById({ input }) {
            const res = await fetch(`${baseUrl}/objects/cars/search`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ where: { type: "eq", field: "id", value: input.id } }),
            })

            if (!res.ok) {
                const errorText = await res.text()
                if (res.status === 404) {
                    throw new TRPCError({ code: "NOT_FOUND", message: "Car not found" })
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to fetch car: ${errorText}`,
                })
            }

            const json = await res.json()
            const results = json.data as unknown[]

            if (!results || results.length === 0) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Car not found" })
            }

            const parsed = carSchema.parse(results[0])
            return parsed
        }),

    create: publicProcedure
        .input(carInputSchema)
        .mutation(async function createCar({ input }) {
            const res = await fetch(`${baseUrl}/actions/create-cars/apply`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ parameters: input }),
            })

            if (!res.ok) {
                const errorText = await res.text()
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to create car: ${errorText}`,
                })
            }

            const json = await res.json()
            return json
        }),

    update: publicProcedure
        .input(z.object({ id: z.string() }).merge(carInputSchema))
        .mutation(async function updateCar({ input }) {
            const { id, ...data } = input

            const res = await fetch(`${baseUrl}/actions/edit-cars/apply`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ parameters: { cars: id, ...data } }),
            })

            if (!res.ok) {
                const errorText = await res.text()
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to update car: ${errorText}`,
                })
            }

            const json = await res.json()
            return json
        }),

    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async function deleteCar({ input }) {
            const res = await fetch(`${baseUrl}/actions/delete-cars/apply`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ parameters: { cars: input.id } }),
            })

            if (!res.ok) {
                const errorText = await res.text()
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to delete car: ${errorText}`,
                })
            }

            const json = await res.json()
            return json
        }),
})
