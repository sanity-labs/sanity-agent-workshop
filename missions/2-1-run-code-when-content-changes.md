# Mission 2-1 · Run code when content changes

**Goal** — Publish a document and watch code run because of it.

_Three tabs again — **localhost:3333** (Studio), **localhost:3000** (the app), **localhost:8080**
(the Functions emulator) — plus a spare terminal for the log watcher. This track happens in the
Studio and the terminal; the app is only there to show the menu the pipeline feeds._

**Prompt** — copy this:

```
I'm on Mission 2-1 of the Sanity agent workshop (missions/2-1-run-code-when-content-changes.md).
Load the sanity-workshop-functions-agent-actions skill and read AGENTS.md.

functions/draft-menu-copy/index.ts is a stubbed Sanity Function: it logs the menu item and its
recipe reference and returns. sanity.blueprint.ts registers it to fire on menuItem create/update
while description.base is undefined. Bootstrap already deployed the blueprint.

Do not change the handler yet. First build the functions and run it locally against a seeded
document with `sanity functions test`, using gg.menuItem.harissa-chickpea-bowl, and show me the
log line. Then explain what the blueprint's event filter and projection do and why the filter
has `!defined(description.base)` in it. Then start `npx sanity functions logs draft-menu-copy
--watch` in a spare terminal — bootstrap already deployed this Function, and a real publish fires
the deployed copy, not the local emulator — and tell me exactly what to do in the Studio at
localhost:3333 to make it fire. Do not deploy anything.
```

**Done when** — You publish a menu item in the Studio and the same log line lands in the
`functions logs --watch` terminal, without the "(local run)" tail. That line is the deployed
Function reacting to your publish.

The log is this track's tool-call inspector — the equivalent of Track 1's "read the GROQ". Both
tracks open by making the invisible visible; that's what makes them the same workshop.

**While the watcher waits** — open the two files yourself: `functions/draft-menu-copy/index.ts`
and `sanity.blueprint.ts`. The handler is twenty lines that log and return. The blueprint's
`event` block is the three gates your agent just explained — `on`, `filter`, `projection` — and
the comment above `filter` says why the recursion guard is already there. These two files are
everything Missions 2-2 and 2-3 change, so knowing their shape now makes the diffs readable later.

**If stuck** — "No such function" means it isn't built: `pnpm --filter @starter/functions build`.
The directory name must match the blueprint `name`. Nothing in the watcher after a publish? Give it
a few seconds, and check the item you published still has `description.base` empty — the filter
skips items that already have copy. The emulator on port 8080 (part of `pnpm dev`) is a payload
editor for running the handler against a document id by hand; it does **not** receive Studio
publishes. Then `checkpoints/2-1.md`.

**Going deeper** — `skills/sanity-workshop-functions-agent-actions/references/local-dev-and-logs.md` ·
[Sanity Functions](https://www.sanity.io/docs/functions) · [Blueprints](https://www.sanity.io/docs/functions/blueprints)

The recursion guard is already in the filter, and you'll understand why in the next mission: the
moment the Function starts writing `description.base`, its own patch would re-trigger it forever
without that clause.
