# Decisions

The record of what was decided while building this starter, and why. Newest first within each
section. The planning documents this was built from (STARTER-SPEC, PLAN, TRACKS, BUILD) live
outside the repo; this file carries only what someone maintaining the repo needs.

## Scope

### The agent kit landed: four `sanity-workshop-*` skills, the public skills vendored, ten missions, ten checkpoints — 2026-09-06

Changes from the original plan, each on purpose:

- **Four skills, not three.** Functions + Agent Actions (Missions 2-1 to 2-3) and the Workflows
  engine (2-4) are different packages with different churn; a combined description triggers on
  the generic word "workflow". Split: `sanity-workshop-functions-agent-actions` and
  `sanity-workshop-workflows-engine`.
- **The `sanity-workshop-` prefix.** The public Sanity Context skills ship in the same `skills/`
  bundle, so the workshop-specific ones must be distinguishable at a glance. Every workshop skill's
  description also scopes itself with "use ONLY for…" / "DO NOT load for…" language, per the
  internal skill-writing guide, so it doesn't fire on someone's production chatbot.
- **The public skills are vendored verbatim**, pinned in `skills-lock.json`, rather than installed
  at bootstrap. They still document Context v1; the workshop skills carry the v2 corrections and say
  so. The vendored `create-agent-with-sanity-context` includes a full reference route
  (v1-shaped); Mission 1-1's prompt tells the agent to write the route from the pattern rather
  than copy it, and `AGENTS.md` backs that up.
- **Checkpoints are written as predictions.** They were authored from the design and a first dry
  run, not from walking every mission with a room. `checkpoints/README.md` says so. Walk 1-1 → 1-3
  and 2-1 → 2-2 on the real app and correct them from what you see.
- **`SANITY_CONTEXT_KB_TOKEN`** was added to `app/.env.example`: the shared KB lives in the
  facilitator's organization, so its endpoint needs a token for that org, distinct from the
  attendee's own `SANITY_ORGANIZATION_TOKEN`.

### The starter ships as a shell. Skills, missions, and checkpoints come in a later pass. — 2026-09-06 (superseded the same day by the entry above)

The first pass contains the Studio, the seed, the app shell, the Functions stub, bootstrap,
verify, and the docs. It does **not** contain `skills/` content, `missions/`, or `checkpoints/`.

**Why:** the skills are meant to be written _against the missions themselves_. Authoring them
before the missions exist would produce a parallel set that drifts from the prompts. The
missions and prompts are being written as a separate agent kit (the Learn course) and will land
here afterward.

**What this pass leaves ready for that one:** the `skills/` and `.claude/skills/` directories,
the `skills:sync` and `skills:check` scripts, the CI check that they match, and the `AGENTS.md`
rules that reference missions and checkpoints. See `AGENT-KIT.md` for exactly where each piece
goes.

**Same repo, not a separate install.** The kit does not become its own package or `skills add`
source in the first instance. It lives here so a fresh template scaffold carries the whole thing.

### Workshop-branded repo, not `sanity-labs/starters` — 2026-09-06

Lives at `sanity-labs/sanity-agent-workshop`. Install is
`pnpm create sanity@latest --template sanity-labs/sanity-agent-workshop`.

**Why:** the other starters are described as production-ready and run to a working app. This one
deliberately ships broken (the agent replies _"not connected yet"_), which is excellent teaching
and exactly wrong for someone browsing the starters gallery for an agent on their content. A
workshop-named repo whose README opens by saying so misleads nobody. Post-event, a stripped fork
with the route wired would make a genuine `agent-on-your-content` starter.

The `sanity-labs/starters` _conventions_ still apply — catalog deps, per-workspace env, oxfmt,
`@starter/*` packages, `sanity-template-validate` must pass.

### Template, not clone

Each attendee runs the `--template` command and gets their own project, dataset, seed copy, and
git history. Nobody shares a checkout; someone who mangles their data runs `pnpm seed:reset`.

## Dependencies

