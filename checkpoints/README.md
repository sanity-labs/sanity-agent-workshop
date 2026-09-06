# Checkpoints

What a correct result looks like, one per mission. **No code.** When an agent did the typing, the
real question isn't "what's the syntax?" — it's _"my agent produced something different; is it
right?"_ A checkpoint answers that. A solution file doesn't, and an agent pointed at one will copy
it.

Two caveats apply to every page here:

- **This is what's correct if you're still on the Green & Gather seed.** If you've pointed the
  repo at your own content, your numbers will differ and that's expected — see
  `missions/make-it-yours.md`.
- **These were written from the design and a first dry run, before the missions had been walked
  by a room.** Where a checkpoint says "expect", treat it as a strong prediction, not a
  transcript. If your result disagrees and you're on the seed, run `pnpm verify` first, then ask
  a helper — you may have found something.

Your coding agent is told in `AGENTS.md` not to read this folder unless you ask. That's on
purpose.
