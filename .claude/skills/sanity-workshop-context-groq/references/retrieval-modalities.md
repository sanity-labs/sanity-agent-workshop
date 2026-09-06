# Retrieval modalities — one endpoint, several ways to search

Mission 1-2's lesson: a GROQ-mode endpoint serves one query tool, and the agent composes the
retrieval strategy per question inside it. Three modalities compose inside GROQ; path search
over a built index is the fourth and lives in Knowledge Base mode (Mission 1-3).

## What to recognise in the GROQ

| Modality                   | Looks like                                                                                          | Answers                                                                                         |
| -------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Exact filter (+ count)** | `*[_type == "menuItem" && status == "published" && "vegan" in dietaryFlags]`, `count(...)`          | "How many vegan options?" → **7**. Computed over a set. A Knowledge Base cannot do this at all. |
| **Keyword ranking**        | `score([title, body] match text::query("…"))`                                                       | Proper nouns, exact terms. BM25-ranked; no stemming, no fuzziness.                              |
| **Semantic ranking**       | `score(text::semanticSimilarity("something filling that isn't spicy"))`, then `order(_score desc)`  | Meaning, not characters. The only thing that can rank on prose when no field exists.            |
| **Multi-hop traversal**    | Several `groq_query` calls: items → `recipe->ingredients[]->allergenTags` → `crossContactStatement` | "Can I get something gluten-free?" Works. Costs a call per hop, every time.                     |

The three GROQ modalities combine in one `score()`; `boost()` rebalances keyword against
semantic when short-field keyword hits outweigh long-field meaning.

## Why the semantic question is built the way it is

There is no `spicy` field and no `heaviness` field. The Thai Crunch Bowl's `body` says _"a low,
sweet chili warmth… rather than sharp heat"_ — zero word overlap with "spicy". A filter has no
field to test; keyword search misses entirely. Embeddings match on concepts, which is why the
bowl still sinks in the ranking. **This is why adding a `spicy` boolean destroys the mission.**

Bootstrap enabled Dataset Embeddings with a type-specific projection: `body` is embedded as
`dish_description` on menu items, `preparation` on recipes and ingredients, `policy_text` on the
policy types. Field names are semantic context for the embedding. `location` and `supplier` are
deliberately not embedded.

## The `_embeddings` block

A query that uses `text::semanticSimilarity()` returns, on each result, `_score` and an
`_embeddings` array: `fragments` (the text that matched), `fields` (where it came from), and
character positions. For the spicy question, expect a fragment from `dish_description`
containing something like _"chili warmth"_. Show it to the attendee — it turns "it ranked
semantically" from an inference into something visible.

## Why the third question is the hinge

"Can I get something gluten-free?" resolves correctly. Count the calls. That count is the cost
of reconciling several sources at query time, and it recurs for every guest who asks. A
Knowledge Base does that reconciliation once, at build time — Mission 1-3. If the question
resolves in **one** call, allergen data has been denormalised onto `menuItem`; run `pnpm verify`.

## Prerequisite checks

```sh
cd studio && npx sanity datasets embeddings status production   # must say ready
```

`updating` returns incomplete rankings silently. `error` needs a re-enable. Never-enabled errors
loudly on `text::semanticSimilarity()`.

## References

- Dataset Embeddings: https://www.sanity.io/docs/content-lake/dataset-embeddings
- Context retrieval modes: https://www.sanity.io/docs/ai/sanity-context-retrieval-modes
- Context MCP tools: https://www.sanity.io/docs/ai/sanity-context-mcp-tools
