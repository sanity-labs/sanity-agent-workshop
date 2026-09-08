# Mission 1-2 · See every way it can search

_Your Knowledge Base from the end of 1-1 is building while you do this._

**Goal** — Watch one endpoint answer three questions three different ways, count what the hard
one costs — then fix the one it gets wrong, without touching code.

**Prompt** — copy this:

```
I'm on Mission 1-2 of the Sanity agent workshop (missions/1-2-see-every-way-it-can-search.md).
Load the sanity-workshop-context-groq skill.

With pnpm dev running, ask my agent these three questions one at a time, each in a fresh
conversation, by sending them to the running app's /api/agent route. After each, show me the
exact tool calls and the GROQ it generated:
  1. "How many vegan options do you have?"
  2. "Something filling that isn't spicy"
  3. "Can I get something gluten-free?"
For each, tell me which retrieval modality did the work: exact filtering, keyword ranking
(text::query), semantic similarity (text::semanticSimilarity), or several in sequence. For
question 2, show me the _embeddings fragment that made the match — or, if nothing semantic ran,
say so plainly and show me what the agent did instead. For question 3, tell me how many
groq_query calls it took and what each one fetched.
Run this against the app at localhost:3000 — not through your own Sanity tools.
Do not change any code. Just report.
```

**Done when** — You can point at the GROQ behind each answer and name the modality it used, you
can say how many `groq_query` calls the third question took — and, after the second half below,
question 2 fires `text::semanticSimilarity()` where it didn't before.

| Ask                                  | What should fire                                                                      | Why it's here                                                                                                                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "How many vegan options?"            | Exact filter + `count()`. Answer **7**.                                               | The one shape a Knowledge Base cannot do at all. Counting bowls alone gives 4 and is wrong. Forgetting `status` gives 8.                                                                            |
| "Something filling that isn't spicy" | `score(text::semanticSimilarity(…))` — **expect it _not_ to fire on a bare endpoint** | Heat and heft exist **only in `body` prose.** No field to filter; keyword search has zero word overlap with "chili warmth". A bare endpoint finds `calories` instead. That miss is the second half. |
| "Can I get something gluten-free?"   | Several calls: items → recipe → ingredient tags → cross-contact statement             | **Not a staged failure. It works.** Count the calls. That count is the cost, and it recurs for every guest who asks.                                                                                |

## Second half — fix the miss in the Context app, not in code

On a bare endpoint, question 2 does not go semantic. In both test runs the agent found the
`calories` field, used `calories >= 640` as a proxy for "filling", pulled every published item's
`body` into context, and judged "isn't spicy" by reading the prose itself. The answer was
defensible — it steered away from the Chili Crisp Crunch Bowl and described the Thai Crunch Bowl's
"low, sweet chili warmth" correctly. The mechanism was wrong: the model did the ranking the index
was built to do. Embeddings are `ready`; this is query construction, not a broken index.

The lever is the MCP's **Instructions** field. It is injected into the agent's tool guidance, and
it should hold only what the schema doesn't make obvious.

1. In the Context app, open your MCP (Dashboard → Apps → Context → your MCP) and paste the block
   below into **Instructions**. Save.
2. Re-ask question 2 with this prompt:

```
I'm still on Mission 1-2 (missions/1-2-see-every-way-it-can-search.md). I have added instructions
to the MCP in the Context app. In a fresh conversation, send "Something filling that isn't spicy"
to the running app's /api/agent route again and show me the exact GROQ. Tell me whether
text::semanticSimilarity() fired this time, show me the _embeddings fragment that made the match,
and put the tool calls side by side with the run before.
Run this against the app at localhost:3000 — not through your own Sanity tools.
Do not change any code. Just report.
```

The instructions to paste:

```markdown
### Rules

- Always filter `status == "published"` unless the user is staff. `internal` items are
  unlaunched; `deprecated` items are off the menu whatever an external source says.
- Never derive, estimate, or sum `calories`. An absent value is a fact — say it is not listed.

### Schema notes

- Heat ("spicy") and heft ("filling") exist only in `body` prose. Use
  `text::semanticSimilarity()` inside `score()` for those; there is no field to filter.
- `menuItem.allergens` is what the menu DECLARES. The full picture is
  `recipe->ingredients[]->allergenTags`. When asked about allergens, traverse the recipe.
```

Then ask the same question yourself in the chat at `localhost:3000`. Same dishes, and the trace
now shows a `_score` and the fragment that earned it.

Question 1 carries a softer version of the same lesson. The count was right — 7 — but on a bare
endpoint the agent fetched 8 and set the unlaunched Winter Miso Bowl aside in prose. The `status`
boundary lived in the model's judgment, not in retrieval. The first rule above nudges it; Mission
1-6 makes it structural with `groqFilter`.

**If stuck** — If the semantic ranking looks random, check embeddings first:
`cd studio && npx sanity datasets embeddings status production`. A status of `updating` returns
incomplete rankings with no error. If question 2 still doesn't go semantic after the instructions,
confirm the save landed (reload the MCP page) and use a fresh conversation. If question 3 resolves
in one call, your seed has allergen data denormalized onto the menu item: `pnpm verify`. Then
`checkpoints/1-2.md`.

**Going deeper** — `skills/sanity-workshop-context-groq/references/retrieval-modalities.md` ·
`skills/sanity-workshop-context-groq/references/instructions-field.md` (the full Green & Gather
shortlist) · the `dial-your-context` skill (the general method) ·
[Dataset Embeddings](https://www.sanity.io/docs/content-lake/dataset-embeddings) ·
[Context retrieval modes](https://www.sanity.io/docs/ai/sanity-context-retrieval-modes)

If the third answer wobbles later, it's the same lever. "Fix a bad answer" lives here, attached to
a real failure, rather than as its own mission.
