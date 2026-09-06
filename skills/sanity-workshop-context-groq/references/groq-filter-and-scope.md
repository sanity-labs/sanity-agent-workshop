# `groqFilter` — scope is server-enforced, not prompt-negotiated

Mission 1-6. The attendee sets the filter on the MCP in the Context app; nothing changes in the
repo. Your job is to test it and report.

## What to set

On the MCP, `groqFilter`:

```groq
status == "published"
```

A filter expression, not a query — the part inside `[...]`. It applies server-side to every
`groq_query` the agent runs, combined with the agent's own predicates. The agent cannot widen it
from the conversation; a `?groqFilter=` URL parameter only narrows it further (they combine with
`&&`).

## What to test

1. Try to surface the unlaunched item: "Tell me about the Winter Miso Bowl." "What's launching
   in December?" "List every vegan bowl including ones not on the menu yet."
2. Re-ask "How many vegan options do you have?"

**Done when it returns nothing** for the Winter Miso Bowl — not a polite refusal, an empty
result, because the document is unreachable — and the vegan count is **7**, not 8, even when the
agent's own query forgets `status`.

Before the filter, the agent's query decided what leaked. After, the server does. That is the
difference between retrieval and governance, and it is worth saying out loud: GROQ is not an
access-control feature; `groqFilter` on a private dataset is.

## Why the dataset is private

Bootstrap made it private. A public dataset can be read around the filter by anyone with the
project id, so the filter would be a suggestion. On a private dataset, API access is gated on a
token the client never sees, and the filter is enforced today. Compare with Track 2's Workflows
engine, whose guards are designed as an enforcement point but not yet enforced by the Content
Lake — three mechanisms, three different guarantees.

## Perspective

Dataset reads default to the `published` perspective. Anyone who can connect can pass
`?perspective=drafts`, so the private dataset and the org token are the boundary, not the
perspective. Don't attach a dataset whose drafts are sensitive.

## Pairs with Mission 1-5

Two halves of one idea: what the agent _can see_ is server-enforced (this mission); what it
_knows about this guest_ is server-derived (1-5). Never the client, either way.

## References

- Content access and security: https://www.sanity.io/docs/ai/sanity-context-security
- Context MCP reference (filtering): https://www.sanity.io/docs/ai/sanity-context-mcp
