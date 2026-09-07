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
can read the run's history to see what happened, in what order. Then, composed: a new item's copy
and callout arrive from the **Function**, and the gate holds that AI draft until a person reads it.

## Then compose it — the Function drafts, the human holds

So far the gate held copy you typed. The point of the track is that it holds work the machine
drafted, and nothing in the definition has to change for that. Two facts do the work: the deployed
Function fires on **publish**, and the guard holds Publish only during **review**. So a new item is
published once, bare, while still in `drafting` — that is the event. The Function drafts the copy
and callout into the document's draft. The review gate is what stands between that AI draft and
the live menu.

**1. Deploy your Mission 2-3 handler.** Bootstrap deployed the 2-1 stub, and a Studio publish runs
the stub until you redeploy:

```sh
pnpm --filter @starter/functions deploy               # builds, then `sanity blueprints deploy` (~1–2 min)
npx sanity functions logs draft-menu-copy --watch     # spare terminal, before you publish
```

Skipped 2-2 and 2-3? Do this with the stub anyway: you'll see its log line on publish and type
the copy yourself. The gate is identical.

**2. Click through again, with the Function in the loop:**

1. **Create a new menu item.** Fill the required fields and link a **recipe** — the Herb Falafel
   Wrap's for a clean run, the Harissa Chickpea Bowl's to watch the stop condition. Leave Base
   copy and Allergen callout empty. The strip reads **Drafting**.
2. **Publish it.** Publish is allowed in `drafting`; this is the event. Within a few seconds the
   watcher prints the invocation and the document gains **pending changes**: Base copy, three
   market variants, and the callout, drafted from the recipe rather than by you. With the Harissa
   recipe: no copy, a warning naming sesame, the held flag — exactly the item a person should see.
3. **Submit for food-safety review.** The strip moves to **Food-safety review** and Publish is
   **disabled**, tooltip naming the workflow. The AI draft is now held.
4. **Read the callout as the reviewer.** Does it name every allergen the recipe reveals? Does it
   end with the cross-contact statement, verbatim? This read is the review the whole track exists
   to put a person in front of.
5. **Approve.** Publish re-enables. Publish the draft; the copy goes live.
6. **Read the history.** Start, submit, the transition, approve, the transition — the human side.
   The Function's work is in the log and the draft, not the history: coordination and execution,
   recorded in two places on purpose.

For those few seconds between steps 2 and 5 the bare item is on the menu with no copy. In
production you'd create it as `status: internal` and flip it at approval — Track 1's boundary,
reused. Leave that out here unless your 2-3 handler already uses `status` as its halt flag.

**Stretch — a gate on edits, not only new items.** `autoStart` is fresh-only. Holding _changes_ to
an existing item's callout or description for review means a Document Function watching those
paths (`delta::changedAny`) and starting an instance through the engine — the same primitives,
wired from code, with the reviewer assignable to anyone including yourself so the process can't
deadlock. Real work, and out of scope for the room; the definition itself doesn't change.

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
