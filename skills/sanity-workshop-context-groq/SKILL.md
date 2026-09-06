---
name: sanity-workshop-context-groq
description: Wire, observe, personalize, and scope the Green & Gather workshop agent's GROQ-mode Sanity Context MCP inside the sanity-agent-workshop repo. Use ONLY for Track 1 Missions 1-1, 1-2, 1-5, and 1-6 of that workshop: connecting app/app/api/agent/route.ts to a Context endpoint with @ai-sdk/mcp, reading the GROQ the agent generates and naming the retrieval modality (exact filter, text::query, text::semanticSimilarity), injecting loyalty-stub guest signals server-side, or setting groqFilter so the Winter Miso Bowl disappears. Load it when someone in this repo mentions the stub route, "not connected yet", the Context app, SANITY_CONTEXT_MCP_URL, embeddings ranking, the loyalty stub, or the boundary. DO NOT load for the shared Knowledge Base, second endpoint, or routing (sanity-workshop-knowledge-bases), for Track 2 Functions or Workflows, or for Sanity Context, GROQ, or chatbot work outside this workshop repo (use create-agent-with-sanity-context or the Sanity docs).
---

# Sanity Context in GROQ mode — the Green & Gather agent

You are helping a workshop attendee build a menu concierge for **Green & Gather**, a fictional
restaurant chain, on top of the `sanity-agent-workshop` starter. The attendee drives you with the
prompt from a mission file in `missions/`. Your job is to do the typing **and leave the
observation to them** — every mission's "done when" is something they look at, not something you
hand them. Read `AGENTS.md` first; its rules of engagement exist because a helpful agent will
otherwise do the lesson instead of the learner.

## What this skill knows

| Mission | You help with                                                                         | The attendee observes                                          |
| ------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 1-1     | Wiring `app/app/api/agent/route.ts` to a Context MCP endpoint                         | Real items come back, and they can read the GROQ               |
| 1-2     | Nothing — you run three questions and report                                          | Three different GROQ shapes; how many calls the third took     |
| 1-5     | Reading `app/lib/loyalty.ts` server-side and injecting signals into the system prompt | The same question answers differently for a signed-in guest    |
| 1-6     | Nothing in code — `groqFilter` is set in the Context app                              | The Winter Miso Bowl returns nothing instead of being withheld |

Missions 1-3 and 1-4 (the second endpoint, routing) belong to `sanity-workshop-knowledge-bases`.

## Product facts that decide whether the first connection works

These are Context **v2** (September 2026). The vendored `create-agent-with-sanity-context` skill
still documents v1 (a Studio plugin and a project-addressed URL); where they disagree, this is
current.

- **Endpoints are MCPs created in the Context app** in the Sanity Dashboard, not in the Studio.
  The URL is organization-addressed:
  `https://api.sanity.io/v1/context/organizations/<orgId>/mcp/<endpointName>`. The name is
  chosen at creation and cannot be changed.
- **Mode comes from sources.** A dataset source (`<projectId>.<dataset>`) makes it GROQ mode.
  This skill is about GROQ mode.
- **Auth is an ORGANIZATION API token with Context Viewer permissions**, sent as
  `Authorization: Bearer`. A project token is refused with `403 contextGrantRequired`. This is the
  most common reason a first connection fails, and it looks like "the app is broken".
- **GROQ mode needs a deployed schema** (bootstrap ran `sanity schema deploy`). Without it the
  connection is refused with JSON-RPC `-32004`.
- **GROQ mode serves four tools:** `initial_context`, `schema_explorer`, `groq_query`,
  `array_field_reader`. Exact filters, keyword ranking, and semantic ranking are **all GROQ the
  agent writes inside `groq_query`** — the observable signal is the GROQ text, not a tool name.
  A `groq_query` result carries `meta.executedQuery`, `resultCount`, and `result`.
- **`/initial-context`** appended to the endpoint path (same auth) returns the schema overview as
  text. Put it in the system prompt and drop the `initial_context` tool to save a call per
  conversation.
- **`groqFilter` is server-side and cannot be widened from the conversation.** A `?groqFilter=`
  URL parameter only narrows it further.
- **Embeddings must be `ready`.** `text::semanticSimilarity()` is only valid inside `score()`. A
  dataset where embeddings were never enabled errors loudly; one still `updating` returns
  incomplete rankings with **no error**.

## Where things are in this repo

| Path                           | Role                                                                                                                                                                        |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/app/api/agent/route.ts`   | The seam. Ships as a stub that streams "not connected yet" in the UI-message format the ChatPanel expects. Mission 1-1 replaces its body.                                   |
| `app/components/ChatPanel.tsx` | Done. `useChat` against `/api/agent`; renders text parts as markdown and tool parts as a trace (tool name + input). Sends `{messages, guestId}`. Don't edit it for Track 1. |
| `app/.env.local`               | `SANITY_ORGANIZATION_ID`, `SANITY_ORGANIZATION_TOKEN`, `ANTHROPIC_API_KEY`, and the slot `SANITY_CONTEXT_MCP_URL` the attendee fills in Mission 1-1.                        |
| `app/lib/loyalty.ts`           | The CRM stub for Mission 1-5. Two guests; `dara` has a peanut allergy on file. Never writes to Sanity.                                                                      |
| `app/lib/shop.ts`              | The live-system stub. Sold-out state and hours belong here, not in Sanity or a KB.                                                                                          |
| `studio/seed/README.md`        | The seed contract: which answers every mission depends on.                                                                                                                  |
| `pnpm verify`                  | Asserts those answers still hold. Run it after any schema or seed change.                                                                                                   |

## How to work a mission

1. **Read the mission file the attendee named** and nothing further ahead. One mission at a time.
2. **Exercise the app, not Sanity.** Send questions to the running app's `/api/agent` route (a
   `curl -N -X POST http://localhost:3000/api/agent -H 'content-type: application/json' -d '{"messages":[{"id":"1","role":"user","parts":[{"type":"text","text":"…"}]}],"guestId":null}'`
   is fine) and read the streamed UI messages: `tool-input-available` parts carry the tool name
   and the GROQ. You have the Sanity MCP server for reading the schema and inspecting documents
   while you build. Answering a menu question with it yourself bypasses the thing being built.
