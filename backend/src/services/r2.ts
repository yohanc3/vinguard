import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_BASE_URL,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
  }
})

const BUCKET = process.env.R2_BUCKET_NAME!

export async function getPresignedUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType
  })
  return getSignedUrl(s3, command, { expiresIn })
}

export async function getPresignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key
  })
  return getSignedUrl(s3, command, { expiresIn })
}

export async function uploadFile(key: string, body: Buffer | Uint8Array | string, contentType: string): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType
  })
  await s3.send(command)
}

export async function getFile(key: string): Promise<{ body: ReadableStream | null, contentType: string | undefined }> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key
  })
  const response = await s3.send(command)
  return {
    body: response.Body?.transformToWebStream() ?? null,
    contentType: response.ContentType
  }
}

export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key
  })
  await s3.send(command)
}

export async function updateFile(key: string, body: Buffer | Uint8Array | string, contentType: string): Promise<void> {
  await deleteFile(key)
  await uploadFile(key, body, contentType)
}

export async function getFileMetadata(key: string): Promise<{ contentType: string | undefined, contentLength: number | undefined, lastModified: Date | undefined }> {
  const command = new HeadObjectCommand({
    Bucket: BUCKET,
    Key: key
  })
  const response = await s3.send(command)
  return {
    contentType: response.ContentType,
    contentLength: response.ContentLength,
    lastModified: response.LastModified
  }
}
