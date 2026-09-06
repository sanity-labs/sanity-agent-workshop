# Sanity Agent Workshop — Green & Gather

**This is a workshop starter, not a production starter. It ships deliberately unfinished.**

A Sanity Studio, an 83-document seed, and a Next.js shell for **Green & Gather**, a fictional
fast-casual bowls-and-wraps chain. Everything that isn't a lesson is done for you. Everything that
_is_ a lesson is a visible, labeled stub:

| Stub              | Where                                                            | Built in |
| ----------------- | ---------------------------------------------------------------- | -------- |
| The agent         | `app/app/api/agent/route.ts` — replies _"not connected yet"_     | Track 1  |
| The guest signals | `app/lib/loyalty.ts` — two hard-coded guests, one peanut allergy | Track 1  |
| The Function body | `functions/draft-menu-copy/index.ts` — logs and returns          | Track 2  |

You take this repo away and keep building on it. The **agent kit** that drives the build is in the
repo: ten missions with paste-ready prompts in [`missions/`](missions/README.md), what a correct
result looks like in [`checkpoints/`](checkpoints/README.md), and the skills your coding agent
loads in [`skills/`](skills/). Start at [`missions/README.md`](missions/README.md).

## Setup

```sh
pnpm create sanity@latest --template sanity-labs/sanity-agent-workshop
```

The CLI asks for a **project name** and creates a new Sanity project and dataset for you. It puts
the repo in a folder named after that project name (it prints the path when it finishes), writes
the env files, adds the CORS origin, installs dependencies, and makes a first git commit.

The CLI finishes by suggesting `pnpm dev`. This starter has **one more step before that**: bootstrap
seeds your dataset, deploys the schema, and mints the tokens the app needs. Change into the folder
the CLI printed and run:

```sh
cd <the folder the CLI printed>
pnpm bootstrap
pnpm dev
```

Then open <http://localhost:3000/chat> and send a message.

**Setup succeeded when it replies "I'm not connected yet."** That stub reply is the deliverable
of setup. The shell is given; the agent is what you build.

### Before you arrive (the two things bootstrap cannot do)

Both are Dashboard actions with no CLI path. Bootstrap prompts for the values but cannot create
them.

