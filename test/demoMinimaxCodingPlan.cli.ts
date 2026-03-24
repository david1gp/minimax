import { createMinimaxCodingPlanClient } from "../src/createMinimaxCodingPlanClient.js"

const apiKey = process.env.MINIMAX_API_KEY
if (!apiKey) {
  throw new Error("MINIMAX_API_KEY is required")
}

const query = Bun.argv.slice(2).join(" ").trim() || "latest Convex news March 2026"
const client = createMinimaxCodingPlanClient({
  apiKey,
  apiHost: process.env.MINIMAX_API_HOST,
})

console.log("MiniMax coding-plan search demo")
console.log("query:", query)

const result = await client.search(query)
console.log(JSON.stringify(result, null, 2))
