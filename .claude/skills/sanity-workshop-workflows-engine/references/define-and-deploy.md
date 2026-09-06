# Define and deploy `menu-item-review`

Checked against the official quick start, Studio plugin, deploy, and guards docs on 2026-09-06,
and against a real deploy on a fresh project with `@sanity/workflow-*@0.31.0`. Port, don't
author: this is the docs' `article-review` with the subject pointed at `menuItem`, the stages named
for food safety, and a publish hold added to `review`.

## 1. `studio/workflows/menu-item-review.ts`

```ts
import {
  defineAction,
  defineActivity,
  defineField,
  defineStage,
  defineTransition,
  defineWorkflow,
} from '@sanity/workflow-engine/define'

export const menuItemReview = defineWorkflow({
  name: 'menu-item-review', // must match the mapping in sanity.config.ts
  title: 'Menu item review',
  description: 'Draft the copy, get food safety to sign off, then publish.',
  initialStage: 'drafting',
  fields: [
    // The document this instance is about. `input` means the starter supplies it —
    // the Studio plugin fills it from the document. `required` makes a start without
    // it fail with a message naming the field.
    defineField({
      type: 'subject',
      name: 'subject',
      title: 'Menu item',
      required: true,
      initialValue: {type: 'input'},
    }),
  ],
  stages: [
    defineStage({
      name: 'drafting',
      title: 'Drafting',
      description: 'The copy is being written — by a person or by the draft-menu-copy Function.',
      activities: [
        defineActivity({
          name: 'write',
          title: 'Draft the description and allergen callout',
          // status: 'done' — firing this action resolves the activity.
          actions: [
            defineAction({name: 'submit', title: 'Submit for food-safety review', status: 'done'}),
          ],
        }),
      ],
      // No `when` — the default condition is $allActivitiesDone.
      transitions: [defineTransition({name: 'to-review', title: 'Send to review', to: 'review'})],
    }),
    defineStage({
      name: 'review',
      title: 'Food-safety review',
      description: 'A reviewer checks the allergen callout against the recipe.',
      // The publish hold. While an instance sits here, the Studio disables Publish
      // on the menu item and the tooltip names this workflow. Advisory today: the
      // Content Lake does not evaluate guard documents yet. See enforcement.md.
      guards: [
        {
          name: 'hold-publish',
          title: 'Hold publishing during food-safety review',
          match: {idRefs: [{type: 'fieldRead', field: 'subject'}], actions: ['publish']},
        },
      ],
      activities: [
        defineActivity({
          name: 'sign-off',
          title: 'Check the allergen callout against the recipe',
          actions: [defineAction({name: 'approve', title: 'Approve', status: 'done'})],
        }),
      ],
      transitions: [defineTransition({name: 'to-approved', title: 'Approve', to: 'approved'})],
    }),
    // No transitions out = terminal. The workflow completes here.
    defineStage({
      name: 'approved',
      title: 'Approved',
      description: 'Food safety has signed off. Publish when ready.',
    }),
  ],
})
```

## 2. `studio/sanity.workflow.ts`

The CLI reads this from the directory you run it in — `studio/`. It binds definitions to a
deployment: a `name` the CLI selects by, a `tag` the engine partitions its documents by, and the
`workflowResource` where definitions and instances are stored.

```ts
import {defineWorkflowConfig} from '@sanity/workflow-engine/define'

import {menuItemReview} from './workflows/menu-item-review'

export default defineWorkflowConfig({
  deployments: [
    {
      name: 'production',
      // Must match workflowStudioPlugin({tag}) in sanity.config.ts. A definition
      // deployed under another tag is invisible to the Studio.
      tag: 'production',
      // A reviewed literal. 4 is the baseline for engine-owned documents.
      expectedMinReaderModel: 4,
      // <projectId>.<dataset> — from studio/.env. The engine keeps its own documents
      // in the same dataset as the menu here, which is fine for a workshop.
      workflowResource: {type: 'dataset', id: 'PROJECT_ID.production'},
      definitions: [menuItemReview],
    },
  ],
})
```

Replace `PROJECT_ID` with the attendee's project id from `studio/.env`. It's their own project;
nothing secret.

## 3. Deploy

```sh
cd studio
pnpm exec sanity-workflows deploy --check            # offline: does it validate?
pnpm exec sanity-workflows deploy --dry-run --tag production   # read-only diff against what's deployed
pnpm exec sanity-workflows deploy --tag production   # write it
```

Expected on first deploy:

```
✔ Processed 1 definition(s) · production (production) → <projectId>.production
  ✔ created   menu-item-review v1
```

Auth is the `sanity login` session, or `SANITY_AUTH_TOKEN`. A version comes from the content of
the definition, so re-running an unchanged deploy writes nothing; a changed one creates `v2`, and
instances already running stay on `v1`. Definition sharing with Sanity is on by default during
early access; `--no-share-defs` opts out for one run.

## 4. Click through

With `pnpm dev` running: Studio → Menu → All items → **create a new menu item.** The workflow
strip above the form shows _Drafting_ — auto-started, because the mapping in `sanity.config.ts`
has `autoStart: true` and this is a fresh document. Fill in the required fields.

Open the **Workflows** view beside the editor. The `write` activity lists _Submit for food-safety
review_; fire it. The strip moves to _Food-safety review_. Now look at the document's **Publish**
action: disabled, with a tooltip naming the workflow. That is the hold.

Fire _Approve_ in the Workflows view. The strip moves to _Approved_; Publish is enabled again. Open
the **Workflows** tool in the navbar → Overview → this run → the detail panel shows the history:
start, submit, the transition to review, approve, the transition to approved, each with who and
when.

## What the attendee sees

- A **workflow strip** above the form: the current stage and open work.
- A **Workflows view** beside the editor: the stage's activities, fields, and available actions.
- A **Workflows tool** in the navbar: an Overview of runs, a _For me_ tab, definitions, and per-run
  detail with history.

## References

- Quick start: https://www.sanity.io/docs/workflows/getting-started
- Studio plugin: https://www.sanity.io/docs/workflows/studio-plugin
- Configure and deploy: https://www.sanity.io/docs/workflows/deploy-definitions
- Guards: https://www.sanity.io/docs/workflows/guards
- Reference: https://www.sanity.io/docs/workflows/reference
