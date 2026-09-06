# Chaining the steps, and the stop condition

Mission 2-3. Automation needs a stop condition. An unattended pipeline that only ever succeeds
hasn't been tested, and without a failing case the human gate in Mission 2-4 has no justification.

## The shape

```
event (menuItem published, description.base undefined)
  └─ 1. compute the delta: traversed allergens − declared allergens
       ├─ delta empty  → 2. Generate base copy + callout
       │                 3. Transform nyc / austin / chicago
       │                 4. notify: "drafted copy for <title>"
       └─ delta present → HALT. No copy. Notify loudly: "<title> recipe reveals <delta>
                          the menu does not declare. Held for review."  Flag the item.
```

## Step 1 — the delta

```ts
const {declared, traversed, title} = await client.fetch(
  `*[_id == $id][0]{
    title,
    "declared": coalesce(allergens, []),
    "traversed": array::unique(coalesce(recipe->ingredients[]->allergenTags[], []))
  }`,
  {id: event.data._id},
)
const delta = traversed.filter((a: string) => !declared.includes(a))
```

The planted material — declared vs traversed per `studio/seed/README.md`:

| Item                          | Declared    | Recipe also reveals |
| ----------------------------- | ----------- | ------------------- |
| Harissa Chickpea Bowl         | —           | sesame              |
| Miso Ginger Grain Bowl        | soy, sesame | wheat               |
| Charred Broccoli & Farro Bowl | wheat       | sesame              |
| Buffalo Cauliflower Wrap      | wheat, milk | soy, egg            |

The Harissa Chickpea Bowl is the cleanest failing case: declares nothing, reveals sesame.
**Done when: it doesn't ship.**

Note the tension with Mission 2-2, which used the Harissa bowl as its success case _because_ the
callout picked up sesame. In 2-3 the same gap becomes the reason to halt: a menu that declares
nothing for a dish containing sesame is a data problem a human should fix before copy goes out.
Choose one framing per demo; both are honest.

## Step 4 — "notify"

There is no Slack webhook in the room. Notify means at least a structured log line the attendee
can read in the emulator:

```ts
console.warn(JSON.stringify({event: 'held-for-review', id: event.data._id, title, delta}))
```

and, if you want a visible flag in the Studio, a small patch that does not re-trigger the
Function. Two safe options:

- **Patch the draft**, not the published document. Draft changes don't emit the published-document
  event the blueprint listens to: `client.patch(`drafts.${id}`).set({allergenCallout: 'HELD FOR
REVIEW — recipe reveals: sesame'})` (create the draft from the published doc first if none
  exists).
- **Set `status` to `internal` on the published document** so the item leaves the public menu.
  This _does_ emit an update event and the blueprint filter still matches (no `description.base`),
  so the handler runs again — guard the top of the handler with `if (status === 'internal')
return`, read via the same fetch. Idempotent writes are fine; unguarded ones loop until the
  lineage cap.

Prefer the first for the room. Either way the observable is the same: the item gets no copy and
the log says why.

## Recursion checklist

- The blueprint filter `!defined(description.base)` protects against the Generate write.
- Anything else you write to the _published_ document within the filter's scope needs its own
  guard (`status`, a `processedAt` timestamp, or `delta::changedAny`).
- Writes to drafts don't trigger the Function unless `includeDrafts: true` is set. It isn't.
- `@sanity/client` 8 sends a lineage header; recursive chains stop at 16. That is a safety net,
  not a design.

## Order of operations for the demo

1. `pnpm seed:reset` so every item is back to empty copy.
2. Publish a clean item (Citrus Fennel Salad, say) → watch Generate, then three Transforms, then
   the success notification. Open the draft in Studio: four description fields, one callout.
3. Publish the Harissa Chickpea Bowl → watch the halt. No copy. The warning names sesame.
4. Then hand off to Mission 2-4: this is exactly the item a human should sign off.
