# Missions

Ten missions across two tracks, plus a page for bringing your own content. Each mission is a
**brief with a paste-ready prompt**: you hand the prompt to your coding agent, it does the
typing, and the constraint inside the prompt makes you stop and look at what happened. That is
the design, not a shortcut — it is how people build today, and the thing you leave with is a
mental model, not a typing exercise.

**The theme:** _an agent is only as good as what it can find and what it's allowed to do._ Track 1
is the first half of that sentence. Track 2 is the second. Governance is the hinge.

## How to run a mission

1. Open the mission file. Read **Goal** and **Done when** before anything else.
2. Copy the **Prompt** block into your coding agent, in this repo, with `pnpm dev` running and
   three tabs open: `localhost:3333` (Studio), `localhost:3000` (the app), `localhost:8080` (the
   Functions emulator).
   Claude Code loads the `skills/` automatically; other agents can read `AGENTS.md` and the
   relevant `skills/<name>/SKILL.md`.
3. Watch what the agent shows you. **Done when is always an observation** — a tool call you can
   read, a field that changed, a log line — never an artifact the agent hands you.
4. Stuck? The **If stuck** nudge, then `checkpoints/<mission>.md` for what a correct result looks
   like. Checkpoints have no code in them on purpose.
5. Edit the prompt freely. Every prompt names its own assumptions (which question, which field,
   which item) so it can be pointed at your own content. See [make-it-yours.md](make-it-yours.md).

**Two lines the prompts carry, and why.** Every Track 1 prompt says _"Run this against the app at
localhost:3000 — not through your own Sanity tools."_ Your agent has the Sanity MCP server and
can answer "what vegan bowls are under $12 in Austin?" itself, correctly, without the agent you
are building ever being involved. Mission 1-2's prompt ends _"Do not change any code. Just
report."_ Without it the agent starts optimizing and the observation never happens.

**Missions 1-1 to 1-3 and 2-1 to 2-2 are complete results.** Everything after is for whoever gets
there. Nobody has to finish a list; somebody should leave having accomplished something.

## Where each track is headed

### Track 1 · Build an agent that answers from your content

A menu concierge for Green & Gather that answers allergen and dietary questions from the menu,
the linked recipes, and a Knowledge Base built from policy docs and supplier sheets.

**Core (1-1 to 1-3)** teaches the ways an agent can search your content and how to pick the
right one for the question in front of you. You point an agent at your dataset and read the GROQ
it writes. You watch the same endpoint answer three questions with three different query shapes,
and count the calls the hard one takes. Then you add a Knowledge Base — one you build yourself,
from your dataset plus four files, started at the end of 1-1 so it's ready by 1-3 — and watch that
hard question collapse into one cited lookup, citing a supplier sheet that was never in your
dataset.

**Go Further (1-4 to 1-6)** is the production-shaped work: there is no built-in router, so you
teach the agent which source to use; you personalize it for a signed-in guest without ever
writing the guest into Sanity; and you draw the boundary of what it can see, server-side, so an
unlaunched item returns nothing instead of being discreetly withheld.

**What lands:** retrieval is a _choice_, and you are the router. Content is never the lever on
this track — every change is what the agent can reach or how it decides.

### Track 2 · Build a content process that runs itself

A Function that fires on a new menu item, drafts the description and allergen callout from the
recipe, adapts the copy per market, and holds the item for a human to sign off.

**Core (2-1 to 2-3)** is event → AI step → chain, on Sanity Functions and Agent Actions. You
publish a document and read the Function log. You add an AI step and see it draft a callout that
names an allergen the menu never declared, because you handed it the recipe. You chain Generate
into three market variants and give the pipeline a stop condition — then publish an item whose
recipe reveals an undeclared allergen and watch it **not** ship.

**Offramp (2-4)** is a real build with the Workflows engine: define a review workflow in code,
deploy it, and hold a menu item at _review_ until a human clicks Approve. The plugin is already
registered; you deploy a definition. Then deploy the 2-3 handler and run the whole thing end to
end: the Function drafts, the gate holds, a person approves.

**What lands:** an AI step is only as good as the context you hand it, and some steps need a
human in front of them. Marketing copy localizes; a safety statement doesn't. This track _does_
change documents — the state is visible in the Studio and the log.

