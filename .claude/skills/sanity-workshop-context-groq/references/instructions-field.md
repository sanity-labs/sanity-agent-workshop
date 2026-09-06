# The `instructions` field — pure deltas for Green & Gather

The MCP's `instructions` (set in the Context app, up to 10,000 characters) is injected into the
agent's tool guidance. It should contain **only what the schema doesn't make obvious**. The
`dial-your-context` skill is the full interactive method; this page is the Green & Gather
shortlist, for when Mission 1-2's third question wobbles or a later mission needs guidance.

## Deltas worth stating

```markdown
### Rules

- Always filter `status == "published"` unless the user is staff. `internal` items are
  unlaunched; `deprecated` items are off the menu whatever an external source says.
- Never derive, estimate, or sum `calories`. An absent value is a fact — say it is not listed.

### Schema notes

- `menuItem.allergens` is what the menu DECLARES. The full picture is
  `recipe->ingredients[]->allergenTags`. They disagree on some items by design; when asked
  about allergens, traverse the recipe.
- Heat ("spicy") and heft ("filling") exist only in `body` prose. Use
  `text::semanticSimilarity()` inside `score()` for those; there is no field to filter.
- `dietaryFlags` is authoritative and hand-set. Do not infer "vegan" from ingredients.
- Market scoping is `locations[]->market` with values `nyc`, `austin`, `chicago`.
- `priceCents` is integer cents.

### Query patterns

- Items in a market: `"austin" in locations[]->market`
- Allergen traversal: `*[_type == "menuItem" && _id == $id]{ "declared": allergens,
"traversed": array::unique(recipe->ingredients[]->allergenTags[]) }`

### Known limits

- Cross-contact and supplier statements are not in structured fields. Quote
  `crossContactStatement.verbatimStatement` exactly; never soften it.
```

## What not to put here

GROQ syntax (the tool guidance covers it), field lists (the schema covers them), tone and
refusals (the system prompt covers them). Each line should pass "would an agent with the schema
alone get this wrong?"

## How to test a change without saving it

`?instructions=<url-encoded text>` on the endpoint URL overrides the field for that request;
`?instructions=""` gives a blank slate. Use it to compare before committing the field in the app.
