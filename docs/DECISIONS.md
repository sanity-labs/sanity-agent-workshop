# Decisions

The record of what was decided while building this starter, and why. Newest first within each
section. The planning documents this was built from (STARTER-SPEC, PLAN, TRACKS, BUILD) live
outside the repo; this file carries only what someone maintaining the repo needs.

## Scope

### The starter ships as a shell. Skills, missions, and checkpoints come in a later pass. — 2026-09-06

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

### Studio v6 with `@sanity/ui` pinned to 4.x — 2026-09-06

Both products the workshop teaches need v6: `@sanity/workflow-studio-plugin@0.31.0` peers on
`sanity ^6.3.0`, and Context v2 endpoints need a deployed v6 schema. Verified co-installing on
`sanity@6.12.0` with all eight `@sanity/workflow-*@0.31.0` and `@sanity/sdk@2.20.2`.

Without an explicit pin pnpm floated `@sanity/ui` to a 5.0 alpha, because the workflow packages
peer on `^3.3` and Studio depends on `^4`. Pinned `^4.0.7` in the catalog. The remaining peer
warnings (workflow packages wanting ui 3.x; `@sanity/workbench` alpha wanting sdk 3.x) are
unsatisfiable simultaneously and harmless.

**Do not bump `@sanity/sdk` to 3.x** while the workflow plugin peers on `^2.12`.

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

## Open

- **Embeddings generation time on a fresh 83-doc project.** Bootstrap uses `--wait`; time it in
  the dry run. If it is minutes rather than seconds, move it earlier or into the pre-flight.
- **Workflows deploy on a fresh account.** The CLI README says "early access, restricted". A
  20-minute spike on a throwaway project settles whether Mission 2-4 needs an enablement ask.
- **Whether to split bootstrap** into a Track 1 fast path and `bootstrap:track2` for the
  blueprint deploy. Decide after the first timed dry run.
