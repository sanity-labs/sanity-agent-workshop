/**
 * STUB — the loyalty CRM. Mission 1-5's material.
 *
 * Two hard-coded guests, no external service. `anon` is the control; `dara`
 * has a peanut allergy on file. Mission 1-5 is only visible as a
 * before-and-after, so both are needed.
 *
 * Rules that make the lesson hold:
 *  - This file must never write to Sanity.
 *  - The guest profile must never be added to the schema. Signals ride on top
 *    of the content layer, from the system that owns them — they are read
 *    server-side and injected into the system prompt, not stored as documents
 *    and not turned into a per-user groqFilter.
 */

export type Guest = {
  id: string
  name: string
  /** Canonical tokens, matching ALLERGEN_OPTIONS in studio/schemaTypes/shared/baseFields.ts */
  allergens: string[]
  dietaryPrefs: string[]
  /** menuItem _id */
  usualOrder: string | null
  tier: 'member' | 'gold'
  /** location _id — makes Austin/NYC scoping personal */
  homeLocation: string
}

const GUESTS: Record<string, Guest> = {
  dara: {
    id: 'dara',
    name: 'Dara',
    allergens: ['peanut'],
    dietaryPrefs: ['vegetarian'],
    usualOrder: 'gg.menuItem.thai-crunch-bowl',
    tier: 'gold',
    homeLocation: 'gg.location.austin-south-congress',
  },
}

/**
 * Resolve the signed-in guest from a session identifier. Returns `null` for
 * anonymous guests — and `null` is the control case, so keep it a real path.
 */
export function getGuest(guestId: string | null | undefined): Guest | null {
  if (!guestId) return null
  return GUESTS[guestId] ?? null
}

export const KNOWN_GUEST_IDS = Object.keys(GUESTS)
