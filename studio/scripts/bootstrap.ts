/**
 * Bootstrap the project after `sanity init --template`.
 *
 * Runs on ~50 machines at once, on conference wifi, once. So every step is
 * try/caught, records success / skipped / failed, and prints a manual fallback
 * in the summary. A PARTIAL BOOTSTRAP MUST STILL LEAVE A USABLE REPO.
 *
 * Steps:
 *   1. Consolidate env — write project ID + dataset into app/.env.local
 *   2. Prompt for Anthropic API key (skippable)
 *   2b. Prompt for organization ID + organization token (skippable, loud)
 *   3. Add CORS origin http://localhost:3000
 *   4. Deploy schema (required for a Context MCP in GROQ mode)
 *   4b. Deploy Studio — prompted (default yes), soft-fail. Needed by the Plan B endpoint.
 *   5. Import the 83-document seed
 *   6. Make the dataset private
 *   7. Create a project read token (Viewer) → app/.env.local
 *   8. Enable Dataset Embeddings with the workshop projection, --wait, soft-fail
 *   9. Deploy the blueprint (Track 2 plumbing)
 *  10. Restore dependencies (blueprint deploy can disrupt node_modules)
 *  11. Generate types (soft-fail; the app shell does not depend on them)
 *
 * Deliberately absent — these are the lessons: no Context MCP endpoint, no
 * MCP URL written to env, no KB endpoint, no groqFilter, no Function body.
 *
 * Usage:  pnpm bootstrap   (root)  →  sanity exec scripts/bootstrap.ts --with-user-token
 */

import {execFileSync} from 'node:child_process'
import {copyFileSync, existsSync, readFileSync, writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {getCliClient} from 'sanity/cli'

const dir = import.meta.dirname!
const studioDir = resolve(dir, '..')
const root = resolve(dir, '../..')
const appEnvLocal = resolve(root, 'app/.env.local')
const appEnvExample = resolve(root, 'app/.env.example')

const client = getCliClient({apiVersion: '2025-05-08'})
const {projectId, dataset} = client.config()

// ── Step runner ───────────────────────────────────────────────────────────

interface StepResult {
  name: string
  status: 'success' | 'skipped' | 'failed'
  error?: string
  manualCommand?: string
  ms?: number
}

const results: StepResult[] = []
let stepStart = 0
const success = (name: string) =>
  results.push({name, status: 'success', ms: Date.now() - stepStart})
const skipped = (name: string, reason: string, manualCommand?: string) => {
  console.log(`  ↷ Skipped: ${reason}`)
  results.push({name, status: 'skipped', error: reason, manualCommand, ms: Date.now() - stepStart})
}
const failed = (name: string, error: unknown, manualCommand?: string) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`  ✗ Failed: ${message}`)
  results.push({name, status: 'failed', error: message, manualCommand, ms: Date.now() - stepStart})
}

// ── Helpers ───────────────────────────────────────────────────────────────

function run(cmd: string, args: string[], options?: {cwd?: string}) {
  execFileSync(cmd, args, {stdio: 'inherit', cwd: studioDir, ...options})
}

function sanity(...args: string[]) {
  run('pnpm', ['exec', 'sanity', ...args])
}

function sanityCapture(...args: string[]): string {
  return execFileSync('pnpm', ['exec', 'sanity', ...args], {
    cwd: studioDir,
    stdio: ['inherit', 'pipe', 'pipe'],
  }).toString()
}

function heading(label: string) {
  stepStart = Date.now()
  console.log(`\n── ${label} ${'─'.repeat(Math.max(0, 60 - label.length))}`)
}

