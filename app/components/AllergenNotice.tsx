import type {Allergen} from '@/lib/types'

/**
 * Renders what the menu DECLARES. It is not the full picture — four seeded
 * items reveal more allergens only via recipe → ingredient — and this
 * component must not try to close that gap. The gap is the lesson.
 */
export function AllergenNotice({allergens}: {allergens: Allergen[] | null}) {
  if (!allergens || allergens.length === 0) {
    return <div className="notice warn">No declared allergens. Ask about cross-contact.</div>
  }
  return (
    <div className="notice warn">
      Declared: {allergens.join(', ')}. Prepared in a kitchen with shared equipment.
    </div>
  )
}
