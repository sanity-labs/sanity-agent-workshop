# Sanity Agent Workshop — Green & Gather

**This starter ships deliberately unfinished.** It is the starting point for a workshop, and the
parts you build are the lessons.

A Sanity Studio, an 83-document seed, and a Next.js shell for **Green & Gather**, a fictional
fast-casual bowls-and-wraps chain. Everything that is not a lesson is done for you. Everything that
is a lesson is a visible, labeled stub:

| Stub              | Where                                                            | Built in |
| ----------------- | ---------------------------------------------------------------- | -------- |
| The agent         | `app/app/api/agent/route.ts` — replies _"not connected yet"_     | Track 1  |
| The guest signals | `app/lib/loyalty.ts` — two hard-coded guests, one peanut allergy | Track 1  |
| The Function body | `functions/draft-menu-copy/index.ts` — logs and returns          | Track 2  |

The full course, with a lesson for every mission, is on Sanity Learn:
[Ship an agent or agentic workflow on Sanity](https://www.sanity.io/learn/course/agents-and-agentic-workflows).
The **agent kit** that drives the build ships in this repo: ten missions with paste-ready prompts in
[`missions/`](missions/README.md), what a correct result looks like in
[`checkpoints/`](checkpoints/README.md), and the skills your coding agent loads in
[`skills/`](skills/). Working from the repo alone, start at [`missions/README.md`](missions/README.md).

## Setup

```sh
pnpm create sanity@latest --template sanity-labs/sanity-agent-workshop
```

The CLI asks for a **project name** and creates a new Sanity project and dataset for you. It puts
the repo in a folder named after that project (it prints the path when it finishes), writes the
env files, adds the CORS origin, installs dependencies, and makes a first git commit.

The CLI finishes by suggesting `pnpm dev`. This starter has **one more step before that**. Bootstrap
seeds your dataset, deploys the schema, and mints the tokens the app needs. Change into the folder
the CLI printed and run:

```sh
cd <the folder the CLI printed>
pnpm bootstrap
pnpm dev
```

Then open <http://localhost:3000/chat> and send a message. **The agent replies "I'm not connected
yet."** That is the expected reply: the app is running against your project, and connecting the
agent to your content is Mission 1-1.

### Before setup: two things bootstrap cannot do

Both are Dashboard actions with no CLI path. Bootstrap prompts for the values but cannot create
them.

1. **Enable Context for your organization.** [sanity.io/manage](https://www.sanity.io/manage) →
   your organization → **Apps** → enable **Context**.
2. **Create an organization API token** with **Context Viewer** permissions. Same organization →
   **API** → **Tokens**. It has to be an organization token; a project token is refused with
   `403 contextGrantRequired`. Copy your organization ID while you are there.

You also need Node 22.12 or later, pnpm 10, a Sanity account logged in on the CLI
(`npx sanity login`), and an Anthropic API key. Bootstrap asks for the key and lets you skip it and
add it later.

### What bootstrap does

`pnpm bootstrap` runs `studio/scripts/bootstrap.ts`. Every step is try/caught, so a partial run
still leaves a usable repo, and the summary prints a manual command for anything that failed.

| #   | Step                                              | Notes                                                          |
| --- | ------------------------------------------------- | -------------------------------------------------------------- |
| 1   | Write project ID + dataset to `app/.env.local`    |                                                                |
| 2   | Prompt for Anthropic key                          | Skippable                                                      |
| 2b  | Prompt for organization ID + org token            | Skippable, and clear about why you need them                   |
| 3   | Add CORS origin `http://localhost:3000`           |                                                                |
| 4   | `sanity schema deploy`                            | Required for a Context MCP in GROQ mode                        |
| 4b  | `sanity deploy`                                   | Hosts the Studio. Soft-fail; nothing else depends on it        |
| 5   | Import the 83-document seed                       |                                                                |
| 6   | Make the dataset private                          | Mission 1-6's `groqFilter` is only honest on a private dataset |
| 7   | Create a project read token → `SANITY_READ_TOKEN` | Renders the menu page. The agent uses the organization token   |
| 8   | Enable Dataset Embeddings (`--wait`)              | Mission 1-2's semantic question needs this                     |
| 9   | Deploy the blueprint                              | Track 2 plumbing; soft-fail                                    |
| 10  | `pnpm install`                                    | Blueprint deploy can disturb `node_modules`                    |
| 11  | `pnpm typegen`                                    | Optional; the shell does not depend on it                      |

Bootstrap leaves five things for the missions: the Context MCP endpoint, the MCP URL in env, the
knowledge base (you build it from `kb/README.md`), `groqFilter`, and the Function body.

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
kb/              The knowledge base recipe (start it after 1-1, finish it in 1-3) + the four files to upload
workflows/       Notes on the Workflows engine, for Mission 2-4
```

Ports: Studio **3333**, app **3000**, Functions emulator **8080**.

## Scripts

| Command                                                                                | Does                                                                          |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `pnpm dev`                                                                             | Studio + app + Functions emulator, concurrently                               |
| `pnpm bootstrap`                                                                       | One-time project setup (see above)                                            |
| `pnpm build`                                                                           | Build every workspace                                                         |
| `pnpm verify`                                                                          | Asserts the seed still answers every mission correctly, against your dataset  |
| `pnpm verify:offline`                                                                  | Same checks from the seed file + schema, no project needed (CI runs this)     |
| `pnpm seed:reset`                                                                      | Re-import the seed with `--replace`. One command back to known-good data      |
| `pnpm typegen`                                                                         | Sanity TypeGen → `packages/@starter/sanity-types/sanity.types.ts`             |
| `pnpm skills:sync` · `pnpm skills:check`                                               | Copy `skills/` → `.claude/skills/` after editing a skill · confirm they match |
| `pnpm lint` · `pnpm format` · `pnpm format:check` · `pnpm typecheck` · `pnpm validate` | The gate CI runs                                                              |

## The two tracks

**Track 1 · Build an agent that answers from your content.** A menu concierge that answers
allergen and dietary questions from the menu, the linked recipes, and a knowledge base built from
policy docs and supplier sheets. Context MCP · GROQ · Knowledge Bases · `groqFilter`.

**Track 2 · Build a content process that runs itself.** A Function that fires on a new menu item,
drafts the description and allergen callout from the recipe, adapts the copy per market, and
holds the item for a person to sign off. Functions · Agent Actions · Blueprints · Workflows.

Both tracks answer one question: what should an agent be able to find, and what should it be
allowed to do?

## The seed decides every answer

`studio/seed/green-and-gather.ndjson` is 83 documents, no assets, and imports in seconds. Every
mission's expected answer depends on it, so read [`studio/seed/README.md`](studio/seed/README.md)
before changing a price. Three things the missions rely on:

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
| `SANITY_ORGANIZATION_ID`, `SANITY_ORGANIZATION_TOKEN`         | `app/.env.local` | bootstrap (prompt); you create them in Manage    |
| `SANITY_CONTEXT_MCP_URL`                                      | `app/.env.local` | **you, Mission 1-1**                             |
| `SANITY_CONTEXT_KB_URL`                                       | `app/.env.local` | **you, Mission 1-3** (built from `kb/README.md`) |

## If something is wrong

- **The agent cannot see any content.** Check your organization token before your code. A
  missing or project-scoped token looks like a broken connection.
- **The menu page is empty.** `pnpm bootstrap` has not run yet (the CLI's closing message does not
  know about it). Stop the dev server, `pnpm bootstrap`, then `pnpm dev`. Bootstrap is safe to re-run.
- **The template command fails with "Duplicate origin already exists".** You pointed it at a
  project that already has a `localhost:3000` CORS origin, usually from an earlier attempt. Let it
  create a new project instead, or delete that origin under Manage → API → CORS origins and re-run.
- **Semantic ranking looks random.** `cd studio && npx sanity datasets embeddings status
production`. A status of `updating` returns incomplete rankings with no error.
- **Counts are wrong after Track 2.** `pnpm seed:reset`.
- **`pnpm verify` fails and you are on your own content.** Expected. It asserts the Green & Gather
  seed's specific answers.

## Using your coding agent here

The repo ships a project-scoped `.mcp.json` for the [Sanity MCP server](https://www.sanity.io/docs/ai/mcp-server),
so Claude Code offers it on session start. Use it for reading schema and inspecting documents while
you build. Answering the workshop's content questions through it bypasses the agent you are
building, which is why every mission prompt says to run against the app instead.
[`AGENTS.md`](AGENTS.md) carries the rules of engagement, including how your agent submits feedback
on the workshop; other agents read the same file.
