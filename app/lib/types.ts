/**
 * Hand-written types for the seed's `menuItem`, kept deliberately small so the
 * shell renders before `pnpm typegen` has ever run. For anything you build on
 * top, run `pnpm typegen` and import from `@starter/sanity-types` instead.
 */
export type Allergen =
  | 'milk'
  | 'egg'
  | 'fish'
  | 'shellfish'
  | 'tree-nuts'
  | 'peanut'
  | 'wheat'
  | 'soy'
  | 'sesame'

export type DietaryFlag = 'vegan' | 'vegetarian' | 'gluten-free-option'

export type MenuCategory = 'bowl' | 'wrap' | 'salad' | 'side' | 'kids'

export type MenuItemCard = {
  _id: string
  title: string
  body: string
  category: MenuCategory
  priceCents: number
  calories: number | null
  allergens: Allergen[] | null
  dietaryFlags: DietaryFlag[] | null
  availableUntil: string | null
  locations: {_id: string; title: string; market: string}[] | null
}
