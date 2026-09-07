# Mission 2-2 · Add an AI step

**Goal** — Make the Function do real, schema-aware content work — and see that the work is only
as good as the context you hand it.

**Prompt** — copy this:

```
I'm on Mission 2-2 of the Sanity agent workshop (missions/2-2-add-an-ai-step.md). Load the
sanity-workshop-functions-agent-actions skill and read its references/agent-actions.md.

In functions/draft-menu-copy/index.ts, add an Agent Action Generate step that drafts two
fields on the menu item: description.base (guest-facing copy) and allergenCallout. The
callout must be drafted from the allergens actually present in the linked recipe's
ingredients — recipe->ingredients[]->allergenTags — NOT from the item's declared `allergens`
array, and it must end with the crossContactStatement's verbatimStatement reproduced exactly.
Pass those facts in as instructionParams (groq type) so the model is handed them, not asked to
know them. Target only those two fields. Get the schemaId from `cd studio && npx sanity
schemas list`. Leave the default draft-write behavior (do not set forcePublishedWrite).

Then run it locally with `sanity functions test` against gg.menuItem.harissa-chickpea-bowl,
with --with-user-token so it can write, and show me the log. Then tell me where to look in the
Studio to see the drafted fields, and quote both drafted values back to me. Do not touch the
schema and do not edit the seed. Do not deploy.
```

**Done when** — The menu item comes back with a drafted description and an allergen callout that
reflect what's actually in the recipe — including an allergen the declared array never mentioned.
On the Harissa Chickpea Bowl, the callout names **sesame**; the menu declares nothing.

**Before / after — where to look.** _Before:_ Studio → Menu items → Harissa Chickpea Bowl. Under
**Description**, **Base copy** is empty; **Allergen callout** is empty; there are no pending
changes. The run itself happens in the terminal, and the Studio announces nothing. _After:_ reopen
the same item. It now shows **pending changes** — a draft — with Base copy populated and Allergen
callout populated, naming **sesame**, ending with the cross-contact statement verbatim. The three
market fields are still empty; that's 2-3. Nothing is published: this is a draft a person can
still edit or discard. **The deployed Function is still the 2-1 stub** — a Studio publish drafts
nothing until you redeploy, which Mission 2-4 does on purpose.

_Say it out loud:_ drafting the callout means **reading the linked recipe**. The step is only as
good as the context you hand it. That single sentence connects this track to the theme — the same
lesson as Track 1, arriving from the write side instead of the read side.

**If stuck** — If nothing seems to change in the Studio, the action wrote a **draft**; open the
document and look for pending changes. If the callout paraphrases the cross-contact statement,
pass it as a param and say "unchanged, verbatim". Then `checkpoints/2-2.md`.

**Going deeper** — `skills/sanity-workshop-functions-agent-actions/references/agent-actions.md` ·
[Generate quick start](https://www.sanity.io/docs/agent-actions/generate-quickstart) ·
[Agent Actions patterns](https://www.sanity.io/docs/agent-actions/agent-action-cheatsheet)

Four seeded items disagree between `menuItem.allergens` and the recipe. That gap is the whole
reason the step needs context rather than just a prompt — and it is why you must never
"simplify" by denormalizing allergens onto the menu item.
