# Build the Knowledge Base

Track 1, Mission 1-3 adds a Sanity Context **Knowledge Base** as a second source for your agent.
**You build it yourself, in your own organization, from your own dataset plus the four files in
[`sources/`](sources/).** The build is a few minutes of clicking and then a wait, which is why
Mission 1-1 tells you to start it before you go on to 1-2 — by the time you reach 1-3 it is done.

Building your own means one organization and one token for both endpoints, your own ingest
report, and your own `purpose` and `instructions` to tune.

This page is the recipe. Everything about the product is in the public docs:

- [Knowledge Bases](https://www.sanity.io/docs/ai/sanity-context-knowledge-bases) · [Create one](https://www.sanity.io/docs/ai/sanity-context-create-knowledge-base) · [Source types](https://www.sanity.io/docs/ai/sanity-context-source-types) · [Retrieval modes](https://www.sanity.io/docs/ai/sanity-context-retrieval-modes) · [Resolve ingest issues](https://www.sanity.io/docs/ai/sanity-context-resolve-issues)

> Knowledge Bases are an opt-in early-access feature. Free while in beta; limits may change. If
> your organization can't create one, ask a helper — people in the room can enable it for you.

## The recipe (~5 minutes of clicking, then a build)

All of it in the Sanity Dashboard → **Context** (the same app where you created your MCP in 1-1).

### 1. Create the Knowledge Base

**New knowledge base.** Title and purpose, then **Create knowledge base**:

**Title:** `Green & Gather — Allergens & Food Safety`

**Purpose** (paste as is):

```text
This Knowledge Base answers allergen, dietary, and food-safety questions for a guest-facing
assistant at Green & Gather, a fast-casual restaurant chain.

A complete result covers, for every item currently on the menu in any market: which of the nine
major allergens are present as ingredients, which may be present through cross-contact, what
substitutions are possible, and what the brand is willing to guarantee.

Completeness matters more than brevity. If an item has no allergen data, that absence is itself a
fact worth recording — do not omit the item.

Where sources disagree about whether an item is free of an allergen, always surface the more
cautious claim and flag the disagreement.
```

### 2. Add the dataset source

**Add source → Dataset.** Pick your project and the `production` dataset, and paste this as the
query. A KB binds one dataset with one complete GROQ query, so the policies, ingredients,
recipes, and menu items all come through this single source. It leaves out `location`
(availability is live data, GROQ's job), `priceCents` (snapshot risk), and anything with
`status == "internal"` — the unlaunched Winter Miso Bowl **and its recipe**, which is why the
seed marks both internal — so the bowl cannot leak through the KB. Deprecated items stay in so
the build can reconcile the Summer Peach Bowl against the legacy site.

```groq
*[
  _type in ["allergenPolicy", "crossContactStatement", "substitutionPolicy", "prepStandard",
            "ingredient", "supplier", "recipe", "menuItem", "faq"]
  && status != "internal"
]{
  _id, _type, title, breadcrumb, body, status, effectiveDate,
  _type == "crossContactStatement" => { verbatimStatement },
  _type in ["allergenPolicy", "substitutionPolicy"] => { policyVersion, supersedes },
  _type == "prepStandard" => { scope },
  _type == "faq" => { topic },
  _type == "supplier" => { supplierCode, specSheetRevision },
  _type == "ingredient" => { allergenTags, "supplier": supplier->{ title, supplierCode, specSheetRevision } },
  _type == "recipe" => { "ingredients": ingredients[]->{ title, allergenTags, "supplier": supplier->title } },
  _type == "menuItem" => {
    category, calories, allergens, dietaryFlags, availableFrom, availableUntil,
    "recipe": recipe->{ title, "ingredients": ingredients[]->{ title, allergenTags, "supplier": supplier->title } }
  }
}
```

Tested against the seed: **75 documents**. A dataset source needs a Developer or Administrator
role on the project — you own yours, so you have it.

### 3. Upload the four files

**Add source → Files.** Upload these four from [`kb/sources/`](sources/). Each one is a
document Sanity never held, and each carries a fact the dataset doesn't:

| #   | File                                                  | What it is                                             | The fact that only lives here                                                                                                                               |
| --- | ----------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `sunfield-foods-tamarind-lime-sauce-spec.pdf`         | Supplier spec sheet, Rev 4.2, 15 Mar 2026              | **The star.** _"Manufactured on equipment that also processes peanuts… cannot certify as free from peanut protein."_ The Thai Crunch Bowl's peanut exposure |
| 2   | `northfield-bakehouse-flour-tortilla-spec.docx`       | Supplier spec sheet, Issue 6, 2 Feb 2026               | Facility also handles egg and sesame; _"not suitable for gluten-free applications"_                                                                         |
| 3   | `green-and-gather-franchise-ops-manual-section-7.pdf` | Franchise Operations Manual §7, dated **March 2025**   | _"Gluten-free wrap substitution is available on guest request"_ — contradicted by the current `substitutionPolicy`. Also: guacamole is made in store daily  |
| 4   | `greenandgather-nutrition-legacy-site.pdf`            | The legacy nutrition microsite, saved as a PDF, © 2024 | Allergen matrix v1 with a **blank peanut column** for Thai Crunch; Summer Peach Bowl still "Now Serving"; softer assurance language                         |

### 4. Build

**Build entries.** Then move on to Mission 1-2 — the build runs on its own. Done when the status
line reads **Entries up to date**. The build takes about ten minutes; if the status still says
building when you reach 1-3, wait for it to finish before wiring the endpoint.

### 5. Read the ingest report (2 minutes, worth it)

Open **Issues**. The build should have flagged four conflicts. If one is missing, the source that
carries it didn't land:

| Expected issue                                                  | Sources in conflict                                                       |
| --------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Thai Crunch Bowl peanut status                                  | menu data + `gg.faq.thai-crunch-peanut` + legacy matrix vs. Sunfield spec |
| Gluten-free wrap substitution                                   | ops manual (March 2025) vs. `substitutionPolicy` (1 Feb 2026)             |
| Assurance language ("keep your meal safe", "accommodate most…") | legacy site vs. the current policy's refusal to guarantee                 |
| Summer Peach Bowl availability                                  | legacy site "Now Serving" vs. `availableUntil` and `status: deprecated`   |

Your own FAQ is wrong and your legacy site is serving a claim the current policy would never
make. Nobody built an agent to learn that — it's a content audit for free. **Accept the
current-policy claim on each**; the KB writes the corresponding instruction itself, anchored to
the right source.

### 6. Add three instructions

Under **Instructions**, add these three. Instructions cannot be phased, so nothing here
pre-decides a planted conflict — that's what step 5 is for.

| #   | Anchor to  | Rule                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Dataset    | Never phrase an entry as an assurance of safety. Write "contains no peanut ingredients" or "produced on equipment that also processes peanuts," never "is peanut-free," "is safe for," or "suitable for." Every entry that answers an allergen question ends with the cross-contact statement reproduced exactly as written in the Cross-Contact Statement document, not paraphrased or shortened.                                                                                                                                                                              |
| 2   | Dataset    | Write one entry per menu item, not per category. Every allergen claim names its source: the declared allergen list, an ingredient record, a named supplier specification with its revision date, the Franchise Operations Manual, or the legacy nutrition site. A menu item's declared allergen list covers ingredients only; where an ingredient record or a supplier specification shows something the declared list does not, record both and mark the entry as an exception. Include a calorie figure only where the menu item record has one, and never derive or sum one. |
| 3   | Ops manual | Operational facts in the Franchise Operations Manual that no other source contradicts remain valid and are recorded with the March 2025 date, including the front-of-house intake script, escalation triggers, reaction reporting, and which items are made in store (guacamole, pickles, grains) versus delivered sealed from the commissary (sauces and dressings).                                                                                                                                                                                                           |

Rebuild after adding them. Add finer rules later only if a specific entry comes out wrong.

### 7. Create the KB-mode endpoint (Mission 1-3 proper)

Back on the **MCPs** page, create a **second** MCP whose **only source is this Knowledge Base**.
Mode is derived from sources: all-KB sources → KB tools (`initial_context` outline +
`knowledge_base_read`); a dataset source → GROQ tools. **If an endpoint has both, the dataset
wins and the KB is ignored**, which is why this has to be a second endpoint rather than a source
added to the one from 1-1. Name it carefully; the name is in the URL and can't change.

Paste this into its **Instructions** field. The agent receives it on connect. It declares what the
endpoint holds but deliberately does not say "use the GROQ tool instead"; that boundary is your
job in Mission 1-4.

```text
This endpoint serves the Green & Gather allergen and food safety knowledge base. It answers guest questions about allergens, cross-contact, substitutions, kitchen preparation, and what the brand does and does not guarantee.

Retrieving. Start from the outline. Entries tagged [core] are the per-item allergen entries and the current policies; read those first. When several entries look relevant, read them in one call rather than one at a time. Each menu item has its own entry; for a question about a dish, read that dish's entry together with the cross-contact statement. Entries cite their sources. Carry the citation into your answer by naming the source and its date, for example "Sunfield Foods specification, March 2026."

Answering. Never tell a guest an item is safe, allergen-free, or suitable for their allergy. State what the ingredients contain and what cross-contact is possible, and let the guest decide. End every allergen answer with the cross-contact statement exactly as it appears in the knowledge base, not shortened or paraphrased. Where an entry records that sources disagree, give the more cautious claim first, say that sources disagree, and name them; do not choose the reassuring one. Where an entry marks a claim as superseded or outdated, do not repeat it as current. Where an entry says a figure is not published, say so rather than estimating. If the guest describes a severe allergy or asks about a supplier's manufacturing practices, recommend they speak with the manager on duty before ordering.

Not held here. Prices, which locations serve an item, opening hours, counts or lists of items matching a filter, and anything about unreleased items. Those come from live menu data. If asked, say this knowledge base does not cover it rather than inferring from an entry.
```

Copy the **endpoint URL** into `app/.env.local`. It is the one shaped like your GROQ endpoint
(`api.sanity.io/v1/context/organizations/…/mcp/<name>`), shown after you save. **Not** the
address in your browser's location bar (`context.sanity.io/<org>/knowledge-bases/kb…`) — that is
the KB's page in the app, and pointing the agent at it fails with an HTTP `405`.

```sh
SANITY_CONTEXT_KB_URL=https://api.sanity.io/v1/context/organizations/<yourOrgId>/mcp/<kbEndpointName>
# Same organization as the GROQ endpoint, so SANITY_ORGANIZATION_TOKEN is the bearer
```

**Shortcut, if you'd rather not create a second MCP:** two URL parameters switch your existing
endpoint into KB mode — `?mode=knowledge_base&knowledgeBases=<kbId>` (the id begins with `kb`,
shown on the KB's page). Same tools, same token. The second MCP is the shape you'd ship, and it
makes the "dataset wins" rule visible, so the missions assume it.

## The planted payoff

_"Is the Thai Crunch Bowl peanut-free?"_ has six sources and four different answers. Menu data
declares `soy, wheat, sesame`. Traversing the recipe finds no peanut either. `gg.faq.thai-crunch-peanut`
says outright that it's peanut-free. The legacy matrix leaves the column blank. **The exposure
exists only in the Sunfield spec sheet.** GROQ answers from the menu field, confidently, and is
wrong in the dangerous direction. It's doing exactly what it was asked; the question was never a
query.

Three of the KB's sources have no GROQ expression at all. That is one of the two honest reasons
to reach for a KB; the other is doing the reconciliation once, at build time, instead of on every
request.

## Debug levers

Now that the KB is yours, so are the levers:

| Symptom                             | Lever                                              |
| ----------------------------------- | -------------------------------------------------- |
| A fact is missing                   | Add a source                                       |
| A fact is skipped or under-weighted | `purpose`                                          |
| Wrong shape, or no citation         | `instructions`                                     |
| Sources disagree                    | Resolve the issue into a rule in `instructions`    |
| The agent never looked at the KB    | That's **routing**, not a KB problem — Mission 1-4 |

**Never hand-edit entries.** A rebuild overwrites them. Uploaded files never re-sync either: to
update one, delete the import and upload again.
