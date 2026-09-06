# The enforcement story — three layers, not one

The engine's own documentation opens with _"the engine enforces nothing… the Content Lake is
the only enforcement point."_ Say this before someone in the room tests the gate with curl,
because someone will.

## The layers

| Layer                                                                                                                                                           | What it is                                                                                        | Enforces?                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Engine checks** — action filters, verdicts, permission gates, readiness pre-flights                                                                           | Advisory by design, permanently. They exist so a UI can disable the right button and explain why. | **No**                                                                                                                                                                                             |
| **`guards`** — a stage-level lock that compiles to its own document in the Content Lake, deployed when the instance enters the stage and deleted when it leaves | The designed enforcement point. The contract document deploys today.                              | **Not yet** — _"a raw client writing directly to the Content Lake is not yet denied by the lake itself."_ Treat a guard as a pre-flight on the engine's own writes and as pending everywhere else. |
| **Track 1's `groqFilter` on a private dataset**                                                                                                                 | A server-side read boundary                                                                       | **Yes, today**                                                                                                                                                                                     |

Three mechanisms, three different guarantees, one afternoon. It is the sharpest governance
contrast available: Mission 1-6 is enforced now; Mission 2-4 is a coordination layer with
enforcement designed and pending.

## A guard, for reference

```ts
defineStage({
  name: 'review',
  guards: [
    {
      name: 'lock-subject',
      match: {idRefs: [{type: 'fieldRead', field: 'subject'}], actions: ['publish']},
    },
  ],
})
```

Not part of the mission; here so the attendee can see the shape of the thing that will enforce.

## The demonstration that makes it land

Publish the menu item straight from its document, skipping the workflow. The instance **still
advances** — because the transition reads the document's published status, not whether the
Approve action fired. _"The workflow follows what is true, not how it was made true. That is the
workflow observing reality, not enforcing it."_

Same primitive from the other side: a transition keys off **fields, not a button press**.
Clicking Approve writes an approval into the instance's fields. An agent or a script can write
the same field, and the instance moves identically. The mechanism cannot tell humans and agents
apart — which is the workshop's theme stated by the product itself.

## `autoStart` has the same honest limit

`autoStart` materialises the document and starts the workflow when an editor opens a fresh
document in the Studio. A raw client or any non-Studio write bypasses it entirely. _"A floor,
not a guarantee."_

## v0 limits to state plainly

One instance per document · code-defined, no visual builder · the Studio plugin is explicitly
temporary · 0.31.0, pre-1.0, breaking changes expected · not for production use · no native
Slack/Linear connectors (the engine queues an effect; you write the handler) · guard enforcement
pending.

## Why this use case

Nobody publishes an allergen claim without sign-off. Mission 2-3's halted Harissa Chickpea Bowl
— a recipe that reveals sesame the menu never declared — is exactly the item a food-safety
reviewer should see before copy goes out. That is not a contrived approval flow, which is why
this use case was chosen.
