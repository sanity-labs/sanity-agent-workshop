# Mission 1-2 · See every way it can search

_Your Knowledge Base from the end of 1-1 is building while you do this._

**Goal** — Watch one endpoint answer three questions three different ways, and count what the
hard one costs.

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
question 2, show me the _embeddings fragment that made the match. For question 3, tell me how
many groq_query calls it took and what each one fetched.
Run this against the app at localhost:3000 — not through your own Sanity tools.
Do not change any code. Just report.
```

**Done when** — You can point at the GROQ behind each answer and name the modality it used, and
you can say how many `groq_query` calls the third question took.

| Ask                                  | What should fire                                                          | Why it's here                                                                                                               |
| ------------------------------------ | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| "How many vegan options?"            | Exact filter + `count()`. Answer **7**.                                   | The one shape a Knowledge Base cannot do at all. Counting bowls alone gives 4 and is wrong. Forgetting `status` gives 8.    |
| "Something filling that isn't spicy" | `score(text::semanticSimilarity(…))`                                      | Heat and heft exist **only in `body` prose.** No field to filter; keyword search has zero word overlap with "chili warmth". |
| "Can I get something gluten-free?"   | Several calls: items → recipe → ingredient tags → cross-contact statement | **Not a staged failure. It works.** Count the calls. That count is the cost, and it recurs for every guest who asks.        |

**If stuck** — If the semantic ranking looks random, check embeddings first:
`cd studio && npx sanity datasets embeddings status production`. A status of `updating` returns
incomplete rankings with no error. If question 3 resolves in one call, your seed has allergen data
denormalized onto the menu item: `pnpm verify`. Then `checkpoints/1-2.md`.

**Going deeper** — `skills/sanity-workshop-context-groq/references/retrieval-modalities.md` ·
[Dataset Embeddings](https://www.sanity.io/docs/content-lake/dataset-embeddings) ·
[Context retrieval modes](https://www.sanity.io/docs/ai/sanity-context-retrieval-modes)

If the third answer wobbles or is wrong, the fix is the endpoint's **instructions** field in the
Context app, not code — `references/instructions-field.md` has the Green & Gather deltas, and the
`dial-your-context` skill has the method. That's where "fix a bad answer" lives, attached to a
real failure rather than as its own mission.
