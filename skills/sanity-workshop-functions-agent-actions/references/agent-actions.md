# Agent Actions — Generate and Transform from inside a Function

Missions 2-2 and 2-3. API shapes from the Sanity docs (Generate quick start, Transform common
patterns, Agent Actions patterns), applied to `menuItem`.

## Setup inside the handler

```ts
import {createClient} from '@sanity/client'

const client = createClient({...context.clientOptions, apiVersion: 'vX'})
const schemaId = process.env.SANITY_SCHEMA_ID ?? '<from: cd studio && npx sanity schemas list>'
```

Agent Actions require the deployed schema's id. Read it once with the CLI and pass it via env
(`npx sanity functions env add draft-menu-copy SANITY_SCHEMA_ID <id>` for a deployed Function,
or a `.env` the local runner reads).

## Mission 2-2 — Generate the base copy and the callout

Hand the model the facts as params; don't ask it to know them. `type: 'groq'` params run a
query; `type: 'field'` reads a path on the document.

```ts
await client.agent.action.generate({
  schemaId,
  documentId: event.data._id, // edits the draft; add forcePublishedWrite: true to write published
  instruction: `
    Write guest-facing menu copy for the dish $title.
    The dish's own menu description is $body. Use the recipe's ingredients ($ingredients)
    for concrete detail. Warm, concise, no superlatives, no health claims.

    Then write the allergen callout. List every allergen present in the recipe's ingredients
    ($traversedAllergens) as "Contains: …" — this list comes from the ingredients, not from
    the menu's declared list, and may include allergens the menu omitted. Never say "free of"
    or "safe for". End the callout with this sentence exactly, unchanged: $crossContact
  `,
  instructionParams: {
    title: {type: 'field', path: 'title'},
    body: {type: 'field', path: 'body'},
    ingredients: {
      type: 'groq',
      query: `*[_id == $id][0].recipe->ingredients[]->{title, allergenTags}`,
      params: {id: event.data._id},
    },
    traversedAllergens: {
      type: 'groq',
      query: `array::unique(*[_id == $id][0].recipe->ingredients[]->allergenTags[])`,
      params: {id: event.data._id},
    },
    crossContact: {
      type: 'groq',
      query: `*[_type == "crossContactStatement"][0].verbatimStatement`,
    },
  },
  target: [{path: ['description', 'base']}, {path: ['allergenCallout']}],
})
```

Notes:

- `target` restricts what the action may write. Two targets here; nothing else on the document
  can change.
- `noWrite: true` returns the would-be document without writing — useful to preview in the
  emulator before letting it write. It cannot be combined with `async`.
- Agent Actions skip fields marked `hidden` or `readOnly`, which is a schema-level way to keep a
  field away from the AI if you ever need one.

## Mission 2-3 — Transform the three market variants

Transform rewrites existing content per target, with a per-target instruction. **It is
path-for-path:** each target path is transformed in place, so it cannot read `description.base`
into `description.nyc`. Run against empty market fields it returns success and writes nothing.
So the chain has a patch between Generate and Transform: copy the base copy into the three market
fields first, then Transform rewrites each in place.

```ts
// Generate wrote the DRAFT. Read it by id — `*[_id == "drafts.…"]` returns nothing under the
// client's default published perspective; getDocument ignores perspective.
const draft = await client.getDocument(`drafts.${event.data._id}`)
const base = draft?.description?.base
await client
  .patch(`drafts.${event.data._id}`)
  .set({'description.nyc': base, 'description.austin': base, 'description.chicago': base})
  .commit()

await client.agent.action.transform({
  schemaId,
  documentId: event.data._id,
  instruction:
    'Adapt $base for the named market. Keep the dish facts identical; change voice and local references only.',
  instructionParams: {
    base: {type: 'field', path: 'description.base'},
  },
  target: [
    {
      path: ['description', 'nyc'],
      instruction:
        'NYC is corporate-owned. Polished brand voice, sharper and shorter, city pace. Mention the Flatiron, Midtown, or Williamsburg store only if natural.',
    },
    {
      path: ['description', 'austin'],
      instruction:
        'Austin is franchised. Relaxed, local-owner voice, a little warmth and humor, weekend-brunch energy.',
    },
    {
      path: ['description', 'chicago'],
      instruction:
        'Chicago is franchised. Straightforward, hearty, neighborhood-spot voice; winter-friendly framing is fine.',
    },
  ],
})
```

Notes:

- **`allergenCallout` is not a target.** The cross-contact statement must be reproduced verbatim,
  so there is nothing to vary. Marketing copy localizes; a safety statement doesn't. That
  asymmetry is the governance beat of the track.
- If the three variants come back near-identical, the fix is prompt-side: the per-target
  instructions have to name what differs (ownership model, voice, local references).
- Translate (`client.agent.action.translate`) is the optional stretch: point it at a language
  someone in the room reads, into a _new_ target document, never into the market fields.

## Draft vs published

Both actions edit the draft by default. The published document — and therefore the menu page,
which reads the `published` perspective — is unchanged until someone publishes the draft. For
Track 2's story that is the right default: the pipeline drafts, a human approves (Mission 2-4).
`forcePublishedWrite: true` skips that and writes live.

## References

- Generate quick start: https://www.sanity.io/docs/agent-actions/generate-quickstart
- Transform patterns: https://www.sanity.io/docs/agent-actions/transform-cheatsheet
- Agent Actions patterns (noWrite, async, targets): https://www.sanity.io/docs/agent-actions/agent-action-cheatsheet
