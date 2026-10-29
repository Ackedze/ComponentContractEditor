# Per-property applicability v1

Normative source: `ManualRule.propertyApplicability`, edited in the existing
inspector. Omission keeps unconditional legacy baseline semantics. This is not a
global capture heuristic, a verdict filter, or an automatic contract migration.

```json
{
  "propertyApplicability": {
    "appearance.strokeWeight": "stroke-present-either@1",
    "layout.itemSpacing": "flow-gap-either@1",
    "layout.padding.top": "auto-layout-padding-either@1",
    "layout.primaryAxisAlignItems": "flow-alignment-either@1"
  }
}
```

Each entry gates only the named `propertyForbidden` assertion, including an
explicit capability group member. Unsupported versions, unrelated facts or
policy-only permission produce validation errors/non-executable rules. Group
membership remains explicitly versioned; no newly captured property enters it.

Capture records `propertyActivityV1.strokePresent` and `.gapApplicable` in the
actual snapshot and independent reference. Effective baseline carries the latter;
it never copies activity from the tested instance. Host-context equality excludes
activity because legal variant/swap changes can change child counts.

- `strokePresent`: non-empty strokes array. Hidden/transparent paints still count.
  Missing/mixed strokes are unknown, not an empty array.
- `gapApplicable`: HORIZONTAL/VERTICAL auto layout with ≥2 visible AUTO children.
  Hidden/ABSOLUTE children do not count. Lower/upper bounds preserve uncertainty:
  two proven children establish true, fewer than two possible establish false.
  NONE/GRID and known non-layout node types establish false for itemSpacing;
  GRID spacing is a different property and outside this policy.
- `paddingApplicable` (Editor 0.2.33): HORIZONTAL/VERTICAL/GRID establish true;
  NONE and known non-layout types establish false. Missing/unsupported mode or
  a throwing getter is unknown. Each of top/right/bottom/left opts in separately.
- `axisAlignmentApplicable` (0.2.33): HORIZONTAL/VERTICAL establish true,
  NONE/GRID and known non-layout types establish false. The two flow axes opt in
  independently. Grid child alignment is a different capability, not suppressed
  or covered here. Padding/alignment do not require two participating children.

The compiler emits ordinary `any(equals(actual,true), equals(baseline,true))`
conditions with `missingPolicy=unknown`. The shared Predicate Engine is unchanged.
Both false → not-applicable; either true → compare the value; false+unknown or
unknown+unknown → unknown/incomplete. A missing comparison value is also unknown.
Presence/removal of a stroke, paint identity, sizing and other assertions are not
silenced. Diagnostic-only applicability probes do not guess a whole compound
rule's scope from one property gate; excluded source rules stay pending.

The API defines itemSpacing for horizontal/vertical auto layout, between children:
[Figma itemSpacing](https://developers.figma.com/docs/plugins/api/properties/nodes-itemspacing/).
The ≥2 and either-state test are explicit authored contract policy, not a claim
that numeric Figma properties cease to exist. SPACE_BETWEEN is not implicitly
excluded. This release does not generalize the gate to typography/vector/animation.

Original compiled+snapshot pairs replay unchanged. New gated contracts need fresh
capture evidence; absence of those facts in old reports must not be called a full
check. Spinner r5 opts in explicitly, retains the six user r4 RuleIDs, archives r2/r4,
uses fresh r2 evidence, and remains Draft pending live acceptance.

## Spinner r7 / Editor 0.2.33

The manual explicitly adds four padding gates to both existing baseline rules
and two alignment gates to auto-layout-1. All six RuleIDs, capability membership,
thirteen explicit legacy constraints and rule review statuses are preserved.
Generated facts are unchanged. Historical r6 manual and compiled0.2.32 are in
`Spinner/history/r6-editor-0.2.32/`. No automatic opt-in or Spinner-specific runtime
branch exists. Missing new activity facts in an older capture require recapture.

Six live fixtures L01–L06 cover pristine, inactive padding, inactive alignment,
active padding and each active axis. Root layoutMode removal and nested layout
activation did not persist through Figma on these library instances; misleading
fixtures were removed. These transitions, all nine activity truth-table pairs,
missing facts, and GRID capability distinctions are controller/unit tests, not
claimed live Spinner acceptance. GRID on nested Fixer was rejected by Figma.

The read-only capture records capabilities; the manual chooses whether to gate.
The compiler emits ordinary predicates and leaves the shared engine unchanged.
Baseline reference is independent even when actual auto layout is disabled.
Layout mode, sizing and intrinsic bounds are never covered by these gates.

API references: [padding](https://developers.figma.com/docs/plugins/api/node-properties/),
[flow axis alignment](https://developers.figma.com/docs/plugins/api/properties/nodes-primaryaxisalignitems/).
These facts do not claim that every library instance permits switching modes.
