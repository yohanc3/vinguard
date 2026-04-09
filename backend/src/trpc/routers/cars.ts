import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { publicProcedure, router } from "../trpc"
import { enqueueJob } from "../../services/scraper/job-queue"
import { extractCarDataFromPdf, extractListingData, PalantirLlmHttpError, PalantirLlmResponseError } from "../../services/llm"
import { logger } from "../../logger"

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

const chatHistoryEntrySchema = z.object({
    role: z.string(),
    message: z.string(),
    source1: z.string().optional().nullable(),
    source2: z.string().optional().nullable(),
    source3: z.string().optional().nullable(),
})

const carSchema = z.object({
    __primaryKey: z.string().optional(),
    __rid: z.string().optional(),
    __apiName: z.string().optional(),
    __title: z.string().optional(),
    id: z.string().optional(),
    userId: z.string().optional(),
    chatHistory: z.array(chatHistoryEntrySchema).optional(),
    vin: z.string().optional(),
    make: z.string().optional(),
    model: z.string().optional(),
    year: z.number().optional(),
    trim: z.string().optional(),
    color: z.string().optional(),
    bodyStyle: z.string().optional(),
    engineType: z.string().optional(),
    cylinders: z.number().optional(),
    msrp: z.number().optional(),
    listingPrice: z.number().optional(),
    listingMileage: z.string().optional(),
    listingDetails: z.array(z.string()).optional(),
    listingPictures: z.array(z.string()).optional(),
    marketplaceListing: z.string().optional(),
    odometerReadings: z.array(z.number()).optional(),
    numberOfPreviousOwners: z.number().optional(),
    stateOfRegistration: z.string().optional(),
    titleStatus: z.string().optional(),
    salvageRecord: z.string().optional(),
    floodDamageHistory: z.string().optional(),
    fairMarketValueHigh: z.number().optional(),
    fairMarketValueLow: z.number().optional(),
    carReport: z.string().optional(),
    vehicleAnalysis: z.string().optional(),
})

