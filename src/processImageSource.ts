import { readFile } from "node:fs/promises"

export async function processImageSource(imageSource: string): Promise<string> {
  const normalized = imageSource.startsWith("@") ? imageSource.slice(1) : imageSource

  if (normalized.startsWith("data:")) {
    return normalized
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return processRemoteImageSource(normalized)
  }

  return processLocalImageSource(normalized)
}

async function processRemoteImageSource(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Failed to download image from URL: ${response.status} ${response.statusText}`)
  }

  const bytes = Buffer.from(await response.arrayBuffer())
  const contentType = response.headers.get("content-type")?.toLowerCase() || ""
  const imageFormat = detectImageFormat(contentType, imageUrl)
  return `data:image/${imageFormat};base64,${bytes.toString("base64")}`
}

async function processLocalImageSource(imagePath: string): Promise<string> {
  const bytes = await readFile(imagePath)
  const imageFormat = detectImageFormat("", imagePath)
  return `data:image/${imageFormat};base64,${bytes.toString("base64")}`
}

function detectImageFormat(contentType: string, imagePath: string): "jpeg" | "png" | "webp" {
  if (contentType.includes("png") || imagePath.toLowerCase().endsWith(".png")) {
    return "png"
  }
  if (contentType.includes("webp") || imagePath.toLowerCase().endsWith(".webp")) {
    return "webp"
  }
  return "jpeg"
}