### Studio pinned to the 6.9 line, not latest — 2026-09-06

Both products the workshop teaches need v6: `@sanity/workflow-studio-plugin@0.31.0` peers on
`sanity ^6.3.0`, and Context v2 endpoints need a deployed v6 schema. The spec proposed
`sanity@6.12.0` (`latest`) and the eight packages _install_ alongside it without error.

**They do not build.** Studio 6.10 moved from `@sanity/ui@3` to `@sanity/ui@4`, which removed the
root `Tooltip` and `TooltipDelayGroupProvider` exports. `@sanity/workflow-components` and
`@sanity/workflow-diagram` at 0.31.0 still import them from the root, so `sanity build` on 6.10+
fails with `MISSING_EXPORT`. An install-only spike would not have caught this; the build did.

| `sanity`      | depends on `@sanity/ui` | workflow 0.31.0 builds? |
| ------------- | ----------------------- | ----------------------- |
| 6.3.0 – 6.9.x | `^3.2` – `^3.5.1`       | ✅                      |
| 6.10.0+       | `^4.0.3`                | ❌                      |

So the catalog pins `sanity: '~6.9.0'`, `@sanity/vision: '~6.9.0'`, `@sanity/ui: '^3.5.4'`.
This also removes the `@sanity/sdk` tension (6.12 pulls `@sanity/sdk-react@3`, the plugin peers
on `@sanity/sdk ^2.12`). Without the explicit `@sanity/ui` pin pnpm floats it to a 5.0 alpha.

**Bump `sanity` past 6.9 only together with a `@sanity/workflow-*` release that targets
`@sanity/ui ^4`.** Worth flagging to the Workflows team: the plugin's `sanity ^6.3.0` peer range
is wider than what actually builds.

### `@sanity/context` dropped — 2026-09-06

The spec flagged it as possibly unnecessary. It is: Context v2 moved configuration into the
Context app, the Studio plugin is deprecated, and the documented way to connect an agent is
`createMCPClient` from `@ai-sdk/mcp` pointed at the endpoint URL. Dropping it removes a v6
compatibility surface and the `ai ^6` peer floor it carried.

### Vercel AI SDK on the 6.x line — 2026-09-06

`ai@7` is current on npm, but the official Sanity Context reference implementation
(`sanity-io/context`, the `create-agent-with-sanity-context` skill) and the `knowledge-base`
starter are on `ai ^6` with `@ai-sdk/anthropic ^3`, `@ai-sdk/mcp ^1`, `@ai-sdk/react ^3`.
Attendees' agents will lean on that reference, so matching it avoids a class of "the example
doesn't match my installed API" failures mid-mission.

### `groq` and `server-only` in the app

`groq` provides `defineQuery` for the menu query (and TypeGen picks it up). `server-only` makes
importing `app/lib/sanity.ts` from a client component a build error instead of a token leak.

## Design

### The stub route streams UI messages instead of returning JSON — 2026-09-06

The spec's stub returned `Response.json({role, content})`. This one returns
`createUIMessageStreamResponse` with a single text part. Same pedagogical property — a
_successful_ response that says it isn't connected — but it means `ChatPanel` uses `useChat`
against the stub exactly as it will against the wired agent. Mission 1-1 changes one file
(`route.ts`), and tool-call traces render without any UI work.

### The app does not depend on generated types

`packages/@starter/sanity-types` exists and `pnpm typegen` fills it, but the shell imports
hand-written types from `app/lib/types.ts`. **Why:** in the KB starter, skipping typegen makes the
first `pnpm dev` fail with "Schema file not found". In a room of 50 on conference wifi, one fewer
hard dependency in the setup path is worth more than typed queries the shell doesn't need.
Bootstrap still runs typegen as a soft step for the code attendees write next.

### Studio deploy is an opt-in prompt, not a soft-failing step

