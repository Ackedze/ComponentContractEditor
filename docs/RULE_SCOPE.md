# Explicit rule scope · Editor 0.2.35

Manual source owns these opt-ins. They compile to ordinary `when` predicates;
the canonical Predicate Engine is unchanged. Omission retains the exact legacy
contract semantics. No RuleID is replaced, no Button/Spinner name is hardcoded.

## Ownership boundary

`boundaryPolicy: "component-owned@1"` is allowed only on recursive baseline
comparisons (`self-and-descendants` + `propertyForbidden`) with declared
`componentDependencies`. It stops the blanket parent policy at a proven child
contract root, including that root. Parent embedding constraints such as nominal
Size remain separate and execute; this field cannot disable dependencyDomain,
presence/quantity or other intrinsic assertions.

`ruleScopeV1.local` is recomputed, never trusted from a downloaded snapshot.
A boundary needs valid pinned bytes, complete topology, resolved semantic target,
typed owner variant, proven lineage/identity, and a matching independent child
capture. Only a proven child subtree gets `local=false`; other proven nodes get
true. An unresolved dependency conservatively leaves remaining ownership unknown.
Missing child execution/coverage still makes the full scenario incomplete. Child
authority is not elevated, and child rules cannot be relaxed by the parent.

This is a boundary between contracts, not blanket exemption for every INSTANCE:
ordinary icons without their own declared contract remain checked by the parent.

## Visible style targets

`targetApplicability: "visible-target@1"` applies only to style baseline
comparisons. A uniquely resolved target with known effective visibility false,
or proven absence in the selected variant, gets a root-subject false precondition
and **not-applicable**. Missing/remapped/ambiguous targets, unknown visibility and
truncated topology remain incomplete; absence is never guessed from an empty
selector. Legacy/manual-only inputs use the strict target resolver when opting in.

Presence/visibility rules remain independent: hiding a required element must be
caught by those rules. This policy does not authorize hiding it.

## Exact-property activity

`propertyApplicability["layout.itemSpacing"]: "flow-gap-either@1"` is the existing
explicit activity policy. Gap is compared when active in either actual or baseline;
only false/false excludes it. Missing evidence is unknown. Padding, radius and
other properties do not inherit the gate. See [PROPERTY_APPLICABILITY.md](PROPERTY_APPLICABILITY.md).

## Editing and compatibility

The rule inspector exposes «Граница вложенного контракта» and «Применимость
стилевого правила». Invalid combinations block compilation and reviewed-save with
field feedback; they may be retained as Draft, but never execute as valid rules.
JSON/ZIP export retains manual fields and compiled `customizationPolicy` entries;
`runtimePolicy.ruleScopeFactsVersion=1` opts in to the factual adapter. Compiled
JSON stays read-only. Historical r16 snapshots/compiled output replay unchanged.

Button r17 opts exactly five existing rules in, returning them to Draft; all 26
RuleIDs, 51 parent predicates, generated facts and pinned Spinner r8 remain.
Seven archived BS snapshots verify the new semantics, not fresh live acceptance.
