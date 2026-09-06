# Mission 1-3 · Add a knowledge base as a second source

**Goal** — Give the agent a second source that has already done the expensive reasoning, and
watch the hard question from 1-2 become one cited lookup.

**Before the prompt:** from the workshop course, copy the shared KB endpoint URL and its token into
`app/.env.local` as `SANITY_CONTEXT_KB_URL` and `SANITY_CONTEXT_KB_TOKEN`. You don't build the
KB — it's pre-built and shared (`kb/README.md`). The token is for the facilitator's organization,
which is why it's a separate variable.

**Prompt** — copy this:

```
I'm on Mission 1-3 of the Sanity agent workshop (missions/1-3-add-a-knowledge-base.md). Load
the sanity-workshop-knowledge-bases skill.

I have added SANITY_CONTEXT_KB_URL and SANITY_CONTEXT_KB_TOKEN to app/.env.local. That endpoint
is a Sanity Context MCP in Knowledge Base mode, pointed at the shared "Green & Gather — Allergens
& Food Safety" knowledge base, and its token is for a different organization than my own.

In app/app/api/agent/route.ts, add it as a second MCP source alongside the existing GROQ-mode
one, so the agent holds both tool sets. Watch for the initial_context name collision. Do not
change ChatPanel.tsx and do not remove the first source.

Then, with pnpm dev running, ask my agent these questions one at a time, fresh conversation
each, via the running app's /api/agent route, and show me the tool calls each one made:
  1. "Is the Thai Crunch Bowl peanut-free?"
  2. "Is your fryer shared?"
  3. "Can I get something gluten-free?"
For each, tell me which source answered, how many calls it took, and which sources the answer
cited. Run this against the app at localhost:3000 — not through your own Sanity tools. If the
agent answers a question from the wrong source, do not fix it — report it; that is the next
mission.
```

**Done when** — You get a cited answer in **one lookup**, and you can see the sources it
reconciled — including a supplier spec sheet that was never in your dataset.

The planted payoff: _"Is the Thai Crunch Bowl peanut-free?"_ has six sources and four answers.
Menu data declares `soy, wheat, sesame`. The recipe finds no peanut either. The FAQ says outright
that it's peanut-free. The legacy site's matrix leaves the column blank. **The peanut exposure
exists only in the Sunfield Foods spec sheet.** GROQ alone answers from the menu field,
confidently, and is wrong in the dangerous direction. It did exactly what it was asked; the
question was never a query.

**If stuck** — A `403` naming the knowledge base means the wrong token went to the KB endpoint.
`-32005` means the URL is the GROQ endpoint, not the KB one. If the peanut question still fires
`groq_query`, that's routing — Mission 1-4. Then `checkpoints/1-3.md`.

**Going deeper** — `kb/README.md` · `skills/sanity-workshop-knowledge-bases/references/what-the-kb-knows.md` ·
[Knowledge Bases](https://www.sanity.io/docs/ai/sanity-context-knowledge-bases) ·
[Context MCP tools](https://www.sanity.io/docs/ai/sanity-context-mcp-tools)

Two minutes worth spending: open the Context app in the facilitator's org (you've been added) and
read the KB's ingest report. It says your own FAQ is wrong and the legacy site is serving a claim
the current policy would never make. Nobody built an agent to learn that.
