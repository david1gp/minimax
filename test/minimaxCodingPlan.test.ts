import { expect, test } from "bun:test"
import { createMinimaxCodingPlanClient } from "../src/index.js"

test("MiniMax coding-plan search returns live results", async () => {
  const apiKey = process.env.MINIMAX_API_KEY
  const apiHost = process.env.MINIMAX_API_HOST

  expect(apiKey).toBeTruthy()
  expect(apiHost).toBeTruthy()

  const client = createMinimaxCodingPlanClient({
    apiKey: apiKey as string,
    apiHost,
  })

  const result = await client.search("latest Convex news March 2026")

  expect(result.base_resp?.status_code).toBe(0)
  expect(Array.isArray(result.organic)).toBe(true)
  expect((result.organic?.length || 0) > 0).toBe(true)
})
