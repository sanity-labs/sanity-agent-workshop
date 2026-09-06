# Mission 1-5 · Personalize it

**Goal** — Make the most generic question there is answer differently for a signed-in guest,
without ever writing the guest into Sanity.

**Prompt** — copy this:

```
I'm on Mission 1-5 of the Sanity agent workshop (missions/1-5-personalize-it.md). Load the
sanity-workshop-context-groq skill and read its references/personalization.md.

app/lib/loyalty.ts is a stub for a loyalty CRM with two seeded guests; "dara" has a peanut
allergy on file. The ChatPanel already sends guestId in the request body to /api/agent (in a
real app this would come from the verified session — leave a comment saying so).

In app/app/api/agent/route.ts, read guestId, resolve it with getGuest(), and inject the
guest's signals into the system prompt as trusted, server-provided context — allergens,
dietary preferences, home location, usual order — with an instruction to check allergen facts
unprompted for anything you recommend. Anonymous (null) must keep working exactly as before.
Do NOT put the profile in a groqFilter, do NOT write anything to Sanity or the schema, and do
NOT change ChatPanel.tsx.

Then, with pnpm dev running, ask "What do you recommend?" twice via the running app's /api/agent
route: once with guestId "dara", once with guestId null. Show me both answers and the tool calls
each made. Run this against the app at localhost:3000 — not through your own Sanity tools.
```

**Done when** — Signed in as `dara`, the agent recommends from the catalog **and** checks the
allergen facts unprompted. The same question, asked anonymously, doesn't.

**The trap** — The instinct is a per-user `groqFilter`. That's wrong here: you aren't hiding menu
items from this guest, you're changing what gets _checked_ and how results _rank_. The documented
pattern is enrich-and-inject. Per-user `groqFilter` is for when user-owned documents genuinely
live in your dataset. Different problem.

**If stuck** — If both answers look the same, the guest block isn't reaching the system prompt
(log its length). If the agent checks allergens for the anonymous guest too, the instruction is
in the base prompt instead of the guest block. Then `checkpoints/1-5.md`.

**Going deeper** — `skills/sanity-workshop-context-groq/references/personalization.md` ·
[Sanity Context patterns → the personalized assistant](https://www.sanity.io/docs/ai/sanity-context-patterns)

Notice the routing changed too. Anonymous, "what's good here?" is a catalog question. For this
guest it's a catalog question **plus a mandatory knowledge-base lookup**, because a peanut allergy
makes the cross-contact fact non-optional. Mission 1-4 routed by question type; this routes by who
is asking.
