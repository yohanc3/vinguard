import { useState } from "react"
import * as pdfjsLib from "pdfjs-dist"
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?worker"

interface UsePdfExtractionResult {
    extractText: (file: File) => Promise<string>
    isExtracting: boolean
    error: string | null
}

// Use a bundler-provided worker so pdf.js doesn't try to fetch it from a CDN
pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker()

export function usePdfExtraction(): UsePdfExtractionResult {
    const [isExtracting, setIsExtracting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function extractText(file: File): Promise<string> {
        setIsExtracting(true)
        setError(null)

        try {
            const arrayBuffer = await file.arrayBuffer()
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

            let fullText = ""

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i)
                const content = await page.getTextContent()

                const pageText = content.items
                    .map((item: any) => item.str)
                    .join(" ")

                fullText += pageText + "\n\n"
            }

            return fullText
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to extract PDF text"
            setError(message)
            throw err
        } finally {
            setIsExtracting(false)
        }
    }

    return { extractText, isExtracting, error }
}
