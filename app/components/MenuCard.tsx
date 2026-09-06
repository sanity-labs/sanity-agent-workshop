import {isSoldOut} from '@/lib/shop'
import type {MenuItemCard} from '@/lib/types'

import {AllergenNotice} from './AllergenNotice'
import {Availability} from './Availability'

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`

export function MenuCard({item}: {item: MenuItemCard}) {
  const markets = [...new Set((item.locations ?? []).map((l) => l.market))]

  return (
    <article className="card">
      <div style={{display: 'flex', justifyContent: 'space-between', gap: '0.5rem'}}>
        <h3>{item.title}</h3>
        <span className="price">{money(item.priceCents)}</span>
      </div>
      <p className="body">{item.body}</p>
      <div className="meta">
        {item.calories != null ? <span className="tag">{item.calories} cal</span> : null}
        {(item.dietaryFlags ?? []).map((flag) => (
          <span key={flag} className="tag flag">
            {flag}
          </span>
        ))}
        {markets.map((m) => (
          <span key={m} className="tag">
            {m.toUpperCase()}
          </span>
        ))}
      </div>
      <AllergenNotice allergens={item.allergens} />
      <Availability soldOut={isSoldOut(item._id)} availableUntil={item.availableUntil} />
    </article>
  )
}
