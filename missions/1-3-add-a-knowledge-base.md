# Mission 1-3 · Add a knowledge base as a second source

**Goal** — Give the agent a second source that has already done the expensive reasoning, and
watch the hard question from 1-2 become one cited lookup.

**Before the prompt (you, in the Context app, ~5 minutes):** you started your Knowledge Base
build at the end of Mission 1-1. Now finish it — steps **5–7** of [`kb/README.md`](../kb/README.md):

1. Check the status line reads **Entries up to date**. Open **Issues** and read the ingest report:
   four expected conflicts, each one your own data disagreeing with a file. Accept the
   current-policy claim on each.
2. Add the three **instructions** from the recipe and rebuild.
3. Create a **second MCP** whose only source is the KB, paste its Instructions text, and copy its
   URL into `app/.env.local` as `SANITY_CONTEXT_KB_URL`. Same organization, so it uses your
   `SANITY_ORGANIZATION_TOKEN`.

> **Build still running?** Wait for the status line to read **Entries up to date** before going on.
> The build usually takes about ten minutes.

**Prompt** — copy this:

```
I'm on Mission 1-3 of the Sanity agent workshop (missions/1-3-add-a-knowledge-base.md). Load
the sanity-workshop-knowledge-bases skill.

I have added SANITY_CONTEXT_KB_URL to app/.env.local. That endpoint is a Sanity Context MCP in
Knowledge Base mode, pointed at the "Green & Gather — Allergens & Food Safety" knowledge base I
built in my own organization, so it takes my SANITY_ORGANIZATION_TOKEN as its bearer.

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

**If stuck** — An HTTP `405` means `SANITY_CONTEXT_KB_URL` is the Context app's browser address
for the KB (`context.sanity.io/…/knowledge-bases/kb…`), not the endpoint; use the
`api.sanity.io/v1/context/organizations/…/mcp/<name>` URL the app shows for the MCP. A `403`
naming the knowledge base means the wrong token went to the KB endpoint; it takes the same
`SANITY_ORGANIZATION_TOKEN` as the GROQ endpoint. `-32005` means the endpoint has no
readable KB — the URL is the GROQ endpoint, or your MCP has the dataset as a source too, so the
dataset won and the KB is ignored. If the peanut answer cites nothing or says "peanut-free", open
your KB's entry for the Thai Crunch Bowl: if the Sunfield sheet isn't cited, that upload didn't
land. If the peanut question still fires `groq_query`, that's routing — Mission 1-4. Then
`checkpoints/1-3.md`.

**Going deeper** — `kb/README.md` · `skills/sanity-workshop-knowledge-bases/references/what-the-kb-knows.md` ·
[Knowledge Bases](https://www.sanity.io/docs/ai/sanity-context-knowledge-bases) ·
[Context MCP tools](https://www.sanity.io/docs/ai/sanity-context-mcp-tools)

The two minutes you spent on the ingest report were the quiet lesson of this mission: your own
FAQ is wrong, and your legacy site is serving a claim the current policy would never make. The
build found that before any agent asked a question. Nobody built an agent to learn that.
