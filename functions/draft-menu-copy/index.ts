import {documentEventHandler} from '@sanity/functions'

/**
 * draft-menu-copy — Track 2's Function. STUBBED.
 *
 * The plumbing works: the blueprint (sanity.blueprint.ts) fires this on a
 * menuItem create/update, and the log line below appears. The content work
 * is yours:
 *
 *   Mission 2-1  Run it. Publish a menu item, watch this log line appear.
 *   Mission 2-2  Add an Agent Action (Generate) that reads the linked recipe →
 *                ingredient.allergenTags and drafts `description.base` and
 *                `allergenCallout`. The callout must come from the TRAVERSED
 *                allergens, not from `menuItem.allergens`, and must end with
 *                the cross-contact statement verbatim.
 *   Mission 2-3  Chain it: Generate → patch → Transform per market
 *                (description.nyc / austin / chicago) → notify. Then publish an
 *                item whose recipe reveals an allergen the declared array
 *                missed, and make sure it doesn't ship.
 *
 * Run locally with `sanity functions dev` (part of `pnpm dev`) — no deploy
 * wait. Deploying is optional and comes later (`pnpm --filter @starter/functions deploy`).
 *
 * The event payload is shaped by the blueprint's `projection`:
 * `{_id, _type, title, recipe}`. Anything else, query for inside the handler
 * using `createClient({...context.clientOptions, apiVersion})`.
 */

type MenuItemEvent = {
  _id: string
  _type: string
  title?: string
  recipe?: {_ref: string}
}

export const handler = documentEventHandler<MenuItemEvent>(async ({context, event}) => {
  const {data} = event

  console.log(
    `[draft-menu-copy] ${data._type} ${data._id} "${data.title ?? '(untitled)'}" ` +
      `→ recipe: ${data.recipe?._ref ?? 'none'}` +
      (context.local ? '  (local run — nothing is written)' : ''),
  )

  // TODO Mission 2-2: draft description.base and allergenCallout from the recipe.
})
