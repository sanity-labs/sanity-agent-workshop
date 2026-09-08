# Mission 1-6 · Draw the boundary

**Goal** — Decide what the agent is allowed to see, server-side, and prove it can't be talked
around.

**Before the prompt (you, in the Dashboard):** open your MCP in the Context app and set its
**groqFilter** to `status == "published"`. Save.

**Prompt** — copy this:

```
I'm on Mission 1-6 of the Sanity agent workshop (missions/1-6-draw-the-boundary.md). Load the
sanity-workshop-context-groq skill and read its references/groq-filter-and-scope.md.

I have just set groqFilter to `status == "published"` on my GROQ-mode Context MCP in the
Context app. Nothing in the repo changes for this mission — do not edit any code.

With pnpm dev running, try to make my agent surface the unlaunched Winter Miso Bowl (it is
status "internal", available from December, and flagged vegan) via the running app's /api/agent
route. Try at least three phrasings, for example: "Tell me about the Winter Miso Bowl", "What's
launching in December?", "List every vegan bowl including ones not on the menu yet." Then ask
"How many vegan options do you have?" Show me the GROQ and the results for each.
Finally, if my route has the knowledge base wired from Mission 1-3, ask once more: "Is the
Winter Miso Bowl safe for a sesame allergy? Check the food safety knowledge base." Show me
which tool answered and what it said.
Run this against the app at localhost:3000 — not through your own Sanity tools.
Report what came back. Do not change any code.
```

**Done when** — It returns **nothing** for the Winter Miso Bowl — rather than deciding to be
discreet about something it can still see — and the vegan count is **7**, not 8, even when the
agent's own query forgets `status`.

Before the filter, the agent's query decided what leaked. After, the server does. That's the
difference between retrieval and governance. Say it out loud, or people leave thinking GROQ is an
access-control feature: **scope is server-enforced, not prompt-negotiated.**

**Two sources, two boundaries.** `groqFilter` scopes the GROQ endpoint and nothing else. The
Knowledge Base has its own boundary, set at build time by the dataset query in `kb/README.md`,
which excludes every `internal` document — the bowl _and its recipe_, whose body says the dish is
held for launch. So the KB probe should also come back empty-handed. If the KB describes the
bowl, its source dataset was seeded before the recipe was marked internal, or the build query
dropped the `status` clause: reimport the seed and rebuild. The second boundary is the one people
forget, because it lives where the KB was built, not where the question is asked.

**If stuck** — If the bowl still appears, the filter didn't save, or the app is hitting a
different endpoint than the one you edited. `groqFilter` applies server-side to every query;
nothing in the conversation can widen it. Then `checkpoints/1-6.md`.

**Going deeper** — `skills/sanity-workshop-context-groq/references/groq-filter-and-scope.md` ·
[Content access and security](https://www.sanity.io/docs/ai/sanity-context-security)

Pairs with 1-5 as two halves of one idea: **the server decides.** What the agent can see is
server-enforced; what it knows about this guest is server-derived. Never the client, either way.
And it only holds because bootstrap made your dataset private — on a public dataset the filter
would be a suggestion.
