import * as a from "valibot"

export const minimaxBaseRespSchema = a.object({
  status_code: a.number(),
  status_msg: a.string(),
})

export const minimaxSearchOrganicSchema = a.object({
  title: a.optional(a.string()),
  link: a.optional(a.string()),
  snippet: a.optional(a.string()),
  date: a.optional(a.string()),
})

export const minimaxSearchRelatedSchema = a.object({
  query: a.string(),
})

export const minimaxSearchResultSchema = a.object({
  organic: a.optional(a.array(minimaxSearchOrganicSchema)),
  related_searches: a.optional(a.array(minimaxSearchRelatedSchema)),
  base_resp: a.optional(minimaxBaseRespSchema),
})

export const minimaxUnderstandImageResultSchema = a.object({
  content: a.string(),
  base_resp: a.optional(minimaxBaseRespSchema),
})
