# The shared Knowledge Base

Track 1, Mission 1-3 adds a Sanity Context **Knowledge Base** as a second source for your agent.
You do not build it — a build takes up to two hours — you point at one that is pre-built and
shared with the whole room. This page covers only what is specific to _this_ KB. Everything else
is in the public docs:

- [Knowledge Bases](https://www.sanity.io/docs/ai/sanity-context-knowledge-bases) · [Create one](https://www.sanity.io/docs/ai/sanity-context-create-knowledge-base) · [Source types](https://www.sanity.io/docs/ai/sanity-context-source-types) · [Retrieval modes](https://www.sanity.io/docs/ai/sanity-context-retrieval-modes) · [Resolve ingest issues](https://www.sanity.io/docs/ai/sanity-context-resolve-issues)

> Knowledge Bases are an opt-in early-access feature. Free while in beta; limits may change.

## Name

**Green & Gather — Allergens & Food Safety**

## How to reach it

The KB lives in the facilitator's organization, built from the shared Studio (project
`wzwhbn7m`), which is _not_ your project. Two things are set up for you:

1. **You are added to that organization**, so you can open the Context app and read the KB's
   sources and its **ingest report**. The ingest report is worth two minutes: it tells you the
   seed's own FAQ is wrong and the legacy site is serving a claim the current policy would never
   make. Nobody built an agent to learn that.
2. **A Knowledge-Base-mode MCP endpoint already exists**, and its URL plus a Context Viewer
   token are published in the workshop course. Mission 1-3 is "paste these two values as a
   second source". No per-attendee credential.

```sh
# app/.env.local
SANITY_CONTEXT_KB_URL=<published in the course>
# The token for THIS endpoint is for the facilitator's org, not yours. It is
# published alongside the URL. Keep it server-side like every other token.
```

**Which mode:** the second MCP is in **Knowledge Base mode**, not GROQ mode. Mode is derived from
the endpoint's sources — a KB source means KB tools (path search over the index); a dataset source
means GROQ tools. If an endpoint has both, the dataset wins and the KB is ignored, which is why it
has to be a _second_ endpoint.

## The six sources

| #   | Source                                                                          | In Sanity? | Why it's here                                                                                                                                                                     |
| --- | ------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `allergenPolicy`, `crossContactStatement`, `substitutionPolicy`, `prepStandard` | ✅         | The current, strict policy                                                                                                                                                        |
| 2   | `ingredient` documents (`allergenTags`)                                         | ✅         | Per-ingredient allergen picture                                                                                                                                                   |
| 3   | Sunfield Foods — tamarind-lime sauce spec sheet                                 | ❌ upload  | **The star.** _"Manufactured on equipment that also processes peanuts… cannot certify as free from peanut protein."_ The only place the Thai Crunch Bowl's peanut exposure exists |
| 4   | Northfield Bakehouse — flour tortilla spec sheet                                | ❌ upload  | Facility also handles egg and sesame; _"not suitable for gluten-free applications"_                                                                                               |
| 5   | Franchise Operations Manual §7, dated March 2025                                | ❌ upload  | Permits the gluten-free wrap swap the current `substitutionPolicy` refuses. Also the only place the in-store guacamole fact lives                                                 |
| 6   | Legacy nutrition microsite (crawl)                                              | ❌ crawl   | Allergen matrix v1 with a blank peanut column for Thai Crunch; Summer Peach still "Now Serving"; softer assurance language                                                        |

Three of six sources have no GROQ expression at all. That is one of the two honest reasons to
reach for a KB; the other is doing the reconciliation once, at build time, instead of on every
request.

## The planted payoff

_"Is the Thai Crunch Bowl peanut-free?"_ has six sources and four different answers. Menu data
declares `soy, wheat, sesame`. Traversing the recipe finds no peanut either. `gg.faq.thai-crunch-peanut`
says outright that it's peanut-free. The legacy matrix leaves the column blank. **The exposure
exists only in the Sunfield spec sheet.** GROQ answers from the menu field, confidently, and is
wrong in the dangerous direction. It's doing exactly what it was asked; the question was never a
query.

## Debug levers

If you go on to build your own KB, this is the whole troubleshooting model:

| Symptom                             | Lever                                              |
| ----------------------------------- | -------------------------------------------------- |
| A fact is missing                   | Add a source                                       |
| A fact is skipped or under-weighted | `purpose`                                          |
| Wrong shape, or no citation         | `instructions`                                     |
| Sources disagree                    | Resolve it into a rule in `instructions`           |
| The agent never looked at the KB    | That's **routing**, not a KB problem — Mission 1-4 |

**Never hand-edit entries.** A rebuild overwrites them.
