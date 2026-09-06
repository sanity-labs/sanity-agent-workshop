# Adding the Knowledge Base as a second source

Mission 1-3. Two MCP clients, one flat tool list, and (usually) one token.

## Env

```sh
# app/.env.local — the KB-mode MCP the attendee created in their own org (kb/README.md step 7)
SANITY_CONTEXT_KB_URL=https://api.sanity.io/v1/context/organizations/<orgId>/mcp/<kbEndpointName>
SANITY_CONTEXT_KB_TOKEN=            # empty: same org, so SANITY_ORGANIZATION_TOKEN serves both
```

`SANITY_CONTEXT_KB_TOKEN` is only set on the **shared backup KB**, which lives in the
facilitator's organization and therefore needs a Context Viewer token for that org. The bearer
for the KB client is `process.env.SANITY_CONTEXT_KB_TOKEN ?? process.env.SANITY_ORGANIZATION_TOKEN`.
The wrong org's token at the KB endpoint fails with a `403` naming the Knowledge Base.

## The pattern

```ts
const [groqMcp, kbMcp] = await Promise.all([
  createMCPClient({
    transport: {
      type: 'http',
      url: process.env.SANITY_CONTEXT_MCP_URL!,
      headers: {Authorization: `Bearer ${process.env.SANITY_ORGANIZATION_TOKEN}`},
    },
  }),
  createMCPClient({
    transport: {
      type: 'http',
      url: process.env.SANITY_CONTEXT_KB_URL!,
      headers: {
        Authorization: `Bearer ${process.env.SANITY_CONTEXT_KB_TOKEN ?? process.env.SANITY_ORGANIZATION_TOKEN}`,
      },
    },
  }),
])

// Both endpoints serve `initial_context`. A naive spread lets one overwrite the other.
const {initial_context: _a, ...groqTools} = await groqMcp.tools()
const {initial_context: _b, ...kbTools} = await kbMcp.tools()

const tools = {
  ...groqTools, // groq_query, schema_explorer, array_field_reader
  ...kbTools, // knowledge_base_read
}

// … streamText({tools, …, onFinish: () => Promise.all([groqMcp.close(), kbMcp.close()])})
```

Fetch initial context from **both** endpoints for the system prompt if you dropped the tools:
the GROQ one is the schema overview; the KB one is the **outline** — the tree of entry paths the
agent reads from. The outline is small enough to hold for a whole conversation and it is how the
agent knows which paths to pass to `knowledge_base_read`.

## What a KB lookup looks like in the trace

```
▸ knowledge_base_read
{"knowledgeBase": "kb…", "paths": ["menu/thai-crunch-bowl/allergens", "policies/cross-contact"]}
```

One call, several paths, entries back as Markdown with citations to the original sources. For
the gluten-free question this is the whole retrieval — compare with the several `groq_query`
calls it took in Mission 1-2.

## Why one lookup

The build already read the recipe, the ingredient tags, the tortilla spec sheet, the
substitution policy, and the operations manual, noticed they disagree about the gluten-free wrap
swap, and wrote an entry that states the current policy and marks the manual's claim as
superseded. The agent reads that entry. The reconciliation happened once.

## What the KB cannot do

Count, filter, compare, or sort. "How many vegan options?" through a KB is a category error, not
an upgrade — keep it on GROQ. Prices through a KB are a snapshot risk. "What's on the menu?" is an
exhaustive list; poor fit. These belong in the routing table (Mission 1-4).

## References

- Knowledge Bases: https://www.sanity.io/docs/ai/sanity-context-knowledge-bases
- Context MCP tools (KB mode): https://www.sanity.io/docs/ai/sanity-context-mcp-tools
- Retrieval modes: https://www.sanity.io/docs/ai/sanity-context-retrieval-modes
- The KB recipe (and the shared backup): `kb/README.md` in this repo
