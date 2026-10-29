# ComponentContract Editor

Visual Figma plugin for authoring and validating the manual layer of an Apollo
`ComponentContract`. The Editor keeps generated Athena/Figma facts read-only and
lets an author define component semantics, customization policy and typed
constraints without editing JSON or RuleIR by hand.

Current release: **Editor 0.2.108 / shared core 0.1.23**. The project is
experimental: contracts and reports are deterministic, but production readiness
still depends on acceptance of the component package and its consumer runtime.

## What you can do

- import an Athena package, an authoring ZIP or an existing ComponentContract;
- switch between component representations, variants and variable modes;
- inspect the component anatomy and observed facts;
- create permissions and typed constraints for a component or semantic target;
- validate a selected Figma instance with the shared Predicate Engine;
- export the canonical manual source, compiled contract and validation report.

The Editor authors component-scoped rules only. Pattern, page and product
composition rules stay with their respective owners. Compiled JSON is output,
not a manual source of truth.

## Install the ready-to-use plugin

The repository includes the current build in `dist`, so no local build is needed
to try the plugin.

1. Clone or download this repository.
2. In Figma Desktop, open **Plugins → Development → Import plugin from manifest**.
3. Select `manifest.json` from the repository root.
4. Run **ComponentContract Editor** from the Development plugins list.
5. Open the **Каталог** tab and click **Загрузить пакет**.

The plugin has no network access. Preview nodes are temporary and are removed
from the document after capture, including error paths.

## Basic workflow

1. **Import** an Athena file set/ZIP or a previously exported authoring package.
2. **Choose a component** when the package contains several components.
3. **Inspect** representations, variants, modes, anatomy and observed facts.
4. **Author** the component passport and its rules. Use quick protection groups
   for common appearance or Auto Layout constraints, then refine individual
   rules when needed.
5. **Validate** a selected instance on the **Проверка** tab.
6. **Export** the authoring ZIP. It contains the manual source, compiled contract
   and compiler/coverage report.

The detailed Russian guide covers permissions, rule scopes, component
properties, nested instances, diagnostics and report interpretation:
[`docs/USER_GUIDE.ru.md`](docs/USER_GUIDE.ru.md).

> Validation reports can contain layer names, text, properties and the complete
> manual source. Review a report before sharing it outside your team.

## Build from source

The Editor and Apollo use one canonical compiler/runtime implementation. The
Editor intentionally imports that core from a sibling checkout instead of
maintaining a fork, so clone both public repositories with these directory names:

```text
workspace/
├── Apollo/
└── ComponentContractEditor/
```

```bash
mkdir workspace && cd workspace
git clone https://github.com/Ackedze/apollo.git Apollo
git clone https://github.com/Ackedze/ComponentContractEditor.git ComponentContractEditor
git -C Apollo checkout 0d044442920b20720da8407fe170f5b1d3b032ff
cd Apollo
npm install
npm --prefix packages/component-contract-core run build
cd ../ComponentContractEditor
npm install
npm run typecheck
npm run build
```

The Apollo commit above is the compatibility pin accepted for Editor 0.2.108.
Using a newer Apollo `main` can intentionally change compiled hashes and legacy
replay results; update the pin only together with an Editor compatibility pass.

Useful commands:

```bash
npm run build      # rebuild dist/code.js, dist/ui.html and dist/core.cjs
npm run watch      # rebuild after explicit saves
npm run typecheck  # TypeScript check only
npm test           # full maintainer suite; requires the complete Apollo workspace
```

`dist` is committed intentionally: Figma can import the plugin immediately from
`manifest.json`, while source builds remain pinned to the shared Apollo core.
The complete `npm run validate` gate also reads accepted fixtures from sibling
`shared/design-system_ab` and the Predicate Engine from `services/apollo-proxy`;
those maintainer-workspace inputs are not vendored into this repository. The
published 0.2.108 build passed all **859** tests against the compatibility pin.

## Repository map

- `src/` — Figma controller, UI and Editor-specific adapters;
- `dist/` — ready-to-import plugin build;
- `tests/` — unit and browser-level authoring checks;
- `docs/USER_GUIDE.ru.md` — complete user guide;
- `docs/` — contract semantics and implementation notes;
- `manifest.json` — Figma development-plugin manifest.

## Status and scope

This repository publishes the Editor source and build. It does not publish a
Figma Community listing, install or update Apollo Proxy, or certify individual
component contracts as production-ready. There is currently no separate package
or npm release.

## Development history

Core **0.1.21** / Editor **0.2.107** используют одну реализацию dependency usage:
compiler, runtime и report больше не имеют отдельной Editor-ветки. Version1,
producer0.2.104 и текущие контрактные проекции сохранены; native/Ready и
Apollo admission с Draft dependencies не повышаются этим переносом.
`CC-COMPAT-DEPENDENCY-USAGE-01`.

Core **0.1.20** / Editor **0.2.107** сохраняют независимо доказанный baseline
вложенного owner и точную идентичность разрешённого public swap root и объявленных
configured targets. RESET пересчитывает только производную неопределённость;
неизвестные actual facts, native owner/source и independent-reference guards
сохраняются. Нормы и контрактные hashes не меняются; native/Ready приёмка отдельная.
Совместимость: `CC-COMPAT-NESTED-OWNER-TARGETS-01`.

11.10.2026: Editor **0.2.103** / core **0.1.17** добавляют explicit
`declaredTargetConfigurationVersion=2`. Разрешённый внешний INSTANCE_SWAP
сохраняет native slot identity при смене asset; высота слота, host layout и
типографика продолжают проверяться. V1 и старые пакеты сохраняют прежние pins.
Link r4 проверен offline; новый installed cycle и независимая приёмка открыты.
Совместимость Apollo: `CC-COMPAT-DECLARED-TARGET-CONFIGURATION-04`.

Локальная база 09.10.2026: Editor **0.2.95**, core **0.1.14**. BenefitCard r5 использует opt-in declared identity v3: независимая continuity настроенного native occurrence, исходный baseline запретов и доказанная root applicability. Historical policies 1/2 сохранены. Core273 / Editor825 / Apollo 590 прошли; свежая live-приёмка, зависимости и публикация открыты. Подробности — CC-COMPAT-NATIVE-CARD-FACTS-03.
## Общее ядро с Apollo

С 01.10.2026 `src/core` переэкспортирует versioned core из соседнего
`../Apollo/packages/component-contract-core` (0.1.9). Общий Figma capture
используется через `captureInstanceAudit`; Editor ZIP export остаётся в приложении.
Для сборки нужен sibling checkout Apollo. Зависимости устанавливаются как
прежде через npm; normative packages не копируются. После переноса выполнен
полный `npm run validate`: 699 тестов прошли.

Experimental Figma plugin for authoring the manual layer of one component-scoped
`ComponentContract`. Generated Athena/Figma facts are read-only; RuleIR, runtime
policy, capability coverage and hashes are compiler output.

Практическая инструкция: [`docs/USER_GUIDE.ru.md`](docs/USER_GUIDE.ru.md).
Открытые продуктовые задачи: [`docs/BACKLOG.ru.md`](docs/BACKLOG.ru.md).
План доработок для ручного authoring ButtonsGroup:
[`docs/BUTTONSGROUP_EDITOR_PLAN.ru.md`](docs/BUTTONSGROUP_EDITOR_PLAN.ru.md).

