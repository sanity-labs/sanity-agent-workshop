/**
 * verify — asserts the Green & Gather seed still answers correctly.
 *
 * This is the only guardrail that survives an agent editing the schema. A
 * helpful agent WILL offer a `spicy` boolean, and that one field destroys
 * Mission 1-2's semantic question. Prose in AGENTS.md alone won't hold.
 *
 * Two modes:
 *   pnpm verify                      → online: GROQ against your dataset, plus
 *                                      the offline checks, plus embeddings status
 *   pnpm verify:offline              → offline: the same numbers computed from
 *                                      the .ndjson, plus schema-file checks.
 *                                      No project needed; this is what CI runs.
 *
 * Every number here was re-derived from the .ndjson, not copied from prose.
 *
 * ⚠ If you have pointed this repo at YOUR OWN content, this script is expected
 * to fail — it asserts the Green & Gather seed's specific answers.
 */

import {execFileSync} from 'node:child_process'
import {readdirSync, readFileSync} from 'node:fs'
import {resolve} from 'node:path'

const dir = import.meta.dirname!
const studioDir = resolve(dir, '..')
const offline = process.argv.includes('--offline')

// ── Expected answers ──────────────────────────────────────────────────────

const AUSTIN_ANSWER = ['gg.menuItem.harissa-chickpea-bowl']
const PUBLISHED_VEGAN = 7
const ALL_VEGAN = 8
const UNDER_600 = 6
const UNDER_600_WITH_SESAME = 3
const NO_CALORIES = ['gg.menuItem.autumn-squash-bowl']
const SEED_COUNT = 83
/** Allergens each item reveals ONLY via recipe → ingredient, beyond what it declares. */
const EXPECTED_DELTAS: Record<string, string[]> = {
  'gg.menuItem.harissa-chickpea-bowl': ['sesame'],
  'gg.menuItem.miso-ginger-grain-bowl': ['wheat'],
  'gg.menuItem.charred-broccoli-farro-bowl': ['sesame'],
  'gg.menuItem.buffalo-cauliflower-wrap': ['egg', 'soy'],
}

// ── Reporter ──────────────────────────────────────────────────────────────

type Outcome = {name: string; ok: boolean; detail: string; protects: string}
const outcomes: Outcome[] = []
function check(name: string, protects: string, ok: boolean, detail: string) {
  outcomes.push({name, protects, ok, detail})
  console.log(`  ${ok ? '✓' : '✗'} ${name.padEnd(28)} ${detail}`)
}
const same = (a: string[], b: string[]) =>
  a.length === b.length && [...a].sort().every((v, i) => v === [...b].sort()[i])

// ── Seed model (shared by offline mode) ───────────────────────────────────

type Doc = Record<string, any> & {_id: string; _type: string}

function loadSeed(): Doc[] {
  const raw = readFileSync(resolve(studioDir, 'seed/green-and-gather.ndjson'), 'utf8')
  return raw
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as Doc)
}