3. **Report what happened**, verbatim: the GROQ, the result count, the items. If the answer looks
   wrong, that is a finding to show the attendee, not a file to patch. Never edit the seed.
4. **Never add a `spicy`, `heat`, `heaviness`, or derived `vegan` field, and never denormalize
   allergens onto `menuItem`.** Heat and heft live only in `body` prose so Mission 1-2's semantic
   question has something to do; `menuItem.allergens` is deliberately not a rollup of the recipe
   so the gluten-free question takes several calls. `pnpm verify` catches both.

## Mission 1-1 — wire the route

The route becomes a Vercel AI SDK handler that connects to the endpoint, hands its tools to the
model, and streams UI messages. `@ai-sdk/mcp`, `@ai-sdk/anthropic`, and `ai` (6.x) are installed
in `app/`. The pattern, and the workshop-specific details (env names, the request body, closing
the client), are in [references/wiring-the-route.md](references/wiring-the-route.md). Write the
route from that pattern; do not copy the ecommerce reference app inside the vendored skill — it
is v1-shaped and the point is that the attendee watches the route they asked for take shape.

A minimal system prompt is enough for 1-1: who the agent is, answer only from retrieved content,
say so when nothing comes back. The seed's expected answer to _"what vegan bowls are under $12 in
Austin?"_ is exactly one item, the Harissa Chickpea Bowl; if two come back, the location predicate
did no work — show the GROQ.

## Mission 1-2 — report, don't change

Run the three questions in the mission prompt one at a time and, for each, show the GROQ and
name the modality. The reference [retrieval-modalities.md](references/retrieval-modalities.md)
has the shapes to recognise: `==` and `in` predicates (exact), `match text::query()` (keyword),
`score(text::semanticSimilarity())` (semantic), and the multi-call traversal `recipe →
ingredient.allergenTags → crossContactStatement` that the gluten-free question needs. Point at the
`_embeddings` fragment on the semantic question — it names the words that made the spicy bowl
sink. If the ranking looks random, check embeddings status before anything else. **The prompt
ends with "Do not change any code. Just report." Honour it.** If the third answer is wrong or
wobbly, the fix is the endpoint's `instructions` field, not code — see
[instructions-field.md](references/instructions-field.md) and the `dial-your-context` skill.

## Mission 1-5 — personalize server-side

Read `guestId` from the request body, resolve it with `getGuest()` from `app/lib/loyalty.ts`,
and inject the guest's signals into the system prompt as trusted, server-provided context. The
anonymous path (`null`) must keep working — the mission is a before-and-after. Do **not** put the
profile in a per-user `groqFilter` (you are changing what gets checked, not hiding menu items),
do **not** write the profile to Sanity or the schema, and do **not** trust the body in a real app —
identity comes from the verified session; the ChatPanel's picker stands in for that here. Detail
and the routing consequence (a peanut allergy makes a Knowledge Base lookup mandatory once
Mission 1-3 exists) in [personalization.md](references/personalization.md).

## Mission 1-6 — the boundary is not yours to code

The attendee sets `groqFilter` on the MCP in the Context app, typically
`status == "published"`. Your part is to try to make the agent surface the Winter Miso Bowl
(`status: internal`, flagged vegan) and report that it **returns nothing** — not that it politely
declines. Then re-ask "how many vegan options?" and confirm 7, not 8. Why this is governance and
not retrieval, and why it only holds on a private dataset, in
[groq-filter-and-scope.md](references/groq-filter-and-scope.md).

## When it doesn't work

| Symptom                              | First suspect                                                                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `403 contextGrantRequired`           | `SANITY_ORGANIZATION_TOKEN` is a project token, or Context isn't enabled for the org. Two clicks in Manage; no CLI path. |
| `401`                                | Token missing or not sent as `Authorization: Bearer`.                                                                    |
| JSON-RPC `-32004`                    | Schema not deployed: `cd studio && npx sanity schema deploy`.                                                            |
| `mcp.tools()` is empty               | Wrong URL, or the endpoint's source id isn't `<projectId>.<dataset>` (a malformed source flips the mode).                |
| Agent answers without calling a tool | System prompt must say to use the tools for every factual claim.                                                         |
| `text::semanticSimilarity` errors    | Embeddings not enabled: `cd studio && npx sanity datasets embeddings status production`.                                 |
| Semantic ranking looks random        | Status `updating`. Wait a minute; `pnpm verify` checks it.                                                               |
| Vegan count is 8                     | The query forgot `status == "published"` — Mission 1-6's whole point.                                                    |
