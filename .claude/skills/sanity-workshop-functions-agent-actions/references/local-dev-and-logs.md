# Local development and logs

Mission 2-1's whole surface, plus the commands the later missions reuse.

## Build and test one invocation

From the repo root:

```sh
pnpm --filter @starter/functions build
npx sanity functions test draft-menu-copy \
  --dataset production --with-user-token \
  --document-id gg.menuItem.harissa-chickpea-bowl
```

Expected log from the stub:

```
[draft-menu-copy] menuItem gg.menuItem.harissa-chickpea-bowl "Harissa Chickpea Bowl" → recipe: gg.recipe.harissa-chickpea-bowl  (local run — nothing is written)
```

`--with-user-token` gives the handler a real client token so it can read (and, later, write)
your dataset. `context.local` is `true`; the stub prints the "nothing is written" note off it.

## The emulator

`pnpm dev` runs `sanity functions dev` on port 8080 alongside the Studio and the app. It is a
web UI for `functions test`: pick a function, type a document id, run, read the output. **It does
not receive Studio publishes.** Do not tell the attendee to publish and look at port 8080.

## What a Studio publish fires

Bootstrap deployed the blueprint, so a real publish invokes the **deployed** Function. Watch it:

```sh
npx sanity functions logs draft-menu-copy --watch     # start this BEFORE publishing
```

The deployed code is whatever was last deployed — the 2-1 stub until someone redeploys. So after
Missions 2-2 and 2-3 change the handler, a Studio publish still runs the stub; the new handler runs
via `functions test` (or the emulator). To make a publish run the new code:

```sh
pnpm --filter @starter/functions deploy       # builds, then `sanity blueprints deploy` (~1–2 min)
```

Optional in the room. `functions test` also evaluates the blueprint filter before invoking, so a
document that doesn't match prints `Filter ... returned an empty result. Skipping invoke.` — a free
filter check.

## Reading the event

The blueprint projects the event to `{_id, _type, title, recipe}`. `event.data.recipe._ref` is
the recipe id. Everything else — ingredients, allergen tags, the cross-contact statement — is a
query inside the handler:

```ts
const client = createClient({...context.clientOptions, apiVersion: '2025-05-08'})
const facts = await client.fetch(
  `{
    "declared": *[_id == $id][0].allergens,
    "traversed": array::unique(*[_id == $id][0].recipe->ingredients[]->allergenTags[]),
    "crossContact": *[_type == "crossContactStatement"][0].verbatimStatement
  }`,
  {id: event.data._id},
)
```

Nested filters inside the blueprint _projection_ fail silently; keep them in the handler.

## References

- Sanity Functions: https://www.sanity.io/docs/functions
- Blueprints: https://www.sanity.io/docs/functions/blueprints
