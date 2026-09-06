---
name: sanity-workshop-functions-agent-actions
description: Build the Green & Gather draft-menu-copy Sanity Function with Agent Actions inside the sanity-agent-workshop repo. Use ONLY for Track 2 Missions 2-1, 2-2, and 2-3 of that workshop: running functions/draft-menu-copy locally with sanity functions dev or test, reading the Function log, the sanity.blueprint.ts recursion guard, drafting description.base and allergenCallout with Agent Action Generate from the recipe's traversed allergens, adapting copy per market (description.nyc / austin / chicago) with Transform, chaining the steps, and the stop condition that keeps an item with an undeclared allergen from shipping. Load it when someone in this repo mentions the Function, the blueprint, the log line, Generate, Transform, the callout, market variants, or "doesn't ship". DO NOT load for the Workflows engine, defineWorkflow, sanity-workflows deploy, or the review gate (sanity-workshop-workflows-engine), for Track 1, or for Sanity Functions or Agent Actions work outside this workshop repo (Sanity docs, sanity-best-practices).
---

# Sanity Functions + Agent Actions — the draft-menu-copy pipeline

You are helping a workshop attendee turn a stubbed Sanity Function into an automated content
pipeline in the `sanity-agent-workshop` repo. This track **changes documents**; the Function log
is its tool-call inspector, the way "read the GROQ" is Track 1's. Read `AGENTS.md` first. The
attendee drives with a mission prompt; you type, they watch the log and the Studio.

## What this skill knows

| Mission | You help with                                                                         | The attendee observes                                                                                     |
| ------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 2-1     | Running the stub locally                                                              | A menu item is published; the log shows what the Function did                                             |
| 2-2     | An Agent Action **Generate** step that reads the recipe                               | `description.base` and `allergenCallout` drafted, reflecting allergens the declared array never mentioned |
| 2-3     | Chaining: Generate → patch → **Transform** per market → notify, plus a stop condition | Three market variants that differ; the callout unchanged; **and the bad item doesn't ship**               |

Mission 2-4 (the Workflows engine, a human gate) is `sanity-workshop-workflows-engine`.

## Where things are

| Path                                       | Role                                                                                                                                                                                           |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `functions/draft-menu-copy/index.ts`       | The stub. `documentEventHandler` that logs the item and its recipe ref and returns. Yours to fill.                                                                                             |
| `sanity.blueprint.ts` (repo root)          | Registers the Function: fires on `menuItem` create/update with filter `_type == "menuItem" && !defined(description.base)` and projection `{_id, _type, title, recipe}`. Deployed by bootstrap. |
| `functions/rolldown.config.ts`             | Bundles to `functions/dist/draft-menu-copy`. `pnpm --filter @starter/functions build`; `pnpm dev` runs it.                                                                                     |
| `studio/schemaTypes/documents/menuItem.ts` | The targets: `description: {base, nyc, austin, chicago}` and `allergenCallout: text`. All empty in the seed on purpose.                                                                        |
| `studio/seed/README.md`                    | The four items where `menuItem.allergens` disagrees with the recipe — 2-2's material and 2-3's failing case.                                                                                   |
| `pnpm seed:reset`                          | One command back to a known-good dataset when someone patches an item into nonsense.                                                                                                           |

## Product facts

- **Local first.** `sanity functions dev` (part of `pnpm dev`, port 8080) is a playground; `npx
sanity functions test draft-menu-copy --dataset production --with-user-token --document-id
<id>` runs the handler against a real document from the repo root and prints the log. No deploy
  wait. Deploying is `pnpm --filter @starter/functions deploy` and is optional in the room.
- **The handler receives `{context, event}`.** `event.data` is shaped by the blueprint's
  projection — here `{_id, _type, title, recipe}`. Anything else, query for inside the handler
  with `createClient({...context.clientOptions, apiVersion})`. Locally `clientOptions` has only
  `projectId` and `apiHost`; `--with-user-token` and `--dataset` supply the rest. `context.local`
  is `true` during local runs.
- **The recursion guard is already in place.** Mission 2-2 writes `description.base`, which emits
  another update event. The blueprint filter `!defined(description.base)` stops matching once the
  field exists, so the Function cannot loop on its own patch. `@sanity/client` 8 also sends a
  lineage header that caps recursive chains at 16.
