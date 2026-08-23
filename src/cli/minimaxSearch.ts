#!/usr/bin/env bun
import { createMinimaxCodingPlanClient } from "../index.js"
import { minimaxVersion } from "../minimaxVersion.js"

const args = Bun.argv.slice(2)

if (args.includes("--version") || args.includes("-V")) {
  console.log(`minimaxSearch ${minimaxVersion}`)
  process.exit(0)
}

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
  console.log("Usage: minimaxSearch [options] <query>")
  console.log("Options:")
  console.log("  --env-file <path>, -e <path>  Load env from file")
  console.log("  --version, -V                Show the package version")
  console.log("  --help, -h                   Show this help")
  console.log("")
  console.log("Environment:")
  console.log("  MINIMAX_API_TOKEN  API token (also MINIMAX_API_KEY for compatibility)")
  console.log("  MINIMAX_API_HOST   API host (optional)")
  console.log("")
  console.log("Example:")
  console.log('  minimaxSearch --env-file=.env "latest Convex news March 2026"')
  process.exit(0)
}

const query = filteredArgs.join(" ").trim()
if (!query) {
  console.error("Usage: minimaxSearch <query>")
  process.exit(1)
}

const client = createMinimaxCodingPlanClient({
  apiKey,
  apiHost: process.env.MINIMAX_API_HOST,
})

const result = await client.search(query)
console.log(JSON.stringify(result, null, 2))
