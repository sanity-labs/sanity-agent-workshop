# Mission 2-3 · Chain the steps together

**Goal** — Sequence the steps into one automated flow with a stop condition, then prove the stop
condition works.

**Prompt** — copy this:

```
I'm on Mission 2-3 of the Sanity agent workshop (missions/2-3-chain-the-steps-together.md).
Load the sanity-workshop-functions-agent-actions skill and read its
references/chaining-and-stop-conditions.md.

Turn functions/draft-menu-copy/index.ts into a chain: first compute the delta between the
allergens the recipe's ingredients actually contain and the allergens the menu item declares.
If the delta is empty: run the Generate step from Mission 2-2, then an Agent Action Transform
that adapts description.base into description.nyc, description.austin, and description.chicago
— NYC is corporate-owned, Austin and Chicago are franchised; make the per-target instructions
name what should differ — then log a success notification. Leave allergenCallout alone in the
Transform; it is one field with no market variants. If the delta is NOT empty: halt before any
copy is drafted, log a structured warning naming the item and the undeclared allergens, and
flag the item in a way that does not re-trigger the Function. Explain your recursion reasoning
in a comment.

Then, with pnpm dev running: run `pnpm seed:reset`, run the Function locally against
gg.menuItem.citrus-fennel-salad (a clean item) and show me the log and the four description
values from the Studio draft; then run it against gg.menuItem.harissa-chickpea-bowl (its recipe
reveals sesame the menu never declared) and show me the log. Do not edit the seed or the
schema. Do not deploy.
```

**Done when** — `description.nyc`, `.austin`, and `.chicago` are all populated and differ from
each other, `allergenCallout` is unchanged — **and the bad item doesn't ship.**

The failing case is the important half. Without it every mission on this track succeeds, the
human gate in 2-4 has no justification, and the governance half of the theme never lands.
**Automation needs a stop condition.**

**The asymmetry to notice** — `description` varies by market. `allergenCallout` doesn't. It's one
field, and it must end with the cross-contact statement verbatim, which the seed says _"must be
reproduced without paraphrase or softening."_ **Marketing copy localizes. A safety statement
doesn't. Knowing which is which is content modeling, not prompting.** That's the governance beat
on this track, and it's the same idea Track 1 reaches through `groqFilter`.

**If stuck** — Three near-identical variants is a prompt problem: the per-target instructions
have to name the difference. A Function that fires again after its own write has written outside
the recursion guard. Then `checkpoints/2-3.md`.

**Going deeper** — `skills/sanity-workshop-functions-agent-actions/references/chaining-and-stop-conditions.md` ·
[Transform patterns](https://www.sanity.io/docs/agent-actions/transform-cheatsheet)

Optional stretch: point a Translate action at a language _you_ read, into a new document. It's
out of the core path because a translation nobody in the room can check isn't a demo, it's a
claim.
