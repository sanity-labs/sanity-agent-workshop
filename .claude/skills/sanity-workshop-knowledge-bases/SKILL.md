---
name: sanity-workshop-knowledge-bases
description: Add the Green & Gather Knowledge Base (built from kb/README.md, or the shared backup) as a second Sanity Context source and teach the workshop agent which source to use, inside the sanity-agent-workshop repo. Use ONLY for Track 1 Missions 1-3 and 1-4 of that workshop: a second MCP in Knowledge Base mode (SANITY_CONTEXT_KB_URL, optional SANITY_CONTEXT_KB_TOKEN), merging two tool sets without initial_context collisions, knowledge_base_read and the outline, the peanut / shared-fryer / gluten-free questions, re-describing generic tools with domain framing, and the routing table that sends "anything with no sesame?" to GROQ and "is it safe for my sesame allergy?" to the KB. Load it when someone in this repo mentions the knowledge base, second endpoint, kb/README.md, routing, or tool descriptions. DO NOT load to build or tune a Knowledge Base outside this workshop (Sanity docs), for the first GROQ endpoint, embeddings, or groqFilter (sanity-workshop-context-groq), for Track 2, or for KB questions outside this workshop repo.
---

# The Knowledge Base as a second source — and you are the router

You are helping a workshop attendee extend the Green & Gather menu concierge in the
`sanity-agent-workshop` repo. Missions 1-1 and 1-2 gave it one endpoint in GROQ mode. This skill
covers adding a second endpoint in **Knowledge Base mode** (Mission 1-3) and the routing problem
that creates (Mission 1-4). Read `AGENTS.md` first; the attendee observes, you type.

## What this skill knows

| Mission | You help with                                                            | The attendee observes                                                                        |
| ------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| 1-3     | A second `createMCPClient` pointed at the KB; both tool sets registered  | A cited answer in **one lookup**, reconciling a supplier sheet that was never in the dataset |
| 1-4     | Domain-loaded tool descriptions and a routing table in the system prompt | Two near-identical questions stop landing on the same source, three times running            |

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
- **The attendee builds the KB themselves**, in their own organization, from `kb/README.md`: a
  dataset source (one GROQ query, 76 docs) plus four uploaded files in `kb/sources/`. They start
  the build at the end of Mission 1-1 so it is done by 1-3. **You do not build it for them** — it
  is UI work in the Context app — but you can read `kb/README.md` to tell them which step they are
  on, and you should ask whether the status line reads "Entries up to date" before wiring anything.
- **Auth is per organization, and usually the same one.** The attendee's KB is in their own org,
  so the KB endpoint takes `SANITY_ORGANIZATION_TOKEN` — same as the GROQ endpoint. Only the
  **shared backup KB** (build failed, still running, or Plan B) lives in the facilitator's org and
  needs `SANITY_CONTEXT_KB_TOKEN`. Wire the bearer as `SANITY_CONTEXT_KB_TOKEN ??
SANITY_ORGANIZATION_TOKEN`. A KB-mode endpoint with no readable KB is refused with JSON-RPC
  `-32005`; a token for the wrong org is a `403` naming the KB.
- **The debug levers are theirs now.** A missing fact → add a source; skipped or under-weighted →
  `purpose`; wrong shape or no citation → `instructions`; sources disagree → accept a claim in
  Issues, which writes the instruction. Never hand-edit entries; a rebuild overwrites them.

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

| Symptom                                          | First suspect                                                                                                                                              |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `403` naming a Knowledge Base                    | Wrong org's token at the KB endpoint: on their own KB, `SANITY_CONTEXT_KB_TOKEN` is set when it shouldn't be; on the shared backup, it's missing or wrong. |
| JSON-RPC `-32005`                                | No readable KB at that endpoint: the URL is the GROQ one, or the MCP also has a dataset source (dataset wins, KB ignored).                                 |
| Peanut answer never cites Sunfield               | The spec sheet didn't ingest. Check the KB's sources for a failed import; re-upload it from `kb/sources/`.                                                 |
| Build still running at 1-3                       | Use the shared backup KB (`kb/README.md`, bottom) and come back to theirs later.                                                                           |
| Only one `initial_context` / tools missing       | Spread collision. Strip or rename before merging.                                                                                                          |
| Peanut question still answered from `groq_query` | Routing (1-4), not the KB. The GROQ tool's description needs a boundary: "not for allergen safety or policy".                                              |
| KB answer has no citation                        | Not a code problem — an `instructions` lever on the KB. Point them at `kb/README.md` step 6; on the shared backup, tell a helper.                          |
| "Hand-edit the entry"                            | Never. A rebuild overwrites entries; fix the source or add an instruction.                                                                                 |