const carInputSchema = z.object({
    id: z.string().optional(),
    userId: z.string().optional(),
    chatHistory: z.array(chatHistoryEntrySchema).optional(),
    vin: z.string().optional(),
    make: z.string().optional(),
    model: z.string().optional(),
    year: z.number().optional(),
    trim: z.string().optional(),
    color: z.string().optional(),
    exteriorColor: z.string().optional(),
    bodyStyle: z.string().optional(),
    engineType: z.string().optional(),
    cylinders: z.number().optional(),
    msrp: z.number().optional(),
    listingPrice: z.number().optional(),
    listingMileage: z.string().optional(),
    listingDetails: z.array(z.string()).optional(),
    listingPictures: z.array(z.string()).optional(),
    marketplaceListing: z.string().optional(),
    odometerReadings: z.array(z.number()).optional(),
    numberOfPreviousOwners: z.number().optional(),
    stateOfRegistration: z.string().optional(),
    titleStatus: z.string().optional(),
    salvageRecord: z.string().optional(),
    floodDamageHistory: z.string().optional(),
    fairMarketValueHigh: z.number().optional(),
    fairMarketValueLow: z.number().optional(),
    carReport: z.string().optional(),
    vehicleAnalysis: z.string().optional(),
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
            const responseBody = await res.text()
            logger.error({
                message: "cars.list",
                httpStatus: res.status,
                responseBody,
            })
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Failed to fetch cars: ${responseBody}`,
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
                const responseBody = await res.text()
                logger.error({
                    message: "cars.getById",
                    carId: input.id,
                    httpStatus: res.status,
                    responseBody,
                })
                if (res.status === 404) {
                    throw new TRPCError({ code: "NOT_FOUND", message: "Car not found" })
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to fetch car: ${responseBody}`,
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
                const responseBody = await res.text()
                logger.error({
                    message: "cars.create",
                    httpStatus: res.status,
                    responseBody,
                    carId: input.id,
                    hasVin: Boolean(input.vin),
                })
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to create car: ${responseBody}`,
                })
            }

            const json = await res.json()

            if (input.id) {
                enqueueJob("generate_analysis", { carId: input.id }, true)
            }

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
                const responseBody = await res.text()
                logger.error({
                    message: "cars.update",
                    carId: id,
                    httpStatus: res.status,
                    responseBody,
                })
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to update car: ${responseBody}`,
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
                const responseBody = await res.text()
                logger.error({
                    message: "cars.delete",
                    carId: input.id,
                    httpStatus: res.status,
                    responseBody,
                })
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to delete car: ${responseBody}`,
                })
            }

            const json = await res.json()
            return json
        }),

    generateAnalysis: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(function generateAnalysis({ input }) {
            const jobId = enqueueJob("generate_analysis", { carId: input.id }, true)
            return { jobId }
        }),

    updateAnalysis: publicProcedure
        .input(z.object({
            id: z.string(),
            vehicleAnalysis: z.string(),
        }))
        .mutation(async function updateAnalysis({ input }) {
            const res = await fetch(`${baseUrl}/actions/edit-cars/apply`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    parameters: {
                        cars: input.id,
                        vehicleAnalysis: input.vehicleAnalysis,
                    },
                }),
            })

            if (!res.ok) {
                const responseBody = await res.text()
                logger.error({
                    message: "cars.updateAnalysis",
                    carId: input.id,
                    httpStatus: res.status,
                    responseBody,
                    analysisLength: input.vehicleAnalysis.length,
                })
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to update analysis: ${responseBody}`,
                })
            }

            return { success: true }
        }),

    createReport: publicProcedure
        .input(z.object({
            scrapeResult: z.object({
                miles: z.string().nullable(),
                price: z.string().nullable(),
                photos: z.array(z.string()),
                details: z.string().nullable(),
            }),
            carfaxText: z.string(),
            carReportKey: z.string(),
        }))
        .mutation(async function createReport({ input }) {
            const carId = crypto.randomUUID()

            const createRes = await fetch(`${baseUrl}/actions/create-cars/apply`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    parameters: {
                        id: carId,
                        carReport: input.carReportKey,
                    },
                }),
            })

            if (!createRes.ok) {
                const responseBody = await createRes.text()
                logger.error({
                    message: "cars.createReport_create_palantir",
                    carId,
                    httpStatus: createRes.status,
                    responseBody,
                    carReportKey: input.carReportKey,
                })
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to create car: ${responseBody}`,
                })
            }

            const jobId = enqueueJob("generate_analysis", {
                carId,
                scrapeResult: input.scrapeResult,
                carfaxText: input.carfaxText,
            }, true)

            void (async function finalizeCreateReportListing() {
                const asyncStart = Date.now()
                try {
                    const [pdfData, listingData] = await Promise.all([
                        extractCarDataFromPdf(input.carfaxText),
                        extractListingData(JSON.stringify(input.scrapeResult)),
                    ])

                    const updateRes = await fetch(`${baseUrl}/actions/edit-cars/apply`, {
                        method: "POST",
                        headers: getHeaders(),
                        body: JSON.stringify({
                            parameters: {
                                cars: carId,
                                ...pdfData,
                                ...listingData,
                                listingPictures: input.scrapeResult.photos,
                            },
                        }),
                    })

                    if (!updateRes.ok) {
                        const responseBody = await updateRes.text()
                        logger.error({
                            message: "cars.createReport_finalize_palantir",
                            carId,
                            httpStatus: updateRes.status,
                            responseBody,
                            ms: Date.now() - asyncStart,
                            scrapePhotoCount: input.scrapeResult.photos.length,
                            carfaxChars: input.carfaxText.length,
                        })
                        return
                    }
                } catch (err) {
                    if (err instanceof PalantirLlmHttpError) {
                        logger.error({
                            message: "cars.createReport_finalize_llm_http",
                            carId,
                            ms: Date.now() - asyncStart,
                            errMessage: err.message,
                            responseBody: err.responseBody,
                            llmInput: err.llmInput,
                            scrapePhotoCount: input.scrapeResult.photos.length,
                            carfaxChars: input.carfaxText.length,
                        })
                    } else if (err instanceof PalantirLlmResponseError) {
                        logger.error({
                            message: "cars.createReport_finalize_llm_response",
                            carId,
                            ms: Date.now() - asyncStart,
                            errMessage: err.message,
                            responseBody: err.responseBody,
                            llmInput: err.llmInput,
                            scrapePhotoCount: input.scrapeResult.photos.length,
                            carfaxChars: input.carfaxText.length,
                        })
                    } else {
                        logger.error({
                            message: "cars.createReport_finalize",
                            carId,
                            ms: Date.now() - asyncStart,
                            errMessage: err instanceof Error ? err.message : "unknown",
                            stack: err instanceof Error ? err.stack : undefined,
                            scrapePhotoCount: input.scrapeResult.photos.length,
                            carfaxChars: input.carfaxText.length,
                        })
                    }
                }
            })()

            return { carId, analysisJobId: jobId }
        }),
})
