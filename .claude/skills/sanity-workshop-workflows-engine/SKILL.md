---
name: sanity-workshop-workflows-engine
description: Put a human review gate in front of the Green & Gather menu pipeline with the Sanity Workflows engine, inside the sanity-agent-workshop repo. Use ONLY for Track 2 Mission 2-4 of that workshop: writing studio/workflows/menu-item-review.ts with defineWorkflow from @sanity/workflow-engine/define, studio/sanity.workflow.ts with defineWorkflowConfig, deploying with sanity-workflows deploy --tag production, the already-registered workflowStudioPlugin and its autoStart mapping, the publish-hold guard, the Workflows view, Submit then Approve, the run history, and what is and isn't enforced. Load it when someone in this repo mentions the Workflows engine, a workflow definition, stages, transitions, guards, the review gate, an empty Workflows view, or sanity-workflows. DO NOT load for chaining Sanity Functions or Agent Actions (Missions 2-1 to 2-3), for "workflow" used generically about pipelines or GitHub Actions, for Track 1, or for Workflows questions outside this workshop repo (use sanity.io/docs/workflows).
---

# The Workflows engine — a human in front of the pipeline

You are helping a workshop attendee complete Mission 2-4 in the `sanity-agent-workshop` repo: a
new menu item is held at _review_ and cannot reach _approved_ until a person fires Approve in
the Studio. Workflows is in **early access**, built in public; the official docs are at
<https://www.sanity.io/docs/workflows/introduction> and everything below is checked against them
(2026-09-06) and against a real deploy on a fresh project with `@sanity/workflow-*@0.31.0`. Read
`AGENTS.md` first; the attendee observes, you type.

## What is already done, and what is the mission

| Already in the repo                                                                                                                                          | The mission                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| All eight `@sanity/workflow-*` packages at `0.31.0` in `studio/` — one version across all of them; the peers are pinned exact                                | Write `studio/workflows/menu-item-review.ts`                        |
| `workflowStudioPlugin({tag: 'production', mappings: [{docType: 'menuItem', definition: 'menu-item-review', autoStart: true}]})` in `studio/sanity.config.ts` | Write `studio/sanity.workflow.ts`                                   |
| `workflowDefaultDocumentNode()` inside `structureTool` — adds the Workflows view to every document type                                                      | `pnpm exec sanity-workflows deploy --tag production` from `studio/` |
| `workflows/README.md` — the longer explanation with doc links                                                                                                | Create a new menu item, Submit → Approve, read the history          |

The Workflows view is empty until a definition is deployed under the matching tag. That is the
intended seam, the same one as the stubbed agent route in Track 1. A mapping to a definition that
isn't deployed yet is not an error.

## The vocabulary, as the docs define it

A **definition** describes the process: stages, the work in each, the rules for moving on.
Deploying it makes it available; starting it against a document creates an **instance**, a Sanity
document tracking that one run, pinned to the definition version it started on. A **stage** is a
named place; an instance sits in exactly one; a stage with no way out is terminal. An **activity**
is a unit of work in a stage. An **action** resolves an activity and writes its result into the
instance's **fields**. A **transition** watches those fields through a **condition** and moves the
instance on as soon as the condition holds — with no `when`, the default is `$allActivitiesDone`.
**Effects** are queued work that reaches outside the engine and need a runtime you operate to
drain them. **Guards** are restrictions deployed as their own document beside the content, for the
length of a stage visit.

**The engine is a library, not a service.** Nothing runs in the background. It acts only when
code calls it: the Studio plugin when an editor fires an action, the CLI, or a Sanity Function you
run. For a human clicking through, the Studio is the runtime and nothing else is needed. Deadlines
and unattended effects are what a Document Function and a Scheduled Function are for — production
concerns, not this mission.

## The three steps

Exact code and commands, in the official `defineStage` / `defineActivity` / `defineAction` /
`defineTransition` form, are in [define-and-deploy.md](references/define-and-deploy.md). In brief:

1. **Define** `menu-item-review`: `drafting → review → approved`. Import helpers from
   `@sanity/workflow-engine/define`. The `name` must match the mapping in `sanity.config.ts`. The
   subject field is `defineField({type: 'subject', name: 'subject', required: true, initialValue:
{type: 'input'}})` so the plugin fills it from the document. Add a **publish-hold guard** on the
   `review` stage so the Studio disables Publish while the item is under review — that is what
   "held" looks like.
