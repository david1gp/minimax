# @adaptive-ds/minimax

Bring MiniMax coding-plan capabilities into TypeScript without dragging an MCP server into your app.

`@adaptive-ds/minimax` is a focused Bun/TypeScript client for MiniMax coding-plan search and vision APIs. 
It is designed for backend services, scripts, workers, and app integrations that want direct `fetch`-based access instead of stdio-based MCP wiring.

This package is a TypeScript reimplementation of the original MiniMax MCP project:

- original repo - https://github.com/MiniMax-AI/MiniMax-Coding-Plan-MCP
- this package keeps the same core behavior for:
  - coding-plan web search
  - coding-plan image understanding
  - image source normalization for URL, local file, and data URL inputs

## Why This Package

- No MCP runtime required
- Clean TypeScript API
- Bun-friendly out of the box
- Works well inside Convex, Hono, Workers, scripts, and Node-style backends
- Real API integration test included

## Installation

```bash
bun add @adaptive-ds/minimax
# or
npm install @adaptive-ds/minimax
```

## Quick Start

```ts
import { createMinimaxCodingPlanClient } from "@adaptive-ds/minimax"

const client = createMinimaxCodingPlanClient({
  apiKey: process.env.MINIMAX_API_KEY!,
  apiHost: process.env.MINIMAX_API_HOST,
})

const searchResult = await client.search("latest Convex news March 2026")
console.log(searchResult.organic?.[0]?.title)

const imageResult = await client.understandImage({
  prompt: "Describe the UI and extract visible text",
  imageSource: "https://example.com/screenshot.png",
})

console.log(imageResult.content)
```

## API

### `createMinimaxCodingPlanClient`

Creates a reusable API client.

```ts
const client = createMinimaxCodingPlanClient({
  apiKey: "your-api-key",
  apiHost: "https://api.minimax.io",
})
```

Props:

- `apiKey` - required MiniMax API key
- `apiHost` - optional host override

### `client.search(query)`

Runs a coding-plan web search.

```ts
const result = await client.search("latest bun release notes")
```

Returns a JSON object with fields such as:

- `organic`
- `related_searches`
- `base_resp`

### `client.understandImage({ prompt, imageSource })`

Runs the coding-plan vision endpoint.

```ts
const result = await client.understandImage({
  prompt: "Summarize what is shown in this image",
  imageSource: "./assets/screenshot.png",
})
```

`imageSource` supports:

- `http://` and `https://` URLs
- local file paths
- base64 `data:` URLs
- `@`-prefixed paths, matching the upstream MCP behavior

### `processImageSource(imageSource)`

If you want image normalization without making an API call, this helper is also exported.

## Defaults

The default API host is:

```txt
https://api.minimax.io
```

This package intentionally uses `api.minimax.io` as the default host because that is the working host for the current coding-plan API setup. The original MCP repo used a different default host in its generated config, but in practice host and key region need to match.

## Development

Install dependencies:

```bash
bun install
```

Build the package:

```bash
bun run build
```

Run the demo CLI:

```bash
bun run demo
bun run demo "latest TypeScript 2026 news"
```

## Testing

This package includes a real integration test that calls the MiniMax API.

Set the following variables in `.env`:

```env
MINIMAX_API_KEY=...
MINIMAX_API_HOST=https://api.minimax.io
```

Then run:

```bash
bun test --env-file .env
```

## Positioning

If the original MiniMax MCP server is the plug-and-play desktop adapter, `@adaptive-ds/minimax` is the embeddable engine room: direct, scriptable, and built for application code.

## License

MIT
