#!/usr/bin/env bun
import { createMinimaxCodingPlanClient } from "../index.js"

const args = Bun.argv.slice(2)

let envFile: string | undefined
const filteredArgs = args.filter((arg) => {
  if (arg === "--env-file" || arg === "-e") {
    return false
  }
  if (arg.startsWith("--env-file=")) {
    envFile = arg.split("=")[1]
    return false
  }
  if (arg.startsWith("-e=")) {
    envFile = arg.split("=")[1]
    return false
  }
  return true
})

if (envFile) {
  const envContent = await Bun.file(envFile).text()
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIndex = trimmed.indexOf("=")
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex)
    const value = trimmed.slice(eqIndex + 1)
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

const apiKey = process.env.MINIMAX_API_TOKEN ?? process.env.MINIMAX_API_KEY
if (!apiKey) {
  console.error("MINIMAX_API_TOKEN or MINIMAX_API_KEY is required")
  process.exit(1)
}

if (filteredArgs.includes("--help") || filteredArgs.includes("-h")) {
  console.log("Usage: minimaxUnderstandImage [options] <imageSource> <prompt>")
  console.log("Options:")
  console.log("  --env-file <path>, -e <path>  Load env from file")
  console.log("  --help, -h                   Show this help")
  console.log("")
  console.log("Arguments:")
  console.log("  <imageSource>  URL or local path to an image")
  console.log("  <prompt>       The prompt for image understanding")
  console.log("")
  console.log("Environment:")
  console.log("  MINIMAX_API_TOKEN  API token (also MINIMAX_API_KEY for compatibility)")
  console.log("  MINIMAX_API_HOST   API host (optional)")
  console.log("")
  console.log("Example:")
  console.log('  minimaxUnderstandImage -e .env @image.png "Describe this image"')
  process.exit(0)
}

if (filteredArgs.length < 2) {
  console.error("Usage: minimaxUnderstandImage <imageSource> <prompt>")
  process.exit(1)
}

const imageSource = filteredArgs[0]!
const prompt = filteredArgs.slice(1).join(" ")

const client = createMinimaxCodingPlanClient({
  apiKey,
  apiHost: process.env.MINIMAX_API_HOST,
})

const result = await client.understandImage({ prompt, imageSource })
console.log(JSON.stringify(result, null, 2))
