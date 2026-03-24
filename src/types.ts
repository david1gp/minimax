import type * as a from "valibot"
import type { minimaxBaseRespSchema, minimaxSearchResultSchema, minimaxUnderstandImageResultSchema } from "./schema.js"

export type MinimaxBaseResp = a.InferOutput<typeof minimaxBaseRespSchema>

export type MinimaxSearchResult = a.InferOutput<typeof minimaxSearchResultSchema>

export type MinimaxUnderstandImageResult = a.InferOutput<typeof minimaxUnderstandImageResultSchema>

export interface MinimaxClientProps {
  apiKey: string
  apiHost?: string
}

export interface MinimaxUnderstandImageProps {
  prompt: string
  imageSource: string
}
