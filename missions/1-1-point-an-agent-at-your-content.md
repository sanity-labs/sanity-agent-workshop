# Mission 1-1 · Point an agent at your content

**Goal** — Wire the stubbed agent route to a Sanity Context MCP over your own dataset, and read
the GROQ it writes.

**Before the prompt (you, in the Dashboard, ~3 minutes):**

1. Open the **Context** app in the Sanity Dashboard (your organization → Apps → Context).
2. Create an **MCP**. Source: your project + dataset (`<projectId>.production`). That makes it
   GROQ mode. **Pick the name carefully — it is part of the URL and cannot be changed.**
3. Copy the endpoint URL the app shows after you save. It looks like
   `https://api.sanity.io/v1/context/organizations/<orgId>/mcp/<name>`.
4. Put it in `app/.env.local` as `SANITY_CONTEXT_MCP_URL`. Your `SANITY_ORGANIZATION_ID` and
   `SANITY_ORGANIZATION_TOKEN` are already there from the pre-flight.

**Prompt** — copy this:

```
I'm on Mission 1-1 of the Sanity agent workshop (missions/1-1-point-an-agent-at-your-content.md).
Load the sanity-workshop-context-groq skill and read AGENTS.md before you start.

I have created a Sanity Context MCP in the Context app with my project + dataset as its source
(GROQ mode) and put its URL in app/.env.local as SANITY_CONTEXT_MCP_URL. My organization ID and
organization token are already in app/.env.local.

Wire app/app/api/agent/route.ts to that endpoint with @ai-sdk/mcp and the Vercel AI SDK. Keep
the response a UI message stream, which is what app/components/ChatPanel.tsx already expects —
do not change ChatPanel.tsx. Write the route yourself from the pattern in the skill; do not copy
a reference implementation from another project. A short system prompt is fine: the agent is
Green & Gather's menu concierge, answers only from retrieved content, and never assures anyone
an item is safe for an allergy.

Then, with pnpm dev running, send this question to the running app's /api/agent route and read
the streamed response: "What vegan bowls are under $12 in Austin?"
Run this against the app at localhost:3000 — not through your own Sanity tools.

Show me the exact GROQ the agent generated and the items it returned. If the answer looks wrong,
do not fix it or change the query — report it and stop.
```

**Done when** — Real menu items come back, and **you can read the GROQ the agent wrote.** On the
seed, the answer is exactly one item: the Harissa Chickpea Bowl.

**If stuck** — If the agent can't see any content, check the org token before you check the code:
a project token, or Context not enabled for your org, fails with `403 contextGrantRequired` and
reads as a broken connection. Then `checkpoints/1-1.md`.

**Going deeper** — `skills/sanity-workshop-context-groq/references/wiring-the-route.md` ·
[Sanity Context](https://www.sanity.io/docs/ai/sanity-context) · [Configure an MCP](https://www.sanity.io/docs/ai/sanity-context-configure-mcp) ·
[Context MCP reference](https://www.sanity.io/docs/ai/sanity-context-mcp)

Why reading the GROQ matters: people cannot reason about retrieval they've never seen, and every
later mission depends on you being willing to look. Four vegan bowls exist; two are under $12; one
of those is deliberately absent from Austin. The location predicate does real work.