2. **Deploy** with `defineWorkflowConfig` in `studio/sanity.workflow.ts`: `name` and `tag`
   `'production'` (the tag must match the plugin), `expectedMinReaderModel: 4`, `workflowResource:
{type: 'dataset', id: '<projectId>.<dataset>'}` from `studio/.env`. `--check` validates
   offline, `--dry-run` diffs against what's deployed, then deploy. Re-running an unchanged
   definition writes nothing.
3. **Click through.** `autoStart: true` starts the workflow when an editor creates a _fresh_ menu
   item in the Studio. Fire _Submit for food-safety review_, notice Publish is disabled with a
   tooltip naming the workflow, fire _Approve_, then read the run's history in the Workflows tool.

Done when a new menu item is held at `review` — Publish disabled, `approved` unreachable — until a
human fires Approve, and the attendee can read the history to see what happened, in what order.

## The idea worth the whole mission

People, agents, and applications all follow the same definition and write to the same record. An
action writes its result into the instance's fields; a transition watches the fields through a
condition and fires when it holds. Nothing chooses to move the instance, and nothing in a
transition knows _who_ wrote the field. That is why the same review gate can hold work produced by
the Function in Mission 2-3 and work a person typed: humans and agents on the same primitives.

The workshop's framing for it: **Workflows coordinate handoffs between people and agents.
Functions execute the machine steps. Stages are for actors; steps are for code.** Track 2's core
(2-1 to 2-3) isn't a warm-up for this; it's the machine side this coordinates.

## Say what is enforced before someone tests it with curl

From the official docs, in their words: _every check the engine makes is advisory_, and _the
Content Lake is the only enforcement point_. Detail and the demonstration in
[enforcement.md](references/enforcement.md):

| Layer                                                                    | Holds against a raw write?                                                                                                      |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Engine checks (action verdicts, permission gates, readiness)             | **No, by design.** They exist so a UI can disable the right controls and explain why.                                           |
| A **guard** (publish hold on the subject during `review`)                | **Not yet.** The engine and the Studio plugin honor it; the Content Lake does not evaluate guard documents during early access. |
| Dataset access control — and Track 1's `groqFilter` on a private dataset | **Yes, today.**                                                                                                                 |

The demonstration: with an item held at review, Publish is disabled in the Studio and the tooltip
names the workflow. A raw client write (`sanity documents create`, a curl with a write token)
still lands, and the instance doesn't move — it never saw the write, because it only watches its
own fields. The gate is a coordination layer with enforcement designed and pending, which is
exactly the contrast with Mission 1-6.

## Rules

- **Don't touch `sanity.config.ts`** for this mission; the plugin is registered. An empty
  Workflows view after deploy is the tag or the definition name, not the plugin.
- **Don't add schema fields for workflow state.** State lives in the engine's own documents
  (`sanity.workflow.definition`, `sanity.workflow.instance`, the guard document).
- **Keep `expectedMinReaderModel` a literal `4`**; don't import a constant for it.
- **Early access.** `0.x`, where a minor bump can break; the stored-document contract is
  stricter than the package API. Don't upgrade during the workshop. Leave definition sharing on
  unless the attendee objects (`--no-share-defs`).

## When it doesn't work

| Symptom                                                           | First suspect                                                                                                                                                                                  |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Workflows view empty after deploy                                 | `tag` mismatch between deploy and `workflowStudioPlugin({tag})`; definition deployed to a different dataset than the workspace's; definition `name` ≠ `menu-item-review`. Check in that order. |
| Strip shows the workflow greyed out with "isn't set up correctly" | A setup issue the plugin found; the reason is in the browser console prefixed `[workflow-studio-plugin]` and under **Setup issue** on the workflow's page in the Workflows tool.               |
| Deploy stops with `No Sanity token found`                         | `npx sanity login`, or `SANITY_AUTH_TOKEN`.                                                                                                                                                    |
| `invalid dataset resource id`                                     | Must be `<projectId>.<dataset>`, both from `studio/.env`.                                                                                                                                      |
| Deploy stops at `Reader-floor acknowledgement`                    | `expectedMinReaderModel` missing or too low; the message names the number.                                                                                                                     |
| Strip offers "Start workflow" instead of auto-starting            | The document already existed. `autoStart` is fresh-only. Create a new item.                                                                                                                    |
| Approve is disabled                                               | Advisory check; the UI names the reason (an activity not done, or permission).                                                                                                                 |
| "My curl publish went through"                                    | Expected during early access. See enforcement.md.                                                                                                                                              |
| Need to reset everything                                          | `pnpm exec sanity-workflows nuke --deployment production` deletes that deployment's definitions, instances, and guards; content is never touched.                                              |
