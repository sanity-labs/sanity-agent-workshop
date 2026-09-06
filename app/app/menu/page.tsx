import {defineQuery} from 'groq'

import {MenuCard} from '@/components/MenuCard'
import {sanity, sanityConfigured} from '@/lib/sanity'
import type {MenuItemCard} from '@/lib/types'

export const dynamic = 'force-dynamic'

// Only published items. `status` is one of the two fields people forget, and
// forgetting it here would render the unlaunched Winter Miso Bowl on the
// public menu — the exact leak Mission 1-6 is about.
const MENU_QUERY = defineQuery(`
  *[_type == "menuItem" && status == "published"] | order(category asc, title asc) {
    _id,
    title,
    body,
    category,
    priceCents,
    calories,
    allergens,
    dietaryFlags,
    availableUntil,
    "locations": locations[]->{_id, title, market}
  }
`)

const CATEGORY_LABELS: Record<string, string> = {
  bowl: 'Bowls',
  wrap: 'Wraps',
  salad: 'Salads',
  side: 'Sides',
  kids: 'Kids',
}

export default async function MenuPage() {
  if (!sanityConfigured || !sanity) {
    return (
      <>
        <h1>Menu</h1>
        <div className="setup-box">
          <p>
            The app can&rsquo;t reach your dataset yet. <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code>{' '}
            or <code>SANITY_READ_TOKEN</code> is missing from <code>app/.env.local</code>.
          </p>
          <pre>pnpm bootstrap</pre>
          <p className="body">
            Bootstrap writes both, imports the seed, and makes the dataset private. Then restart{' '}
            <code>pnpm dev</code>.
          </p>
        </div>
      </>
    )
  }

  let items: MenuItemCard[] = []
  let error: string | null = null
  try {
    items = await sanity.fetch<MenuItemCard[]>(MENU_QUERY)
  } catch (err) {
    error = err instanceof Error ? err.message : String(err)
  }

  if (error) {
    return (
      <>
        <h1>Menu</h1>
        <div className="setup-box">
          <p>The dataset query failed:</p>
          <pre>{error}</pre>
          <p className="body">
            Usually the read token is wrong or the seed hasn&rsquo;t been imported. Re-run{' '}
            <code>pnpm bootstrap</code>; it is safe to run twice.
          </p>
        </div>
      </>
    )
  }

  const byCategory = new Map<string, MenuItemCard[]>()
  for (const item of items) {
    const list = byCategory.get(item.category) ?? []
    list.push(item)
    byCategory.set(item.category, list)
  }

  return (
    <>
      <h1>Menu</h1>
      <p className="lede">
        {items.length} published items. Declared allergens are what the menu says; the full picture
        lives one hop away in each recipe. That gap is deliberate.
      </p>
      {[...byCategory.entries()].map(([category, list]) => (
        <section key={category}>
          <h2 className="section-title">{CATEGORY_LABELS[category] ?? category}</h2>
          <div className="card-grid">
            {list.map((item) => (
              <MenuCard key={item._id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </>
  )
}
