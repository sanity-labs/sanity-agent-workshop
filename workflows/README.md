# Workflows — the engine behind Track 2's last mission

> **Unofficial and pre-1.0.** This page is written from the `@sanity/workflow-studio-plugin`
> README and verified behaviour at version **0.31.0**. Every `@sanity/workflow-*` package is
> pre-1.0; APIs may change. Not for production use. If you have access to the `sanity-io/workflows`
> repository, its `docs/` are the fuller source.

Mission 2-4 puts a human in front of the pipeline: a new menu item is held at _review_ and cannot
reach _approved_ until someone clicks Approve in the Studio. This is a real build with the
Workflows engine, and the plugin is already registered in `studio/sanity.config.ts` — you deploy
a **definition**, you don't wire the plugin.

## Four ideas

- A **definition** describes a workflow's stages and the actions that move work between them.
  Authored in code, deployed as a document into your dataset. Versioned and immutable.
- An **instance** is one run of a definition, attached to one of your documents.
- The **plugin** (`@sanity/workflow-studio-plugin`) is the Studio UI over both: a workflow strip
  above the form, a Workflows tab beside the editor, and a Workflows tool in the navbar with a
  run table and a per-run **history feed**.
- A small **runtime** you host (two Sanity Functions) handles what editors can't — timed waits
  and unattended side-effects. **Optional for this mission.** Everything a human clicking Approve
  needs works without it.

Vocabulary in dependency order: definition → instance → **stages** (an instance is in exactly
one) → **activities** (units of work a stage waits on) → **actions** (moves a person or the
engine can make) → **fields** (what actions write — workflow fields, not schema fields) →
**transitions** (fire on a condition over fields) → guards → effects.

## The three steps

**1. Define it** — `studio/workflows/menu-item-review.ts`. Note the `/define` subpath.

```ts
import {defineWorkflow} from '@sanity/workflow-engine/define'

export const menuItemReview = defineWorkflow({
  name: 'menu-item-review', // must match the mapping in sanity.config.ts
  title: 'Menu item review',
  description: 'Draft the copy, get food safety to sign off, publish.',
  initialStage: 'drafting',
  fields: [{type: 'subject', name: 'subject', title: 'Menu item', initialValue: {type: 'input'}}],
  stages: [
    {
      name: 'drafting',
      title: 'Drafting',
      activities: [
        {
          name: 'write',
          title: 'Draft the description and allergen callout',
          actions: [{name: 'submit', title: 'Submit for food-safety review', status: 'done'}],
        },
      ],
      transitions: [{name: 'to-review', title: 'Send to review', to: 'review'}],
    },
    {
      name: 'review',
      title: 'Food-safety review',
      activities: [
        {
          name: 'review',
          title: 'Check the allergen callout against the recipe',
          actions: [{name: 'approve', title: 'Approve', status: 'done'}],
        },
      ],
      transitions: [{name: 'to-approved', title: 'Approve', to: 'approved'}],
    },
    {name: 'approved', title: 'Approved', activities: []}, // no transitions out = terminal
  ],
})
```

**2. Deploy it** — `studio/sanity.workflow.ts`, then one command. Auth is your `sanity login`
session (or `SANITY_AUTH_TOKEN`). State is documents in your own dataset. Deploys are idempotent.

```ts
import {defineWorkflowConfig} from '@sanity/workflow-engine/define'
import {menuItemReview} from './workflows/menu-item-review'

export default defineWorkflowConfig({
  deployments: [
    {
      expectedMinReaderModel: 4,
      name: 'production',
      tag: 'production', // must match workflowStudioPlugin({tag}) in sanity.config.ts
      workflowResource: {type: 'dataset', id: '<projectId>.<dataset>'},
      definitions: [menuItemReview],
    },
  ],
})
```

```sh
cd studio && npx sanity-workflows deploy --tag production   # --dry-run to preview
```

**3. Open a menu item.** The plugin is already configured with `autoStart: true` for `menuItem`,
so a _fresh_ document is born under review. Click **Submit for food-safety review**, then
**Approve**, and read the history feed.

## Two things to get right

- **The `tag` must match** between `sanity-workflows deploy --tag` and `workflowStudioPlugin({tag})`.
  A mismatch shows no definitions and the Workflows tab looks broken.
- **`structureTool` needs both `structure` and `defaultDocumentNode: workflowDefaultDocumentNode()`.**
  Already done in `sanity.config.ts` — don't replace one with the other.

## The idea worth the whole mission

**A transition watches a field, not a button.** Clicking Approve writes an approval into the
instance's fields; the transition watches the field. An agent or a script can fire the same
action and write the same field, and the transition moves the instance the same way — all a
transition ever sees is the fields, never who or what set them. Humans and agents on the same
primitives, because the mechanism cannot tell them apart.

**Workflows coordinate handoffs between people and agents. Functions execute the machine steps.
Stages are for actors; steps are for code.** The engine is a headless library, not a runtime: it
decides what happens next and queues _effects_ that your Function carries out. Track 2's core
(Missions 2-1 to 2-3) isn't a warm-up for this — it's what this delegates to.

## The enforcement story — three layers, not one

Someone will test the gate with `curl`, so here it is first:

| Layer                                                     | Enforces?                                                                                                                                                                          |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Engine checks (action filters, verdicts)                  | **No, by design and permanently.** They exist so the UI can disable the right button and explain why                                                                               |
| `guards` (compile to a lock document in the Content Lake) | **The designed enforcement point.** The contract document deploys today; **lake-side denial has not shipped**: a raw client writing directly to the Content Lake is not yet denied |
| Track 1's `groqFilter` on a private dataset               | **Yes, today**                                                                                                                                                                     |

Publish a menu item straight from its document, skipping the workflow, and the instance still
advances — the transition reads the document's published status, not whether the action fired.
The workflow follows what is true, not how it was made true. That is observing reality, not
enforcing it.

## v0 limits

One instance per document · code-defined, no visual builder · the Studio plugin is explicitly
temporary · 0.31.0, pre-1.0, breaking changes expected · not for production · no native
Slack/Linear connectors (the engine queues an effect, you write the handler) · guard enforcement
pending.

## Naming

**Workflows** is the editorial product, composed of _stages_, where people and agents act. Track
2's Missions 2-1 to 2-3 chain _Functions_ — the machine side. Don't call that a workflow, and
don't introduce a third product name.