function offlineChecks() {
  const docs = loadSeed()
  const byId = new Map(docs.map((d) => [d._id, d]))
  const items = docs.filter((d) => d._type === 'menuItem')
  const marketOf = (ref: {_ref: string}) => byId.get(ref._ref)?.market as string | undefined

  check(
    'Seed size',
    'everything',
    docs.length === SEED_COUNT,
    `${docs.length} documents (expect ${SEED_COUNT})`,
  )

  // 1 · Austin filter → Mission 1-1
  const austin = items
    .filter(
      (i) =>
        i.status === 'published' &&
        (i.dietaryFlags ?? []).includes('vegan') &&
        i.category === 'bowl' &&
        i.priceCents < 1200 &&
        (i.locations ?? []).some((l: {_ref: string}) => marketOf(l) === 'austin'),
    )
    .map((i) => i._id)
  check('Austin filter', '1-1', same(austin, AUSTIN_ANSWER), `${austin.join(', ') || '(none)'}`)

  // 2 · Vegan counts → Missions 1-2, 1-6
  const vegan = items.filter((i) => (i.dietaryFlags ?? []).includes('vegan'))
  const veganPublished = vegan.filter((i) => i.status === 'published')
  check(
    'Vegan count',
    '1-2, 1-6',
    veganPublished.length === PUBLISHED_VEGAN && vegan.length === ALL_VEGAN,
    `${veganPublished.length} published, ${vegan.length} total (expect ${PUBLISHED_VEGAN} / ${ALL_VEGAN})`,
  )

  // 3 · Sesame exclusion → Mission 1-2
  const under600 = items.filter(
    (i) => i.status === 'published' && typeof i.calories === 'number' && i.calories < 600,
  )
  const withSesame = under600.filter((i) => (i.allergens ?? []).includes('sesame'))
  check(
    'Sesame exclusion',
    '1-2',
    under600.length === UNDER_600 && withSesame.length === UNDER_600_WITH_SESAME,
    `${under600.length} under 600 cal, ${withSesame.length} declare sesame (expect ${UNDER_600} / ${UNDER_600_WITH_SESAME})`,
  )

  // 4 · Multi-hop depth → Missions 1-2, 1-3
  const deltaProblems: string[] = []
  for (const [id, expected] of Object.entries(EXPECTED_DELTAS)) {
    const item = byId.get(id)
    const recipe = item?.recipe?._ref ? byId.get(item.recipe._ref) : undefined
    const traversed = new Set<string>()
    for (const ref of recipe?.ingredients ?? []) {
      for (const tag of byId.get(ref._ref)?.allergenTags ?? []) traversed.add(tag)
    }
    const declared = new Set<string>(item?.allergens ?? [])
    const delta = [...traversed].filter((t) => !declared.has(t))
    if (!same(delta, expected)) deltaProblems.push(`${id}: got [${delta}], expect [${expected}]`)
  }
  check(
    'Multi-hop depth',
    '1-2, 1-3',
    deltaProblems.length === 0,
    deltaProblems.length ? deltaProblems.join('; ') : 'declared ≠ traversed on all four items',
  )

  // 5 · Missing calories is a fact → Mission 1-2
  const noCal = items.filter((i) => i.calories == null).map((i) => i._id)
  check('Missing calories', '1-2', same(noCal, NO_CALORIES), noCal.join(', ') || '(none)')

  // 8 · Track 2 targets ship empty → Missions 2-2, 2-3
  const prefilled = items.filter((i) => i.description != null || i.allergenCallout != null)
  check(
    'Track 2 fields empty',
    '2-2, 2-3',
    prefilled.length === 0,
    prefilled.length
      ? `${prefilled.length} items pre-filled`
      : 'description + allergenCallout empty on every item',
  )

  schemaChecks()
}

