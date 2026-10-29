# Spinner geometry regression fixtures

`spinner-live-20260926.json.gz` is a gzip-compressed JSON fixture with a `files`
array. Each entry preserves its original parsed document and source byte SHA-256.
Sources are the isolated `design-system_ab/experiments/web-core/core/Spinner` package:

- Four original Editor0.2.29 reports, 2026-09-26 at 18:17:21, 18:17:36,
  18:18:37 and 18:22:13 UTC. Their manual r4 has six rules on historical r1 evidence.
- The independent pinned REST response and generated r2 variant evidence.

The old reports intentionally retain the missing effective baseline dimensions.
Tests replay their embedded contracts exactly, then separately exercise corrected
materialization and the real bundled controller against a Plugin API simulation.
Independent reference sizes come from each report's own
`snapshot.instanceContentReferences.base`, never from the tested instance.
Cases: pristine48×48, token/layout override48×48, resize300×48, Scale80×80.
Missing/invalid dimensions, zero, preview, cleanup and nested references are covered.

These are offline regression fixtures, not a claim of new Figma acceptance.
Manual/source documents and original live reports must not be rewritten to make
expected results pass. See `tests/helpers/spinner-geometry.js` and
`tests/spinner-geometry.test.js`.

`spinner-live-acceptance-20260926.json.gz` additionally preserves the four
Editor0.2.30 reports at 18:52:14, 18:52:25, 18:52:32 and 18:52:39 UTC, including
source byte SHA-256. They establish accepted baseline geometry, with original
0/4/7/10 atomic violations and manual r4 unchanged. The third report includes
an additional Fixer sizing change absent from the earlier resize fixture.
`property-applicability.test.js` first replays these unchanged documents, then
uses fresh controller captures and explicit manual opt-in to test 0/4/7/2
violations, inactive reasons, unknown coverage and legacy compatibility.
