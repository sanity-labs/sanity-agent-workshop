# Routing — you are the router

Mission 1-4. From the Sanity docs (Sanity Context patterns → multi-backend agents): every backend
exposes its tools into one flat list; the model picks by name and description; there is no layer
underneath that routes. Sanity Context's tools are generic on purpose, so two plausible sources
route inconsistently until you supply the domain framing they lack.

## Decide ownership first

Write this table down before touching the prompt. It is what everything else encodes.

| Question shape                                                                                                                        | Source of truth                          | Tool                                 |
| ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------ |
| Menu facts computed over a set: what's vegan, under $12, in Austin, how many, calories, availability dates                            | Sanity dataset                           | `groq_query` (re-described)          |
| What the brand is willing to guarantee: allergen safety, cross-contact, substitutions, policy, supplier statements, "is it safe for…" | Knowledge Base                           | `knowledge_base_read` (re-described) |
| Live state right now: sold out, open/closed                                                                                           | The shop system (`app/lib/shop.ts` stub) | not an MCP; the route can call it    |
| Who is asking                                                                                                                         | Loyalty CRM (`app/lib/loyalty.ts` stub)  | injected server-side (Mission 1-5)   |

The rule of thumb from the docs: the dataset owns "what is this thing and how do we describe
it"; the KB owns reconciled facts stated across sources; operational systems own "what is its
live state right now".

## The four levers, cheapest first

**1. A routing table in the system prompt.** Highest leverage; do it first.

```text
Pick the source by the kind of question, not the topic:
- Menu facts computed over a set — which items, how many, prices, calories, markets, dates —
  use the menu content tools (GROQ). Filtering on declared allergens ("anything with no
  sesame?") is a menu fact.
- Anything about safety, guarantees, cross-contact, substitutions, or policy — "is it safe
  for my allergy?", "is the fryer shared?", "can you make it gluten-free?" — use the
  allergen & food-safety knowledge base. Never answer these from menu fields.
- If a guest has an allergy on file, every recommendation also needs a knowledge-base check.
- Live availability (sold out, hours) is neither; say you will check with the store.
```

**2. Re-describe the generic tools.** `mcp.tools()` is a plain object; keys and descriptions are
data. Fewer, more distinct tools route better than many overlapping ones.

```ts
const tools = {
  query_menu: {
    ...groqTools.groq_query,
    description:
      'Query the Green & Gather MENU dataset with GROQ: menu items, prices, calories, dietary flags, ' +
      'declared allergens, recipes, ingredients, locations, markets. Use for anything computed ' +
      'over a set — which items, how many, under a price, in a market. NOT for allergen safety, ' +
      'cross-contact, substitutions, or policy; those come from the knowledge base.',
  },
  explore_menu_schema: groqTools.schema_explorer,
  read_food_safety_kb: {
    ...kbTools.knowledge_base_read,
    description:
      'Read reconciled entries from the Green & Gather allergen & food-safety knowledge base: ' +
      'supplier spec sheets, cross-contact statement, substitution policy, prep standards, and ' +
      'per-item allergen concerns with citations. Use for "is it safe", "peanut-free", "shared ' +
      'fryer", "gluten-free swap", and any policy question. NOT for counts, prices, or listings.',
  },
}
```

**3. Make boundaries structural.** The GROQ endpoint's `instructions` field can say "cross-contact
and supplier statements are not stored here", so a misroute returns nothing and the model
self-corrects. Structural scoping fails safe; prose doesn't.

**4. Pre-classification or sub-agents.** A cheap first call decides "menu" vs "safety" and
exposes only that source's tools. Real, but not for a 90-minute room.

## The test

Ask each of these three times, fresh conversation each time, and watch the trace:

| Question                               | Should go to                                         |
| -------------------------------------- | ---------------------------------------------------- |
| "Anything with no sesame?"             | `query_menu` — a set operation over `allergens`      |
| "Is it safe for my sesame allergy?"    | `read_food_safety_kb` — a statement about guarantees |
| "How many vegan options do you have?"  | `query_menu` — a KB cannot count                     |
| "Is the Thai Crunch Bowl peanut-free?" | `read_food_safety_kb`                                |

Done when the pair lands on different sources consistently. Cross-system answers are a feature:
"what vegan bowls can I safely eat with a sesame allergy in Austin?" should hit the menu first for
candidates, then the KB for each candidate's sesame concern. Guide that ordering in the prompt.

## The connection to Mission 1-5

Routing by question type here; routing by _who is asking_ there. A saved peanut allergy turns a
catalog question into a catalog question plus a mandatory KB check. Same skill, second axis.
