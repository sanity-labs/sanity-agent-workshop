/**
 * STUB — the "live system" door.
 *
 * Sold-out state and store hours belong to an operational system, not to a
 * CMS and not to a Knowledge Base. This file stands in for that system so the
 * shell has somewhere honest to get "is it available right now?" from.
 *
 * It never reads or writes Sanity. Keep it that way: the lesson is that the
 * agent calls the system that owns the answer.
 */

/** Menu item _ids that are sold out right now. Hard-coded; edit freely. */
const SOLD_OUT = new Set<string>(['gg.menuItem.rosemary-sweet-potatoes'])

export function isSoldOut(menuItemId: string): boolean {
  return SOLD_OUT.has(menuItemId)
}

export type StoreStatus = {open: boolean; closesAt: string | null}

/** Store status by location _id. Every seeded location is open until 9pm. */
export function storeStatus(locationId: string): StoreStatus {
  if (!locationId) return {open: false, closesAt: null}
  return {open: true, closesAt: '21:00'}
}