function schemaChecks() {
  const schemaDir = resolve(studioDir, 'schemaTypes')
  const files: string[] = []
  const walk = (d: string) => {
    for (const entry of readdirSync(d, {withFileTypes: true})) {
      const p = resolve(d, entry.name)
      if (entry.isDirectory()) walk(p)
      else if (p.endsWith('.ts')) files.push(p)
    }
  }
  walk(schemaDir)
  const source = files.map((f) => readFileSync(f, 'utf8')).join('\n')

  // 6 · No forbidden fields → Mission 1-2
  const forbidden = source.match(
    /name:\s*['"](spicy|spiciness|heat|heatLevel|heaviness|isVegan|vegan)['"]/g,
  )
  check(
    'No forbidden fields',
    '1-2',
    !forbidden,
    forbidden ? `found ${forbidden.join(', ')}` : 'no spicy / heaviness / derived-vegan field',
  )

  // 7 · allergenCallout stays flat → Mission 2-3
  const menuItem = readFileSync(resolve(schemaDir, 'documents/menuItem.ts'), 'utf8')
  const calloutBlock = menuItem.match(/name:\s*'allergenCallout'[\s\S]*?type:\s*'(\w+)'/)
  check(
    'Callout is flat',
    '2-3',
    calloutBlock?.[1] === 'text',
    calloutBlock ? `allergenCallout is type '${calloutBlock[1]}'` : 'allergenCallout field missing',
  )
  const descBlock = menuItem.match(/name:\s*'description'[\s\S]*?fields:\s*\[([\s\S]*?)\n\s*\],/)
  const marketKeys = ['base', 'nyc', 'austin', 'chicago'].filter((k) =>
    descBlock?.[1].includes(`name: '${k}'`),
  )
  check(
    'Description is per-market',
    '2-2, 2-3',
    marketKeys.length === 4,
    `description has ${marketKeys.join(', ') || 'no'} keys`,
  )
}

async function onlineChecks() {
  const {getCliClient} = await import('sanity/cli')
  const client = getCliClient({apiVersion: '2025-05-08'})
  const {dataset} = client.config()
  const q = <T>(query: string) => client.fetch<T>(query)

  // 1
  const austin = await q<string[]>(`
    *[_type == "menuItem" && status == "published"
      && "vegan" in dietaryFlags && category == "bowl" && priceCents < 1200
      && "austin" in locations[]->market]._id`)
  check('Austin filter', '1-1', same(austin, AUSTIN_ANSWER), austin.join(', ') || '(none)')

  // 2
  const veganPub = await q<number>(
    `count(*[_type == "menuItem" && status == "published" && "vegan" in dietaryFlags])`,
  )
  const veganAll = await q<number>(`count(*[_type == "menuItem" && "vegan" in dietaryFlags])`)
  check(
    'Vegan count',
    '1-2, 1-6',
    veganPub === PUBLISHED_VEGAN && veganAll === ALL_VEGAN,
    `${veganPub} published, ${veganAll} total (expect ${PUBLISHED_VEGAN} / ${ALL_VEGAN})`,
  )

  // 3
  const under600 = await q<number>(
    `count(*[_type == "menuItem" && status == "published" && defined(calories) && calories < 600])`,
  )
  const withSesame = await q<number>(
    `count(*[_type == "menuItem" && status == "published" && defined(calories) && calories < 600 && "sesame" in allergens])`,
  )
  check(
    'Sesame exclusion',
    '1-2',
    under600 === UNDER_600 && withSesame === UNDER_600_WITH_SESAME,
    `${under600} under 600 cal, ${withSesame} declare sesame (expect ${UNDER_600} / ${UNDER_600_WITH_SESAME})`,
  )

  // 4
  const rows = await q<{_id: string; declared: string[] | null; traversed: string[] | null}[]>(
    `
    *[_type == "menuItem" && _id in $ids]{
      _id, "declared": allergens,
      "traversed": array::unique(recipe->ingredients[]->allergenTags[])
    }`.replace('$ids', JSON.stringify(Object.keys(EXPECTED_DELTAS))),
  )
  const deltaProblems: string[] = []
  for (const [id, expected] of Object.entries(EXPECTED_DELTAS)) {
    const row = rows.find((r) => r._id === id)
    const declared = new Set(row?.declared ?? [])
    const delta = (row?.traversed ?? []).filter((t) => !declared.has(t))
    if (!same(delta, expected)) deltaProblems.push(`${id}: got [${delta}], expect [${expected}]`)
  }
  check(
    'Multi-hop depth',
    '1-2, 1-3',
    deltaProblems.length === 0,
    deltaProblems.length ? deltaProblems.join('; ') : 'declared ≠ traversed on all four items',
  )

  // 5
  const noCal = await q<string[]>(`*[_type == "menuItem" && !defined(calories)]._id`)
  check('Missing calories', '1-2', same(noCal, NO_CALORIES), noCal.join(', ') || '(none)')

  // 8
  const prefilled = await q<number>(
    `count(*[_type == "menuItem" && (defined(description) || defined(allergenCallout))])`,
  )
  check(
    'Track 2 fields empty',
    '2-2, 2-3',
    prefilled === 0,
    prefilled
      ? `${prefilled} items have copy drafted (expected if you have run Track 2 — pnpm seed:reset restores)`
      : 'description + allergenCallout empty on every item',
  )

  schemaChecks()

  // 9 · Embeddings ready → Mission 1-2 (the one failure that looks like the learner's fault)
  try {
    const out = execFileSync(
      'pnpm',
      ['exec', 'sanity', 'datasets', 'embeddings', 'status', dataset!],
      {
        cwd: studioDir,
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    )
      .toString()
      .toLowerCase()
    const status = out.match(/\b(ready|updating|error|disabled|not enabled)\b/)?.[1] ?? 'unknown'
    check(
      'Embeddings ready',
      '1-2',
      status === 'ready',
      status === 'updating'
        ? 'still generating — wait a minute and re-run'
        : status === 'ready'
          ? 'ready'
          : `status: ${status}`,
    )
  } catch (err) {
    check(
      'Embeddings ready',
      '1-2',
      false,
      `could not read status (${err instanceof Error ? err.message.split('\n')[0] : err})`,
    )
  }
}

console.log(
  `\nGreen & Gather seed verification (${offline ? 'offline — seed file + schema' : 'online — your dataset'})\n`,
)
if (offline) offlineChecks()
else await onlineChecks()

const failures = outcomes.filter((o) => !o.ok)
console.log('\n' + '─'.repeat(64))
if (failures.length === 0) {
  console.log('✓ All checks pass. The seed still answers correctly.\n')
} else {
  console.log(`✗ ${failures.length} check${failures.length === 1 ? '' : 's'} failed:\n`)
  for (const f of failures)
    console.log(`  ${f.name} — protects mission ${f.protects}\n    ${f.detail}`)
  console.log(
    '\nIf you are running your OWN content, this is expected: verify asserts the Green & Gather' +
      "\nseed's specific answers. If you are still on the seed, something changed that a mission" +
      '\ndepends on — `pnpm seed:reset` restores the dataset; git restores the schema.\n',
  )
  process.exit(1)
}
