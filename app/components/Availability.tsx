/**
 * "Is it available right now?" comes from the live-system stub (lib/shop.ts),
 * not from Sanity. `availableUntil` is content; `soldOut` is state.
 */
export function Availability({
  soldOut,
  availableUntil,
}: {
  soldOut: boolean
  availableUntil: string | null
}) {
  if (soldOut) return <div className="notice stub">Sold out today (live-system stub)</div>
  if (availableUntil) {
    return <div className="notice stub">Seasonal — available until {availableUntil}</div>
  }
  return null
}
