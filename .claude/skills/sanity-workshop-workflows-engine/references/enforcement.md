# What is enforced — and what isn't yet

From the official docs (Introduction → _Engine checks are advisory_; _How early access works_ →
_What is not enforced yet_; _Guards and enforcement_), 2026-09-06. Say this before someone in the
room tests the gate with curl, because someone will.

## The docs' own words

> Every check the engine makes is advisory. Action verdicts, permission gates, readiness
> pre-flights, and editability checks exist so a UI can disable the right controls and explain
> why. Anyone with a write token can talk to the Content Lake directly and skip the engine, so the
> Content Lake is the only enforcement point.

> During early access the Content Lake does not enforce deployed guard documents yet. So a guard
> currently previews an allow or deny verdict for engine-aware surfaces, and explains a denied
> engine commit. Until the lake enforces guards, a rule you cannot afford to have bypassed belongs
> in dataset access control.

## The three layers

| Layer                                                                        | What it is                                                                                                                                                                                                                                  | Holds against a raw write?                                                           |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Engine checks**                                                            | Action verdicts, permission gates, readiness, editability                                                                                                                                                                                   | **No, by design.** UX, not a security boundary.                                      |
| **A guard**                                                                  | A restriction deployed as its own document beside the content, for one stage visit. The Studio plugin disables the denied action (publish, unpublish, delete) and names the workflow; the engine refuses its own write if a guard denies it | **Not yet.** The Content Lake does not evaluate guard documents during early access. |
| **Dataset access control** — and Track 1's `groqFilter` on a private dataset | Enforced by the Content Lake                                                                                                                                                                                                                | **Yes, today.**                                                                      |

Three mechanisms, three different guarantees, one afternoon. Mission 1-6 is enforced now;
Mission 2-4 is a coordination layer with enforcement designed and pending.

## The demonstration

With a menu item held at `review` and the `hold-publish` guard deployed:

1. In the Studio, **Publish is disabled** and the tooltip names the workflow. Unpublish and delete
   behave the same way if the guard lists them.
2. From a terminal, publish the same document with a write token — for example
   `cd studio && npx sanity documents create <json>` with the published id, or any client with a
   token that can mutate. **It lands.** The lake does not consult the guard document.
3. Look at the instance: **it hasn't moved.** Its transitions watch its own fields
   (`$allActivitiesDone`), and nothing wrote to them. The workflow didn't block the write and
   didn't observe it either.

That is the honest shape of early access: the engine and the plugin honor the guard, the lake
does not, and a rule that must hold against every writer belongs in dataset access control today.

## Two related honest limits

- **`autoStart` is fresh-only and Studio-only.** "Writes outside Studio bypass auto-start. It is an
  integration convenience, not an enforcement boundary."
- **The engine does not yet separate the caller's identity from its own writes** — both ride the
  caller's token — so dataset access control evaluated against an editor's token can block the
  engine's housekeeping. Not a workshop concern, but the reason the guard is on `publish` only.

## Why this use case

Nobody publishes an allergen claim without sign-off. Mission 2-3's halted Harissa Chickpea Bowl —
a recipe that reveals sesame the menu never declared — is exactly the item a food-safety reviewer
should see before copy goes out. That is not a contrived approval flow.

## References

- Guards and enforcement: https://www.sanity.io/docs/workflows/guards
- Actors, tokens, and what's actually enforced: https://www.sanity.io/docs/workflows/actors-and-enforcement
- How early access works: https://www.sanity.io/docs/workflows/prerelease