- **Agent Actions need a schema id.** `cd studio && npx sanity schemas list` prints it (bootstrap
  deployed the schema). Pass it as `schemaId`; use `apiVersion: 'vX'`.
- **Agent Actions write to the draft by default.** With a published `documentId`, Generate and
  Transform edit the existing draft or create one from the published document. Add
  `forcePublishedWrite: true` to write the published document directly. Drafts are the safer
  default and they show up in the Studio as pending changes — which is what a food-safety reviewer
  wants to see, and what Mission 2-4's gate will hold.
- **Generate vs Transform.** Generate writes new content into `target` paths from an instruction
  and params. Transform rewrites what is there, per target, with per-target instructions. The
  market variants are Transform: same base copy, adapted for NYC (corporate) versus Austin and
  Chicago (franchised). Translate exists too; it is an optional stretch, not the core path, because
  a translation nobody in the room reads is a claim, not a demo.

## Mission 2-1 — run it

Confirm the plumbing before adding anything: build, run `sanity functions test` against
`gg.menuItem.harissa-chickpea-bowl`, show the log line. Then have the attendee publish a menu
item in the Studio (edit and publish; or create a new one) with `pnpm dev` running and point at
the emulator output. Done when they can see what the Function did. Commands in
[local-dev-and-logs.md](references/local-dev-and-logs.md).

## Mission 2-2 — the AI step, with the right context

Generate `description.base` and `allergenCallout` from the **linked recipe**, not from the item's
declared array. The callout must be drafted from `recipe->ingredients[]->allergenTags` and must
end with `crossContactStatement.verbatimStatement` reproduced exactly. Pull both in as `groq`
instruction params so the model is handed the facts rather than asked to know them. The API shape
and a worked instruction are in [agent-actions.md](references/agent-actions.md).

Test on the Harissa Chickpea Bowl: it declares no allergens, and its recipe reveals sesame. Done
when the drafted callout names sesame. _Say it out loud:_ the step is only as good as the context
you hand it — the same theme as Track 1, arriving from the write side.

## Mission 2-3 — chain it, and give it a stop condition

Sequence: compute the declared-vs-traversed delta → if clean, Generate → patch → Transform the
three market variants → notify. **If the delta is not empty, halt**: no copy, a loud log line or
notification, and a flag on the item. An unattended pipeline that only ever succeeds hasn't been
tested. Done when `description.nyc`, `.austin`, and `.chicago` are populated and differ,
`allergenCallout` is unchanged (one field, no market variants — a safety statement doesn't
localize), and the planted case doesn't get copy. Design, recursion cautions, and what "notify"
can mean without a Slack webhook are in
[chaining-and-stop-conditions.md](references/chaining-and-stop-conditions.md).

## Rules that protect the lesson

- **Never write the callout from `menuItem.allergens`.** Four seeded items disagree with their
  recipe by design; that gap is why the step needs context.
- **Never denormalize allergens onto `menuItem`** to "make the Function simpler". Track 1's
  multi-hop lesson depends on the gap staying.
- **`allergenCallout` stays a single `text` field.** Don't make it per-market.
- **Never edit the seed** to make a case pass. `pnpm verify` after any schema change.
- **Guard against your own writes.** Any new field you write inside the filter's scope needs the
  same `!defined(...)` treatment, or a `context.local` / status check, or you will loop.

## When it doesn't work

| Symptom                                         | First suspect                                                                                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `functions test` says no such function          | Not built: `pnpm --filter @starter/functions build`. Directory name must match the blueprint `name`.                                        |
| Handler runs but nothing changes in Studio      | Agent Actions wrote a **draft**. Open the document; the changes are pending. Or `noWrite` is on.                                            |
| `schemaId` errors                               | `cd studio && npx sanity schemas list`. Bootstrap deployed it; if empty, `npx sanity schema deploy`.                                        |
| Function fires again after its own patch        | The write didn't set `description.base`, or you wrote a new field outside the guard.                                                        |
| Transform returns three near-identical variants | Prompt-side: name the market difference (NYC corporate voice vs franchised local voice, local references, what each market's guests order). |
| Callout paraphrases the cross-contact statement | Pass it as a `groq` param and instruct "end with $crossContact verbatim, unchanged".                                                        |
| Counts wrong on Track 1 after this              | `pnpm seed:reset`.                                                                                                                          |
