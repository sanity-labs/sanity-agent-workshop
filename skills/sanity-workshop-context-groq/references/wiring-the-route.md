# Wiring the route — how `@ai-sdk/mcp` connects an agent to Context

The documented pattern from the Sanity docs (Connect Sanity Context with Vercel AI SDK; Sanity
Context patterns), adapted to this repo. It is a pattern with pieces, not a file to paste: the
attendee is meant to watch their route take shape.

## The pieces

**1. Connect to the endpoint.** Token and URL stay server-side; the browser only ever talks to
this route.

```ts
import {createMCPClient} from '@ai-sdk/mcp'

const mcp = await createMCPClient({
  transport: {
    type: 'http',
    url: process.env.SANITY_CONTEXT_MCP_URL!, // set in Mission 1-1
    headers: {Authorization: `Bearer ${process.env.SANITY_ORGANIZATION_TOKEN}`},
  },
})
```

**2. Get the tools.** `mcp.tools()` returns a plain object keyed by tool name, so it can be
subset or re-described. If you fetched initial context for the system prompt (below), drop the
`initial_context` tool to avoid a redundant call.

```ts
const {initial_context: _ignored, ...tools} = await mcp.tools()
```

**3. Optionally fetch initial context once** and put it in the system prompt. Append to the
_path_, not the whole URL, so query parameters survive.

```ts
const url = new URL(process.env.SANITY_CONTEXT_MCP_URL!)
url.pathname = `${url.pathname.replace(/\/$/, '')}/initial-context`
const initialContext = await fetch(url, {
  headers: {Authorization: `Bearer ${process.env.SANITY_ORGANIZATION_TOKEN}`},
}).then((r) => r.text())
```

Cache it across requests in a module-level variable; the schema doesn't change between messages.

**4. Call the model and stream UI messages.** The ChatPanel already speaks this format, so the
response shape is the one thing that must not change.

```ts
import {anthropic} from '@ai-sdk/anthropic'
import {convertToModelMessages, stepCountIs, streamText} from 'ai'

const result = streamText({
  model: anthropic('claude-opus-5'), // any current Claude model id works
  system: systemPrompt,
  messages: convertToModelMessages(messages),
  tools,
  stopWhen: stepCountIs(8), // let the agent take several tool steps for multi-hop questions
  onFinish: () => mcp.close(),
})

return result.toUIMessageStreamResponse()
```

`@ai-sdk/anthropic` reads `ANTHROPIC_API_KEY` from env with no extra code. `stopWhen` matters:
the gluten-free question in Mission 1-2 takes several `groq_query` calls, and the default of one
step would cut it off.

## Workshop-specific details

- **Request body** from `ChatPanel.tsx` is `{messages: UIMessage[], guestId: string | null}`.
  Read `messages` now; `guestId` is Mission 1-5's material — ignore it until then.
- **Env names** are the ones in `app/.env.example`: `SANITY_CONTEXT_MCP_URL`,
  `SANITY_ORGANIZATION_ID`, `SANITY_ORGANIZATION_TOKEN`, `ANTHROPIC_API_KEY`. Fail with a clear
  message if the MCP URL is missing — that is the state everyone is in before 1-1.
- **Create the MCP client per request** and close it in `onFinish`. Reusing one across requests
  is an optimisation for later, not for the room.
- **The stub's reply is gone once you wire this.** Setup success was the stub; Mission 1-1 success
  is real items and readable GROQ.

## A system prompt that is enough for 1-1

Behaviour and voice belong here; data guidance belongs in the endpoint's `instructions` field.
Roughly 150 words is plenty:

```text
You are the menu concierge for Green & Gather, a fast-casual bowls-and-wraps chain with
locations in NYC, Austin, and Chicago. You answer questions about the menu, dietary options,
and allergens from the content you can retrieve.

Rules:
- Use the tools for every factual claim about menu items, prices, allergens, or locations.
- If a query returns nothing, say so and offer to broaden. Never invent an item.
- Never assure a guest that an item is safe for an allergy. You can say what the menu declares
  and what the kitchen states about cross-contact.
```

## Reading the trace

The ChatPanel renders each tool part with its name and input. A `groq_query` input looks like
`{"query": "*[_type == \"menuItem\" && …]"}` — that is the GROQ to show the attendee. On the
wire, `curl -N` against `/api/agent` shows the same as `data: {"type":"tool-input-available",
"toolName":"groq_query","input":{"query":"…"}}` events.
