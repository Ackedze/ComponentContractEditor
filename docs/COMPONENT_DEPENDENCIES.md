# Pinned component dependencies · 0.2.35

Since 0.2.35, recursive parent baseline policies can explicitly opt in to
`boundaryPolicy: "component-owned@1"`. Proven child-contract subtrees are excluded
from those policies only; embedding constraints and child invariants still execute.
Missing evidence stays incomplete. [Rule scope specification](RULE_SCOPE.md).

Manual owns **references and host constraints**, never copied child rules.
`componentDependencies[]` pins componentId, revision, manualSourceHash and stableHash
of the exact compiled child. Read-only input is `dependencies/<componentId>/component-contract.v2.json`
in an Editor ZIP, or the embedded child of an exported compiled contract.
The common compiler validates/link-checks the input; it never edits the child.
Package `manualRevision` is emitted for parents using this new route. Accepted older
children may resolve revision from a single unambiguous RuleIR revision.

Each binding has id, targetRole, relativePath, ownerComponentSetKeys, typed
activeVariant and exact childPath. Names alone do not prove identity. A visible
resolved target plus independently captured selected owner variant proves activation;
missing topology or unproven lineage is unknown. Hidden/absent targets and another
known Type are explicitly inactive. Button maps left/right targets to their Addon
instance, Type=Spinner, fixed child `Spinner`.

Parent dependencyDomain constraints opt in with `contractDependencyId`. No icon
port/catalog heuristics or allow-unchanged exemption applies to this fixed route.
The parent constrains nominal Size; the child independently validates intrinsic
geometry and visual/layout policies. Constraints intersect, never override.

The plugin captures an independent instance of the actual child's selected library
variant, with its resolved modes. Actual subtree/nodeMap must agree exactly with
the host snapshot; expected values never come from the tested actual. Temporary
reference pages/instances are removed in finally; capture does not mutate selection.
Capture limit: eight child references per run; dependency depth limit: four.
Limits, missing references, wrong hashes, version conflicts and cycles are explicit
coverage gaps, not silent truncation or successful checks.

The runtime invokes the **same canonical Predicate Engine** recursively. Child
authority is not elevated when Editor activates parent draft rules. Original RuleID,
revision, compiled hash and binding provenance are preserved; evaluation IDs are
scoped per instance/binding and focus maps back to host anatomy. Dependency runs are
`executed`, `not-applicable`, `not-executed` or `incomplete`. Missing child coverage
makes the whole scenario incomplete. The download embeds pins, compiled children,
captures and results so Node replay needs no Figma access.

Editing: Passport → Component dependencies for pins/bindings; dependencyDomain →
Contract dependency for the reference id. Imported child JSON stays read-only.
To update a dependency deliberately, import its new compiled artifact and update
the pin; no implicit latest-version resolution or silent upgrades. Rebuild callers
and rerun integration tests. Existing contracts without dependencies retain exact
old replay behavior. Experimental v2.1 schemas include the optional structures;
this is not a new production publication format rollout.

Button r16 first-stage scope: fixed nested execution and Size only. Full Loading
composition, palette matrix, pre-loading width, pattern ownership and front-end
mapping remain separate gates. Spinner r8 readiness is its declared Figma predicate
contour, not a claim of universal generation or vector/animation coverage.
