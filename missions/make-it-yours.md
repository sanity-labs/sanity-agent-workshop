# Make it yours

The missions are a guide and a starting point, not a curriculum to complete. If you came to build
on your own content, this is the page for you.

## Point the agent at your own dataset

That's the whole change, and it looks bigger than it is:

1. In the Context app, create an MCP whose source is **your** project + dataset.
2. Swap `SANITY_CONTEXT_MCP_URL` in `app/.env.local`.
3. `cd studio && npx sanity schema deploy` from _your_ Studio if you haven't (GROQ mode needs a
   deployed schema).

The route in `app/app/api/agent/route.ts` doesn't care what schema is behind the endpoint; the
agent reads it from initial context. The menu page and `pnpm verify` are Green & Gather-specific
and won't mean anything against your data — that's expected.

## What the seed's answers depend on

So nobody wonders why their numbers differ. The seed is built so the questions fight back:

- Heat and heft live **only in `body` prose.** No `spicy` field, no `heaviness` field. That is
  what makes Mission 1-2's semantic question a semantic question.
- `vegan` is **hand-set** in `dietaryFlags`, never derived from the recipe. That keeps Mission
  1-1's flagship question a clean filter.
- `menuItem.allergens` is what the menu **declares**; `ingredient.allergenTags` is the real
  picture, one hop away. They disagree on four items on purpose. That gap is why the gluten-free
  question takes several calls (1-2), why the KB pays off (1-3), and why the Function needs the
  recipe as context (2-2, 2-3).

If your content doesn't have an equivalent to one of these, the corresponding mission won't have
its "aha" — it'll still work, it just won't teach the same thing.

## Which missions transfer as-is

| Transfers to any content                                                             | Assumes the planted cases                                                                      |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| **1-1** point an agent at your content                                               | **1-3** add a KB — needs a KB built from _your_ sources; `kb/README.md` is the recipe to adapt |
| **1-2** see every way it can search — if you have prose fields and enable embeddings | **1-4** routing — needs two sources that plausibly overlap                                     |
| **1-6** draw the boundary — any `status`-like field works                            | **1-5** personalize — needs a "guest profile" system of your own to stand in for `loyalty.ts`  |
| **2-1** run code on change — any document type                                       | **2-3** the stop condition — needs a contradiction in _your_ data to halt on                   |
| **2-2** add an AI step — any field the AI can draft from other fields                |                                                                                                |
| **2-4** the human gate — any document type; change `docType` in the plugin mapping   |                                                                                                |

## `pnpm verify` will fail against your own data — and that's correct

It asserts the Green & Gather seed's specific answers (seven vegan items, one bowl under $12 in
Austin, and so on). Against your content it is meaningless. Ignore it, or delete
`studio/scripts/verify.ts` and the `verify` scripts once you've moved on from the seed.

## Adapting a prompt

Every mission prompt names its own assumptions inline: which question, which document id, which
field. Change those and keep everything else — especially the two constraint lines (_run it
against the app, not your own tools_; _do not change any code, just report_). The constraint is
what makes you look.

## Where to get help in the room

The people who made these products are here. A coloured sticky on your laptop lid means stuck.
"What broke" counts as a demo.
