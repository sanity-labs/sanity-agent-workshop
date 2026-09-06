# Workflows — the engine behind Track 2's last mission

> **Early access, built in public.** Everything here is from the official docs at
> <https://www.sanity.io/docs/workflows/introduction> (checked 2026-09-06) and from a real deploy
> on a fresh project with `@sanity/workflow-*@0.31.0`. Read
> [How early access works](https://www.sanity.io/docs/workflows/prerelease) before relying on it:
> the packages are `0.x`, a minor bump can break, and the stored-document contract is stricter
> than the package API.

Mission 2-4 puts a human in front of the pipeline: a new menu item is held at _review_ and cannot
reach _approved_ until someone fires Approve in the Studio. The plugin is already registered in
`studio/sanity.config.ts` — you deploy a **definition**, you don't wire the plugin.

## The vocabulary

Sanity Workflows turns a content process into data. You describe the process once as a
**definition**: the stages content moves through, the work in each stage, and the rules for moving
on. Every run is an **instance**, a Sanity document tracking that one run, pinned to the definition
version it started on. People, agents, and applications all follow the same definition and write to
the same record.

Inside one run: a **stage** is a named place, and an instance sits in exactly one (a stage with no
way out is terminal). A stage holds **activities**, the work to be done there. An **action**
resolves an activity — a person approves, an agent finishes a job — and writes its result into the
instance's **fields**. A **transition** watches those fields through a **condition** and moves the
instance on as soon as the condition holds; nothing chooses to move it. **Effects** are queued work
that reaches outside the engine. **Guards** are restrictions deployed as their own document beside
the content, for the length of a stage visit.

**The engine is a library, not a service.** Nothing runs in the background and nothing moves on a
timer by itself. It acts only when code calls it — the Studio plugin when an editor fires an
action, the CLI, or a Sanity Function you run. A human clicking Approve needs nothing more than the
Studio. Deadlines and unattended effects are what a Document Function (to drain effects) and a
Scheduled Function (to tick) are for — production, not this mission.

## The three steps

Full code, in the official helper form, in
[`skills/sanity-workshop-workflows-engine/references/define-and-deploy.md`](../skills/sanity-workshop-workflows-engine/references/define-and-deploy.md).

**1. Define it** — `studio/workflows/menu-item-review.ts`, with `defineWorkflow`, `defineStage`,
`defineActivity`, `defineAction`, `defineTransition`, and `defineField` from
`@sanity/workflow-engine/define`. Stages `drafting → review → approved`; a required `subject`
field with `initialValue: {type: 'input'}`; and a **publish-hold guard** on `review` so the Studio
disables Publish while the item is under review.

**2. Deploy it** — `studio/sanity.workflow.ts` with `defineWorkflowConfig`: `name` and `tag`
`'production'`, `expectedMinReaderModel: 4`, `workflowResource: {type: 'dataset', id:
'<projectId>.<dataset>'}`. Then, from `studio/`:

```sh
pnpm exec sanity-workflows deploy --check                      # offline validation
pnpm exec sanity-workflows deploy --dry-run --tag production   # diff against what's deployed
pnpm exec sanity-workflows deploy --tag production
```

Auth is your `sanity login` session or `SANITY_AUTH_TOKEN`. Re-running an unchanged definition
writes nothing.

**3. Create a new menu item.** The mapping in `sanity.config.ts` has `autoStart: true`, so a fresh
document is born under review. Fire _Submit for food-safety review_ in the Workflows view, notice
Publish is disabled, fire _Approve_, and read the run's history in the Workflows tool.

## Two things to get right

- **The `tag` must match** between the deploy and `workflowStudioPlugin({tag})`. A definition
  deployed under another tag is invisible to the Studio — the first thing to check when the
  Workflows view is empty.
- **`structureTool` needs both `structure` and `defaultDocumentNode:
workflowDefaultDocumentNode()`.** Already done in `sanity.config.ts`.

## The idea worth the whole mission

An action writes its result into the instance's fields; a transition watches the fields and fires
when its condition holds. Nothing in a transition knows _who_ wrote the field. The same gate holds
work the Function drafted in Mission 2-3 and work a person typed — humans and agents on the same
primitives. The workshop's framing: **Workflows coordinate handoffs between people and agents.
Functions execute the machine steps. Stages are for actors; steps are for code.**

## What is enforced — say it before someone tests it with curl

In the docs' words: _every check the engine makes is advisory_, and _the Content Lake is the only
enforcement point._

| Layer                                                                    | Holds against a raw write?                                                                                                      |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Engine checks (action verdicts, permission gates, readiness)             | **No, by design.** They exist so a UI can disable the right controls and explain why.                                           |
| A **guard** (the publish hold)                                           | **Not yet.** The engine and the Studio plugin honor it; the Content Lake does not evaluate guard documents during early access. |
| Dataset access control — and Track 1's `groqFilter` on a private dataset | **Yes, today.**                                                                                                                 |

The demonstration: with an item held at review, Publish is disabled in the Studio. Publish the same
document with a write token from a terminal and it lands — and the instance doesn't move, because
it only watches its own fields. A coordination layer with enforcement designed and pending, which
is exactly the contrast with Mission 1-6.

## Early access, plainly

`0.x` where a minor bump can break · one exact version across every `@sanity/workflow-*` package ·
the stored-document contract only grows, never migrates · you run the runtime · the lake does not
enforce guards yet · `sanity blueprints deploy` cannot deploy Workflows resources yet, use
`sanity-workflows deploy` · `sanity-workflows nuke --deployment <name>` resets a deployment's
definitions, instances, and guards without touching content.

## Naming

**Workflows** is the product, composed of stages where people and agents act. Track 2's Missions
2-1 to 2-3 chain _Functions_ — the machine side. Don't call that a workflow.

## Docs

[Introduction](https://www.sanity.io/docs/workflows/introduction) ·
[Quick start](https://www.sanity.io/docs/workflows/getting-started) ·
[Studio plugin](https://www.sanity.io/docs/workflows/studio-plugin) ·
[Configure and deploy](https://www.sanity.io/docs/workflows/deploy-definitions) ·
[Guards and enforcement](https://www.sanity.io/docs/workflows/guards) ·
[How early access works](https://www.sanity.io/docs/workflows/prerelease) ·
[Reference](https://www.sanity.io/docs/workflows/reference)