Изменения, влияющие на чтение контрактов, в той же задаче фиксируются в
[бэклоге совместимости Apollo](../Apollo/docs/ARCHITECTURE_BACKLOG.md#apollo-совместимость-с-componentcontract-editor).
Обязательный процесс описан в [`AGENTS.md`](AGENTS.md); общая реализация core
не заменяет проверку интеграции и release потребителя.

Актуальные состояния PARITY-001–018 и очередь после сверки 05.10.2026:
[срез бэклога Apollo](../Apollo/docs/ARCHITECTURE_BACKLOG.md#сверка-с-editor--05102026).
Готовый общий код не переносится повторно; consumer tests, свежие captures
и release имеют отдельные статусы.

Локальное исправление PARITY-014 на текущей базе core **0.1.9** / Editor
**0.2.90** ограничивает сравнение host modes/catalog коллекциями, подтверждёнными
наблюдаемыми bindings окружения, включая selected-mode alias chains. Fresh capture отмечен
`hostContextVariableModesVersion=1`; raw modes/catalog и reference сохраняются.
Смена варианта больше не блокируется из-за исчезновения неиспользуемой metadata.
Изменение используемых modes/bindings и недоступное evidence сохраняют gap;
старые отчёты воспроизводят прежний результат. Gates: core **68/68**, Editor
**819/819**, Apollo **144/144**. Fresh Figma и release/Proxy acceptance открыты;
версии приложений и опубликованный release этим локальным исправлением не менялись.

## MVP workflow

**Editor 0.2.90 / restored icon correspondence (2026-10-05).**
Core 0.1.9 accepts different local Figma main-component IDs only when both
independent sides prove the same canonical component key/set and a unique
owner-relative source node. Each source identity must still match its local owner;
missing, foreign or ambiguous proof stays incomplete. Recompiled active icon locks
opt into `instanceMainComponentAliasesVersion=1` and require producer 0.2.90.
Re-export the existing authoring ZIP without changing rules or bindings to use
this profile. Manual hashes and exact child pins remain unchanged; historical
compiled artifacts retain exact replay. The profile also applies to child checks
without rewriting their pinned contracts. Local core/Editor/v4 and browser checks
passed; fresh Figma and published consumer acceptance remain open in
EDITOR-INSTANCE-MAIN-ALIASES-001 / APOLLO-V4-PARITY-018.

**Editor 0.2.89 / icon port choices across sizes (2026-10-05).**
The identity lock port picker also offers declarations from an exact pinned
child contract at the matching nested owner path and compatible Figma platform.
Declarations are labeled separately from current preview API; stale, conflicting
or missing pins cannot supply choices. Nothing is selected automatically or
promoted to captured evidence. ButtonsGroup's SingleIcon prohibition applies to
all sizes: keep all-variant applicability and select Icon-16, Icon-20 and Icon-24.
Core remains 0.1.8; the compiled feature still requires producer 0.2.88. Source
format, runtime proof, exact pins and historical replay are unchanged. The
correction is tracked in the existing asset-lock backlog items below.

**Editor 0.2.88 / preserve the original icon (2026-10-05).**
`dependencyDomain` offers “Сохранить исходную иконку”: select confirmed nested
INSTANCE_SWAP owners and available port names, without typing asset keys or the
unchanged boolean. It writes `field=changed`, `values=[false]`, `require-domain`.
A typed subject condition such as Button `SingleIcon=True` limits the check.
Core 0.1.8 compares the actual asset with its independently proven library host
variant port, including a proven ancestor Button variant; the replacement's own
reference cannot approve a swap. Missing identity, ports or reference evidence
remain incomplete. The new package opts into `assetIdentityLockVersion=1` and
marked bindings, requiring producer 0.2.88; historical packages keep their wire
format and hashes. Existing saved ports remain selectable when preview is offline.
Tracked in EDITOR-SINGLEICON-ASSET-LOCK-001 / APOLLO-V4-PARITY-017. User authoring,
fresh Figma acceptance and published consumer acceptance remain separate.

**Editor 0.2.87 / existing rules without live anatomy (2026-10-04).**
Existing rules save against their declared targetId even before preview or when
the current layer cannot be resolved. Asynchronous preview/test capture preserves
the edited target; new rules still require a selected layer, and a missing declared
target blocks saving with an explanation. Importing into retained live anatomy
no longer shows the missing-structure warning; an offline import explains that
existing rules are editable while waiting for preview. Core remains 0.1.7;
formats, normative bindings, dependency pins and runtime completeness semantics
are unchanged. Synthetic browser regression and local author package status-only
roundtrip passed; compatibility is tracked in EDITOR-EXISTING-RULE-OFFLINE-EDIT-001
and APOLLO-V4-PARITY-016.
Validation: Editor 805/805 and Apollo local 112/112. Legacy Apollo
typecheck/build/runtime parser pass; its full test gate remains blocked by the
existing missing CardImage compiled fixture. Published consumer acceptance is separate.

**Editor 0.2.86 / search rules by Rule ID (2026-10-04).**
The card list filters by full or partial source Rule ID, without case sensitivity.
An exact full ID takes precedence over rules whose IDs contain the same prefix.
The UI shows the result count, explicit empty results and a clear action; Escape
also clears the search. The filter survives opening a rule and returning to the
list, and resets when another component is loaded. Typecheck/build and local
Chrome checks passed, including narrow windows and unchanged manual source.
This is UI-only; shared core remains 0.1.7.

**Editor 0.2.85 / rule Rationale on hover (2026-10-04).**
Rule cards show the existing Rationale in a floating tooltip on hover or keyboard
focus. The tooltip stays inside the window, follows the card during scrolling,
supports long text with its own scroll and closes with Escape or when opening
the rule. Empty Rationale has an explicit placeholder. The list does not shift.
Typecheck/build and local Chrome checks passed: hover/focus, scroll, long/empty
text, four viewport edges, click-to-edit and unchanged manual source.
This is a UI-only change; shared core remains 0.1.7.

**Editor 0.2.84 / dependency capture diagnostics (2026-10-03).**
Failed native child capture now preserves optional `failureDetails` (version 1,
stage, bounded error name/message) in the private snapshot and explains the stage
in the existing incomplete-coverage reason. This diagnostic build does not fix
the underlying Figma failure. Failure codes, verdicts, reference requirements,
contract formats, exact pins and producer minimum stay unchanged; archived reports
without diagnostics replay unchanged. Acceptance is tracked in
EDITOR-DEPENDENCY-CAPTURE-DIAGNOSTICS-001 / APOLLO-V4-PARITY-015.
Validation: Editor 805/805, core 27/27, Apollo 112/112; diagnostic JSON export
and exact replay passed. The latest private report replays exactly with four
failed captures. Legacy Apollo build/parser pass; full test gate still needs the
existing CardImage compiled fixture. Fresh Figma diagnostic acceptance is pending.

**Editor 0.2.83 / native occurrence reference capture (2026-10-03).**
Native capture resolves source occurrences through fresh verified owner/source evidence
and capture-local Figma locators in actual and independent cloned library stages.
Equal names, rename/reorder and imported main IDs no longer prevent a proved nested
variant baseline. Missing/ambiguous/stale evidence stays incomplete; legacy paths
and variant → nested swap capture remain supported. Core 0.1.6 keeps schema/reference
formats, exact pins and minimum producer 0.2.80. UI guidance distinguishes catalog
drift, missing selected-variant bindings and unavailable nested reference.
Validation: Editor 802/802, core 19/19, Apollo 111/111. Fresh Figma and published
release acceptance remain tracked in EDITOR-INSTANCE-REFERENCE-ADDRESS-001 /
APOLLO-V4-PARITY-013. Legacy Apollo tests still need the existing CardImage fixture.


**Editor 0.2.82 / typed property values (2026-10-02).**
Finite Component Property values come from the matching catalog/semantic API and
exact pinned child package. Property selection infers its type; checkboxes allow
one or several values in domains, collection filters/conditions and dependency
variant constraints. The current preview does not limit the available choices.
VARIANT strings keep their case; BOOLEAN keeps its JSON type. A saved value absent
from the known API remains visible and requires explicit correction before Save.
Missing catalogs preserve historical values without inventing choices. Free TEXT
and numeric ranges remain editable. Source schema, core 0.1.5 and producer minimum
0.2.80 are unchanged; exact dependency pins survive ZIP/edit roundtrip.
Validation: Editor 790/790, Apollo 108/108 and Chromium form/roundtrip/layout
checks. Live authoring acceptance remains in EDITOR-PROPERTY-VALUES-001;
consumer compatibility is tracked in APOLLO-V4-PARITY-012.

**Editor 0.2.81 / Applicability defaults (2026-10-02).**
Applicability collapses each time a new rule is created or an existing rule is
opened. Expanding it while editing one rule no longer expands the next rule.
The summary retains its scope description; applicability errors reveal their
fields. This changes form state only, with the existing core 0.1.5 and compiled
producer minimum. Validation covers new/edit transitions, error reveal and ZIP
roundtrip in Chromium, plus typecheck/build.

**Editor 0.2.80 / live capture fixes and compact rule form (2026-10-02).**
Production-shaped captures keep Figma provenance IDs separate from local graph
IDs. Two proved root targets can address the same root through explicit
`rootTargetAliasesVersion=1`; these packages require producer 0.2.80. Nested
collisions and missing identity/reference evidence stay incomplete. Direct child
capture comparison ignores only unused mode catalog inventory and still checks
actual modes, required metadata, bindings, styles and topology.

The property picker includes `composition.members` with Russian search. Execution,
ownership, applicability and typed constraints collapse with summaries; draft
values remain intact and errors reveal their fields. Focus scrolls the authoring
pane without shifting the viewport header/footer. Source manual and dependency
pins remain unchanged. Validation: Editor 786/786, core 5/5, Apollo 107/107;
Chromium covers search, keyboard toggles, error focus, ZIP roundtrip and responsive
layouts. Fresh Figma negative/reset and published consumer acceptance remain in
EDITOR-BUTTONSGROUP-LIVE-001 / APOLLO-V4-PARITY-011.

**Editor 0.2.79 / collection root roles (2026-10-02).**
Collection and nested dependency rules accept a resolved declared root anchor with a role such as
`buttons-group`. Nested, unresolved or conflicting alias anchors still fail;
the historical reserved `root` route and independent runtime source/identity
checks remain unchanged. Scope errors point to the scope field.
Shared core 0.1.4 keeps schema/runtime formats unchanged. Editor 783 tests,
core 5 tests and Apollo 104 tests pass. Browser save/export/reopen and scope
error checks pass with a root alias. User live acceptance is tracked in
EDITOR-MEMBER-COLLECTION-ROOT-001.

**Editor 0.2.78 / dependency source ZIP import (2026-10-02).**
Reviewed source-only dependency ZIPs compile through the existing shared core
with exact transitive closure checks. Supplied compiled output still requires
an exact source match. Import progress/errors remain visible inside the passport;
failed replacement preserves the previous package. Root roles need not be named
`root`, and root aliases do not appear as child occurrences. A selected layer can
be registered as a semantic target without creating a rule; the existing source
proof and explicit remap confirmation still gate its per-variant binding.
The shared core remains 0.1.3; runtime formats and consumer release are unchanged.
Validation: Editor typecheck/build and 780 tests, core 5 tests and Apollo
103 tests pass. Browser checks cover the reported source ZIP import, visible
failure/retry, unchanged host rules/targets, semantic target registration and
confirmation, collection forms and 18 responsive/dialog layouts.

**Editor 0.2.77 / direct children and typed collections (2026-10-02).**
The first five ButtonsGroup development stages are implemented. A read-only
child package can be pinned once and bound to several direct occurrences through
owner/member/representation forms. Membership includes hidden children; child
execution requires proved visibility. New `memberCollection` constraints express
closed composition, filtered counts, first/last position, typed member domains,
host mapping and host requirements. Nested asset rules can use a typed
`dependency.subjectCondition` on their semantic subject. Forms retain the JSON
advanced route, exact pins and ZIP/session roundtrip.

Compiled packages declare the optional direct-child, member-collection and
subject-condition runtime versions. One missing sibling does not suppress a
separately proved later child violation. Missing evidence remains explicit in
coverage, including findings that also contain a known violation. Legacy
unmarked paths and wrapper dependencies retain their historical route.
Live acceptance of the user-authored manual and release/Proxy integration are
tracked separately in the linked backlogs. Root Hug/Hug is not reintroduced.
Validation: Editor typecheck/build and 774 tests, shared core 5 tests and Apollo
103 tests pass. Chromium verifies form authoring, exact ZIP reopen and session
restore; responsive layouts, occurrence remap and export names also pass.

**Editor 0.2.75 / independent same-name occurrences (2026-10-01).**
Same-name siblings keep separate capture, reference and catalog addresses.
Validated source lineage proves correspondence; local capture IDs and normalized
Athena IDs only store data. The catalog retains all 16 ButtonsGroup variants.
Use explicit target remap to bind each occurrence in the selected Size/Overflow
and representation. A binding is saved as `variantHints` and does not transfer
to another variant. Missing evidence stays unknown; old unmarked reports retain
their original path semantics. Compiled packages declare `occurrenceAddressVersion=1`.
This was the first code stage of the ButtonsGroup plan; the following code stages
are included in 0.2.77. Live acceptance remains open.
Validation: Editor typecheck/build and 753 tests, core 4 tests and Apollo
100 tests pass. Chromium verified the confirmed per-variant remap and ZIP reopen,
plus 18 responsive/dialog layouts. The legacy Apollo test runner remains blocked
by the existing missing CardImage compiled fixture.

**Editor 0.2.74 / platform-aware ZIP names (2026-10-01).**
ZIP downloads retain the family name and identify the declared platform scope:
`CorporateContent.component-contract.zip` for desktop and
`CorporateContent.mobile-web.component-contract.zip` for mobile-web. A package
with several platforms lists the whole scope, independently of the active
preview. Archive entries, manual/compiled data and hashes keep their existing
export behavior. Existing archives remain importable.
Validation: typecheck/build and 740 tests pass. Chromium verified actual desktop
and mobile downloads and exact manual/compiled JSON roundtrip.

**Editor 0.2.73 / imported component source identities (2026-10-01).**
The workshop report from 0.2.72 remained incomplete: remote main components
expose locally remapped child IDs, while their instances retain library IDs.
Capture now proves these identities against a separately created pristine
instance of that exact imported main component and always removes it. Only
ambiguous sibling groups request this reference. Unavailable, corrupt or foreign
evidence stays incomplete; actual layers cannot act as their own source.

The complete capture pipeline on the reported workshop instance now matches
6/6 nodes and executes all 17 checks: 15 compliant, two violations for clipping
and modal background, zero inconclusive/notExecuted. Temporary references were
removed and the original instance was unchanged. The 0.2.71 and 0.2.72 reports
still replay their original incomplete results. Editor validate: 736/736 tests;
shared core validate and Apollo 98/98 passed. The user's 17:59:37 UTC report
from Editor 0.2.73 confirms six matches and the two expected violations; complete
engine and Editor results replay exactly. The 18:09:18 UTC reset report gives
17 compliant / zero violations; the owner accepted the six mobile Figma rules.
Mobile Predicate is Ready for that scope. Private evidence is stored under
`design-system_ab/experiments/web-corp/CorporateContent/mobile-web/authoring/reports`.

**Editor 0.2.72 / equal-key component-owned occurrences (2026-10-01).**
New captures record `source.instanceSourceIdentityVersion=1` and a verified
source-layer identity for each eligible nested instance. The inherited ID is a
candidate only: capture proves its full relative ancestor chain against the
nearest owner's actual main component, stopping at nested instances and SLOTs.
Correspondence requires one unique occurrence on both actual and independent
reference sides under the matched owner and parent. Explicit property ports
cannot contradict it. Missing, foreign, duplicate or unknown evidence stays
incomplete; names and sibling order cannot disambiguate equal-key instances.
Library keys still govern replacement/variant boundaries and baseline authority.

This resolved the ambiguity for local main components while preserving the
observed names, order and overridden values; imported mains require 0.2.73 above.
Synthetic plugin capture verifies six matches, clipping/modal/opacity negatives,
reset and external Body omission. Two temporary instances in the source Figma
file independently confirmed distinct source-layer identities and were removed.
The original 0.2.71 report replays unchanged; it cannot supply the new evidence.
The subsequent 0.2.72 workshop report exposed the imported-main limitation.
Verified: Editor typecheck/build and 727 tests (28 new regressions), shared core
validate, Apollo validate with 98 tests. Legacy Apollo v3 typecheck/build/runtime
compatibility pass; its full test gate stops on an absent CardImage compiled fixture.

**CorporateContent acceptance / 2026-10-01.** The owner accepted manual r11
for six declared desktop rules / 17 RuleIR checks. Five archived reports replay
the complete engine results; the broader Body matrix is owner-attested without
new JSON evidence. Source ZIP/manual semantics are unchanged. Section/mobile/page
patterns, external payload contracts and code parity are outside acceptance.
Code Connect Body → children is locally verified; Figma currently stores only
a source/name pointer (hasTemplate=false). Full template publication is pending.
This records scoped acceptance, not a new Editor release.

**Editor 0.2.71 / capture topology and bounded external SLOT (2026-09-30).**
Capture stores parent/child edges once by local occurrence, checks duplicate,
cyclic/conflicting Figma IDs, and never overwrites the first occurrence in an
ID map. Invalid identity/topology remains incomplete with a concrete diagnostic;
the 500-node limit is unchanged and still applies to genuinely large full captures.
For an unconditional reviewed open native SLOT, a conservative plan is derived
from the current compiled contract. The independent library reference is captured
first. Only a unique direct-root SLOT anchor can stop the actual walk at the
component-owned boundary. Content-target rules, recursive rules, dependencies,
transitions, structural/content predicates and ambiguous anchors use full capture.
Runtime re-proves every omission against the current manual hash, policy, host
identity, actual anchor and independent reference. Cached/stale plans cannot hide
new checks. UI and JSON explicitly state that external content was not checked.
CorporateContent manual r10/ZIP is unchanged; no normative rule was added.
Live negative re-test at 16:23:15 UTC confirms bounded capture: 2/2 nodes
matched, 18/18 checks executed, 16 passes and two root-layout violations
(Height HUG vs FIXED, top padding 50 vs 40). Exact classification replay and
the current r10 ZIP/manual hash match. External SLOT payload was explicitly
not checked. User-authored manual r11 removes vertical sizing from the locked
layout selection; this is unrestricted sizing, not a FIXED/HUG domain rule.
Live reports at 17:22:48 / 17:23:35 UTC preserve HUG: padding 50 yields one
violation, reset to 40 yields 17 passes. Both execute 17/17 checks, match 2/2
nodes and replay classifications exactly; the current r11 ZIP hash matches.
The P0 capture negative/reset cycle is accepted; the broader Body matrix remains pending;
this does not finalize CorporateContent. The source of anomalous API IDs is not claimed to
be repaired in Figma itself; outside-scope payload no longer corrupts host capture.
Offline bounded reconstruction of the two user reports yields 18 determinate
checks: HUG vs library FIXED in both, plus top padding 50 vs 40 in the second.
This is not a corrected live report or acceptance; root policy was not weakened.
Verified: typecheck/build, 699 tests (31 new capture/scope/report regressions),
native-slot UI save/reopen and 36 layout checks. Both original incomplete
reports replay unchanged; the user-authored r10 ZIP/manual hash is unchanged.

**Editor 0.2.70 / explicit open native SLOT (2026-09-30).**
Native Figma SLOT nodes offer the policy capability `composition.content` and
prefill their exact `slotContentId` when Slot API is selected. The author must
explicitly declare external payload ownership; a blank slot target means the
selected semantic target. No manual rule is generated or rewritten automatically.
Runtime evidence requires a unique native anchor, identity-proven owner and an
independent complete reference. Component-owned recursive baselines exclude
only the payload, not the SLOT boundary or host. This is not child-contract
validation and does not require Section. Unproven boundaries become
«Не выполнено» even for a policy-only rule. Existing BOOLEAN/swap contracts
retain their compiled output. CorporateContent remains user-authored r9;
live Body acceptance and separate Body layout permissions are pending.
Verified: typecheck/build, all 668 tests, native-slot browser save/reopen,
18 responsive layouts and 18 dialog layouts. These are offline/browser
checks, not acceptance of a live user-authored Body rule.
All nine accepted CorporateContent grid/mode reports replay exactly;
the current authoring ZIP retains the original r9 manual hash.
Subsequent user-authored r10 adds the Body policy without compiler errors.
Two live reports at 14:58/14:59 are **not accepted**: capture repeats three
Figma IDs across 500 entries, corrupts topology and reaches its limit. All
18 engine checks are unknown; Body boundary and capture are not executed.
Exact replay confirms these results. Capture repair is the next P0; this is
not a reason to weaken Body policy or increase the node limit.

**Editor 0.2.69 / visible capability labels (2026-09-30).**
Long technical fact paths no longer consume the human-readable label's grid
column: single-property options display the label above the truncated path.
This fixes the invisible collection names observed in live mode authoring.
Mode capture, predicates and the user's manual archive are unchanged.
Verified: typecheck/build, 20 mode/capture tests, browser label geometry and
rule save/reopen, 18 responsive layouts and 18 dialog layouts.
Live 13:44:51 on user-authored CorporateContent r9 confirms the modal-grey
negative case: one mode-domain violation, 17 passes, 18/18 checks executed,
exact replay preserved. Three subsequent reports at 13:50–13:51 accept both
page modes, modal white, and reset from modal grey to page grey. All four
captures execute 18/18 checks and replay exactly; the current r9 ZIP matches
their manual source. Body/Section and full component acceptance remain pending.

**Editor 0.2.68 / named variable-mode domains (2026-09-30).**
Live capture resolves collection identity through the Figma API and exposes
`variable.modes.<collectionKey>`, plus read-only names and mode IDs. A
`propertyDomain` constraint offers named multi-select values and compiles to
the existing `one-of` predicate. Unavailable, invalid or ambiguous modes stay
unknown; catalog defaults and paint colors never supply an active-mode fact.
Raw `resolvedModes` remain in diagnostics but are hidden from the authoring
property list. Existing manual r8 remains unchanged; the CorporateContent
author adds its page-background mode rule in the Editor next.
Verified: 652 tests and typecheck; named mode UI save/reopen, 18 responsive
layouts and 18 dialog layouts pass. Missing node mode evidence and incomplete
collection metadata do not break capture/preview. Import regression compares
rules/targets to the user's current ZIP rather than a stale rule count.

**Editor 0.2.67 / CorporateContent grid and clipping facts (2026-09-30).**
The plugin now captures each frame's `layout.gridStyleId` and
`layout.clipsContent` from both the selected instance and its independent
library reference. These are separate capabilities; the meaning of
`auto-layout@1` is unchanged. No CorporateContent manual rule was added or
revised. The old CorporateContent rule ownership is mapped in its authoring
`RULE-OWNERSHIP.md`. BackgroundPlate Color mode remains pending until the
selected mode can be proven from Figma facts, including default-mode cases.
Live grid/clipping negative and reset cases are required before authoring
reviewed rules.
Missing actual/reference grid or clipping facts yield an incomplete check.
Verified: 646 tests and typecheck; 18 responsive layouts and 18 dialog layouts
using the bundled Playwright runtime and installed Chrome.
Live acceptance completed on manual r8: five reports produce 0/1/2/1/0
violations with all 17 checks executed; each report replays exactly. This
accepts grid/clipping protection, not the full CorporateContent contract.

**Editor 0.2.66 / CorporateContent validation repair (2026-09-30).**
Native Figma SLOT content may differ from the library placeholder without
invalidating the component-owned root and slot baselines. Athena's synthetic
`raw` group for a standalone component is not treated as a Figma property.
Local recalculation of the three CorporateContent captures against a reference
reconstructed from the clean capture and Athena structure yields a clean case,
one padding violation and one fill violation, respectively. No manual rule was
changed; live acceptance still requires a fresh run with 0.2.66.

**Editor 0.2.65 / CorporateContent export-import repair (2026-09-30).**
Old four-file drafts now restore navigable anatomy from compiled variant evidence.
Import an old draft ZIP together with its Athena JSONs to recover full layer facts;
new exports include those read-only sources and retain the authored manual rules.
The current CorporateContent authoring ZIP has two draft rules; final contract
acceptance and React Code Connect are subsequent steps.

**AmountStyles r10 accepted / Editor 0.2.64 unchanged (2026-09-30).**
The Figma-scoped contract is Ready, unpublished. Nineteen final live reports and
65 archived exact replays are preserved in the DS package; r9→r10 changes only
review status/revision. See AmountStyles authoring `reports/acceptance.json` for
live/offline boundaries. Swapped-Addon unmatched-node wording remains a separate
diagnostics follow-up; no new Editor/runtime implementation was needed to finalize.

The entries below describe historical implementation steps.

**Editor 0.2.64 / AmountStyles r9 Draft (2026-09-30).**
Generic `propertyForbidden.targetRoles` compiles a finite list of visible semantic
targets, with missing target/reference evidence reported as unknown. The form
exposes the roles; incompatible recursive scope/boundary settings are rejected.
`text.decoration` is captured across all text ranges, for actual and independent
references. Old reports are not backfilled. AmountStyles now has 18 decoration
assertions, excluding text paint and external Addon; Core Amount r5 stays pinned.
Restart the plugin and re-import r9. Live acceptance is pending, not Ready.

**Editor 0.2.63 / AmountStyles r6 Draft (2026-09-29).**
`layoutConstraint.operator=at-most-line-height` compares `bounds.height` against
the proven selected-host TEXT reference identified by `targetRole`. It reuses the
single Predicate Engine numeric comparison; missing/AUTO evidence stays unknown.
The rule form exposes this operator and reference role. Owner cancellation lives
in manual `decisions[].retiredRuleIds`, not a parallel rule source. Single-line was
removed from AmountStyles; height live acceptance and three remaining blocks are pending.

**Editor 0.2.62 / AmountStyles r5 Draft (2026-09-29).**
Nested `slot-api` controls can declare `ownerTargetId`, editable in the rule form.
The resolver verifies that owner's component identity and unique native BOOLEAN
consumer. Only the slot boundary is restored; replacement descendants never inherit
placeholder roles/baselines. Absent owner declarations retain previous root-slot
behavior and exact historical replay. AS-B08c now passes its two Addon checks;
text checks were already passing. Foreign families fail; unknown evidence stays
inconclusive. 35 archived captures preserve all other verdicts. r4 live retest
accepted (0/8 violations); r5 live Addon retest pending. Six context-only rules remain.
Restart Editor and import the r5 ZIP; Core Amount and production are unchanged.

**Editor 0.2.61 / AmountStyles r4 Draft (2026-09-29).**
Explicit `SemanticTarget.variantContinuity` maps a TEXT target to its enclosing
same-family variant anchor. Configure links in the contract passport; changing
them returns affected rules to draft. The runtime requires verified identity,
unique structure and an independent selected-variant host reference. It never
substitutes actual token/style evidence or crosses another instance boundary.
Missing/ambiguous evidence stays unknown. A compiler version gate preserves old
compiled replay. Minor/Currency Opacity changes now retain their declared TEXT
targets: three previously unknown checks reveal real binding violations, while
the clean report still has none. 33 archived captures replay; 602 Editor tests,
272 package tests, typecheck/build and 36 layout checks pass. Restart Editor and
import the r4 ZIP. New live acceptance is pending; six context-only rules and the
separate Addon swap mapping gap remain open. Core Amount and production unchanged.

**Editor 0.2.60 / AmountStyles r3 Draft (2026-09-29).**
`positionOrder.orderScope=structural` explicitly includes hidden direct children.
Legacy rules retain visible-only traversal. Unknown/incomplete structure does not
pass; derived order is recomputed from captured child IDs and resolved semantic roles.
The rule form exposes both scopes. A hidden optional child returning not-applicable
no longer marks an otherwise resolved dependency incomplete. Missing capture,
inactive authority and unknown checks still fail closed. Core Amount is unchanged.
The compiler opts into this completion logic through manual metadata
`dependencyCompletionVersion: 1`; archived contracts without it retain exact legacy replay.
31 archived r2 captures replay without loss of actual violations; all 87 AS-B
binding expectations match. Restart Editor and import AmountStyles r3 ZIP.
r3 live retest is pending; six context-only preset rules remain open.

**Editor 0.2.59 / AmountStyles r2 Draft (2026-09-29).**
`bindingConsistency` compares explicit visible semantic TEXT roles using canonical
fill-token or Text Style keys. The shared mode allows any common binding; the
selected-variant Text Style mode uses pinned Athena evidence, not the observed
style as its own baseline. Range capture and cached local Variable ID resolution
preserve raw evidence. Existing Predicate Engine all-equal/count-between perform
the checks; no AmountStyles-specific runtime branch. Missing mappings remain unknown.
Import the AmountStyles r2 ZIP after restarting Editor. Three checks are executable;
six other preset gaps and live acceptance remain open. Core Amount is unchanged.
Offline QA: typecheck/build passed; 575 Editor tests (34 new binding tests) and
272 Amount/Button package tests passed. These results do not replace live acceptance.

In the rule form choose root, Permission «С условиями», constraint «Общие привязки
текстовых частей», binding kind/reference and explicit semantic roles. Only visible
text is included; an undeclared Addon subtree is outside the comparison.

**Editor 0.2.58 / AmountStyles r1 Draft (2026-09-29).**
Fixed dependency bindings now support an owner at the component root and standalone
children without a fabricated componentSetKey. Identity remains exact and fail-closed;
missing/ambiguous keys never match by undefined. The isolated AmountStyles package
pins Amount r5. It is NOT live-accepted: preset-specific gaps remain explicit.
Import `AmountStyles/authoring/editor/AmountStyles.editor-input.zip`; restart Editor
for the updated runtime. Existing Button/Spinner/Amount manual sources are unchanged.
Authored packages can opt into `metadata.publicRepresentationBoundaryVersion: 1`:
only their non-deprecated Figma representations become selectable roots. Internal
Athena structures remain read-only evidence. An empty/unmatched boundary fails
closed. Legacy partial packages keep their sibling-authoring workflow.

**Accepted: Editor 0.2.57 / Amount r5 — Figma component contract Ready (2026-09-29).**
Import `Amount/authoring/editor/Amount.editor-input.zip` r5; no Editor update needed.
All 31 source rules reviewed, 47 RuleIR, 3 explicit policy-only permissions, 0 excluded.
Six new r4 live captures replay exactly; 32 archived snapshots / 1,666 evaluations
retain r4→r5 behavior. Read-only facts unchanged. Acceptance records distinguish
live checks from offline-only boundaries; partial-range detach is NOT a required
manual Figma test. Hub drift, code mapping, product patterns and publication remain
separate follow-ups. See Amount/authoring/reports/acceptance.json and BACKLOG.md.
Verified: 538/538 Editor tests plus typecheck/build; 285/285 selected Amount, Button
and Spinner package regressions. Registry Predicate is Ready for the Figma scope;
seven Hub drift entries remain open.

**Previous: Editor 0.2.57 / Amount r4 — required library Text Style (2026-09-29).**
Restart Editor and import the new `Amount/authoring/editor/Amount.editor-input.zip` r4.
`styleBinding` uses a pinned generated style catalog and compiles to the existing
Predicate Engine `binding-satisfies`. Each visible text range must be bound to an
approved style; different approved styles remain allowed. Missing evidence stays
unknown. Numeric file-local IDs are resolved by BaseStyle.key, never names/fonts.
Independent `textStyleEvidenceV1` range capture does not change legacy appearance
or baseline equality. The feature is opt-in: no hardcoded Amount interpreter and
no global rule injection into Button/Spinner. Two r3 misses now fail during replay;
new live acceptance is pending. All seven Amount authoring controls pass real-UI
save/import roundtrip. Manual is the only editable normative source; compiled JSON
is regenerated. Verified:538 Editor tests,290 package regressions,typecheck,
18 responsive and18 dialog layouts. Historical r3 engine/editor/details replay is exact.

### Previous release

**Editor 0.2.56 / Amount r3 — token colors, Currency text, open Addon (2026-09-29).**
Restart Editor and import `Amount/authoring/editor/Amount.editor-input.zip` r3.
All visible fill/stroke colors in Major/Minor/Currency must be token-bound; different
parts may use different tokens and typography. Custom Currency text is unrestricted.
Standard Currency text uses pinned Athena selected-variant facts, not retained text
overrides of a pristine host. An explicit `textNormalization: trim` ignores outer
spacing only. Missing/ambiguous library evidence stays unknown.

Addon permits any native swap; a visible original placeholder is an error by key.
An explicit `slot-api` BOOLEAN anchor establishes correspondence, never permission
or a baseline by itself. `contentOwnership: external` leaves the replacement's
internals to its own contract while keeping Amount's slot visibility/order checks.
No Amount-specific interpreter or new Predicate Engine operator was added.
New controls (baseline source, text normalization, context domains, slot anchor and
content ownership) are editable and survive ZIP roundtrip. Ready/live acceptance
is still pending; Button/Spinner packages and production routing are unchanged.
Verified:510 Editor tests,290 package tests,18 responsive layouts and18 dialog
layouts; `tests/amount-authoring.browser.cjs` additionally checks4 real-UI save
roundtrips and safe rejection of malformed context JSON.

### Previous release

**Editor 0.2.55 / Amount r2 — public-property and nested-target bindings (2026-09-29).**
Restart Editor; keep the same Amount.editor-input.zip r2. No manual rules, compiled
package bytes or generated evidence changed. Shared property resolution preserves
raw `Name#ID`, accepts only unique typed aliases, includes reference definitions in
collision checks and never repairs stale explicit IDs by display name.
After independent v4 host-variant verification, only the proven boundary root can
regain its semantic target. Descendants stay isolated; foreign replacements, missing
references and manual visual edits do not acquire permission or borrowed baselines.

Re-evaluating the18 archived0.2.54 Amount captures now gives14 complete positives,
2 complete negatives (gap and hidden Major),2 safely incomplete replacements. Major
absence also violates the already-declared visible sequence; that check now executes.
New JSON export/replay is exact and observed facts remain immutable. This is saved
snapshot QA, not fresh live acceptance. Amount remains Draft; its policy gaps remain.

Typecheck and473 Editor tests pass (including29 new binding/live-fixture regressions).
Package suites:244 Button,27 available Spinner and19 Amount tests pass. Two older
Spinner suites cannot start because their user-exported JSON files were deleted
(`spinner-gradient-acceptance`, `spinner-rule-review`); they are not counted as passed.
Amount synthetic fixtures now retain real property IDs and instanceIdentityVersion=1.
Details/retest checklist: Amount/authoring README, BACKLOG and TESTCASES.

**Historical: Editor 0.2.54 / Amount r2 — standalone identity fix (2026-09-29).**
Restart the plugin and reimport the new Amount.editor-input.zip. R1 incorrectly
declared the standalone Amount key as a Component Set, so automatic preview failed
the identity gate. R2 uses componentKey for Amount/Major and real set keys for
Minor/Currency. The shared capture matcher, variant availability and semantic target
visibility now support proven standalone identity; capture facts remain untouched.
Explicit set bindings, unknown keys and reference mismatches still fail closed.
Compiler preflight rejects a set binding contradicted by pinned singleton evidence.
19 Amount tests,444 Editor tests and typecheck pass, including preview/selection VM
capture of the actual ZIP. This is offline verification; live acceptance remains
pending. No product rules, generated evidence or production routes were changed.

**Historical: Editor 0.2.53 / Amount r1 — new Draft pilot (2026-09-29).**
Import `design-system_ab/experiments/web-core/core/Amount/authoring/editor/Amount.editor-input.zip`.
The existing generic builder/compiler is reused; no Amount-specific interpreter.
One coverage fix: a declared component-root condition proven false can exclude a
rule whose target is hidden. An empty selector, target-local condition, unknown
root fact, unresolved mapping or truncated capture never establishes that exemption.
The diagnostic probe runs through the same Predicate Engine. Compiled RuleIR is
unchanged. Amount live acceptance and inner-style/Addon/Currency policy gaps remain
Draft; its old test-contour route is untouched. See the Amount authoring README/backlog.

**Accepted: Editor 0.2.52 / Button r31 — Figma component contract Ready (2026-09-29).**
All22 source rules are reviewed:19 predicate requirements →60 RuleIR and3 policy-only
permissions. No compiler issues/exclusions remain. The obsolete, unreferenced
target.spinner was removed; both dependency bindings and pinned Spinner r8 remain.
The executable constraints are unchanged. A per-rule acceptance map and exact
r30→r31 behavioral parity across115 archived snapshots/32,062 evaluations support
the final review. Typecheck,438 Editor/244 Button tests, schemas andZIP roundtrip pass.

Import Button.editor-input.zip r31 after saving session changes. Its finalization
used Editor0.2.52; it is compatible with0.2.53 (244 Button regressions passed).
Previous inputs/transition pairs need recapture for a changed manual hash.
No new live test round is required for a status-only finalization. Ready does not
mean every capture is complete: missing facts/expectations still remain unknown.
Code representations, product patterns, production Hub migration and publication
are separate follow-ups. Duplicate ControlBlur UI cards remain P1.
See the Button package README and qa/final-readiness-r31.2026-09-29.json.

**Historical: Editor 0.2.52 / Button r30 — inverted palette and library ControlBlur (2026-09-29).**
Owner approved the separate Button_Inverted Spinner matrix for D/M, sizes32–72,
both slots: Accent=True/True, Primary=False/False, other Views=True/False
(Inverted/Static). Ordinary Button is unchanged. Typed dependency cases can add
explicit boolean/enum semanticApi context; overlapping cases are rejected.
No Button-specific interpreter: the shared compiler emits standard Predicate Engine IR.

For ControlBlur, the owner's final clarification selects the actual Figma library
as the normative baseline, not a universal disabled-state matrix. Capture preserves
effect parameters and canonical published style identity in `appearance.effectDetailsV1`.
The existing RuleID compares against an independently rendered matching variant;
missing evidence stays unknown. No specification override or inferred blur defaults.
Old contracts retain exact compilation/replay. Generated facts and Spinner r8 unchanged.

22 source rules →60 Button RuleIR; zero context-only, three policy-only permissions.
438 Editor/238 Button tests and typecheck passed in the implementation step.
On2026-09-29 the owner accepted the Spinner matrix; no new live JSON was supplied
and no BI rerun is requested. Button remains Draft/unpublished.
[ControlBlur fixtures](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13117-65262)
are now created in the existing Laboratory/Button section:16 instances,11 expected
compliant and5 violations. Keys/effects/style identity and card layout were inspected;
The subsequent16 live reports now confirm11 compliant controls and all5 intentional
violations:247/247 matched nodes,0 capture warnings,0 not-executed/inconclusive;
4,482 engine evaluations plus Editor/details replay exactly. ControlBlur functional
P0 is verified. No rerun is needed. CB08/09/12 still produce two UI cards for one
effect edit (general visual-style + detailed ControlBlur); semantic UI grouping is
a separate P1, not a predicate false positive. Sixteen source rules are still draft,
and the pre-existing target.spinner source-resolution warning needs readiness review.
Use Editor0.2.52 and the same r30 input ZIP;
manual/compiled/ZIP were not changed for fixture creation or owner acceptance.
The package TESTCASES.md contains direct links and expected outcomes.

**Historical: Editor 0.2.51 / Button r29 — conditional nowrap mapping (2026-09-29).**
Owner confirmed: nowrap=false permits wrapping, but only an explicitly constrained
container scenario requires FILL. Import the new `Button.editor-input.zip` r29
after saving session changes and restarting the plugin.

The shared compiler's typed `configurationMapping` produces ordinary RuleIR for
independent input conditions and observed target facts. There is no new interpreter.
In specification mode: nowrap=true checks coordinated HUG/Auto width; false with
`constrainedWidth=true` checks FILL/Auto height plus an Auto Layout parent. False
with constrainedWidth=false adds no FILL requirement. Missing required context is
unknown; proven hidden/absent text is N/A, including Loading/SingleIcon. Component
audit still checks intrinsic text profiles without requiring specification inputs.

`manual.validationContext` is a separate, optional scenario declaration, not a
Figma property/code prop/default. UI input, report intent and compiler consume the
same source; context JSON is editable in the contract passport, mapping JSON in
the rule editor. Package/instance/manual changes invalidate supplied expectations.
No blanket baseline exception and no product/pattern rule added.

22 existing RuleIDs →59 Button RuleIR; only nowrap changed, blur remains context-only.
Athena evidence and pinned Spinner r8 are preserved; r28 archived. Typecheck,
432 Editor and233 Button tests, JSON-schema checks, Chromium input/report/authoring
roundtrips and18 responsive layouts+18 dialogs pass. This is offline acceptance;
Owner accepted this P0 on2026-09-29 (“считай принято”), without new live JSON.
NW01–NW09 remain regression instructions, not claimed live evidence; no repeat is
requested now. Button remains Draft/unpublished; blur, Inverted palette and Hub
projection are separate open items. No source/package change for this acceptance.

**Historical development: Editor 0.2.50 — deferred layout visibility groundwork (2026-09-29).**
The applicability probe now honours a valid explicit `visible-target@1` policy
for deferred layout mappings, using the same Predicate Engine conditions as
executable rules. Proven hidden/absent targets are N/A, not passed; unresolved,
ambiguous, truncated or unreadable targets remain pending. Presence/visibility
requirements cannot opt into this exemption, including malformed imported rules.
This does not execute context-only constraints or mark the package Ready.
Typecheck and all426 Editor tests pass, including16 new applicability/replay tests.

Button manual/compiled/input ZIP remain r28, unchanged in this step: **there is no
new Button package to import yet**. Only in-memory test copies opt into the policy.
The `nowrap=false` recipe in Hub is conditional on a narrow container; applying
FILL universally would create a new unsupported rule. Owner confirmation of the
mapping is pending before normative edits, registry sync, regeneration and live QA.
See the current P0 in [`docs/BACKLOG.ru.md`](docs/BACKLOG.ru.md).

**Historical: Editor 0.2.49 / Button r28 — proven-target baseline exclusion.**
Compiler-only correction: exceptions compare node IDs from proven resolved targets,
not a required semantic role on every descendant. The same guarded target query
is used by configuration profiles. Missing optional role on an unrelated layer
does not block its baseline check; unreadable/ambiguous target identity stays unknown.
Manual r28, generated facts, Spinner r8 and the input ZIP are byte-for-byte unchanged.
Compiled Button is rebuilt, not hand-edited. 410 Editor /210 Button tests pass.
All15 old reports replay exactly (2047 evaluations); recompilation changes only
the two false Loading/LeftAddon unknowns to compliant. Genuine sizing overrides
remain violations. The 0.2.48 package is archived separately.
Live fix accepted on 2026-09-29:23:40:40(specification,block=false) and23:40:55(audit)
capture TL10B Loading (13100:90813). Roleless LeftAddon HUG/HUG is compliant; hidden
text is N/A. 708 evaluations plus Editor/details replay exactly,36/36 nodes match,
zero capture warnings. Each Spinner child run:100 compliant+68 N/A, no violation/unknown.
Re-evaluating these snapshots with the old compiler changes only the former LeftAddon unknown.
The earlier23:36 reports accept TL10A SingleIcon separately (310 evaluations).
Immutable originals and acceptance results are archived in Button/qa. No repeat requested.
No before-state still means width preservation is not executed; nowrap remains
context-only. Those gaps keep the overall check incomplete; this fix does not mark Ready.
Next P0: nowrap and its hidden-target applicability, separate from usage patterns.

**Previous: Editor 0.2.48 / Button r28 — coordinated text layout.**
Save session changes, restart the plugin and import `Button.editor-input.zip` r28.
The manual `configurationDomain` declares complete Hug/Fill profiles for Text,
Label and visible Hint. Fill requires centered, height-autoresizing text; Hug
keeps independent baseline alignment and width/height autoresizing. Only the
listed horizontal-sizing fields are exempted from the internal baseline rule;
vertical sizing, padding, styles and other descendants remain protected.

Audit checks this intrinsic domain without external expectations. Specification
mode additionally accepts the explicit enum “Ширина текстовой области”: hug/fill.
No actual-value/default inference. Missing or stale input remains unknown; proven
hidden/absent text is not checked. The shared compiler emits existing predicates;
no Button-specific runtime or second interpreter. Profiles and the referenced
baseline exception are editable in typed JSON fields; inputs come from semantic API.

22 stable source IDs →57 Button RuleIR,2 remaining mappings (nowrap/blur).
Generated evidence and Spinner r8 unchanged. Local gates:408 Editor/206 Button
tests, Chromium import/enum/report/authoring roundtrip,18 layouts+18 dialogs.
All15 TL reports have been reviewed on 2026-09-29: the scoped text results match
expectations,2047 engine evaluations plus Editor/details replay exactly,226/226
nodes match with no capture warnings. Full acceptance is held by a new P0 in TL10B:
the compiled baseline exception requires semantic.role on nested LeftAddon, which
has no role although actual and baseline are both HUG. Fix the common compiler's
proven-target exclusion, not the component rule or fixture. See the backlog.
TL10 specification reports also leave block unset; those two unknowns are expected.
Draft/unpublished. The prior r27 archive preserves
manual/compiled/ZIP and exact replay. Product/pattern rules remain outside Button.
On 2026-09-29,13 fresh library instances were prepared on the existing Button page:
[TL fixture board](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13100-63800).
Select the Button inside each card; use the card's audit/specification settings.
TL10A/B need both modes (15 JSON reports for the complete set). Canvas properties
and layout were verified; the report review is recorded above. No new package
package revision is needed; for the compiler fix use Editor0.2.49 with the same r28 ZIP.

**Historical: Editor 0.2.47 / Button r27 — component audit vs specification conformance.**
Save session edits, restart the plugin and import `Button.editor-input.zip` r27.
“Аудит компонента” is the default. Intrinsic rules run in both modes; the four
cross-representation mappings are explicitly `applicability.validationMode=specification`
in manual source. They are not passes in audit: JSON states `specificationStatus=not-requested`.
“По спецификации” additionally checks declared expectations. Missing input remains
unknown; unimplemented mappings remain not-executed. The contract stays Draft.
The human label is “Растягивать на ширину контейнера”, not a fictional Figma block property.
Rule scope is editable in Applicability. The shared compiler emits ordinary RuleIR
conditions; the Predicate Engine is unchanged. No rule-name inference or manual JSON
edits to compiled output. Reports pin `snapshot.validationRequest` and intent separately.
Switching mode clears expectations/results; old packages and r26 reports keep exact semantics.
Generated evidence, 22 RuleIDs/55 RuleIR and pinned Spinner r8 are unchanged.
Tests:405 Editor and192 Button regressions; five archived r26 reports replay exactly.
User-confirmed smoke acceptance on 2026-09-28: “всё ок, работает”. Individual
AS01–AS06 JSON evidence has not been supplied; the regression cases remain in
Button/TESTCASES.md. This does not promote the contract to Ready. Pattern runtime is still separate.

**Historical: Editor 0.2.46 / Button r26 — independent expected inputs.**
Save session edits, restart the plugin and import the new `Button.editor-input.zip`.
The collapsed “Ожидаемые параметры” section is generated from manual
`semanticApi[].validationInput` (v1: root-scoped boolean inputs). It never seeds
values from observed Figma facts or semantic defaults. Explicit block=true requires
Fill plus an Auto Layout parent; false excludes that implication, unset stays unknown.
Inputs reset on instance/package/manual changes and are not persisted in the session.
JSON reports include pinned `validationIntent`; core recomputes derived facts and
checks identity/manual hash/type. Stale asynchronous captures are discarded.
No Figma mutation and no new Predicate interpreter. Old packages are opt-out.
22 intrinsic IDs/55 RuleIR,3 unimplemented mappings; Spinner r8/evidence unchanged.
Button_Inverted Loading palette is explicitly needs-confirmation, not inferred
from default Button. BI01–BI05 mechanics accepted from17:31–17:33 reports; BI06/07
were not supplied. r27 changes the audit workflow; Button stays Draft.

The r25 notes below are historical acceptance, not the current import instruction.

**Button r25 — component-only package (2026-09-28), still Editor 0.2.45.**
All five usage rules have physically moved to the future Buttons pattern's manual
handoff source, preserving IDs, scopes, constraints and provenance. Button now has
22 intrinsic rules /53 RuleIR and four pending component mappings. No external
delegation/pending stubs remain in Button. Legacy Athena evidence does not restore
the transferred rules on import. Pattern runtime is not connected; usage=0 means
not evaluated, never policy compliance. Generated facts and Spinner r8 are unchanged.

Import the new `Button.editor-input.zip` r25 after saving session edits. Do not
import the pattern handoff as a ComponentContract. Old packages still contain their
old usage rules; importing r25 is explicit, not a silent session migration.
Local checks:390 Editor tests/typecheck,172 Button tests, browser import/compiled
coverage and historical save gates. Archived r24 snapshots retain all93 intrinsic
outcomes each, with only external Hint evaluation removed.

**Live TR01–TR03 accepted — 15:01–15:02 UTC, 2026-09-28.** AB/AO have identical
93 intrinsic results with visible Hint and zero violations. Root opacity50% in AB
triggers two intrinsic assertions grouped into one card;91 other results unchanged.
All48/48 nodes matched, no warnings/inconclusive;279 engine evaluations plus Editor
and details replay exactly. Three scenario gaps/four package mappings remain;
usage=not-evaluated, not compliant.178 Button tests including6 new live regressions.
Manual/compiled/ZIP and Editor code unchanged; no reimport/release needed.
Button stays Draft/unpublished. Evidence: Button/qa/usage-transfer-live-review.2026-09-28.json;
initial build record: Button/qa/usage-transfer.2026-09-28.json.

### Historical ownership rollout — r24

**0.2.45 — explicit rule ownership / Button r24 (2026-09-28).**
The manual source now declares `rule.ownership = { kind, ownerId }`, separately
from author/team, Product scope and execution route. Kinds: component, product-policy,
pattern, editorial-policy. The compiler copies provenance into customization policy
and RuleIR; ownership never suppresses or reinterprets a predicate. No ID-based inference.

With `metadata.ruleOwnershipVersion=1`, reviewed saves require valid ownership.
New authoring documents enable this model by default; imported legacy documents
are not silently reclassified.
Unclassified legacy rules keep executing but leave explicit coverage/readiness gaps.
Old packages without the marker retain exact report replay. Editor and downloadable
JSON separate component/usage readiness and scenario coverage, with dependency and
capture gaps reported separately. The total remains incomplete when applicable work
is not executed; the split covers loaded requirements, not every possible external policy.

Button r24 retains all 27 IDs /54 RuleIR:22 component,5 usage,4+4 unimplemented gaps.
Product restrictions, conditions, constraints, generated facts and Spinner r8 pin are
unchanged. Save session edits before restart/import of `Button.editor-input.zip` r24;
re-capture Loading before/after pairs after the manual hash changes. The whole package
remains Draft/unpublished. External rules have not moved to a new source or interpreter.
Local gates: typecheck/build,390 Editor tests,159 Button tests (including21 focused
ownership/legacy replay checks),1404 unchanged
archived verdicts/evidence and18 responsive/18 dialog layouts. Registry updated and
readback verified. Fresh Figma ownership smoke tests are listed in Button/TESTCASES.md.

**Live r24 ownership acceptance — 13:22 UTC, 2026-09-28.** OW02 (`ao`) excludes
AB Hint; OW01 (`ab`) reports one usage violation. All93 intrinsic evaluations/trace
are identical on the same instance.16/16 nodes in each capture, no warnings or
inconclusive results;188 engine evaluations plus Editor/details replay exactly.
Three intrinsic and three usage gaps remain. Five regression tests and immutable
gzip originals: Button/qa/rule-ownership-live-review.2026-09-28.json.
OW03 and manual edit/save/reimport are not evidenced by this pair. Contract stays Draft.
The subsequent architecture decision is to remove usage rules from the component
source into their future pattern owner; this review itself does not change r24 rules.

### Previous live acceptance — Editor 0.2.44 / Button r23

**Live acceptance — renamed Addon, 2026-09-28 12:07–12:09 UTC.**
Editor 0.2.44 / Button r23: HUG, HUG, FILL and FIXED all pass the supplied sizing
probes. Each capture matches 18/18 nodes, executes 168 Spinner r8 checks, and has
no violations, capture warnings or inconclusive evaluations. All 1404 engine
evaluations (672 child) and Editor/details replay exactly. The actual `🔩 Addon`
name is preserved while the independent reference path remains `LeftAddon / LeftAddon`.
This acceptance closes the renamed-Addon/root-width regression, not whole-contract
readiness: seven not-executed items remain, including the missing before snapshot.
Spinner itself was not renamed in these live captures. Six archived live regression
tests added; evidence: Button/qa/instance-identity-live-review.2026-09-28.json.
The preceding 12:04–12:05 reports used 0.2.43 and are not patch acceptance.

**0.2.44 — parent-scoped nested instance correspondence (2026-09-28).**
New captures opt in via `source.instanceIdentityVersion=1`. Nested instance names
are diagnostic: correspondence uses a proven unique INSTANCE_SWAP port or unique
component/set identity among siblings under the matched parent. It never searches
globally or pairs by traversal index. Same-set variant changes still require the
independent pristine-host reference chain; matching identity does not approve an
override. Actual names, properties and Figma layers are not rewritten.

The common core shares this correspondence across baseline/variant facts, nested
reference validation, icon-port facts and pinned child-contract resolution. Legacy
reports without the marker retain exact replay. No Predicate Engine, compiler
policy or Button/Spinner manual/compiled/ZIP changes; Button remains r23 / Draft.
Ambiguous sibling identity and duplicate paths remain unknown. Non-instance frame
renames and general partial-topology recovery are not implemented by this patch.

Typecheck/build and the full Editor suite pass; 23 focused tests cover renamed
Addon/Spinner, independent references, swaps, ambiguity, retained violations and
JSON export/replay. 36 Button package regressions pass. Built Chrome verifies r23
import/session save and 18 responsive layouts plus 18 dialog layouts.
These are local/synthetic checks; the separate live acceptance is recorded above.
Keep Button r23, no new package or repeat of these width probes is required.

### Diagnostic evidence before the identity patch

**Latest live review — sizing probes,2026-09-28 11:32–11:36 UTC.**
Three negative probes are accepted: root height FIXED/FILL and internal LeftAddon
width FIXED produce one violation each, with18/18 matched nodes. Three width-domain
probes are blocked, not passed: actual nested name `🔩 Addon` differs from reference
`LeftAddon`, and name-based structural matching rejects all18 nodes despite stable
component/set keys. Each has49 inconclusive evaluations and10 not-executed items.
All1215 engine evaluations and Editor/details replay exactly. Originals archived in
Button/qa/fixtures/sizing-probes-r23; review in qa/sizing-probes-live-review.2026-09-28.json.
The identity-matching P0 was diagnosed in that review and is implemented above;
fresh 0.2.44 reports accept all three width modes. No normative changes. Spinner r8 unchanged.

**0.2.43 — responsive Editor window (2026-09-28).**
The transition toolbar no longer pushes validation results/download below the
window: the workspace fills remaining height instead of subtracting fixed bar
heights. Anatomy, properties, inspector and dialog contents scroll independently.
Actions wrap on narrower windows; low-height spacing is compact. The initial
plugin window is 1200×720 (previously 1440×900).

UI-only update: save session edits before restarting Editor. Button r23, Spinner
r8, manual/compiled hashes, package ZIP and Predicate Engine are unchanged; no
new contract package or repeated BW acceptance is required.
Typecheck/build,359 Editor tests and8 exact r23 report replay tests pass.
The optional `npm run test:layout` browser gate covers18 authoring/validation
layouts from800×500 to1440×900, with/without transition status, keyboard focus,
scrollable inspector/properties/anatomy and18 dialog layouts. It uses an existing
Playwright installation (`PLAYWRIGHT_MODULE`) and optional `CHROME_PATH`, without
adding a production dependency. These are browser layout checks, not live Figma
acceptance of the rebuilt plugin window.

### Previous accepted step — 0.2.42 / Button r23

**0.2.42 — Button r23: root sizing and internal layout (2026-09-28).**
Live BW01–BW06 accepted at11:14–11:16 UTC: violations0/1/1/0/0/0.
Only real width changes192→144/240 remain; missing-before/external-context cases
correctly stay not-executed. FIXED root width/HUG height passes for D/M.
All2066 evaluations (1008 child), coverage/details replay exactly;108/108 nodes,
no capture warnings/inconclusive; unrelated r22 verdicts/traces are unchanged.
Six originals are archived under Button/qa/fixtures/root-sizing-r23; editor/ copies
may be deleted. Eight live regressions added. Manual, compiled, ZIP and runtime
remain unchanged. No reimport or BW retest needed if r23 is already loaded.
Extra width-domain/invalid-height/internal-sizing live probes remain pending.
See Button/qa/root-sizing-live-review.2026-09-28.json. Button remains Draft.

Implementation / first installation:
Save session edits, restart Editor and import Button/editor/Button.editor-input.zip.
The existing root rule accepts horizontal HUG/FILL/FIXED and vertical HUG for D/M.
Internal sizing uses the new generic `descendants` scope: the selected anchor is
excluded, with no Button-specific compiler branch or Predicate Engine extension.
The previous layout policy retains padding/gap/mode/alignment but no sizing overlap.
The Editor supports reading, editing and saving this scope. Structural/dependency
assertions remain self-scoped; unsupported descendants constraints fail validation.

27 source IDs /54 parent RuleIR,8 unimplemented rules; Button remains Draft.
Spinner r8 and generated facts are unchanged.359 Editor tests,138 Button tests and
typecheck/build pass. Six immutable BW r22 reports replay exactly (2313 evaluations,
108/108 matched nodes). Their width transition acceptance is retained, not relabelled
as live r23 acceptance. BW01–BW06 were prepared on the same board with height HUG;
their fresh r23 acceptance is recorded above. New pairs are required after a source
change, not for this acceptance. See Button/TESTCASES.md.
Contextual block/textResizing/nowrap mappings remain separate backlog items.
Built Chrome verifies ZIP import and self/descendants save without constraint loss
or JavaScript errors (archived preview only). Registry rows1596/1598/1837/1839,
Core Predicate Draft and Ledger60 are updated/readback verified; Hub is unchanged.
The legacy unresolved Spinner target warning remains, not silently marked resolved.

### History — 0.2.41 / Button r22

**0.2.41 — Button r22: paired Loading width (2026-09-28).**
Save session edits, restart Editor and import the new `Button/editor/Button.editor-input.zip`.
In validation mode, select a non-Loading Button and press **Запомнить состояние до**.
Enable Spinner/Loading on that same instance, then run the normal selected-instance
check. The downloadable JSON includes both snapshots; the saved pair is session-only.

The existing `loading-preserves-width` RuleID now declares `transitionInvariant`:
dependency state false→true, `bounds.width`, explicit semantic invariants and 0.01px
absolute tolerance. Common core derives evidence; the unchanged Predicate Engine
executes `approximately-equals`. Manual remains the only editable source.
Changing instance/variant, Product/modes, parent layout, invariant API values or
manual revision invalidates the pair. Missing/incomplete capture produces one
**Не выполнено** item, never a pass or an assumed library default width.
Before/after are captured in the same plugin session, in sequence, with mutation
detection during each capture. HUG ancestor dimensions are derived, not fixed
external inputs; fixed parent dimensions, sibling geometry and layout are inputs.
GRID ancestors, excessive topology and unknown dimensions are explicitly unsupported.

Button stays Draft: 26 source IDs,59 parent RuleIR,8 unimplemented rules remaining.
Spinner r8 and Athena facts are unchanged. Typecheck/build,358 Editor tests,146
scoped package tests and the built Chrome paired-capture/edit/download/replay flow
are the local gates; fresh Figma paired acceptance is still pending.
See Button/TESTCASES.md and `qa/width-transition.2026-09-28.json`.
BW01–BW06 now exist as real library instances in the same Button section,
[below the BL block](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13070-63891).
Each card documents the before/after action on one instance; BW05 starts in Loading
without a before snapshot. IDs and verified initial states are in
Button/qa/width-transition-test-cases.2026-09-28.json. Live acceptance remains pending.
The previous r21 manual/compiled/core and live reports remain archived for exact replay.
Google registry: Правила1596 / Леджер59 / Core Predicate Draft; Hub prose not edited.

### Previous accepted step

**0.2.40 — Button r21: configured Hint and effective visibility (2026-09-28).**
Save session edits, restart Editor and import Button/editor/Button.editor-input.zip.
If r21 is already loaded, keep the session: no new package or restart is needed
for the acceptance recorded below.
Manual now declares two independent facts: writable `hintEnabled` maps to the Figma
boolean; read-only `hintVisible` binds `target.hint` to `visibility.effective`.
The shared opt-in materializer uses resolved targets, variant absence and ancestor
visibility. Missing identity/topology or ambiguous/remapped targets stay unknown.
No Button/Loading exception, name fallback, new RuleID or Predicate Engine change.
The existing product restriction and size gate now concern visible Hint; their
product/platform/size domains are unchanged and both return to Draft.

328 Editor +136 scoped package tests pass. Built Chrome UI verifies import,
passport/session roundtrip and exact downloaded JSON replay using archived facts:
BL11 passes, BL12 retains its two violations, BL10 confirms absent Hint. All14 r20
captures preserve unrelated verdicts/traces; r20 artifacts are archived for legacy
replay. Spinner r8 is unchanged. Button stays Draft, including its temporal width check.
See Button/TESTCASES.md and
qa/effective-hint-visibility.2026-09-28.json. Two older Spinner suites still require
deleted original reports and are explicitly excluded from the scoped package count.

**Live acceptance 08:25–08:26 UTC:** BL11/BL12/BL10 are accepted:0/2/0 violations.
Configured Hint remains true in BL11, while effective visibility is false through
hidden Text. BL12 retains the product Hint and Loading-text violations. BL10
confirms actual absence, not unknown. All1258 evaluations (504 child), Editor
coverage/details replay exactly;45/45 nodes, no capture warnings/inconclusive.
Seven live regression tests added;143 scoped package tests pass. Normative manual,
compiled, ZIP, runtime and Spinner r8 are unchanged. The original reports are
archived under Button/qa/fixtures/effective-hint-visibility-r21; editor/ copies
may be removed.4–7 scenario-pending checks and nine contract-wide unimplemented
rules remain. Next functional step: paired evidence for width preservation.
Review: Button/qa/effective-hint-visibility-live-review.2026-09-28.json.

### History — Button r20

**Button r20 — owner-confirmed Spinner-only Loading (2026-09-28).**
Keep Editor0.2.39; save session edits and import the updated Button ZIP (r20).
No compiler/runtime/UI production code changed. The existing Loading RuleID now
contains three quantity constraints: one pinned visible Spinner, zero visible
Label/Hint, exactly one visible addon. Existing size mapping is unchanged.
Hint=True under a hidden Text ancestor passes the Loading rule; actually visible
Hint or a second addon fails. All14 BL01–BL14 live composition cases are accepted.
323 Editor +101 scoped package tests and Chrome import/session/download parity
pass. Live engine/coverage/details replay matches all5792 evaluations (2215 child),
244/244 nodes, no capture warnings/inconclusive. A separate BL11 finding remains:
the product Hint rule reads configured Hint=true, not effective visibility through
the hidden Text parent. Track the semantic distinction before changing the policy.
Paired width evidence remains pending; Button stays Draft. Manual/compiler/runtime
are unchanged during acceptance. Original reports are archived with SHA; see
Button/qa/loading-composition-live-review.2026-09-28.json and the backlog.

### History — Button r19

**0.2.39 — Button r19: evidence-backed Loading composition (2026-09-28).**
Save session edits, restart Editor and import the rebuilt Button/editor/Button.editor-input.zip.
Spinner r8 is bundled unchanged. One existing RuleID now requires exactly one
visible pinned Spinner and zero visible Label nodes when a proven visible Addon
selects Type=Spinner. No invented Figma Loading property or Button-specific runtime.
The inspector edits dependency counts and activation; session edits and JSON replay
are covered by the real built UI with archived facts, not a fresh live audit.

Shared opt-in dependency facts distinguish inactive, broken and unknown bindings.
Hiding/replacing a child does not deactivate its parent's Loading rule. Missing
identity/topology/visibility stays inconclusive. Legacy contracts/replays are unchanged.
323 Editor tests +97 scoped package tests pass; typecheck/build and Chrome pass.
BL01–BL10 are prepared and visually/structurally checked in the existing Figma section.
Live acceptance is pending. Hint/second non-Spinner addon restrictions await owner confirmation.

**Width preservation is a Button behavioral invariant, not a page pattern.**
Its existing component rule stays context-only until paired before/after evidence
is captured; a single Figma snapshot cannot prove no layout shift. Do not compare
to arbitrary master width or mark it passed. Button remains Draft (7 pending in
replayed BP01/BP08;8 in BP13). See Button/TESTCASES.md and qa/loading-composition.2026-09-28.json.

### History — 0.2.38

**0.2.38 — validation follows the actual component key (2026-09-28).**
Restart Editor; keep **Button r18 / Spinner r8** and your saved session edits.
No package reimport is needed. The selected-instance gate reads all root Figma
representations in the current compiled contract, not the authoring variant list.
The actual main-component/set key resolves one representation and its platform
before capturing the instance, independent baseline and nested references. Preview
uses the same identity resolver. Foreign, deprecated, ambiguous and missing bindings
fail closed with a short explanation; there is no mass component-import fallback.
The validation header identifies the actual representation. Authoring selection,
manual identity and session edits are not rewritten; stale source hashes still retry.

The initial13 live BP reports are archived with exact JSON replay (4831 engine
evaluations,2016 child evaluations,235 matched nodes). The first batch accepted12
scenarios; BP08 required a retest because0.2.37 recorded Mobile as desktop,
producing53 human-review results and skipping child evaluation. The initial
corrected-context simulation was not itself fresh Figma acceptance.
316 Editor tests +83 scoped package tests, typecheck/build, VM capture and Chrome
cross-representation/session-edit/report-download checks passed. Button manual,
compiled, ZIP, Spinner pin and Predicate Engine remain unchanged. Contract stays Draft.

**Live retest 05:47 UTC:** BP08/BP01/BP13 now pass with the correct Mobile/Desktop/
Inverted identities. BP08 has no inconclusive results and executes168 child checks;
all1095 evaluations,504 child evaluations and54 matched nodes replay exactly.
All13 palette cases are accepted across the two live batches. One submitted file
is a byte-identical copy of BP13: that batch contained only three new runs. The report does not
serialize the authoring representation dropdown; `component.platform` is normative manual metadata.
Seven live regressions added;90 scoped package tests pass. New reports are archived
in Button/qa/fixtures/selection-key-editor-0.2.38. Runtime/manual/ZIP are unchanged.
See Button/qa/selection-key-live-review.2026-09-28.json and Button/TESTCASES.md.

**Final acceptance 06:16 UTC:** the independent BP01 report submitted for the
reverse scenario is accepted: actual Desktop,0 violations/inconclusive,18 matched
nodes,168 child checks; all398 evaluations/coverage/details replay exactly and
verdicts/traces match the earlier BP01. The authoring [M] setup is the requested
test context, not a serialized UI fact. Key-routing P0 is closed together with
the earlier VM/Chrome cross-direction evidence.92 scoped package tests pass;
runtime, manual, compiled, ZIP and Spinner r8 are unchanged. No reimport required.
Final evidence: Button/qa/selection-key-final-review.2026-09-28.json.
Button remains Draft with8 pending in BP01; next is complete Loading composition.

### History — 0.2.37

**0.2.37 — Button → Spinner palette (2026-09-28).** Import the new
**Button r18** `editor/Button.editor-input.zip` after saving any session edits.
Spinner r8 is bundled and byte-unchanged. One existing RuleID now owns two
`dependencyDomain` tables for `Inverted` and `Static`, across both fixed Addon
bindings. The owner confirmed all sizes32–72 for ordinary desktop/mobile Button;
Button_Inverted is explicitly excluded pending its own matrix.

The shared runtime resolves `representation.surface` only through an explicit
`identity` binding and matching source/root component identity; legacy constant
transforms remain unsupported. Unknown View never falls back to Secondary.
Missing, wrong-type or unknown child VARIANT data and foreign child identity
stay inconclusive instead of producing a false violation/pass. Labels now say
“Вариант компонента” for fixed dependencies, not “Вариант иконки”. No Button-specific
runtime branch, Predicate Engine modification or Spinner rule duplication.

Verified:307 Editor tests,67 scoped package tests, typecheck/build;144 positive and
288 negative palette combinations. Archived BS reports keep all previous
parent/child verdicts and traces; r18 adds only four palette evaluations, reducing
pending from10 to9. Chrome verifies import, session-only mapping edits, evaluation
and downloaded JSON replay using archived facts (not fresh Figma validation).
13 live fixtures BP01–BP13 are prepared in the existing Button section;
see [Button testcases](../../shared/design-system_ab/experiments/web-core/core/Button/TESTCASES.md).
Rule registry1826, ledger56 and Core Predicate Draft were updated and read back.
Live acceptance, full Loading composition and pre-loading width remain open.

### History — 0.2.36

**0.2.36 — explicit reasons for scope exclusions (2026-09-28).**
Hidden text and proven child-owned subtrees now show their specific reason under
“Не применяется”, without a fake `true/false → all true` comparison. The presenter
reads the engine's primitive boolean trace, follows only failed logical branches,
and requires the exact opted-in policy. Unknown/missing facts, Product exclusions
and false conditions inside a successful OR do not become scope exemptions.

Restart **Editor 0.2.36**. Keep the current **Button r17 / Spinner r8** session or
ZIP: no reimport/re-export/review-status change is required. Manual, compiled,
dependency pins and ZIP bytes are unchanged. Reports identify the running Editor
independently of the compiled producer (still 0.2.35); old reports are not rewritten.
All seven archived BS cases retain exact engine/coverage replay (2589 evaluations),
all violations, IDs and raw trace data. Only `reasonLabel`/`showComparison` change
on 119 proven exclusions per BS01–BS06; BS07 details remain identical.
Verification: **299 Editor tests +58 scoped package tests**, typecheck/build.
Headless Chrome replay of BS01/BS05 verifies both corrected card types, unchanged
real opacity comparison and JSON download; screenshots inspected, no page errors.
This uses archived facts through simulated Plugin API messages, not fresh Figma capture.
Button remains Draft with10 pending; View→Inverted/Static is the next functional step.
See Button/qa/scope-explanations.2026-09-28.json and the backlog.

### History: ownership implementation and live review

**0.2.35 — Button r17: explicit ownership and applicability (2026-09-27).**
Three recursive parent baseline policies stop at proven child-contract boundaries;
two text-style rules explicitly exclude known-hidden targets; two layout rules use
the existing actual-or-baseline gap gate. All five changed rules are Draft, keeping
their RuleIDs. Parent Size, child intrinsic bounds/opacity and real host overrides
still fail correctly. Missing/ambiguous evidence never becomes permission.
Both new policies are editable in the rule inspector and survive JSON/ZIP.

Restart **Editor 0.2.35**, export unsaved session work, import **Button r17** from
`Button/editor/Button.editor-input.zip`. Spinner r8 is included and byte-identical;
do not rebuild/import it separately.

**2026-09-27 19:09–19:10 UTC — live BS01–BS07 runtime acceptance passed.**
Atomic violations are **0/0/1/14/2/0/0**, UI cards **0/0/1/8/1/0/0**. Exact replay
matches all **2589 engine evaluations**, including 1008 child evaluations, Editor
coverage and details. All 121 captured nodes matched, with no warnings/inconclusive
verdicts. Inactive gaps and parent opacity duplicates are gone; hidden text is now
not-applicable. Real parent Size/geometry and child intrinsic/opacity failures remain.
Ten existing pending checks remain in every case: Button is still Draft.

One presentation defect remains: `scopeTrace` expects wrapped `actual.value`, but
the engine supplies primitive `actual=false`. Hidden-target/child-owned exclusions
therefore show generic `true/false → all true` instead of the specific cause and
hidden comparison. Verdicts/coverage are correct; explanatory UX is **not accepted**.
See backlog `rule-scope-diagnostic-boolean-trace` and
Button/qa/ownership-scope-live-review.2026-09-27.json. Seven original reports are
archived in Button/qa/fixtures/ownership-scope-r17; their editor/ exports may be removed.
This review does not change normative sources, statuses, ZIP, compiled, plugin or registry.
All **58 scoped package tests** pass, including 13 new live-fixture regressions and
the explicitly labelled presentation-defect reproduction.

Verified: **291 Editor +45 scoped package tests**, typecheck/build, exact historical
replay, unchanged 1008 child evaluations. Schema payloads pass local Ajv using the
supported draft-7 keyword subset (not full draft-2020 meta-schema validation).
Registry Правила1592/1594/1598/1837/1838, Леджер55, CoreAF10:AH10 updated and
read back with formatting/validation preserved. Hub is untouched; Predicate Draft.
See [explicit scope](docs/RULE_SCOPE.md), backlog and Button QA report.

### History: first-stage integration

**2026-09-27 15:55 UTC — Button→Spinner live review, partial acceptance.**
All seven BS reports replay exactly:2547 engine evaluations,1008 child evaluations,
Editor coverage and diagnostic details. All nodes matched; no capture warnings or
inconclusive verdicts. Parent Size, child intrinsic Scale/opacity, right binding and
ordinary-icon exclusion work. Full integration remains open: Button blanket policies
report inactive gap on Addon/Spinner (four atomic findings/two cards in BS04), overlap
child opacity checks, and count two known-hidden text style rules as not executed.
Next P0: explicit ownership boundary and applicability; do not silently weaken
parent embedding constraints. Manual/r16/ZIP/runtime unchanged, Button stays Draft.
Seven original reports are archived under Button/qa/fixtures/spinner-integration-r16.
See Button/qa/spinner-integration-live-review.2026-09-27.json and backlog.

**0.2.34 — Button r16 → pinned Spinner r8 (2026-09-27, live acceptance pending).**
The shared core now links read-only compiled component dependencies by componentId,
manual revision/source hash and compiled hash. A fixed nested binding proves the
library owner, typed `Addon.Type=Spinner` and child lineage; this is not an icon
swap. Button owns Size 32/40→16 and 48–72→24. Spinner keeps its own 31 predicates,
executed by the same Predicate Engine with original RuleIDs and nested provenance.
Independent child reference capture preserves actual overrides, modes and geometry.
Missing/mismatched pins, ambiguous identity, capture failure and cycles give explicit
incomplete coverage. Imports, session state, export ZIP and downloadable validation
JSON retain the child contract and replay evidence. The passport exposes dependency
pins/bindings; dependencyDomain exposes `contractDependencyId` without losing it on save.

Restart Editor **0.2.34**, preserve session edits, then import
`Button/editor/Button.editor-input.zip` (**r16**, Spinner already included).
Seven BS01–BS07 cases are prepared in the existing Button section; see
`Button/TESTCASES.md`. Direct nested Scale is rejected by Figma, so BS04 scales the
real parent Button and reads back Spinner 30×30 at nominal Size24.
Button remains **Draft / unpublished**: existing context-only/delegated checks remain,
including full Loading composition, View→Inverted/Static and pre-loading width.
Neither the accepted Spinner r8 package nor its manual was rewritten. Historical
core/Button acceptance now uses immutable archived hashes instead of moving files.
See [`docs/COMPONENT_DEPENDENCIES.md`](docs/COMPONENT_DEPENDENCIES.md).
Verification: **277 Editor +32 scoped package tests**, typecheck/build, Chrome
import/passport/constraint save with a synthetic Plugin API preview, exact report
replay and seven persistent Figma fixture readbacks. Registry Правила1823,
Леджер54 and Core PredicateAF10:AH10 updated and read back; formats preserved.
Live Editor integration reports remain pending.

### Previous standalone Spinner acceptance

**2026-09-27 — Spinner r8: all six rules reviewed, Figma predicate contour ready.**
The last two rules (auto-layout/effective baseline) passed the final review.
Only review statuses and revision metadata changed; all 31 predicates and explicit
gates are preserved. Archived r7→r8 parity keeps all 1008 L01–L06 outcomes/traces,
scenario coverage and diagnostic details except revision-derived IDs. No new live
run is required for that status-only change. Verification: **264 Editor +27 package
tests**, typecheck; independent gradient/token/missing-evidence controller checks.
Import the rebuilt `Spinner/editor/Spinner.editor-input.zip` (manual r8) with Editor
0.2.33, preserving any session changes first. No plugin rebuild is required.
This is readiness of the declared Figma checks, not complete code generation,
animation/vector/mode coverage or production rollout. Runtime index remains
unpublished/draft; `reports/readiness.json.liveAcceptance=pending` refers to a direct
r8 capture, while the reviewed semantic parity is recorded in `qa/final-review.2026-09-27.json`.
Next: Button→Spinner dependency, with Button owning the Loading/size/color matrix.

### Previous r7 implementation and acceptance

**0.2.33 — explicit padding/alignment applicability (Spinner r7, Draft).**
Manual per-property policies gate comparison only when actual OR independent
reference has the relevant auto layout. Both inactive → not-applicable; missing
evidence → incomplete. Mode/sizing/intrinsic checks remain separate. Six new
inspector controls preserve exact opt-in maps through editing and ZIP roundtrip;
old contracts and embedded reports retain their semantics. No Spinner branch in
the shared compiler/capture and no Predicate Engine fork.

Verification: **264 Editor +19 scoped package tests**, 12/12 variant structures;
typecheck passed at implementation. The nine layout tests now seed controller/
truth-table checks from archived pristine L01, with all prior assertions preserved.
**2026-09-27 10:53 UTC — L01–L06 accepted.** The three pristine/inactive cases
have no violations; active padding gives two atomic findings grouped into one card;
each alignment case gives one finding. All six map 6/6 nodes with complete coverage,
no warnings or excluded/unknown checks. Exact replay matches all 1008 evaluations,
Editor coverage and details. Eleven new fixture regressions + eight base package
tests pass. Immutable gzip copies preserve original report bytes outside `editor/`.
The old 24-case and gradient fixture files are currently missing: their suites
cannot be rerun, and this acceptance does not claim otherwise.
Mode changes rejected/not persisted by real library instances are covered by
controller simulations only, not fabricated live fixtures. Import the rebuilt
`Spinner/editor/Spinner.editor-input.zip` (r7); export session edits first.
README/backlog acceptance updated; normative sources and registry statuses unchanged.
Spinner remains 4 reviewed /2 draft;
Button and production catalog are unchanged. See `docs/PROPERTY_APPLICABILITY.md`.

### Historical acceptance before 0.2.33

**2026-09-27 09:37 UTC — Spinner gradient live acceptance passed (G01–G04).**
Editor0.2.32 /manual r6: pristine0, stop alpha2, gradient transform2, token detach2
atomic violations; each negative groups into one card preserving both source rules.
All four have 6/6 matched nodes, full scenario coverage and no warnings/unexecuted/
inconclusive/excluded checks. Exact replay: 552 engine evaluations, Editor coverage
and serialized details. Independent references retain original paints. No extra mode
finding on G04. See `Spinner/qa/gradient-live-acceptance.2026-09-27.json`.
Seven new live-fixture regressions and eight base package tests pass. The older
review suite currently lacks its prior JSON fixtures in Spinner/editor, so its
historical matrix was not replayed again. Manual/runtime/compiled are unchanged;
Spinner remains Draft and inactive padding/alignment is the next P0.

**0.2.32 — generic gradient paint evidence (2026-09-27).** Actual and independent
reference capture now preserve gradient stops (position, full-precision RGBA and
variable binding), transform and observed blend mode for linear/radial/angular/
diamond paints, in fills and strokes. Missing or malformed evidence is unknown,
not an empty paint, violation or silent pass. Diagnostics include missing paths;
scenario coverage stays incomplete. A versioned compiled policy enables this
requirement; historical reports with their original compiled contract replay unchanged.
Spinner remains manual r6 / Draft, with unchanged rules, IDs and generated facts.
Import the rebuilt `Spinner/editor/Spinner.editor-input.zip` after preserving
session edits. New captures are required for gradient acceptance; old captures
checked against 0.2.32 correctly expose their missing gradient data.
See [`docs/GRADIENT_PAINT_FACTS.md`](docs/GRADIENT_PAINT_FACTS.md) and
`Spinner/TESTCASES.md`. Inactive padding/alignment remains a separate P0;
Button Loading dependency is not activated. No full vector/image/effect coverage
or new live Figma acceptance is claimed by this patch.
Verification: **255 Editor tests +17 Spinner package tests**, typecheck passed;
22 dedicated gradient tests. Registry updated and read back; Spinner remains Draft.

### Previous milestones

**2026-09-27 — Spinner rule review, manual r6 (Draft).** Three of the five open
rules are reviewed: public API, intrinsic bounds, INSTANCE with independent identity
resolution. Auto-layout/effective baseline remain Draft: local reproductions prove
inactive padding/alignment comparisons and missing gradient stops/transform capture.
Existing visual-style review is preserved; package total is 4 reviewed / 2 draft.
No runtime change: all 24 original reports replay exactly; r6 preserves 3312
outcomes/traces and coverage apart from revision-derived evaluation IDs.
Canonical import remains `Spinner/editor/Spinner.editor-input.zip`; preserve session
edits before reimporting. See `Spinner/REVIEW.md` and the backlog for the next two P0s.
Historical r5 results below remain valid; Button Loading dependency is not active.
Verification: 233 Editor +17 package tests pass, including two explicit known-gap
reproductions (not fixes); typecheck passes. Production core bundle hash is unchanged.

**2026-09-26 — next component: Spinner.** The isolated package is
`shared/design-system_ab/experiments/web-core/core/Spinner/editor/Spinner.editor-input.zip`
(Editor 0.2.31, manual r5, Draft). Its own API/invariants are authored once;
Button will reference that contract and own only its Loading composition constraints.
Product/channel policy belongs to usage patterns. See the package README and
`experiments/web-core/core/COMPONENT_OWNERSHIP.md`. Button r15 is unchanged.
Athena facts cover 12/12 variant structures against pinned independent REST.
Manual r5 preserves all six user r4 rules/IDs and adopts that fresh evidence.
Original r2/r4 manual sources are archived in the Spinner package history.

**0.2.31 adds explicit per-property applicability.** In the rule inspector,
authors may opt into stroke-present or flow-gap conditions. They are stored in
manual `propertyApplicability`, compiled by shared core and interpreted by the
unchanged Predicate Engine. No Spinner names, implicit skips or new global defaults.
Stroke weight is compared if a stroke exists in actual OR baseline; gap if either
state has at least two visible non-absolute H/V auto-layout children. Missing
activity evidence stays unknown/incomplete. Other assertions are unaffected.
See [`docs/PROPERTY_APPLICABILITY.md`](docs/PROPERTY_APPLICABILITY.md).

233 Editor tests and 8 isolated package tests pass. Original 0.2.29/0.2.30 reports
replay exactly. Fresh controller simulations of the four accepted 18:52 scenarios
yield **0/4/7/2 atomic violations**, plus 18 explicit inactive-property evaluations.
Scale80×80 retains both intrinsic-size violations; paint/token and sizing findings
remain. This is local verification, not live acceptance of r5.
The 0.2.30 size patch was accepted live for Size48/Static=False/Inverted=False.
Four live r5 reports at 2026-09-27 05:09 UTC confirm 0/4/7/2 violations and 18
explicit not-applicable evaluations for Size48/Static=False/Inverted=False.
All 6/6 nodes match; warnings/not-executed/inconclusive are zero. Engine, coverage
and details replay exactly; embedded manual/compiled equal the canonical r5 package.
Scale retains only width/height48→80; the other meaningful findings remain.
The remaining 11 variant combinations were then tested in the 06:24–06:28 batch
described below. Export any newer session edits before importing the Spinner ZIP:
restarting alone does not migrate old manual rules.
UI save also preserves the 13 explicit constraints of the imported forbidden
baseline rule when its capability is unchanged; browser JSON/ZIP roundtrip passed.
Spinner remains Draft; do not activate Button Loading rules yet.

2026-09-27: 24 follow-up Figma cases are prepared in the existing Spinner section:
[acceptance matrix](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63247).
11 clean remaining variants, their 11 Scale ×1.5 counterparts, and 2 token-detach
controls. All 24 live reports pass exact engine/coverage/details replay
and match canonical manual/compiled r5: A01–A11 clean; 11 Scale cases with only
width/height violations; both token detach controls detected without a color change.
All have 6/6 matched nodes, no warnings/coverage gaps, 138 evaluations and 18 explicit
not-applicable results. A01/B01 confirms the formerly problematic Static=True/24/False.
The final **B04** (Size16/Static=False/Inverted=False, Scale16→24) was accepted
at 06:44 UTC with only width/height violations. Matrix closed: 24 passed, 0 pending,
3312 evaluations. This closes the test matrix, not the source-rule review.
All 12 pristine variants are now covered including the earlier Size48/False/False.
See `Spinner/TESTCASES.md`, `qa/figma-test-cases.2026-09-27.json` and
`qa/live-acceptance.2026-09-27.json` for case/report IDs and hashes. No runtime or
normative-source edits were made; five source rules remain unreviewed, package Draft.

1. Import an Athena agent package (`.zip` or JSON files), a canonical
   `contract.manual.json`, or an existing compiled v2 contract.
2. Render the referenced component in an isolated temporary Figma page and switch
   its main variants and variable modes.
3. Inspect a node in the anatomy tree; inspecting alone does not create a manual
   target. Explicit rule/policy authoring stores its semantic target with path,
   lineage and structural hints. Preview resolution is read-only runtime evidence,
   not permission to rewrite the manual target or its diagnostic node-id hint.
4. Open **Паспорт** and author the stable component identity, semantics,
   Figma/code representations, semantic API bindings, documentation links,
   examples, normative decisions and generation profiles.
5. Author permission, control path, typed constraint and applicability:
   multi-select exact variant values, real Figma Variable collection modes,
   controlled product/channel vocabularies with an explicit **All** option,
   execution route, severity, source references, rationale, owner, status and
   safe remediation.
6. Compile and run the exact Apollo Predicate Engine embedded from
   `services/apollo-proxy/src/predicate-engine/index.js`.
7. Switch to **Проверить инстанс**, select the explicit `ds-ai-hub` Product and
   test one document instance against an independently rendered effective
   baseline without replacing the open manual workspace. Product becomes part
   of Predicate Engine snapshot context, not a presentational filter.
8. Export deterministic ZIP containing manual source, compiled contract,
   validation report and coverage report.

The current catalog and editable manual source are kept in versioned Figma
`clientStorage`. Opening the same development plugin in another Figma tab
restores the active component, current manual revision, validation Product and
scenario choices. Preview images, document snapshots and compiled JSON are not
persisted: the selected instance is always captured from the active Figma file,
and its checks are compiled from the current in-session manual source.

Each selected-instance request carries the current `manualSourceHash`. If the
manual source changes while Figma is materializing the independent baseline,
the stale response is discarded and the validation is restarted against the
new revision.

`not-applicable` is an explicit applicability result, not a pass and not missing
evidence. Diagnostics show the current Product/platform/page context beside the
rule scope. A false variant/mode condition is labelled as a rule precondition,
never as the expected value of the governed component property.

The compiled JSON is visible only in a read-only dialog and is never accepted as
a lossless replacement for the manual authoring source.

### Current: explicit target remapping (0.2.29; Button remains manual r15)

Restart Editor after exporting any in-session work. **Keep the current Button
package**: this release changes authoring tooling, not its normative rules.

In **Заполнить каталог**, use **Перепривязать цель…** in the rules list or
**Перепривязать цель правила…** on an existing rule. Choose the destination
explicitly, inspect the before/after paths, current Figma representation, instance
lineage, property availability and affected RuleIDs, then confirm the checkbox.
Cancel/Escape is read-only. Unsaved rule-form edits must be saved or explicitly
discarded by reopening the rule first.

Shared core `planTargetRemap`/`applyTargetRemap` updates only the selected target's
representation binding, revision/date and affected review statuses. Target ID,
semantic role, RuleIDs, other representation hints, constraints, applicability,
control paths and severity remain unchanged. Active related rules and examples
return to Draft, including structured dependencies, control-port references and
ancestor subtree rules. The diagnostic node ID is not a binding. Generated facts,
Figma nodes and compiled JSON are never edited. Session, validation and ZIP use
the new manual immediately; the previous validation report is invalidated.

This is deliberately **one representation at a time**. It does not migrate
Desktop bindings to Mobile or widen a rule's scope. A globally unresolved target
with multiple Figma representations remains blocked until per-representation
resolution semantics are supported. Colliding targets, incomplete topology,
missing required facts, stale confirmation hashes and unproven nested identities
also block the operation. Deferred policies stay deferred and require owner review.

With Athena facts, the destination must agree with generated anatomy and an
independent current reference. Regeneration must precede accepting a changed
library structure; remapping cannot approve an instance-only structural override.
Legacy packages retain conservative exact path/type/order guards, not semantic
rename inference. Other semantic targets do not move along with the remapped target.
All variant/mode contexts still require review before restoring Reviewed status.

Verified locally: **210 tests**, typecheck/build; Chrome explicit/cancel/ESC,
dirty-form guard, 1440/640 px layouts, session + ZIP roundtrip, remapped violation
and browser/Node parity. Seven historical Button reports reproduce exactly;
recompilation differs only in producer version. The canonical r15 source hash,
ZIP and Predicate Engine are unchanged. Live Figma acceptance is still pending;
Button remains Draft with its existing nine coverage gaps.

Next: live remap acceptance, stable Athena structural/lineage anchors and explicit
per-representation resolution. Do not bypass those gaps with name heuristics.

### History: safe legacy target resolution (0.2.28; Button remains manual r15)

Restart Editor; **no new Button package or manual revision is needed**. Save any
in-session edits before restarting. The complete r15 Athena/reference route and
its accepted Size checks remain unchanged.

For manual-only/legacy packages without generated variant anatomy, reconciliation
no longer falls back to a matching layer name or node ID. It requires a unique
component/platform representation, an exact parent-derived path and the declared
structural anchor. Conflicting targets, moved/renamed layers, type/order drift,
truncation and missing evidence stay unresolved. Root instance renaming and new
node IDs do not by themselves break a proven relative binding. Representation
hints are scoped explicitly; another representation's anchor is not borrowed.

The old fingerprint is only a conservative path/type/order guard, **not** a durable
semantic identity. Nested component lineage cannot be proven by this legacy
adapter and requires Athena variant facts plus independent reference evidence.
There is no automatic semantic rename migration in this release.

Resolution is exported as `snapshot.targetResolution` (`apollo.target-resolution.v1`)
and recomputed by shared core on replay. It never enters manual or compiled facts.
New Editor captures opt into this adapter; historical snapshots keep their old
replay semantics. An unresolved rule shows **«Не выполнено»** with a concrete reason,
without a duplicate empty-selector **«Не применяется»** card. The full engine output
remains in JSON. Known Product/platform exclusions still apply; missing targets
are not absence proof. An unresolved existing rule cannot be saved onto whichever
layer happened to be selected previously.

Verified: **194 tests**, typecheck/build; Chrome exact/moved-target validation,
inspection/export manual immutability, disabled accidental retargeting, JSON
browser/Node replay; seven historical 08:31–13:26 reports reproduce exactly.
Recompiled contracts differ only in the Editor producer version. No DS rules,
source catalogs, Predicate Engine, canonical r15 ZIP or production artifacts changed.
The author-confirmed remap workflow is now available in 0.2.29 above; its broader
cross-representation and stable-lineage migration remains out of scope.

### Button acceptance: nominal icon Size and nested swaps (0.2.27, manual r15)

Restart Editor and import the rebuilt `Button.editor-input.zip` (manual r15).
Save any newer in-session work first: importing a package does not merge it.
All 26 RuleIDs and the user's PaintMe target are preserved; the existing size
rule now has seven constraints and the package compiles to 49 atomic checks.

| Proven catalog | Active port | Typed asset VARIANT property |
|---|---|---|
| Icons -- general (glyph) | Icon-16 | Size = `s` |
| Icons -- glyph-26 | Icon-20 | Size = `20` |
| Icons -- glyph-26 | Icon-24 | Size = `24` |

These domains are editable manual source, not runtime constants. `variantProperty`,
`property` and `activePorts` extend the generic dependency constraint. Existing
width/height checks remain independent: Size24 fitted into 20×20 must fail Size,
not geometry. Correct legacy Size does not approve a new legacy swap; the accepted
catalog policy still applies separately. Unknown property/catalog/binding remains
incomplete, never a successful check or a name-derived guess.

New captures use `instance-content-references.v4`: independent library host →
selected host variant → nested replacement. Each stage verifies identity, port,
parent, context, modes and shape. No actual styles enter the reference. A verified
parent can supply dependency facts when a child visual reference is unavailable;
only that child remains unexecuted. The eight-reference limit and temporary-page
cleanup apply to the whole chain. v1–v3 reports retain their old replay semantics.

Verified locally: **182 tests**, typecheck/build, exact engine/Editor/details replay
of all five saved 08:31–08:35 reports, Chrome authoring of all seven constraints,
in-session verdict changes and JSON/ZIP roundtrip with Node parity. Figma API
simulation: 15/15 matched with both references; 13/15 on child API refusal,
without losing known Size facts. PaintMe and icon/vector opacity overrides remain
detectable. Synthetic capture tests are not live Figma acceptance.

**Live negative acceptance passed (2026-09-26):** reports `13-26-01-132Z` and
`13-26-10-308Z` use exact canonical manual r15 / Editor0.2.27, hash
`d982f0d227b0971b517398106d740a6b8dc4a532d65f77742c826f8cf3319026`.
The first finds precisely Size24→20 in Icon-20 while actual bounds20×20 pass:
201 compliant, 17 not-applicable, 1 violation, 9 unexecuted. Both independent
stages (Addon variant and child swap) match; coverage recovered from 10/15 to15/15.
The second finds legacy Size m→s in Icon-16 with bounds16×16, plus the existing
general(glyph)→glyph-26 catalog violation: 197 compliant, 20 not-applicable,
2 violations, 9 unexecuted. This is two independent constraints, not duplication.
Both reports: 15/15 matched, zero capture warnings/inconclusive. Manual equality,
recompilation, authoring activation, engine, Editor and exported details replay
all match exactly. Original reports, manual, compiled output and runtime unchanged.

Remaining live acceptance: corrected Size20 and untouched original legacy S,
then Button56 and the right visible slot. Download new reports; do not relabel old
v3 reports as fresh v4 evidence. Contract remains **Draft**: nine unrelated unexecuted
items and the missing Spinner target warning are not closed. README/backlog and
the rules/ledger/Predicate registry are updated; production catalogs are untouched.
The ds-ai-hub cookbook's mixed glyph-26 `s/m` notation is recorded as a separate
semantic drift, not silently corrected.

### History: Addon / active port / bounds mapping (0.2.26, manual r14)

Import the rebuilt `Button.editor-input.zip` after restarting Editor. The single
editable authority remains `contract.manual.json`; compiled JSON is read-only.
The existing `component:web-core.button.addon-size-follows-button-size` RuleID
now contains four `dependencyDomain` constraints, not Button-specific runtime code:

| Button Size | Addon set | Active glyph-26 port | Asset instance bounds |
|---|---|---|---|
| 32, 40 | Addon16 | Icon-20 | 20×20 px |
| 48, 56, 64, 72 | Addon24 | Icon-24 | 24×24 px |

Both visible sides are checked. The port and dimensions apply only to proven
glyph-26 membership, including unchanged defaults; untouched legacy retains its
accepted exemption, and new legacy swaps still fail the separate catalog rule.
The manual source declares the ±0.01px tolerance. Actual bounds come from the
uniquely bound icon INSTANCE, not its Addon container, PaintMe, vector or name.
Missing geometry/catalog/binding evidence stays unknown; hidden/absent targets
are not applicable. Compiled bindings opt into metrics so old report fact shapes
and results remain stable. Predicate Engine is unchanged.

The rule form now selects each constraint independently, preserving order and
unsaved edits between selections. All four checks can be edited in the form;
additional constraints remain available as JSON. Manual r14 preserves all 26
RuleIDs and the user's `target.paint-me` from report 05:38:21; 43 atomic RuleIR checks.
Package remains Draft: new live-Figma acceptance and unrelated coverage gaps
are not closed by local regression/replay.

Verified: **171 tests**, typecheck/build, exact engine/Editor replay of five
historical reports (22:21:40, 22:21:52, 22:26:50, 00:53:41, 05:38:21).
Chrome smoke covers ZIP import, all four constraint forms, retained unsaved edits,
in-session verdict changes, JSON download and ZIP export/reimport with Node parity.
Using the 05:38 snapshot with r14: 200 compliant, 13 not-applicable, 9 unexecuted,
zero violations/inconclusive. This is replay, not fresh live-Figma acceptance.
Metric diagnostics show the actual dimension/port and the proven mapping branch,
not logical `false → at least one true`. The existing missing Spinner target
warning is not silently resolved. Rules/ledger/registry sync was read-back verified.

**Positive live acceptance:** report `button.validation-report.2026-09-26T08-31-16-893Z.json`
uses exact canonical r14 and Editor 0.2.26. Button40 Primary / 12982:59338 has
15/15 matched nodes and no capture warnings. Addon16, Icon-20 and glyph-26
INSTANCE bounds 20×20 all pass; hidden RightAddon is correctly not applicable.
The independent host-variant reference matches. Results: 200 compliant,
13 not-applicable, 9 unexecuted, zero violations/inconclusive. Engine, Editor
diagnostics and exported detail replay are exact. Negative live testing and
Button56/right-slot coverage remain pending; the contract stays Draft.
An in-memory width20→24 counterfactual triggers exactly the width constraint,
but is not a live Figma negative. No source rules, package or original report
were modified during acceptance. Remaining aggregate component-set/hidden-slot
diagnostic wording is recorded separately as P2 in the backlog.

**Negative live acceptance failed:** report `button.validation-report.2026-09-26T08-33-36-172Z.json`
selects a glyph-26 Size=24 variant while Figma retains actual INSTANCE bounds
20×20 and the Icon-20 port. Two gaps are confirmed: r14 has no normative asset
variant-Size constraint (bounds are not nominal variant size), and a nested icon
replacement inside the switched Addon invalidates the whole independent reference
(`replacement-nested-identity-unresolved` → `wrapper-lineage-changed`). Result:
10/15 matched nodes, four human-review, ten unexecuted, no violations. Exact
engine/Editor replay confirms the defect, not correctness of the layout.
The expected finding is asset Size24 instead of Size20, not width/height errors.
Both contract coverage and nested-swap runtime work are P0 in the backlog.
No manual source, compiled package or runtime code was changed during this analysis.

**Legacy-size live case:** report `button.validation-report.2026-09-26T08-35-31-130Z.json`
selects general (glyph) diamonds Size=m instead of Size=s in the active Icon-16
port, while bounds remain 16×16. Unlike the preceding nested-variant case, all
15 nodes match, capture warnings and inconclusive results are zero, and exact
engine/Editor replay succeeds. The sole violation is the existing new-legacy-key
catalog rule, not a Size finding (197 compliant, 15 not-applicable, 9 unexecuted).
The P0 manual mapping must also cover general (glyph) + Icon-16 → Size=s. Keep
catalog permission, nominal variant size and measured dimensions distinct; do not
silently weaken the accepted legacy policy or derive S/M from pixel bounds.

### Host-safe variant capture and active ports (0.2.25)

Fixes both defects in the Button40 report `00:53:41`. **Manual r13 / 26 rules
is unchanged** (source hash `428630e19bad5e14b6423c6a0102026262684f70ca9ca1d4c86af3db1fc6c057`).
Restart Editor and check the same instance; no package reimport is necessary.

- For a same-set nested variant, capture now applies only the exact library main's
  VARIANT properties with `setProperties` on the pristine host clone. It verifies
  the resulting variant/set keys. This preserves Button-author overrides inside
  Addon, including PaintMe; styles from the tested instance are never copied.
- Explicit icon replacements retain direct mainComponent assignment, clearing
  the previous icon's overrides while keeping its surrounding host unchanged.
- Active INSTANCE_SWAP ports are identified by unique consumer binding, nearest
  instance owner and matching property/main IDs in actual AND independent reference.
  Inactive family declarations do not create ambiguity. Multiple consumers,
  broken bindings and failed variant switches remain unresolved.
- New snapshots use `apollo.instance-content-references.v3` with explicit variant
  capture strategy. Old v1/v2 reports retain exact replay semantics, including
  previously incorrect captured evidence. Recapture; do not relabel old evidence.

Validation: **163 tests**, typecheck/build; four historical engine/Editor reports
replay exactly. The untouched live 00:53 snapshot is a regression fixture that
reproduces the two bugs. A separately labelled counterfactual capture model and
main-plugin sandbox tests verify the fixes; actual manual recoloring still fails.
**Positive live acceptance confirmed** by `button.validation-report.2026-09-26T05-38-21-514Z.json`
on the same 12982:59338 Button40 Primary: 15/15 nodes match, warnings are empty,
the independent-host-variant reference preserves the white PaintMe token and
paint opacity≈0.94. Icon-20 has a proven glyph-26 consumer; its key equals the
current variant's library default (`changed=false`), so the new-swap rule is
not applicable, not skipped due to missing evidence. Zero violations and zero
inconclusive results; nine unrelated unexecuted items remain, package stays Draft.
Both engine and Editor results replay exactly. The report still has manual r13
and the same 26 rules, but adds `target.paint-me`; its verified session source hash
is `16b271f528de7788f5425674565214121cab98c15baff583e550d997711f827a`.
This does not modify the checked-in manual source. A negative in-memory replay
with a changed PaintMe token still triggers both existing fill rules; that is
not a new negative live Figma capture. The 20/24dp asset-size policy remains open.

### Nested variant reference (0.2.24)

Keep **manual r13 / 26 rules** and in-session edits; do not reimport the package.
Restart the development plugin to load 0.2.24 and capture a fresh instance report.

- New read-only snapshot evidence `apollo.instance-content-references.v2` distinguishes
  a nested variant change by the same nonempty component-set key from replacing a
  component. Explicit INSTANCE_SWAP ports still take precedence. Historical v1
  snapshots retain their previous interpretation.
- A separate pristine host clone receives the exact selected variant. Shared core
  verifies identities, topology, modes, variant properties and unchanged outer
  host. Visual content uses that independent reference; the original VARIANT
  property baseline is retained, so a forbidden Type change is not concealed.
- Proven wrapper variants use their own current icon-port lineage. Other sets,
  missing keys, failed capture and simultaneous deeper swaps remain unresolved.
  No Button names, keys or normative size policy are embedded in runtime.
- This is the prerequisite for Icon-20 checks, **not implementation of the 20/24dp
  asset-size constraint**. Athena and ds-ai-hub agree that Button 32/40 uses an
  Addon16 container with an Icon-20 adapter and a 20px glyph; container dimensions
  must not be mistaken for asset dimensions. Untouched legacy remains exempt
  under the existing manual decision. No manual rules or RuleIDs changed.

Acceptance: Button 32/40, change the nested Addon16 Type from Icon-16 to Icon-20
without another icon swap, then export the report. Expected content provenance:
`independent-host-variant`; a manual opacity override inside it must still be
detected. Also rerun the accepted swapped-icon scenario from 0.2.23. Live
acceptance of 0.2.24 is pending; synthetic core/sandbox tests do not replace it.

**Live acceptance blocked (00:53:41 report, Button40 Primary, node 12982:59338):**
15/15 nodes matched and the nested variant reference was captured, but two bugs
remain. Direct mainComponent assignment resets the Button author's white PaintMe
override to the standalone Addon's blue default, producing one false fill finding
from two rules. Also, both Icon-16/Icon-20 ports remain declared although only
Icon-20 has a consumer; counting declarations yields ambiguous-swap-port.
Follow-up must preserve pristine-host overrides during a same-set variant switch
and resolve the active port through exact consumer bindings. No actual-instance
styles may be copied into expected state. This report replays exactly in engine
and Editor; replay parity is not evidence of a correct baseline. See the P0 backlog.

Verification: typecheck/build and **155/155 tests** pass. Canonical Predicate
Engine and Editor diagnostics replay the 22:21:40, 22:21:52 and 22:26:50 user
reports exactly, including the accepted replacement-opacity negative case.

### Independent replacement content baseline (0.2.23)

Keep the existing **manual r13 / 26 rules** and any later in-session edits. No new
package import is required. Restart the development plugin and capture a fresh
selected-instance report; historical snapshots cannot supply missing reference evidence.

- Capture creates a temporary clone of the **pristine library reference**, never
  the tested instance. The exact new component is assigned inside the proven
  owner/INSTANCE_SWAP port. Direct `mainComponent` assignment clears old payload
  overrides; `swapComponent` would preserve them ([Figma API](https://developers.figma.com/docs/plugins/api/properties/InstanceNode-swapcomponent/)).
- The shared pure core verifies original/new identities, structural paths, modes
  and unchanged host facts before materializing the new `baseline.effective`.
  The enclosing Addon/`PaintMe` remains the library reference; observed colors,
  padding or other overrides are never copied into the expected state.
- Swap admissibility and content comparison remain independent. A legacy swap can
  violate the catalog rule while its internal styles are also checked by existing
  host `self-and-descendants` rules in the canonical Predicate Engine. This does
  **not** load or execute the replacement component's own semantic contract.
- `apollo.instance-content-references.v1` is read-only snapshot evidence, not a
  manual/compiled contract schema change. JSON export retains the pristine host,
  each independent reference and capture failures; Node replay repeats the checks.
  Semantic roles from the old icon are never assigned to the replacement.
- Failed/ambiguous capture, mode/context drift, unavailable keys, structural drift
  and nested replacement mismatches stay **Не выполнено**, with a specific reason.
  References are captured sequentially, at most 8 per run / 500 nodes each; all
  temporary hosts are removed in `finally`. No user instance is modified.

Validation: 149 tests (including independent-reference and main-plugin sandbox
tests), typecheck/build; exact engine/editor replay of four supplied 0.2.21/0.2.22
reports. Manual r13 and RuleIDs remain unchanged. **Live reference capture confirmed**
by the 2026-09-25 22:21:40/22:21:52 reports (0.2.23/r13): ordinary Button matches
16/16 nodes with 6 grouped violations; SingleIcon matches 7/7, including both
replacement nodes, with 7 grouped violations. The content-reference gap is gone
(8 → 7 unexecuted items); the catalog violation and PaintMe comparison remain.
Both reports replay exactly in the canonical engine and Editor diagnostics.
**Negative live case confirmed** by the 22:26:50 report: the replacement instance
`digit-one-off-circle` has opacity 0.5 vs its independent baseline 1. Two existing
rules yield one new grouped finding (7 → 8); all seven previous findings remain.
All 7 nodes still match, with no capture warnings and 7 unrelated unexecuted items.
Engine/editor replay and unchanged r13 hashes are verified. The main replacement
baseline scenario is accepted. Its child vector `icon` remains at opacity 1;
deeper vector overrides are covered by automated tests/in-memory replay, not this
live report. Keep that distinction in the broader QA matrix. Package stays Draft.
The two live 21:26 reports accepted the previous Addon identity/origin step:
6 ordinary Button findings and 7 SingleIcon findings, with the new legacy-swap violation.

Current limits: arbitrary nested swaps are not recursively resolved; changed
topology remains needs-remap. Icon-20 adapter/asset dimensions and formal detach
classification remain separate backlog items. Baseline availability is not proof
that every possible property or the icon's own contract was checked. Package Draft.

### Architecture boundary: Editor vs future Apollo

The Editor is the authoring and acceptance harness for the future Apollo audit
pipeline, not a second normative rule engine. Manual source owns policy; compiler
lowering and snapshot facts are pure core; the canonical Apollo Predicate Engine
owns verdicts. Figma capture only supplies independent evidence and diagnostics.
The compiler/fact modules currently live in `src/core`; extracting a versioned
shared package for Athena CLI/Editor/Apollo Proxy is still backlog, not completed
integration. Future Apollo should reuse these modules rather than copy them.

### Addon identity and swap provenance (0.2.22)

The isolated Button input is now **manual r13 / 26 rules**. Load
`shared/design-system_ab/experiments/web-core/core/Button/editor/Button.editor-input.zip`.
It is based on the user's r12 report, not the stale r8 disk copy. Only the two
existing Addon rules changed; their IDs and all other rules are preserved.

- `dependencyDomain` is an editable typed constraint: explicit semantic subjects,
  relative instance paths, component-set or catalog domain, optional host-property
  mapping, exact swap-port names, and an explicit unchanged-baseline policy.
- Button 48/56/64/72 maps to Addon24; 32/40 maps to Addon16 by actual component-set
  identity. There is no fabricated Addon `Size` property.
- An unchanged independent library icon is accepted, even legacy. A changed key in
  an icon port must resolve positively to `Icons -- glyph-26`. Unknown/conflicting
  keys and ambiguous ports remain human-review; no name inference or absence-based rejection.
- Build time extracts compact key membership from Athena indexes. Runtime sees only
  compiled facts; canonical Predicate Engine evaluates `all` / `any` / `one-of`.
  No Button RuleID, key, or allowed family is hardcoded in the runtime normalizer.
- Snapshot profile `dependency-facts-v5` keeps previous v2/v3/v4 report replay intact.
  Import, session persistence, export and downloaded reports preserve generated facts.

Current limits: the new checks validate Addon set and icon origin, **not** the
Icon-20 adapter/asset dimensions. Replacement content remained isolated in 0.2.22;
the 0.2.23 reference path above now supplies it when all evidence gates pass.
Missing/changed wrapper lineage is unknown, not a proved detach violation.
The package remains Draft and is not published to production Apollo.

### Recovery package and grouped diagnostics (0.2.21)

Identical atomic effective-baseline violations share one UI card: same node/path,
fact, actual and expected values. The card exposes every original RuleID/title and
severity, using the highest member severity. Different values/tokens, constraints,
unknown evidence and non-violation statuses are never merged. Chips, filters and
anatomy counts use the same groups; the raw evaluation count is shown when different.
Predicate Engine results, coverage and downloadable JSON remain ungrouped/lossless.

Button recovery package: `Button/editor/Button.editor-input.r12-recovered.zip`
under `design-system_ab/experiments/web-core/core`. It restores the exact manual r12
(26 rules) from the 2026-09-25 06:59 report with unchanged Athena evidence and newly
compiled artifacts. Original r8 ZIP, source reports and canonical manual are untouched.
`recovery-provenance.json` records source/evidence hashes; this is recovery, not a
normative rule migration. Preserve any newer session edits before importing it.

For explicit, non-overwriting recovery of this package shape:

```sh
node scripts/recover-report-package.js report.json original-input.zip new-recovery.zip
```

The command verifies manual hash, matching component, unchanged base rules, matching
compiled variant evidence, import round-trip and unchanged input bytes. It refuses
an existing output path or a source that requires manual reconciliation.

Validation: 131 tests, typecheck/build, five exact legacy engine replays. Browser
QA imports both real ZIPs, checks r8 7→6 and recovered r12 11→6 / 12→6 diagnostics,
RuleID disclosure by keyboard, anatomy focus and downloaded JSON/Node parity.
Scenario completeness stays false, with 10/11 unexecuted entries. This is replay
of supplied snapshots; fresh Figma acceptance remains pending.

### Figma sandbox hashing compatibility (0.2.20)

Fixed `TextEncoder is not a constructor` during selected-instance validation.
The strict baseline path introduced in 0.2.19 invoked SHA-256 inside Figma's main
sandbox; its UTF-8 adapter had assumed browser APIs. Hashing now uses a local,
sandbox-safe UTF-8 encoder, preserving Unicode and lone-surrogate byte semantics.
The browser-only ZIP adapter and canonical Predicate Engine are unchanged.

Regression tests execute the actual main plugin bundle in a VM with TextEncoder
absent/non-constructible, for unchanged and replaced nested instances. UTF-8/hash
parity is checked against Node crypto. Keep the current manual source/session;
restart the development plugin and capture a fresh report, with no package reimport.
Validation: 125 tests, typecheck/build and exact Predicate Engine replay of the
00:01, 06:40 and 06:59 reports. Live Figma acceptance is still pending.

### Instance boundaries and scoped baseline (0.2.19)

New exports use `variant-facts-v4`. Capture records nested main-component keys,
local main IDs and exact `componentPropertyReferences` bindings, with at most six
concurrent identity lookups. Stable component identity and a unique owner/port pair
anchor a renamed INSTANCE_SWAP; names alone cannot prove equivalence or permission.

Comparison verifies the host structure outside changed/unknown instance subtrees.
Host targets and confirmed absent slots remain checkable; targets inside an isolated
subtree stay unknown. An explicit coverage gap records each unverified boundary,
so isolation never turns an incomplete audit into a pass. Arbitrary structural
drift, moved/ambiguous ports and incomplete topology still fail closed.

Live baseline capture uses strict structural paths and instance lineage, not global
semantic-role lookup. A changed or unidentified instance and every descendant lose
the old effective baseline, including identically named `icon` layers. Property
checks outside it continue. Resolved role relations are rebuilt for subtree rules;
presence/quantity checks require resolved targets instead of treating unknown as zero.

Manual r12 and its 26 rules are untouched. Replacement admissibility and the new
component's own/effective contract are NOT implemented by this patch. Re-run Figma
capture in 0.2.19; old snapshots lacking nested keys isolate a wider unknown region
instead of guessing identity. Legacy v2/v3 engine replay remains unchanged.

Validation: 119 tests and typecheck/build, three legacy report replays, browser r12
import/download/Node parity. Replaying the old 06:59 snapshot with v4 reveals nine
findings for five distinct host/wrapper changes (fill, opacity, blur, left/right
padding); overlap between authored rules is preserved, not silently deduplicated.

### Availability-aware coverage for every execution route (0.2.18)

Executable checks and diagnostic probes for context-only/delegated rules now share
the variant target/API availability gate. A target confirmed absent by generated
anatomy and live reference excludes its property checks with an explicit explanation,
not an empty-selector error. Unknown/missing availability is explicitly three-valued.
Deferred rules never execute merely because their input facts are present.

Presence/absence, quantity and order probes still select the component root; absence
does not disable these obligations. A compound rule with a structural assertion is
not excluded wholesale, nor is a multi-property rule with any available property.
Relationship checks do not invent a property dependency from their capability label.
Legacy contracts without the variant-facts profile retain their existing path.

The user's 2026-09-25 06:40 report replays as 13 compliant / 10 not-applicable /
8 not-executed (previously 13 / 7 / 11). Only nowrap, text-resizing and editorial
Label coverage changed; all 18 engine evaluations and package readiness match.
The scenario remains incomplete and the contract Draft. Manual r8, imported ZIP,
generated facts and Predicate Engine are unchanged; restart Editor, no new package
is required. Validation: 110 unit tests, typecheck/build, browser import/report
download with exact Node replay. This is not a new live Figma capture.

### Variant availability (0.2.17)

The compiler accepts read-only Athena variant anatomy independently of manual
source. Generated `facts.variantEvidence` deduplicates structures; the package
records its own generated-facts hash. Import, session persistence, export and
report replay retain this evidence. Manual-only imports remain legacy/conservative.

Availability is confirmed only when the exact variant key, variant properties,
catalog structure, complete live reference and actual structure agree. Root names
and diagnostic node IDs do not define identity. Renames, duplicate paths, structural
swaps/drift, truncation and missing evidence require remapping, never a guessed absence.
Switching variants no longer mutates manual target resolution or follows recycled
`preview:*` IDs. Declared targets must be witnessed in the same component family.

The runtime distinguishes a present target, a confirmed absent target, and unknown
evidence. Quantity checks can prove zero for an absent role. Property checks are
not applicable when the variant has no target/consumer. Missing facts are never
filled with `false`. Figma property references are captured with their owning
instance boundary: a nested consumer cannot activate a host property accidentally.
All verdicts still come from the unchanged canonical Predicate Engine.

Button manual r8 keeps one SingleIcon rule with two composition assertions:
one visible Addon, zero visible Label/Hint. The former four-assertion r7 wrongly
required Label/Hint boolean values in variants without those elements. Its synthetic
tests were not proof of reachable Figma states. New golden fixtures project real
Athena anatomy for desktop/mobile and regular/inverted Button.

Limit: this is an availability gate, not a complete dependency graph for modes,
exposed nested properties, slots or frontend representations. Unverified structures
remain unknown. Live Figma acceptance is required; the Button package stays Draft.

### Explicit host conditions and observed facts (0.2.16)

The SingleIcon rule from this release is superseded by r8 above. Its stable source
Rule ID is unchanged; do not use the old synthetic acceptance instructions.

`applicability.conditionSubject` explicitly chooses `component-root` or `target`.
Omitted values retain legacy target-relative semantics. The form exposes semantic
context JSON, additional constraints/control paths, and the first constraint's
fact; saving no longer discards a compound rule's remaining restrictions or
its imported platform scope. The rule card shows semantic preconditions too.

An explicit `quantity.targetRoles` union references declared semantic targets.
This version requires `visibleOnly=true`; it does not claim to count hidden nodes.
Missing, duplicate, ambiguous or truncated targets and unknown visibility cannot
produce a pass. Component-relative effective visibility includes ancestor visibility.
An unavailable target remains unverified, never silently matched by its name here.

Figma capture now records text auto-resize, alignment, truncation/max-lines and
the actual parent's layout mode/clipping. Unsupported/mixed fields remain unknown.
No loading, addon-size, icon-library or textResizing semantics are inferred from names.
Those rules remain context-only; pattern/editorial delegations are unchanged.

New compiled packages declare `snapshotProfile: component-facts-v2`; old runtime
contracts keep their original replay/hash behavior. The pilot's manual r7 is based
on the user's r6 report, changes only SingleIcon, and stays Draft pending live review.
Reload Editor and import the new `Button.editor-input.zip` for this rule update.
See [`docs/P0_SINGLE_ICON.ru.md`](docs/P0_SINGLE_ICON.ru.md) for acceptance cases.

### Package readiness vs scenario completeness (0.2.15)

The footer shows two independent states: **Контракт** describes the whole package;
**Этот сценарий** describes only the captured instance and selected context.
Draft/unimplemented rules and unresolved authoring targets keep package readiness
at Draft even if this particular scenario is fully evaluated. A complete run can
still contain violations; neither status certifies production readiness.

For compiler-excluded and delegated rules, diagnostic-only applicability probes
reuse the compiler's selectors/conditions and the canonical Predicate Engine.
Only a proven scope/condition mismatch becomes **Не применяется**. Missing or
ambiguous targets, unknown context and unmapped conditions never imply a pass or
safe exclusion. Unsupported Product identifiers (e.g. legacy `alfa-business`
instead of the Editor's `ab`) are not guessed to be another product. A known
mismatch in a different dimension can still exclude the rule (AND semantics).
Probes do not execute constraints, change manual source or enter compiled RuleIR.

`execution.missingFacts` is inspected against the snapshot using the engine's
fact resolver. Root `semanticApi.*` dependencies and target-local dependencies
retain their separate scopes. Available facts are listed separately; absent,
unknown and unsupported data remain unavailable. Even if every dependency is
present, `context-only` stays unexecuted until explicitly implemented.

Reports expose `summary.contractReadiness` and `summary.scenarioCoverage`, with
`coverageModel: contract-and-scenario-v1`. Existing summary fields and
`results.editor.editorCoverage` alias scenario coverage. Raw `results.engine`
is unchanged; Editor diagnostics carry `origin`, `applicabilityEvidence`,
`factAvailability` and `packageGapReasons`. Replay with the same build preserves
both independent metrics. Older reports are not rewritten.

### Reproducible reports, token evidence and semantic bindings (0.2.14)

Paint comparisons show the full `tokenId` beside the color; **Полный JSON**
reveals the unshortened evidence. Missing bindings are labelled as missing, not
replaced with invented IDs or token names.

The runtime evaluates a JSON-normalized snapshot, ignoring a stale cached
`snapshotHash`. Exports record `engineSnapshotHash` and reject a snapshot changed
after evaluation. Replay using the same build preserves evaluation IDs as well as
verdicts. Old 0.2.13 reports remain untouched; their original hashes are not
retroactively certified.

Explicit root `component.properties.*` bindings now materialize `semanticApi`
facts for one exact Figma representation key and platform. Supported transforms:
identity, number-to-string, boolean-string and domain-backed pascal-case (read in
the Figma → semantic direction). Binding provenance is included in the snapshot.
No name matching, default values, nested-slot or loading inference is performed.
Missing/ambiguous identity, unavailable properties and unsupported transforms
remain unknown. Only declared `semanticApi.<id>` conditions are executable;
other context conditions remain compiler exclusions. Deprecated rules remain in
manual history but do not execute or become missing-execution diagnostics.

### Download a validation run (0.2.13+)

After checking a preview or selected instance, click **Скачать отчёт JSON** in
the bottom bar. Incomplete runs can also be downloaded. This is a separate
`*.validation-report.*.json` file, not the ZIP's compiler-only validation report.

The versioned `apollo.editor-validation-report.v1` payload contains the exact
checked snapshot (including context, baseline and unknown facts), manual source
and revision/hash, compiler issues/coverage, original compiled contract, actual
runtime contract with temporary draft activation, raw engine results, Editor
coverage diagnostics and displayed details. Capture warnings, Figma locators
(file key when available) and baseline matching counts are retained. Preview
locators may point to already removed temporary nodes; they are diagnostic only.
Truncated 500-node captures explicitly keep validation incomplete.

The report is serialized at evaluation time and invalidated on contract/context
changes or a new check. It is not persisted in clientStorage. No screenshot is
included and nothing is automatically uploaded. **It does contain layer text,
names, properties and the full manual source**; review before sharing.

To replay with the same Editor build, pass `snapshot` and
`runtime.evaluatedContract` to `evaluateCompiledContract`. Rebuild Editor
diagnostics using `sources.manual`, `sources.compiledContract`,
`sources.compilerIssues` and that snapshot. Runtime activation is explicit;
never replace the original compiled contract with the authoring-only copy.

### Validation transparency (0.2.12)

Saving a `reviewed` rule runs the shared manual validator before committing the
edit. Invalid fields are highlighted with inline messages and focus moves to the
first error. The previous manual revision is preserved; unrelated imported rule
errors do not prevent editing a valid rule. Drafts can retain incomplete content.

The Editor adds a **Не выполнено** diagnostics category for compiler-excluded
rules, missing runtime facts, unexecuted delegations and missing evaluation
results. These are Editor coverage diagnostics, not new Predicate Engine verdicts.
Policy-only permissions do not require execution. Known scope mismatches remain
**Не применяется**, never a pass. Missing target evidence, unknown results and
validation errors keep the check explicitly **Проверка неполная**. Compiler
exclusions remain package gaps; since 0.2.15, known out-of-scenario rules are
separated from unresolved applicability. Completed evaluation does not mean compliance
or production readiness. Changing the contract clears stale validation results.

### P0 applicability semantics (0.2.11)

Product, platform, channel and page type scopes use three-valued applicability:
matching context runs the constraint; a known mismatch is `not-applicable`;
missing, null, empty or explicitly unknown context returns `unknown` and the
rule's `human-review` / `not-evaluable` result. A known mismatch in another scope
dimension or `when` condition still makes the rule inapplicable (AND semantics).
An empty scope array means **All**, not missing evidence. Variant and mode
conditions now preserve absent facts as unknown rather than a mismatch.

Unmapped `applicability.context` conditions are rejected with
`RULE_CONTEXT_UNMAPPED`, retained in manual/policy output and listed as
non-executable. Since 0.2.14, explicitly declared `semanticApi.<id>` conditions
use the limited root-binding adapter described above. No assumption such as
`loading` meaning `page.context.loading` is made. Keep such rules `context-only`
until a semantic binding is implemented. Predicate scopes marked
`needs-confirmation` also require explicit confirmation before execution.
Contracts with non-executable rules remain `draft` even if all rules are reviewed.

The acceptance matrix and remaining work are in
[`docs/P0_APPLICABILITY.ru.md`](docs/P0_APPLICABILITY.ru.md).

A standalone manual source intentionally has no generated variant inventory.
The Editor therefore does not call `importComponentByKeyAsync` with its
Component Set key; select a document instance to materialize the test subject,
or import Athena evidence to enable isolated variant preview.

Permission is not overloaded as a routing mechanism: `allowed` is emitted as a
policy-only entry, `forbidden` compiles to an effective-baseline check, and
`constrained` compiles the selected typed constraint. Delegation is expressed by
an `inherited-port` control path, not by a fourth permission state.

Execution is a separate axis. Each rule declares `predicate`, `policy-only`,
`delegated`, or `context-only` (or lets `auto` select the safe default). The
compiler never turns prose or a missing runtime fact into an executable check.

One stable `componentId` may contain multiple Figma and code representations.
Switching desktop/mobile evidence changes preview context without creating a
parallel semantic contract or losing edits to the shared manual source.

## Run locally

```bash
npm run validate
```

Then import `manifest.json` in Figma Desktop via **Plugins → Development → Import
plugin from manifest**.

## MVP boundaries

- One semantic component per session, with multiple representation previews.
- Eight typed constraint families: property domain, presence/absence, forbidden
  property, quantity, position/order, relationship, token binding and layout.
- External ownership is represented only by a component-local control port. A
  later `PatternContract` can bind that port to the real owner.
- Existing compiled v2 files are retained as read-only evidence. They do not
  regenerate missing manual intent.
- No Git publishing, AI rule generation, code mapping editor, pattern/page rules,
  arbitrary RuleIR editor, or automatic mutation of the user document.

The preview and selected-instance reference renderers always remove their
temporary instances and service pages in `finally` blocks, including error
paths. Post-generation validation reuses the same snapshot contract and Apollo
Predicate Engine; generation and automatic repair themselves remain outside the
Editor MVP.

### Native nested instance replacement

Core0.1.22 / Editor0.2.108 support the explicit `instanceReplacementDomain` opt-in for a root-owned native instance. Family/VARIANT domains remain predicates; missing source proof stays UNKNOWN. A foreign component body does not inherit the parent baseline. The Editor preserves imported replacement domains during rule edits. This support does not grant library membership, generation acceptance or runtime installation.
