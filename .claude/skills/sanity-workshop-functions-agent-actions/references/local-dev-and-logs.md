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

`pnpm dev` runs `sanity functions dev` on port 8080 alongside the Studio and the app. Open it for
a payload editor and live output. Publishing a menu item in the Studio while it runs is the
Mission 2-1 demonstration.

## Watch a deployed Function

Deploying is optional in the room. If you do:

```sh
pnpm --filter @starter/functions deploy       # builds, then `sanity blueprints deploy`
npx sanity functions logs draft-menu-copy --watch
```

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