1. **Enable Context for your organization** — [sanity.io/manage](https://www.sanity.io/manage) →
   your organization → **Apps** → enable **Context**.
2. **Create an organization API token** with **Context Viewer** permissions — same org → **API**
   → **Tokens**. An _organization_ token, not a project token: a project token is refused with
   `403 contextGrantRequired`. Copy your organization ID while you're there.

Also: Node 20.19+ or 22.12+, pnpm 10, a Sanity account logged in on the CLI (`npx sanity login`),
and an Anthropic API key if you have one. Keys are available in the room if you don't.

### What bootstrap does

`pnpm bootstrap` runs `studio/scripts/bootstrap.ts`. Every step is try/caught and a partial run
still leaves a usable repo — the summary prints a manual command for anything that failed.

| #   | Step                                              | Notes                                                          |
| --- | ------------------------------------------------- | -------------------------------------------------------------- |
| 1   | Write project ID + dataset to `app/.env.local`    |                                                                |
| 2   | Prompt for Anthropic key                          | Skippable                                                      |
| 2b  | Prompt for organization ID + org token            | Skippable, but loud about why you need them                    |
| 3   | Add CORS origin `http://localhost:3000`           |                                                                |
| 4   | `sanity schema deploy`                            | Required for a Context MCP in GROQ mode                        |
| 4b  | `sanity deploy`                                   | Opt-in prompt; nothing depends on it                           |
| 5   | Import the 83-document seed                       |                                                                |
| 6   | Make the dataset private                          | Mission 1-6's `groqFilter` is only honest on a private dataset |
| 7   | Create a project read token → `SANITY_READ_TOKEN` | For rendering the menu. Not the agent's token                  |
| 8   | Enable Dataset Embeddings (`--wait`)              | Mission 1-2's semantic question needs this                     |
| 9   | Deploy the blueprint                              | Track 2 plumbing; soft-fail                                    |
| 10  | `pnpm install`                                    | Blueprint deploy can disturb `node_modules`                    |
| 11  | `pnpm typegen`                                    | Optional; the shell doesn't depend on it                       |

**Deliberately absent, because they are the lessons:** no Context MCP endpoint, no MCP URL in
env, no Knowledge Base (you build it — `kb/README.md`), no `groqFilter`, no Function body.

## Workspaces

```
studio/          Sanity Studio v6 — schema, seed, desk structure, bootstrap + verify scripts
app/             Next.js 16 shell — menu page (works), chat UI (works), agent route (STUB)
functions/       Sanity Functions — draft-menu-copy (STUB)
packages/        @starter/eslint-config · @starter/tsconfig · @starter/sanity-types (generated)
skills/          The agent kit's skills: four sanity-workshop-* skills + the public Sanity Context skills
.claude/skills/  Committed copy of skills/ that Claude Code discovers (pnpm skills:sync)
missions/        Ten mission briefs with paste-ready prompts, the track overview, make-it-yours
checkpoints/     What a correct result looks like, one per mission. No code
kb/              The Knowledge Base recipe (you build it in 1-1/1-3) + the four files to upload
workflows/       The Workflows engine, for Track 2's last mission
```

Ports: Studio **3333**, app **3000**, Functions emulator **8080**.

## Scripts

| Command                                                          | Does                                                                         |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `pnpm dev`                                                       | Studio + app + Functions emulator, concurrently                              |
| `pnpm bootstrap`                                                 | One-time project setup (see above)                                           |
| `pnpm verify`                                                    | Asserts the seed still answers every mission correctly, against your dataset |
| `pnpm verify:offline`                                            | Same checks from the seed file + schema, no project needed (CI runs this)    |
| `pnpm seed:reset`                                                | Re-import the seed with `--replace`. One command back to known-good data     |
| `pnpm typegen`                                                   | Sanity TypeGen → `packages/@starter/sanity-types/sanity.types.ts`            |
| `pnpm skills:sync`                                               | Copy `skills/` → `.claude/skills/`. Run after editing a skill                |
| `pnpm lint` · `pnpm format` · `pnpm typecheck` · `pnpm validate` | The gate CI runs                                                             |

## The two tracks

**Track 1 · Build an agent that answers from your content.** A menu concierge that answers
allergen and dietary questions from the menu, the linked recipes, and a Knowledge Base built from
policy docs and supplier sheets. Context MCP · GROQ · Knowledge Bases · `groqFilter`.

**Track 2 · Build a content process that runs itself.** A Function that fires on a new menu item,
drafts the description and allergen callout from the recipe, adapts the copy per market, and
holds the item for a human to sign off. Functions · Agent Actions · Blueprints · Workflows.

One theme: _an agent is only as good as what it can find and what it's allowed to do._

## The seed is load-bearing

`studio/seed/green-and-gather.ndjson` — 83 documents, no assets, imports in seconds. Every
mission's expected answer depends on it. Read [`studio/seed/README.md`](studio/seed/README.md)
before changing a price. Three rules that make or break the missions:

1. **No `spicy` field, no `heaviness` field.** Heat and heft live only in `body` prose.
2. **`vegan` is hand-set in `dietaryFlags`**, never derived from the recipe.
3. **`menuItem.allergens` is what the menu declares.** `ingredient.allergenTags` is the real
   picture. They disagree on four items, on purpose.

`pnpm verify` asserts all of this. Run it after any schema or seed change.

## Environment variables

Per workspace, no cascading. Every `.env.example` documents its own file.

| Var                                                           | Workspace        | Set by                                           |
| ------------------------------------------------------------- | ---------------- | ------------------------------------------------ |
| `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`           | `studio/.env`    | `sanity init --template`                         |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | `app/.env.local` | bootstrap                                        |
| `SANITY_READ_TOKEN`                                           | `app/.env.local` | bootstrap                                        |
| `ANTHROPIC_API_KEY`                                           | `app/.env.local` | bootstrap (prompt)                               |
| `SANITY_ORGANIZATION_ID`, `SANITY_ORGANIZATION_TOKEN`         | `app/.env.local` | bootstrap (prompt) — you create them in Manage   |
| `SANITY_CONTEXT_MCP_URL`                                      | `app/.env.local` | **you, Mission 1-1**                             |
| `SANITY_CONTEXT_KB_URL`                                       | `app/.env.local` | **you, Mission 1-3** (built from `kb/README.md`) |
| `SANITY_CONTEXT_KB_TOKEN`                                     | `app/.env.local` | only if you fall back to the shared KB           |

## If something is wrong

- **The agent can't see any content** → check your org token before your code. A missing or
  project-scoped token reads as a broken connection, not a missing credential.
- **The Context app won't load or errors for your organization** → use **Plan B**: the legacy
  project-addressed endpoint. Bootstrap wrote its URL to `app/.env.local` as
  `SANITY_CONTEXT_MCP_URL_FALLBACK`. Copy that value into `SANITY_CONTEXT_MCP_URL`, set
  `SANITY_CONTEXT_MCP_TOKEN` to your `SANITY_READ_TOKEN`, and make sure your Studio is deployed
  (`cd studio && npx sanity deploy`). Same four GROQ tools; `?instructions=` and `?groqFilter=`
  go on the URL instead of in the app. See `missions/1-1-point-an-agent-at-your-content.md`.
- **The menu page is empty** → `pnpm bootstrap` hasn't run yet (the CLI's closing message doesn't
  know about it). Stop the dev server, `pnpm bootstrap`, then `pnpm dev`. Bootstrap is safe to re-run.
- **The template command fails with "Duplicate origin already exists"** → you pointed it at a
  project that already has a `localhost:3000` CORS origin, usually from an earlier attempt. Let it
  create a new project instead, or delete that origin under Manage → API → CORS origins and re-run.
- **Semantic ranking looks random** → `cd studio && npx sanity datasets embeddings status
production`. A status of `updating` returns incomplete rankings with no error.
- **Counts are wrong after Track 2** → `pnpm seed:reset`.
- **`pnpm verify` fails and you're on your own content** → expected. It asserts the Green &
  Gather seed's specific answers.

## Using your coding agent here

The repo ships a project-scoped `.mcp.json` for the [Sanity MCP server](https://www.sanity.io/docs/ai/mcp-server),
so Claude Code offers it on session start. It is for **reading schema and inspecting documents
while you build** — not for answering the workshop's content questions, which bypasses the agent
you're building. [`AGENTS.md`](AGENTS.md) carries the rules of engagement; other agents read the
same file.
