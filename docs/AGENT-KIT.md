# Where the agent kit goes

The missions, prompts, skills, and checkpoints are being written in a separate pass, tied to the
missions themselves. This page is the contract for that pass: where each piece lives, what shape
it takes, and what is already wired up waiting for it. Nothing here needs to be invented; it needs
to be filled in.

## The four parts, one job each

| Part            | Job                                                                           | Read by                                | Lives at                                      |
| --------------- | ----------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------- |
| **Prompts**     | Kick the work off. Short, stable, carry the constraints                       | The developer copies it                | Inline in each mission file, one fenced block |
| **Skills**      | Carry the depth — how Context MCP, KBs, Functions and Workflows actually work | The agent, when it needs to know _how_ | `skills/<name>/`                              |
| **Missions**    | The brief around the prompt: goal, done-when, where to look                   | Both                                   | `missions/<track>-<n>-<slug>.md`              |
| **Checkpoints** | What a correct result looks like. No code                                     | The developer, when unsure             | `checkpoints/<track>-<n>.md`                  |

**The governing split:** _the prompt says what to build and what not to do; the skill says how the
product works._ Product churn between now and GA touches skills, not ten mission files.

## Skills

### One per body of knowledge, not one per mission

```
skills/
  sanity-context-groq/            Missions 1-1, 1-2, 1-5, 1-6
    SKILL.md
    references/
      retrieval-modalities.md
      groq-filter-and-scope.md
      instructions-field.md
  sanity-knowledge-bases/         Missions 1-3, 1-4 (routing lives here — it only exists once a second source does)
    SKILL.md
    references/
  sanity-functions-workflows/     Missions 2-1 … 2-4
    SKILL.md
    references/
```

A per-mission skill would fire ten times for one concept. `SKILL.md` stays short; `references/`
carries the detail and is pulled in on demand.

### Skill shape

```markdown
---
name: sanity-context-groq
description: <trigger-accurate — the agent picks a skill from this line alone>
---

# <Title>

<the core how-to, a screen or two>

## References

- [retrieval-modalities.md](references/retrieval-modalities.md) — …
```

**Descriptions must be trigger-accurate.** A vague description means the wrong skill loads
mid-mission.

### Authored vs. discovered — already wired

| Path                     | Role                                                                                    |
| ------------------------ | --------------------------------------------------------------------------------------- |
| `skills/<name>/`         | **Authored source.** Publishable later via `npx skills add <repo>`.                     |
| `.claude/skills/<name>/` | **Committed copy.** Claude Code discovers it on session start — zero steps, no network. |
| `pnpm skills:sync`       | Copies `skills/` → `.claude/skills/`. Run before committing a skill change.             |
| `pnpm skills:check`      | Fails if they differ. **CI runs this.**                                                 |

Committing the copy instead of installing at bootstrap costs a duplicated directory and removes
a network call from the 10-minute setup window. `.gitignore` already un-ignores `.claude/`
(only `settings.local.json` is ignored). Non-Claude-Code agents read `skills/` directly;
`AGENTS.md` says so.

### Relationship to the official Sanity skills

`sanity-io/context` publishes three skills — `create-agent-with-sanity-context`,
`dial-your-context`, `shape-your-agent`. The Sanity docs point at them directly. The workshop
skills should be **thin wrappers that add the Green & Gather specifics and the mission
constraints, and link to the official ones for product mechanics.** Read those three first and
write against the gap, not a parallel set that drifts.

Decide at authoring time whether to vendor the official three into `skills/` (pin a hash in a
`skills-lock.json` at root) or to have `AGENTS.md` tell the agent to run
`npx skills add sanity-io/context --all`. Vendoring is safer for the room. Note the vendored
copies currently in circulation still document Context **v1** (Studio plugin, project-addressed
URL); check the upstream has caught up to v2 before pinning.

### What the skills must not contain

The wired `route.ts`. A finished implementation three lines below the stub is an answer, and so
is a reference file an agent can find and copy. The wiring pattern lives in
`skills/sanity-context-groq/references/` as _documentation of how `@ai-sdk/mcp` works_, so the
agent writes the code rather than lifting it.

