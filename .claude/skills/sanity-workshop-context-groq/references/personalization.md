# Personalization — enrich and inject, from the system that owns the signal

Mission 1-5. The documented pattern (Sanity Context patterns → "the personalized assistant") in
one sentence: identify the user from the verified session, pull their signals from the systems
that own them, inject those signals into the system prompt as trusted inputs, and let the agent
shape its queries and ranking around them. Sanity stays the menu layer.

## The two guests

`app/lib/loyalty.ts` is the CRM stub. `getGuest('dara')` returns a gold-tier guest with
`allergens: ['peanut']`, a vegetarian preference, a usual order (the Thai Crunch Bowl), and a home
location in Austin. `getGuest(null)` returns `null` — the anonymous control. Both paths are
needed; the mission is only visible as a before-and-after.

## What the route does

```ts
const {messages, guestId} = await req.json()
const guest = getGuest(guestId) // null for anonymous

const guestBlock = guest
  ? `
Guest profile (server-provided, trusted):
- Name: ${guest.name} (${guest.tier} member)
- Allergens on file: ${guest.allergens.join(', ') || 'none'}
- Dietary preferences: ${guest.dietaryPrefs.join(', ') || 'none'}
- Home location: ${guest.homeLocation}
- Usual order: ${guest.usualOrder ?? 'none'}

For this guest, check allergen facts for anything you recommend, unprompted. A saved allergy
makes the cross-contact statement non-optional.`
  : ''

const system = BASE_PROMPT + guestBlock
```

Ask "what do you recommend?" as `dara`, then as anonymous. Signed in, the agent should
recommend from the catalog **and** check peanut exposure without being asked; anonymous, it
shouldn't.

## The trap

The instinct is a per-user `groqFilter`. That is wrong here: you are not hiding menu items from
this guest, you are changing what gets _checked_ and how results _rank_. Per-user `groqFilter`
is for when user-owned documents genuinely live in the dataset, and then you scope by a
session-derived id plus a fail-closed base filter. Different problem.

## Boundaries that make the lesson hold

- **The profile never enters Sanity.** Not as a document, not as a schema field. Signals ride on
  top from the system that owns them.
- **Identity comes from the verified session** in a real app. The ChatPanel sends `guestId` in
  the request body as a stand-in for that. Say so in a comment; don't pretend the body is trusted.
- **Don't log the profile** verbosely. It is sensitive at the app layer even when the fictional
  guest isn't.

## The routing consequence

Once Mission 1-3 has added the Knowledge Base as a second source: anonymous "what's good here?"
is a catalog question (GROQ). For `dara` it is a catalog question **plus a mandatory KB lookup**,
because a peanut allergy makes the Sunfield supplier fact non-optional. Routing by _who is
asking_, not only by question type. Mission 1-4 owns the routing table; this mission adds a row
to it.