The spec had `sanity deploy` as step 4b, soft-fail. In practice `sanity deploy` prompts
interactively for a hostname on a fresh project, which would leave bootstrap waiting on stdin
with no explanation. So bootstrap asks first (`y/N`, default no) and records `skipped`. Nothing
downstream depends on a hosted Studio; the Context app does not require one.

### Two Track 2 fields on `menuItem`, market axis, field-level

`description: {base, nyc, austin, chicago}` and a flat `allergenCallout: text`. Market rather than
language so the room can read and judge the AI step's output; field-level rather than
document-level so the menu item count stays 20 and every verified answer holds. The callout is
deliberately not per-market: the cross-contact statement is reproduced verbatim, so there is
nothing to vary. _Marketing copy localizes; a safety statement doesn't._ Both ship empty in the
seed.

### The blueprint filter is the recursion guard from day one

`draft-menu-copy` fires on `_type == "menuItem" && !defined(description.base)`. In Mission 2-1 it
is log-only, so the guard costs nothing; in Mission 2-2 the Function starts writing
`description.base` and the guard is what stops it re-triggering on its own patch.

### `verify` has an offline mode that CI runs

Every seed assertion is computed twice: from the `.ndjson` (offline, no project) and via GROQ
(online). CI runs the offline mode, so a PR cannot quietly break a mission's expected answer, and
so `sanity-template-validate` isn't the only thing standing between the repo and a broken room.

### `.mcp.json` is unscoped

The Sanity MCP server at `mcp.sanity.io` has no per-project scoping in its config; the spec's
"bootstrap patches it" idea has nothing to patch. Instead `AGENTS.md` tells the agent what the
server is for and `studio/.env` tells it which project.

### Bootstrap prompts for the org ID and org token but cannot create them

Enabling Context for an organization and minting an organization API token are Dashboard
actions with no CLI path. They belong in the pre-flight email. Bootstrap asks, writes what it
gets, and prints the Manage path and exact permission name (_Context Viewer_) when either is
missing, because a missing org token reads as a broken connection rather than a missing
credential.

## Verified on a throwaway project — 2026-09-06

Project `df1g2lrd` in the "bree test" org, created with `sanity projects create`, bootstrap run
twice.

| Measurement                            | First run (fresh) | Second run (idempotent) |
| -------------------------------------- | ----------------- | ----------------------- |
| Whole bootstrap                        | 137s              | 66s                     |
| Dataset Embeddings (`--wait`, 83 docs) | 28s               | 12s (already enabled)   |
| Blueprint deploy                       | 85s               | 36s                     |
| Schema deploy                          | 7s                | 8s                      |
| Seed import                            | 2s                | 1s                      |

- **Embeddings are seconds, not minutes.** No need to move them into the pre-flight.
- **The blueprint deploy is the long pole** at more than half of a fresh run. If the 10-minute
  window is tight in rehearsal, this is the step to split into `bootstrap:track2`.
- **The Workflows deploy is not gated.** `sanity-workflows deploy --tag production` on the fresh
  project created `menu-item-review v1` with only the `sanity login` session. Mission 2-4 needs
  no enablement ask. (The spike's definition files were removed afterward; writing them is the
  mission.)
- `pnpm verify` passes online against the bootstrapped dataset, including `Embeddings ready`.
- The stub route streams the "not connected yet" reply; the menu page renders the 18 published
  items (the deprecated Summer Peach and internal Winter Miso bowls correctly absent).
- The stubbed Function runs locally via `sanity functions test` and logs the item and its recipe.

## Open

- **Whether to split bootstrap** into a Track 1 fast path and `bootstrap:track2` for the blueprint
  deploy. The measurements above say it would roughly halve a fresh run. Decide after a timed dry
  run on conference-speed wifi.
- **The real `pnpm create sanity@latest --template` command** has not been exercised — the repo
  is not yet pushed. It pulls the repo, runs `sanity init`, writes `.env` files, and initialises
  git; a local clone exercises none of that. Test it from a directory that isn't the working copy,
  as a second Sanity account with Context _not_ enabled.