## Missions

`missions/1-1-point-an-agent-at-your-content.md` … `missions/2-4-add-a-human-gate.md`, plus
`missions/make-it-yours.md` for people bringing their own content. Five blocks:

```markdown
# Mission 1-2 · See every way it can search

**Goal** — one sentence.

**Prompt** — one fenced block. Copy this. Includes the constraints.

**Done when** — an _observation_, never an artifact.

**If stuck** — one nudge, then checkpoints/1-2.md.

**Going deeper** — the relevant skill and the official Sanity docs.
```

The Learn course renders the same fenced block, so there is one source and no drift.

### Constraints every prompt carries

Every **Track 1** prompt:

> `Run this against the app at localhost:3000 — not through your own Sanity tools.`

Developers' agents have the Sanity MCP server (`.mcp.json`). Without that line an agent asked
"what vegan bowls are under $12 in Austin?" answers it — correctly — without the built agent ever
being involved. Mission 1-2 additionally ends with `Do not change any code. Just report.`

**Write prompts to be edited.** "Tweak the prompt to use your own data" only works if the prompt
names its assumptions inline — which dataset, which question, which field.

### Mission ↔ repo seam map

| Mission | Touches                                                             | Already in place                                                                                |
| ------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 1-1     | `app/app/api/agent/route.ts`, `SANITY_CONTEXT_MCP_URL`              | Stub route, env slot with the URL shape, `@ai-sdk/mcp` installed, ChatPanel renders tool traces |
| 1-2     | nothing — observe                                                   | Embeddings enabled by bootstrap with a type-specific projection                                 |
| 1-3     | `route.ts`, `SANITY_CONTEXT_KB_URL`                                 | Env slot, `kb/README.md`                                                                        |
| 1-4     | tool descriptions, system prompt                                    | —                                                                                               |
| 1-5     | `route.ts` reads `guestId` → `app/lib/loyalty.ts`                   | Stub with two guests; ChatPanel sends `guestId` in the body                                     |
| 1-6     | `groqFilter` on the endpoint (Context app)                          | Private dataset; Winter Miso Bowl seeded `status: internal`                                     |
| 2-1     | run `functions/draft-menu-copy`                                     | Stub handler, blueprint, `sanity functions dev` in `pnpm dev`                                   |
| 2-2     | handler body                                                        | `description.base` + `allergenCallout` fields, empty in seed                                    |
| 2-3     | handler body                                                        | `description.{nyc,austin,chicago}`; the four declared-vs-traversed items                        |
| 2-4     | `studio/workflows/menu-item-review.ts`, `studio/sanity.workflow.ts` | Plugin registered with `autoStart` mapping to `menu-item-review`; `workflows/README.md`         |

## Checkpoints, not solutions

`checkpoints/1-1.md` … `checkpoints/2-4.md`. One per mission, all ten. Each states what a correct
result looks like — the tool calls you should see, the shape of the answer, which fields changed,
what the Function log should say — and **no finished code**. When an agent did the typing the
real question is "my agent produced something different, is it right?", and there is nothing here
for an agent to copy.

Each carries the caveat: _this is what's correct if you're still on the Green & Gather seed._

**Sequencing:** checkpoints written before the mission has been run are predictions. Walk 1-1 →
1-3 and 2-1 → 2-2 on the real app, capture the actual tool calls and output, and write from what
you saw.

## Hooks already in AGENTS.md

`AGENTS.md` already says: one mission at a time; never read `checkpoints/` unless asked; diagnose,
don't fix; the forbidden-field and denormalization rules; the `localhost:3000` rule; `pnpm verify`
after schema changes; `pnpm skills:sync` after skill changes. When the kit lands, add a short
"Missions" section pointing at `missions/` and nothing else needs to change.

## The agent dry run

Once the kit is in: hand the repo to a fresh Claude Code session with the Sanity MCP connected and
the skills loaded, and run every mission prompt verbatim. You are testing whether the agent
short-circuits the lesson, not whether the code works. Watch for: answering content questions
with its own Sanity tools, one-shotting past the observation in 1-2, offering a `spicy` field.
Every leak is a constraint to tighten in the prompt.
