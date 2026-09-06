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

> **Plan B — if the Context app won't load for your organization.** The legacy project-addressed
> endpoint serves the same GROQ tools with your _project_ read token, provided your Studio is
> deployed (say yes at bootstrap's deploy prompt, or `cd studio && npx sanity deploy`). In
> `app/.env.local`, set `SANITY_CONTEXT_MCP_URL` to the value bootstrap wrote in
> `SANITY_CONTEXT_MCP_URL_FALLBACK`, and set `SANITY_CONTEXT_MCP_TOKEN` to your `SANITY_READ_TOKEN`.
> Then use the prompt below unchanged. Everything you observe is the same; only the door you came
> in through differs, and you'll set `instructions` and `groqFilter` as URL parameters in later
> missions instead of in the app.

**Prompt** — copy this:

```
I'm on Mission 1-1 of the Sanity agent workshop (missions/1-1-point-an-agent-at-your-content.md).
Load the sanity-workshop-context-groq skill and read AGENTS.md before you start.

I have created a Sanity Context MCP in the Context app with my project + dataset as its source
(GROQ mode) and put its URL in app/.env.local as SANITY_CONTEXT_MCP_URL. My organization ID and
organization token are already in app/.env.local.

Wire app/app/api/agent/route.ts to that endpoint with @ai-sdk/mcp and the Vercel AI SDK. Use
SANITY_CONTEXT_MCP_TOKEN as the bearer if it is set, otherwise SANITY_ORGANIZATION_TOKEN. Keep
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

---

## Before you move on: start your Knowledge Base build

**Do this now, not in Mission 1-3.** Mission 1-3 adds a Knowledge Base as a second source, and you
build it yourself — in the Context app, from your dataset plus four files in `kb/sources/`. The
clicking takes about five minutes; the build then runs on its own for roughly ten more, which is
Mission 1-2's running time. Start it here and it's ready when you need it.

Follow steps **1–4** of [`kb/README.md`](../kb/README.md): create the KB with the given title and
purpose, add your dataset with the given query, upload the four files, click **Build entries**.
Then go to Mission 1-2 while it builds. Steps 5–7 (read the issues, add instructions, create the
KB-mode endpoint) are Mission 1-3's opening.

**On Plan B?** Skip this; you'll use the shared KB described at the bottom of `kb/README.md`.
