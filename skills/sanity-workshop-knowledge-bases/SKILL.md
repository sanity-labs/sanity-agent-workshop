---
name: sanity-workshop-knowledge-bases
description: Add the shared Green & Gather Knowledge Base as a second Sanity Context source and teach the workshop agent which source to use, inside the sanity-agent-workshop repo. Use ONLY for Track 1 Missions 1-3 and 1-4 of that workshop: a second MCP in Knowledge Base mode (SANITY_CONTEXT_KB_URL, SANITY_CONTEXT_KB_TOKEN), merging two tool sets without initial_context collisions, knowledge_base_read and the outline, the peanut / shared-fryer / gluten-free questions, re-describing generic tools with domain framing, and the routing table that sends "anything with no sesame?" to GROQ and "is it safe for my sesame allergy?" to the KB. Load it when someone in this repo mentions the knowledge base, second endpoint, kb/README.md, routing, or tool descriptions. DO NOT load to build or tune a Knowledge Base from scratch (Sanity docs), for the first GROQ endpoint, embeddings, or groqFilter (sanity-workshop-context-groq), for Track 2, or for KB questions outside this workshop repo.
---

# The shared Knowledge Base as a second source — and you are the router

You are helping a workshop attendee extend the Green & Gather menu concierge in the
`sanity-agent-workshop` repo. Missions 1-1 and 1-2 gave it one endpoint in GROQ mode. This skill
covers adding a second endpoint in **Knowledge Base mode** (Mission 1-3) and the routing problem
that creates (Mission 1-4). Read `AGENTS.md` first; the attendee observes, you type.

## What this skill knows

| Mission | You help with                                                                  | The attendee observes                                                                        |
| ------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| 1-3     | A second `createMCPClient` pointed at the shared KB; both tool sets registered | A cited answer in **one lookup**, reconciling a supplier sheet that was never in the dataset |
| 1-4     | Domain-loaded tool descriptions and a routing table in the system prompt       | Two near-identical questions stop landing on the same source, three times running            |

## Product facts

- **Mode is derived from sources.** An MCP whose sources are all Knowledge Bases serves KB mode.
  If an MCP has a dataset source _and_ KB sources, the dataset wins and the KBs are silently
  ignored — which is why the KB is a **second** endpoint, not a source added to the first.
- **KB mode serves two tools:** `initial_context` (the outline of each KB: every entry path with a
  one-line summary, tagged `[core]` / `[peripheral]`) and `knowledge_base_read` (`{knowledgeBase:
"kb…", paths: [...]}`, up to 20 paths in one call, paths taken verbatim from the outline).
  Retrieval is **path navigation over an index built at ingest**, not embedding search; embedding
  search lives on the GROQ side.
- **A build reads the sources ahead of time, resolves conflicts, and writes entries with
  citations.** That reconciliation happens once, at build time. `groqFilter` does not apply in KB
  mode; scope is which KBs an endpoint serves.
- **Auth is per organization.** The KB lives in the facilitator's org, so its endpoint needs a
  Context Viewer token for _that_ org — `SANITY_CONTEXT_KB_TOKEN`, distinct from the attendee's own
  `SANITY_ORGANIZATION_TOKEN`. Both values are published in the workshop course. A KB-mode endpoint
  with no readable KB is refused with JSON-RPC `-32005`.
- **Nobody builds a KB in the room.** A build takes up to two hours. `kb/README.md` covers the
  shared KB's six sources and how to reach it; the public docs cover everything else.

## Mission 1-3 — the second source

Add a second MCP client next to the first, merge the tool sets, and register both on
`streamText`. The one trap is **name collisions**: both endpoints serve `initial_context`, and a
naive spread lets the second overwrite the first. Strip `initial_context` from both (or rename),
and give the KB's tool a name that says what it is. The pattern is in
[second-source.md](references/second-source.md).

Then ask, one at a time: _"Is the Thai Crunch Bowl peanut-free?"_, _"Is your fryer shared?"_,
and the gluten-free question from Mission 1-2 again. What the KB knows, and what a correct answer
looks like for each, is in [what-the-kb-knows.md](references/what-the-kb-knows.md). The payoff
to point at: the peanut answer cites the Sunfield Foods spec sheet — a PDF that was never in the
dataset — and the gluten-free question that took several GROQ calls now takes **one**
`knowledge_base_read`.

**Do not answer these questions with your own tools.** Send them to the running app's
`/api/agent` route and show the attendee the tool trace. If the agent still reaches for
`groq_query` on the peanut question, that is Mission 1-4's material, not a bug to fix now.

## Mission 1-4 — there is no built-in router

Two endpoints means two tool sets in one flat list, and the model picks by name and description.
Sanity Context's tools are intentionally generic: `groq_query` describes a mechanism, not a
domain. Nothing underneath inspects a question and routes it. **You are the router**, and you
express routing through tool descriptions, the system prompt, and scoping.

The test pair: _"anything with no sesame?"_ (a filter over declared data → GROQ) and _"is it safe
for my sesame allergy?"_ (a liability statement about what the brand will guarantee → KB). One
word apart, two different doors. Done when each goes to the right source **three times running**.
The four levers, in order, and the Green & Gather routing table are in
[routing.md](references/routing.md). Do the cheap ones first: a routing table in the system
prompt, then re-described tools. Only reach for pre-classification or sub-agents if the room has
time — it doesn't.

## The framing to keep straight

GROQ **retrieves**. A KB **reconciles**. Don't compare them on speed or cost; GROQ beats a KB on
any simple filter, and it is the only one of the two that can _compute_ (count, compare, sort).
Two separate reasons to reach for a KB: the same reconciliation done once instead of per request,
and a source with no GROQ expression at all (a supplier PDF). Neither one is "GROQ failed". If a
question is computed over a set, it is GROQ; if it is stated somewhere, ask how many places and
whether they agree.

## When it doesn't work

| Symptom                                          | First suspect                                                                                                                             |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `403` naming a Knowledge Base                    | `SANITY_CONTEXT_KB_TOKEN` isn't a Context Viewer token for the facilitator's org, or the wrong variable is being sent to the KB endpoint. |
| JSON-RPC `-32005`                                | The endpoint has no readable KB source — check the URL is the KB endpoint, not the GROQ one.                                              |
| Only one `initial_context` / tools missing       | Spread collision. Strip or rename before merging.                                                                                         |
| Peanut question still answered from `groq_query` | Routing (1-4), not the KB. The GROQ tool's description needs a boundary: "not for allergen safety or policy".                             |
| KB answer has no citation                        | Not this repo's problem — a `purpose`/`instructions` lever on the KB, which is the facilitator's. Report it.                              |
| "Hand-edit the entry"                            | Never. A rebuild overwrites entries; fix the source or add an instruction.                                                                |
