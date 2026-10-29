# Gradient paint evidence — 0.2.32

This is a generic capture/completeness fix, not a new Spinner rule. Manual source
remains normative; compiler output is read-only. Predicate Engine is unchanged.

## Capture

`captureGradientPaintDetails` is shared by actual and independent-reference
capture, including nested references. For `GRADIENT_LINEAR`, `GRADIENT_RADIAL`,
`GRADIENT_ANGULAR` and `GRADIENT_DIAMOND`, it preserves:

- ordered stops: position, exact RGBA floats and variable alias ID;
- explicit `tokenId: null` when the Plugin API reports an unbound stop;
- finite 2×3 gradient transform and observed optional blend mode.

Malformed fields are omitted, never repaired from the inspected instance or
defaulted. All arrays/objects are copied. Missing/mixed paint containers are not
empty paints: only `[]` proves that no paints are set. Capture provenance includes
`gradientPaintCaptureVersion: 1`, but that marker alone does not prove completeness.

## Compilation and interpretation

New compiled output carries `runtimePolicy.gradientPaintFactsVersion: 1`.
After semantic and independent-baseline materialization, core validates gradient
facts on both actual and effective baseline. It marks incomplete paint facts
unknown and records their exact missing paths. `paintEvidenceV1` preserves property
presence independently: a selector must not silently discard an incomplete paint.
Paint baseline assertions use `missingPolicy: unknown`; Predicate Engine remains
the only interpreter. Editor diagnostics annotate its unknown results and keep
scenario coverage incomplete; they do not manufacture a compliant/violation verdict.

Runtime-generated completeness fields are derived evidence, not manually authored
rules or an extra source of truth. New facts do not expand a manual capability list.

## Compatibility

- Historical report + its embedded historical compiled contract: unchanged replay.
- Historical incomplete capture + newly compiled contract: unknown/incomplete;
  recapture in 0.2.32, do not invent stops/transform from the actual instance.
- New complete capture + new compiled contract: compare independent actual/reference,
  preserving token identity even if RGBA is unchanged.

Spinner manual stays r6. Its pre-patch compiled output is archived under
`Spinner/history/r6-editor-0.2.31/compiled/`; immutable live reports are preserved.

## Verification and limits

`tests/gradient-paint-facts.test.js` exercises the bundled controller and core:
four gradient types, fills/strokes, stop position/color/alpha/order, transform,
binding detach/replacement, blend mode, missing/malformed actual/reference,
preview/export replay and materialization idempotence. Test references are built
independently; synthetic gradient fixtures are not assertions about library colors.
Restored-state tests do not implement or guarantee automatic Figma reset.

Local tests are not live Figma acceptance. Follow the Spinner targeted acceptance
plan. Arbitrary vector geometry, all image/effect payloads, animation and inactive
layout applicability are outside this patch.
