# Mission 2-4 · Put a human in front of it

**Goal** — Hold a menu item at review until a person signs off, with the Workflows engine.

**Prompt** — copy this:

```
I'm on Mission 2-4 of the Sanity agent workshop (missions/2-4-put-a-human-in-front-of-it.md).
Load the sanity-workshop-workflows-engine skill and read its references/define-and-deploy.md.

The Workflows Studio plugin is already registered in studio/sanity.config.ts with tag
"production" and an autoStart mapping from menuItem to a definition named "menu-item-review"
that does not exist yet. Do not edit sanity.config.ts.

Write studio/workflows/menu-item-review.ts with defineWorkflow from
@sanity/workflow-engine/define: stages drafting → review → approved, a subject field for the
menu item, a "submit for food-safety review" action in drafting and an "approve" action in
review. Write studio/sanity.workflow.ts with defineWorkflowConfig, tag "production", and
workflowResource pointing at my project and dataset from studio/.env. Run the deploy with
--dry-run first and show me the diff, then deploy for real with
`pnpm exec sanity-workflows deploy --tag production` from the studio directory.

Then tell me exactly what to click in the Studio at localhost:3333 to create a new menu item,
submit it, approve it, and read the history feed. Do not add any schema fields. Do not click
through for me — I want to do that part.
```

**Done when** — A new menu item is **held at `review`** and can't reach `approved` until a human
fires Approve in the Studio — and you can read the history feed to see what happened, in what
order.

**The idea worth the whole mission** — A transition keys off **fields, not a button press.**
Clicking Approve writes an approval into the instance's fields; the transition watches the field.
An agent or a script can fire the same action and write the same field, and the transition moves
the instance the same way, because all a transition ever sees is the fields, never who or what set
them. Humans and agents on the same primitives.

**Say the enforcement story out loud** — three layers, not one. Engine checks are advisory by
design, permanently. Guards are the designed enforcement point, and lake-side denial hasn't
shipped yet. Track 1's `groqFilter` on a private dataset is enforced today. Someone will test the
gate with `curl`, so it's better coming from you: publish the item straight from its document,
skipping the workflow, and the instance **still advances** — the workflow follows what is true,
not how it was made true.

**If stuck** — An empty Workflows tab after deploy is the tag or the definition name, not the
plugin. `autoStart` is fresh-only: create a _new_ item. Then `checkpoints/2-4.md`.

**Going deeper** — `workflows/README.md` ·
`skills/sanity-workshop-workflows-engine/references/enforcement.md`

**Workflows coordinate handoffs between people and agents. Functions execute the machine steps.
Stages are for actors; steps are for code.** The two runtime Functions the engine can use are
optional — everything here works with editors driving. 0.31.0, pre-1.0, not for production.
Nobody publishes an allergen claim without sign-off; that's why this use case.
