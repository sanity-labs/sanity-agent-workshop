# Mission 2-4 · Put a human in front of it

**Goal** — Hold a menu item at review until a person signs off, with the Sanity Workflows engine.

**Prompt** — copy this:

```
I'm on Mission 2-4 of the Sanity agent workshop (missions/2-4-put-a-human-in-front-of-it.md).
Load the sanity-workshop-workflows-engine skill and read its references/define-and-deploy.md.

The Workflows Studio plugin is already registered in studio/sanity.config.ts with tag
"production" and an autoStart mapping from menuItem to a definition named "menu-item-review"
that does not exist yet. Do not edit sanity.config.ts.

Write studio/workflows/menu-item-review.ts with the define helpers from
@sanity/workflow-engine/define: stages drafting → review → approved, a required subject field
for the menu item, a "submit for food-safety review" action in drafting, an "approve" action in
review, and a guard on the review stage that holds publishing of the subject. Write
studio/sanity.workflow.ts with defineWorkflowConfig, name and tag "production",
expectedMinReaderModel 4, and workflowResource pointing at my project and dataset from
studio/.env. From the studio directory run the deploy with --check, then --dry-run and show me
the diff, then deploy for real with `pnpm exec sanity-workflows deploy --tag production`.

Then tell me exactly what to click in the Studio at localhost:3333 to create a new menu item,
submit it, see that Publish is held, approve it, and read the run's history. Do not add any
schema fields. Do not click through for me — I want to do that part.
```

**Done when** — A new menu item is **held at `review`**: Publish is disabled in the Studio with a
tooltip naming the workflow, and `approved` is unreachable until a human fires Approve — and you
can read the run's history to see what happened, in what order.

**The idea worth the whole mission** — An action writes its result into the instance's fields; a
transition watches those fields through a condition and fires when it holds. Nothing chooses to
move the instance, and nothing in a transition knows who wrote the field. People, agents, and
applications follow the same definition and write to the same record. That's why the same gate can
hold work the Function drafted in Mission 2-3 and work you typed.

**Say what's enforced before someone tests it with curl** — in the docs' words, _every check the
engine makes is advisory_ and _the Content Lake is the only enforcement point_. The publish hold is
honored by the engine and the Studio plugin; the Content Lake doesn't evaluate guard documents yet
during early access. So: publish the held item with a write token from a terminal and it lands, and
the instance doesn't move because it only watches its own fields. Track 1's `groqFilter` on a
private dataset is enforced today. Three mechanisms, three different guarantees.

**If stuck** — An empty Workflows view after deploy is the tag or the definition name, not the
plugin. `autoStart` is fresh-only: create a _new_ item. A greyed-out workflow in the strip has its
reason in the browser console under `[workflow-studio-plugin]`. Then `checkpoints/2-4.md`.

**Going deeper** — `workflows/README.md` ·
`skills/sanity-workshop-workflows-engine/references/enforcement.md` ·
[Workflows docs](https://www.sanity.io/docs/workflows/introduction) ·
[How early access works](https://www.sanity.io/docs/workflows/prerelease)

**Workflows coordinate handoffs between people and agents. Functions execute the machine steps.
Stages are for actors; steps are for code.** The engine is a library, not a service; a human
clicking Approve needs nothing but the Studio. Nobody publishes an allergen claim without
sign-off; that's why this use case.