function parseEnvFile(path: string): Record<string, string> {
  const vars: Record<string, string> = {}
  if (!existsSync(path)) return vars
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) vars[match[1].trim()] = match[2].trim().replace(/^(['"])(.*)\1$/, '$2')
  }
  return vars
}

function patchEnvVar(filePath: string, key: string, value: string) {
  let content = existsSync(filePath) ? readFileSync(filePath, 'utf8') : ''
  const pattern = new RegExp(`^#?\\s*(${key})=.*$`, 'm')
  if (pattern.test(content)) {
    content = content.replace(pattern, `${key}=${value}`)
  } else {
    content = content.trimEnd() + `\n${key}=${value}\n`
  }
  writeFileSync(filePath, content.replace(/^\n/, ''))
}

function prompt(question: string): string {
  process.stderr.write(question)
  try {
    return execFileSync('bash', ['-c', 'read -r val && echo "$val"'], {
      stdio: ['inherit', 'pipe', 'inherit'],
    })
      .toString()
      .trim()
  } catch {
    return ''
  }
}

const isRealValue = (value: string | undefined): boolean =>
  !!value && !value.toLowerCase().startsWith('your-')

const errText = (err: unknown) =>
  String(
    err instanceof Error
      ? `${err.message} ${(err as {stderr?: Buffer}).stderr ?? ''} ${(err as {stdout?: Buffer}).stdout ?? ''}`
      : err,
  ).toLowerCase()

function ensureAppEnvLocal() {
  if (!existsSync(appEnvLocal) && existsSync(appEnvExample)) {
    copyFileSync(appEnvExample, appEnvLocal)
    console.log('Created app/.env.local from app/.env.example')
  }
}

if (!projectId || !dataset) {
  console.error(
    '\n✗ Could not resolve project ID and dataset. Fill in studio/.env (see studio/.env.example) or re-run `sanity init --template`.\n',
  )
  process.exit(1)
}

const started = Date.now()
console.log(`\nGreen & Gather bootstrap — project ${projectId}, dataset ${dataset}`)

// ── 1. Consolidate env ────────────────────────────────────────────────────

heading('Consolidate env')
try {
  ensureAppEnvLocal()
  patchEnvVar(appEnvLocal, 'NEXT_PUBLIC_SANITY_PROJECT_ID', projectId)
  patchEnvVar(appEnvLocal, 'NEXT_PUBLIC_SANITY_DATASET', dataset)
  // Plan B for Mission 1-1: the legacy project-addressed Context endpoint. Needs a
  // deployed Studio and takes the project read token as bearer. See app/.env.example.
  patchEnvVar(
    appEnvLocal,
    'SANITY_CONTEXT_MCP_URL_FALLBACK',
    `https://api.sanity.io/v2026-03-03/context/mcp/${projectId}/${dataset}`,
  )
  console.log('Wrote project ID, dataset, and the fallback Context URL to app/.env.local')
  success('Consolidate env')
} catch (err) {
  failed('Consolidate env', err, `Add NEXT_PUBLIC_SANITY_PROJECT_ID=${projectId} to app/.env.local`)
}

// ── 2. Anthropic API key ──────────────────────────────────────────────────

heading('Anthropic API key')
try {
  const existing = parseEnvFile(appEnvLocal).ANTHROPIC_API_KEY
  if (isRealValue(existing)) {
    console.log('Anthropic API key already configured')
    success('Anthropic API key')
  } else {
    const key = prompt(
      'Anthropic API key (https://console.anthropic.com — or press Enter to skip; keys are available in the room): ',
    )
    if (key) {
      patchEnvVar(appEnvLocal, 'ANTHROPIC_API_KEY', key)
      console.log('Saved to app/.env.local')
      success('Anthropic API key')
    } else {
      skipped(
        'Anthropic API key',
        'No key entered. The chat stub works without one; the wired agent will not.',
        'Add ANTHROPIC_API_KEY=<key> to app/.env.local',
      )
    }
  }
} catch (err) {
  failed('Anthropic API key', err, 'Add ANTHROPIC_API_KEY=<key> to app/.env.local')
}

// ── 2b. Organization ID + token ───────────────────────────────────────────
// Bootstrap CANNOT create these — enabling Context and minting an
// organization token are Dashboard actions with no CLI path. Without them the
// app cannot reach Context at all, and the failure reads as a broken
// connection rather than a missing credential. So: ask, and fail loudly.

heading('Organization ID + token (for Sanity Context)')
try {
  const vars = parseEnvFile(appEnvLocal)
  let orgId = vars.SANITY_ORGANIZATION_ID
  let orgToken = vars.SANITY_ORGANIZATION_TOKEN

  // The organization ID is derivable: the project knows which org it belongs to.
  // Only the org token has no API or CLI path and has to be pasted.
  if (!isRealValue(orgId)) {
    try {
      const project = (await client.request({uri: `/projects/${projectId}`})) as {
        organizationId?: string
      }
      if (project.organizationId) {
        orgId = project.organizationId
        patchEnvVar(appEnvLocal, 'SANITY_ORGANIZATION_ID', orgId)
        console.log(`Organization ID ${orgId} (looked up from the project)`)
      }
    } catch {
      /* fall through to the prompt */
    }
  } else {
    console.log('Organization ID already configured')
  }
  if (!isRealValue(orgId)) {
    orgId = prompt('Sanity organization ID (from sanity.io/manage — Enter to skip): ')
    if (orgId) patchEnvVar(appEnvLocal, 'SANITY_ORGANIZATION_ID', orgId)
  }
  if (!isRealValue(orgToken)) {
    orgToken = prompt(
      'Organization API token with Context Viewer permissions (from the pre-flight — Enter to skip): ',
    )
    if (orgToken) patchEnvVar(appEnvLocal, 'SANITY_ORGANIZATION_TOKEN', orgToken)
  } else {
    console.log('Organization token already configured')
  }

  if (isRealValue(orgId) && isRealValue(orgToken)) {
    success('Organization ID + token')
  } else {
    console.log(
      '\n  ⚠  Your agent cannot reach Sanity Context without an organization token. Two clicks, no CLI path:\n' +
        '     1. https://www.sanity.io/manage → your organization → Apps → enable Context\n' +
        '     2. Same org → API → Tokens → Add API token → permission "Context Viewer"\n' +
        '        (an ORGANIZATION token — a project token is refused with 403 contextGrantRequired)\n' +
        '     Then add SANITY_ORGANIZATION_TOKEN to app/.env.local.\n',
    )
    skipped(
      'Organization ID + token',
      'Missing org token. Setup still succeeds; Mission 1-1 will not until it exists.',
      'Add SANITY_ORGANIZATION_TOKEN (and SANITY_ORGANIZATION_ID if missing) to app/.env.local',
    )
  }
} catch (err) {
  failed(
    'Organization ID + token',
    err,
    'Add SANITY_ORGANIZATION_ID and SANITY_ORGANIZATION_TOKEN to app/.env.local',
  )
}

// ── 3. Add CORS origin ────────────────────────────────────────────────────

heading('Add CORS origin')
try {
  execFileSync(
    'pnpm',
    ['exec', 'sanity', 'cors', 'add', 'http://localhost:3000', '--credentials'],
    {
      cwd: studioDir,
      stdio: 'pipe',
    },
  )
  console.log('Added http://localhost:3000 as a CORS origin')
  success('Add CORS origin')
} catch (err) {
  // `sanity init --template` may already have added it — not a failure.
  const out = errText(err)
  if (out.includes('duplicate') || out.includes('conflict') || out.includes('already')) {
    console.log('CORS origin already exists — skipping')
    success('Add CORS origin')
  } else {
    failed(
      'Add CORS origin',
      err,
      'cd studio && npx sanity cors add http://localhost:3000 --credentials',
    )
  }
}

// ── 4. Deploy schema ──────────────────────────────────────────────────────
// The one deploy a GROQ-mode Context MCP requires. Without it the endpoint
// refuses the connection with -32004.

heading('Deploy schema')
try {
  sanity('schema', 'deploy')
  success('Deploy schema')
} catch (err) {
  failed('Deploy schema', err, 'cd studio && npx sanity schema deploy')
}

// ── 4b. Deploy Studio (optional) ──────────────────────────────────────────
// Not load-bearing: the Context app does not need a hosted Studio. Useful on
// its own — content on a phone, a helper looking at your data without a
// screen-share. `sanity deploy` asks you to pick a hostname the first time,
// so it is opt-in here rather than silently blocking on a prompt.

heading('Deploy Studio')
console.log(
  'A hosted Studio is optional for the workshop, with one exception: the fallback Context\n' +
    'endpoint (Plan B in app/.env.example, for when the Context app is unavailable) only\n' +
    'works for a project with a deployed Studio. Takes about a minute; you pick a hostname.',
)
try {
  const answer = prompt('Deploy a hosted Studio now? (Y/n): ')
  if (!/^n/i.test(answer.trim())) {
    sanity('deploy')
    success('Deploy Studio')
  } else {
    skipped(
      'Deploy Studio',
      'Not requested. Nothing depends on it.',
      'cd studio && npx sanity deploy',
    )
  }
} catch (err) {
  // Never let a Studio deploy stop bootstrap.
  skipped(
    'Deploy Studio',
    `Deploy did not finish (${err instanceof Error ? err.message : String(err)}). Nothing depends on it.`,
    'cd studio && npx sanity deploy',
  )
}

// ── 5. Import seed ────────────────────────────────────────────────────────

heading('Import seed (83 documents)')
try {
  sanity('dataset', 'import', 'seed/green-and-gather.ndjson', dataset, '--missing')
  success('Import seed')
} catch (err) {
  failed(
    'Import seed',
    err,
    `cd studio && npx sanity dataset import seed/green-and-gather.ndjson ${dataset} --missing`,
  )
}

// ── 6. Make dataset private ───────────────────────────────────────────────
// Mission 1-6's groqFilter is only honest if API access is gated on a
// server-side token. A public dataset would let anyone read around the filter.

heading('Make dataset private')
try {
  sanity('datasets', 'visibility', 'set', dataset, 'private')
  success('Make dataset private')
} catch (err) {
  failed(
    'Make dataset private',
    err,
    `cd studio && npx sanity datasets visibility set ${dataset} private`,
  )
}

// ── 7. Project read token ─────────────────────────────────────────────────
// A Viewer token for RENDERING the menu page from the private dataset.
// Server-side only. This is NOT the token the agent uses — Context needs an
// organization token (step 2b).

heading('Project read token')
try {
  if (isRealValue(parseEnvFile(appEnvLocal).SANITY_READ_TOKEN)) {
    console.log('Read token already set — skipping creation')
  } else {
    const out = sanityCapture(
      'tokens',
      'add',
      'Green & Gather — app read (Viewer)',
      '--project-id',
      projectId,
      '--role',
      'viewer',
      '--json',
      '-y',
    )
    const json = JSON.parse(out.match(/\{[\s\S]*\}/)?.[0] ?? '{}')
    const token = json.key ?? json.token ?? json.value
    if (!token) throw new Error('Could not parse token from `sanity tokens add` output')
    patchEnvVar(appEnvLocal, 'SANITY_READ_TOKEN', token)
    console.log('Created read token and wrote it to app/.env.local')
  }
  success('Project read token')
} catch (err) {
  failed(
    'Project read token',
    err,
    'cd studio && npx sanity tokens add "app read" --role viewer --json -y   # then set SANITY_READ_TOKEN in app/.env.local',
  )
}

// ── 8. Dataset Embeddings ─────────────────────────────────────────────────
// Powers text::semanticSimilarity(). Mission 1-2's "something filling that
// isn't spicy" ranks on prose in `body`, because there is no `spicy` field by
// design. Type-specific keys, because field names are semantic context for the
// embedding. `location` and `supplier` are deliberately excluded — they are
// filter targets, not things a guest describes in their own words.
//
// --wait makes this deterministic instead of a race: a still-`updating`
// dataset returns incomplete rankings with NO error, which reads to a learner
// as "my agent is bad at this".

heading('Enable Dataset Embeddings')
const EMBEDDINGS_PROJECTION =
  '{title, breadcrumb, ' +
  '_type == "menuItem" => {"dish_description": body, "dish_category": category, "dietary": dietaryFlags}, ' +
  '_type in ["recipe", "ingredient"] => {"preparation": body}, ' +
  '_type in ["faq", "allergenPolicy", "crossContactStatement", "substitutionPolicy", "prepStandard"] => {"policy_text": body}}'
try {
  sanity(
    'datasets',
    'embeddings',
    'enable',
    dataset,
    '--wait',
    '--projection',
    EMBEDDINGS_PROJECTION,
  )
  try {
    const status = sanityCapture('datasets', 'embeddings', 'status', dataset)
    console.log(status.trim())
  } catch {}
  success('Enable Dataset Embeddings')
} catch (err) {
  const out = errText(err)
  if (out.includes('already')) {
    console.log('Embeddings already enabled — skipping')
    success('Enable Dataset Embeddings')
  } else {
    // Soft-fail: a timeout here must not kill bootstrap. `pnpm verify` checks
    // the status again, and Mission 1-2 names `updating` as the first suspect.
    skipped(
      'Enable Dataset Embeddings',
      `Did not finish (${err instanceof Error ? err.message.split('\n')[0] : String(err)}). Mission 1-2's semantic question needs this.`,
      `cd studio && npx sanity datasets embeddings enable ${dataset} --wait --projection '${EMBEDDINGS_PROJECTION}'`,
    )
  }
}

// ── 9. Deploy blueprint ───────────────────────────────────────────────────
// Track 2 plumbing: the draft-menu-copy Function. Track 1 never needs it, so
// a failure here must not stop anyone.

heading('Deploy blueprint (Track 2)')
console.log(
  'This step takes about 90 seconds and prints "No new activity" while it waits — that is normal.\n' +
    "Please don't interrupt it. Only Track 2 needs it; Track 1 works without it either way.",
)
try {
  run('pnpm', ['--filter', '@starter/functions', 'run', 'build'], {cwd: root})
  const blueprintConfig = resolve(root, '.sanity/blueprint.config.json')
  if (!existsSync(blueprintConfig)) {
    try {
      execFileSync(
        'pnpm',
        [
          'exec',
          'sanity',
          'blueprints',
          'init',
          '--stack-name',
          'production',
          '--project-id',
          projectId,
        ],
        {cwd: root, stdio: 'pipe'},
      )
    } catch (initErr) {
      if (!errText(initErr).includes('already exists')) throw initErr
      console.log('Stack already exists — linking local config')
      run(
        'pnpm',
        [
          'exec',
          'sanity',
          'blueprints',
          'config',
          '--edit',
          '--project-id',
          projectId,
          '--stack',
          'production',
        ],
        {cwd: root},
      )
    }
  }
  run('pnpm', ['exec', 'sanity', 'blueprints', 'deploy'], {cwd: root})
  success('Deploy blueprint')
} catch (err) {
  failed(
    'Deploy blueprint',
    err,
    'pnpm --filter @starter/functions build && npx sanity blueprints deploy   # from the repo root. Only Track 2 needs this.',
  )
}

// ── 10. Restore dependencies ──────────────────────────────────────────────

heading('Restore dependencies')
try {
  run('pnpm', ['install'], {cwd: root})
  success('Restore dependencies')
} catch (err) {
  failed('Restore dependencies', err, 'pnpm install')
}

// ── 11. Generate types ────────────────────────────────────────────────────
// The app shell does not import generated types, so this is a nice-to-have
// for the code you write next, not a prerequisite for `pnpm dev`.

heading('Generate types')
try {
  run('pnpm', ['--filter', 'studio', 'typegen'], {cwd: root})
  success('Generate types')
} catch (err) {
  skipped(
    'Generate types',
    `Typegen did not finish (${err instanceof Error ? err.message.split('\n')[0] : String(err)}). pnpm dev works without it.`,
    'pnpm typegen',
  )
}

// ── Summary ───────────────────────────────────────────────────────────────

const failures = results.filter((r) => r.status === 'failed')
const skips = results.filter((r) => r.status === 'skipped')
const total = Math.round((Date.now() - started) / 1000)

console.log('\n' + '─'.repeat(64))
for (const r of results) {
  const mark = r.status === 'success' ? '✓' : r.status === 'skipped' ? '↷' : '✗'
  console.log(
    `  ${mark} ${r.name.padEnd(36)} ${r.ms != null ? `${(r.ms / 1000).toFixed(1)}s` : ''}`,
  )
}
console.log(`\n  ${total}s total`)

if (failures.length === 0) {
  console.log('\n✓ Bootstrap complete\n')
} else {
  console.log('\n⚠ Some steps failed. To finish manually:\n')
  for (const r of failures) {
    console.log(`  ${r.name}:`)
    if (r.manualCommand) console.log(`    $ ${r.manualCommand}`)
    console.log(`    Error: ${r.error?.split('\n')[0]}\n`)
  }
}
if (skips.length) {
  console.log('Skipped:')
  for (const r of skips) {
    console.log(`  ${r.name}: ${r.error}`)
    if (r.manualCommand) console.log(`    $ ${r.manualCommand}`)
  }
  console.log()
}

console.log('Next:  pnpm dev   → open http://localhost:3000/chat and send a message.')
console.log('       Setup succeeded when it replies "not connected yet". That stub is the point.\n')
