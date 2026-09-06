# Sanity Agent Workshop — agent instructions

Workshop starter for **Green & Gather**, a fictional restaurant chain. A Sanity Studio v6, an
83-document seed, and a Next.js shell with a **deliberately stubbed** agent route. Attendees
build the agent (Track 1) or an automated content pipeline (Track 2) on top of this. Full
picture in `README.md`.

## Quick start

pnpm install && pnpm bootstrap && pnpm dev

`bootstrap` (`studio/scripts/bootstrap.ts`) deploys the schema, imports the seed, makes the
dataset private, mints a read token, enables embeddings, deploys the blueprint, and writes env
files. `dev` runs studio (:3333), app (:3000), and the Functions emulator (:8080).

## Workspaces

| Workspace            | What it is                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| `studio/`            | Studio v6 — 10 schema types on a shared required-field contract, seed, structure                              |
| `app/`               | Next.js 16 — menu page, chat UI, and the STUBBED `app/api/agent/route.ts`                                     |
| `functions/`         | `draft-menu-copy`, a STUBBED `documentEventHandler` (logs and returns)                                        |
| `packages/@starter/` | Shared eslint-config, tsconfig, generated sanity-types                                                        |
| `skills/`            | The agent kit's skills: four `sanity-workshop-*` skills plus the three public Sanity Context skills, vendored |
| `.claude/skills/`    | Committed copy of `skills/` for Claude Code discovery. Keep in sync: `pnpm skills:sync`                       |
| `missions/`          | Ten mission briefs with paste-ready prompts, a track overview (`README.md`), and `make-it-yours.md`           |
| `checkpoints/`       | What a correct result looks like, one per mission. No code. Don't read unless asked                           |

## Rules of engagement — read these before touching anything

These exist because a genuinely helpful agent will otherwise do the lesson instead of the
learner. That is the failure mode this repo is designed against.

1. **One mission at a time. Never implement a mission the developer hasn't opened.** If asked
   to "finish the track", stop and ask which mission they are on.
2. **Never read `checkpoints/` unless asked.** It holds expected outcomes, not solutions, and it
   is for the developer to self-verify — reading it ahead of time is how you end up steering toward
   an answer instead of building one.
3. **When asked "why is this wrong?", diagnose, don't fix.** Point at the tool call, the GROQ,
   the field, or the log line. Let them make the change.
4. **Never add a `spicy`, `heat`, `heaviness`, or derived `vegan` / `isVegan` field.** Heat and
   heft live in `body` prose by design; `vegan` is hand-set in `dietaryFlags`. Mission 1-2's
   semantic question depends on the absence of these fields. `pnpm verify` will catch you.
5. **Never denormalize allergen data onto `menuItem`.** `menuItem.allergens` is what the menu
   _declares_; the real picture is one hop away in `recipe → ingredient.allergenTags`. That
   multi-hop traversal is the lesson in Missions 1-2, 1-3, and 2-2.
6. **For Track 1 missions, exercise the app at `localhost:3000`. Do not answer content questions
   with your own Sanity tools.** You have the Sanity MCP server (`.mcp.json`) — use it to read
   the schema and inspect documents _while you build_. Answering "what vegan bowls are under $12
   in Austin?" yourself bypasses the thing being built.
7. **Never write the guest profile into Sanity or the schema.** `app/lib/loyalty.ts` is a stub
   for a CRM. Signals ride on top, server-side, injected into the system prompt — not stored as
   documents and not turned into a per-user `groqFilter`.
8. **`allergenCallout` stays a single `text` field.** The cross-contact statement must be
   reproduced verbatim, so there is nothing to localize. `description` is the per-market object.
9. **Never edit `studio/seed/green-and-gather.ndjson` to make an answer come out differently.**
   If a mission's expected answer looks wrong, that's a finding to report, not a file to patch.
10. **After any schema or seed change, run `pnpm verify`** (or `pnpm verify:offline` without a
    project). **After editing anything in `skills/`, run `pnpm skills:sync`.**

## Missions and skills

The developer works from `missions/<track>-<n>-<slug>.md`, pasting its **Prompt** block to you.
Each prompt names the skill to load. Use these four for the workshop's own material and the
vendored public skills for product depth:

| Skill                                                                       | Missions           | Covers                                                                                                                                                      |
| --------------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sanity-workshop-context-groq`                                              | 1-1, 1-2, 1-5, 1-6 | Wiring the route, retrieval modalities, personalization, `groqFilter`                                                                                       |
| `sanity-workshop-knowledge-bases`                                           | 1-3, 1-4           | The shared KB as a second source; routing                                                                                                                   |
| `sanity-workshop-functions-agent-actions`                                   | 2-1, 2-2, 2-3      | The Function, Generate, Transform, the stop condition                                                                                                       |
| `sanity-workshop-workflows-engine`                                          | 2-4                | `defineWorkflow`, deploy, the human gate                                                                                                                    |
| `create-agent-with-sanity-context`, `dial-your-context`, `shape-your-agent` | any                | Public Sanity Context skills. Note: they still document Context **v1** (Studio plugin, project-addressed URL); the workshop skills carry the v2 corrections |

`missions/README.md` says where each track is headed, so you know the destination without
running ahead to it.

## Architecture constraints

- **Sanity Context v2.** MCP endpoints are created in the **Context app** (Dashboard), are
  **organization-addressed** — `https://api.sanity.io/v1/context/organizations/<orgId>/mcp/<name>`
  — and authenticate with an **organization** API token carrying Context Viewer permissions. A
  project token is refused with `403 contextGrantRequired`. The Studio plugin from `@sanity/context`
  v1 is deprecated; do not add it. The documented client is `createMCPClient` from `@ai-sdk/mcp`.
- A GROQ-mode MCP serves `initial_context` and `groq_query` (plus `schema_explorer`). Exact
  filters, `text::query()` keyword ranking, and `text::semanticSimilarity()` inside `score()`
  are all GROQ the agent writes inside one `groq_query` call — the observable signal is the GROQ
  text, not the tool name.
- The dataset is **private**; `SANITY_READ_TOKEN` renders the menu server-side only. Nothing
  secret in `NEXT_PUBLIC_*`.
- **The chat UI is done.** `app/components/ChatPanel.tsx` uses `useChat` and renders text parts
  as markdown and tool parts as a trace. The stub route already streams UI messages, so wiring
  the agent means replacing the body of `route.ts` with `streamText(...).toUIMessageStreamResponse()`
  — the component should not need to change for Missions 1-1 through 1-4.
- Dataset Embeddings are enabled by bootstrap with a type-specific projection. If semantic
  ranking looks random, check `sanity datasets embeddings status` first: `updating` returns
  incomplete rankings with no error.
- `sanity.config.ts` already registers `workflowStudioPlugin` with a mapping to a definition
  named `menu-item-review` that does not exist until Mission 2-4 deploys it. The empty Workflows
  tab until then is intended. The eight `@sanity/workflow-*` packages are pinned exact at one
  version; bump them together or not at all.
- **`sanity` is pinned to the 6.9 line on purpose.** Studio 6.10+ uses `@sanity/ui@4`, which
  removed exports the 0.31.0 workflow packages import; `sanity build` fails. Do not bump `sanity`
  or `@sanity/ui` independently of the workflow packages; test with `pnpm --filter studio build`,
  not just install.
- `sanity.blueprint.ts` filters `draft-menu-copy` on `!defined(description.base)` as the
  recursion guard for when Mission 2-2 starts writing that field.

## Monorepo

- `pnpm`, not `npm`; run workspace commands from root via `pnpm --filter <pkg>`
- Each workspace has its own `.env` / `.env.local` — nothing cascades from root
- Shared versions live in the `catalog:` in `pnpm-workspace.yaml`
- ESM-first, TypeScript strict, no semicolons, single quotes, no bracket spacing (`oxfmt`)

## Gate before committing

pnpm run format:check && pnpm run lint && pnpm run typecheck && pnpm run validate && pnpm run verify:offline

## Not using Claude Code?

Everything above applies to any coding agent. Configure the Sanity MCP server for your client
per <https://www.sanity.io/docs/ai/mcp-server>; skills in `skills/` are plain Markdown you can
paste as context.
