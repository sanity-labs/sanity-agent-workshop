# Mission 1-4 · Teach it which source to use

**Goal** — Make two near-identical questions land on two different sources, consistently.

**Prompt** — copy this:

```
I'm on Mission 1-4 of the Sanity agent workshop (missions/1-4-teach-it-which-source-to-use.md).
Load the sanity-workshop-knowledge-bases skill and read its references/routing.md.

My agent in app/app/api/agent/route.ts has two sources: a GROQ-mode Context MCP over my menu
dataset and a Knowledge-Base-mode MCP over the allergen & food-safety knowledge base.
There is no built-in router; the model picks tools by name and description.

First, with pnpm dev running, ask these two questions three times each, fresh conversation every
time, via the running app's /api/agent route, and show me which tool each one used:
  A. "Anything with no sesame?"
  B. "Is it safe for my sesame allergy?"
Run this against the app at localhost:3000 — not through your own Sanity tools.

Then, only if they are not consistently landing on the right source (A → the menu dataset via
GROQ, B → the knowledge base): add a routing table to the system prompt based on the
source-of-truth table in the skill, and re-describe the generic Sanity tools with domain-loaded
names and descriptions that say what each is for and what it is NOT for. Change nothing else.
Repeat the three-times test and show me the before and after.
```

**Done when** — The filter question goes to GROQ and the allergen question goes to the knowledge
base, **three times running.**

Why the pair is sharp: the naive read is that they're the same question. They aren't. One is a
set operation over declared data; the other is a liability statement about what you're willing to
guarantee. This mission only exists because Mission 1-3 created two overlapping tool sets — which
is why it can't come earlier.

**If stuck** — Do the cheapest lever first (the routing table), then re-describe tools. If the
agent still routes "is it safe" to GROQ, its GROQ tool description needs an explicit boundary:
_"not for allergen safety, cross-contact, or policy."_ Then `checkpoints/1-4.md`.

**Going deeper** — `skills/sanity-workshop-knowledge-bases/references/routing.md` ·
[Sanity Context patterns → multi-backend agents](https://www.sanity.io/docs/ai/sanity-context-patterns)

The most technically real thing in the workshop: production agents talk to several backends, and
"you are the router" is the fact that decides whether they work.
