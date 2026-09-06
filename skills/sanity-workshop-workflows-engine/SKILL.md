---
name: sanity-workshop-workflows-engine
description: Put a human review gate in front of the Green & Gather menu pipeline with the Sanity Workflows engine, inside the sanity-agent-workshop repo. Use ONLY for Track 2 Mission 2-4 of that workshop: writing studio/workflows/menu-item-review.ts with defineWorkflow from @sanity/workflow-engine/define, studio/sanity.workflow.ts with defineWorkflowConfig, deploying with sanity-workflows deploy --tag production, the already-registered workflowStudioPlugin and its autoStart mapping, the Workflows tab, Submit then Approve, the history feed, and the three-layer enforcement story. Load it when someone in this repo mentions the Workflows engine, a workflow definition, stages, transitions, the review gate, an empty Workflows tab, or sanity-workflows. DO NOT load for chaining Sanity Functions or Agent Actions (Missions 2-1 to 2-3, sanity-workshop-functions-agent-actions), for "workflow" used generically about pipelines or GitHub Actions, for Track 1, or for Workflows questions outside this workshop repo.
---

# The Workflows engine — a human in front of the pipeline

You are helping a workshop attendee complete Mission 2-4 in the `sanity-agent-workshop` repo: a
new menu item is held at _review_ and cannot reach _approved_ until a person clicks Approve in
the Studio. This is a real build with a pre-1.0 product, verified on a freshly created project on
2026-09-06 with nothing but a `sanity login` session. Read `AGENTS.md` first; the attendee
observes, you type.

## What is already done, and what is the mission

| Already in the repo                                                                                                                                          | The mission                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| All eight `@sanity/workflow-*` packages at `0.31.0` in `studio/` (pinned exact; bump together or not at all)                                                 | Write `studio/workflows/menu-item-review.ts`                        |
| `workflowStudioPlugin({tag: 'production', mappings: [{docType: 'menuItem', definition: 'menu-item-review', autoStart: true}]})` in `studio/sanity.config.ts` | Write `studio/sanity.workflow.ts`                                   |
| `workflowDefaultDocumentNode()` inside `structureTool` (the Workflows tab)                                                                                   | `pnpm exec sanity-workflows deploy --tag production` from `studio/` |
| `workflows/README.md` — the longer explanation                                                                                                               | Open a menu item, Submit → Approve, read the history feed           |

The Workflows tab is empty until the definition is deployed. That is the intended seam, the same
one as the stubbed agent route in Track 1; the plugin drops an unmatched mapping with a
`console.warn`, never a crash.

## Four ideas, in dependency order

**Definition** (stages and the actions that move work between them; authored in code, deployed
as a versioned, immutable document into the dataset) → **instance** (one run, attached to one
document) → **stages** (an instance is in exactly one) → **activities** (units of work a stage
waits on) → **actions** (moves a person or the engine can make) → **fields** (what actions write —
workflow fields, not schema fields) → **transitions** (fire on a condition over fields; no `when`
means "when all activities are done") → guards → effects.

The engine is a **headless library, not a runtime**: it decides what happens next and queues
_effects_ that a runtime carries out. Two optional Sanity Functions (`heartbeat`,
`drain-effects`) cover timed waits and unattended effects. **A human clicking Approve needs
neither**, so this mission skips them. Mention them as what production adds.

## The three steps

Exact code for both files and the deploy command are in
[define-and-deploy.md](references/define-and-deploy.md). In brief:

1. **Define** `menu-item-review`: `drafting → review → approved`. Import from
   `@sanity/workflow-engine/define` (note the subpath). The `name` must match the mapping in
   `sanity.config.ts`. The subject field is `{type: 'subject', name: 'subject', initialValue:
{type: 'input'}}` so the plugin fills it from the document.
2. **Deploy** with `defineWorkflowConfig` in `studio/sanity.workflow.ts`: `tag: 'production'`
   (must match the plugin), `workflowResource: {type: 'dataset', id: '<projectId>.<dataset>'}`
   read from `studio/.env`. `--dry-run` previews as a JSON diff; real deploys are idempotent.
3. **Click through.** `autoStart: true` means a _fresh_ menu item (never persisted) is born under
   review when an editor opens it. Fire _Submit for food-safety review_, then _Approve_, then read
   the history feed in the run detail panel.

Done when a new menu item is held at `review` and can't reach `approved` until Approve is fired —
and the attendee can read the history feed to see what happened, in what order.

## The idea worth the whole mission

**A transition watches a field, not a button.** Clicking Approve writes an approval into the
instance's fields; the transition watches the field. An agent or a script can fire the same
action and write the same field, and the transition moves the instance the same way, because all
a transition ever sees is the fields, never who or what set them. Humans and agents on the same
primitives.

**Workflows coordinate handoffs between people and agents. Functions execute the machine steps.
Stages are for actors; steps are for code.** Track 2's core (2-1 to 2-3) isn't a warm-up for
this; it is what this delegates to.

## Say the enforcement story before someone tests it with curl

Three layers, three different guarantees — detail in [enforcement.md](references/enforcement.md):

| Layer                                                     | Enforces?                                                                                             |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Engine checks (action filters, verdicts)                  | **No, by design and permanently.** They exist so the UI can disable the right button and explain why. |
| `guards` (compile to a lock document in the Content Lake) | **The designed enforcement point.** The contract deploys today; lake-side denial has not shipped.     |
| Track 1's `groqFilter` on a private dataset               | **Yes, today.**                                                                                       |

The demonstration: publish the menu item straight from its document, skipping the workflow. The
instance **still advances** — the transition reads the document's published state, not whether
the action fired. The workflow follows what is true, not how it was made true. That is observing
reality, not enforcing it, and a learner who grasps it has the governance lesson.

## Rules

- **Don't touch `sanity.config.ts`** for this mission; the plugin is registered. If the tab is
  empty after deploy, it is the tag or the definition name, not the plugin.
- **Don't add schema fields for workflow state.** State lives in the engine's own documents.
- **Don't introduce Pipelines** (`definePipeline`) or call the Functions chain a "workflow". One
  product name per room.
- **Pre-1.0.** APIs may change; `0.31.0` is pinned. Don't upgrade during the workshop.

## When it doesn't work

| Symptom                                               | First suspect                                                                                                                        |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Workflows tab empty after deploy                      | `tag` mismatch between `sanity-workflows deploy --tag` and `workflowStudioPlugin({tag})`; or definition `name` ≠ `menu-item-review`. |
| Deploy 401/403                                        | Not logged in: `npx sanity login`. Auth is the session or `SANITY_AUTH_TOKEN`.                                                       |
| `workflowResource` errors                             | Id must be `<projectId>.<dataset>`, both from `studio/.env`.                                                                         |
| Strip shows "Start workflow" instead of auto-starting | The document already existed. `autoStart` is fresh-only (no `_createdAt`). Create a new item.                                        |
| Approve is disabled                                   | Advisory check: an activity isn't done or the actor lacks permission. Read the reason the UI gives.                                  |
| "The gate didn't stop my curl"                        | Correct, and expected. See enforcement.md.                                                                                           |
