# Define and deploy `menu-item-review`

Verified against `@sanity/workflow-engine@0.31.0` and `@sanity/workflow-cli@0.31.0` on a fresh
project, 2026-09-06. Port, don't author: this is the plugin README's `article-review` example
with the subject pointed at `menuItem` and the stages named for food safety.

## 1. `studio/workflows/menu-item-review.ts`

```ts
import {defineWorkflow} from '@sanity/workflow-engine/define'

export const menuItemReview = defineWorkflow({
  name: 'menu-item-review', // must match the mapping in sanity.config.ts
  title: 'Menu item review',
  description: 'Draft the copy, get food safety to sign off, publish.',
  initialStage: 'drafting',
  fields: [
    // The document this workflow is about. The plugin fills it in from the document.
    {type: 'subject', name: 'subject', title: 'Menu item', initialValue: {type: 'input'}},
  ],
  stages: [
    {
      name: 'drafting',
      title: 'Drafting',
      activities: [
        {
          name: 'write',
          title: 'Draft the description and allergen callout',
          // status: 'done' — firing this action completes the activity.
          actions: [{name: 'submit', title: 'Submit for food-safety review', status: 'done'}],
        },
      ],
      // No `when` — the stage advances once all its activities are done.
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
    // No transitions out = terminal. The workflow completes here.
    {name: 'approved', title: 'Approved', activities: []},
  ],
})
```

## 2. `studio/sanity.workflow.ts`

```ts
import {defineWorkflowConfig} from '@sanity/workflow-engine/define'
import {menuItemReview} from './workflows/menu-item-review'

// Read from studio/.env — sanity-workflows runs from the studio directory.
const projectId = process.env.SANITY_STUDIO_PROJECT_ID!
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production'

export default defineWorkflowConfig({
  deployments: [
    {
      expectedMinReaderModel: 4,
      name: 'production',
      // The tag namespaces all workflow data. The plugin only sees definitions
      // and instances deployed under the tag it was configured with.
      tag: 'production',
      workflowResource: {type: 'dataset', id: `${projectId}.${dataset}`},
      definitions: [menuItemReview],
    },
  ],
})
```

If `process.env` isn't populated when the CLI loads the file, hardcode the id from `studio/.env`
as `'<projectId>.production'` — it is the attendee's own project, nothing secret.

## 3. Deploy

```sh
cd studio
pnpm exec sanity-workflows deploy --tag production --dry-run   # JSON diff of what will deploy
pnpm exec sanity-workflows deploy --tag production
```

Expected:

```
✔ Processed 1 definition(s) · production (production) → <projectId>.production
  ✔ created   menu-item-review v1
```

Auth is the `sanity login` session (or `SANITY_AUTH_TOKEN`). Deploys are idempotent: re-running
an unchanged definition is a no-op; a changed one creates `v2`. `sanity-workflows definition
diff` compares code against the deployed version. The CLI also offers `--no-share-defs` if the
attendee would rather not share the definition with Sanity.

## 4. Click through

With `pnpm dev` running, open the Studio → Menu → All items → create a **new** menu item. The
workflow strip above the form shows _Drafting_ (auto-started). The **Workflows** tab beside the
editor lists the activity; open it and fire _Submit for food-safety review_. The strip moves to
_Food-safety review_. Fire _Approve_. The **Workflows** tool in the navbar shows the run in its
Overview table; select it to read the **history feed** — every action, who fired it, when, and the
transitions it caused.

## What the attendee sees

- A **workflow strip** above the form: current stage and a task count.
- A **Workflows tab** beside the editor: the stage's activities, where actions are fired.
- A **Workflows tool** in the navbar: Overview (Table | Board), _For me_, and a Definitions
  catalog; the run detail panel carries the history feed and an _Abort workflow_ button.

## Vocabulary check

`defineWorkflow` from `@sanity/workflow-engine/define` is the real API; the product is
**Workflows**. Don't use `@sanity/workflows` (a naming-proposal sample that never shipped) and
don't introduce Pipelines.
