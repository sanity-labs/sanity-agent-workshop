# Green & Gather seed data

`green-and-gather.ndjson` — 83 documents, self-contained. This file is the portable
artifact: it has no dependency on this repo, this Studio config, or any script here.
Copy the single `.ndjson` into any project that has the matching schema and import it.

## Import

```bash
# into the dataset named in sanity.cli.ts
npx sanity dataset import green-and-gather.ndjson production

# replacing whatever is already there
npx sanity dataset import green-and-gather.ndjson production --replace

# into a different project entirely (e.g. the starter repo)
npx sanity dataset import green-and-gather.ndjson production \
  --project <projectId> --dataset <dataset>
```

There are no image or file assets, so the import needs no network fetches and
finishes in a few seconds.

## What's in it

| Type                    | Count |
| ----------------------- | ----- |
| `menuItem`              | 20    |
| `ingredient`            | 24    |
| `recipe`                | 14    |
| `faq`                   | 8     |
| `location`              | 6     |
| `supplier`              | 5     |
| `prepStandard`          | 3     |
| `allergenPolicy`        | 1     |
| `crossContactStatement` | 1     |
| `substitutionPolicy`    | 1     |

## Document IDs

Every `_id` follows `gg.<type>.<slug>` — `gg.menuItem.thai-crunch-bowl`,
`gg.ingredient.tamarind-lime-sauce`. One convention, so the seed stays greppable and
re-importable, and so references resolve without a lookup pass.

This is a deliberate departure from the usual Sanity guidance to let the API generate
`_id`s. Fixture data that ships as a file has to carry its own reference graph, and
re-running the import must update documents rather than duplicate them. Content created
by editors in the Studio still gets generated IDs as normal.

## The seed is load-bearing — don't casually edit it

The numbers below are not decoration. Each one exists so a specific workshop question
has a non-trivial answer, and changing an item's price, calories, flags, or locations
can quietly break one.

- **"Vegan bowls under $12 in Austin"** → 4 vegan bowls; 2 under $12; Charred Broccoli
  & Farro is deliberately absent from Austin, so the location filter does real work.
  The answer is exactly one item: **Harissa Chickpea Bowl**.
- **"How many vegan options?"** → **7**, spread across bowls, wraps, salads and sides.
  Counting bowls alone gives 4 and is wrong.
- **"Under 600 calories with no sesame"** → 6 items under 600 cal, **3 of which contain
  sesame**, so the exclusion is not a no-op. The answer is Citrus Fennel Salad, House
  Pickles, Cheese Quesadilla.
- **"Something filling that isn't spicy"** → heat and heft appear **only** in `body`
  prose. There is no `spicy` field and no `heaviness` field, by design. Adding either
  turns a semantic question into a filter and the exercise stops teaching anything.

`dietaryFlags.vegan` is hand-set on every item and is never derived from the recipe.
`menuItem.allergens` is what the menu _declares_; `ingredient.allergenTags` is the real
per-ingredient picture. They deliberately disagree on four items:

| Item                          | Declared    | Recipe traversal also reveals |
| ----------------------------- | ----------- | ----------------------------- |
| Harissa Chickpea Bowl         | —           | sesame                        |
| Miso Ginger Grain Bowl        | soy, sesame | wheat (wheat-koji miso)       |
| Charred Broccoli & Farro Bowl | wheat       | sesame                        |
| Buffalo Cauliflower Wrap      | wheat, milk | soy, egg                      |

## The six planted cases

1. **Peanut conflict** — `gg.menuItem.thai-crunch-bowl` declares `soy, wheat, sesame`.
   Traversing recipe → ingredients → supplier finds no peanut _either_. The peanut
   exposure exists only in the Sunfield Foods spec sheet (not in this seed — it is one
   of the three uploaded KB files). `gg.faq.thai-crunch-peanut` states outright that the
   bowl is peanut-free. GROQ answers confidently, and wrongly, in the dangerous direction.
2. **Substitution conflict** — `gg.substitutionPolicy.current` refuses the gluten-free
   wrap swap and names the March 2025 operations manual it reverses. The manual PDF says
   the swap is permitted.
3. **Discontinued seasonal** — `gg.menuItem.summer-peach-bowl`, `status: deprecated`,
   `availableUntil: 2026-08-31`. The legacy site still lists it as current.
4. **Missing data** — `gg.menuItem.autumn-squash-bowl` has a fully populated recipe and
   **no `calories` field at all**. The absence is the answer; it must not be summed from
   ingredients.
5. **A real gap** — no `location` in Toronto, and no mention of Canada anywhere in the
   seed. The honest answer is an empty result set.
6. **Unlaunched item** — `gg.menuItem.winter-miso-bowl`, `status: internal`,
   `availableFrom: 2026-12-01`. It is also flagged **vegan**, so a vegan query that
   forgets to filter on `status` returns 8 items instead of 7 and leaks an unlaunched
   product. That is the point. Its recipe, `gg.recipe.winter-miso`, is `internal` too:
   its body says the dish is held for launch, and the second test run showed a Knowledge
   Base built from this seed leaking the bowl through the published recipe while the menu
   item was correctly excluded. A boundary has to cover every document that describes the
   thing, not just the one named after it.

## Regenerating

The file is hand-maintainable — it is one JSON object per line. If you change it, re-run
the constraint checks rather than trusting a read-through; the four filter questions above
are easy to break by accident.