## The ten missions at a glance

| #                                            | Mission                                 | Technology                                                                    | Concept                                                                      | Skill                                     |
| -------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------- |
| [1-1](1-1-point-an-agent-at-your-content.md) | Point an agent at your content          | Context MCP (GROQ mode), the Context app, `@ai-sdk/mcp`                       | Context is the door; GROQ is what comes through it                           | `sanity-workshop-context-groq`            |
| [1-2](1-2-see-every-way-it-can-search.md)    | See every way it can search             | Exact filters, `text::query()`, `text::semanticSimilarity()` in one `score()` | One endpoint, several modalities; you pick per question                      | `sanity-workshop-context-groq`            |
| [1-3](1-3-add-a-knowledge-base.md)           | Add a knowledge base as a second source | Context Knowledge Bases, `knowledge_base_read`                                | Reconcile once at build time, not per request                                | `sanity-workshop-knowledge-bases`         |
| [1-4](1-4-teach-it-which-source-to-use.md)   | Teach it which source to use            | Tool descriptions, routing table                                              | There is no built-in router. You are                                         | `sanity-workshop-knowledge-bases`         |
| [1-5](1-5-personalize-it.md)                 | Personalize it                          | Loyalty stub, enrich-and-inject                                               | Route by who's asking; signals ride on top                                   | `sanity-workshop-context-groq`            |
| [1-6](1-6-draw-the-boundary.md)              | Draw the boundary                       | `groqFilter`, `status`                                                        | Scope is server-enforced, not prompt-negotiated                              | `sanity-workshop-context-groq`            |
| [2-1](2-1-run-code-when-content-changes.md)  | Run code when content changes           | Functions, Blueprints, logs                                                   | Content events are a trigger surface                                         | `sanity-workshop-functions-agent-actions` |
| [2-2](2-2-add-an-ai-step.md)                 | Add an AI step                          | Agent Action Generate                                                         | A step is only as good as its context                                        | `sanity-workshop-functions-agent-actions` |
| [2-3](2-3-chain-the-steps-together.md)       | Chain the steps together                | Agent Action Transform, chained steps, a stop condition                       | Automation needs a stop condition; safety copy doesn't localize              | `sanity-workshop-functions-agent-actions` |
| [2-4](2-4-put-a-human-in-front-of-it.md)     | Put a human in front of it              | `defineWorkflow`, `sanity-workflows deploy`, the Studio plugin                | A transition watches a field, not a button — and this gate is advisory today | `sanity-workshop-workflows-engine`        |

## Which door, which question

| GROQ (Context MCP)                                                | Knowledge Base                               |
| ----------------------------------------------------------------- | -------------------------------------------- |
| "What vegan bowls are under $12 in Austin?"                       | "Is the Thai Crunch Bowl peanut-free?"       |
| "Anything under 600 calories with no sesame?"                     | "What's your allergen policy?"               |
| "How many vegan options do you have?"                             | "Is your fryer shared?"                      |
| "Something filling that isn't spicy"                              | "Can you make the harissa wrap gluten-free?" |
| "Is the Summer Peach Bowl still available?"                       | "Is the guacamole made in-store?"            |
| "How many calories in the autumn item?" _(null is an answer)_     |                                              |
| "Do you have locations in Toronto?" _(an empty set is an answer)_ |                                              |

**The pair that teaches it:** _"anything with no sesame?"_ is a filter over declared allergen
data. _"Is it safe for my sesame allergy?"_ is a statement about what you're willing to guarantee.
One word apart, two different doors.

Three questions, in order: **Who owns the answer?** If it's an operational system (stock,
orders), it's neither — call that system. **Is it computed over a set, or stated somewhere?**
Computed → GROQ. **How many places could it be stated, and do they agree?** One field → GROQ can
fetch it. Several sources that might disagree, or sources Sanity doesn't own → KB.

## The rules your agent follows

`AGENTS.md` carries them. The ones that matter most: one mission at a time; never implement a
mission you haven't opened; never read `checkpoints/` unless asked; when you ask "why is this
wrong?" it diagnoses and doesn't fix; never a `spicy` field, never allergens denormalized onto
`menuItem`, never the guest profile in Sanity; `pnpm verify` after any schema change.
