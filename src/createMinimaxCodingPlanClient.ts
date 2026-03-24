import { defaultMinimaxApiHost } from "./defaultMinimaxApiHost.js"
import { processImageSource } from "./processImageSource.js"
import { minimaxSearchResultSchema, minimaxUnderstandImageResultSchema } from "./schema.js"
import type {
  MinimaxBaseResp,
  MinimaxClientProps,
  MinimaxSearchResult,
  MinimaxUnderstandImageProps,
  MinimaxUnderstandImageResult,
} from "./types.js"
import * as a from "valibot"

export function createMinimaxCodingPlanClient(props: MinimaxClientProps) {
  const apiHost = props.apiHost || defaultMinimaxApiHost

  return {
    search(query: string) {
      return minimaxRequest({
        apiKey: props.apiKey,
        apiHost,
        endpoint: "/v1/coding_plan/search",
        payload: { q: query },
        responseSchema: minimaxSearchResultSchema,
      })
    },
    async understandImage(input: MinimaxUnderstandImageProps) {
      const imageUrl = await processImageSource(input.imageSource)
      const response = await minimaxRequest({
        apiKey: props.apiKey,
        apiHost,
        endpoint: "/v1/coding_plan/vlm",
        payload: {
          prompt: input.prompt,
          image_url: imageUrl,
        },
        responseSchema: minimaxUnderstandImageResultSchema,
      })
      if (!response.content) {
        throw new Error("No content returned from VLM API")
      }
      return response
    },
  }
}

interface MinimaxRequestProps<T> {
  apiKey: string
  apiHost: string
  endpoint: string
  payload: Record<string, unknown>
  responseSchema: a.BaseSchema<unknown, T, a.BaseIssue<unknown>>
}

async function minimaxRequest<T>(props: MinimaxRequestProps<T>): Promise<T> {
  const response = await fetch(props.apiHost + props.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${props.apiKey}`,
      "Content-Type": "application/json",
      "MM-API-Source": "Minimax-MCP",
    },
    body: JSON.stringify(props.payload),
  })

  const text = await response.text()
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}\n${text}`)
  }

  const parseResult = a.safeParse(a.pipe(a.string(), a.parseJson(), props.responseSchema), text)
  if (!parseResult.success) {
    const errorMessage = a.summarize(parseResult.issues)
    throw new Error(`Failed to validate MiniMax response: ${errorMessage}`)
  }

  const data = parseResult.output
  const baseResp = getBaseResp(data)
  if (baseResp.status_code && baseResp.status_code !== 0) {
    const traceId = response.headers.get("Trace-Id")
    if (baseResp.status_code === 1004) {
      throw new Error(`API Error: ${baseResp.status_msg}, please check your API key and API host. Trace-Id: ${traceId}`)
    }
    if (baseResp.status_code === 2038) {
      throw new Error(
        `API Error: ${baseResp.status_msg}, should complete real-name verification on the open-platform(https://platform.minimaxi.com/user-center/basic-information). Trace-Id: ${traceId}`,
      )
    }
    throw new Error(`API Error: ${baseResp.status_code}-${baseResp.status_msg} Trace-Id: ${traceId}`)
  }

  return data
}

function getBaseResp(data: unknown): Partial<MinimaxBaseResp> {
  if (!data || typeof data !== "object") {
    return {}
  }
  const baseResp = (data as Record<string, unknown>).base_resp
  if (!baseResp || typeof baseResp !== "object") {
    return {}
  }
  return baseResp as Partial<MinimaxBaseResp>
}
