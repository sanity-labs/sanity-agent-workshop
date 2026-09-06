# What the Knowledge Base knows

**Green & Gather — Allergens & Food Safety**, built by the attendee from `kb/README.md` (the
shared backup is built from the same recipe): one dataset source plus four uploaded files. Three
of the files have no GROQ expression at all; that is why the KB exists rather than being tidier.

| #   | Source                                                                          | In the dataset? | Load-bearing content                                                                                                                                                                                   |
| --- | ------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `allergenPolicy`, `crossContactStatement`, `substitutionPolicy`, `prepStandard` | ✅              | The current, strict policy. Every allergen entry ends with the cross-contact statement verbatim.                                                                                                       |
| 2   | `ingredient` documents                                                          | ✅              | Per-ingredient `allergenTags`                                                                                                                                                                          |
| 3   | Sunfield Foods — tamarind-lime sauce spec sheet (March 2026)                    | ❌ upload       | _"Contains: soy, wheat. Manufactured on equipment that also processes peanuts and tree nuts. Sunfield Foods cannot certify this product as free from peanut or tree nut protein."_                     |
| 4   | Northfield Bakehouse — flour tortilla spec sheet                                | ❌ upload       | _"Contains: wheat. Produced in a facility that also handles egg and sesame. Not suitable for gluten-free applications."_                                                                               |
| 5   | Franchise Operations Manual §7 (March 2025)                                     | ❌ upload       | _"Gluten-free wrap substitution is available on guest request at all locations"_ — superseded by the current `substitutionPolicy`. Also the only place that says the guacamole is made in-store daily. |
| 6   | Legacy nutrition microsite (saved-site PDF, © 2024)                             | ❌ upload       | Allergen matrix v1 with a **blank peanut column** for the Thai Crunch Bowl; Summer Peach Bowl still under "Now Serving"; softer assurance language.                                                    |

## The three questions and what a correct answer looks like

**"Is the Thai Crunch Bowl peanut-free?"** — the anchor. Six sources, four answers. Menu data
declares `soy, wheat, sesame`. Traversing the recipe finds no peanut either. The seeded FAQ
(`gg.faq.thai-crunch-peanut`) says outright that it is peanut-free. The legacy matrix leaves the
column blank. **The exposure exists only in the Sunfield spec sheet.** A correct answer says the
bowl contains no peanut _ingredients_, that its tamarind-lime sauce is made on shared equipment
and the supplier cannot certify it free of peanut protein, cites the spec sheet, and ends with the
cross-contact statement. It never says "peanut-free" or "safe". GROQ alone answers from the menu
field, confidently, and is wrong in the dangerous direction — it did exactly what it was asked;
the question was never a query.

**"Is your fryer shared?"** — stated in `crossContactStatement` and `prepStandard`. Yes, shared
fryer and prep surfaces. One lookup; a cited quote.

**"Can I get something gluten-free?"** — several GROQ calls in Mission 1-2; one lookup now. The
correct answer names items with the `gluten-free-option` flag as _options_, states that the
current substitution policy does **not** promise a gluten-free wrap swap because of shared prep
surfaces, notes the older operations manual said otherwise and is superseded, and cites the
Northfield sheet on the tortilla. If the agent says the swap is available on request, it read the
manual over the policy — that is a KB `instructions` issue, not code: accept the current-policy
claim on the gluten-free issue in the KB and rebuild (on the shared backup, tell a helper).

## The side payoff

The KB's **Issues** page flags that the attendee's own FAQ is wrong and the legacy site is serving
a claim the current policy would never make. Four expected issues: Thai Crunch peanut status, the
gluten-free wrap swap, assurance language, Summer Peach availability. If one is missing, the source
carrying it didn't ingest. Nobody built an agent to learn that — it is a content audit for free.

## Debug levers (theirs now)

| Symptom                        | Lever                             |
| ------------------------------ | --------------------------------- |
| Fact missing                   | Add a source                      |
| Fact skipped or under-weighted | `purpose`                         |
| Wrong shape, no citation       | `instructions`                    |
| Sources disagree               | Resolve the issue into a rule     |
| Agent never looked at the KB   | Routing — Mission 1-4, not the KB |

Never hand-edit entries; a rebuild overwrites them.
