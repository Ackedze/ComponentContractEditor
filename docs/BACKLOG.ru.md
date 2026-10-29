# ComponentContract Editor — Backlog

## CC-COMPAT-MANUAL-EDIT-DATES-01 — дата реального изменения manual

22.10.2026. Editor **0.2.108** / Core **0.1.23**. Исправлены два UI writer:
удаление существующего правила и изменившийся quick policy записывают UTC
`metadata.updatedAt` вместе с повышением revision. `createdAt` сохраняется.
Пустой/устаревший выбор правила и повторная защита — no-op без новой даты.
Core/compiler/schema, ручные нормы и исторические источники не менялись.

Регрессии исполняют реальные handlers и настоящий core: до правки 0/3, после
3/3. Штатный `npm run validate`: typecheck, build и **859/859** tests PASS.
Итоговые source/build pins сохраняются в final handoff ASA-028.
Публикация и фактическая загрузка в Figma отдельно.
Ранее сохранённые даты не восстанавливаются из mtime, commit time или времени
переноса; точную версию задают revision и hashes.

Влияние на Apollo/Proxy: штатная новая правка manual меняет hash/pins;
чтение прежних контрактов и показ даты уже поддержаны. Парная запись:
[Apollo backlog](../../Apollo/docs/ARCHITECTURE_BACKLOG.md#cc-compat-manual-edit-dates-01--дата-реального-изменения-manual).

## CC-COMPAT-INSTANCE-PATH-PROJECTION-01 — облегчённый поиск native экземпляров

19.10.2026. **IMPLEMENTED / CONFIGURED_GATES_PASS / PLUGIN_BUILT / NATIVE_TIMING_PENDING**.
Core **0.1.20**, Editor **0.2.107**. General — единственный shared writer;
Contract Creation, Mapping, Generation, DesignCheck подтвердили HOLD.

`instanceAtPath` использовал полный `collectSceneNodes` только ради paths и
component/source identity. Новый внутренний projection `identity` сохраняет
тот же bounded topology, native SLOT frontier, main identity, pristine source
correspondence и финальный topology/handle readback, пропуская visual, TEXT,
variable/style facts. Этот projection не экспортируется как нормативный capture;
полные capture и anatomy freshness по-прежнему читают все факты. Общий механизм
не содержит веток по компонентам. Кеш эталонов и валидации не добавлялся.

Consumer impact: общая capture-реализация, Editor и Apollo main bundles; публичная
схема, source/compiled contracts, authority, UNKNOWN/coverage, baseline и cleanup
сохраняются. Новые регрессии запрещают повторное чтение unrelated actual facts
при поиске; на прежнем capture они воспроизводят дефект. Exact before/after
synthetic capture matrix **16/16** совпала целиком, включая failures, references,
mode context и cleanup. В базовом случае измеренные getter reads **74→38**;
это synthetic API count, не native latency. Нужны configured Core/Editor/V4/root
gates и новый пользовательский timing на той же области. Предыдущий замер
**31.693с** остаётся baseline; неизвестное ускорение не объявляется.
Evidence: `.local/apollo-general-2026-10-19/instance-path-resolution-optimization`.

Configured gates: Core **435**, Editor **877**, Apollo **1111**, root **81**
PASS. Три новые regression cases воспроизводятся на прежнем bundled capture и
проходят на новом; полная16-case before/after matrix совпала. Main/UI parser и
stale/cancel/focus/scoped recheck регрессии включены в V4 gate. Серверный runtime
побайтно прежний, Proxy PID65819 сохранён без restart; фактические11 metadata /
10 checking contracts и979 history files прочитаны. Новый native timing pending.

Парная запись: Apollo `docs/ARCHITECTURE_BACKLOG.md`, тот же stable ID.


## CC-COMPAT-AUDIT-PERFORMANCE-01 — индексы, capture и компактный отчёт

Продолжение: локальные индексы происхождения и проверка pin.

19.10.2026. **IMPLEMENTED / CONFIGURED_GATES_PASS / INSTALLED / NATIVE_TIMING_PENDING**. Core **0.1.20**,
Editor **0.2.107**. CPU profile audit подтвердил повторный обход parent/source
ports и пересчёт одного dependency contract hash для каждого binding.
Индексы живут только в одном сравнении/сборе source identities; нормализованное
pristine дерево и точный индекс source ID/type/parent сохраняют прежние проверки
независимости и first-match. Pin проверяется один раз на зависимость внутри
evaluation; каждый binding и child capture выполняется отдельно. Native факты,
references, final freshness, UNKNOWN, authority и нормы неизменны; cross-run
cache отсутствует. Следующий вызов заново читает аргументы и проверяет pin.

Consumer impact: пересборка Core/Editor/Apollo main/runtime, operational readback
Proxy; приёмка Apollo отдельна от Editor tests. Критерии: configured full gates,
exact retained replay 12/3181 и полные capture/failure/cleanup parity, подтверждение
current runtime/data/history. Native latency остаётся до нового прогона владельца.
General — единственный writer, все четыре роли HOLD. Evidence:
`.local/apollo-general-2026-10-19/audit-fact-rule-optimization`.
Каноническая запись: [Apollo architecture backlog](../../Apollo/docs/ARCHITECTURE_BACKLOG.md#cc-compat-audit-performance-01--индексы-capture-и-компактный-отчёт).

Configured gates: Core **438**, Editor **877**, V4 **1111**, root **81**;
Proxy data-package tests **12** PASS. Exact before/after capture16, retained
replay12/3181: все facts/hashes/traces/coverage прежние. Offline evaluation
в двух проходах **9.875→5.970с** (−39.5%); native Figma timing ещё не измерен.


19.10.2026. **IMPLEMENTED / CONFIGURED_GATES_PASS / INSTALLED / NATIVE_TIMING_PENDING**.
Core **0.1.20**, Editor **0.2.107**. General — единственный shared writer;
Contract Creation, Mapping, Generation и DesignCheck подтвердили HOLD.

Индекс узлов predicate живёт только в одном исполнении; runtime использует
индексы правил/узлов с прежним first-match. Capture читает все факты, сохраняет
независимый baseline и freshness, но anatomy-only перепроверка не строит полный
snapshot. Поиск путей индексирован; независимые TEXT reads ограничены 6 workers,
создание/удаление references остаётся последовательным. Подэтапы capture доступны
в timings вне нормативных hashes. Proxy повторно использует принятую компиляцию
по точным data/runtime hashes, перепроверяя index и bytes всех source/cache files
на каждом чтении; кеш ограничен и не разделяет изменяемые объекты с callers.

V4 передаёт UI `apollo.audit-summary.v1`: findings/allowed, полные counts,
coverage/UNKNOWN и данные переходов. Полный audit остаётся в main и доступен
отдельным коррелированным запросом; объяснение получает только выбранный снимок.
Экспорт по умолчанию — сводка; полная диагностика — отдельная кнопка и компактный
JSON прежнего полного формата. Stale/cancel/page/recheck guards сохраняются.
Bridge/render-to-frame timing выводится отдельно в console.

Consumer impact: Core/Editor/V4 bundles и Proxy runtime; нормы, data index,
contract archives, authority, Ready и набор проверок не изменяются. Новый каталог
правил и зависимости не добавлены. Требуются full configured gates, exact replay
12 frozen components и сохранность истории при разрешённом restart. Скорость
нативной проверки должна быть измерена следующим пользовательским прогоном.
Evidence: `.local/apollo-general-2026-10-19/audit-performance-implementation`.

Configured gates: Core **432**, Editor **877**, V4 **1111**, root **81**,
Proxy **50** PASS. Browser QA текущей панели **800/1024** PASS: сводка/full JSON
roundtrip, selected explain без автоматического agent call, stale reply,
keyboard focus и отсутствие нового горизонтального скролла. Фиксированная ширина
панели800 — прежнее ограничение;360px не принимается этим изменением. Старый
optional UI browser harness с прежней навигацией не является прошедшим gate.
Новый целевой harness: `tests/audit-report.browser.cjs`.
Exact replay12/3181 PASS. Размер обычной сводки **71,578B** вместо **77,096,687B**;
полный прежний формат доступен явно, без pretty whitespace. Один offline replay
evaluate **8.622→8.441с**, не native ускорение. Повторный reader Proxy
**1.225с→87.5мс** с hash guards. Proxy **PID65819**, dataId и все979 history files
сохранены. Runtime source writes закрыты; новый native timing ожидается.


## CC-COMPAT-SHA256-PERFORMANCE-01 — общий SHA-256

19.10.2026. **IMPLEMENTED / CONFIGURED_GATES_PASS / INSTALLED / NATIVE_TIMING_PENDING**. Core **0.1.20** /
Editor **0.2.107**. Общий SHA-256 сохраняет UTF-8/canonicalization/хеши;
константы больше не строятся на каждый вызов, round state не сдвигает массивы.
Consumer impact: пересборка Core/Editor/Apollo и actual Proxy runtime refresh;
данные контрактов и нормы неизменны. Приёмка: полные gates, Node crypto parity,
точный frozen-report replay, actual runtime/readback и история. Offline benchmark
не заменяет fresh native timing.
General: Core **430** / Editor **877** / Apollo **1107** / root **81** PASS,
248 прямых SHA vectors и exact replay 12 компонентов PASS. Proxy PID **45911**,
данные и 979 history files сохранены; native speed после SHA update ещё не измерен.
[Apollo backlog](../../Apollo/docs/ARCHITECTURE_BACKLOG.md#cc-compat-sha256-performance-01--общий-sha-256-без-сдвигов-массивов).

## CC-COMPAT-AREA-CAPTURE-TIMINGS-01 — замеры area audit и необязательный preview

19.10.2026. **IMPLEMENTED / CONFIGURED_GATES_PASS / NATIVE_TIMING_RECORDED**. Core **0.1.20** /
Editor **0.2.107**. `captureInstanceAudit` получил необязательный `includePreview`;
Editor не передаёт false и сохраняет PNG, dimensions и прежние ошибки экспорта.
Только Apollo area audit отключает неиспользуемый PNG и сохраняет stage timings
вне canonical snapshot/hash. Нормы и статусы не меняются. Приёмка: общие и Editor
регрессии, parity preview on/off, cleanup/stale/cancel; нативный замер отдельно.
General: полные Core **429** / Editor **877** / Apollo **1107** / root **81**
PASS; текущие build inputs и установленный Proxy проверены. Editor сохраняет
PNG по умолчанию. Fresh Canvas timing и UI latency не измерялись.
Канонический consumer impact и критерии:
[Apollo backlog](../../Apollo/docs/ARCHITECTURE_BACKLOG.md#cc-compat-area-capture-timings-01--отключение-лишнего-png-и-замеры-проверки).

## CC-BLEND-MODE-001 — blend mode и effective baseline

16.10.2026. **SHARED_IMPLEMENTATION / CONSUMER_AND_NATIVE_PENDING**. Editor **0.2.105**, core **0.1.18**.
Общий capture сохраняет `appearance.blendMode` проверяемого узла и независимо
созданного effective baseline. `propertyForbidden` использует существующий
`matches-effective-baseline`; отсутствие actual или baseline даёт UNKNOWN /
human-review, без пустого selector и ложного compliant. Специальных условий
по имени BackgroundPlate, новых predicates и UI controls нет.
Изменение общих source/build pins переводит прежние зависимые receipts в historical.
Configured core/Editor/Apollo gates фиксируются в отдельной закрытой передаче;
они не заменяют свежую consumer/runtime приёмку General и native проверку Editor.
Критерий закрытия: принятые source/build/config pins, свежий actual consumer/reader,
native нарушения blend mode корня и вложенной поверхности, missing facts → UNKNOWN.
Границы generation pilot, нормы, schema/API и Draft/Ready gates сохранены.
Парная запись: [CC-BLEND-MODE-001 в Apollo](../../Apollo/docs/ARCHITECTURE_BACKLOG.md#cc-blend-mode-001--blend-mode-и-effective-baseline).


## EDITOR-ICONVIEW-ADDON-PART-IDENTITY-001 — цепочка владельцев повторяющихся вложенных целей

15.10.2026. **GENERIC_READER_FIX / NATIVE_ACCEPTANCE_PENDING**. Editor **0.2.104**, core **0.1.17**.
Общий sourceMatches проверяет native occurrence каждого владельца до root для
identity v1/v2/v3 и native target properties. Повтор одного варианта в разных
ветках разрешается по цепочке source identity; duplicate/foreign/missing/unknown,
caller SLOT, stale reference, тип и cardinality остаются отказами. Имена
компонентов и paths не добавлены как fallback. API/schema/producer stamps и
нормы не меняются. Независимая private проверка: 345 synthetic core tests,
включая 12 новых; исходная реализация воспроизводит дефект в 7 из 12 cases.
Shared core/Editor/Apollo gates и свежий consumer/runtime принимаются отдельно.
Три raw r6 отчёта сейчас недоступны: повтор retained-native replay —
NOT_RUN_MISSING_RAW_INPUT; прежние 15 Engine-only решений остаются historical.
Парная запись: [V4-ICONVIEW-ADDON-PART-IDENTITY-001](../../Apollo/docs/ARCHITECTURE_BACKLOG.md#v4-iconview-addon-part-identity-001--цепочка-владельцев-повторяющихся-вложенных-целей).


## EDITOR-HIDDEN-TARGET-COVERAGE-001 — доказанная скрытая цель ошибочно считается потерянной

10.10.2026. **GENERAL_TECHNICAL_ACCEPTED / LINK_INSTALLED_SCOPED / BENEFITCARD_PENDING**, Editor **0.2.100**, core **0.1.16**.
Повтор family `button-hidden-label-coverage`: Link r3 Addon=false давал четыре
ложных missing-target diagnostics, BenefitCard r5 hidden Title D/M — ещё один.

`buildEditorValidationReport` получает явную пятую опцию
`{hiddenTargetCoverageVersion:1}`, которую Editor передаёт при selected-instance
проверке и сохраняет в coverage/download. Только заново доказанный resolved/present
скрытый child в scope self получает not-applicable вместо missing; visibility
с отсутствующим/отличным baseline не исключается. Structural/required assertions,
missing/stale/foreign/duplicate/incomplete proof и scope descendants сохранены.
Без опции historical Editor report семантика прежняя; raw Engine неизменён.

Core 309/309, Editor 828/828, Apollo 611/611, root 81 files PASS. 12 retained
actual snapshots: exact Engine и legacy Editor replay; новая опция даёт Link
7→3 not-executed и hidden Title D/M 4→3, required violation и RESET сохранены.
Это offline проверка; subsequent Link installed confirmation записана ниже.
BenefitCard hidden Title D/M в Editor 0.2.100 ещё NOT_RUN_USER_ONLY.
Независимая техническая проверка General принята в ограниченной области.
Link r3 / BenefitCard r5 и нормы не менялись; полный Ready/release не заявлен.

Apollo runtime bytes и 216 dependency source pins неизменны: эти report modules
в inventory не входят. Только runtimeVersion metadata 0.1.15→0.1.16 и embedded
build seal main/UI обновлены обычной сборкой. Consumer adoption/freshness отдельно.
Evidence: [reading fix](../../../shared/design-system_ab/experiments/current-contract-packages/Link/reports/reading-fixes/hidden-target-coverage-2026-10-10/replay.json).
Парная запись: [CC-COMPAT-HIDDEN-TARGET-COVERAGE-05](../../Apollo/docs/ARCHITECTURE_BACKLOG.md#cc-compat-hidden-target-coverage-05--диагностика-скрытых-целей).


Независимая техническая приёмка General 10.10.2026: root configuration и bounded hidden-target diagnostics приняты как совместимый общий вход пилота. Сверены final pins до/после, 12 exact historical report replays, 16 hidden-target guards и 216 входов v4. Runtime bytes/source inventory v4 сохранены; report-only модули отсутствуют в inventory. Это не normative/native-live/Ready приёмка; installed Editor 0.2.100, consumer adoption и остальные scope остаются открыты. Evidence: [General technical review](../../../shared/design-system_ab/experiments/current-contract-packages/Link/reports/reading-fixes/hidden-target-coverage-general-review-2026-10-10/review.json).


Installed Link r3, Editor 0.2.100 / core 0.1.16, 10.10.2026 17:47–17:48 MSK: **3/3** submitted captures exact Engine/Editor/details replay, 8 resolved, violations/inconclusive=0, 3 context-only. Addon=false исключает четыре proven hidden targets без ложных missing diagnostics; RESET на том же INSTANCE `13666:67948` восстанавливает visibility с сохранением native source identities/root layout/text/context. Custom Label «Открыть подробные условия» и эталонная типографика проходят. Hidden Addon fix принят для Link; BenefitCard hidden Title D/M и его RESET в новой версии, nested Line/icon, configured Label negative/preserving RESET, consumer adoption и полный Ready остаются открыты. Нормы/ZIP/manual/compiled/Draft сохранены. Evidence: [installed review](../../../shared/design-system_ab/experiments/current-contract-packages/Link/reports/live-review-r3-2026-10-10T14-47-17Z/review.json).


## EDITOR-DECLARED-TARGET-CONFIGURATION-001 — публичная настройка обнуляет declared targets

11.10.2026 — **PUBLIC_SWAP_FIX_LOCAL_PASS / NATIVE_PENDING**. Editor **0.2.103**,
общий core **0.1.17**, Link **r4**. Explicit configuration v2 проецирует только
безусловно разрешённый root-owned внешний swap-слот с точным INSTANCE_SWAP port,
source/owner/type и единственным consumer. Asset и его внутренности отделены
от identity слота; host/catalog и visual constraints сохраняются. V1 и unmarked
contracts не получают новую семантику.

Core 333/333, Editor 829/829, Apollo 655/655, root 81 regression files PASS.
27 historical r3 Engine/Editor replays exact; нарушения сохранены. Два latest
retained captures на candidate r4 дают 8 resolved / 0 inconclusive / 0 violations;
8 counterfactual checks и synthetic negative/RESET/UNKNOWN guards PASS.
ZIP/manual/compiled/facts согласованы; нормы, 18 Draft statuses и Ready gates
сохранены. Fresh installed Editor/r4 cycle ещё NOT_RUN.

При v4 rebuild восстановлена exact ранее принятая readonly callback config
после промежуточной сборки без неё; final path/SHA и validate проверены отдельно.
Consumer freshness/adoption и независимая приёмка остаются открытыми. Закрытие
этого scope требует fresh public swap → height violation → RESET и General review.
Evidence: [fix handoff](../../../shared/design-system_ab/experiments/current-contract-packages/Link/reports/reading-fixes/public-instance-swap-2026-10-11/HANDOFF.json).
Парная запись: [CC-COMPAT-DECLARED-TARGET-CONFIGURATION-04](../../Apollo/docs/ARCHITECTURE_BACKLOG.md#cc-compat-declared-target-configuration-04--конфигурация-и-native-identity).


11.10.2026, 10:00 MSK — **PUBLIC_INSTANCE_SWAP_READING_FAIL / RESET_PASS_SCOPED**.
Link r3, installed Editor **0.2.101**, shared core **0.1.16**: два actual capture
на INSTANCE `13666:68129`. Разрешённые Left/Right icon 24 swaps на rocket/flag
дают 0 violations, но **32 human-review / 0 resolved**; RESET diamonds —
0 violations/inconclusive и 8 resolved. Capture complete, 17 nodes, source
addresses/host owner/typed public ports и размеры 24×24 сохранены. Whole
configuration pin всё ещё включает INSTANCE_SWAP values и выбранный subtree;
все восемь targets получают reference-pin-stale. Из 32 UNKNOWN — 31 selector
и 1 absent configured Size. Engine/Editor/details replay exact через frozen
core 0.1.16 и совместимые API Editor 0.2.100; actual capture 0.2.101 отдельно
не пересобирался. Нормы/ZIP/manual/compiled не менялись, product fix не внесён.

Необходимый bounded fix: доказанная native occurrence/port identity и
correspondence при разрешённом внешнем asset; исключать только declared
external swap contents, сохраняя source/owner/type/cardinality/stale-host и
visual baseline guards. Простого удаления swap value из root hash недостаточно.
Критерий: retained swap/RESET 8 resolved/0 inconclusive, положительные публичные
порты и отрицательные foreign/duplicate/missing/stale/visual cases; historical
policies и TEXT/BOOLEAN/Line replays сохранены. Editor/Apollo consumers и
fresh native cycle проверяются отдельно; Ready/adoption/release открыты.
Evidence: [public icon review](../../../shared/design-system_ab/experiments/current-contract-packages/Link/reports/live-review-r3-2026-10-11T07-00-25Z/review.json), [fix plan](../../../shared/design-system_ab/experiments/current-contract-packages/Link/reports/live-review-r3-2026-10-11T07-00-25Z/FIX_PLAN.ru.md).


10.10.2026. **P0, ROOT_CONFIGURATION_AND_LINE_DOMAIN_INSTALLED_SCOPED / GAPS_OPEN**.
**Editor 0.2.99 / shared core 0.1.15 / Link r3**. Причина: whole portable
reference pin Link r2 включал разрешённые публичные Label и Addon BOOLEAN;
два installed кейса давали по 31 human-review и восемь reference-pin-stale.

Реализован явный opt-in `declaredTargetConfigurationVersion=1` для identity v3
с `configurationReferenceHash` в каждой binding и exporter 0.2.99. Из identity
hash исключаются только согласованные typed declared root TEXT/BOOLEAN values;
presence/type, definitions, source/owner/topology и прочие reference fields
сохраняются. Настройки и visual overrides проверяются независимым effective
baseline и прежними правилами. Без opt-in исторические hash semantics сохранены.
Nested Line и INSTANCE_SWAP остаются pinned: это отдельный незакрытый scope.

Core 293/293, Editor 826/826, Apollo 611/611 и Apollo root 81 regression files
прошли обычный validate. Пять неизменённых r2 snapshots replay на r3 дают
0 violations / 0 human-review / 8 resolved. Exact historical r2 replay сохранён;
шесть CC/BG/Button/Spinner packages import/compile совпадают с core 0.1.14.
Local fontSize negative+RESET и stale/foreign/missing/type/duplicate guards PASS.
Private captures не добавлены в source fixtures. Это локальная проверка, не
установленная приёмка r3, не Ready/release и не независимая проверка General.

Открыто: installed r3 TEXT/BOOLEAN negative+RESET, nested Line/icon ports,
source/context conflicts, consumer freshness/handoff и независимая приёмка.
Полное закрытие этой задачи не заявлено.

Evidence: [r3 eval](../../../shared/design-system_ab/experiments/current-contract-packages/Link/reports/skill-evals/link-r3-root-configuration-2026-10-10/eval.json). Парная задача:
[CC-COMPAT-DECLARED-TARGET-CONFIGURATION-04](../../Apollo/docs/ARCHITECTURE_BACKLOG.md#cc-compat-declared-target-configuration-04--конфигурация-и-native-identity).

Installed Link r3 review 10.10.2026 09:52 UTC: четыре exact Engine/Editor replay,
все восемь targets resolved и inconclusive=0. Длинный Label в отрицательном
typography кейсе сохраняет identity; два нарушения fontSize/tracking обнаружены,
полный сброс того же INSTANCE возвращает default Label и чистую типографику.
Оба Addon=false сохраняют identity, но Editor добавляет четыре ложных missing
target diagnostics для скрытых Addon/icon — повтор `button-hidden-label-coverage`.
Это scoped identity PASS; clean long Label и RESET с его сохранением ещё NOT_RUN.
Nested Line/icon, Source/context, independent General и consumer adoption открыты.
Нормы, ZIP и Draft статусы сохранены. Evidence: [r3 live review](../../../shared/design-system_ab/experiments/current-contract-packages/Link/reports/live-review-r3-2026-10-10T09-52-35Z/review.json).

Installed Link r3 / Editor 0.2.100, 10.10.2026 20:56 MSK: **2/2** Line=`Pseudo` → `Solid` RESET на том же INSTANCE `13666:67968`. Exact Engine/Editor/details replay совпал, 8 resolved / violations=0 / inconclusive=0 / 3 context-only. `component:web-core.link.underline-domain.1.1` actual=Pseudo/Solid, applicable/compliant; native Underline variant key меняется, component set и source port сохраняются. Root properties/layout/appearance, context и прочие native identities/типографика сохранены. Этот nested Line Pseudo/Solid scope принят; Line=None/context, icon ports, configured Label preserving cycle, consumer adoption и полный Ready открыты. Нормы/ZIP/manual/compiled/Draft не менялись. Evidence: [Line cycle review](../../../shared/design-system_ab/experiments/current-contract-packages/Link/reports/live-review-r3-2026-10-10T17-56-33Z/review.json).

Installed Link r3 / Editor 0.2.100, 10.10.2026 21:27–21:28 MSK: **2/2** Line=None → Solid RESET на том же INSTANCE `13666:67989`. Exact Engine/Editor/details replay совпал; 8 resolved, violations/inconclusive=0, 3 context-only. `underline-domain.1.1` applicable/compliant с actual=None/Solid. Native None/Solid topology 16→17 nodes, Underline children 0→1; exact source port/component set, host properties/layout/appearance/context и другие declared sources сохранены. Вместе с предыдущим Pseudo/Solid receipt все три значения Line подтверждены. None usage color/context не принят автоматически; public icon ports, остальные baseline cycles, configured Label preserving cycle и full Ready открыты. Evidence: [None cycle review](../../../shared/design-system_ab/experiments/current-contract-packages/Link/reports/live-review-r3-2026-10-10T18-27-30Z/review.json).

Installed Link r3 / Editor 0.2.100, 10.10.2026 21:36 MSK: **4/4** root padding left 7→0 и opacity 0.5→1 negative/RESET. Exact Engine/Editor/details replay совпал; exact root RuleID .1.5/.1.12, violations 1/0/1/0 без дополнительных нарушений. 8 resolved, inconclusive=0, 3 context-only в каждом capture. Same-instance RESET сохраняет native identity/context/text и unrelated поля; pristine baseline не заменён actual override. Нормы/ZIP/manual/compiled/Draft/код не менялись. Root fill/tracking, public icons и full Ready открыты. Evidence: [baseline cycles review](../../../shared/design-system_ab/experiments/current-contract-packages/Link/reports/live-review-r3-2026-10-10T18-36-23Z/review.json).

Installed Link r3 / Editor 0.2.100, 10.10.2026 22:06–22:07 MSK: **4/4** root fill и Label tracking negative/RESET. Exact Engine/Editor/details replay совпал, violations 1/0/1/0, 8 targets resolved, inconclusive=0, 3 context-only. Доказаны точные RuleID root-fill-baseline.1.1 / label-typography.1.4 и RESET на тех же экземплярах, без лишних нарушений. Tracking RESET восстановил native style/variable bindings и добавил два captured context modes 1:0; общие modes сохранены, byte-идентичность context не заявляется. Нормы/пакет/код/Draft не менялись. Configured Label preserving cycle, public icon и другие scope/Ready проверки открыты. Evidence: [fill/tracking review](../../../shared/design-system_ab/experiments/current-contract-packages/Link/reports/live-review-r3-2026-10-10T19-06-57Z/review.json).

Installed Link r3 / Editor 0.2.100, 10.10.2026 22:13 MSK: четыре exact Engine/Editor/details replay, violations **0/2/0/0**, 8 targets resolved, inconclusive=0, 3 context-only. Custom Label (24 символа) проходит и сохраняется в отрицательном snapshot; два фактически изменённых typography поля дают точные .1.2/.1.4. Третий capture вернул default Label, четвёртый повторно задал custom text: **RESET_PRESERVING_TEXT_NOT_PROVEN**. 38-character запрос не выполнен, actual text допустим. Planned/actual inputs сохранены; нет подтверждённого runtime defect. Нормы/пакет/код/Draft не менялись. Evidence: [configured Label review](../../../shared/design-system_ab/experiments/current-contract-packages/Link/reports/live-review-r3-2026-10-10T19-13-14Z/review.json).

Installed Link r3 / Editor 0.2.100, 11.10.2026 09:07 MSK: **CONFIGURED_LABEL_PRESERVING_RESET_PASS_SCOPED**. Два exact Engine/Editor/details replay, violations 2→0; одинаковый INSTANCE/public Label (24 символа)/native identities/context, 8 targets resolved, inconclusive=0, 3 context-only. FontSize 18 и actual tracking −0.36 корректно нарушают .1.2/.1.4, native RESET 16/−0.24 сохраняет текст непосредственно. Запрошенный tracking 0 не вводился, actual evidence retained. Предыдущий historical gap не переписан; новый цикл закрывает preserving-text scope. Нормы/пакет/код/Draft не менялись. Public icons, >32-character sample, остальные full-contract/Apollo adoption gates открыты. Evidence: [preserving RESET review](../../../shared/design-system_ab/experiments/current-contract-packages/Link/reports/live-review-r3-2026-10-11T06-07-06Z/review.json).

11.10.2026, решение о reuse текстовых проверок: общий механизм core и BenefitCard matrix не повторяются вручную в Link. Native public Label + negative/preserving RESET Link r3 уже PASS_SCOPED; дополнительный 38-character sample снят как NOT_RUN_NOT_REQUIRED_OPTIONAL_REPEAT. Его live PASS и full Ready не заявляются; public icon scope открыт. Metadata correction: фактический custom Label содержит 25 символов, а не ранее вручную записанные 24; per-capture computed values и engine results правильны, закрытые receipts сохранены. [Decision/correction](../../../shared/design-system_ab/experiments/current-contract-packages/Link/reports/text-evidence-reuse-2026-10-11/decision.json).

## CC-COMPAT-NATIVE-CARD-FACTS-03 — текст, native properties и исключение instance swap

09.10.2026. Реализовано локально в **Editor 0.2.94 / shared core 0.1.13**.

- Compiler opt-in `textContentFactsVersion=1` и `nativeTargetPropertyFactsVersion=1` закрепляет producer 0.2.94. Отсутствующие/неподдержанные markers отклоняются. Legacy contracts без новых фактов сохраняют прежний replay.
- `textContentV1` пересчитывает Unicode code points и число строк только для доказанного равномерного auto-height текста без truncation, paragraphSpacing и maxHeight. Mixed/fixed/clipped или неполные факты остаются unknown; cached metrics не являются доказательством. Capture передаёт paragraphSpacing/maxHeight без defaults.
- `nativeTargetPropertiesV1` читает typed BOOLEAN/VARIANT выбранного exact native occurrence по независимому reference/source owner. Name/order fallback запрещён. Счётчик instance swap допускает только exact объявленное исключение; variant switch требует независимой host continuity, иначе unknown.
- Typed `expectedInput` finite context разрешён для root applicability; viewport берётся из явно указанного контекста, не из ширины компонента. LEFT constraint отбирает только видимые TEXT.
- Core **251/251**, Editor **823/823**, Apollo root **81 regression files** прошли стандартные validate. Первый Apollo validate **571/571** прошёл до обновления рабочего manifest. После обновления r4 финальный build остановлен на `STALE_CURRENT_AUTHORITY_REF` (manifest.json); свежие native profile regressions **5/5** прошли, полная consumer сборка требует перепривязки authority receipt владельцем этого контура. BenefitCard r4: 46 private counterfactual кейсов D/M прошли; это не live-приёмка. Private catalogs/отчёты не добавлены в source fixtures.
- Открыто: новые живые PASS/FAIL/UNKNOWN в установленном Editor/Apollo, точные Link/IconView/BackgroundPlate pins, библиотечный allowlist токенов, admission gate internal standalone parts и сквозная политика иконок. Родительская visual baseline continuity при разрешённом child configuration требует отдельной проверки.
- Consumer linkage: [одноимённая запись Apollo](../../Apollo/docs/ARCHITECTURE_BACKLOG.md#cc-compat-native-card-facts-03--текст-native-properties-и-исключение-instance-swap). Публикация/release не выполнены.

### Исправление чтения BenefitCard r5 · 09.10.2026

- [x] **Editor 0.2.95 / core 0.1.14:** opt-in `declaredTargetIdentityVersion=3`, exact producer `component-contract-editor@0.2.95`. Policies 1/2 сохраняют прежнюю семантику; marker/stamp mismatch и неизвестная версия отклоняются.
- [x] Корень configured native occurrence сохраняет declared identity только при точном source/owner/reference pin и независимо пересчитанном v4 host continuity proof. Исходный baseline запрещённых properties не заменяется новым child variant baseline. Descendants не получают identity по наследству; missing/foreign/stale/duplicate/incomplete/cached claims остаются UNKNOWN.
- [x] Graphic=Icon делает три ImageView rules not-applicable при доказанном preset. Доказанный false component-root guard исключает child rule без утверждения, что отсутствующая child target разрешена. Unknown root/guard продолжает давать UNKNOWN.
- [x] Локальные стандартные gates: **core 273/273**, **Editor 825/825**, **Apollo 590/590**, **Apollo root 81 regression files**. Main/UI Apollo пересобраны после обновления текущего пакета. Consumer v3 tests подтверждают native key switch, Icon/false guard parity и exact producer/Draft rejection. Существующий mapped BG/CC closure не менялся; новый Code Connect mapping не добавлен.
- [x] Исторические **12 retained r4 context reports** воспроизводятся exact на новом core. Offline повтор этих snapshots с теми же explicit inputs, заново закреплёнными за r5, сохраняет классификации. Старый input pin r4 не переносится автоматически. Исходные 52 first-column files сейчас отсутствуют; их прежний review receipt сохранён, новый exact replay всех 52 не заявляется.
- [x] BenefitCard **r5 Draft**, **21 неизменённое source rule / 37 IR / 4 nonExecutable**, **9 targets / 256 bindings / 32 variants**. Изменены только technical metadata и compiled projection; исходные нормы, разрешения, bindings и факты сохранены. r4 ZIP и manifests сохранены в history; новый ZIP и оба manifests согласованы.
- [x] **Fresh installed Editor r5, 09.10.2026 16:11–16:14 UTC:** BC4-307–312, BC4-319/320, BC4-V02/V25 и BC4-317/318 — **12/12 целевых результатов совпали**. Exact current ZIP/manual/compiled/runtime/snapshot hashes и engine/Editor replay проверены; Editor 0.2.95, explicit ViewportClass/CardPlacement, Figma parameters и HUG совпадают с планом. Capture complete, warnings=0. В 54 целевых оценках: **6 violation, 32 compliant, 16 not-applicable**; неожиданных violations нет. Это scoped Editor acceptance, source/ZIP/status/pins не изменены. [Live review](../../../shared/design-system_ab/experiments/current-contract-packages/BenefitCard/reports/reading-fix-live-review.r5.2026-10-09.json).
- [x] **Position negative/reset, installed Editor r5, 09.10.2026 16:46–16:58 UTC:** шесть свежих отчётов BC4-311/312 прошли exact ZIP/manual/compiled/runtime/snapshot hashes и engine/Editor replay на core 0.1.14; capture complete, warnings=0. При сбросе Position=Level 1 на D/M пять surface checks compliant и все девять targets resolved. В desktop reset 16:48 поля контекста пусты, поэтому два контекстных UNKNOWN сохранены; свежий reset 16:58:20 с ViewportClass=desktop / CardPlacement=single даёт ноль violations/UNKNOWN. Повторный Level 2 в 16:58:51 снова обнаружен. В 30 plate оценках: 3 violation, 15 compliant, 12 UNKNOWN по открытому Style gap; в 12 context оценках: 10 compliant и 2 missing-input UNKNOWN. Scoped reset принят на обеих платформах; пакет, нормы и Draft-статусы не менялись. [Negative/reset review](../../../shared/design-system_ab/experiments/current-contract-packages/BenefitCard/reports/position-reset-live-review.r5.2026-10-09.json).
- [ ] **Position descendant gap, BC4-311/312:** при запрещённом Position=Level 2 прежний Style Level 1 заменён Style Level 2 с другими native source/owner и componentSet. Independent host content matched не предоставляет новой declared target identity: `target.surface` — `native-cardinality-unresolved`. В каждом таком прогоне сохраняются 4 UNKNOWN (Color/Skeleton и два paint binding checks). Reset уже доказан и закрывает исчезновение этих UNKNOWN при возврате исходной конфигурации, но не разрешает identity нового Style. Не превращать их в PASS и не подставлять identity по name/order. Scope новой внутренней подложки требует отдельного BackgroundPlate contract/точного binding.
- [x] **Title 60/61, installed Editor 0.2.96 / core 0.1.14, r5, 09.10.2026 17:32 UTC:** BC4-211/212 и BC4-201/202 — 4/4 целевых character outcomes совпали; exact ZIP/manual/compiled/runtime/snapshot hashes и engine/Editor replay проверены. Capture complete, warnings=0, все девять targets resolved, explicit viewport/single/Hug совпадает с условиями. Title=60 проходит D/M; Title=61 нарушает character limit D/M. Desktop BC4-201 дополнительно занимает три строки и нарушает line limit; mobile BC4-202 занимает две строки и проходит его. В 16 целевых оценках: 13 compliant / 3 violation, UNKNOWN=0, неожиданных violations нет. Приёмка ограничена границей символов Title; isolated line limits, Subtitle, alignment, insufficient-fact cases и same-occurrence resets открыты. Нормы, ZIP, policy/producer и Draft-статусы не менялись; runtime импортированного r5 совпал, новый consumer format не создавался. [Title boundary review](../../../shared/design-system_ab/experiments/current-contract-packages/BenefitCard/reports/title-character-boundaries-live-review.r5.2026-10-09.json).
- [x] **Title 3 строки / Subtitle 121 символ, installed Editor 0.2.96 / core 0.1.14, r5, 09.10.2026 17:37–17:38 UTC:** BC4-203–206 — 4/4 целевых outcomes совпали; exact source/runtime/snapshot hashes и engine/Editor replay проверены, текущий ZIP совпал. Capture complete, warnings=0, все девять targets resolved, explicit viewport/single/Hug задан корректно. Title содержит 20 символов / 3 строки и нарушает только line limit D/M. Subtitle содержит 121 символ: desktop 4 строки нарушает оба лимита, mobile 3 строки нарушает только character limit. В 16 целевых оценках: 11 compliant / 5 violation, UNKNOWN=0, неожиданных violations нет. Открыты Subtitle=120, isolated Subtitle 4 строки, alignment, insufficient-fact cases и same-occurrence resets. Нормы, ZIP, policy/producer и Draft-статусы не менялись; installed Apollo и full text/component acceptance не заявляются. [Text negative review](../../../shared/design-system_ab/experiments/current-contract-packages/BenefitCard/reports/text-limits-negative-live-review.r5.2026-10-09.json).
- [x] **Subtitle 120 символов / 4 строки, installed Editor 0.2.96 / core 0.1.14, r5, 09.10.2026 17:51–17:52 UTC:** BC4-213/214 и BC4-207/208 — 4/4 целевых outcomes совпали; exact current ZIP/manual/compiled/runtime/snapshot hashes и engine/Editor replay проверены. Capture complete, warnings=0, все девять targets resolved, explicit viewport/single/Hug соответствует условиям. Subtitle=120 / 2 строки проходит оба лимита D/M; Subtitle=27 / 4 строки нарушает только line limit D/M. В 16 целевых оценках: 14 compliant / 2 violation, UNKNOWN=0, неожиданных violations нет. Следующие кейсы — alignment BC4-209/210 и Fixed TEXT / unknown line count BC4-215/216; same-occurrence text resets и отдельная положительная граница трёх строк Subtitle также открыты. Нормы, ZIP и Draft-статусы не менялись; full text/component и installed Apollo acceptance не заявляются. [Subtitle boundary review](../../../shared/design-system_ab/experiments/current-contract-packages/BenefitCard/reports/subtitle-boundaries-live-review.r5.2026-10-09.json).
- [x] **Alignment / Fixed TEXT guard, installed Editor 0.2.96 / core 0.1.14, r5, 09.10.2026 18:12–18:13 UTC:** BC4-209/210 и BC4-215/216 — 4/4 целевых outcomes совпали; exact current ZIP/manual/compiled/runtime/snapshot hashes и engine/Editor replay проверены. Capture complete, warnings=0, все девять targets resolved, explicit viewport/single/Hug соответствует условиям. CENTER нарушает LEFT у изменённого Title, Subtitle остаётся compliant. Fixed TEXT оставляет line count UNKNOWN; character count=11 остаётся известным и compliant. В 24 целевых оценках: 20 compliant / 2 violation / 2 ожидаемых human-review; неожиданных violations/UNKNOWN нет. Все 16 подготовленных текстовых кейсов имеют ожидаемые результаты по текущим четырём и прежним receipts; raw JSON предыдущих 12 сейчас отсутствуют, новый exact replay этих 12 не заявляется. Копии текущих четырёх сохранены в private component reports/live-captures с проверенным SHA, не в source fixtures. Открыты 12 same-occurrence resets: alignment/Auto height, две/три строки и 60/120 символов. Нормы, ZIP и Draft-статусы не менялись; full text/component и installed Apollo acceptance не заявляются. [Alignment/UNKNOWN review](../../../shared/design-system_ab/experiments/current-contract-packages/BenefitCard/reports/text-alignment-unknown-live-review.r5.2026-10-09.json).
- [x] **Alignment / Auto height reset, installed Editor 0.2.97 / core 0.1.14, r5, 09.10.2026 18:31–18:33 UTC:** четыре reset BC4-209/210 и BC4-215/216 и четыре сохранённых исходных captures Editor 0.2.96 прошли exact engine/Editor replay; текущий ZIP/manual/compiled/runtime/snapshot hashes совпали. Те же physical roots, native Title source, 11 символов и explicit scenario pins. Center→Left убирает два violations; Fixed size→Auto height доказывает одну строку и убирает два UNKNOWN. Все девять targets resolved, capture complete, warnings=0; в 24 целевых reset оценках — compliant, violations/UNKNOWN=0. Raw before/after копии с проверенным SHA сохранены в private component reports/live-captures. Открыты восемь content resets BC4-201–208: две строки Title, три строки Subtitle и границы 60/120 символов. Нормы, ZIP и Draft-статусы не менялись; полный текстовый контур, карточка и installed Apollo не приняты. [Style resets review](../../../shared/design-system_ab/experiments/current-contract-packages/BenefitCard/reports/text-style-resets-live-review.r5.2026-10-09.json).
- [x] **Title / Subtitle line resets, installed Editor 0.2.98 / core 0.1.14, r5, 09.10.2026 19:00–19:01 UTC:** BC4-203/204 (Title=2 строки, 13 символов) и BC4-207/208 (Subtitle=3 строки, 20 символов) — **4/4** ожидаемых сброса. Exact engine/Editor replay четырёх свежих отчётов и ZIP/manual/compiled/runtime/snapshot hashes совпали; capture complete, warnings=0, все девять targets resolved. В 24 целевых оценках — compliant, violations/UNKNOWN=0. Physical roots, explicit context, параметры и Hug совпали с прежними отрицательными review receipts; их raw captures отсутствуют, поэтому fresh negative replay и before/after native source continuity не заявляются. Новые raw captures сохранены с SHA в private component reports/live-captures. Открыты четыре character resets BC4-201/202 и BC4-205/206 на границах 60/120. Нормы, ZIP и Draft-статусы не менялись; полный текстовый контур, карточка и installed Apollo не приняты. [Line resets review](../../../shared/design-system_ab/experiments/current-contract-packages/BenefitCard/reports/text-line-resets-live-review.r5.2026-10-09.json).
- [x] **Title / Subtitle character resets, installed Editor 0.2.98 / core 0.1.14, r5, 09.10.2026 19:08–19:10 UTC:** Title=60 и Subtitle=120 латинских `i` проходят оба текстовых лимита на D/M — **4/4** text outcomes. Exact engine/Editor replay четырёх свежих отчётов и ZIP/manual/compiled/runtime/snapshot hashes совпали; complete capture, warnings=0, девять targets resolved, violations=0. Из 24 целевых оценок 22 compliant и два context human-review: у BC4-201 values пусты, отсутствуют ViewportClass и CardPlacement; platform/Hug остаются UNKNOWN, Title=60 / 2 строки проходит. **3/4** сценария приняты, открыт только BC4-201 context retest с desktop / single без изменения текста. Negative raw captures отсутствуют, fresh negative replay и before/after native source continuity не заявляются. Четыре новых raw captures сохранены с SHA в private component reports/live-captures. Нормы, ZIP и Draft-статусы не менялись; полный текстовый цикл, карточка и installed Apollo не приняты. [Character resets review](../../../shared/design-system_ab/experiments/current-contract-packages/BenefitCard/reports/text-character-resets-live-review.r5.2026-10-09.json).
- [x] **BC4-201 context retest / закрытие текстовой матрицы, installed Editor 0.2.98 / core 0.1.14, r5, 09.10.2026 19:43 UTC:** explicit desktop / single убрал два platform/Hug UNKNOWN. Title=60 / 2 строки, Left/Auto height, native source, физический корень, root layout и параметры совпали с сохранённым capture 19:08 UTC. Exact engine/Editor replay обоих captures и ZIP/manual/compiled/runtime/snapshot hashes совпали; complete capture, warnings=0, девять targets resolved. В новом отчёте violations/UNKNOWN=0, шесть целевых оценок compliant. Подготовленная текстовая матрица закрыта: **16/16** ожидаемых результатов и **12/12** сбросов; все 72 целевые reset оценки compliant, SHA всех 12 retained reset captures проверены. Предыдущие boundary/negative results учтены по pinned receipts; отсутствующие raw не проигрывались заново. Pending text reset/context retest списки пусты. Нормы, ZIP и Draft-статусы сохранены; остальные конфигурации, полная карточка, Position=Level2 source gap, зависимости и installed Apollo остаются открыты. [Text cycle review](../../../shared/design-system_ab/experiments/current-contract-packages/BenefitCard/reports/text-context-retest-live-review.r5.2026-10-09.json).
- [x] **Title / Graphic hidden negatives, installed Editor 0.2.98 / core 0.1.14, r5, 09.10.2026 20:01–20:02 UTC:** BC4-101–104 — **4/4** целевых нарушения обязательной видимости D/M. Quantity count=0 для скрытого элемента; второй обязательный элемент, platform и Hug проходят. В 16 целевых оценках 12 compliant / 4 violation; ровно одно violation на capture, неожиданных violations/human-review нет. Exact engine/Editor replay четырёх отчётов и hashes совпали; capture complete, warnings=0, девять targets resolved, raw copies сохранены с SHA. Отрицательная часть принята; четыре visibility RESET ещё ожидаются. Нормы, ZIP и Draft-статусы сохранены. [Visibility negative review](../../../shared/design-system_ab/experiments/current-contract-packages/BenefitCard/reports/composition-visibility-negative-live-review.r5.2026-10-09.json).
- [x] **Title / Graphic visibility RESET, installed Editor 0.2.98 / core 0.1.14, r5, 10.10.2026 01:06–01:07 MSK (09.10.2026 22:06–22:07 UTC):** BC4-101–104 — **4/4** сброса. Восемь fresh exact engine/Editor replays новых и сохранённых отрицательных captures совпали; ZIP/manual/compiled/runtime/snapshot hashes проверены. Те же physical roots, explicit context, native source/component identities Title и Graphic, текст/типографика Title, root layout и параметры. Required count=0→1; оба обязательных элемента, platform и Hug compliant, все 16 целевых reset оценок compliant, violations/human-review=0. Capture complete, warnings=0, девять targets resolved. Raw из корня current-contract-packages сохранены копиями с SHA в private BenefitCard reports/live-captures. Цикл обязательной видимости D/M закрыт, pending reset список пуст. Hidden Title diagnostic gap отсутствует в видимых resets, но его кодовое исправление не принято; full component и installed Apollo открыты. Нормы, ZIP и Draft-статусы сохранены. [Visibility reset review](../../../shared/design-system_ab/experiments/current-contract-packages/BenefitCard/reports/composition-visibility-resets-live-review.r5.2026-10-10.json).
- [ ] **Hidden declared target coverage, повтор family `button-hidden-label-coverage`:** BC4-101/102 доказывают exact resolved/present Title с effectiveVisible=false. Engine исключает оба лимита Title как not-applicable, но Editor coverage добавляет not-executed/unknown «Целевой слой не найден» (четыре notExecuted вместо трёх). Причина в общих validation-report/validation-coverage: пустой visible selector трактуется как missing target без различения доказанного скрытого target. Разделить hidden/inapplicable и missing/unresolved по независимому identity/visibility proof; required visibility продолжает давать violation. Отсутствующий, stale, foreign, ambiguous или incomplete proof сохраняет coverage gap. Нужны D/M hidden→visible RESET и missing-proof regressions, затем отдельная installed Editor/Apollo приёмка. Current negative review фиксирует дефект, не его исправление. Локальное исправление 10.10.2026 сохранено в EDITOR-HIDDEN-TARGET-COVERAGE-001 / CC-COMPAT-HIDDEN-TARGET-COVERAGE-05 выше; installed 0.2.100 ещё не принят.
- [ ] Установленный Apollo, остальные группы борда, Source Reviewed/Ready, child contracts Link/IconView/BackgroundPlate и release/publication остаются открыты. Число notExecuted зависит от сценария: три context-only gap в обычных captures и дополнительный hidden Title coverage gap в BC4-101/102. Три целевых reading gaps r4 закрыты live в указанной области Editor; полная карточка не принята.
- Evidence: [r5 package checks](../../../shared/design-system_ab/experiments/current-contract-packages/BenefitCard/reports/r5-package-checks.2026-10-09.json), [retest plan](../../../shared/design-system_ab/experiments/current-contract-packages/BenefitCard/reports/reading-fix-retest.r5.md). Парная запись **CC-COMPAT-NATIVE-CARD-FACTS-03** сохранена в обоих проектах.

### Живой цикл BenefitCard r4 · первый столбец · 09.10.2026

- [x] **52 отчёта installed Editor 0.2.94 / core 0.1.13:** BC4-V01–V32 и BC4-301–320. Exact manual/compiled/runtime/snapshot hashes и engine/Editor replay совпали; capture complete, warnings=0. ZIP SHA256 `9854199f6be6335efc9849d4eeca3712015f561beed2ef9ae78824ec79e33ca0`, manual hash `eb25ad722d2f8316fdfcc5dd559d64450923a2f3a418d0e2ca582e6001665082`. Нормы/ZIP/status/pins не изменены.
- [x] Обнаружены **18/24** ожидаемых отрицательных кейсов: 8 desktop Compact=True/Title=Primary, 6 Size/Crop/Grid и 4 fill/stroke без token binding. Последние четыре дают также связанные visual baseline violations. Допустимый Segment BC4-317/318 проходит три целевые ImageView проверки. Это scoped Draft preview evidence; все 52 сценария incomplete.
- [ ] **BackgroundPlate, BC4-307–312:** BackgroundColor/Skeleton/Position меняют native variant/key; target.surface и/или surface-owner теряют independent correspondence. Все шесть ожидаемых нарушений заменены human-review. Восстановить чтение исходного pinned baseline и настроенного occurrence по независимому host/source proof. Новый child baseline не легализует forbidden override. Name/order fallback запрещён; foreign/stale/ambiguous/incomplete proof остаётся unknown.
- [ ] **Graphic=Icon, BC4-319/320:** target.graphic/image и GraphicPreset unknown. При доказанном Icon три ImageView checks должны стать not-applicable, обязательность Graphic — проверяемой. Не назначать preset при отсутствующем доказательстве. Regressions должны моделировать настоящий native key switch, reset и чужой source, а не только изменение scalar при неизменной identity.
- [ ] **Background=False, 16 baseline вариантов D/M:** пять surface-checks дают human-review `selector evidence is unknown`, targets — `selected-binding-unavailable`, хотя root Background=False доказан. Учесть доказанную неприменимость до требования отсутствующей child target. При True проверки выполняются; неизвестный Background/source proof остаётся unknown. Blanket missing-target → not-applicable запрещён.
- [x] **Editor: контекстная live-приёмка D/M, 09.10.2026 13:55–13:58 UTC.** Свежие BC4-V01/V17 и BC4-109–118: **12/12** ожидаемых результатов. Exact source/snapshot/runtime hashes и engine/Editor replay совпали; capture complete, warnings=0, все declared targets resolved. В 24 целевых оценках: 14 compliant, 4 violation (Fixed single / неверный viewport), 2 not-applicable (group) и 4 намеренных UNKNOWN при незаданном поле. Inputs точно соответствуют контексту борда. Ранее 52 captures без контекста сохраняются как historical evidence; offline diagnostic не подменяет свежую live-приёмку. Полные сценарии всё ещё incomplete с тремя nonExecutable rules; Draft activation и Source Draft сохранены. [Live receipt](../../../shared/design-system_ab/experiments/current-contract-packages/BenefitCard/reports/context-live-review.r4.2026-10-09.json), [таблица 12 кейсов](../../../shared/design-system_ab/experiments/current-contract-packages/BenefitCard/reports/context-live-review.r4.2026-10-09.md).
- [ ] **Apollo: отдельная installed context acceptance.** Передать exact contract/subject context и повторить D/M positive, Fixed single, group, viewport mismatch и missing-input guards. Editor receipt не принимает установленный Apollo. Viewport из ширины карточки и single автоматически не выводить.
- [ ] После shared fix повторить BC4-307–312, BC4-319/320, Background=False D/M и контроли Size/Crop/Grid/Segment/token. Остальные 80 кейсов борда не приняты. Source Reviewed/Ready, child contracts, release и installed Apollo acceptance — отдельные gates.
- Evidence: [по кейсам](../../../shared/design-system_ab/experiments/current-contract-packages/BenefitCard/reports/first-column-live-review.r4.2026-10-09.md), [hashes/replay](../../../shared/design-system_ab/experiments/current-contract-packages/BenefitCard/reports/first-column-live-review.r4.2026-10-09.json). Private captures остаются в current-contract-packages. Consumer follow-up записан под тем же **CC-COMPAT-NATIVE-CARD-FACTS-03** в Apollo backlog.


План развития Editor для ButtonsGroup от 01.10.2026:
[этапы, source crosswalk и матрица приёмки](BUTTONSGROUP_EDITOR_PLAN.ru.md).
База плана — Editor 0.2.74 / shared core 0.1.0. Механика этапов 1–5 реализована
в Editor 0.2.77 / core 0.1.3 (02.10.2026). Локальные consumer gates пройдены;
авторский manual, live acceptance и release/Proxy задачи этапа 6 открыты.

Сверка 05.10.2026: изменения чтения контрактов учтены в PARITY-001–018;
актуальные состояния и очередь — [срез Apollo](../../Apollo/docs/ARCHITECTURE_BACKLOG.md#сверка-с-editor--05102026).
Текущая локальная база Editor 0.2.91 / core 0.1.10; historical версии ниже
сохраняются как evidence этапов. Общая реализация не требует повторного переноса,
а live/release acceptance остаётся отдельно. Чистые UI доработки формы,
Rationale hover и RuleID search не создают новый consumer format.

## EDITOR-CODE-PASSPORT-001 — NEXT-02 typed code evidence и bindings

- 05.10.2026: реализовано локально в **Editor 0.2.91 / shared core 0.1.10**.
- [x] Closed optional v1 codeEvidence хранит отдельно API availability, parity
  declared profile, acceptance receipt и publication. Typed codeTransform,
  ownedOccurrence/direct dependency и nativeSlotBinding используют finite handlers,
  exact existing targets/source/native identities. Legacy binding validators прежние.
- [x] Compiler emits opt-in representationEvidenceVersion/crossRepresentationBindingsVersion
  и producer 0.2.91 только при новых полях. Shared runtime/consumer/dependencies
  reject missing/unknown markers. Predicate Ready не зависит от Code Draft.
- [x] Существующие JSON settings сохраняют поля losslessly; Help объясняет различие
  evidence claims. Chrome settings/save/ZIP и stale projection error пройдены.
- [x] Core 76/76, Editor 820/820, Generation 49/49, v4 182/182, root 81/81.
  Fresh Node reader проверяет pinned bytes и exact source/profile scope; missing,
  stale, API/build-only proof не принимает profile. Private sources не копировались.
- [ ] Owner принимает authored passports/native recipes и Code profile receipts,
  отдельную live/Proxy/release матрицу. Scoped authority остаётся proposal-only;
  source Draft не обходится. Новых норм, архива или статуса Reviewed нет.
- Apollo: [APOLLO-V4-PARITY-019](../../Apollo/docs/ARCHITECTURE_BACKLOG.md#apollo-v4-parity-019--next-02-representation-evidence-и-typed-code-bindings).
  Exact fields/handoff: [GENERATION_CODE_EVIDENCE](../../Apollo/apps/apollo-v4/docs/GENERATION_CODE_EVIDENCE.md).

## EDITOR-LOSSLESS-EXPORT-001 — historical projection и full authoring evidence

- 05.10.2026: реализовано локально в **Editor 0.2.91 / core 0.1.10**.
- [x] `buildExportBundle` принимает optional own projection; сохраняет historical
  sourceExportVersion лишь после полного exact hash recompile. Cached predicates
  не используются. Source/cache/facts/stamp mismatch блокирует export; ошибка видна.
- [x] Для unchanged source UI использует source-matched imported own cache; для ZIP
  без own projection загрузить canonical projection вместе с ZIP. Changed manual
  получает fresh compile и требует owner review/repin.
- [x] ZIP переносит actual read-only JSON inventory независимо от descriptive
  importedFiles; full authoring facts проверяются reopen. Identical duplicate
  filenames/content deduplicated; reduced compiled API anatomy не заменяет saved
  full variantEvidence; exact linked dependency projections сохраняются.
- [x] Read-only реальные временные Spinner r8/Button r31 exports: прежние hashes/
  producer/facts, source load Ready, dependency link exact. Подмена cached projection
  отвергнута. Production ZIP/pins не менялись; ButtonsGroup остаётся source Draft.
- [ ] Contract Creation выпускает authoritative dependency ZIP; registry/locks owner
  обновляет их archive hashes. Published/Proxy acceptance отдельно от local gate.
- Apollo: [APOLLO-V4-PARITY-020](../../Apollo/docs/ARCHITECTURE_BACKLOG.md#apollo-v4-parity-020--lossless-authoring-export-и-historical-dependency-stamp).

## EDITOR-COMPARISON-CONDITIONS-UI-001 — зачем нужен блок «Когда сравнивать»

- Дата: 05.10.2026. Приоритет: P2. Статус: открытый вопрос для UX-разбора;
  код и модель контракта не изменены. Замечание из Editor 0.2.90.
- Вопрос владельца: «Вот этот блок нам вообще зачем? Может быть он должен
  быть проще / скрыт?»
- Контекст: внутри Applicability показаны отдельные selectors «когда сравнивать»
  для толщины обводки, gap, четырёх padding и двух выравниваний. Повторяющееся
  значение «Всегда (без дополнительного условия)» занимает много места и
  не объясняет, зачем автору эти настройки при создании конкретного правила.
- Текущее назначение: optional `propertyApplicability` задаёт условия применения
  отдельных baseline-сравнений. Разобрать, когда автору действительно нужен
  явный выбор и как объяснить его пользу в интерфейсе.
- [ ] Рассмотреть упрощение: отдельный свёрнутый блок дополнительных условий,
  показ только настроек для свойств текущего правила, краткое описание
  нестандартных условий вместо постоянного списка всех selectors.
- [ ] Проверить возможность общей настройки padding без потери сохранённых
  отдельных условий по сторонам. Это вариант для обсуждения, не принятое решение.
- [ ] Критерий: обычное заполнение требует меньше прокрутки; сохранённые
  нестандартные условия и ошибки заметны, доступны для редактирования и
  не сбрасываются при скрытии блока, Save/reopen или экспорте.
- Связь: EDITOR-UI-002 (компактная форма). На этапе вопроса и чистого UI
  упрощения отдельная задача Apollo не нужна. Если решение изменит defaults,
  запись `propertyApplicability` либо семантику сравнения, влияние на чтение
  контрактов фиксируется в бэклоге Apollo в той же задаче.

## EDITOR-INSTANCE-MAIN-ALIASES-001 — локальные main ID после восстановления иконки

- Приоритет: P1. Реализовано локально в **Editor 0.2.90 / core 0.1.9**.
- Причина: reset dots-three-horizontal сохраняет canonical component key/set
  и owner-relative source node, но Figma выдаёт другой local main ID. Прежний
  correspondence терял один glyph, отключая общий baseline и дочерние проверки.
  Отчёт 05.10.2026, 11:44:36 UTC в 0.2.89: 0 violations, 3 human-review,
  5 not-executed. Это неполная проверка, а не подтверждённый PASS.
- [x] Новый opt-in `instanceMainComponentAliasesVersion=1` сопоставляет разные
  local main IDs только при одинаковых canonical owner component key/set и
  уникальном source node в пределах доказанного owner. Source identity каждой
  стороны должна соответствовать её local owner; foreign/unknown/duplicate
  proof остаётся gap. Имена, sibling order и глобальный key lookup не используются.
- [x] Baseline восстанавливается только из независимого host capture,
  воспроизводящего original variantReference и context/modes. Runtime заново
  задаёт marker из consumer profile; stored flag не включает новую семантику.
  Parent profile применяется к exact pinned child checks без изменения их
  contracts, нормативных правил и pins. Figma capture передаёт профиль обеим
  независимым сторонам; основной bundle использует прямой capture-safe импорт.
- [x] Compiler active identity lock emits новую версию и producer **0.2.90**.
  Reexport меняет compiled wire; manual source hash и Button r31 / Spinner r8
  exact pins прежние. Historical unmarked artifacts сохраняют строгий replay.
  Пользовательский ZIP, статусы Reviewed и привязки агентом не изменены.
- [x] Regression: original/reset, swap, local owner mismatch, foreign key/set,
  missing/duplicate/unknown source proof, непроверенный baseline, inherited
  child profile, unsupported version и legacy replay. Gates: core **44/44**,
  Editor **811/811**, локальный Apollo **136/136**. Chrome проверил all-variant
  scope, Icon-16/20/24 без auto-selection, save/edit/offline и ZIP/pins.
- [x] Оба пользовательских отчёта проверены в памяти без изменения файлов:
  historical evaluatedContract воспроизводит прежний engine result точно.
  Recompile того же manual в новом профиле даёт reset **298 compliant /
  154 not-applicable / 0 violation**, swap **297 / 154 / 1 violation**.
  Core и локальный v4 совпадают; executionComplete=true, uncertain=0,
  incompleteDependencies=0. Source hash и child pins совпадают с исходными.
  Private reports/catalogs не копировались в source или fixtures.
- [x] Отдельно проверен новый synthetic ZIP через Apollo source loader:
  manual сохраняется, compiled projection совпадает, original verdict полный.
  Старый active-lock cache требует reexport в 0.2.90 для нового compiled profile;
  historical replay старого artifact сохраняется.
- [x] Fresh Figma reset принят владельцем 05.10.2026, **12:12:48 UTC**:
  Editor/producer **0.2.90**, r56, desktop Size=56 / Overflow=true,
  одна последняя SingleIcon=True с исходной dots-three-horizontal. Тот же actual
  instance и manual hash, source 17 Reviewed, activatedDraftRuleIds пуст.
  **452 evaluations: 298 compliant / 154 not-applicable / 0 violations**;
  complete=true, notExecuted=0, inconclusive=0, capture warnings=0,
  **56/56 baseline matches**, все четыре child runs executed. Активный icon
  lock compliant, остальные три subjects not-applicable. Exact engine replay
  и локальный v4 parity совпадают, v4 executionComplete=true / uncertain=0.
  Manual, pins, report/snapshot не изменены; private файлы не копировались в repo.
- [x] Fresh swap на 0.2.90 проверен 05.10.2026, **12:33:21 UTC**:
  тот же instance/r56/manual hash, Size=56 / Overflow=true; исходная иконка
  последней SingleIcon=True заменена на **dots-bracket**. **452 evaluations:
  297 compliant / 154 not-applicable / ровно 1 violation** активного icon lock.
  complete=true, notExecuted=0, inconclusive=0, warnings=0, 56/56 matches,
  все четыре child runs executed. Exact engine replay и local v4 audit совпадают,
  v4 executionComplete=true / uncertain=0. Все 17 правил Reviewed, без Draft
  activation; manual/pins/report/snapshot сохранены. Это закрывает целевую
  Editor reset/negative пару Size=56 на новом профиле.
- [ ] All-size live matrix из asset-lock задачи и live Apollo acceptance
  остаются открытыми. Negative 0.2.89 сохраняет собственный historical replay.
- [ ] Published Apollo/Proxy release и consumer acceptance — отдельно.
  Legacy Apollo typecheck/build/runtime parser проходят; full test gate
  требует прежний отсутствующий CardImage compiled fixture. Fixture не заменялся.
- Связь: [APOLLO-V4-PARITY-018](../../Apollo/docs/ARCHITECTURE_BACKLOG.md#apollo-v4-parity-018--локальные-main-id-после-восстановления-иконки).

## EDITOR-SINGLEICON-ASSET-LOCK-001 · запрет замены исходной иконки · 05.10.2026

- Уточнение владельца 05.10.2026: групповой icon lock применяется при
  `SingleIcon=True` и `Overflow=true` во всех Size. При Overflow=false остаётся
  нарушение недопустимого SingleIcon, без дополнительного группового asset lock.
  Это правка authoring source, формат и Editor 0.2.90 / core 0.1.9 не меняются.
  Mobile-web r2: удалена ветка second-occurrence-no-overflow; first-occurrence
  ограничена Overflow=true. 13 private historical replays, shared compiler parity,
  lossless ZIP/recompile и 24 collection controls прошли. Все правила остаются Draft;
  свежая r2 live приёмка и отдельная сверка desktop применимости открыты.
- [ ] В mobile swap-прогоне 05.10.2026, 15:13:24 UTC, пять проверок pinned
  Button имеют unknown из-за отсутствующих provenance/размерных фактов новой
  иконки; child coverage неполный. Уточнить source evidence/capture и показать
  конкретную причину неполноты. Не подавлять child нормы при ошибке композиции
  и не подменять отсутствующий каталог предположением. Private evidence:
  `design-system_ab/experiments/web-corp/ButtonsGroup/mobile-web/authoring/reports/overflow-icon-applicability.2026-10-05.json`.
- Приоритет: P1. Реализовано локально в **Editor 0.2.89 / core 0.1.8**.
- Причина: каталог/семья/размер разрешают замену внутри допустимого домена,
  но не выражают запрет любой замены иконки SingleIcon относительно эталона.
- [x] В dependencyDomain добавлено «Сохранить исходную иконку». Подтверждённые
  nested subjects и доступные INSTANCE_SWAP-порты выбираются из списка;
  boolean фиксирован: `field=changed`, `values=[false]`, `require-domain`.
  Keys, каталоги, mappings и unchanged-exemptions не вводятся. Сохранённые
  порты без live preview явно подписаны и сохраняются при offline edit.
- [x] Норма SingleIcon охватывает **все размеры**. Editor 0.2.89 добавляет в
  выбор порты из точного закреплённого child contract по совпадающему owner path
  и Figma platform. Для ButtonsGroup это Icon-16, Icon-20, Icon-24. Зависимость
  проверяется по componentId/revision/обоим hashes и closure; объявления
  подписаны отдельно и не становятся captured facts. Applicability не сужается
  до Size=56 и не меняется автоматически; значения выбирает автор.
- [x] Typed subjectCondition, например SingleIcon VARIANT True, проверяется
  на semantic Button. Exact asset key сравнивается с независимым эталоном порта
  текущего варианта. Подтверждённый ancestor host variant может задавать baseline
  Addon; reference заменённой иконки не заменяет normative baseline.
  Отсутствие identity, port binding, typed value или reference даёт gap.
- [x] Opt-in binding `identityLock=true`, runtime `assetIdentityLockVersion=1`,
  producer minimum 0.2.88. В этом профиле proven root same-family variant
  сохраняет semantic role и при partial child coverage; потомки автоматически
  не получают роли, partial coverage не считается полным. Historical profiles,
  producer minimum, compiled wire/hashes и exact child pins сохраняются.
- [x] Synthetic regression: original, чужая иконка, другой variant той же семьи,
  ordinary/hidden Button, SingleIcon на другом Button с независимым host stage,
  occurrence correspondence/rename, missing/unknown evidence и version guards.
  All-size regression: каждый из шести synthetic Size проверен с каждым из
  трёх портов; original/reset проходят, swap нарушает, missing reference даёт gap.
  Browser: finite port/True selection, фиксированный boolean, save/edit,
  offline edit, ZIP и неизменные dependency pins.
- [x] Локальные проверки после all-size correction: Editor **810/810**, core
  **39/39**, Apollo **115/115**. Browser проверяет полный выбор портов,
  all-variant scope, offline edit и ZIP/pins на окончательной сборке.
  Legacy Apollo typecheck/build/runtime parser проходят, full test gate
  останавливается на прежнем отсутствующем CardImage compiled fixture.
- [x] Authoring 05.10.2026: пользователь экспортировал ButtonsGroup **r56**, все
  **17 правил Reviewed**. Новое правило имеет all-variant applicability,
  четыре subjects Button, Icon-16/20/24, SingleIcon VARIANT True и boolean false.
  Компиляция без issues, readiness ready; exported compiled совпадает с recompile.
  Exact Button r31 / Spinner r8 closure подтверждён, локальный v4 profile
  принимает пакет. Повторный ZIP import/export в памяти сохраняет manual,
  compiled и pins; исходный архив не изменён и не копировался в fixtures.
- [x] Fresh Figma 05.10.2026, 11:28:53 UTC: r56, desktop Size=56 / Overflow=true,
  последняя Button SingleIcon=True. Замена dots-three-horizontal на eagle-coins
  даёт ровно один violation нового identity lock; остальные три subjects
  not-applicable по SingleIcon=False. Scenario complete, notExecuted=0,
  inconclusive=0; остальные parent/child checks без нарушений. In-memory replay
  совпадает с отчётом, локальный Apollo даёт идентичный engine result и
  executionComplete=true. Отчёт остаётся во внешнем current-contract-packages,
  private данные не копировались в fixtures. Это один negative case, не вся
  all-size acceptance matrix и не published consumer acceptance.
- [ ] Fresh Figma: original/swap/reset во всех размерах и допустимая перестановка
  SingleIcon проверяются свежими отчётами. Authoring readiness не доказывает
  выполнение на live инстансе; missing binding/reference остаётся gap.
  Reset в 0.2.89 выявил local main ID bug; исправление и отдельная повторная
  приёмка — [EDITOR-INSTANCE-MAIN-ALIASES-001](#editor-instance-main-aliases-001--локальные-main-id-после-восстановления-иконки).
  Fresh Editor 0.2.90 reset Size=56 / Overflow=true принят 05.10.2026,
  12:12:48 UTC: 452 evaluations, полный PASS, 56/56 matches и четыре child runs.
  Fresh swap 12:33:21 UTC на том же instance/r56: dots-bracket даёт ровно один
  icon-lock violation при полном coverage и четырёх executed child runs.
- [ ] Published consumer/Proxy release acceptance — отдельная проверка.
- Связь: [APOLLO-V4-PARITY-017](../../Apollo/docs/ARCHITECTURE_BACKLOG.md#apollo-v4-parity-017--сохранение-исходной-иконки-по-независимому-эталону).

## EDITOR-EXISTING-RULE-OFFLINE-EDIT-001 · сохранение правила после импорта · 04.10.2026

- Приоритет: P1. Реализовано локально в **Editor 0.2.87**; shared core **0.1.7** прежний.
- Причина: Save требовал выбранный live anatomy node даже для существующего
  правила. У component set с несколькими variants importer не выбирает одно
  дерево автоматически; при несопоставленной цели кнопка оставалась неактивной.
  Старый save также мог создать другую цель вместо использования targetId правила.
- [x] Существующее правило редактируется через объявленный targetId без preview.
  Получение preview/test snapshot во время редактирования сохраняет эту цель;
  отсутствие сопоставленного node не заменяется корнем. Для нового правила
  выбор слоя обязателен; missing declared target блокирует Save с объяснением.
- [x] Сохранённое live дерево подавляет неприменимое предупреждение importer
  об отсутствии structure signature. Без дерева показана информационная подсказка
  на русском о preview и доступном редактировании существующих правил.
  Исходный import warning и evidence в core не переписаны.
- [x] Browser regression сначала воспроизвела ошибку на 0.2.86, затем прошла
  в собранной 0.2.87: offline review/save, new/missing guards, async preview,
  неизменные targets/pins, ZIP roundtrip и импорт с сохранённым деревом.
  Локально проверен текущий авторский пакет: Reviewed меняет только status правила;
  constraints, targets, dependency closure и exact pins прежние, compiler errors=0.
  Проверка выполнена в памяти, исходный ZIP не изменён и не копировался в fixtures.
- [x] Общий Editor validate **805/805**, Apollo local validate **112/112**.
  Legacy Apollo typecheck/build/runtime parser проходят; полный gate остановлен
  прежним отсутствующим CardImage compiled fixture. Это не release acceptance.
- [x] 05.10.2026: отдельная Apollo проверка переэкспортированного synthetic source
  закрыта: ZIP → source loader → exact compile, targets/constraints/pins прежние,
  missing child capture остаётся incomplete. Engine совпадает с Editor core;
  private files не использовались. Published acceptance остаётся в PARITY-016.
- Форматы, producer minimum, compiler/runtime и native capture прежние.
  Привязка правила остаётся нормативной декларацией; отсутствие live resolution
  не считается доказанным соответствием и по-прежнему даёт runtime gap.
- Связь: [APOLLO-V4-PARITY-016](../../Apollo/docs/ARCHITECTURE_BACKLOG.md#apollo-v4-parity-016--редактирование-правила-без-live-anatomy).

## EDITOR-RULE-ID-SEARCH-001 · поиск по Rule ID · 04.10.2026

- Приоритет: P2. Реализовано локально в **Editor 0.2.86**; core **0.1.7** прежний.
- [x] Поле над карточками ищет по полному или частичному source Rule ID без учёта
  регистра и крайних пробелов. Точный ID имеет приоритет над prefix matches:
  `composition-members` и `composition-members-2` не смешиваются при полном ID.
- [x] Счётчик результатов, явное пустое состояние и очистка кнопкой × / Escape.
  Запрос сохраняется при edit/back и сбрасывается для другого компонента.
- [x] Typecheck/build и локальный Chrome: exact/partial/case/trim, prefix distinction,
  empty results, clear/Escape, edit/back, Rationale hover, три размера окна,
  неизменность manual source и сброс при импорте другого компонента.
- Чистый UI: нормативные IDs, правила, hashes/pins, schema, capture и runtime
  не менялись. Задача совместимости Apollo не требуется по AGENTS.md.

## EDITOR-RULE-RATIONALE-HOVER-001 · Rationale на карточке правила · 04.10.2026

- Приоритет: P2. Реализовано локально в **Editor 0.2.85**; core **0.1.7** прежний.
- [x] Наведение и клавиатурный фокус показывают полный Rationale во всплывающей
  подсказке с доступным описанием карточки. Пустой Rationale обозначен явно.
- [x] Подсказка не сдвигает список, помещается в окно и следует за карточкой
  при прокрутке. Длинный текст прокручивается внутри; переход указателя в
  подсказку сохраняет её. Escape, открытие правила и смена режима закрывают её.
- [x] Typecheck/build и локальный Chrome: hover/focus, Escape, long/empty text,
  безопасный textContent, четыре размера окна, неизменные размеры карточек и
  manual source, click-to-edit и mode switch. Проверен собранный интерфейс.
- Чистый UI: schema/import/export, hashes/pins, capture, compiler/runtime и
  coverage не менялись. Задача совместимости Apollo не требуется по AGENTS.md.

## EDITOR-INSTANCE-REFERENCE-ADDRESS-001 · capture не разрешает occurrence paths · 03.10.2026

- Приоритет: P0. Статус: реализовано локально в Editor **0.2.83** / shared core
  **0.1.6**; fresh Figma Size/View negative и чистый библиотечный PASS
  подтверждены в Editor; live Apollo и published consumer/Proxy acceptance открыты.
- Причина в 0.2.82/0.1.5: план использовал `@source`, а native `instanceAtPath`
  строил только именной путь. Вторая одноимённая Button ошибочно получала
  `replacement-component-unavailable`, хотя direct child reference был доступен.
- [x] Native lookup повторно получает source/owner proof тем же capture, что и
  runtime, проверяет идентичность всей цепочки и связывает локальный graph node
  с native объектом через capture-local `figmaNodeId`. `@local`/`@catalog` не
  становятся identity; sibling index/name/order не используются как proof.
- [x] Actual и independently cloned library stage проверяются отдельно;
  nested stage получает собственный context snapshot. Legacy именные пути,
  variant-properties → nested swap и cleanup сохранены. Топология, изменившаяся
  во время async capture, остаётся неполной; новые source facts не добавляются
  к historical reports при replay.
- [x] Synthetic regressions: вторая одинаково названная occurrence, rename/reorder,
  escaped source IDs, remote main с local IDs, negative/reset; missing, foreign,
  duplicate, stale и cycle evidence дают gap. Editor bundled controller и Apollo
  bundled consumer проверяют захват; Apollo сохраняет Size verdict при capture gap.
- [x] Editor validate **802/802**, core **19/19**, Apollo **111/111**; прежние
  четыре sandbox-сценария variant → nested swap и source-proof guards проходят.
  Chromium: 18 responsive + 18 dialog layouts с длинной диагностикой, overflow нет.
  Полный legacy Apollo gate: typecheck/build/runtime parser пройдены; тесты
  блокирует прежний отсутствующий CardImage compiled fixture. Это не release acceptance.
- [x] Fresh Figma 03.10.2026, прогоны 06:24:26 и 06:24:42 UTC: Size=40 при
  host Size=56 и View=Accent дают по одному точному parent violation; вторая
  одноимённая Button получает independent host reference с `lineageProven`,
  оба видимых child contracts исполняются, infrastructure gap отсутствует.
  Каждый прогон полный, 202 evaluations, `notExecuted=0`, `inconclusive=0`.
- [x] Чистый библиотечный PASS принят 03.10.2026, прогон 07:03:39 UTC:
  Size=56 / Overflow=false, две видимые Button Primary + Secondary,
  202 evaluations, 0 violations, `complete=true`, `notExecuted=0`,
  `inconclusive=0`, 68/68 matched nodes. Два видимых child contracts выполняются,
  два скрытых исключены после binding/identity proof. Это отдельный контроль;
  возврат того же отрицательного экземпляра в исходное состояние не отслеживался.
- Прогон 06:25:13 UTC содержал пять Button findings и три видимых кнопки.
  Новая неполнота при Primary → Secondary относится к
  EDITOR-HOST-CONTEXT-MODE-CATALOG-001, native address разрешён успешно.
  Неполное evidence нельзя скрывать только из-за исполнения direct child contract.
- Schema, occurrence/reference versions и producer minimum **0.2.80** прежние.
  Source manual / normative domains / exact pins не требуют изменения.
- Связь: [APOLLO-V4-PARITY-013](../../Apollo/docs/ARCHITECTURE_BACKLOG.md#apollo-v4-parity-013--native-reference-capture-и-occurrence-addresses).

## EDITOR-VARIANT-CATALOG-DRIFT-001 · актуальность Overflow=true facts · 03.10.2026

- Приоритет: P1. Статус: desktop Size=56 / Overflow=true facts восстановлены;
  совпадение anatomy подтверждено fresh Figma, четыре bindings подтверждены
  автором в manual **r41**, fresh Figma PASS и SingleIcon count/position negative
  и reset подтверждены. Изолированный host gate negative/reset принят в 0.2.84.
  На 05.10.2026 source **r56 / 17 Reviewed**; остальные Size variants,
  live consumer/release acceptance открыты. Main-alias reset/negative Size=56
  подтверждены в 0.2.90; подробности — EDITOR-INSTANCE-MAIN-ALIASES-001.
- Связь: [APOLLO-V4-PARITY-013](../../Apollo/docs/ARCHITECTURE_BACKLOG.md#apollo-v4-parity-013--native-reference-capture-и-occurrence-addresses);
  отдельная диагностика intermittent native failure — APOLLO-V4-PARITY-015.
- Старый generated-каталог давал 54 nodes вместо 56. Raw Athena `0.1.0-rest`
  содержит INSTANCE `dots-three-horizontal` и VECTOR `icon`, но legacy add IDs
  `55/56` пересекаются с удаляемыми base IDs; старый generated artifact потерял add.
- [x] Offline converter сохраняет add; для известного legacy REST namespace
  перебазирует collision только при однократном явном remove старого ID и отсутствии
  неоднозначного update/reparent. Raw source не меняется. Duplicate/foreign parent/
  cycle/неоднозначные collisions отклоняются, не превращаются в урезанную anatomy.
  Converter self-test и **8/8** synthetic regressions проходят.
- [x] Только desktop Size=56 / Overflow=true anatomy и occurrence names заменены
  фактами из исходного raw-каталога. 56 nodes совпадают с independent library reference;
  actual из пользовательского test не использовался как источник facts. Прочие
  variant evidence сохранены. Новый source hash фиксирует обе исходные части и transform.
- [x] Отдельный `ButtonsGroup.facts-repaired.component-contract.zip` в
  `current-contract-packages`: manual **r37**, его hash, правила/target IDs и exact
  Button/Spinner pins неизменны, ZIP reopen проверен. Исходный ZIP и raw catalog сохранены.
  Sidecar `ButtonsGroup.facts-repaired/repair-verification.json` содержит source SHA,
  проверку anatomy и явно ограниченный scope; это не свежий live verdict.
- [x] Editor показывает разные подсказки для catalog/reference drift, отсутствующей
  per-variant binding и неподтверждённого nested reference. Подсказки не меняют report,
  facts, правила и coverage; synthetic тесты покрывают каждый случай и root aliases.
- [x] Fresh Figma 03.10.2026, прогон 07:04:09 UTC: библиотечный Size=56 /
  Overflow=true даёт 56/56 matched nodes, `catalog-and-live-reference-agree`,
  capture warnings отсутствуют. В 07:04:29 UTC вторая Button с SingleIcon=True
  получает matched independent host reference с `lineageProven`; native
  occurrence lookup и capture stage успешно работают для этого изменения.
- [x] В Size=56 / Overflow=true preview автор явно подтвердил четыре child role
  bindings, manual r37 → **r41**. Target IDs/roles прежние; source occurrences
  `62786:48900–48903` закреплены за `button` / `button-2` / `button-3` / `button-4`.
  Hints Overflow=false `62786:48895–48898` сохранены. ZIP import/recompile даёт
  точный исходный compiled JSON, manual hash проверен, Button r31 и Spinner r8
  exact hashes/closure неизменны. Ограничения правил не менялись; изменены только
  четыре variantHints, revision/timestamp и 11 statuses reviewed → draft.
- [x] Новая офлайн-оценка r41 на сохранённых capture snapshots, в authoring mode
  с временной активацией Draft: Overflow=false — полный PASS, 202 evaluations;
  Overflow=true с одной последней SingleIcon — полный PASS, 448 evaluations;
  с двумя SingleIcon — 518 evaluations, два ожидаемых violations (max 1 и last).
  Во всех трёх `notExecuted=0`, `inconclusive=0`; collection missing отсутствует,
  активные direct child contracts выполняются. ZIP и исходные reports не изменены.
  Это новая оценка контракта на старых captures, не fresh Figma acceptance.
- [x] Fresh Figma r41 Overflow=true PASS принят 03.10.2026, 07:45:23 UTC:
  Size=56, четыре видимые Button, SingleIcon=True только у последней.
  448 evaluations (26 parent + 422 dependencies), 0 violations,
  `complete=true`, `notExecuted=0`, `inconclusive=0`, 56/56 matched nodes;
  все четыре direct child contracts executed. Manual hash r41 подтверждён,
  engine/Editor/details replay точен, snapshot не изменён. 11 Draft checks
  активировались только в authoring runtime; contract readiness остаётся draft.
- [x] Fresh Figma r41 negative count/position приняты 03.10.2026:
  07:51:29 UTC — одна SingleIcon на второй позиции, 448 evaluations, ровно один
  position violation на `button-2`; оба независимых variant stages (вторая и
  четвёртая Button) matched. 07:51:56 UTC — две SingleIcon (вторая и последняя),
  518 evaluations, ровно два violations: count max 1 и position last.
  Это один и тот же тестовый экземпляр в двух последовательных состояниях;
  оба прогона полные, 0 not-executed/inconclusive, все четыре child runs executed.
  Engine/Editor/details replay точен, исходные snapshots не изменены.
- [x] Fresh Figma r41 reset принят 03.10.2026, 08:01:54 UTC: тот же native
  экземпляр и тот же manual hash, SingleIcon=False у второй и True у последней.
  Возврат к полному PASS: 448 evaluations, 0 violations/not-executed/inconclusive,
  56/56 matched nodes, четыре child runs executed. Exact engine/Editor/details
  replay подтверждён без изменения исходного snapshot.
- [x] Принят полный изолированный SingleIcon → Overflow host gate (False при
  одной последней SingleIcon). Прогон r41 03.10.2026, 08:09:55 UTC правильно
  даёт ровно один hostRequirement violation: Overflow="false", требуется "true".
  Четвёртая boundary имеет matched independent host reference, привязки разрешены;
  три child runs executed. Первая Button имеет `dependency-reference-capture-failed`
  без snapshot: 360 evaluations, `complete=false`, один infrastructure not-executed.
  Это общий catch native dependency capture; стадия/причина исключения в evidence
  не сохранены, связь с PARITY-014 или изменение библиотеки не доказаны.
  Повтор 03.10.2026, 12:54:36 UTC: тот же r41 и тот же экземпляр; правильный
  host violation сохраняется, но теперь все четыре child captures имеют тот же
  общий failure без snapshot. 26 parent evaluations, `complete=false`, четыре
  not-executed. Exact engine/Editor/details replay подтверждён без изменения
  snapshot. Добавлена диагностика стадии в 0.2.84, причина и исправление сбоя
  остаются открытыми: EDITOR-DEPENDENCY-CAPTURE-DIAGNOSTICS-001 /
  APOLLO-V4-PARITY-015. Привязки, нормы и dependency pins не менять ради gap.
  Fresh Editor 0.2.84 r41 03.10.2026, 18:30:17 UTC: тот же instance и manual hash,
  ровно один ожидаемый Overflow host violation, 448 evaluations (26 parent +
  422 child), `complete=true`, 0 not-executed/inconclusive, 56/56 matched nodes,
  все четыре child runs executed (88/88/88/158). Fourth independent boundary
  matched с доказанной lineage. Exact engine/Editor/details replay подтверждён;
  snapshot не изменён, compiler issues отсутствуют. Захват в этом прогоне успешен;
  причина прежнего intermittent native сбоя не установлена; 11 source rules
  остаются Draft.
- [x] Fresh reset Editor 0.2.84 принят 03.10.2026, 19:14:00 UTC: тот же instance
  и manual hash r41, Overflow="true", только последняя SingleIcon="True".
  Полный PASS: 448 evaluations, 0 violations/not-executed/inconclusive,
  56/56 matched nodes, четыре child runs executed (88/88/88/158), capture warnings
  и compiler issues отсутствуют. Exact engine/Editor/details replay совпадает,
  исходный snapshot не изменён. Editor isolated host gate negative/reset закрыт;
  source review, другие Size variants и consumer acceptance остаются открытыми.
- [x] Review затронутых правил завершён автором в последующих версиях:
  экспорт r56 содержит **17 Reviewed**. Это source authority, а не published
  release или приёмка остальных вариантов. Исторический r41 сохраняет Draft
  и прежний replay; authoring-mode activation не меняла его нормативный статус.
  В прежних прогонах r37 все четыре child targets имели hints только для
  Overflow=false: 11 collection checks оставались human-review, четыре exact child
  dependencies — `dependency-direct-binding-unresolved`. Это authoring gap,
  не catalog drift. Второй отрицательный прогон содержал две видимые SingleIcon
  (вторая и четвёртая Button); до bindings count/position verdict не был получен.
- [ ] Для остальных Overflow=true получить свежий Athena export: их legacy ID
  collisions неоднозначны и не восстанавливались. Старые evidence остаются под
  строгим catalog/reference guard; готовность этих вариантов не заявлена.
- Прогон с именем «PASS · две кнопки» содержит три видимых Button и пять dependency
  findings: два padding, fill двумя правилами и typography. Actual отличается от
  обоих независимых baselines. Имя теста не подтверждает чистый reset экземпляра.
- Исходные reports сохранены; read-only replay не добавляет capture evidence.
  Три reports 07:03:39–07:04:29 UTC точно воспроизводят engine, Editor coverage
  и presentation details; исходные snapshots не изменены.

## EDITOR-DEPENDENCY-CAPTURE-DIAGNOSTICS-001 · диагностика исключений захвата Button · 03.10.2026

- Приоритет: P1. Диагностика реализована локально в **Editor 0.2.84 / core 0.1.7**;
  причина прежнего native сбоя не установлена. Fresh capture на 0.2.84 успешен;
  диагностика настоящего исключения в Figma пока не наблюдалась.
- Повторный r41 capture 12:54:36 UTC возвращает четыре
  `dependency-reference-capture-failed` без дочерних snapshots. Parent Overflow
  violation корректен; все четыре direct child checks остаются not-executed.
- [x] Общий capture сохраняет optional `failureDetails`: version 1, точный этап,
  ограниченные errorName/message. Stack и native объекты не сериализуются.
  Existing coverage reason показывает эти сведения только для единственного
  соответствующего failed capture; неизвестные/неоднозначные metadata игнорируются.
- [x] Failure code, reference requirements, runtime verdicts, schema, producer
  minimum и exact pins сохранены. Диагностика не доказывает успешный захват;
  historical replay без metadata не дополняет прежний snapshot.
- [x] Локальные gates: core 27/27, Editor 805/805, Apollo 112/112.
  Synthetic native faults на шести этапах сохраняют отдельную причину и
  продолжение остальных captures; временные instances/pages удаляются.
  JSON export сохраняет diagnostic metadata и точно воспроизводит результат.
  Последний private report точно воспроизводит engine/coverage/details.
  Metadata меняет hash нового snapshot и связанные evaluation IDs; нормативные
  hashes/pins и verdicts не меняются. Legacy Apollo typecheck/build/parser проходят,
  full test gate требует прежний отсутствующий CardImage compiled fixture.
- [x] Получен fresh report 0.2.84 r41 18:30:17 UTC: полный isolated host gate,
  448 evaluations, один ожидаемый Overflow violation, четыре child runs executed,
  0 not-executed/inconclusive. Exact replay и неизменность snapshot подтверждены.
  Ошибок capture нет, поэтому `failureDetails` отсутствует; этот результат не
  устанавливает причину прежнего сбоя и не доказывает её исправление.
- [x] Fresh reset 0.2.84 r41 19:14:00 UTC: полный PASS, 448 evaluations,
  0 violations/not-executed/inconclusive, четыре child runs executed, 56/56 matches.
  Тот же instance/manual hash; exact engine/Editor/details replay подтверждён.
- [ ] При повторении native сбоя установить причину по stage/error evidence и
  отдельно исправить её; успешный reset не изменяет исторические gaps.
- Consumer impact и проверка Apollo: [APOLLO-V4-PARITY-015](../../Apollo/docs/ARCHITECTURE_BACKLOG.md#apollo-v4-parity-015--диагностика-native-dependency-capture).
  Private reports не копировать в source/fixtures/logs; published consumer/Proxy
  приёмка остаётся отдельной.

## EDITOR-HOST-CONTEXT-MODE-CATALOG-001 · ложный host-context gap при смене View · 03.10.2026

- Приоритет: P1. Статус: реализовано и проверено локально 05.10.2026 на
  **Editor 0.2.90 / core 0.1.9**, fresh Figma и published consumer acceptance
  открыты. Исходный дефект подтверждён в 0.2.83 / 0.1.6.
  Связь: [APOLLO-V4-PARITY-014](../../Apollo/docs/ARCHITECTURE_BACKLOG.md#apollo-v4-parity-014--variable-mode-catalog-в-независимых-host-stages);
  PARITY-011 отдельно нормализует direct child capture.
- Fresh Figma прогон 06:24:57 UTC: две видимые Button, первая Secondary,
  вторая Primary, host Size=56 / Overflow=false. Правило первой позиции Primary
  правильно даёт один violation. Native capture получает оба independent stages,
  child contracts выполняются, но первая область остаётся `host-context-changed`:
  49/65 matched nodes, один infrastructure `not-executed`, `complete=false`.
- Сверка base и independent stage вне первой boundary: единственные 50 отличий —
  отсутствие metadata `Interface Static` в `variable.modeCatalog` у 49 nodes
  и одного resolved mode у root. После смены единственной Primary на Secondary коллекция
  не встречается в `resolvedVariableModes`; `collectSceneNodes` собирает каталог
  по union этих значений. Переданный context и topology полны и совпадают;
  layout, appearance, bindings, component identity, text и visibility вне boundary
  не меняются. Guard сравнивает capture-dependent metadata как изменение окружения.
- Требуется доказать релевантность collections/modes для окружающего host при
  сравнении независимых stages: исчезновение неиспользуемой коллекции не должно
  блокировать reference. Реальное изменение binding, активного mode, paint/layout,
  identity или topology должно сохранять gap; missing required facts остаются unknown.
  Default mode не подставлять как наблюдённое evidence, actual не использовать
  источником reference. Сохранить точный historical replay.
- Критерий закрытия: synthetic production-shaped Primary → Secondary stage и
  Secondary → Primary на другой occurrence дают полный capture и сохраняют
  parent position violation; чистый reset проходит. Нужны guards для изменения
  используемого mode/binding и стилей, shared/Editor/Apollo parity и fresh Figma.
- Все четыре fresh reports 06:24:26–06:25:13 UTC воспроизводят engine, Editor
  coverage и presentation details точно, входные snapshots не изменены.
  Private evidence остаётся в `design-system_ab/experiments/current-contract-packages`.
- [x] Shared capture/comparison реализован локально 05.10.2026 на текущей базе
  **core 0.1.9 / Editor 0.2.90 / Apollo 0.4.0**. Версии приложений и release
  не повышались; это состояние локального кода, не опубликованного Proxy.
- Свежий capture v4 добавляет `hostContextVariableModesVersion=1` и
  `hostVariableUsageV1`: наблюдённые bindings связываются с collections через
  Figma variable API отдельно в каждом independent stage, включая paints,
  effects и смешанные text ranges. Selected-mode alias chains обходятся
  независимо и bounded (16 уровней, 128 обращений); referenced collections
  сохраняют собственное required mode evidence. Циклы, missing variables или
  нечитабельный selected value дают incomplete; default не подставляется.
  Host guard сравнивает modes/catalog только
  для коллекций, используемых самим узлом окружения. Raw facts, переданный
  context и независимые reference facts сохраняются; default mode не служит
  resolved evidence и actual не копируется в reference.
- Missing/ambiguous collection proof или required mode/catalog остаются gap.
  Реальные mode/binding, paint/layout/style, identity/topology и supplied context
  изменения блокируют lineage. Неподдержанный marker отклоняется, unmarked v4
  и старые версии сохраняют прежний replay, включая прежний ложный gap.
  Normative manual, compiler policy/producer, compiled hashes и exact pins не менялись.
- [x] Локальные gates: **core 68/68, Editor 819/819, Apollo 144/144**.
  Production-shaped API simulation воспроизводил collection removal/addition
  с `host-context-changed` и 7/9 matches до исправления; теперь 9/9, parent
  position violation сохраняется, reset проходит. Bundled Editor/Apollo дают
  точный shared engine; Editor export сохраняет marker и повторный результат.
  4 доступных сохранённых ButtonsGroup reports точно воспроизводят persisted
  engine/Editor/details без изменения snapshots или файлов. Private evidence
  в репозитории и test fixtures не копировалось.
- [ ] Fresh Figma: повторить Primary-second negative и чистый reset в новой
  локальной сборке; подтвердить полный capture и ожидаемый position violation.
- [ ] Published consumer/Proxy: совместный source/runtime release и consumer
  acceptance отдельно. Legacy typecheck/build/Figma parser прошли; полный
  legacy test gate остановлен прежним отсутствующим CardImage compiled fixture.
- Связь этого дефекта с исходным BUG-001 / PARITY-003 не установлена;
  исправление reference host guard не закрывает воспроизведение stale capture.

## EDITOR-PROPERTY-VALUES-001 · выбор параметров и множественные значения · 02.10.2026

- Приоритет: P1. Статус: реализовано в Editor **0.2.82**, общий core **0.1.5**
  без изменения schema/runtime. Запрос владельца: параметры с известным набором
  значений выбирать в UI; бинарные значения и View не вводить вручную.
- [x] Список Figma properties и их значения берутся из variant catalog / semantic
  API соответствующего компонента. Дочерний API доступен только через exact
  direct pin, с учётом выбранных roles, owner и representation; текущий preview
  не подменяет полный каталог значений. Root picker не смешивает дочерний API.
- [x] Checkbox multiselect для propertyDomain/propertyExclusion, collection
  assertion/filter/whenHost/whenMember и typed dependency subject condition;
  variantProperty dependencyDomain использует тот же выбор property/values.
  Известный тип свойства подставляется автоматически. BOOLEAN предлагает два
  логических значения; VARIANT сохраняет строку и исходный регистр.
- [x] Обычный Component Property domain сохраняет VARIANT `true` как строку,
  без прежнего преобразования через универсальный comma parser в BOOLEAN.
  Semantic API finite domains также выбираются из доступного набора; boolean
  from/to transition задаются списками. Свободный TEXT и числовые диапазоны
  сохраняют ввод, поскольку их значения не ограничены конечным API.
- [x] Сохранённое значение вне известного API показывается отдельно и не
  исправляется автоматически. Автор явно снимает неверное значение и выбирает
  допустимое. При Save ошибка раскрывает поле; обновление summary не меняет
  фокус. Без полного каталога новые enum values не выдумываются, historical
  selected values сохраняются для просмотра и roundtrip.
- [x] Проверено: Editor **790/790**, typecheck/build; Chromium — полный View
  multiselect, разный регистр VARIANT, BOOLEAN, исправление legacy value,
  обычный Component Property, edit/ZIP/pin roundtrip, collection forms,
  collapsed Applicability/error reveal, 18 responsive и 18 dialog layouts.
  Apollo **108/108**: typed/case-sensitive consumer parity, negative/reset и
  неполнота при неверном типе. Legacy Apollo full gate останавливается на прежнем
  отсутствующем CardImage compiled fixture; typecheck/build/runtime-check прошли.
- Read-only проверка пользовательского ButtonsGroup r32: 15 rules, Ready;
  SingleIcon max=1 сохранён. Host requirement Overflow всё ещё содержит `True`
  вместо catalog `true`; position-last filter SingleIcon содержит `true` вместо
  catalog `True`. Оба значения требуют явного исправления. Отдельного
  Overflow=true count min=2 пока нет; purpose пуст и даёт SEMANTICS_PURPOSE.
  Исходный архив и exact child pins не изменялись.
- [ ] Подтвердить удобство выбора и получить обновлённый архив после live
  перезапуска **0.2.82**; fresh Figma negative/reset принятие отдельно.
- Consumer impact: authored JSON values сохраняют исходные типы и регистр;
  новый формат и producer minimum не нужны (existing minimum **0.2.80**).
  Выбор API не расширяет authored permissions автоматически. Связь:
  [APOLLO-V4-PARITY-012](../../Apollo/docs/ARCHITECTURE_BACKLOG.md#apollo-v4-parity-012--typed-values-из-editor-property-pickers).
- Критерий приёмки: автор выбирает property и одно/несколько значений без ручного
  ввода enum; Save/edit/ZIP сохраняют точные typed values, source rules и pins;
  неверный регистр требует явного исправления, missing API не подменяется
  текущим значением или данными чужого пакета.

## EDITOR-BUTTONSGROUP-LIVE-001 · блокеры первого actual теста · 02.10.2026

- Приоритет: P0. Статус: реализовано в Editor **0.2.80** / shared core **0.1.5**.
  Исходная диагностика относится к Editor 0.2.79 / core 0.1.4; свежая live
  negative/reset приёмка после перезапуска остаётся отдельным gate.
- Сценарий: desktop ButtonsGroup, manual r20; у второй видимой кнопки View
  переключён с Secondary на Accent, остальные две кнопки скрыты. Ожидается
  нарушение authored View domain с фокусом на второй кнопке, успешная проверка
  состава/количества и отдельное выполнение Button для двух видимых occurrences.
- Actual report от 02.10.2026 12:27:06 UTC воспроизведён до исправления в runtime 0.1.4:
  18 human-review, 6 not-executed, 0 violations; scenario coverage incomplete.
  Ready compilation не подтверждает actual execution.
- [x] **Collection graph / разные пространства IDs.** `completeGraph` требует
  равенства `source.rootNodeId` и `selection[0]`. Production capture сохраняет
  в первом поле Figma ID для source/selection tracking, во втором — локальный
  `preview:0`. Поэтому membership/count/View отсекаются до чтения свойств.
  Доказывать корень/edges в локальном graph и явно учитывать назначение source
  ID; сохранить проверки полной topology и независимой reference identity.
  Изолированный диагностический replay на копии снимка с согласованными IDs
  даёт membership/count PASS и View FAIL с фокусом на второй кнопке.
- [x] **Две authored цели одного корня.** Root aliases `buttons-group` и
  `size-56-overflow-false` оба привязаны к пустому relative path. Availability
  делает обе цели unknown из-за path collision; 15 root checks не исполняются.
  Определить явную совместимую модель aliases/канонического root anchor в
  authoring, compiler и runtime. Не требовать удаления правил или переименования
  Figma-слоёв. Действительные nested collisions остаются unknown. В диагностической
  копии удаление любой одной alias из facts делает другую present; исходный
  manual/compiled/report не изменялись.
- [x] **Child capture / лишний mode catalog.** У host capture общий
  `variable.modeCatalog` содержит дополнительную коллекцию Spacing; отдельный
  Button capture её не включает. Intrinsic values, bindings и actual resolved
  modes совпадают, но полное сравнение справочников даёт
  `dependency-capture-actual-mismatch` для обеих видимых кнопок.
  Сравнивать релевантное variable evidence и сохранять fail-closed для различий
  actual modes/bindings, required metadata, topology, identity и стилей.
  Диагностическая копия с одинаковым catalog запускает оба Button: по 88 checks;
  две скрытые occurrences остаются not-applicable.
- Реализация: local root/edges проверяются независимо от Figma provenance ID;
  root selectors используют доказанные `rootTargetAliasesV1` с явным
  `rootTargetAliasesVersion=1` и producer minimum 0.2.80. Facts recompute требует
  точного independent root identity; nested collisions остаются unknown.
  Dependency actual сравнивает catalogs только реально resolved collections;
  modes/bindings и обязательное metadata остаются exact. Manual/schema и child
  pins не переписываются; outer compiled пересобирается из manual.
- Проверено: Editor **786/786**, core **5/5**, Apollo **107/107**; three original
  regressions сначала падали, затем прошли. Consumer parity, unsupported/missing
  alias version, stale/injected identity, required catalog/mode/style guards
  и historical replay сохранены. На копии actual report повторная компиляция
  сохраняет manual source hash и pins: root checks проходят, Accent выявляется
  на второй кнопке, оба видимых Button выполняют по 88 checks; скрытые inactive.
  Старый report не обогащается отсутствующим independent host reference и не
  превращается в доказательство полного нового live capture.
- Read-only импорт прежнего ButtonsGroup authoring ZIP r20 также проверен:
  все 8 правил и 6 целей сохранены; исходный архив не изменён.
- [ ] Свежие Figma negative/reset reports 0.2.80 и полная D/M/release приёмка.
- Критерий закрытия: production-shaped synthetic capture с Figma/local IDs,
  двумя root targets и различающимися нерелевантными catalogs; negative Accent
  выявляется на своей кнопке, root проверки выполняются, reset проходит.
  Partial/stale/foreign/duplicate captures не получают ложный PASS. Затем
  Editor/core/Apollo gates, historical replay и свежие пользовательские
  negative/reset reports; полная D/M и release/Proxy приёмка отдельно.
- Consumer impact: shared capture/reference correspondence, target selectors,
  dependency validation и completeness; тот же дефект возможен в Apollo.
  Связь: APOLLO-V4-PARITY-011 в
  [Apollo backlog](../../Apollo/docs/ARCHITECTURE_BACKLOG.md).

## EDITOR-PROPERTY-PICKER-001 · composition.members в выборе свойств · 02.10.2026

- Приоритет: P1. Статус: реализовано в Editor **0.2.80**. Замечание пользователя при ручном authoring
  ButtonsGroup в Editor **0.2.79** / core **0.1.4**: для правил состава и количества
  кнопок `composition.members` приходится вводить вручную.
- [x] Добавить `composition.members` в список «Свойство» группы «Одно свойство»
  с понятным названием «Состав коллекции».
- [x] Находить свойство по точному capability и русским словам «состав» /
  «коллекция». Показывать для корневой цели, даже если одноимённого свойства
  нет в Observed facts: это структурное правило, а не физическое свойство Figma.
- [x] Выбор подставляет точный capability `composition.members`; существующая
  форма memberCollection и её явные настройки остаются доступны.
- Критерий приёмки: автор создаёт правила закрытого состава и количества
  видимых элементов через выбор свойства без ручного ввода capability;
  сохранение и ZIP/reopen сохраняют те же constraints и привязки.
- Consumer impact: UI-пункт для уже поддерживаемого capability. Изменения schema,
  compiler/runtime semantics и формата чтения Apollo не требуются.

- Проверено Chromium: поиск по `composition.members`, «состав», «коллекция»,
  создание count через picker, сохранение → ZIP/reopen без изменения constraint.

## EDITOR-MEMBER-COLLECTION-ROOT-001 · сохранение коллекции на корневой роли · 02.10.2026

- Приоритет: P0. Сценарий: корень имеет role `buttons-group`; правило
  `composition.members`, constrained/self, memberCollection, закрытый состав
  четырёх direct bindings. В Editor 0.2.78 / core 0.1.3 сохранение отклонялось:
  `Member collections require one constrained root/self rule.` Ошибка
  подсвечивала Execution Route. [Скриншот](evidence/editor-ui-2026-10-02/member-collection-root-error.png).
- Причина воспроизведена regression-тестом: validator требовал literal role
  `root`, несмотря на явный root anchor с другой ролью.
- [x] Editor **0.2.79** / shared core **0.1.4**: resolved alias с пустой lineage
  и явными root-only path hints принимается. Nested/unknown/conflicting anchors
  отклоняются. Historical reserved `root` route сохранён; runtime независимо
  доказывает source/reference topology и identity. Label, node ID и порядок
  не используются как доказательство корня.
  Та же проверка применяется к host anchor `dependencyDomain`: browser continuation
  обнаружила аналогичный literal-root запрет в правилах вложенного компонента.
- [x] MEMBER_COLLECTION_SCOPE адресуется «Область действия», ошибки данных
  коллекции — Typed constraint; Execution Route больше не подсвечивается.
- [x] Editor validate **783/783**, core **5/5**, Apollo **104/104**.
  Synthetic compile/execution, hidden duplicate FAIL, reset PASS и rejection
  неверного scope/anchor проверены.
- [x] Browser: root roles `buttons-group` и historical `root`, direct bindings, membership/position,
  условие на nested subject, подсветка scope error, сохранение → ZIP/reopen/session.
  На копии пользовательского ZIP r17 добавляемое правило компилируется ready
  без ошибок; сохранённый compiled исходного ZIP остаётся exact, архив не менялся.
- [x] Пользователь повторно сохранил правило; проверен ZIP manual r18:
  root/self `composition.members`, четыре member roles, desktop representation,
  membership включая скрытые, reviewed. Compiled ready и точная recompilation
  совпадают; ошибок нет, `memberCollectionsVersion=1` сохранён. Это приёмка
  live authoring/export, не выполнения правила на actual instance.
- [ ] Полная live D/M runtime и release/Proxy приёмка остаётся отдельно.
- Consumer impact: schema/runtime flags и исполняемый формат не меняются;
  общий validator нужен Apollo для компиляции manual с root alias. Локальный
  consumer использует core 0.1.4; published consumer/Proxy не обновлялся.
  Связь: APOLLO-V4-PARITY-010 в
  [Apollo backlog](../../Apollo/docs/ARCHITECTURE_BACKLOG.md).

## EDITOR-DEPENDENCY-IMPORT-001 · source ZIP зависимости и явная подготовка целей · 02.10.2026

- Приоритет: P0 для продолжения manual ButtonsGroup. Editor **0.2.78**;
  shared core **0.1.3** не изменён. Статус: реализовано; live загрузка подтверждена
  пользователем, экспорт четырёх D bindings одного варианта проверен;
  остальные варианты и child execution ещё принимаются отдельно.
- Пользователь выбирал `Button.component-contract.zip` в паспорте ButtonsGroup.
  ZIP содержит reviewed manual r31, source evidence и Spinner r8 closure, но
  не compiled output. Форма требовала compiled; ошибка toast была скрыта
  модальным окном. [Исходный скриншот](evidence/editor-ui-2026-10-02/dependency-import-empty.png).
- [x] Принимать source-only authoring ZIP через общий compiler: reviewed/deprecated
  rules, отсутствие ошибок, ready output и полный проверенный closure обязательны.
  Если compiled присутствует, его точное совпадение с recompilation остаётся
  обязательным; повреждённый compiled не заменяется автоматически.
- [x] Показывать filename, ход загрузки, успех и ошибку внутри формы паспорта.
  Неудачная загрузка сохраняет прежний пакет; повторный выбор файла работает.
- [x] Owner не требует literal role `root`; корневые aliases/варианты не
  показываются как дочерние occurrences. При отсутствии дочерних targets есть
  явное объяснение; source proofs и topology всё равно проверяются runtime.
- [x] В Anatomy добавить «Добавить цель выбранного слоя…». Явное действие
  регистрирует unknown target без создания правила и открывает существующий
  remap: независимый source proof, выбранный variant/representation и явное
  подтверждение по-прежнему обязательны. Отмена подтверждения оставляет цель
  неподтверждённой; повторное действие открывает её, а не создаёт дубликат.
- Regression: compiled/source ZIP, exact output, Draft/invalid/missing/stale
  closure rejection, self/unsupported input; browser source ZIP и видимые
  ошибки с сохранением пакета/правил; создание новой цели без правила и ZIP reopen.
- [x] Локальные gates: Editor typecheck/build и **780/780**, core **5/5**,
  Apollo **103/103**. Chromium проверил загрузку на предоставленных
  ButtonsGroup/Button ZIP без изменения rules/targets, existing/new target
  confirmation и cancellation/retry, collection forms и 18/18 layouts/dialogs.
- Consumer impact: сохраняемая схема pins/bindings/variantHints и runtime
  flags прежние; новый путь загрузки порождает тот же shared compiled contract.
  Учёт совместимости — APOLLO-V4-PARITY-007 и APOLLO-V4-PARITY-008 в
  [Apollo backlog](../../Apollo/docs/ARCHITECTURE_BACKLOG.md).
- [x] Live 02.10.2026: пользователь загрузил Button ZIP; видны `core.web.button · r31`,
  оба hashes и «Полный closure подтверждён». Пустой список children объяснён
  отсутствием semantic targets. [Скриншот](evidence/editor-ui-2026-10-02/dependency-import-live-success.png).
- [x] 02.10.2026 проверен пользовательский ButtonsGroup ZIP, manual r16:
  четыре уникальных resolved Button targets для D `Size=56, Overflow=false`,
  четыре `direct-child` bindings с owner `buttons-group` и desktop representation.
  Pin Button r31 и вложенный Spinner r8 совпадают; compiled ready, точная
  recompilation совпадает с сохранённым compiled, ошибок нет. Единственное
  предупреждение — пустой `semantics.purpose`. Это приёмка сохранения/чтения,
  а не подтверждение выполнения child rules на инстансе.
- [ ] Подтвердить targets остальных семи D вариантов и двух M occurrences
  во всех M вариантах; проверить direct child execution свежими reports.

## EDITOR-UI-001 · скачок раскладки при кликах в authoring · 02.10.2026

- Приоритет: P1. Статус: исправлено в Editor **0.2.80**; замечание пользователя при ручном заполнении
  ButtonsGroup в Editor **0.2.77**. Первоначальная регистрация была без изменений кода.
- Симптом: после некоторых кликов рабочие панели смещаются/обрезаются,
  строка Test & compile оказывается примерно в середине окна; ниже остаётся
  большая пустая область. Размер окна на скриншоте не занят рабочими панелями.
  Исходный элемент-триггер по скриншоту не установлен. Отдельный browser
  regression воспроизвёл тот же механизм через focus/scrollIntoView длинной формы:
  скрытый body прокручивался и сдвигал header/footer.
- Доказательство: [скриншот пользователя](evidence/editor-ui-2026-10-02/layout-jump.png).
- [x] Воспроизвести механизм в браузерной сборке длинной формы и установить,
  что focus/scrollIntoView прокручивает document. Проверить повторный focus,
  разные позиции прокрутки и размеры окна.
- [x] Исправить подтверждённую причину: сохранять доступную высоту рабочих
  панелей и независимую прокрутку; footer остаётся у нижней границы окна,
  без большого пустого остатка и обрезания обязательных controls.
- [x] Проверить сохранность выбранной цели, значений формы и позиции
  редактирования; Save/проверка/экспорт остаются доступны. Добавить browser
  regression для найденного механизма; live подтверждение отмечено отдельно ниже.
- Связь: прежний footer-дефект в 0.2.43 и responsive gate 0.2.77 — контекст,
  а не доказательство той же причины; подтверждение исходного live случая ожидается.
- Consumer impact: исправлена раскладка UI без изменений manual,
  compiled, hashes/pins или исполнения. Для такого изменения отдельная запись
  Apollo не требуется; изменение данных/чтения потребует записи по AGENTS.md.

- Исправление: `overflow: clip` у html/body исключает программную прокрутку
  viewport; error focus раскрывает sections и прокручивает только authoring pane.
  Browser regression падал до изменения, затем прошёл; 18 responsive и 18 dialog
  layouts также прошли.
- [ ] Подтвердить исходный случай и удобство после live перезапуска 0.2.80.

## EDITOR-UI-002 · компактная форма и отдельные уровни заполнения · 02.10.2026

- Приоритет: P1. Статус: реализовано в Editor **0.2.80**; запрос пользователя в Editor **0.2.77**.
- Проблема: длинная форма требует много прокрутки и затрудняет создание
  правил. Разделы **Execution**, **Нормативный владелец**, **Applicability**,
  **Typed constraint** должны сворачиваться либо заполняться на отдельном
  уровне с возвратом к основному правилу. Оба варианта допускаются пользователем;
  конкретное решение выбрать при проектировании.
- [x] Сделать перечисленные разделы сворачиваемыми или вынести их на отдельный
  экран/уровень редактора. Основные поля и действие Save должны быть удобны
  в обычном размере окна плагина.
- [x] Показывать краткое описание заполненного раздела, включая ограничения,
  применимость, владельца и маршрут исполнения; свёрнутый раздел не скрывает
  наличие обязательных полей, предупреждений или ошибок.
- [x] Ошибка проверки раскрывает нужный раздел/открывает нужный уровень и
  приводит фокус к проблемному полю. Переходы сохраняют несохранённые значения,
  выбранную цель и контекст preview; возврат не сбрасывает форму.
- [x] Проверить create/edit, смену permission/constraint, клавиатурное
  переключение, сохранность draft и маленькие окна в браузерных gates.
- Consumer impact: это организация формы. Существующие source rules,
  applicability/ownership/execution/constraints, defaults и ZIP round-trip
  должны сохраняться точно. Если реализация изменит сохраняемую модель или
  семантику, в той же задаче завести/обновить parity-запись Apollo.

- Реализация: native keyboard-accessible details для четырёх sections; Typed
  constraint изначально открыт, остальные свернуты. Краткие summaries отражают
  constraint/collection, scope/условия, route и ownership. Поля остаются в DOM;
  toggle не меняет форму/manual и не теряет draft. Ошибка открывает соответствующий
  раздел и фокусирует control без сдвига viewport. Browser save/ZIP/reopen пройден.
- [ ] Live проверка удобства с пользователем после перезапуска 0.2.80.

- Дополнение по замечанию владельца: **0.2.81**, Applicability сворачивается
  при каждом создании и открытии правила. В 0.2.80 HTML default был свёрнутым,
  но ручное раскрытие оставалось в DOM при переходе к следующему правилу.
  Reset/load теперь сбрасывают только состояние раскрытия Applicability;
  summaries и значения применимости сохраняются, ошибка раскрывает нужное поле.
  Browser regression воспроизвёл перенос раскрытия до исправления; проверены
  new/edit переходы, error reveal и ZIP roundtrip. Typecheck/build пройдены.
  Это UI state без изменения source/compiler/runtime; отдельная Apollo
  parity-запись по AGENTS.md не требуется.
- [ ] Подтвердить default Applicability при live перезапуске **0.2.81**.

## EDITOR-EXPORT-NAME-001 · имена ZIP с учётом платформы · 01.10.2026

- [x] Editor 0.2.74 сохраняет регистр family и добавляет mobile-web к имени
  мобильного ZIP. Desktop/universal сохраняют базовое имя семейства.
- [x] Для нескольких платформ используется полный отсортированный scope
  паспорта; переключение preview не меняет имя общего пакета.
- Shared core 0.1.0 не меняется: исправлен только download filename Editor.
  Состав ZIP, manual/compiled payload и hashes не зависят от нового имени.
- Regression: desktop/mobile collision, multi-platform/preview independence,
  fallback и безопасные символы; browser import → download → manual roundtrip.
- [x] Editor validate: typecheck/build, 740/740 tests. Chromium подтвердил
  реальные имена двух CorporateContent ZIP и точный manual/compiled roundtrip.
- Apollo legacy gate: typecheck/build/Figma-runtime прошли; общий test runner
  остановлен ранее отсутствующим CardImage compiled fixture. Consumer filename
  compatibility подтверждена общим importer; исправление этой fixture вне scope.
- Consumer impact и критерий совместимости: APOLLO-V4-PARITY-009 в
  `../../Apollo/docs/ARCHITECTURE_BACKLOG.md`.

## Учёт изменений чтения контрактов в Apollo · 01.10.2026

Обязательный процесс закреплён в `../AGENTS.md`: каждое изменение чтения
контрактов в той же задаче отражается в
[каноническом бэклоге Apollo](../../Apollo/docs/ARCHITECTURE_BACKLOG.md#apollo-совместимость-с-componentcontract-editor).
Для 0.2.71–0.2.73 заведены PARITY-001–005: topology/source identity, external
native SLOT, stale guard, полное coverage и mobile CorporateContent release.
Общая реализация готова в core; consumer integration/release acceptance открыты.

## BUTTONSGROUP-AUTHORING-001 · условные правила встроенной коллекции

План: этап 4 в [BUTTONSGROUP_EDITOR_PLAN.ru.md](BUTTONSGROUP_EDITOR_PLAN.ru.md).
P0 occurrence-блокер ниже выделен в отдельную задачу 003; зависимости и
закрытый состав — предшественники 002/004. Приоритет P1 обязателен для
готовности полного Figma composition scope.

- Предшественник 003 закрывает коллизию путей 4 `[D] Button` / 2 `[M] Button`.
  Этот P0 ранее учитывался внутри 001; отдельная запись сохраняет связь с
  APOLLO-V4-PARITY-007 и критерии без дублирования работы.

- [x] Добавить общий authoring-контур count-by-value и позиции
  среди видимых fixed dependencies, с условиями от host variant.
- Приоритет: P1. Статус: код и локальные consumer regressions готовы;
  live acceptance нового manual остаётся отдельным шагом.
- Editor 0.2.77 / core 0.1.3: `memberCollection` и `memberCollectionsVersion=1`.
  Count, optional first/last, typed filter/whenHost/whenMember, member domain,
  host mapping и host requirement сохраняются в source-linked RuleIR и ZIP.
  Unknown identity/visibility/order/property не превращается в ноль или false.
  Evaluation содержит фактические counts, selected members, свойства и focus.
- Уже доступны quantity по dependency, nested VARIANT domain и mapping от
  semanticApi host. Их использовать для count/View/Size без копирования Button.
- Сложный scope: необязательный Primary максимум один и первым; SingleIcon
  максимум один и последним, только при Overflow=true; средние встроенные
  Button разрешено скрывать. Exact `positionOrder` не заменяет эти условия.
  Полный перебор configuration profiles возможен только после доказательства
  семантики hidden targets; пока готовым решением не объявляется.
- Критерий: одна общая typed модель, честный missing/unknown, conditional
  cardinality/order и стабильная identity в variant switch. Negative/control
  fixtures различают no Primary, two Primary, late Primary, hidden middle,
  SingleIcon middle и Overflow=false. Изменения потребителя отслеживаются в
  APOLLO-V4-PARITY-006; новые source нормы принимает владелец отдельно.
- В план включены typed host/member conditions, count по значению,
  first/last-visible и conditional min=2. SingleIcon при Overflow=false должен
  дать violation, а не исчезнуть за when gate. Обычный min=1 сохранён;
  отсутствие Primary/видимого SingleIcon само по себе допустимо.
- View/Size доступны через existing dependencyDomain и typed collection domain/
  mapping. Для icon narrowing добавлен общий `dependency.subjectCondition`
  с `dependencySubjectConditionsVersion=1`: условие относится к доказанной
  semantic цели, а не к root или имени. Формы сохраняют VARIANT-строки без
  неявного преобразования. Exact icon domains для остальных Size принимает
  владелец после независимого readback; библиотечные нормы здесь не переписаны.
- Анализ: `design-system_ab/experiments/web-corp/ButtonsGroup/authoring/ANALYSIS.ru.md`.

## BUTTONSGROUP-AUTHORING-002 · прямые pinned children без wrapper

План: этап 2 в [BUTTONSGROUP_EDITOR_PLAN.ru.md](BUTTONSGROUP_EDITOR_PLAN.ru.md).
Предшественник — 003. Direct route введён в Editor 0.2.76 / core 0.1.2;
текущие формы и consumer gates — Editor 0.2.77 / core 0.1.3.

- [x] Typed `kind=direct-child`: отдельные owner/member/representation bindings,
  lineage до hidden, exact child pin, independent capture и dedup actual child.
  Новый capture cap 16 покрывает 4 Button + 8 транзитивных captures; legacy cap 8.
- Приоритет: P0. Код и synthetic D/M execution, pin/platform/stale/unknown,
  child focus/RuleID, ZIP и старый wrapper replay проверены. Новый manual и
  live Button r31 / Spinner r8 closure ещё не принимаются этой записью.
- Исходное ограничение: `FixedNestedBinding` требует owner INSTANCE, activeVariant и непустой
  `childPath`; повторный `(targetRole, relativePath)` запрещён. Эта модель
  подходит Button → Addon → Spinner. В ButtonsGroup четыре/две прямые Button
  под одним root, без отдельных wrappers. Привязка child к самой semantic target
  с `childPath=""` остаётся невалидной в legacy route. Direct route не переосмысливает
  пустой legacy путь; отдельная новая модель поддерживает несколько children.
- Критерий: общий прямой binding по подтверждённой semantic occurrence, pin
  componentId/revision/manual/compiled hash и selected-library identity.
  Несколько siblings одного owner поддержаны; hidden child inactive, чужой child
  violation/unknown по доказательствам, child manual исполняется самостоятельно.
  Source нормы Button не копируются в group; Spinner dependency/replay сохранены.
  Consumer counterpart: APOLLO-V4-PARITY-008.
- Acceptance: один Button r31 pin, отдельные 4/2 bindings, полный Spinner r8
  closure; child focus/RuleID, pin/platform/source proofs, hidden execution и
  запрет повторного исполнения одного actual child. Membership скрытых members
  проверяется отдельно от inactive child execution. Старые ZIP/replay сохранены.

## BUTTONSGROUP-AUTHORING-003 · адресация одноимённых occurrences

- [x] Устранить name-path uniqueness gate в общей модели snapshot/reference.
- Приоритет: P0. Статус: код готов в Editor 0.2.75 / shared core 0.1.1;
  live acceptance нового ButtonsGroup manual ещё не выполнен.
- Обновление 0.2.77 / core 0.1.3: partial source correspondence сохраняет
  независимо доказанные siblings; missing одного child не подавляет finding
  следующего. Completeness остаётся false; legacy unmarked replay не меняется.
- План: этап 1 в [BUTTONSGROUP_EDITOR_PLAN.ru.md](BUTTONSGROUP_EDITOR_PLAN.ru.md).
  Уточняет identity-подзадачу прежней записи 001; source нормы не меняет.
- Охват: topology/shape, variant facts, reference node properties, target
  resolution/remap, boundaries, dependency selectors и child captures.
  Локальный occurrence address и доказанная owner-relative source identity
  отделены от диагностического имени и sibling order.
- Критерий: 4 D / 2 M одноимённые Button различаются, включая одинаковые
  Secondary keys; все 16 вариантов имеют reference и доказанные target mappings.
  Rename/reorder не переводят факт на соседний member. Imported main, unknown,
  duplicate/cyclic edges, truncation и historical replay имеют явные проверки.
- Consumer impact: shared capture/reference/target resolution и compatibility
  gate; APOLLO-V4-PARITY-007. Версии новых форматов определяются реализацией.
- Формат: `occurrenceAddressVersion=1` в capture/reference/generated evidence
  и compiled runtime policy. `@source` хранит подтверждённый owner-relative
  адрес; `@local` хранит непроверенное вхождение и не доказывает correspondence.
  Athena `nodeId` — нормализованный номер: `@catalog` также только локальный
  адрес, а не Figma source ID. Имена остаются диагностикой.
- Каталог сохраняет все 16 variants. Сравнение диагностической структуры не
  назначает роли одноимённым siblings; автор подтверждает `variantHints`
  отдельно для representation/selected component key через существующий remap.
  Переключение Size/Overflow не заимствует привязку другого варианта.
- Source evidence расширено на component-owned FRAME/TEXT/SLOT. Imported owners
  подтверждаются независимым pristine capture независимо от actual names;
  временные экземпляры удаляются. Rename/reorder/hide не переносят отклонение
  на соседний member. Совпадение local IDs не даёт baseline.
- Compatibility: captures без marker сохраняют старые name paths и exact replay;
  уникальные старые catalog shapes/hashes сохраняют прежний формат.
- Verification: shared core 4/4, Editor 753/753, Apollo 100/100; regressions
  охватывают D/M capture controller, corruption/missing, boundaries, source/port
  guards, root identity, per-variant remap и ZIP round-trip. Chromium подтвердил
  полный remap → confirm → ZIP → reopen и 18 responsive/dialog layouts.
  Live acceptance отмечается отдельно. Legacy Apollo typecheck/build/runtime прошли; полный
  test runner по-прежнему остановлен отсутствующим CardImage compiled fixture.
- [ ] Свежие library/Editor reports всех 16 variants и mapping нового manual.
  Direct bindings/child execution интегрируются на этапе 002; release/Proxy
  acceptance остаётся в 006 и PARITY-007, не закрывается unit-тестами.

## BUTTONSGROUP-AUTHORING-004 · закрытый состав встроенных экземпляров

- [x] Общий declared direct-child membership по occurrence identity.
- Приоритет: P0. Editor 0.2.77 / core 0.1.3: `memberCollection` с assertion
  `membership`, opt-in `memberCollectionsVersion=1`. Catalog/reference и source
  lineage проверяются отдельно от actual graph addresses; duplicate source
  обнаруживается даже при невозможности построить уникальный occurrence path.
  Partial capture/reference остаётся unknown; известное нарушение с другим
  missing evidence сохраняет violation и неполное coverage.
- План: этап 3 в [BUTTONSGROUP_EDITOR_PLAN.ru.md](BUTTONSGROUP_EDITOR_PLAN.ru.md).
  Предшественник — 003; интеграция с direct bindings задачи 002.
- Область включает скрытые members; hide/show разрешено. Принадлежность
  исходному составу, допустимые child family/variant и условный порядок —
  разные проверки. Missing при неполном capture остаётся unknown.
- Критерий: hidden middle проходит; hidden duplicate, added/foreign child и
  подмена при прежнем visible count дают доказанное structural нарушение
  или явную неполноту. Внутренности Button не становятся members группы.
- Consumer impact: новая typed membership policy/facts, compiler/coverage и
  focus; APOLLO-V4-PARITY-010. Synthetic hidden/extra/duplicate/replace/remove,
  same-family variant, rename/reorder, missing/stale cases пройдены в Editor/v4.

## BUTTONSGROUP-AUTHORING-005 · формы ручного заполнения коллекции и pins

- [x] Выбор отдельных occurrences, direct dependency bindings и
  conditional collection constraints без обязательного ввода JSON.
- Приоритет: P1. Editor 0.2.77 / core 0.1.3: package import, проверенные hashes/
  revision/closure, owner/member/representation selectors, collection forms,
  typed subject condition и выбор nested subjects. Read-only child сохраняется
  в dependencies/; JSON остаётся расширенным режимом. Chromium проверил
  сохранение двух direct bindings, membership, filtered position и ZIP/reopen.
- План: этап 5 в [BUTTONSGROUP_EDITOR_PLAN.ru.md](BUTTONSGROUP_EDITOR_PLAN.ru.md).
- Критерий: отдельные anatomy rows, owner/member/package selectors,
  подтверждённые revision/hashes/closure, typed property/domain/mapping,
  count/filter/first-last/host conditions и читаемое описание правила.
  Save/reopen и ZIP round-trip точны; unsupported/missing не выглядит исполняемым.
- UI использует общий schema/compiler; counterparts APOLLO-V4-PARITY-006,
  APOLLO-V4-PARITY-007, APOLLO-V4-PARITY-008 и APOLLO-V4-PARITY-010
  обновляется, если сохранение/чтение данных меняется. JSON advanced route остаётся.

## BUTTONSGROUP-AUTHORING-006 · source coverage, compatibility и приёмка

- [ ] Подтвердить полный заявленный Figma composition scope и совместимость consumers.
- Приоритет: release gate. Локальная механика завершена; на 05.10.2026 есть
  desktop manual **r56 / 17 Reviewed** и fresh Size=56 Editor cases. Полная
  D/M/variant матрица и published consumer acceptance остаются открытыми.
- [x] Editor validate 774/774, core 5/5, Apollo 103/103. Общие facts/
  evaluation/focus/coverage совпадают на synthetic consumer cases. Historical
  33-capture replay и Button/Spinner/CorporateContent регрессии сохранены.
- [x] Chromium: direct pin/collection/subject forms, ZIP и session reopen.
  18 responsive/dialog layouts, occurrence remap и имена/roundtrip прежних
  desktop/mobile CorporateContent ZIP проверены.
- [ ] Передать новый core/capability profile в consumer release/Proxy и принять
  реальный authored D/M контракт с negative/reset reports всех нужных variants.
- План: этапы 0/6 и матрица в
  [BUTTONSGROUP_EDITOR_PLAN.ru.md](BUTTONSGROUP_EDITOR_PLAN.ru.md).
- Для всех 32 source IDs сохраняется явный маршрут: min=1 supersession,
  Hug/Hug retired, child delegation и отдельные context/code scopes.
  Запрет замены SingleIcon действует во всех размерах; проверка фактического
  активного порта и независимого эталона для remaining Size остаётся в live matrix.
- Критерий: targeted regressions и validate shared core/Editor; UI authoring
  round-trip; сохранённый replay принятых Button/Spinner/CorporateContent;
  D/M live controls/negative/reset с RuleID и full human rule text.
  Отдельно — Apollo/Proxy compile/capture/coverage/release verification.
- Неполный action/menu/code evidence остаётся явным pending. Ready ограничен
  принятым scope. Core/Editor version gates не подменяют consumer acceptance.
  Counterparts: APOLLO-V4-PARITY-004, APOLLO-V4-PARITY-006,
  APOLLO-V4-PARITY-007, APOLLO-V4-PARITY-008 и APOLLO-V4-PARITY-010;
  новый icon lock/main aliases — APOLLO-V4-PARITY-017 и APOLLO-V4-PARITY-018.

## P0 · [M] CorporateContent / повторяющиеся Spacer keys · 01.10.2026

- [x] Mobile r6 подготовлен: 6 source rules / 17 RuleIR, canonical manual и ZIP сохранены.
- [x] Live session r7 от 13:07:01 UTC подтвердил сбой: topology complete,
  6 узлов захвачены, 0 baseline matches, 17 inconclusive + Body 1 notExecuted.
- [x] Rules/targets/source r7 совпадают с r6; отличаются только revision/updatedAt.
  Shared compiler и exact engine replay совпали; hashes проверены.
- [x] TopMargin/BottomMargin — соседние библиотечные экземпляры одного Spacer
  key/set без уникальных property ports; correspondence 0.2.71 считает
  их неоднозначными. Это не сбой payload Body и не лимит capture.
- [x] Editor 0.2.72 добавляет capture-only source identity конкретного библиотечного sublayer для
  таких экземпляров, не ослабляя защиту до name-only или sibling-index fallback.
- [x] Plugin API simulation: 6/6 matches, clipping/modal/opacity negative/reset;
  unknown/foreign/duplicate source, ancestry, scope и конфликт ports проверены.
- [x] Два временных экземпляра в исходном Figma подтвердили разные source layer
  IDs для TopMargin/BottomMargin; оба удалены. Это source probe, не live audit
  пользовательского экземпляра в мастерской.
- [x] Editor validate 727/727 (28 new), shared core validate и Apollo 98/98.
  Legacy Apollo v3 typecheck/build/runtime compatibility прошли; общий test gate
  остановлен отсутствующим CardImage compiled fixture, отдельно от этого patch.
- [x] Отчёт Editor 0.2.72 от 17:17:10 UTC повторил 0/6 matches:
  remote main имеет локальные child IDs, instance сохраняет library IDs.
- [x] Editor 0.2.73 подтверждает source ancestry по отдельному pristine instance
  того же импортированного main; все временные references удаляются.
- [x] Полный capture текущего экземпляра в мастерской: 6/6 matches, 17 checks,
  15 compliant, clipping и modal background — два violation; coverage complete.
- [x] Editor validate 736/736; дополнительные regressions проверяют remapped IDs,
  сбои source capture, чужое/неполное свидетельство и actual-as-own-source.
- [x] Shared core validate и Apollo 98/98; legacy gate повторно остановлен
  отсутствующим CardImage compiled fixture после typecheck/build/runtime checks.
- [x] Пользовательский report Editor 0.2.73 от 17:59:37 UTC подтверждает
  исправление: 6/6 matches, 17 determinate checks, 15 compliant и ровно два
  clipping/modal violation. Exact engine/Editor replay и shared compiler совпали.
- [x] Пользовательский контроль/reset report от 18:09:18 UTC: clipping=false,
  page grey, 17 compliant / 0 violations, 6/6 matches. Engine/Editor exact replay.
- [x] Владелец подтвердил «всё ок»: mobile r6 Ready для шести authored Figma
  правил. Acceptance/runtime index записаны; canonical ZIP добавлен в подборку,
  исходный owner r7 ZIP сохранён. Дополнительные нормы и Hub drift отдельно.

Review/replay: `design-system_ab/scripts/review_corporate_content_mobile_report.js`;
локальный fixture и вывод в `CorporateContent/mobile-web/authoring/reports`.
Runtime исправлен в общем core; Editor собран как 0.2.73. Авторские нормы r6
и оба исходных отчёта r7 сохранены. Исторические exact replay остаются неполными.
Результаты и чтение обновлённого реестра: `mobile-web/authoring/reports/editor-0.2.73-*`.
Свежий пользовательский replay: `scripts/review_corporate_content_mobile_live.js`,
evidence `reports/live-review-editor-0.2.73.2026-10-01T17-59-37-209Z.json`.
Технический execution ledger 81 «Проверено»; нормативный mobile scope принят,
Predicate Ready. Evidence: `mobile-web/authoring/reports/acceptance.json`;
повторить `scripts/review_corporate_content_mobile_acceptance.js`.

## CorporateContent · приёмка владельцем 01.10.2026

- [x] Desktop manual r11 принят: 6 source rules / 17 RuleIR.
- [x] Body CC-B01–CC-B05 принят owner-attested; новых JSON не заявляем.
- [x] Shared compiler reproduce и exact replay пяти архивных отчётов.
- [x] Manual/ZIP без изменений; Section/mobile/pattern/code вне приёмки.
- [ ] Code Connect: source/name pointer сохранён, hasTemplate=false;
  публикация полного parserless SLOT template — отдельный P0.
- [ ] Code parity и тестовая сборка после полноценной публикации.

Исторические pending live Body acceptance ниже заменены owner-attested приёмкой.
Underlying API anomaly и расширения scope остаются открытыми.

## Editor 0.2.71 · 30.09.2026

- [x] P0 capture: edges фиксируются один раз по локальным индексам;
  повторные/циклические/противоречивые API ID не перезаписывают дерево.
- [x] Повреждённая topology даёт конкретный not-executed reason, не ложную
  диагностику «лимит 500». Реальный node limit сохранён.
- [x] Только доказанный direct-root native SLOT с reviewed unconditional
  external-content policy допускает bounded capture. План производный;
  правила на содержимое/рекурсию/dependencies/structure включают полный capture.
- [x] Независимый reference захватывается первым; runtime повторно доказывает
  anchor/owner/current manual hash и отклоняет stale/forged omission.
- [x] UI и JSON сообщают, что внешнее содержимое не проверялось.
- [x] Typecheck/build, 699/699 tests, включая 31 новый capture/scope/report
  тест; native-slot UI save/reopen и 36 layout checks прошли.
- [x] Оба старых неполных отчёта воспроизводятся без изменения verdict;
  hash пользовательского ZIP/manual r10 сохранён.
- [x] Синтетическая Plugin API симуляция воспроизводит повторяющиеся ID;
  bounded capture не читает payload, но находит изменение host opacity.
- [x] Offline reconstruction текущих r10 данных: 18 determinate checks;
  HUG/FIXED mismatch в обоих и padding top 50/40 во втором сохранены.
  Это не live acceptance и не переписанные исходные отчёты.
- [x] Live negative capture 16:23:15 UTC: 2/2 nodes matched, 18/18 checks,
  0 notExecuted/inconclusive. Найдены padding top 50/40 и Height HUG/FIXED;
  exact classification replay совпадает, текущий r10 ZIP/manual hash тот же.
  Внешнее содержимое Body явно вне проверки; нормативные правила не изменены.
- [x] Пользователь разрешил HUG: manual r11 исключает sizingVertical из
  locked layout selection целиком (domain FIXED/HUG не добавлен).
- [x] Live CC-CAP negative/reset принят на r11: 17:22:48 — padding 50,
  одно нарушение; 17:23:35 — padding 40, 17 пройдено. HUG сохранён в обоих,
  2/2 nodes matched, 17/17 checks, 0 notExecuted/inconclusive.
  Exact classification replay обоих и текущий r11 ZIP/manual hash совпадают.
- [ ] Выполнить отдельную Body-матрицу CC-B01–CC-B05; полный контракт
  CorporateContent этим capture/reset циклом не финализирован.
- [ ] Диагностика underlying Figma API ID anomaly при обязательном полном
  capture: причину alias IDs в API не считать автоматически исправленной.
- [ ] P1: расширение bounded capture на вложенные native SLOT и безопасные
  component-owned recursive checks — сейчас используется полный capture.

## Editor 0.2.70 · 30.09.2026

- [x] Явная policy `composition.content` для настоящего Figma SLOT;
  точный `slotContentId` подставляется из capture, не из названия слоя.
- [x] Уникальный native anchor, доказанный владелец и независимый reference
  подтверждают только границу. Потомки — внешнее содержимое; сам SLOT и host
  остаются component-owned. Section не обязателен и не проверяется автоматически.
- [x] Неопределённая граница policy-only правила даёт «Не выполнено»;
  stale marker, duplicate/foreign/unknown/truncated evidence не принимаются.
- [x] Совместимость compiled BOOLEAN/swap контрактов сохранена;
  user-authored CorporateContent ZIP r9 не изменён.
- [x] Typecheck/build, 668/668 tests, native-slot UI save/reopen и
  36 browser layout checks прошли. Новая live-приёмка не заявляется.
- [x] Все девять принятых CorporateContent grid/mode reports воспроизведены
  без изменения результатов; hash manual r9 в пользовательском ZIP сохранён.
- [x] Пользователь создал Body policy, reviewed manual r10; ZIP соответствует
  manual обоих новых отчётов 14:58:27/14:59:54, compiler errors = 0.
- [x] P0 capture topology guard/bounded route реализован в 0.2.71: оба live-снимка содержат 500 entries с всего
  тремя разными Figma ID; root ID повторяется 300 раз, в том числе у TEXT/FRAME.
  ID map перезаписывает parent/child links; capture truncated, baseline matched=0.
  Не повышать лимит и не превращать повреждённую топологию в успешную проверку.
  Добавлены диагностика повторов/циклов и остановка на доказанной внешней
  SLOT-границе; причина повторяющихся API identities пока не доказана.
- [ ] Live-приёмка CC-B01–CC-B05 после исправления capture. Оба текущих
  прогона неполные: 2 notExecuted + 18 human-review, exact replay совпадает.
- [ ] Отдельно разобрать разрешённые изменения direction/gap самого Body;
  не разблокировать всю auto-layout группу без решения владельца.
- [ ] Согласовать допустимость пустого Body и штатного видимого SwapMe;
  до решения не добавлять placeholder/presence запрет.

## Editor 0.2.69 · 30.09.2026

- [x] Длинный capability key не сжимает имя свойства до нуля: название и
  технический путь показываются на двух строках, unified selects не меняются.
- [x] Browser regression проверяет реальную ширину/видимость названия
  BackgroundPlate Color, а не только наличие текста в DOM.
- [x] Typecheck/build, 20 mode/capture tests, UI save/reopen и 36 layout checks.
- [x] Live-повтор: пользователь создал reviewed domain-правило, manual r9.
  Отчёт 13:44:51 обнаруживает modal-bg-alt (grey): 1 нарушение, 17 пройдено,
  18/18 checks исполнены; exact replay совпадает.
- [x] CC-BG матрица принята: grey/white page дают 0 нарушений, grey/white
  modal дают 1; grey после modal подтверждает reset. Четыре exact replay,
  18/18 checks; текущий ZIP r9 идентичен manual отчётов.
- [ ] Перед финализацией зафиксировать связь authored RuleID с исходным
  page-background-modes-only без дублирования.

## CorporateContent / Editor 0.2.68 · 30.09.2026

- [x] Коллекции проверяются по Figma API key; локальный collection ID не
  становится нормативным идентификатором capability.
- [x] `variable.modes.<collectionKey>` содержит только доказанный
  `resolvedVariableModes` mode. Default каталога и RGB не подставляются.
- [x] Именованный множественный выбор domain/exclusion modes; сохранение и
  повторное открытие проверены в браузере на синтетическом пакете.
- [x] Привычный `propertyDomain` → общий `one-of`; missing mode = unknown.
- [x] 652 теста и typecheck; UI save/reopen и 36 browser layout checks прошли.
  Неполные mode metadata не ломают capture/preview; импорт сохраняет текущие
  ручные правила/targets независимо от их количества.
- [x] Ручное правило CorporateContent и live-приёмка четырёх modes/reset
  завершены на user-authored manual r9, Editor 0.2.69.
- [ ] При недоступном resolved mode получить live case и проверить
  неполноту отчёта; не угадывать default.
- [ ] Body slot и самостоятельный Section остаются следующими блоками.

## CorporateContent / Editor 0.2.67 · 30.09.2026

- [x] Захват `layout.gridStyleId` и `layout.clipsContent` отдельно для
  проверяемого экземпляра и независимого эталона; `auto-layout@1` не менялся.
- [x] Ненормативная карта владельцев всех 32 старых RuleID в пакете
  CorporateContent; существующий manual не переписан.
- [x] Отсутствие grid/clipping факта или независимого baseline даёт unknown;
  646 тестов, typecheck и 36 browser layout checks прошли.
- [x] Live grid/clipping на manual r8: пять отчётов 11:44:53–11:51:36,
  нарушения 0 → 1 → 2 → 1 → 0; все 17 checks исполнены,
  повторный расчёт каждого отчёта совпадает.
- [ ] P1: различать diagnostics внешнего Body content и ошибки сопоставления
  собственных узлов; сейчас SwapMe/Content дают общий unmatched warning.
- [x] Свежий r8 capture содержит выбранный BackgroundPlate Color mode;
  в 0.2.68 ключ коллекции подтверждается API, отсутствие mode остаётся unknown.
- [ ] Проверить native SLOT Body и границу внешнего содержимого в live Figma.
- [ ] Отделить Section в собственный owner ID/пакет до приёмки его контракта.

## CorporateContent / Editor 0.2.66 · 30.09.2026

- [x] Нативный SLOT `Body` подтверждается по уникальному `slotContentId`; содержимое,
  заменённое пользователем, не сбрасывает независимый baseline корня и самого слота.
- [x] Athena `raw` одиночного компонента трактуется как группировочные метаданные,
  только если Figma не объявляет реальное одноимённое свойство.
- [x] Три снимка 09:14–09:15 пересчитаны с reference, реконструированным из
  контрольного снимка и структуры Athena: контрольный — без нарушений,
  изменение padding — 1 нарушение, заливка без токена — 1 нарушение.
- [ ] Live-приёмка в Figma после загрузки development-плагина 0.2.66.

## CorporateContent / Editor 0.2.65 · 30.09.2026

- [x] Старый ZIP с четырьмя документами возвращает сохранённые manual rules и
  компактную анатомию из compiled variant evidence; пустое дерево больше не мешает редактировать.
- [x] Совместный импорт старого ZIP и восьми Athena JSON выбирает authored CorporateContent,
  сохраняет его правила и полную анатомию. Новый экспорт переносит read-only Athena JSON.
- [x] Повторный импорт нового ZIP восстанавливает те же manual rules и дерево.
- [x] Live-проверка выявила два runtime-дефекта; исправлены в 0.2.66.

## AmountStyles r10 · 30.09.2026 — приёмка завершена

- [x] Последние 19 live captures приняты; 65 отчётов архивированы и воспроизведены.
- [x] R9→r10 без изменения семантики; Ready только для Figma, не frontend/production.
- [x] Editor остаётся 0.2.64; новые engine/UI capabilities для финализации не нужны.
- [ ] P1: диагностические warnings потомков swapped Addon показывать отдельно от проблем сопоставления собственных узлов.
- [ ] P1 DS suite: два старых Spinner-теста зависят от удалённых editor JSON; нужны постоянные fixtures.

Ниже — история. Старые live pending не переоткрывают принятую область r10;
ограничения evidence зафиксированы в AmountStyles `reports/acceptance.json`.

## AmountStyles r9 · 30.09.2026 / Editor 0.2.64

- [x] propertyForbidden: явные targetRoles, visibleOnly, строгая диагностика отсутствующих фактов.
- [x] Поле списка ролей в форме; несовместимые scope/boundary настройки отклоняются.
- [x] Capture text.decoration по диапазонам; никаких NONE по отсутствию данных.
- [x] Preset rule остаётся данными manual; новый Predicate Engine не создавался.
- [x] 638 tests, typecheck, 36 layout checks и реальный UI import/save всех constraints.
- [x] 342 Amount+Button tests, 46 archived replay; missing text facts остаются unknown.
- [ ] Live-приёмка AS-D01–AS-D10; старые reports не подходят для нового текстового факта.

## AmountStyles r8 · 30.09.2026 (Editor 0.2.63, без изменения кода)

- [x] Геометрия подключена данными: 8 propertyForbidden facts, propertyApplicability
  и component-owned boundary; Core Amount r5 остаётся pinned dependency.
- [x] 24 новых geometry tests в пакете, всего 322 package / 635 Editor; 44 exact replay.
- [x] r7 Paragraph live: native plus и hidden проходят, ручные подмены обнаружены.
- [ ] Live AS-G01–AS-G10; Operation на D/M Headline.
- [ ] Ручное оформление — context-only. Bounds/sizing не покрыты новым layout блоком.

## AmountStyles r7 · 29.09.2026 (Editor по-прежнему 0.2.63)

- [x] Operation подключён только данными: propertyForbidden/library-text и
  same-family-text continuity; новая реализация compiler/runtime не потребовалась.
- [x] Штатный Negative остаётся разрешённым API; hidden Operation не нарушает правило.
- [ ] Live-приёмка r7, затем геометрия и оформление пресета.

## AmountStyles r6 / Editor 0.2.63 · 29.09.2026

- [x] Приняты и архивированы 3 live r5 отчёта Addon.
- [x] Общий layoutConstraint at-most-line-height: явная TEXT role, selected-host reference,
  PIXELS/PERCENT, unknown при недоказанном эталоне, штатный compare/lte.
- [x] Поля оператора/роли в форме; отмена RuleID хранится в manual decision.
- [x] Однострочность исключена из активного AmountStyles по решению владельца.
- [ ] Live r6 height acceptance. Operation/геометрия/оформление — следующие блоки.

## AmountStyles r5 / Editor 0.2.62 · 29.09.2026

- [x] r4 live accepted: два отчёта, 0/8 нарушений, 12/12 узлов, точный replay.
- [x] Slot-api ownerTargetId: explicit local owner, validator и поле формы.
- [x] Native owner identity + уникальный BOOLEAN consumer, без переноса placeholder baseline.
- [x] AS-B08c: исправлены две проверки Addon; текстовые проверки уже работали.
- [x] 35 capture replay; legacy contracts без поля сохраняют поведение.
- [ ] r5 live Addon positive/foreign/hidden; шесть context-only правил отдельно.

## AmountStyles r4 / Editor 0.2.61 · 29.09.2026

- [x] Явная variantContinuity в manual targets, compiler gate и fail-closed runtime.
- [x] Связи редактируются в паспорте; изменение возвращает зависимые правила в draft.
- [x] TEXT Minor/Currency после Opacity variant changes восстанавливаются только
  по подтверждённому независимому host reference; actual bindings не подменяются.
- [x] 33 архивных capture, точный старый replay; 602 Editor + 272 пакетных теста,
  typecheck/build и 18 responsive + 18 dialog layout checks.
- [x] r3 live Operation=False/Opacity True/False проверены по двум отчётам.
- [x] Live r4 повтор принят; пакет остаётся Draft.
- [x] Gap Addon boundary (не TEXT targets) исправлен в r5; live-повтор ожидается.
- [ ] Шесть context-only правил отдельно.

## AmountStyles r3 / Editor 0.2.60 · 29.09.2026

- [x] Явный orderScope visible/structural в manual, compiler, validator и форме.
- [x] Структурные роли вычисляются заново; скрытые узлы учитываются, unknown
  topology не превращается в пустую последовательность или pass.
- [x] Hidden optional not-applicable не означает incomplete child contract.
- [x] 31 r2 report replay, 87/87 AS-B expectations; реальные opacity/style findings сохранены.
- [x] Typecheck/build, 585/585 Editor и 272/272 пакетных тестов. Completion version
  gate сохраняет точный replay старых compiled, включая Button BL07.
- [x] r3 live Operation=False и Opacity True/False — два отчёта 18:47.
- [x] Точные TEXT targets после Opacity variant changes — r4, без угадывания по имени.
- [ ] Отдельно: TEXT targets после Addon swap.

## AmountStyles r2 / Editor 0.2.59 · 29.09.2026

- [x] Typed bindingConsistency: fill-token/text-style, shared/selected-variant,
  явные роли и видимый текст, редактирование всех полей в форме.
- [x] Доказанные ключи, диапазоны, кэш разрешения локальных Variable ID;
  недоступные ID и отсутствующая матрица не превращаются в pass.
- [x] Reference Text Style извлекается из pinned Athena, не из actual snapshot.
- [x] Три правила AmountStyles исполняются обычным Predicate Engine.
- [x] Typecheck/build и offline QA: 575 тестов Editor (34 новых), 272 теста пакетов.
- [x] Live-приёмка трёх binding rules AS-B01–AS-B08: 87/87; шесть P0 пресета отдельно.

## AmountStyles / Editor 0.2.58 · 29.09.2026

- [x] Общий dependency resolver: child path от root без начального разделителя.
- [x] Standalone child определяется по componentKey; отсутствие set key не является
  совпадением, ambiguous и foreign representation отклоняются.
- [x] Общий package builder включает pinned read-only dependency в ZIP и compiled.
- [x] Явная граница `metadata.publicRepresentationBoundaryVersion: 1` ограничивает выбор root в Editor:
  внутренний Operation остаётся facts, но не становится самостоятельным каталогом.
  Старые частичные пакеты без этого поля сохраняют авторинг соседних представлений.
- [x] Typecheck/build и 541/541 регрессий Editor; 272/272 пакетных тестов Amount/Button,
  включая 6 для AmountStyles. Live-приёмка этим не подменяется.
- [ ] Live AmountStyles → Amount: проверить effective host context и scope targets.
- [ ] Preset-wide token/style equality, Addon line-height, Operation и layout —
  отдельный P0; r1 остаётся Draft, неисполненные правила не превращаются в pass.

## Amount r5 принят / Editor 0.2.57 · 29.09.2026

- [x] Компонентный Figma scope Ready:31 reviewed/47 IR,3 policy-only,0 excluded.
  Editor/runtime не изменены; только review-статусы manual и регрессионные свидетельства.
- [x] Шесть live r4 JSON воспроизводятся точно;32 архивных снимка/1 666 evaluations
  сохраняют r4→r5 поведение. Amount/authoring/reports/acceptance.json фиксирует границы.
- [x] Частичный detach не является ручным блокером: воспроизводимость операции в
  Amount не подтверждена. Synthetic range defense остаётся внутренним автотестом.
- [x] Остальные граничные сценарии приняты с явным автоматическим покрытием,
  не выдаются за новые live-отчёты. Hub/code/pattern/production остаются отдельно.

## Text Style binding / Editor 0.2.57 · 29.09.2026

- [x] Общая typed constraint `styleBinding`, pinned catalog evidence, UI catalog
  field, compiler gate при отсутствии/неоднозначности facts, обычный Predicate Engine.
- [x] Независимый range capture `textStyleEvidenceV1`; partial detach и локальный
  custom style не проходят. Привязка подтверждается ключом, не именем/шрифтом.
- [x] Сохранены legacy appearance и baseline; неполный capture → unknown.
- [x] Amount r4: все старые нарушения сохранены, два пропуска r3 воспроизводимо пойманы.
- [x] Приёмка закрыта r5; TS01/TS03/TS05 подтверждены live, TS02 — replay/автотесты;
  TS04 не обязателен вручную. См. итоговую матрицу Amount/authoring/TESTCASES.md.
- [ ] Распространение нормы на другие компоненты — отдельное решение владельца,
  не автоматическая глобальная политика.

## Amount ownership / Editor 0.2.56 · 29.09.2026

- [x] Общая token-binding capability: каждая активная заливка/обводка и gradient stop,
  а не совпадение RGB или наличие одного токена на всём слое. Unknown не даёт pass.
- [x] Типизированные semantic facts вложенного свойства и contextDomains; Custom
  не получает ограничения формата/длины/значения. Standard Currency берёт текст
  из pinned selected-library variant, без смены общего contextual baseline.
- [x] Native BOOLEAN anchor связывает swapped/renamed slot root. Только явный
  `contentOwnership: external` исключает содержимое открытого слота из контракта
  родителя. Корень слота, видимость, порядок и запрет placeholder проверяются.
- [x] Поля manual редактируются в UI, JSON ошибки обрабатываются до сохранения,
  ZIP roundtrip и исторические результаты отделены от нового нормативного r3.
- [x] Восемь live r3 приняты, r4 закрыл Text Style; итоговая приёмка r5 сохраняет
  различие live и автоматического покрытия. Остаточных P0 текущего scope нет.
- [ ] Повторное применение общего token-binding правила к другим компонентам —
  отдельное решение владельца и регрессия; не включать глобально автоматически.

## Amount bindings / Editor 0.2.55 · 29.09.2026

- [x] Общий resolver Figma property identity: raw Name#ID не изменяется; короткое
  имя допускается только при однозначном типизированном API. Учитываются определения
  независимого reference. Stale explicit ID, collision и unknown не дают false/pass.
- [x] Semantic facts и variant availability используют один resolver; legacy exact
  bindings сохраняют прежние evidence/hash, исторические Button/Spinner replay проходят.
- [x] После независимой проверки v4 host variant восстановить только semantic target
  его корня. Дочерние роли и непроверенные/чужие границы не восстанавливаются.
- [x] 18 Amount snapshots:14 корректных полностью проверены,2 ошибки обнаружены
  при полной проверке,2 подмены остаются безопасно неполными. Контракт r2 неизменен.
- [x] Typecheck /473 Editor /244 Button /27 доступных Spinner /19 Amount tests.
  Новые29 Editor regressions включают collisions, unknown/type errors, повреждённые
  references, сохранение baseline/permissions и JSON export/replay. Синтетические
  Amount fixtures больше не удаляют #IDs и используют instanceIdentityVersion=1.
- [ ] Короткий live smoke на0.2.55 по Amount TESTCASES; не закрывать весь Draft.
- [ ] P1: scoped remap A17A/B без подмены identity совпадением имени/порядка.
- [ ] P1: старые spinner-gradient-acceptance/spinner-rule-review ссылаются на удалённые
  пользовательские JSON (09:37 и06:24 27.09). Вернуть проверяемые архивные fixtures,
  если они доступны; не восстанавливать результаты по памяти и не отмечать suites passed.

## Amount r2 / Editor 0.2.54 · 29.09.2026

- [x] Исправить standalone identity Amount и Major в manual, без фиктивного set.
- [x] Общий matching для capture/variant availability/semantic target visibility;
  missing и пустой set у одиночного компонента эквивалентны, unknown не становится pass.
- [x] Compiler gate `STANDALONE_COMPONENT_AS_SET` по pinned generated evidence.
- [x] Реальный ZIP в plugin VM: preview и selection capture; 19 Amount regressions,
  444 Editor /244 Button tests и typecheck. Нет отдельного Amount-интерпретатора.
- [x] R1 архивирован, пакет r2 пересобран, README/TESTCASES актуализированы.
- [x] Реестр обновлён и проверен чтением:109 ячеек,327 metadata fields сохранены.
- [x] Live-импорт подтверждён18 отчётами; выявлены и отдельно исправлены binding gaps
  в0.2.55. Live-приёмка нового расчёта ожидается; Amount остаётся Draft.

## Amount r1 / Editor 0.2.53 · 29.09.2026

- [x] Новый isolated manual package Amount, 23 source rules / 35 RuleIR,
  три policy-only разрешения, 23/23 generated structures. Не Ready.
- [x] Общая coverage-диагностика для скрытой цели при явно ложном условии корня.
  Использован общий Predicate Engine; target-local/unknown/ambiguous/truncated
  случаи не маскируются. Основной compiled IR и production контракты не менялись.
- [x] Отдельные regression tests для fallback и 16 Amount package tests.
- [x] Финальная сборка и typecheck:441 Editor /244 Button /16 Amount tests passed.
  Manual r1 и ZIP roundtrip сохранны. Реестр:25 строк правил,4 строки леджера,
  Core Predicate Draft;438 ячеек и360 формат/validation-сопоставлений проверены.
- [ ] Live-приёмка одной матрицей; Addon boundary, внутренние styles/tokens,
  Currency custom-text restriction — см. Amount/authoring/BACKLOG.md.
- [ ] Не переключать старый Amount runtime-index до отдельного migration gate.

## Завершено · Button r31 Figma component Ready · 29.09.2026

- [x] Финальное ревью всех22 RuleID:16 draft→reviewed,6 reviewed сохранены.
  Для каждого есть связь с QA и regression; норму, scope/constraints не меняли.
- [x] Удалена только неиспользуемая цель target.spinner (0 ссылок). Настоящие
  dependency bindings left/right и закреплённый Spinner r8 сохранены.
- [x] Общий compiler:60 RuleIR,0 issues/excluded/context-only;3 policy-only разрешения.
  Ready только для объявленной component-scoped Figma-валидации, published=false.
- [x] 438 Editor/244 Button tests, typecheck, schemas, ZIP roundtrip.115 архивных
  снимков/32 062 результатов r30/r31 совпадают; source/child facts неизменны.
- [x] Архив r30 сохранён; input ZIP r31 пересобран, README/TESTCASES актуализированы.
  QA:Button/qa/final-readiness-r31.2026-09-29.json. Редактор остаётся0.2.52.
- [x] Реестр:22 строки правил и11 drift-строк актуализированы; Core Predicate Ready.
 167 изменённых/475 соседних ячеек иmetadata642 сверены чтением. Drift остаётся
 «Найдено»; visual QA поAPI, native Google UI не проверялся.
 Итог:Button/qa/final-release-r31.2026-09-29.json.
- [ ] Следующий самостоятельный этап: Hub projection и устранение drift по шаблонам.
- [ ] P1: объединение двух карточек ControlBlur, сохраняя оба RuleID/engine evidence.
- [ ] Front adapter/генерация, pattern runtime и production delivery — не закрыты Ready.

Ниже историческая приёмка r30. Новые live-прогоны ради статуса r31 не нужны;
подключать актуальный ZIP после сохранения изменений текущей сессии.

## P0 · Финальные Button blockers: inverted palette и ControlBlur

Статус: **29.09.2026 — матрица Spinner принята владельцем; функциональный P0
ControlBlur подтверждён16 fresh r30/Editor0.2.52 JSON**. Spinner r8/Athena facts
сохранены, r29 архивирован. Контракт в целом ещё Draft.

- [x] Inverted-матрица утверждена для D/M32–72, оба слота: Accent True/True,
  Primary False/False, остальные True/False. Typed dependency cases используют
  явный semanticApi context; пересекающиеся/невалидные условия отвергаются.
- [x] Финальное уточнение ControlBlur: **библиотека верна, она эталон**. Общая
  disabled-матрица отменена, право specification=false отключать blur не вводится.
  Сравнение с независимым baseline конкретного componentKey включает radius и
  stable style identity. Missing effect details →unknown, не selector-empty/pass.
- [x] Два прежних RuleID;22 sources/60 RuleIR,0 context-only,3 policy-only.
  Общий compiler/Predicate Engine, без нового runtime.438 Editor/238 Button tests,
  typecheck, схемы, ZIP и immutable r29 compile/replay parity проходят.
- [x] Матрица Spinner принята владельцем: «матрицу по спиннеру принимаем».
  Новых live JSON нет, BI01–BI11 сохранены как регрессионный план; повтор не требуется.
  Запись: Button/qa/spinner-matrix-r30-owner-acceptance.2026-09-29.json.
- [x] [ControlBlur-борд](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13117-65262)
  создан в той же странице/секции:16 экземпляров CB01–CB15, включая CB07A/B.
  11 библиотечных контролей и5 намеренных ошибок. Проверены componentKey,
  effects/style identity и screenshot; старые кейсы сохранены. QA-манифест:
  Button/qa/control-blur-test-cases.2026-09-29.json — подготовка fixtures;
  последующая live-приёмка хранится отдельно ниже.
- [x] README/TESTCASES обновлены; manual/compiled/ZIP остаются прежними r30.
- [x] Реестр:Правила1826/1830,Леджер56/60/62,Core Button Draft.37 изменённых и
  200 соседних ячеек сверены, metadata237 сохранены; Google UI render не выполнялся.
- [x] Проверены16 свежих JSON:11 ожидаемых compliant,5 violations; все complete,
  0 not-executed/inconclusive,247/247 matches,0 capture warnings.4 482 engine
  evaluations и Editor/details exact replay. Ни одного постороннего нарушения;
  CB08/09/12 дополнительно отмечены общим visual-style (тот же effect edit).
  QA и immutable gzip:Button/qa/control-blur-r30-live-review.2026-09-29.json.
  Повтор CB/Spinner сейчас не требуется; manual/compiled/ZIP не менялись.
- [x] Финальное ревью r31: Figma component Ready; production Hub/index не меняли.
- [ ] Перегенерировать Hub prose по принятой норме; drift56/60/62 сохраняется
  «Найдено». Static semantics в63 — отдельный P1, pinned Spinner не репинить.

### P1 · Одна правка эффекта — одна карточка диагностики

- [ ] CB08/09/12: groupEvaluationDetails оставляет2 карточки на корне —
  `appearance.effects` (general visual-style, error) и `appearance.effectDetailsV1`
  (ControlBlur, warning). Сгруппировать доказанно одну правку, сохранив обе причины,
  RuleID и старший severity; не удалять engine evaluations и не менять норму.
- [ ] Регрессия: удаление/добавление blur →1 карточка с2 источниками; radius/style
  identity →1 карточка; независимые эффекты/узлы не схлопывать. Replay старых JSON
  должен остаться точным. Реализация пока не выполнялась.

### Финальное ревью Ready — не подменять полной проверкой одного сценария

- [x] Проверены16 source rules по накопленной приёмке; карта оснований сохранена.
- [x] target.spinner оказался неиспользуемой старой целью: удалён, не remap/resolved.
  Dependency bindings/r8 сохранены; parity на115 снимках, включая Loading, пройдена.
- [x] Компонентный Ready отделён от publication/Hub/frontend/pattern readiness.
  Production-публикация не выполнялась.

### Исторический план до уточнения владельца (не текущая норма)

Ниже сохранено состояние read-only исследования до решения, не текущие блокеры.

- [x] Read-only Figma:1056 вариантов четырёх Button sets; ControlBlur key
  `01c83f6e3a7dcc11f03eb6e99064b356ba9ac1a9`, radius80 подтверждены.
- [x] Inverted D/M Size56: проверены шесть View и палитры Spinner по stable token keys.
  Предложение: Accent True/True, Primary False/False, остальные True/False.
  Экстраполяция на32–72 и оба слота требует подтверждения владельца.
- [ ] После подтверждения сохранить прежний source RuleID, добавить typed
  surface+View cases в общий compiler, не Button-specific runtime. Обычная матрица
  и собственные инварианты Spinner остаются независимыми.
- [ ] Golden tests:Views×Sizes×D/M×left/right, неверные Inverted/Static,
  одинаковый RGB с другим token family, неизвестная identity/View/surface,
  скрытый слот, обычная матрица, intrinsic Spinner, Loading/width parity.
- [x] Найден conflict blur: в Hub default Secondary/Outlined/Transparent,
  в Figma Secondary + Disabled Accent/Primary; Outlined/Transparent без эффекта.
  Два enabled Mobile inverted Primary72 Rectangular тоже с blur:
  `42:45647` и `42:45679` (SingleIcon False/True). Это факты, не одобрение нормы.
- [ ] Согласовать допустимый blur domain и узкое baseline-исключение для явной
  спецификации; expected false/unset различаются. Не сопоставлять ControlBlur
  с произвольным BACKGROUND_BLUR. Затем общий compiler → Predicate Engine.
- [ ] После реализации:пересборка ZIP/compiled/projections, offline parity и
  новые изолированные Figma-кейсы с отдельной live-приёмкой.
- [x] Дополнительный drift:Static фактически выбирает Interface Static вместо
  Interface Dynamic; «статичное кольцо» в Spinner/Hub не описывает этот смысл.
  Отдельно уточнить описание без изменения pinned revision и анимационных обещаний.
- [x] Реестр синхронизирован:Правила1826/1830,Леджер56/60/62/63,Core Button Draft.
  Readback:51 целевая ячейка,72 соседние сохранены;native metadata всех123 сохранены.
  Native Google UI render не выполнялся;format/validation проверены через API.

Доказательства и ограничения:
`design-system_ab/experiments/web-core/core/Button/qa/final-blockers-evidence.2026-09-29.json`.
Новые нормативные правила, production Hub и библиотечные компоненты не менялись.

## P0 · nowrap и применимость к скрытому тексту

Статус: **принято владельцем 29.09.2026 — «считай принято»; Editor0.2.51 / Button r29**.
P0 реализации закрыт по подтверждению пользователя и ранее пройденным offline-гейтам.
Новых live JSON нет; покейсовую live-приёмку NW01–NW09 не заявляем. Button остаётся Draft.

- [x] Сверены `ds-ai-hub/core/web/components/button/bridge.md` (§nowrap),
  `figma/cookbook.md` и `figma/snippets.md`. `nowrap=true` описан через HUG и
  WIDTH_AND_HEIGHT. Рецепт `nowrap=false` с FILL относится к узкому контейнеру,
  а не ко всем кнопкам. Не добавлять сюда продуктовые/канальные паттерны.
- [x] Общая диагностика context-only правил учитывает явный `visible-target@1`.
  Применимость вычисляет Predicate Engine; нет Button-specific фильтра результатов.
  Подтверждённо скрытая/отсутствующая цель → N/A; unknown остаётся pending.
- [x] Guard запрещает скрывать presence/quantity/visibility правила, включая
  некорректный импорт. Context-only не становится исполняемым от наличия фактов.
- [x] 16 целевых тестов: Widget, неизвестная видимость/identity, ambiguity,
  неполный снимок, отсутствие opt-in, некорректные ограничения и 4 сохранённых
  Loading/SingleIcon JSON. Legacy engine и Editor replay точные; при opt-in
  в копии manual исчезает только лишний pending nowrap у скрытого Loading-текста.
  Intrinsic/Spinner verdicts сохранены. Это offline QA, не live-приёмка.
- [x] `npm run validate`: typecheck и426/426 Editor tests. SHA manual/compiled/ZIP
  сверены с принятой r28; нормативные артефакты не затронуты.
- [x] Владелец подтвердил: false разрешает перенос, FILL требуется только при
  явно выбранной ограниченной ширине. Это независимый `validationContext`, не
  новый prop Button; actual/default не подставляется. Конфликт с block/textResizing
  не замалчивается и не решается приоритетом одного правила над другим.
- [x] Сохранён прежний RuleID; общий configurationMapping компилирует2 случая
  в существующий Predicate Engine. True → HUG/Auto width, false+контекст true →
  FILL/Auto height/AL parent. False+контекст false → N/A, unset → unknown.
  Скрытый/отсутствующий текст → N/A; unknown visibility/identity не считается скрытым.
- [x] r29 пересобран:22 RuleID/59 RuleIR,1 context-only blur. Input ZIP и
  экспериментальные проекции включают validationContext. Athena facts/Spinner r8
  сохранены, r28 архивирован. Паттерны и production Hub не менялись.
- [x] 432 Editor/233 Button tests; desktop/mobile, Hidden/Loading/SingleIcon,
  unknown/stale context, baseline и Spinner parity, generic Widget, import/export,
  строгие JSON-схемы, UI passport/mapping roundtrip,18 layouts+18 dialogs.
  Исправлено прежнее отставание схем по transition/targetId/descendants без изменения норм.
- [x] Правила1829 / Леджер60 / Core Predicate Draft синхронизированы;
  readback17 изменённых и17 соседних ячеек, native metadata34 ячеек сохранены.
  Drift статуса «Найдено» остаётся открытым; production Hub не менялся.
- [x] Приёмка владельцем без новых JSON; повтор NW01–NW09 сейчас не требуется.
  Инструкция сохранена как регрессионная, не как доказательство live-прохождения.
  Запись: Button/qa/nowrap-r29-owner-acceptance.2026-09-29.json.
- [ ] Отдельный follow-up: проецировать уточнённую контекстную семантику в Hub по
  шаблонам: nowrap=false/snippets не универсальное FILL; clipsContent внешнего
  контейнера не безусловный invariant Button. Drift остаётся в Леджере60.

## P0 · Baseline-исключение не должно требовать role у посторонних узлов

Статус: **закрыто 29.09.2026: Editor0.2.49 / Button r28, offline и live TL10B приняты**.

- В Button r28 / Editor0.2.48 оба Loading-прогона имеют лишний human-review
  `internal-sizing-locked.1.1` у вложенного LeftAddon (preview:2). Actual=HUG,
  effective baseline=HUG; semantic.role отсутствует после смены вложенной композиции.
- `compiler.ts:606–610` компилирует exceptConfiguration в none-of semantic.role
  для каждого потомка. Missing role → unknown вместо baseline-проверки обычного узла.
- [x] Исключать только доказанно сопоставленные цели Text/Label/Hint; не делать
  semantic.role обязательным для остальных owned nodes. Не подставлять role по имени,
  не превращать unknown в pass, сохранить закрытое поведение при неоднозначности targets.
- [x] Golden-регрессия: TL10B без role, такой же узел с реальным sizing override,
  настоящий Text/Label/Hint, ambiguous/missing mappings и nested boundaries.
- [x] Сохранены15 точных replay (2047 evaluations); после новой компиляции меняются
  только2 ложных unknown у LeftAddon. 410 Editor/210 Button tests; generic Widget,
  целевые ID, missing/ambiguous/truncated, настоящие overrides и Spinner boundaries.
- [x] Chromium:18 layouts+18 dialogs без overflow. Реестр Правила1828/1839,
  Леджер60,Core Predicate Draft обновлён;15 ячеек проверены чтением,
  114 соседних ячеек и native metadata129 ячеек сохранены. Нормативный drift
  не добавлен: Hub bridge/cookbook совпадают с сохранёнными источниками.
- [x] TL10B принят по JSON23:40:40(specification,block=false)/23:40:55(audit),
  root13100:90813. LeftAddon HUG/HUG compliant без semantic.role; скрытый текст N/A.
  708 engine evaluations и Editor/details exact replay;36/36 matches,0 warnings.
  В каждом прогоне Spinner:100 compliant+68 N/A,0 violations/unknown. Старый compiler
  на этих же снимках даёт только прежний LeftAddon unknown — единственный verdict delta.
  Архив gzip/SHA и QA: Button/qa/loading-r28-editor-0.2.49-live-review.2026-09-29.json.
  Полнота остаётся false: width без before-state; additionally nowrap в specification.
  Эти пункты не объявлены пройденными. Manual/compiled/ZIP не менялись; Draft остаётся.
- [x] Разобраны новые JSON23:36:32/23:36:54 на0.2.49: оба **TL10A SingleIcon**,
  root13100:90798,7/7 matches,0 warnings; audit/specification(block=false) полны.
  310 engine evaluations и Editor/details exact replay; originals gzip/SHA сохранены
  в qa/fixtures/single-icon-r28-editor-0.2.49. Принимается SingleIcon-регрессия,
  не Loading: Spinner inactive; последующая отдельная Loading-приёмка приведена выше.
- Исходники и доказательства: Button/qa/text-layout-live-review.2026-09-29.json,
  qa/fixtures/text-layout-r28; результат патча — qa/configuration-exception-fix.2026-09-29.json.
  Manual r28/ZIP/generated facts/Spinner byte-identical; compiled пересобран общим
  compiler. Архив r28-editor-0.2.48 сохранён. Engine и production runtime не менялись.
- Отдельный nowrap P0 должен корректно исключать подтверждённо скрытый Text:
  сейчас в Loading specification context-only диагностика оставляет applicability unknown.

## P0 · Согласованный текстовый layout Button · r28 / Editor0.2.48

Статус: **согласованные текстовые профили и их baseline-исключение приняты; TL10B подтверждён на0.2.49**.

- [x] Решение владельца «верно»: узкое разрешение согласованного Hug/Fill для
  Text/Label/видимого Hint. Fill → CENTER+HEIGHT у текстов; Hug → WIDTH_AND_HEIGHT
  и alignment независимого baseline. Продуктовых условий в этой норме нет.
- [x] Только2 прежних RuleID изменены. Manual — SoT; generated facts и Spinner r8
  неизменны. r27 manual/compiled/ZIP архивированы до правки.
- [x] Общий `configurationDomain` и проверяемая ссылка `exceptConfiguration`;
  недопустимое/неполное исключение блокирует компиляцию baseline-проверки,
  а не молча ослабляет её. Predicate Engine не менялся.
- [x] Intrinsic audit проверяет домен без code input; specification дополнительно
  проверяет независимый enum textResizing. Unknown и скрытая цель различаются.
- [x] UI: enum «Ширина текстовой области», typed JSON профилей и исключения,
  сохранение/import/export без потери constraints. Нет вывода ожиданий из actual.
- [x] 408 Editor/206 Button tests; generic Widget и desktop/mobile Button;
  Loading/SingleIcon, скрытый Hint, missing facts/input, stale identity,
  защита вертикального sizing/padding/styles/Addon, старый replay.
- [x] Chromium authoring/validation/report,18 layouts+18 dialogs. Компоновка
  сохранена; controls/footer доступны на проверенных размерах.
- [x] Реестр Правила1828/1839,Леджер60,Core Predicate Draft:26 ячеек readback
  verified;88 соседних и native metadata114 ячеек сохранены. QA в Button/qa/text-layout.
- [x] Получены15 TL JSON: текстовые результаты ожидаемы,2047 engine evaluations
  и Editor/details exact replay;226/226 matches,0 capture warnings. Один padding
  остаётся отдельным нарушением; лишних baseline violations у текста нет.
- [x] Закрыта scoped серия текстового layout после live-ретеста LeftAddon в TL10B.
  Пакет22 RuleID/57 RuleIR остаётся Draft; nowrap/blur не реализованы.
- [x] 29.09: подготовлены13 реальных TL-экземпляров в прежней Figma-секции Button
  (board13100:63800): desktop/mobile, Hug/Fill, отдельные нарушения, скрытый Hint,
  independent specification input, SingleIcon/Loading. Ключи/настройки и screenshot
  проверены; manifest в Button/qa/text-layout-test-cases.2026-09-29.json.
  Старые кейсы/мастера сохранены. Это fixtures, не пройденная live-приёмка;
  для полной серии были запрошены15 JSON (получены, результат выше).
  Manual и production runtime при подготовке/разборе отчётов не менялись.
- [ ] Следующий P0: отдельное правило nowrap и контекст узкого контейнера.
  `nowrap=false` не равно «всем кнопкам обязательно Fill». Blur также остаётся gap.
- [ ] Button_Inverted Spinner palette: отдельное решение владельца;
  обычную матрицу не копировать. Паттерны применения не подключены.
- [ ] P1: заменить экспертный JSON профилей/исключений визуальной таблицей
  targets × facts без нового ручного источника.

## P0 · Аудит компонента / соответствие спецификации · r27, Editor0.2.47

Статус: **реализовано; локальная приёмка пройдена, работа подтверждена пользователем 28.09.2026**.

- [x] Manual applicability.validationMode=specification у4 bridge mappings;
  прежние22 RuleID/constraints/55 RuleIR, generated facts и Spinner r8 сохранены.
- [x] Default-аудит не требует code props. Проверка по спецификации дополнительна,
  не отключает intrinsic правила. Отсутствие ожидания не равно false/pass.
- [x] Общий compiler → условия существующего Predicate Engine. Context-only
  остаются package gaps, но не загрязняют аудит; JSON явно not-requested.
- [x] Editable applicability, переключатель проверки, сброс inputs/results,
  immutable validationRequest в отчёте, versioned opt-in и legacy exact replay.
- [x] BI01–BI05 r26 приняты технически:415 engine checks, Editor/details exact;
  originals gzip/SHA в Button/qa/fixtures/block-r26, r26 package в history.
- [x] 405 Editor и192 Button tests; parity всех81 не-block evaluations на каждом
  из5 снимков. Opacity нарушения и truncated/unknown gaps не скрываются.
- [x] Chromium: режимы/download/сброс/authoring scope;18 layouts+18 dialogs;
  screenshot проверен. Реестр Правила1827–1830,Ledger60,Core Predicate Draft:
  34 ячейки readback verified,45 соседних и native metadata неизменны.
- [x] Пользователь подтвердил работу: «всё ок, работает». Это smoke-приёмка
  разделения режимов, не подтверждение каждого AS01–AS06 отдельным JSON.
- [ ] Покейсовая JSON-приёмка AS01–AS06 пока не зафиксирована. Сценарии сохранены
  для регрессии; пакет Draft/unpublished, не Ready.
- [ ] Реализовать textResizing/nowrap/blur conformance и согласованные исключения
  baseline. Текущий аудит полон только относительно реализованных intrinsic норм;
  известный drift допустимых текстовых overrides с Hub остаётся в Ledger60.
- [ ] При первом дочернем контракте со specification-only mappings расширить
  dependency coverage: отдельная спецификация ребёнка, без наследования ожиданий родителя.
- [ ] Button_Inverted Loading palette остаётся needs-confirmation; паттерны не подключены.

Новая серия заменяет BI06/07 как текущую инструкцию. Не просить API key и не
создавать дополнительный интерпретатор или параллельный нормативный источник.

## P0 · Independent expected input / block · r26, Editor0.2.46 (2026-09-28)

Статус: **реализовано, локальные гейты пройдены; BI01–BI07 ждут live JSON**.

- [x] Общий manual `semanticApi[].validationInput` и opt-in runtime: boolean input
  на корне, без вывода из actual/default. Intent имеет manual hash и subject identity.
- [x] Прежний block RuleID →2 Predicate Engine assertions: FILL и Auto Layout parent.
  false не запрещает Fill/не требует Hug; unset/stale/invalid→unknown. Canvas parent
  NONE отличим от недоступного родителя. Generated facts и Spinner r8 не меняются.
- [x] Компактный disclosure в UI; ввод заблокирован при capture, сбрасывается при
  смене instance/manual/пакета, не хранится в сессии. Отчёт скачивает intent/evidence.
  Диагностика неизвестного ожидания понятна; stale async result не применяется.
- [x] Принятый r25 manual/compiled/ZIP архивирован с SHA; исторический replay exact.
  Сохраняются93 прежних intrinsic evaluations; добавлены2 block assertions.
- [ ] Принять BI01–BI07 из Figma; r26 не повышать из Draft по одним synthetic tests.
- [ ] textResizing/nowrap/allowBackdropBlur: typed inputs и точечное согласование
  с внутренними baseline-запретами. Не выводить требования из проверяемого значения.
- [ ] **Button_Inverted + Loading:** согласовать View→Spinner.Inverted/Static у
  владельца. Decision needs-confirmation уже в manual/compiled. Это intrinsic
  composition, не pattern. Обычную матрицу colors=default не расширять молча.
- [ ] Общий readiness/generation gate для unresolved decisions: сейчас такой
  decision сам по себе не добавляет runtime assertion/coverage count. До решения
  inverted+Loading не считать покрытым для генерации по контракту.

22 component rules/55 RuleIR;3 context-only mappings. Pattern handoff не подключён.
Проверено:398 Editor /184 Button tests,typecheck; Chromium input/report/ownership,
18 responsive layouts и18 dialogs. Registry Правила1826/1827,Леджер56/60,
Core Predicate Draft:30 cells readback verified,33 neighbors/native metadata intact.
QA и текущий маршрут: Button/qa/block-expected-input.2026-09-28.json и README.

## P0 · Button: component-only r25 и будущий паттерн (2026-09-28)

Статус: **физический перенос и live-приёмка TR01–TR03 завершены**.
Editor0.2.45 не менялся. Button r25/Draft:22 intrinsic правила/53 RuleIR;
Spinner r8 и generated facts прежние. Новый PatternContract/runtime пока не реализован.

- [x] По подтверждению владельца перенесены все5 записей: desktop-hint-restricted,
  desktop-safe-variants, mobile-hint-only-size-56, button-group-pattern-delegated,
  text-follows-editorial-pattern. Единственный активный ручной источник для них:
  design-system_ab/experiments/patterns/buttons-and-button-groups/rules.manual.json.
- [x] Прежние RuleID, constraints, applicability, status и provenance сохранены.
  Два controlPorts и два продуктовых решения перенесены. Редакционная политика
  остаётся ссылкой на своего владельца, её нормы не скопированы.
- [x] В Button нет нормативных копий, локальных делегаций или pending-заглушек
  этих пяти правил. Хранение legacy evidence/history не включает их в runtime.
- [x] Сборщик проверяет explicit transfer manifest: пропажа, duplicate owner,
  неправильный owner/path останавливают сборку. Athena ID считаются сохранёнными
  только при наличии записи у нового владельца; crosswalk публикует путь/SHA.
- [x] r24 manual/compiled/ZIP сохранены в history/r24-editor-0.2.45; старые JSON
  продолжают воспроизводиться точно. Product scopes ab/alfa-business не склеены;
  needs-confirmation не повышен до confirmed.
- [x] Переимпорт r25 через Editor не возвращает legacy usage rules из evidence.
  Browser проверяет22/0 owners,53 RuleIR, отсутствие старого Hint-rule.
- [x] 172 Button и390 Editor tests/typecheck прошли. На обоих OW01/02 snapshots
  все93 intrinsic verdicts/traces прежние; внешняя Hint evaluation удалена.
  Синтетический opacity override по-прежнему даёт violation независимо от Product.
- [x] Live TR01–TR03,15:01–15:02 UTC: тот же instance12877:55697 с видимым Hint.
  AB/AO:0 violations,93 intrinsic verdicts/trace одинаковы. В AB opacity50% даёт
  2 assertions →1 карточку,91 прочих результатов прежние.48/48 matches;
  no warnings/inconclusive;3 component pending,usage=not-evaluated.279 engine
  evaluations и Editor/details replay exact. Добавлено6 regressions,178 Button
  tests проходят. QA usage-transfer-live-review и immutable gzip originals.
  Manual/compiled/ZIP/Editor не менялись; повтор TR01–TR03 не требуется.
- [ ] Следующий компонентный P0: независимый expected input и наблюдаемые facts
  для block/textResizing/nowrap/allowBackdropBlur. Actual Fill не доказывает сам себе
  требование block=true. Согласовать точечные исключения baseline для текстовых mappings.
- [ ] Будущий паттерн: подтвердить scope/значения продуктовых ограничений, binding
  к API Button и внешнему контексту, authoring source → общий compiler → единый
  Predicate Engine. Проверить missing/unknown policies, конфликты и отсутствие
  двойного исполнения; затем подключать runtime и производную документацию Hub.
- [ ] Полная миграция Hub/production не завершена. Ledger61 и496 остаются Найдено.
  Readiness Button не означает проверку применения; отсутствие правила вне
  загруженного пакета не считается pass и не детектируется этим component-only MVP.

Реестр27 конкретных RuleID, Core Predicate Draft/date и Леджер61/496 обновлены:
171 ячейка подтверждена readback,372 соседние ячейки и native formats/validation
сохранены. QA: Button/qa/usage-transfer.2026-09-28.json.
Не создавать второй runtime/interpreter только ради временного handoff source.

## P0 · Имя вложенного instance обнуляет сопоставление всего дерева — 0.2.44, приёмка Addon/HUG/FILL/FIXED завершена (2026-09-28)

12:07–12:09 UTC: четыре JSON на 0.2.44 (HUG, HUG, FILL, FIXED). Во всех 18/18
matches, 168 проверок Spinner r8, нет violations/warnings/inconclusive. Exact replay
1404 engine evaluations, Editor/details подтверждён; добавлены 6 live-регрессий.
Архив и итог: Button/qa/instance-identity-live-review.2026-09-28.json.
Семь not-executed остаются ожидаемыми; Button r23 всё ещё Draft. Имя Spinner
в этих JSON не менялось — это не приёмка одновременного переименования обоих узлов.

Свежие sizing-пробы11:32–11:36 UTC, Editor0.2.43 / Buttonr23. Это диагностика,
не изменение контракта или runtime. QA: Button/qa/sizing-probes-live-review.2026-09-28.json.

- [x] Шесть JSON проверены:1215 engine evaluations, Editor coverage/details — exact
  replay; исходники архивированы с SHA в Button/qa/fixtures/sizing-probes-r23/.
- [x] Три негативных кейса приняты: root height FIXED/FILL и frame LeftAddon width
  FIXED дают по одному правильному нарушению,18/18 baseline matches, без дублей.
- [x] Найдена причина блокировки первых трёх width-domain кейсов: actual путь
  `LeftAddon / 🔩 Addon`, reference `LeftAddon / LeftAddon`. Вложенный component key
  и set key совпадают с последующими успешными снимками; root key тоже корректен.
  `snapshotPaths` использует имена, `compareInstanceBoundaries` возвращает complete=false,
  после чего materializer убирает baseline у всех18 узлов.49 human-review и10
  not-executed в каждом отчёте; Spinner dependency не исполняется. Это не pass.
- [x] Изолированная проба в копии snapshot: смена только имени preview:2 на
  LeftAddon восстанавливает structural comparison. Оригиналы/Figma не менялись;
  эта диагностика не объявляется исправлением или успешной width-приёмкой.
- [x] Общий parent-scoped matcher: сначала подтверждённый уникальный swap port,
  иначе однозначная component/set identity среди прямых sibling instances под
  сопоставленным родителем. Ни глобального поиска, ни индекса, ни изменения имён.
  Неоднозначность не разрешается по похожему имени. Нет Button-specific веток.
- [x] Same-set variant остаётся boundary: baseline только из проверенной цепочки
  независимых pristine-host references. Реальные подмены не становятся разрешёнными.
- [x] Correspondence используется в baseline/variant facts, nested captures,
  icon-port и fixed child dependency bindings. Spinner выполняет свой контракт.
- [x] Capture opt-in `source.instanceIdentityVersion=1` сохраняется в JSON;
  старые отчёты воспроизводятся точно, включая три исходных неуспешных capture.
- [x] 23 профильные регрессии: переименованный Addon/Spinner, одинаковые компоненты
  под разными родителями, неоднозначные siblings/повторные paths, неверные bindings,
  реальные swaps, opacity/sizing violations, невалидный reference, download/replay.
  Figma API sandbox проверяет сборку independent refs, отсутствие мутаций actual
  и удаление временных узлов. Локальные модели не объявляются live-приёмкой.
- [x] Typecheck/build, полный Editor suite и 36 Button regressions прошли. Chrome:
  импорт r23 и сохранение, 18 раскладок/18 dialogs. README/USER_GUIDE/TESTCASES обновлены.
- [ ] Отдельное расширение: recovery независимых областей при неоднозначной/неполной
  топологии и переименования не-instance слоёв. Пока fail-closed; не обещать, что
  любая структурная неоднозначность уже локализована и не влияет на соседние проверки.
- [x] Повтор width HUG/FILL/FIXED с переименованным `🔩 Addon` принят на 0.2.44.
  Исходные неуспешные отчёты не переобъявлены успешными; серия 12:04 на 0.2.43
  не включена в приёмку. Button r23/Spinner r8 и нормативные статусы не менялись.

Manual/compiled/ZIP хеши сверены и неизменны. Predicate Engine и rules не менялись;
синхронизация нормативных строк Google-реестра не нужна. Push не выполнялся.

## P0 · Нижняя панель выходит за границы окна — исправлено в0.2.43 (2026-09-28)

- [x] Причина: фиксированный `calc(100vh - ...)` рабочей области не учитывал
  новую панель «Состояние до» и переносы строк. Footer оказывался ниже viewport.
- [x] Распределять высоту через flex: служебные панели занимают свою фактическую
  высоту, рабочая область — остаток. Результаты и скачивание отчёта доступны.
- [x] Независимая прокрутка anatomy/properties/inspector и содержимого модальных
  окон. Переносы кнопок и компактные отступы на невысоких экранах.
- [x] Начальный размер окна1200×720 вместо1440×900; без изменения функций проверки.
- [x] Browser gate:18 раскладок800×500–1440×900 в двух режимах, с панелью пары и без,
  доступность Save/Download/проверки, прокрутка и18 проверок модальных окон.
- [x] Typecheck/build,359 Editor tests и8 exact replay тестов BW r23 прошли.
- [x] README/USER_GUIDE актуализированы. Button r23/Spinner r8, manual, compiled,
  ZIP и Predicate Engine не менялись. Нормативный реестр синхронизировать не нужно.
- [ ] Подтвердить визуально после перезапуска0.2.43 в Figma на экране пользователя;
  локальная проверка браузера не подменяет эту приёмку.

## P0 · Root sizing отдельно от внутреннего layout — BW r23 принят; дополнительные sizing-пробы pending (2026-09-28)

- [x] Корень Button: прежний root.auto-layout-1, width HUG/FILL/FIXED, height HUG,
  D/M. Основание — Hub bridge §§block/nowrap/фиксированная ширина и cookbook.
- [x] Отделить sizing потомков в internal-sizing-locked; убрать sizing из общего
  layout-правила. Mode/alignment/padding/gap защищены один раз. Никаких UI-фильтров,
  скрывающих реальные findings. Appearance overlap этим P0 целиком не закрыт.
- [x] Общий scope descendants в Editor/compiler/validator/remap; готовый ancestor
  Predicate Engine, без runtime-исключений Button. Legacy semantics сохранена.
- [x] Сохранить r22 manual/compiled/core и6 исходных BW JSON с SHA вне editor/.
  Exact replay2313 evaluations +Editor/details;108/108 узлов, без warnings.
- [x] 359 Editor tests,138 Button tests,typecheck/build. Нормативно27 IDs/54 IR;
  generated facts и Spinner r8 прежние.8 неимплементированных, Draft/unpublished.
- [x] BW01–BW06 на прежней доске сброшены в старт: width192 FIXED/heightHUG,
  BW05 Loading, BW06 parent320; инструкции и README/TESTCASES обновлены.
- [x] Built Chrome: ZIP import, сохранение self/descendants без потери constraints,
  54 compiled checks, без JS errors. Архивный preview, не fresh live acceptance.
- [x] Реестр Правила1596/1598/1837/1839, Core Draft и drift Леджер60 синхронизированы;
  readback и сохранность форматов/валидаций проверены. Hub нормативно не менялся.
- [x] Live BW01–06 r23,11:14–11:16 UTC: нарушения0/1/1/0/0/0. FIXED/HUG не
  создаёт ложных sizing findings; BW02/03 — только width violation, BW05/06 —
  честное «Не выполнено». Exact replay2066 engine/1008 child +Editor/details,
  108/108 узлов, warnings/inconclusive=0; все прочие r22 verdicts/traces сохранены.
- [x] Шесть оригиналов с SHA архивированы вне editor/;8 live-регрессий добавлены,
  все146 Button tests прошли.
  Manual/compiled/ZIP/runtime/Spinner и нормативные статусы не менялись. Button
  остаётся Draft:6–7 pending в сценариях,8 неимплементированных на уровне контракта.
  Повтор BW01–06 и импорт пакета не нужны. Google-реестр при этой приёмке не менялся.
- [x] Live-пробы root height FIXED/FILL и internal sizing получены11:35–11:36,
  по одному корректному нарушению без дублей. Архив sizing-probes-r23.
- [x] Width HUG/FILL/FIXED: первые JSON 11:32–11:34 были заблокированы дефектом
  имён; свежая серия 12:07–12:09 на 0.2.44 принята (P0 выше). Исторические
  неуспешные отчёты не переобъявлены успешными.
- [ ] Следом: block/textResizing/nowrap. Нужны явные наблюдаемые факты/условия;
  не разрешать внутренний FILL эвристикой и не считать context-only правила pass.
  Hub разрешает контекстные изменения Text/Label/Hint, baseline-only ещё не умеет
  эти исключения. Drift фиксируется отдельно; это не решено текущим root-domain.

## P0 · Loading width: парные снимки — r22 live принят6/6 (2026-09-28)

Editor0.2.41 / Buttonr22. Существующий RuleID `component:web-core.button.loading-preserves-width`
переведён из context-only в predicate, статус draft. Новых нормативных ID нет.

- [x] Manual `transitionInvariant`: dependency `spinner` false→true, width,0.01px,
  неизменяемые semantic API поля. Отдельного loading property Figma не придумано.
- [x] «Запомнить состояние до» / «Сбросить пару» в проверке; обычная кнопка проверки
  получает второй снимок. Один instance, одна сессия, актуальный manual hash.
- [x] Оба снимка и внешние условия входят в JSON; общий core пересчитывает факты,
  единственный Predicate Engine сравнивает размеры. UI не решает pass/fail.
- [x] Изменение Product/modes/варианта/экземпляра/внешнего layout/инвариантов,
  неполный capture или отсутствие пары → «Не выполнено», проверка неполная.
- [x] Регрессии, UI roundtrip/session edits/download/replay; r21 архивирован,
  старые verdicts/coverage/details сохраняются. Spinner r8 не менялся.
- [x] README/USER_GUIDE/TESTCASES и реестр Правила1596/Core Predicate обновлены;
  отсутствующее описание ширины в Hub §Loading — отдельный drift Леджер59.
- [x] BW01–BW06 физически созданы в прежней Figma-секции Button, блок `13070:63891`;
  реальные D/M instances, один экземпляр на пару, фиксированные stages, инструкции
  на карточках. Структура/визуал проверены; fixture manifest в Button/qa/width-transition-test-cases.2026-09-28.json.
- [x] Live BW01–BW06: pass/fail/fail/pass/not-executed/not-executed. Оригиналы
  сохранены в qa/fixtures/width-transition-r22. Root FIXED-height findings вынесены
  в отдельный r23 P0 выше; они не отменяют доказанный width-transition результат.
- [ ] После приёмки отдельным шагом review правила; не объявлять весь Button Ready.

Поддержка GRID-родителей и более сложных сценариев окружения — последующее расширение
evidence profile, не эвристическое принятие неизвестных условий. Другие8 неисполненных
правил и продуктовые паттерны этим шагом не закрываются. Push не выполнялся.

## P0 · configured property ≠ effective visibility — live-приёмка принята (2026-09-28)

Editor0.2.40 / Buttonr21. Ручной источник разделяет `hintEnabled` (Figma boolean)
и `hintVisible` (`target.hint` → `visibility.effective`). Не новый слой политик:
тот же Predicate Engine читает факты общего opt-in materializer.

Исторический дефект: Loading composition r20 принят14/14; отдельное продуктовое правило
`component:web-core.button.desktop-hint-restricted` видит `semanticApi.hintVisible=true`
при скрытом Text. Причина: manual binding копирует `component.properties.Hint#4:8`;
общий `semantic-facts.ts` корректно исполняет этот binding, но само имя visibility
не гарантирует фактическую видимость. BL12 имеет настоящий видимый Hint и оба findings.

- [x] Сохранены14 live-отчётов с SHA;5792 engine/coverage/details replay совпали,
  244/244 узла. Manual/compiled/ZIP, Editor runtime и Spinner не изменены.
- [x] Разделить декларативные факты «настроено» и «фактически видно»; использовать
  semantic target/ancestry evidence общего слоя, не Button-specific условие.
- [x] Владелец принял запрет видимого Hint (28.09, «делаем»). Решение записано в
  manual; два изменённых правила возвращены в Draft. Product/платформа/размеры
  не расширялись, запрет не отключается целиком в Loading.
- [x] Для visibility-правил учитывать скрытых родителей и confirmed absence;
  unknown/remap не превращать в pass. Сохранить настройку boolean для редактирования.
- [x] Проверены hint/size/SingleIcon. Генерация записывает `hintEnabled`, не
  вычисляемый факт; validator блокирует запись derived visibility.26 IDs/58 IR,
  два прежних Hint RuleID. r20 manual/compiled/core архивированы, legacy replay сохранён.
- [x] 328 Editor +136 профильных package tests; все14 архивных снимков проверены
  с r21, прочие verdicts/traces прежние. Chrome import/passport/session/download
  воспроизводится; BL11 pass, BL12 два violations, BL10 confirmed absent.
- [x] Правила1590/1821, Леджер58 и Core Predicate Draft синхронизированы с readback;
  формат/валидации сохранены. Hub нормативно не переписывался.
- [x] Свежие live JSON BL11/BL12/BL10,08:25–08:26 UTC: нарушения0/2/0.
 1258 engine evaluations (504 child), coverage/details полностью воспроизведены;
 45/45 nodes, warnings/inconclusive=0. В BL11 настроенный Hint=true сохранён,
 фактическая видимость=false; BL12 сохраняет оба настоящих нарушения; BL10 absence.
- [x] Три оригинала архивированы независимо от editor/ с SHA;7 live-регрессий,
 143 профильных package tests прошли. Manual/compiled/ZIP/runtime/Spinner r8 прежние.
 Повторный live для этих кейсов не нужен. Политики/статусы manual/Google-реестр
 при этой ненормативной приёмке не менялись; контракт Draft,4–7 pending в сценариях.
- [ ] Пересобрать Hub-проекцию по manual/шаблонам: уточнить configured/effective
  semantics и продуктовую границу; drift остаётся «Найдено» в Леджере58.

Результат: Button/qa/effective-hint-visibility.2026-09-28.json.
Live-приёмка: Button/qa/effective-hint-visibility-live-review.2026-09-28.json.
История r20: Button/qa/loading-composition-live-review.2026-09-28.json.
Следующий функциональный шаг — сохранение ширины, существующий RuleID
`component:web-core.button.loading-preserves-width`: paired evidence ещё нет.
Не сравнивать с произвольной шириной master, не создавать pattern-дубль.

### Долг тестового архива (не runtime-дефект)

- [ ] `scripts/tests/spinner-gradient-acceptance.test.js` и
  `spinner-rule-review.test.js` читают старые оригиналы из Spinner/editor/ и падают
  с ENOENT после очистки экспортной папки. Перевести на проверенные immutable
  fixtures; при отсутствии оригинальных байтов восстановить из подтверждённого
  архива либо провести новую отдельную приёмку, не подменяя старый результат.
  Новые14 BL-отчётов уже хранятся независимо от editor/.

## P0 Spinner-only Loading — границы подтверждены владельцем (2026-09-28)

Buttonr20 / прежний Editor0.2.39. В Loading остаётся только Spinner нужного размера.

- [x] Один существующий RuleID:1 pinned visible Spinner,0 visible Label/Hint,
  1 visible addon; любая сторона. Никаких новых rule IDs или Button-specific code.
- [x] Размер оставлен за `addon-size-follows-button-size`:32/40→16;48–72→24.
- [x] Скрытые предком слои/отсутствующие в варианте слои не нарушения; unknown не pass.
- [x] r19 manual/compiled/core архивированы; Spinner r8, compiler/runtime/Engine прежние.
- [x] 323 Editor +101 package tests; Chrome session edit сохраняет все3 constraints,
  downloaded JSON воспроизводится. BL11–BL14 добавлены к прежним BL01–BL10.
- [x] Live-приёмка BL01–BL14: Loading14/14,42 атомарных проверки,7 ожидаемых
  нарушений; без новых Loading false positives. Контракт Draft, см. отдельный BL11 выше.
- [ ] Перегенерировать Hub по уточнённому manual: drift в прежней строке Леджера57.
- [ ] Далее: paired evidence для сохранения ширины. Один снимок по-прежнему недостаточен.

Решение о Hint/втором addon из r19 больше не ожидается: подтверждено этим сообщением
владельца. Подробности: Button/qa/spinner-only-loading.2026-09-28.json.

### История r19 до подтверждения

## P0 Loading composition — реализовано, ожидается live-приёмка (2026-09-28)

Editor0.2.39 / Buttonr19 / неизменённый Spinnerr8. Единственный изменённый RuleID —
`component:web-core.button.loading-uses-addon-spinner`:57 parent RuleIR,26 исходных IDs.

- [x] Подтверждённая часть: один видимый Spinner из pinned-контракта, Label скрыт
  или отсутствует в реальной анатомии. Условие — фактически активный fixed binding,
  не несуществующий Figma Loading property. Любая сторона, D/M/Inverted.
- [x] Общие `applicability.activeDependency` и quantity `contractDependencyId`;
  opt-in facts `dependencyCompositionV1`, штатный Predicate Engine без новых операций.
- [x] Скрытый/подменённый Spinner не деактивирует правило; неполные факты остаются
  unknown. Два доказанных Spinner считаются двумя; неизвестная вторая связь не pass.
- [x] Поля доступны в Editor; переключение constraints сохраняет select, изменение
  min/max в сессии меняет результат. JSON/Node replay, Chrome без ошибок.
- [x] 323 Editor +97 профильных package tests; r18 manual/compiled/core архивированы;
  старые verdicts/traces сохранены. Spinner r8 / Predicate Engine побайтно прежние.
- [x] BL01–BL10 в прежней Figma-секции, props/screenshot проверены; старые кейсы не изменены.
- [ ] Получить и разобрать live JSON BL01–BL10; Draft не закрывать по симуляции.
- [ ] Решение владельца: должен ли Loading также запрещать Hint и второй addon
  другого типа? До ответа этих новых запретов нет.
- [ ] Синхронизировать уточнённую семантику Hub через шаблоны после решения владельца.

Сохранение ширины — **компонентное поведенческое правило** Button, уже есть в manual.
Следующий отдельный P0: paired before/after evidence для одной identity/конфигурации,
проверка перехода loading false→true при неизменных внешних constraints; отсутствие
этого evidence даёт «Не выполнено». Нельзя подменять шириной master. В дальнейшем
то же правило применяется к фронту. Это не разрешение на отдельный pattern-rule дубль.

## P0 selection-validation-representation-identity — принято (2026-09-28)

Причина: allowlist брался из текущей authoring-вкладки, platform — из
`manual.component.platform`. BP08 ([M] Button) записан как desktop:53 human-review,
child не исполняется. Перебор сотен variant imports завершался гигантским toast.

- [x] Key-first resolver по representations текущего compiled; actual main/set key,
  ровно одно представление, без имени/выбранной вкладки/зависимости как fallback.
- [x] Platform применяется до capture actual, pristine и всех nested references.
  Preview использует тот же resolver; header проверки показывает actual representation.
- [x] Authoring selection, normative manual и session edits сохранены; stale hash retry.
- [x] Foreign/ambiguous/deprecated/missing bindings дают короткую ошибку, не pass;
  удалён массовый import loop. Legacy caller без representations принимает только
  явный совпавший key/set, без поиска по библиотеке.
- [x] 316 Editor +83 package tests; VM Plugin API обе платформы/поверхности,
  preview и child contexts; Chrome Desktop↔Mobile, stale/session edit, JSON replay.
- [x] Все13 BP отчётов архивированы с SHA;4831 engine/2016 child/235 nodes
  воспроизводятся точно. В первом прогоне были приняты12 сценариев, BP08 требовал retest.
- [x] Live0.2.38 05:47 UTC: BP08/BP01/BP13 имеют правильные representation/platform;
  0 violations/inconclusive,168 child checks каждый.1095 engine/504 child/54 nodes
  и coverage/details воспроизводятся точно; BP08 устранил прежние53 human-review.
- [x] Три уникальных отчёта архивированы. Четвёртое имя — побайтный дубль BP13,
  не четвёртый запуск.7 новых регрессий,90 профильных package tests прошли.
- [x] Получен отдельный BP01 06:16:25 UTC в ответ на запрос обратного сценария:
  actual Desktop,0 violations/inconclusive,18/18 nodes,168 child checks,
  все398 evaluations/coverage/details воспроизведены. Verdicts/traces совпадают
  с контрольным BP01, manual/compiled/Spinner pin прежние.92 package tests прошли.
  Dropdown не сериализуется: настройка [M] — контекст запрошенного теста, а не
  вывод из `component.platform`. Cross-direction UI отдельно проверен в Chrome.

Manual r18, compiled producer0.2.37, ZIP, Spinner r8 и Predicate Engine не менялись.
Новых нормативных правил/сверок Hub нет: Google-реестр не переписывался. Все исходные
отчёты сохранены без исправления старого platform. Мобильный pass теперь подтверждён
live-отчётом0.2.38. Реализация: Button/qa/selection-key-capture.2026-09-28.json;
первая приёмка: Button/qa/selection-key-live-review.2026-09-28.json;
финальная: Button/qa/selection-key-final-review.2026-09-28.json. P0 закрыт.
Следующая задача — полная Loading-композиция; затем сохранение ширины.

## P0 Button.View → Spinner.Inverted/Static — 13/13 live-сценариев приняты (2026-09-28)

Editor0.2.37 / Buttonr18 / неизменённый Spinnerr8. Единственный изменённый RuleID:
`component:web-core.button.loading-spinner-style-follows-view`, status Draft,
route predicate, root target + две typed таблицы на обе fixed bindings. Все26 IDs
сохранены;55 parent RuleIR. Матрица ordinary [D]/[M] Button на все32–72 подтверждена
владельцем; Inverted family не получает предположительную матрицу.

- [x] Shared `representation.surface` identity binding, без эвристики имён и
  fallback неизвестного View. Legacy constant transforms не переинтерпретируются.
- [x] Missing/unknown/wrong-type VARIANT не попадает в facts как `undefined`;
  чужой child set не проходит родительскую проверку палитры. Child pin неизменён.
- [x] 307 Editor +67 scoped package tests, typecheck/build;144 позитивных и288
  негативных комбинаций, обе стороны/платформы/все размеры и View.
- [x] r16/r17 exact replay; r18 сохраняет прежние verdicts/traces и1008 child
  evaluations, добавляет4 palette checks. В старых BS остаётся9 pending.
- [x] Chrome: сохранение таблицы в сессии реально меняет проверку; экспортированный
  JSON воспроизводится. Источник — архивные факты через simulated Plugin API.
- [x] BP01–BP13 созданы в прежней Figma-секции; props/identity перечитаны,
  screenshot проверен. Старые BS не менялись. Manual/compiled/core r17 архивированы.
- [x] Правила1826 /Леджер56 /CoreAF10:AH10 синхронизированы с readback metadata.
  Hub не изменён; drift по расширению Size56→32–72 и fallback остаётся `Найдено`.
- [x] Получены13 live JSON из Editor0.2.37/r18. BP01–07 и09–13 приняты:
  четыре отрицательных дают ровно по1 ожидаемому нарушению; остальные без нарушений.
- [x] BP08 повторён в0.2.38: Mobile,2 compliant palette +2 inactive, без
  неопределённых результатов. В совокупности с первым прогоном13/13 приняты.
- [ ] Следующий P0: полная Loading-композиция, затем pre-loading width.
- [ ] Отдельно согласовать нормативную матрицу Button_Inverted; текущая не применяется.

Compiled/projections/ZIP сгенерированы из manual. Production не опубликован,
контракт Draft; не считать9 оставшихся pending выполненными. Итог и hashes:
Button/qa/spinner-palette.2026-09-28.json.

## Пояснения ownership/applicability — исправлено в0.2.36 (2026-09-28)

- [x] `rule-scope-diagnostic-boolean-trace`: primitive `actual=false` распознаётся
  только в доказанном equals false→true и false-ветке all/any. Скрытый Text и
  подтверждённая область ребёнка получают конкретную причину; псевдосравнение скрыто.
- [x] Unknown/missing, неверная policy, Product scope и false внутри успешного OR
  не маскируются новым пояснением. Presenter не меняет applicability или verdict.
- [x] 299 Editor +58 профильных package tests, typecheck/build; точный replay всех
  2589 engine evaluations и Editor coverage. В details меняются только119 причин/
  showComparison на BS01–BS06; BS07 без изменений. Raw actual/expected сохранены.
- [x] Версия отчёта отделена от producer compiled: Editor0.2.36, compiler-output0.2.35.
  Перекомпиляция Button побайтно эквивалентна прежнему compiled; package/pins не меняются.
- [x] Chrome: BS01/BS05 через сохранённые факты и simulated Plugin API; по2 hidden
  и117 child-owned карточек без сравнения, реальная opacity-карточка сохранена.
  JSON download/Node parity, screenshots проверены, page errors=0. Это не live Figma.

Buttonr17/Spinnerr8, manual/compiled/ZIP, Predicate Engine, capture и статусы правил
не менялись; Google-реестр не переписывался. Архивы исходных отчётов неизменяемы.
Итог: Button/qa/scope-explanations.2026-09-28.json. Не требует нового набора Figma-кейсов:
презентационная регрессия воспроизводится на сохранённых фактах. Живой запуск нового
Editor внутри Figma в этой задаче не заявляется.

Следующая функциональная задача — **View→Inverted/Static**, с проверкой реальных
допустимых состояний и матрицы библиотеки. Loading composition/pre-loading width
и10 прежних pending этим исправлением не закрыты.

## История live-приёмки 0.2.35

## P0 ownership/applicability — runtime принят, пояснения требуют исправления (2026-09-27)

Editor0.2.35 / Buttonr17 / неизменённый Spinnerr8. В manual явные
`boundaryPolicy=component-owned@1`, `targetApplicability=visible-target@1` и
`propertyApplicability.layout.itemSpacing=flow-gap-either@1`. UI, compiler,
runtime facts, schema и экспорт поддерживают поля; Predicate Engine неизменён.
Пять существующих правил переведены в Draft; 26 RuleIDs/51 parent RuleIR сохранены.

- [x] `button-child-policy-boundary`: parent blanket rules не проверяют собственную
  область доказанной зависимости; Size embedding constraints остаются активны.
- [x] `button-parent-inactive-gap`: BS04 лишние4 atomic/2 карточки сняты; gap,
  активный хотя бы в baseline, padding/radius Button и child Scale остаются.
- [x] `button-hidden-label-coverage`: два style rules получают not-applicable,
  unknown/missing/collision не исключаются. Required presence не отключён.
  Конкретное человекочитаемое пояснение пока не работает: см. остаточный P1 ниже.
- [x] 291 Editor +45 scoped package tests, legacy exact replay, 1008 child results
  без изменений, SHA сохранённого r16 и принятого Spinner r8, typecheck/build.
- [x] Реестр: Правила1592/1594/1598/1837/1838, Леджер55, CoreAF10:AH10;
  значения/формат/validation прочитаны и проверены. Hub не менялся, Predicate Draft.
- [x] Свежие BS01–BS07 19:09–19:10 UTC из Editor0.2.35 / Buttonr17: cards
  0/0/1/8/1/0/0, atomic0/0/1/14/2/0/0; точный replay2589 evaluations (1008 child),
  Editor coverage/details;121/121 узлов, warnings/inconclusive=0. Во всех10 pending.
  Оригиналы с SHA-256 сохранены в Button/qa/fixtures/ownership-scope-r17, без удаления
  editor/ JSON. Итог: Button/qa/ownership-scope-live-review.2026-09-27.json.
- [x] 13 новых live-regression tests; все58 профильных package tests и291 Editor tests прошли.
  Исторические r16 ожидания не подменены новыми результатами.
- [x] **P1 `rule-scope-diagnostic-boolean-trace`:** исправлено в0.2.36, см. выше.
  Исходная диагностика: исключённые hidden/child-owned
  проверки показывают общий текст и `true/false → all true` (`showComparison=true`).
  Причина в `evaluation-view.ts:scopeTrace`: читается `record(entry.actual).value`,
  тогда как equals trace содержит primitive `actual=false`. Исправить только presenter:
  конкретная причина скрытия/владения, без псевдосравнения. Проверить вложенные all,
  unknown/missing и другую ложную предпосылку; engine/coverage/pins не менять.
  На момент приёмки0.2.35 дефект был воспроизведён, но ещё не исправлен.

Новые границы не разрешают parent override внутренних инвариантов ребёнка.
View→Inverted/Static, полная Loading-композиция и pre-loading width — следующий
этап, не закрыт этим P0. Другая продукция и production manifests не менялись.
В этой приёмке manual/compiled/ZIP/core/plugin и статусы правил не менялись;
нормативный Google-реестр не переписывался. Приёмка runtime не означает Ready.

## История диагностики до исправления

## P0 после live BS01–BS07 — ownership и применимость (2026-09-27 15:55 UTC)

Механизм зависимости принят, весь Button остаётся Draft. Все2547 evaluations,
1008 Spinner evaluations, Editor coverage/details воспроизводятся точно; узлы
matched полностью, warnings/inconclusive=0. Правильные BS01/02/06/07 без нарушений;
BS03 ловит Size24→16 родительским правилом; BS04 —30→24 width/height ребёнком;
BS05 opacity.5→1 ребёнком (2 parent+2 child checks сгруппированы в1 карточку).

- [ ] **P0 `button-parent-inactive-gap`:** в BS04 два Button self-and-descendants
  правила ловят gap10→12.5 на Addon и Spinner, хотя actual/reference gapApplicable
  обаfalse. Четыре atomic /две лишние карточки. Нужна явная shared applicability
  policy; активные parent padding/gap/радиусы не отключать.
- [ ] **P0 `button-child-policy-boundary`:** root Button blanket policies заходят
  во внутреннюю область Spinner. Дубликаты opacity сгруппированы, но отсутствие
  границы даёт смысловой конфликт с правилами ребёнка. Спроектировать явную
  owned-subtree/dependency boundary в manual/compiler: родитель сохраняет
  constraints места встраивания, ребёнок — внутренние инварианты. Не менять
  смысл старых self-and-descendants контрактов молчаливо и не делать whitelist Button.
- [ ] **P0 `button-hidden-label-coverage`:** в BS01–06 target.text существует,
  effective visibility=false, но label-and-hint-color-locked и label-text-style-locked
  дают «Целевой слой не найден».12 pending вместо10. Отличить доказанную
  неприменимость стилевых проверок от missing/ambiguous; required presence отдельно.

Manual/compiled/ZIP/Predicate Engine/версии и production не менялись. Статус Ready
не выставлялся; новые правила не добавлены, поэтому нормативный Google-реестр
этим анализом не менялся. Палитра/полная Loading-композиция/pre-loading width идут
после этого P0. Семь исходных JSON сохранены с SHA-256 в неизменяемом gzip-архиве;
отчёт `Button/qa/spinner-integration-live-review.2026-09-27.json`. Старые удалённые
Spinner G/24-case fixtures не восстанавливались и не заявляются перепроверенными.
Добавлены12 тестов на новые immutable live fixtures;44 scoped package tests
прошли. Hash-проверка подтвердила неизменность manual, compiled и ZIP.

## P0 Button → Spinner: общий маршрут зависимости реализован, приёмка ожидается (2026-09-27)

Editor0.2.34 / Buttonr16 / неизменённый Spinnerr8. Manual содержит pin и две fixed
nested bindings; не копирует правила ребёнка. Общий compiler/runtime проверяют
хеши, версии, owner set, Type=Spinner и lineage. Независимый child reference,
тот же Predicate Engine, исходные RuleID и focus на реальных узлах. Size32/40→16,
48–72→24 добавлен восьмым constraint к прежнему RuleID; семь icon constraints
сохранены. 26 source rules /51 собственных RuleIR; Spinner31 RuleIR отдельно.
Missing/ambiguous/cycle/mode/capture errors не дают pass; причина входит в отчёт.
ZIP, сессия, passport и constraint UI сохраняют dependency reference; compiled
read-only. JSON отчёта самодостаточен для replay вложенных проверок.
Проверено: **277 Editor +32 package tests**, typecheck/build, Chrome сохранение
passport/восьмого constraint с синтетическим preview. Правила1823, Леджер54,
CoreAF10:AH10 синхронизированы и прочитаны обратно, формат/dropdowns сохранены.

- [x] Реализация и регрессии core/controller, import/export/replay.
- [x] BS01–BS07 в Figma, та же секция Button, board `13025:63374`.
- [x] Разобрать семь live JSON из Editor0.2.34 / Buttonr16; механизм принят,
  полная интеграция остаётся Draft с тремя P0 выше.
- [ ] Следующий P0: View→Inverted/Static по доказанной матрице, без переноса
  продуктовой политики в универсальный API. Ограниченная таблица Hub для Size56
  не экстраполируется на inverted/all sizes автоматически.
- [ ] Полная Loading-композиция/количество Spinner и pre-loading width с отдельным
  независимым evidence перехода. Три существующих Loading RuleID не закрыты.

Figma отклоняет прямой Scale вложенного Spinner; BS04 использует Scale всей Button.
Восемь context-only правил Button и старые delegated gaps не объявляются выполненными.
Spinner r8 и production не менялись. Hub drift54 остаётся открытым, не маскируется
новым resolver. Принятые отчёты будут архивироваться в qa/fixtures, editor/ можно чистить.

## Spinner final rule review — завершено, r8 (2026-09-27)

Все6 правил Reviewed; компилятор подтверждает Ready для описанного Figma
predicate-контура:31 predicates +1 policy-only, 0 excluded/unimplemented/unresolved.
Приняты auto-layout и effective baseline. Manual меняет только два статуса,
revision/date; r7 manual/compiled архивированы. Generated facts12/12 и runtime core
не менялись, Button сохранён. Compiled/projections/ZIP пересобраны общим builder.
Проверки: **264 Editor +27 package tests**, typecheck. Все1008 verdict/trace/coverage
и details L01–L06 сохраняются при r8 (кроме revision-derived IDs); повтор Figma
ради статусов не нужен. Missing evidence по-прежнему incomplete даже у Ready-контракта.
Реестр Правила1716–1717/1833–1836: актуальный hash/r8;1717/1835 Проверено;
Core components Predicate Ready; Леджер53/54 не закрыты. Все записи прочитаны обратно.

**Следующий шаг — Button Loading → Spinner dependency.** Общий fixed-nested route,
вызов собственного контракта Spinner без копирования predicates. Родитель владеет
доступностью Loading, Size→Size, Inverted/Static; продуктовые ограничения — паттерн.
Сначала проверить фактический путь Addon.Type=Spinner и существующий Hub-конфликт,
затем расширить manual Button и подготовить точечные тесты композиции.

Граница Ready: только объявленные Figma-проверки. Code mapping/generation остаются
Draft, runtime index draft/unpublished, production не подключён. Builder не принимает
QA автоматически: его liveAcceptance=pending означает отсутствие прямого r8 capture;
reviewed parity — в `Spinner/qa/final-review.2026-09-27.json`, не ручная правка reports/.
Исторические удалённые G/24-case JSON не восстановлены и не подменены. Пользователь
вправе чистить editor/: принятые будущие отчёты архивирует агент в qa/fixtures/.

## P0 padding/alignment — целевая live-приёмка закрыта (2026-09-27 10:53 UTC)

L01–L06 приняты: 0/0/0/2/1/1 atomic findings, в UI 0/0/0/1/1/1 карточек.
6/6 mapped во всех; complete=true, warnings/notExecuted/inconclusive/excluded=0.
Все 1008 evaluations, Editor coverage и details воспроизводятся точно. Независимый
эталон не перенял overrides; фактические layout deltas совпали с планом, paints и
intrinsic bounds не менялись. 11 новых regression +8 base package tests пройдены.
Итог: `Spinner/qa/layout-live-acceptance.2026-09-27.json`; исходные байты шести
JSON сохранены в `qa/fixtures/layout-r7/*.json.gz`, тесты больше не зависят от
очистки пользовательской папки `editor/`.

Manual/compiled/runtime/ZIP/RuleID и статусы не менялись. **Следующий шаг — ревью
двух оставшихся Draft правил** на собранных доказательствах; затем отдельное
решение о готовности и Spinner dependency в Button без копирования predicates.
Новая задача на реализацию P0 по этим шести отчётам не обнаружена.

**P1 — восстановить исторические fixtures.** Теперь отсутствуют и четыре G01–G04
JSON (первый missing: 09-37-14-877Z), помимо прежней 24-case матрицы. Gradient и
review suites не запускаются из-за ENOENT; не ослаблять assertions и не подменять
исходники. Архивный механизм введён для новых L01–L06, старые байты надо восстановить.
Editor layout unit/controller tests переведены с очищаемого G01 export на архивный
эталон L01 без удаления assertions: **264/264 Editor tests** снова проходят.
Это не подмена исторического G01–G04 replay; его suite остаётся заблокированным.

### История реализации до приёмки

Editor **0.2.33**, Spinner **r7 / Draft**. Явные условия в manual для четырёх
padding и двух осей; общий capture/compiler, единый Predicate Engine без изменений.
NONE/NONE → not-applicable; active actual ИЛИ reference → сравнение; missing →
unknown/incomplete. Mode/sizing/intrinsic не отключаются. В Editor доступны отдельные
селекты, ZIP/manual сохраняют точные maps; старые правила без opt-in не меняются.

**264 Editor +15 package tests**, typecheck пройдены. 6 RuleID/31 predicates,
4 reviewed/2 draft, generated facts и Button сохранены. r6 manual/compiled архивированы.
Шесть настоящих Figma-кейсов L01–L06: node `13015:63344`, прежняя секция Spinner.
На этапе подготовки ожидались JSON r7 (приняты выше). После приёмки — review двух Draft правил, затем
отдельное решение о готовности и подключении к Button. Не считать P0 закрытым
только по созданию кейсов.

Figma не сохранила layoutMode overrides на Spinner/Fixer; GRID Fixer отклонён.
Не строим невозможные варианты и не подменяем library instance detached frame.
Эти границы проверены локальными controller/unit сценариями; в live-матрице их нет.
Старая проблема отсутствующих JSON исторической матрицы остаётся P1 ниже.
Реестр: Правила1716–1717/1833–1836 и Core components AF61:AH61;
sourceSha обновлён, два изменённых правила В работе, Predicate Draft.

Ниже — история завершённых и предыдущих этапов.

## Spinner gradient P0 — целевая live-приёмка принята (2026-09-27 09:37 UTC)

G01–G04: 0/2/2/2 atomic violations, каждый negative →1 UI-карточка с обоими
RuleID. Во всех 6/6 matched, complete=true, 138 evaluations; warnings,
notExecuted/inconclusive/excluded=0. Все 552 evaluations, Editor coverage и details
воспроизводятся точно. Отдельно подтверждены независимость reference, alpha stop,
transform и сохранение RGB/opacity при token detach. Ложных findings на modes нет.
Смысл правила/статусы не менялись: manual r6 /4 reviewed /2 draft; runtime и ZIP
сохранены. Итог: `Spinner/qa/gradient-live-acceptance.2026-09-27.json`.
Новые 7 regression +8 base package tests проходят. Следующий P0 — применимость
неактивных padding/alignment; затем review двух Draft правил, не подключать Button
раньше подтверждения собственного контракта Spinner.

**P1 — сохранность regression fixtures.** Старые JSON предыдущей матрицы больше
не найдены в Spinner/editor (первый missing: 06-24-38-590Z). Старый review-suite
останавливается на ENOENT, исторический replay в этом запуске не подтверждён.
Новые четыре отчёта доступны и приняты. Нужен постоянный архив QA fixtures,
не зависящий от очистки папки пользовательских выгрузок; прежние исходники следует
восстановить из сохранённой копии, не генерировать или подменять ожидания.

Ниже — история подготовки и реализации до получения новых отчётов.

## Spinner G01–G04 — Figma-заготовки готовы (2026-09-27)

В той же секции Spinner создан блок `13010:63367`: G01 исходный, G02 alpha
gradient stop 1→0,45, G03 gradientTransform translation +0,18, G04 token detach
с прежними RGB/opacity. Все — свежие библиотечные Size48/False/False, 6 узлов,
HUG/HUG. Сопоставлены только намеренные изменения; производный пересчёт bindings/
resolved modes у G04 зафиксирован отдельно. Старые кейсы не менялись, layout и
визуальная проверка блока пройдены. ID/ожидания: `Spinner/qa/figma-gradient-test-cases.2026-09-27.json`.
**Ожидаются четыре JSON-отчёта Editor 0.2.32 /manual r6.** Это подготовка,
не приёмка; правило/контракт/runtime/ZIP и реестр статусов не менялись.

## P0 — полнота градиентных paints: Editor 0.2.32 (2026-09-27)

**Статус: реализовано и проверено локально; целевая Figma-приёмка ожидается.**
Общий capture actual/независимого reference сохраняет четыре типа градиентов:
position/RGBA/порядок stops, token binding, transform и наблюдаемый blend mode.
Проверяются fills и strokes. Версионированная runtime policy требует полноты:
старые/повреждённые данные дают unknown и неполный сценарий с конкретными путями.
Наличие свойства отделено от полноты: selector не выбрасывает узел с неполным
эталоном. Пустой paint — `[]`; `mixed`, null и отсутствующие значения не заменяются
пустым массивом. Predicate Engine не изменялся; Spinner-specific ветвлений нет.

Manual r6, шесть RuleID, 31 predicates +1 policy-only и generated facts сохранены.
Compiled/ZIP пересобраны общим core; compiled 0.2.31 архивирован для исторического
replay. Исходные 24 отчёта воспроизводятся со своим compiled; с новым compiled
их потерянные gradient facts ожидаемо требуют нового capture. Это не новая
приёмка всех сценариев. Подробности: `docs/GRADIENT_PAINT_FACTS.md`,
`Spinner/qa/gradient-capture.2026-09-27.json`, `Spinner/TESTCASES.md`.

Следующий P0: явная применимость неактивных padding/alignment. До него и целевой
приёмки paints Spinner остаётся Draft (4 reviewed /2 draft); Button не подключён.
Production-каталоги и ds-ai-hub не переписаны.
Проверки: **255 Editor +17 package tests**, typecheck; 22 новых gradient tests.
Реестр: Правила1717/1836 и Core components AF61:AH61 обновлены и прочитаны обратно;
sourceSha прежний, статусы В работе/Draft. Форматы и соседние значения сохранены.

Ниже — историческая фиксация ревью до патча 0.2.32.

## Spinner r6 — ревью правил и два оставшихся P0 (2026-09-27)

Ревью пяти правил выполнено: public API, intrinsic size и INSTANCE+identity gate
приняты. Auto-layout/effective baseline остаются Draft; прежний visual-style
reviewed сохранён. Всего 4 reviewed / 2 draft, 31 predicates +1 policy-only.
Manual изменён только по статусам/revision; generated facts и runtime не менялись.
24 исходных JSON проверены по SHA256 и exact replay, 3312 verdict/trace/coverage
сохранены в r6 (revision/evaluationId новые). Подробности: `Spinner/REVIEW.md`.

- **P0 paint capture completeness — найдено, не исправлено.** Bundled controller
  не сохраняет gradientStops/gradientTransform. Изменение angular gradient маски
  не обнаруживается fill-проверкой. Нужен общий симметричный capture actual/reference,
  unknown при неполных paint facts, тесты stop/RGBA/transform/token/missing и live.
- **P0 inactive padding/alignment — найдено, не исправлено.** При layoutMode=NONE
  у Fixer изменение padding/alignment даёт findings. Нужна явная per-property
  manual applicability (actual ИЛИ baseline), без отключения layout.mode/sizing;
  active/inactive/removal/missing тесты и целевая Figma-приёмка.
- **P1 пересечения authoring.** 7 layout и5 visual paths пересекаются. UI уже
  группирует C01 2→1 с сохранением RuleID; новую дедупликацию не добавляли.
  Не удалять целиком legacy/user правило: есть уникальные strokeWeight/mode/alignment.
- **Не объявлять полноту сверх фактов.** Vector geometry/позиции, variable modes,
  semantic visible и code mapping отдельно от принятой матрицы. `Inverted` не mode.

Добавлены 9 package-тестов, включая два диагностических воспроизведения открытых
дефектов. Зелёные диагностические тесты не означают исправление. r5/manual и все
live-отчёты сохранены, ZIP/compiled пересобраны общим core; production/Hub/Button
не менялись. Дальше: paint capture P0, применимость, затем Spinner dependency
в Button без копирования правил. Повтор 24 кейсов ради смены статусов не требуется.
Пройдено 233 Editor +17 package tests и typecheck; production core bundle SHA256
не изменился. Машиночитаемый итог: `Spinner/qa/rule-review.2026-09-27.json`.

Ниже — история ранее выполненных этапов; сведения о пяти unreviewed относятся к r5.

## P0 — явная применимость неактивных strokeWeight/gap (2026-09-26)

**Статус:** реализовано в Editor **0.2.31**, Spinner **r5**. Live-приёмка
2026-09-27: прежние четыре случая Size48/False/False + **24/24 расширенной матрицы**.
Матрица закрыта; review контракта — отдельный шаг, его статус не повышен автоматически.

**Серия 06:24–06:44 UTC:** A01–A11 без нарушений; B01–B11 дают только
width/height после Scale ×1,5; C01–C02 находят утрату token binding при неизменных
RGB/opacity (по два срабатывания пересекающихся правил). Все 24: 6/6 matched,
138 evaluations, 18 обоснованных not-applicable; warnings/compiler errors/
notExecuted/inconclusive/excluded=0. Engine/coverage/details replay exact;
manual/compiled совпадают с canonical r5. Variant API, semantic API и независимые
references согласованы с каталогом. Всего воспроизведено 3312 evaluations.
Проблемный Static=True/24/False принят A01/B01; вместе с прежним контролем
покрыты все 12 исходных вариантов. Последний B04 (Size16/False/False, Scale16→24)
принят по `spinner.validation-report.2026-09-27T06-44-09-601Z.json`: только width/height,
exact replay; SHA256 d227637983c08b741b1bec4b778e1c89231174a6d70f94a275ba4fed0881682d.
В `Spinner/qa/live-acceptance.2026-09-27.json` — case→report/SHA256; план обновлён
до 24 passed / 0 pending. Правила, исходные отчёты и их статусы не изменялись.
Контракт остаётся Draft (5 unreviewed); Button ещё не подключён.

Четыре отчёта `spinner.validation-report.2026-09-27T05-09-*.json`:
`09-857Z` — 0 срабатываний; `19-150Z` — 4 (два реальных изменения, каждое
проверяют два правила); `27-838Z` — 7 (width48→300, root sizing, Fixer sizing,
token detach); `35-127Z` — только width/height48→80, 2 срабатывания.
Во всех четырёх: 138 evaluations, 18 явных not-applicable с причиной, 6/6 matched,
warnings=[], complete=true, notExecuted/inconclusive/excluded=0. Engine, Editor
coverage и details replay exact. Manual и compiled точно совпадают с canonical r5;
использованы свежие sources r2, manual hash a704a226842587572e66b01641c7123bc80c52b5ff6eef46139c24746e50e4c3.
На момент серии 05:09 это была приёмка только указанного сценария P0;
расширенная матрица принята позднее, актуальный результат — выше.
Spinner остаётся Draft, подключение к Button впереди.

- Manual `propertyApplicability` хранит два версионированных условия: stroke
  присутствует в actual ИЛИ independent baseline; ≥2 видимых не-absolute детей
  HORIZONTAL/VERTICAL auto layout в actual ИЛИ baseline. Условие относится только
  к соответствующему propertyForbidden, не ко всей группе/правилу.
- Capture сохраняет factual `propertyActivityV1` отдельно для обоих состояний.
  Общий compiler создаёт обычный RuleIR; Predicate Engine не изменён. Известная
  неактивность → «Не применяется» с причиной; неизвестные факты → неполная проверка.
  Добавление/удаление stroke, paints/tokens, размеры и другие layout checks сохранены.
- В форме правила два выпадающих списка; отсутствие opt-in сохраняет старую
  семантику. Новые Athena facts не включают условие автоматически. Старые snapshots
  с прежним compiled сохраняют exact replay; новый gated contract на старом capture
  без activity evidence не получает ложную полноту.
- r5 содержит все 6 пользовательских r4 RuleID, свежие sources r2, 31 atomic
  predicate и policy-only запись. Auto-layout с новой политикой возвращён в Draft;
  unchanged visual-style остаётся reviewed. Исходники r2/r4 — в history, оригиналы
  live-отчётов не переписаны. Button r15 и production не изменены.
- 233 Editor tests + 8 package tests; четыре новых controller simulations:
  0/4/7/2 violations и 18 явных inactive evaluations. Scale сохраняет два size
  findings вместо прежних десяти. Это локальная проверка, не новая Figma-приёмка.

**Тестовые экземпляры подготовлены 2026-09-27:**
[матрица в прежней секции Spinner](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63247),
страница «Лаборатория»: A01–A11 исходные, B01–B11 Scale ×1,5, C01–C02 token detach.
24/24 проверены по main key, variant properties, размерам, шести узлам и bindings;
визуальный QA пройден, прежние четыре экземпляра не изменены. На этапе подготовки
все кейсы были pending; после серии 06:24–06:44 — 24 passed, 0 pending.
Порядок, ссылки и ожидания — `Spinner/TESTCASES.md`; nodeId crosswalk —
`Spinner/qa/figma-test-cases.2026-09-27.json` в экспериментальном пакете DS.

**Следующий шаг:** review пяти unreviewed source rules и их границ/покрытия;
отдельно пересечения правил/уникальные findings. После этого — dependency Spinner
в Button без копирования predicates. Принятые 24 кейса и прежний контроль повторять
без изменения кода/контракта не требуется. Перед повторным импортом пакета
экспортировать более новые изменения сессии.

## P0 — потеря intrinsic bounds в independent baseline (live Spinner, 2026-09-26)

**Статус:** исправлено в Editor **0.2.30**; live-приёмка P0 размеров для
Size48/Static=False/Inverted=False подтверждена четырьмя отчётами 18:52 UTC.
Spinner целиком остаётся Draft, зависимость Button не включена.
Нормативные правила и пользовательский manual r4 не изменены.

**Приёмка 2026-09-26:** `spinner.validation-report.2026-09-26T18-52-*.json`:

- `14-865Z`: 48×48, 132 compliant, 0 violations.
- `25-332Z`: 48×48, 4 atomic violations — HUG→FIXED и token detach,
  каждое изменение проверяют два существующих правила.
- `32-826Z`: 300×48, 7 atomic violations; width48→300 найден. В отличие от
  предыдущего resize-кейса также изменён Fixer FIXED→FILL (ещё два срабатывания),
  поэтому результат 7, а не 5. Прежние четыре findings сохранены.
- `39-004Z`: 80×80, 10 atomic violations; ширина и высота48→80 найдены.
  Остальные восемь — прежние strokeWeight/gap, не новые визуальные дефекты.

Во всех четырёх: 6/6 matched, warnings=[], 132 evaluations, scenario complete=true,
notExecuted/inconclusive/excluded=0. Независимый reference имеет другой rootNodeId;
baseline48×48 сохранён. Engine, Editor coverage и serialized details replay exact.
Manual r4/hash совпадает с четырьмя предыдущими отчётами. Source evidence остаётся r1;
Static=True/24/False и остальные варианты этими прогонами не проверены. Файлы отчётов,
manual, compiled и код в ходе этой приёмки не изменялись.

Реализовано в общем маршруте, без Spinner-specific проверок:

- Независимые width/height сохраняются в effective baseline preview/selected-instance;
  nested references включают размеры при `geometryCaptureVersion=1` у обоих captures.
  Historical replay без флага сохраняется; host-context comparisons не сравнивают
  размеры предков, закономерно зависящие от variant/swap.
- Missing dimensions не фильтруют существующую цель: `missingPolicy=unknown`,
  причина содержит `baseline.effective.bounds.width/height`, coverage неполная.
  Неизвестные значения не заменяются нулём; x/y не входят в baseline.
- 222 Editor tests, 8 package tests, typecheck/build пройдены. Четыре исходных
  отчёта воспроизводятся точно. Новый реальный bundled controller проверен через
  Plugin API simulation с раздельными actual/reference из сохранённых captures.
- Chrome: все четыре случая, missing reference width, JSON export, ZIP roundtrip,
  точное browser/Node parity; manual r4 (6 правил) сохраняется. Повторный roundtrip
  сравнивается на одном snapshot: timestamp нового capture закономерно меняет hash.
- Новое исполнение даёт 0/4/5/10 atomic violations: в resize добавлена ширина,
  в Scale — ширина и высота; все прежние findings сохранены. Это локальные тесты,
  не новые live-отчёты. Применимость strokeWeight/gap ниже остаётся отдельной задачей.
- Пересобраны только производные артефакты экспериментального Spinner r2;
  manual hash не изменился. Button r15 и production не затронуты.

Размерные сценарии 48×48, resize300×48 и Scale80×80 приняты. Далее — явная
применимость неактивных свойств и live-проверка других вариантов, особенно
Static=True/24/False на свежих sources. Перед сменой пакета сохранить r4 ZIP;
не импортировать r2 поверх r4 в расчёте на автоматическое объединение правил.

### Исходная диагностика Editor0.2.29

Три исходных отчёта Spinner из `experiments/web-core/core/Spinner/editor/`:
`18-17-21-663Z`, `18-17-36-460Z`, `18-18-37-755Z` (2026-09-26).
Engine, Editor coverage и detail replay совпадают точно. Все прогоны: Editor0.2.29,
Size48/Static=False/Inverted=False, 6/6 matched, warnings=[], complete=false.

- Первый: 48×48, нарушений нет, intrinsic-size «Не выполнено».
- Второй: 48×48, HUG→FIXED и token detach у Ellipse1 при том же цвете обнаружены.
- Третий: 300×48, те же findings; собственно width48→300 пропущен.
- Четыре atomic violations во втором/третьем — два изменения, каждое затронуто
  прежним правилом и новым пользовательским auto-layout/visual-style правилом.

**Причина:** `src/core/instance-validation.ts::effectiveFacts` не переносит bounds
независимого reference в baseline.effective; `src/code.ts::collectNodes` также
не включает их в preview baseline. Compiler фильтрует subject через fact-present
baseline.effective.bounds.width/height, превращая пробел данных в empty selector.
Editor затем сообщает «Целевой слой не найден», хотя root найден.
Локальные Spinner tests вручную добавляли baseline bounds и не проверяли реальный
capture→materialization путь: этот пробел покрытия нужно устранить.

**Требования:**

1. Общий capture/materialization маршрут сохраняет независимые width/height;
   не копирует размеры actual, не сравнивает случайные x/y временной страницы.
2. Missing baseline факт отличается от отсутствующей цели: unknown/«Не выполнено»
   с конкретным fact path, без ложного not-applicable/pass.
3. Регрессия на этих трёх неизменённых отчётах + настоящий путь materialization,
   правильные 48×48 и resized300×48, отсутствующий reference, preview/selected
   instance; проверить общий nested/reference маршрут без ослабления identity.
4. Сохранить пользовательские правила перед обновлением sources. В отчётах manual r4
   (hash4d5c0069495c591a3bc124b139ab4d9ec84560b6590394fddd8ca75a2ee46e79),
   sourceHash=f65f77c746b6e9fce4a77f6c52861b09b6fe3e9c1e429c4b76a40bb0a5ee7fb7
   совпадает с историческим r1, не свежим r2. Четыре прежних правила не изменены;
   добавлены reviewed auto-layout-1/visual-style-1. Простой импорт r2 потеряет
   сессионные добавления и сам по себе не исправит baseline bounds.
5. Повторить live-проверку после исправления, в том числе Static=True/24/False:
   эти три отчёта этот вариант и fresh r2 source не покрывают.

Диагностический опыт только в памяти: width/height=48 из закреплённого независимого
REST приводят к width violation300→48 только в третьем snapshot. Это локализация
причины, не новый live-прогон. Файлы отчётов/manual/compiled не менялись.

**P1 — пересечения правил:** согласовать auto-layout/visual-style с прежним baseline
правилом, не удаляя новые ограничения layout.mode/alignment и пользовательские ID
без review. Различать количество atomic checks и уникальных изменений в UI.

### Дополнительный live-кейс: Scale (18:22:13 UTC)

`spinner.validation-report.2026-09-26T18-22-13-200Z.json`: тот же manual r4,
Size48/Static=False/Inverted=False, actual80×80. Все шесть узлов масштабированы
примерно в 5/3 раза относительно первого live-прогона; заливки/токены не изменились.
6/6 matched, warnings=[], engine/Editor/serialized details воспроизводятся точно.
Intrinsic-size опять «Не выполнено» из-за отсутствующих baseline bounds.

Восемь violations — не восемь самостоятельных визуальных дефектов:

- 6 × strokeWeight1→1.6667 при пустых actual и baseline strokes на всех узлах;
- 2 × gap10→16.6667 (два правила) у корня с единственным дочерним элементом.

**Добавить в приёмку P0:** обычный resize300×48 и Scale80×80 должны определяться
тем же инвариантом размеров текущего варианта; не нужен Spinner-specific detector
операции Scale. Не выводить факт совершённой UI-операции лишь из одного snapshot.
Нормативный размер брать из независимого reference, а не actual scaled geometry.

**Смежная задача — применимость неактивных свойств:** определить общий typed gate
для strokeWeight при отсутствии stroke в actual И baseline; появившийся/исчезнувший
stroke не скрывать. Gap при одном участвующем в layout ребёнке не объявлять отдельным
видимым дефектом без явной нормативной политики. Missing paint/layout facts — unknown,
не основание скрывать проверку. Текущее сравнение чисел буквально верно, но правило
слишком широко для интерпретации каждого результата как самостоятельного дефекта.
Не удалять пользовательские правила и не менять manual семантику молча.
Реализовано следующим патчем0.2.31/r5, см. P0 выше. Исходные отчёты и прежний r4
сохранены; нормативное уточнение находится в новой ревизии manual, не в UI-фильтре.

## P0 — собственный Spinner → зависимость Button (2026-09-26)

**Решение пользователя:** intrinsic API/инварианты — component owner; продуктовые
и канальные ограничения — pattern owner. Сначала самостоятельный Spinner,
затем его подключение к Button по ограничениям Button. Не копировать predicates.

**Текущий пакет:** изолированный Spinner Draft r5, 6 source rules / 31 checks,
18 активных source snapshots, manual/compiled/ZIP/provenance/crosswalk. Общий compiler и
Predicate Engine; никаких Spinner-specific проверок в Editor. Сохранены 2 Athena
RuleID. Code representations остаются Draft; production и Button r15 не изменены.
8 regression tests Spinner + 232 Editor tests проходят (bounds0.2.30, applicability0.2.31).
Chrome UI: импорт/проверка/JSON report/ZIP roundtrip и browser/Node parity пройдены
на synthetic capture. Правила1716/1717/1833/1834, Леджер53/54, Core PredicateAF61:AH61
обновлены и прочитаны повторно при реализации: Draft / 2026-09-26. Live-приёмка
18:52 UTC закрыла P0 bounds для Size48/False/False; полная приёмка не заявляется.

**Найдено при сборке:** converter терял rename-only/empty variant patches и add
operations. Исправлен с self-test/regression; пересобран только эксперимент Spinner.
В r1 raw Static=True / Size=24 / Inverted=False содержал add/remove одного id=6,
уже присутствующего в base. **P0 генератора исправлен в CLI и плагине Athena:**
новые ID не пересекаются с base, parentId переводятся в общий namespace, malformed
деревья отвергаются. 78 CLI tests и 56 CLI/plugin parity + sanitized topology scenarios.
Свежий read-only REST Spinner от 2026-09-26T17:51:18.088Z доказал 12/12 структур;
r2 обновляет только sources/provenance, не политики. r1 сохранён и по-прежнему
не проходит fail-closed импорт. Production raw не перезаписан; старые повреждённые
выгрузки нужно переэкспортировать. Стабильные semantic anchors этим P0 не реализованы.

**Отдельный технический долг Athena plugin:** полный tsc имеет 32 прежние ошибки
типизации; сравнением affected TS с HEAD подтверждено 0 новых diagnostics.
Сборка/regression проходят; typecheck CLI и Editor проходят. Не смешивать этот
результат с утверждением о полностью зелёном typecheck плагина.

**Далее, в порядке исполнения:**

1. Уточнить применимость strokeWeight/gap без молчаливого ослабления manual;
   проверить остальные variants (особенно Static=True/24/False). Size48/False/False,
   resize, Scale и token detach подтверждены live-отчётами 18:52 UTC.
   12/12 source evidence уже доказаны; контракт пока Draft.
2. Общий fixed-nested dependency route: stable componentId + revision/hash,
   lineage через Addon.Type=Spinner, а не INSTANCE_SWAP glyph port. Разрешение
   версий/циклов/конфликтов и отсутствие контракта — явные coverage gaps.
3. Button manual: constraints Size/View→Spinner, only evidence-backed matrix,
   Loading composition и width invariance при наличии pre-loading reference.
   Правила Spinner выполняются по зависимости; прежние Loading RuleID сохраняются.
4. Product/channel policy перенести к pattern owner с crosswalk без параллельных ID.
   Не удалять текущие правила до работающего pattern route; раздельная component/usage
   readiness. Не блокировать intrinsic Ready нерелевантными product-политиками,
   но и не называть проверку сценария полной без необходимых usage rules.
5. Hub drift: figma-keys Spinner говорит «swap в Addon», adapter/bridge —
   «Type=Spinner, не swap glyph». Зафиксировать в Леджере; хаб не править молча.

Подробности и приёмка: `design-system_ab/experiments/web-core/core/Spinner/README.md`;
решение: соседний `COMPONENT_OWNERSHIP.md`. Наличие ZIP не закрывает Loading Button.

## P1 — явная перепривязка существующей цели (0.2.29)

**Статус:** реализован ограниченный этап 2026-09-26, локальные гейты пройдены;
live-приёмка в Figma остаётся открытой. Новая схема контракта не введена.

- Общие `planTargetRemap` / `applyTargetRemap`: чистое сравнение, затем отдельное
  подтверждение с hash manual, snapshot и Athena evidence. Старое подтверждение
  нельзя применить после смены контекста. Отмена/ESC не меняют manual.
- В списке правил и редакторе правила есть отдельный вход. Модальное окно
  показывает старый/новый путь, representation, lineage, доступность свойств,
  конкретные блокировки и существующие затронутые RuleID. Не сохранённая форма
  защищена от потери правок; native selects остаются внутри модального top layer.
- Обновляется только representationHints выбранной цели; targetId, semanticRole,
  RuleID, другие привязки, constraints, scope, severity и control paths сохраняются.
  Связанные активные правила/примеры → Draft, revision +1. Учитываются прямые
  правила, structured relationships/dependencies, control ports и subtree scope.
  Старые общие hints остаются fallback для остальных представлений, не копируются
  из текущего capture. `nodeIdHint` остаётся диагностическим.
- Generated facts и compiled JSON read-only. Значения actual не становятся
  expected. Сессионные проверки/ZIP используют новый manual, старый отчёт сброшен.
  Capability mapping общий с compiler; Predicate Engine не менялся.
- Запрещены root/child перенос, чужой компонент/platform, конфликт целей, неполная
  структура, недоступные свойства/эталон, неподтверждённый nested swap. Для Athena
  destination должен совпасть с generated + independent reference; старые факты
  после regeneration сначала обновляются. Deferred policies остаются deferred.
- **210 тестов**, typecheck/build; Chrome cancel/ESC/consent/dirty form/узкое окно,
  session + ZIP roundtrip, browser/Node parity. Golden Button: поправка stale manual
  binding не меняет политики/факты/вердикты. Семь исходных JSON replay точные.
  Button manual r15/ZIP, нормативные DS-документы и production не менялись;
  поэтому запись нового нормативного решения в таблицу Правила не требуется.

**Оставшиеся шаги и границы:**

1. Live-приёмка: переименованная/перемещённая цель → явное подтверждение → Draft →
   проверка → экспорт/повторный импорт. Отмена не меняет revision и manual hash.
   Проверить на копии пакета; не менять библиотеку только ради теста.
2. Stable structural/instance-lineage anchors со стороны Athena. Текущий legacy
   fingerprint path/type/order — консервативная защита, не постоянная identity.
3. Per-representation resolution: globally unresolved цель с несколькими Figma
   представлениями нельзя подтверждать по одному capture. D/M перенос и изменение
   scope остаются отдельным authoring-решением, не автоматической миграцией.
4. Live positive controls r15 (Size20, нетронутая legacy S, Button56/правый слот)
   и девять прежних «Не выполнено» остаются открытыми. Контракт не Ready.

## P1 — безопасное сопоставление целей без изменения manual (0.2.28)

**Статус:** реализован ограниченный этап 2026-09-26. Это защита legacy/manual-only
маршрута, а не завершённая миграция semantic targets после любых изменений Figma.

- Убран общий поиск только по имени и использование `nodeIdHint` как доказательства
  соответствия. Нужны component/representation/platform, точный путь по parent-chain
  и структурная привязка. Одинаковые роли/цели, усечение, drift типа/порядка, перенос
  и неоднозначные hints не сопоставляются автоматически.
- Проверка не меняет `target.resolution`, `nodeIdHint`, revision или hash manual.
  Простое выделение в Anatomy тоже не создаёт новых ручных целей.
- Read-only `snapshot.targetResolution` пересчитывается в общем core и входит в
  JSON-отчёт. Причина попадает в «Не выполнено», без ложного дублирования карточкой
  «Не применяется». Подтверждённые остальные цели продолжают проверяться.
- При открытии несопоставленного правила Editor показывает его исходную цель,
  а не ранее выбранный слой; сохранение на посторонний объект заблокировано.
- При загрузке manual поверх совместимого preview сохраняется прежний generated
  variant evidence. Полный Athena/reference маршрут Button r15 не заменяется
  legacy-адаптером; вложенная identity по одним path hints не угадывается.
- 194 теста, typecheck/build; Chrome импорт/проверка/экспорт и Node parity.
  Семь сохранённых отчётов 08:31–13:26 воспроизводятся точно. JSON исходных отчётов,
  manual r15, 26 RuleID и 49 atomic checks не изменены. Версия producer при новой
  компиляции — 0.2.28. Production и Predicate Engine не менялись.
- Live positive controls r15 (Size20, исходная legacy S, Button56/правый слот)
  остаются открытыми. Девять прежних «Не выполнено» этим этапом не закрываются.
  Нормативные правила не менялись, поэтому нового семантического решения в
  таблице Правила/Леджер этот patch не требует.

**План этапа (пункты 1–2 реализованы с ограничениями в 0.2.29 выше):**

1. Показать старую цель и предлагаемый новый объект, component/instance lineage,
   representation, отличия capabilities и список затронутых существующих RuleID.
2. Требовать действие автора; отмена ничего не меняет. Перепривязка сохраняет
   targetId/RuleID, обновляет только manual binding, снимает reviewed у затронутых
   правил и повышает revision. Изменённый scope/несовместимые capabilities требуют
   решения, а не автоматического расширения области правила.
3. Согласовать стабильные structural/lineage anchors из Athena вместо старого
   path/type/order fingerprint. Не выводить семантическую роль из имени слоя.
4. Gate: rename/reparent/reorder, одинаковые имена, D/M, swap и regeneration;
   roundtrip, отмена, stale preview, сохранность остальных manual-полей и engine
   parity. Не объявлять всю миграцию выполненной после текущего fail-closed patch.

## P0 — Size варианта иконки отдельно от bounds; swap внутри переключённого Addon

**Статус:** реализовано в Editor **0.2.27**, manual **r15**; локальные гейты и два
отрицательных live-сценария пройдены. Остаются live positive controls и матрица
Button56/правый слот. Полная готовность контракта не заявляется.

**Live-приёмка 13:26 (2026-09-26):**

- `button.validation-report.2026-09-26T13-26-01-132Z.json`, instance12982:59338:
  glyph-26 Size24 в Icon-20 при bounds20×20. Ровно одна violation Size24→20;
  Addon set/port/width/height проходят. Цепочка variant→nested swap сопоставлена,
  15/15 вместо прежних10/15. 201 compliant,17 not-applicable,9 not-executed.
- `button.validation-report.2026-09-26T13-26-10-308Z.json`, instance12984:61136:
  legacy Size=m в Icon-16 при bounds16×16. Две независимые violations: m→s и
  прежний запрет новой legacy-замены. 15/15,197 compliant,20 not-applicable,
  9 not-executed. Не ошибка геометрии и не дубль одного ограничения.
- В обоих warnings=[],inconclusive=0,manual r15 точно совпадает с диском.
  Recompile, authoring activation, engine/Editor/details replay точные.
  Исходные отчёты, правила, compiled/ZIP и runtime при анализе не менялись.
- Эти два P0-дефекта подтверждены исправленными в заявленных кейсах. Статус
  Draft и девять прежних coverage gaps сохраняются; положительные случаи r15
  и остальные размеры/правая сторона пока не приняты live.

- Прежний size RuleID содержит 7 ограничений: Addon set, активный порт, bounds и
  отдельные VARIANT Size domains: legacy Icon-16→s, glyph-26 Icon-20→20 / Icon-24→24.
- Общие `variantProperty/property/activePorts` редактируются в форме; значения
  нормативные только в manual. Все 26 правил/PaintMe сохранены, 49 RuleIR.
- Evidence v4 хранит цепочку независимых library references с parent boundary.
  Проверяются identity/port/context/shape/modes; actual styles не копируются.
  Подтверждённый host сохраняет domain facts даже при gap дочернего содержимого.
  Старые v1–v3 отчёты воспроизводятся по прежней семантике.
- 182 теста: golden из трёх live snapshots, матрица 32–72/обе стороны, unknown,
  hidden, неизменённый legacy, ошибочный Size при верных bounds, style overrides,
  API refusal/cleanup, import/export. Пять исходных engine/editor/details replay
  точные. Chrome: 7 форм, несохранённые правки, сессионный verdict, JSON/ZIP parity.
- Sandbox capture: 15/15 при двух эталонах; 13/15 при отказе дочернего reference.
  Это локальные тесты, не новый Figma-прогон. Остаются 9 прежних «Не выполнено»
  и warning Spinner. Production не менялся, пакет Draft.
- Правила1823 / Predicate AF10:AH10 / legacy drift51 обновлены. Новый drift52:
  cookbook ds-ai-hub смешивает nominal glyph-26 Size20/24 с s/m; требуется review
  и проекция документации. Статус «Найдено», hub не менялся.

**Приёмка:** сохранить текущий ZIP при новых правках, перезапустить Editor0.2.27,
импортировать `Button.editor-input.zip` (r15). Повторить 08:33 и 08:35:
ожидаются Size24→20 и m→s, отдельный catalog finding во втором случае сохраняется.
Правильные Size20 и исходный S проходят; bounds проверяются независимо.
Повторить на Button56/правом видимом слоте. Сохранить свежие JSON-отчёты.

**История диагностики до исправления:**
Manual r14 / Editor 0.2.26, source hash прежний. Engine и Editor replay точные.

Пользователь выбрал glyph-26 diamonds Size=24 вместо Size=20. Actual variant key
`65557490b6f94cf05bd6dd5667112b503dae0498` подтверждён Athena index. При этом
INSTANCE bounds остались 20×20, Addon16 / Type=Icon-20 / active Icon-20 сохранены.
Это реальный доступный в Figma сценарий, не искусственная подмена геометрии.

1. **Пробел manual-контракта:** r14 проверяет Addon set, port и actual width/height,
   но не номинальный Size выбранного варианта иконки. Даже после ремонта runtime
   bounds 20×20 пройдут. В существующем правиле нужна отдельная нормативная таблица
   для glyph-26: Button32/40 → asset Size=20; Button48–72 → Size=24. Она остаётся в manual,
   а не в Button-specific коде. Runtime получает типизированное свойство варианта
   и доказанную идентичность ассета отдельно от измеренной геометрии.
2. **Пробел runtime:** independent-host-variant reference переключает Addon на
   Icon-20, но внутри сохраняет default glyph Size=20. Проверка равенства всех
   вложенных instance keys даёт `replacement-nested-identity-unresolved`.
   Dependency reader затем блокирует весь порт по `wrapper-lineage-changed`.
   Нужно поддержать доказанную цепочку variant → nested swap и отделить достоверность
   identity/port/domain facts от полноты визуального baseline содержимого.
   Не принимать всё поддерево по одному совпавшему wrapper key и не копировать
   actual styles в reference. Неразрешённые дочерние области оставлять явным gap.

Фактический результат: 10/15 matched, пять несопоставленных узлов, 4 human-review,
10 not-executed, нарушений нет. Отрицательная приёмка **не пройдена**; отсутствие
нарушений не означает допустимость выбранной иконки. Положительный 08:31 прогон
подтверждает только ранее реализованный набор проверок, не всю размерную политику.

Regression/DoD: golden из этого live-отчёта; для glyph Size24, вписанного в 20×20,
ожидается нарушение именно Size варианта, не две ошибки width/height. Правильный
Size20 / 20×20 проходит; ручное изменение bounds проверяется отдельно. Проверить
обе стороны, обратное соответствие Button48–72, hidden targets, legacy exception,
unknown identity, реальный style override внутри заменённой иконки и точный replay
исторических отчётов. Новые правила/артефакты в рамках анализа не менялись.

**Дополнительный live-кейс 08:35:31:**
`button.validation-report.2026-09-26T08-35-31-130Z.json`, instance 12984:61136,
Button40 / Addon16 Type=Icon-16. Пользователь подтвердил ожидаемое Size=S.
В активном Icon-16 выбран general (glyph) diamonds Size=m
(`6cef3ffc12e9e4fcb6d1765b9e6eddcf29ce22e0`) вместо Size=s
(`5488b3f6210650ac293d3839debfcb1d97085b00`); оба варианта принадлежат одному
component set `86df8e8eab2476704d9ae803b04ca616a2e9a358`, подтверждены Athena.
Actual bounds остались 16×16. Независимый host-swap reference сопоставлен:
15/15 узлов, warnings=0, inconclusive=0; engine/editor replay точный.

Одна существующая violation — `addon-uses-glyph-26`: general (glyph) вместо
glyph-26, поскольку S→M меняет variant key и правило использует changed=true.
Это соответствует текущей принятой политике «glyph-26 при любом изменении key»,
но не диагностирует неверный Size. Новые port/width/height проверки r14 намеренно
ограничены glyph-26 и здесь not-applicable. Итог: 197 compliant, 15 not-applicable,
1 violation, 9 прежних not-executed. Этот кейс НЕ воспроизводит runtime gap 08:33:
сам Addon остаётся исходным Icon-16, меняется только иконка внутри него.

Требование для доработки: manual mapping зависит от подтверждённого каталога,
активного порта и домена свойства ассета: general (glyph) + Icon-16 → `Size=s`;
glyph-26 + Icon-20 → `Size=20`; glyph-26 + Icon-24 → `Size=24`. Не приравнивать
S/M к числам или bounds эвристикой. Size policy не разрешает каталог автоматически
и не подменяется catalog policy. Различать same-set variant change и замену
семейства для понятной диагностики; существующий запрет новых legacy keys не
ослаблять без отдельного изменения нормативного решения владельцем.
Golden должен ожидать явное «Size=M, требуется S» при сохранённых bounds16×16,
а корректный исходный Size=S не должен получить принудительную миграцию в glyph-26.
Зафиксировано как расширение того же P0; manual/compiled/runtime пока не изменены.

## P0 — нормативное соответствие Addon / port / размер иконки (0.2.26, r14)

**Статус:** положительный live-сценарий Button40 подтверждён; отрицательный
прогон 08:33 с вариантом glyph Size24 выявил два P0 выше. Матрица Button56 /
правый Addon ещё не принята; размерная политика целиком не закрыта.

- В существующий RuleID `component:web-core.button.addon-size-follows-button-size`
  добавлены typed constraints активного порта, ширины и высоты. Button32/40 →
  Addon16 / Icon-20 / 20×20; Button48/56/64/72 → Addon24 / Icon-24 / 24×24.
- Это нормативная таблица manual source. Compiler компилирует универсальные
  `dependencyDomain` в прежний Predicate Engine, без Button-веток в runtime.
- Размер измеряется у instance иконки. Допуск ±0.01px явно хранится в manual.
  Порт/размеры применяются к доказанному glyph-26; исходный legacy не переоценивается.
  Новая legacy-замена запрещена прежним правилом; unknown не превращается в pass.
- В форме есть выбор каждого ограничения; сохранение не переставляет constraints
  и не теряет правки. Все 26 RuleID и пользовательская цель PaintMe сохранены.
- Generated facts и source snapshots не менялись; compiled/projections/ZIP обновлены
  только сборщиком. 43 атомарных проверки вместо 37.

Проверено: **171 тест**, typecheck/build; 5 исторических engine/editor replay
совпадают точно. Browser smoke: четыре формы, сохранность порядка/несохранённых
правок, изменённое соответствие влияет на проверку, JSON и ZIP roundtrip с Node
parity. Диагностика показывает размер/порт и выбранный диапазон, не дерево boolean.
На снимке 05:38 с r14: 200 compliant, 13 not-applicable, 9 not-executed, нарушений
и inconclusive нет. Это повторный расчёт, не live-приёмка новых правил.
Прежний warning `target.spinner: missing` не закрыт. Google Sheets: правило
1823, Predicate AF10:AH10 и legacy drift 51 синхронизированы и прочитаны обратно.

Приёмка: переимпортировать r14 в Editor 0.2.26; проверить исходный Button40,
затем доступный отрицательный сценарий на копии (неверный размер instance glyph-26).
Проверить Button56 с glyph-26 24×24 и обе видимые стороны. Не создавать недоступные
в реальном компоненте состояния ради теста. Сохранить JSON-отчёты; статус Draft
и прежние context-only/delegated gaps остаются до отдельного закрытия.

**Live-приёмка 2026-09-26 08:31:16:** отчёт
`button.validation-report.2026-09-26T08-31-16-893Z.json`, Editor 0.2.26,
manual r14 полностью совпадает с каноническим source (hash
`63a319e1c4b9af614e0948fc0235b37c94d2191252f8d8c3a83e184adc49da25`).
Button40 Primary, instance 12982:59338: 15/15 узлов, capture warnings=0.
Левый Addon16, активный Icon-20, glyph-26 INSTANCE 20×20: четыре проверки compliant.
Правый Addon скрыт: четыре проверки not-applicable с доказанным target-hidden.
Иконка совпадает с default текущего варианта; separate new-swap catalog rule
не применяется по changed=false, не из-за недостающих данных.
Итог: 200 compliant, 13 not-applicable, 9 not-executed; violations/inconclusive=0.
Engine, Editor diagnostics и экспортированные details воспроизводятся точно.
Независимый host-variant reference сопоставлен. Warning отсутствующего Spinner
и прежние 9 пробелов остаются; весь контракт не переводится в Ready.
Контрольная подмена width 20→24 только в памяти даёт ровно width-нарушение;
это не отрицательный live-прогон и исходный отчёт не менялся.

**P2 — читаемость остальных dependency diagnostics:** новые port/width/height
карточки показывают значения, но component-set mapping ещё выводит агрегат
`[false,true] → at least one true`; исключённые hidden-target проверки —
`[false,unknown] → all true`. Вердикты корректны. Показать выбранный Addon set
и причину «слот скрыт», не переинтерпретируя Predicate Engine truth.


## P0 — сохранить host-настройки и определить активный port (0.2.25)

**Статус:** исправления подтверждены положительным live-прогоном 05:38:21 на том
же экземпляре 12982:59338. Нормативные 26 правил r13 не менялись.

1. Same-set variant меняется через `setProperties(main.variantProperties)` на
   pristine host clone. Проверяются типы VARIANT и итоговые variant/set keys.
   Не стираются библиотечные overrides Button внутри Addon. Actual styles не
   копируются; explicit icon swap продолжает очищать overrides прежнего glyph.
2. Активный port определяется по единственному consumer, ближайшему owner,
   точному property reference и main ID одновременно в actual и reference.
   Неактивные объявленные Icon-16/Icon-20 не считаются неоднозначностью.
3. Новое read-only evidence v3 хранит способ variant capture. Старые v1/v2 JSON
   воспроизводятся без изменения результатов — для исправленного эталона
   обязателен свежий снимок, не переписывание сохранённого отчёта.

Проверка: **163 tests**, typecheck/build; точный engine/editor replay четырёх
отчётов 22:21:40, 22:21:52, 22:26:50, 00:53:41. Последний snapshot сохранён
неизменённым как regression fixture. Counterfactual model исправленного reference
отмечен отдельно от live evidence. Sandbox проверяет setProperties, сохранность
белого host paint, отсутствие actual-style leakage, cleanup, API refusal,
отсутствующие VARIANT properties и no-op с неверным итоговым key.
Также покрыты реальный manual fill override, неактивные ports, несколько
consumers, повреждённые bindings и сохранность legacy-swap violation.

**Live-приёмка, 2026-09-26 05:38:21:** 15/15 узлов, warnings=0, violations=0,
inconclusive=0. PaintMe сохраняет белый токен и paint opacity≈0.94 в actual и
independent reference. Активный Icon-20 имеет единственного consumer glyph-26,
`changed=false` относительно default текущего варианта; исключение new-swap
правила обосновано, это не unknown. Type delta Icon-16 → Icon-20 сохранён.
Полный engine/editor replay совпадает с экспортом. Девять «Не выполнено» —
прежние context-only/delegated пункты; пакет Draft, не полная проверка компонента.

В session manual добавилась только цель `target.paint-me`; 26 правил идентичны
отчёту 00:53:41. Revision осталась 13, новый проверенный hash:
`16b271f528de7788f5425674565214121cab98c15baff583e550d997711f827a`.
На диске manual не перезаписывался. Контрольная подмена токена PaintMe в памяти
даёт две прежние atomic fill violations; исходный отчёт и Figma не менялись.
Отдельного отрицательного live-прогона 0.2.25 ещё нет; не смешивать его с replay.
Задача 20/24dp размеров ассета этим не закрывается.

## P0 — эталон выбранного nested variant (0.2.24)

**Статус:** live-приёмка 00:53:41 выявила два P0 дефекта; целиком не принято. Это отдельный предварительный
шаг перед Icon-20/размерами ассета, не закрытие всего Addon epic.

- Причина: смена Type внутри одного Addon set меняет variant key. Раньше она
  изолировалась как замена целого компонента без независимого reference.
- V2 snapshot evidence отличает same-set variant от другого компонента; explicit
  INSTANCE_SWAP сохраняет приоритет. Независимый host clone получает точный
  вариант. Core проверяет set/key, свойства варианта, структуру и контекст.
- Visual baseline берётся у нового варианта; исходный baseline VARIANT-свойств
  сохраняется. Совпадение set не разрешает смену Type автоматически.
- Icon-port lineage берётся из подтверждённого нового варианта. Другой set,
  неизвестная идентичность и дополнительный swap внутри нового варианта —
  unknown/«Не выполнено». Старые v1 отчёты не переинтерпретируются.
- Regression: независимые synthetic core fixtures, запрет Type, внутренний
  opacity, неверный set/properties/context, JSON replay и main-plugin sandbox
  capture/cleanup на успехе и отказе. Прежняя live-приёмка 0.2.23 сохранена.

Проверено: typecheck/build, **155/155 тестов**; точный replay Predicate Engine и
Editor diagnostics трёх пользовательских отчётов 22:21:40, 22:21:52, 22:26:50.
Live-прогон 0.2.24: `button.validation-report.2026-09-26T00-53-41-300Z.json`,
Figma instance `12982:59338`, Button40 Primary, manual r13. Engine/editor replay
точный. Все 15 узлов сопоставлены, warnings нет; левый Addon16 Icon-16 → Icon-20
распознан, 5 узлов получили independent-host-variant. Но это не доказывает
корректность самого reference: он потерял библиотечный цвет host внутри boundary.

**P0 — сохранить host overrides при nested variant switch.** Присваивание
`consumer.mainComponent = main` очищает не только пользовательские overrides,
но и настройки, заданные автором Button внутри Addon. В исходном pristine host
и actual PaintMe белый (#FFFFFF, paint opacity≈0.94, одинаковый tokenId), а в
построенном reference — #2288FA, opacity=1, другой tokenId. Два RuleID дают одно
ложное отличие. Для same-set variant переключать VARIANT-свойства только на
pristine host, проверять итоговый key/контекст. Не копировать стили из actual.
Отдельный explicit icon swap из 0.2.23 не менять. Regression должен моделировать
разные цвета Addon default и Button-host override, чего synthetic fixtures не делали.

**P0 — выбирать активный swap port по фактическому consumer.** Figma отдаёт оба
Icon-16 и Icon-20 в componentProperties; текущий подсчёт объявленных ports даёт
`ambiguous-swap-port` и human-review. Единственный consumer diamonds ссылается
на Icon-20#119275:0, его main ID совпадает с owner property. Требуется доказанная
lineage в actual и независимом reference; не выбор по имени Type и не первый port.
Тесты: неактивный объявленный port, два реальных consumers, повреждённый binding.

В отчёте: 2 atomic violations (одна заливка), 1 human-review, 9 not-executed.
Исправления по итогам диагностики пока не внесены; нормативный manual не меняется.

**Для проверки:** Button32/40, Addon16: Icon-16 → Icon-20 без дополнительной
замены glyph. Затем override opacity внутри нового варианта и экспорт JSON.
Отдельно повторить принятый сценарий swapped icon из 0.2.23.

**Следом:** typed constraint 20/24dp и допустимого адаптера в manual с compiler
lowering, не зашитый в runtime. Не сравнивать размер glyph20 с контейнером16.
Источник: ds-ai-hub `button/bridge.md`, `button/figma/cookbook.md`, `icon/bridge.md`
и Athena Button variant structures. Ручной r13/RuleID не менялся, пакет Draft.

## P0 — Addon: исполняемый размер, происхождение иконки и baseline замены

**Статус:** размер Addon и происхождение swap приняты по live-отчётам 21:26:44
и 21:26:53 (0.2.22 / r13). Независимый reference 0.2.23 подтверждён live-отчётами
22:21:40/22:21:52 и отрицательным кейсом 22:26:50 на заменённом instance.
Основной сценарий independent reference принят; весь Addon epic не закрыт.

### Следующий шаг, реализован 2026-09-26 — reference нового содержимого

- Только read-only capture evidence; manual r13, 26 RuleID и normative policy
  не меняются. Production Apollo, Athena и ds-ai-hub не изменяются.
- Временный библиотечный host сохраняет Addon/`PaintMe`; точный новый main component
  подставляется в подтверждённый порт без наследования overrides старой иконки.
  Тестируемый instance не клонируется в качестве эталона и не модифицируется.
- Общий pure core проверяет identity, lineage, modes, host facts и структуру;
  только после этого выдаёт baseline нового содержимого. Роли старой иконки
  не наследуются. Проверки запускает прежний Predicate Engine, новых hardcoded правил нет.
- Нарушение допустимости каталога остаётся независимо от проверки внутренностей.
  Диагностика непроверенной области больше не сообщает, что допустимость тоже неизвестна.
- JSON содержит независимые исходные snapshots и причины неудачи, а не только
  готовый verdict. Старые отчёты без нового evidence сохраняют точный replay.
- Лимиты: 8 references последовательно, 500 узлов на capture. Ошибка Figma API,
  недоступные modes/keys, неоднозначность или повреждение структуры — «Не выполнено».
  Все временные hosts/page удаляются в finally. Вложенные swaps внутри нового
  содержимого пока не разрешаются рекурсивно; это явный gap.
- Проверено: 149 тестов, typecheck/build, sandbox success/failure и отсутствие
  изменения пользовательского instance, JSON replay, четыре точных replay старых
  live-отчётов. Хэш manual r13 остаётся
  `428630e19bad5e14b6423c6a0102026262684f70ca9ca1d4c86af3db1fc6c057`.

**Live acceptance, 2026-09-25 22:21:40/22:21:52:** оба отчёта 0.2.23 / manual r13,
26 исходных правил, 37 RuleIR checks; engine и Editor report воспроизводятся точно.
Обычная Button: 16/16 узлов, 6 сгруппированных нарушений, 9 «Не выполнено».
SingleIcon: 7/7 узлов, 7 нарушений; иконка и vector имеют
`baselineProvenance.kind=independent-host-swap`, gap reference исчез (8 → 7).
Запрет legacy-каталога и отличие PaintMe сохранены, warnings отсутствуют.

**Отрицательный live-кейс, 2026-09-25 22:26:50:** opacity заменённого instance
`digit-one-off-circle` = 0.5, independent baseline = 1. Правила
`component:core.web.button.root.visual-style-1.3.1` и
`component:web-core.button.manual-layout-and-appearance-overrides-prohibited.1.10`
дают одну новую карточку: 7 → 8 групп (12 → 14 atomic violations).
Все семь прежних групп неизменны; 7/7 узлов сопоставлены, warnings нет,
7 остальных «Не выполнено» сохранены. Engine/editor replay точный, manual r13
и его хэш не изменились. Основной сценарий построения/использования reference принят.

**Дополнительная QA-матрица:** дочерний VECTOR `icon` в этом отчёте имеет opacity=1,
он не был изменён. Его override покрыт автоматическими тестами и read-only пробой
в памяти (0.4 vs 1), но не отдельным live-отчётом. Не смешивать эти виды подтверждения.
Отказ получения reference также обязан сохранять неполноту с конкретной причиной;
этот путь покрыт sandbox/regression tests, не отдельным пользовательским прогоном.

**Не закрывает:** собственный семантический контракт иконки; рекурсивные nested swaps;
Icon-20 adapter/размеры ассета; formal detach; оставшиеся context-only/delegated правила.

### P1 — выделение общего ядра для следующего Apollo

Сейчас `src/core` физически находится в Editor; общий Predicate Engine подключён
из Apollo Proxy. Выделить compiler, factual adapters и replay в версионируемый пакет
без DOM/Figma зависимостей, подключить CLI/Editor/Proxy без копирования. Критерий:
одинаковые manual+facts дают идентичные compiled contracts и verdicts во всех
потребителях; один набор golden/parity tests. Массовый аудит страниц и ленивую
загрузку контрактов оставить оболочке Apollo, не встраивать в Editor.

### История 0.2.22

Реализовано: `dependencyDomain` в manual/Editor/compiler, компактный read-only
asset catalog, versioned `dependency-facts-v5`, два прежних RuleID и обе стороны.
На двух последних пользовательских snapshots: скрытые addons исключены; Addon24
при Button56 проходит, legacy `digit-one-off-circle` после swap выявляется.
140 тестов, браузерные import/edit/download и Node parity. После этого live-приёмка
подтверждена двумя отчётами 21:26:44/21:26:53, 6/7 сгруппированных нарушений.

Оставшиеся отдельные gaps: Icon-20 adapter и 20/24dp самого ассета; формальное
нарушение detach/повреждения wrapper (сейчас unknown); расширенная QA-матрица
глубоких overrides после swap. Основной reference принят в 0.2.23.
Пакет Draft, production не меняется.

Основание: live-отчёт `button.validation-report.2026-09-25T12-31-02-020Z.json`,
manual r12, актуальные локальные Button Athena facts и ds-ai-hub Button/Icon bridge.

- У Addon нет component property Size. Размеры 24 и 16 представлены отдельными
  component sets: `f33ce04b0651b062f10be88deab065ba67bf7171` и
  `24e2f4ddddc89ef024f8f1ef3f4bc51a0e5eac68`. Они подтверждены одновременно
  `button/figma/keys.json` и Athena contract.generated. Внутри доступны Type,
  INSTANCE_SWAP ports и Slot. Число из имени Type не заменяет identity evidence.
- До 0.2.22 правило `component:web-core.button.addon-size-follows-button-size` было
  context-only: единственный typed constraint проверяет ancestor, а таблица
  48/56/64/72 → Addon24 и 32/40 → Addon16 записана только в rationale.
  Простая смена route на predicate не реализует проверку размеров. Нужна явная
  редактируемая таблица соответствия в manual source и общий compiler lowering.
- Семантическая цель left-addon указывает на FRAME-обёртку, а Addon INSTANCE
  находится уровнем глубже. Проверять необходимо обе стороны, effective visibility,
  реальную component identity и неоднозначность; не извлекать Size из соседней иконки.
- Точный variant key `200fd99ef461b14df2e43f45b8b3d28a72d33a88` (digit-one-off-circle)
  найден в `JSONS/indexes/icons/Icons -- general (glyph).index.json`, set
  `ca2814dbb14c006fdfb3324ad63d38af54fc6783`. Это положительное свидетельство legacy,
  а не вывод из отсутствия в каталоге glyph-26.
- Библиотечный baseline diamonds, key `6cef3ffc12e9e4fcb6d1765b9e6eddcf29ce22e0`,
  также находится в general (glyph). В ds-ai-hub Icon bridge различаются новые
  макеты/новые swaps и встроенные библиотечные иконки. В manual r12 отсутствует
  исполняемый контекст, позволяющий выразить это различие без дополнительного решения.

**Решение владельца, 2026-09-26:** нетронутый библиотечный legacy допустим;
требовать glyph-26 при явной замене. Неизвестный/конфликтующий ключ — unknown.

**План и оставшиеся критерии:**

1. Уточнить два существующих manual RuleID, typed mapping, применимость и targets;
   не добавлять параллельные нормативные правила в код. Синхронизировать изменения
   с Rules/ledger/Core components по AGENTS design-system_ab.
2. Build-time скомпилировать компактные identity/family facts из Athena. Совпадение
   ключа доказывает происхождение; незнакомый/конфликтующий ключ даёт unknown,
   а не нарушение. Не загружать сырые каталоги в Predicate Engine.
3. Разрешать nested targets по точной lineage и component keys с учётом вариантов,
   скрытых/отсутствующих слотов, замен и detach; применять явную size mapping.
4. Проверять допустимость swap отдельно от состояния его содержимого. Для нового
   содержимого строить независимый reference в контексте host/port; не переносить
   baseline старой иконки и не терять цвет, унаследованный от PaintMe.
5. Golden tests: обе стороны, размеры 32–72, hidden/absent, valid glyph-26, legacy,
   unknown key, неверный Addon set, неоднозначный порт, изменённые внутренности,
   сохранность r12/RuleID и старых report replay. Пакет остаётся Draft до покрытия.

В 0.2.22 обновлены manual, производные артефакты и compiler. Сам Predicate Engine
не менялся: новые проверки используют существующие операторы. Документы ds-ai-hub
не переписывались; расхождение политики исходного legacy фиксируется в леджере.

## P0 — восстановление r12; P1 — группировка одинаковых отличий (0.2.21)

**Статус:** подтверждено пользователем; два live-отчёта 12:30:49 и 12:31:02
проверены, r12 содержит 26 правил. Группировка сохраняется в 0.2.22.

- Два live-отчёта 09:55:07 и 09:55:29 подтвердили исправление TextEncoder в 0.2.20.
  В первом точно распознана граница swap через Icon-24: 5 узлов сопоставлены,
  новая иконка и потомок изолированы; во втором сопоставлены все 16 узлов.
- Оба прогона использовали r8 / 24 правила. В отдельный ZIP восстановлен manual
  r12 / 26 правил из отчёта 06:59. Общие правила идентичны; новые не сочинялись.
  Восемь исходных Athena evidence файлов скопированы побайтово. Сохранены хэши
  происхождения, старые ZIP/отчёты и нормативный manual на диске не изменены.
- UI группирует только одинаковые atomic baseline diffs по узлу, свойству,
  actual/expected. Все RuleID, названия и severity доступны внутри карточки.
  Различные ожидания/токены/цели и неисполненные правила не схлопываются.
- JSON, Predicate Engine и coverage не меняются. Счётчики карточек согласованы
  с фильтрами/Anatomy; число исходных срабатываний выводится отдельно.
- На r8-отчёте 09:55:29: 7 срабатываний → 6 карточек, цвет Label показан один раз
  с двумя RuleID. В 09:55:07 остаются 5 отдельных отличий.
- Проверено: 131 тест, typecheck/build, пять точных replay прежних engine results;
  браузерный импорт реальных ZIP r8/r12, раскрытие RuleID с клавиатуры, переход
  в Anatomy, download/replay parity и неизменность исходных файлов. Для r12
  на свежих снимках: 11 → 6 и 12 → 6 карточек; «Не выполнено» остаётся 10/11.
  Это replay пользовательских снимков, не новая live-проверка в Figma.
- Правила не редактировались; восстановление не закрывает ранее отмеченный
  pending Google Sheets sync и не объявляет контракт Ready.

**Далее:** приёмка восстановленного пакета r12 в Figma; admissibility/effective
contract заменённого компонента; защита импорта от случайного понижения manual
revision и замены несохранённых правок (нужен явный diff/подтверждение).

## P0 — совместимость хэширования с sandbox Figma (0.2.20)

**Статус:** подтверждено live-отчётами 09:55:07 и 09:55:29 от 25 сентября.

- Ошибка `TextEncoder is not a constructor` появилась в strict baseline capture
  0.2.19: общий SHA-256 впервые стал исполняться в main sandbox, не только в UI.
- UTF-8 кодирование не зависит от TextEncoder; сохранена совместимость хэшей,
  включая кириллицу, emoji и непарные UTF-16 surrogates. Глобального polyfill нет.
- Регрессия воспроизводит исходное падение и проверяет собранный `dist/code.js`
  без TextEncoder и с неконструируемым значением, с обычным и заменённым instance.
  Независимый baseline и изоляция заменённого содержимого сохраняются.
- Проверено: 125/125 тестов, typecheck/build, точный replay Predicate Engine
  для отчётов 00:01, 06:40 и 06:59. Live-проверка этим не заменяется.
- Manual r12, Athena facts, исходные пакеты/отчёты и Predicate Engine не менялись.
- Приёмка: перезапустить Editor 0.2.20 без переимпорта r8, проверить тот же Button
  и скачать свежий отчёт. Предыдущие задачи по swap-domain остаются открытыми.

## P0 — instance swap не блокирует оболочку и не наследует чужой baseline (0.2.19)

**Статус:** реализовано локально; новая live-приёмка необходима.

- Основание: отчёт `button.validation-report.2026-09-25T06-59-32-320Z.json`,
  manual r12 / 26 правил. Замена diamonds → digit-one-off-circle делала всю
  Button-анатомию unknown, а дочерний `icon` ошибочно получал baseline diamonds.
- Capture собирает nested componentKey/mainComponentId и точный mainComponent
  property reference. Уникальный owner + INSTANCE_SWAP port + согласованный parent
  локализуют замену; имя не доказывает идентичность или допустимость.
- `variant-facts-v4`: проверка оболочки отдельно от непрозрачных областей.
  Неизвестные identity и смена key остаются coverage gaps. Baseline очищается
  во всём таком поддереве, включая одинаково названные дочерние слои.
- Live baseline mapper строгий по умолчанию; старый name/role mapper оставлен
  только как явный legacy adapter. Пересобираются relations для resolved targets,
  чтобы self-and-descendants правила ссылались на реальный semantic root.
- 119/119 тестов, typecheck/build; старые engine replays 00:01, 06:40, 06:59
  совпадают. Browser r12 import → snapshot replay → download с Node parity.
- На старом 06:59 snapshot: видны 9 срабатываний для 5 изменений Button/LeftAddon,
  обе SingleIcon проверки проходят, неизвестное содержимое остаётся непроверенным.
  Это replay, не свежий Figma capture; старые данные не содержат nested identity.
- Manual r12, исходные ZIP и отчёты не изменены. В design-system_ab расширен
  только технический enum snapshotProfile схемы, нормативные правила не менялись.

**Далее:**

- Live-приёмка swap с новым identity capture, в том числе замена без смены имени.
- Допустимые swap targets и effective contract нового содержимого в контексте host.
- Exposed/multi-consumer ports и структурные перестановки: пока fail closed.
- UI-дедупликация одинаковых findings реализована в 0.2.21 (см. выше);
  перекрывающиеся нормативные правила не удаляются автоматически.

## P0 — availability в диагностике полноты (0.2.18)

**Статус:** реализовано и проверено локально; повторная live-приёмка впереди.

- Отчёт `button.validation-report.2026-09-25T06-40-26-954Z.json` подтвердил
  SingleIcon=True: live reference согласован с Athena; две проверки состава прошли.
  Он же выявил ложные «Не выполнено» для трёх правил отсутствующего текста.
- Общий compiler helper используется в исполняемых проверках и coverage probes
  для context-only/delegated правил. Проверки наличия/отсутствия, количества и
  порядка не исключаются. Смешанные constraints не скрываются целиком.
- Missing API availability в diagnostic-only probe теперь явно unknown; отсутствие
  пути в runtime facts не становится false / «Не применяется».
- Replay исходного отчёта: 13 passed / 10 not-applicable / 8 not-executed вместо
  13 / 7 / 11. Все 18 engine evaluations и contractReadiness сохранены;
  изменены только статусы nowrap, text-resizing, editorial Label.
- 110/110 тестов, typecheck/build, browser ZIP → исходный snapshot → download →
  точный Node replay; ошибок браузера нет. Это replay, не новый live-Figma прогон.
- Manual r8, Athena facts, ZIP, исходные отчёты и Predicate Engine не изменены.
  Нормативные правила не редактировались; прежний pending Google Sheets sync
  остаётся отдельным незавершённым пунктом ниже.
- Дальше: live False → True → False, затем отдельно bindings Addon/Loading,
  внешние политики и structural swaps; оставшиеся 8 пробелов не объявлены закрытыми.

## P0 — реальные возможности выбранного варианта (0.2.17)

**Статус:** SingleIcon=True подтверждён live-отчётом 06:40; приёмка переключения
вариантов и других representations ещё впереди. Coverage исправлен в 0.2.18.

- Проверено: 101 unit-тест, typecheck/build, 1056 вариантов Athena (528 SingleIcon
  pass / 528 excluded), browser ZIP → True/False/True → download/replay; manual
  не меняется. Это не live-Figma прогон.
- Синхронизация Google Sheets пока не завершена: connector перестал отвечать
  на чтение. Payload сохранён в Button `reports/knowledge-sync-pending.json`;
  перед отправкой перечитать строки и после записи проверить readback.

- Read-only Athena topology + exact variant identity + полный live reference;
  confirmed absence отделено от unknown. Missing property не становится false.
- Property consumers учитываются по границе owning instance. Semantic API и
  прямые Component Property проверки недоступного свойства не дают false violation.
- Переключение варианта не меняет ручные targets; preview node IDs не используются
  для сопоставления. Drift/неоднозначность не скрываются.
- SingleIcon r8: 2 проверки состава. Приёмка r7 с Label/Hint=true была ошибочной;
  synthetic fixture не доказывает достижимость состояния Figma.
- Следующий этап: structural swaps/slot contracts, exposed nested bindings,
  mode-dependent capabilities, authoring/reviewed scope reachability gate и
  coverage matrix по всем representations. Не объявлять их уже реализованными.

## P0 — Button: единый контракт с доказанным исполнением

**Статус:** in progress.

- Реализован этап применимости правил: Product/platform/channel/pageType,
  неизвестные variant/mode facts, запрет исполнения unmapped context и
  неподтверждённого scope. Матрица: `P0_APPLICABILITY.ru.md`.
- Ожидается live-Figma приёмка; весь Button-пилот не считается завершённым.
- Локально: Editor 44/44, Proxy predicate suite 229/230; один старый путь
  migration-wave audit требует отдельной актуализации после переноса каталогов.
- Следом: semantic runtime bindings, stable targets, controlPaths и обязательные
  variables, Athena regeneration, генерация → проверка, release/coverage gates.

## P0 — Прозрачность исполнения правил (0.2.12)

**Статус:** реализовано локально; ожидается приёмка в Figma.

- Reviewed-правила проходят проверку перед сохранением, обязательные поля
  подсвечиваются. Неуспешное сохранение не изменяет manual revision.
- «Не выполнено» показывает причины исключения и непроверенные делегации.
- Неполное покрытие явно помечается; неизвестность и отсутствие целей не дают
  ложного статуса полной проверки. Policy-only и известный scope mismatch
  отделены от ошибок исполнения.
- Регрессия: 51 тест Editor, typecheck и build проходят. Predicate Engine
  и пользовательские каталоги не изменены.
- Browser smoke на пользовательском ZIP с имитацией Figma snapshot прошёл:
  фокус/подсветка Rationale, неизменность ревизии после отказа в сохранении,
  причины исключения без фиктивных diff, очистка устаревшего отчёта.

## P1

### SingleIcon + явный host условий + Figma facts (0.2.16)

**Статус:** SingleIcon-модель и приёмка заменены 0.2.17; остальные изменения сохранены.

- Исправлена модель SingleIcon: Label/Hint=false перенесены из preconditions
  в ограничения. Один source Rule ID → четыре RuleIR-проверки; маршрут predicate,
  статус Draft до приёмки. Состав проверяется и по properties, и по видимым слоям.
- Generic quantity по union объявленных targets; missing/ambiguous/unknown и
  усечение не превращаются в успешный count. Скрытые предки учтены.
- Явный `conditionSubject` отделяет host от проверяемого вложенного слоя.
- Форма сохраняет дополнительные constraints/controlPaths, fact и platform scope.
- Собираются реальные text auto-resize/alignment/truncation/max-lines и parent
  layout/clipping; семантика Loading/Addon не выводится по именам.
- На неизменённых фактах отчёта 25 сентября: 5 нарушений сохранены,
  11 «Не выполнено» вместо 12, 13 пробелов пакета вместо 14; контракт остаётся Draft.
- 85 unit-тестов, typecheck/build; browser ZIP/save/replay и позитивные/негативные
  сценарии SingleIcon на модифицированном снимке. Это не замена live-Figma тесту.
- Manual r7 основан на пользовательской r6, остальные 23 правила неизменны.
  Evidence и исходные ZIP/отчёты сохранены; production и Proxy не менялись.

**Дальше:**

- Addon-size сейчас содержит только placeholder `ancestor`, а не размерную
  матрицу; нельзя просто переключить route. Нужны bindings конкретного nested
  Addon (цель сейчас указывает на wrapper), соответствие размерам и golden cases.
- Loading требует отдельного подтверждённого факта состояния и парного снимка
  до/после для ширины. Не выводить loading из совпадения внешнего вида.
- TextResizing/nowrap: facts собраны, но нужно разделить желаемое semantic API
  и наблюдаемую реализацию, чтобы не проверять вычисленное значение само на себя.
- Семантические цели: name-only fallback убран в 0.2.28; явная перепривязка и
  устойчивые generated lineage anchors остаются следующим этапом (см. выше).
- Структурированные controls для нескольких ограничений вместо JSON advanced
  полей; текущие поля обеспечивают сохранность и возможность редактирования.

### Готовность пакета / полнота сценария (0.2.15)

**Статус:** подтверждено пользовательским отчётом 2026-09-25T00-01-09-615Z;
engine/compiled/diagnostics и hashes воспроизведены без расхождений.

- Раздельные `contractReadiness` и `scenarioCoverage` в UI и JSON. Draft пакета
  не превращается в Ready после проверки одного удобного сценария.
- Применимость исключённых правил проверяет общий Predicate Engine через
  diagnostic-only probes. Исполняемые ограничения и manual не меняются.
- Missing/ambiguous targets и неизвестные условия не исключаются. Известные
  несовпадения platform/Product/variants/modes дают «Не применяется».
- Причины «Не выполнено» проверяют реальный snapshot: доступные facts показаны
  отдельно, наличие всех facts не активирует `context-only` автоматически.
- На отчёте 22:19:42: 14 пробелов пакета, 12 невыполненных правил сценария;
  mobile Hint и ControlBlur для View=Primary неприменимы. Все 40 результатов
  Predicate Engine, включая 5 нарушений, сохранены.
- Регрессия: 76 тестов; golden replay пользовательского отчёта и browser smoke.

**Следом, отдельные задачи:**

- Согласовать legacy Product `alfa-business` в `desktop-safe-variants` с
  идентификатором `ab`. До подтверждения это неизвестный scope, не «другой Product».
- Сопоставить оставшиеся context keys с явными facts и определить host для
  условий variant при `self-and-descendants`. Не выводить это из названий слоёв.
- Подключать оставшиеся context-only проверки и внешние делегации отдельными
  проверяемыми этапами. Нормативный manual и каталог Button в 0.2.15 не менялись.

### Replay, token ID и первые semantic bindings (0.2.14)

**Статус:** реализовано локально; ожидается повторный отчёт из Figma.

- JSON-нормализация до исполнения, проверка engine hash перед экспортом,
  сохранение evaluation IDs при replay. Старый отчёт 0.2.13 не изменяется.
- Полные token ID и раскрываемый JSON вместо обрезанного paint evidence.
- Явные root component-property bindings с точной representation identity;
  Hint/Size проверяются Predicate Engine. Missing/ambiguous остаётся unknown.
- Button manual r3: сохранён Athena ID запрета Hint для AB; пользовательский
  дубль deprecated. Универсальная Hint/Size проверка перенесена из context-only.
- Локально: 68/68 тестов, typecheck/build. Пакет Button остаётся Draft:
  11 context-only правил и 3 делегации не исполняются; controlPaths и сложные
  semantic facts требуют следующего этапа.
- Browser smoke на фактах пользовательского отчёта: полные token ID, раскрытие
  JSON, Hint true/false, Product ab/ao, Size 48/56 и точный replay Node/browser
  включая evaluation IDs. Новая metadata component identity имитирована;
  live-Figma приёмка этим тестом не заменяется.
- Реестр правил и Predicate Draft обновлены; drift продуктовой документации
  ds-ai-hub остаётся открытым, production-каталоги не изменялись.

### Скачивание отчёта проверки (0.2.13)

**Статус:** реализовано локально; ожидается приёмка в Figma.

- Отдельный JSON сохраняет фактический контекст прогона, snapshot/baseline,
  manual source, compiled/runtime контракты, ошибки компиляции и все результаты.
- «Не выполнено», неизвестные facts и временная активация Draft не теряются.
- Новая проверка, изменения контракта/Product очищают устаревший экспорт.
- Данные фиксируются на момент исполнения; импортируемый ZIP не изменяется.
- Проверки: replay parity, неизменность снимка, stale revision, Draft,
  исключённые правила, усечённый snapshot; локальный browser smoke.
- Регрессия: 57/57 тестов, typecheck/build; browser smoke на пользовательском
  Button ZIP подтвердил скачивание, replay и сброс экспорта при смене Product
  и сохранении правила. Figma snapshot в браузерном тесте имитирован.
- Приёмка: запустить Editor 0.2.13, проверить Button в двух Product и скачать
  оба отчёта. Сверить контекст, Rule ID и причины с отображаемыми результатами.

### Сопоставление правил между D/M representations одного компонента

**Статус:** open

Desktop/mobile являются representations одного семантического компонента с
единым componentId и manual source. Отдельные параллельные нормативные D/M
контракты не создаются. Добавить управляемое сопоставление существующих ruleId
с целями другой representation и её областью применимости.

**Требования:**

- автор явно выбирает исходную и целевую representation;
- перед применением Editor сопоставляет semantic targets по роли, lineage и
  structural fingerprint;
- проверяется совместимость capabilities, Component Properties, variants,
  modes и control paths;
- интерфейс заранее показывает правила, которые будут сопоставлены, пропущены
  или потребуют ручного разрешения;
- generated facts, compiled RuleIR, runtime policy и coverage не копируются;
- изменённые bindings/applicability требуют повторного review; ruleId сохраняются;
- существующие ручные условия не перезаписываются без отдельного
  подтверждения конфликта.

**Критерии приёмки:**

- совместимые правила Button D → M сопоставляются без потери manual-полей и смены ruleId;
- несовместимый или отсутствующий target не связывается автоматически;
- различия Component Properties и variants представлены до применения;
- отмена операции не изменяет общий manual source;
- round-trip общего контракта остаётся детерминированным;
- golden tests подтверждают parity Predicate Engine до и после переноса.

### CC-COMPAT-PORTABLE-DECLARED-TARGET-02 — переносимые привязки целей

09.10.2026. Shared core **0.1.12**, Editor **0.2.93**, локальный Apollo profile поддерживает `declaredTargetIdentityVersion=2`. В `identityBindingsV1` добавлен явный `portableReferenceHash`: из независимого reference hash исключаются только file-local `identity.mainComponentId` и `sourceIdentity.ownerMainComponentId`. Published component keys, sourceNodeId, тип, структура, свойства и остальные поля закреплены. Actual/source/reference обязаны совпадать с ближайшим текущим native owner; неизвестные факты, SLOT, подмена и дубликаты дают unknown. Старый policy v1 и bindings без portable hash сохраняют exact pin semantics. Новый compiled producer: `component-contract-editor@0.2.93`; неизвестные версии/неверный stamp отклоняются. В compact ZIP с несколькими вариантами importer восстанавливает диагностическое Anatomy первого варианта, который выбирается UI по умолчанию. Hash/полнота структуры проверяются; дерево помечено compact-structure-only и не создаёт runtime identity/permissions. Старые каталоги в current facts не подмешиваются.

Реализовано локально: compiler, runtime, Editor roundtrip и Apollo profile. Synthetic regressions проверяют import между документами, скрытую цель, stale reference, foreign source/owner, неоднозначность и incomplete capture. Полные gates core228, Editor823 и Apollo root81 regression files прошли. Apollo: type-check и 565 synthetic tests прошли в текущем совместном source (параллельно добавлен mapping port); финальный стандартный build после обновления ZIP остановлен `STALE_CONTRACT_PIN: buttons-group.desktop` (producer registry ещё закрепляет r59). Main/UI сборка для текущих ZIP и consumer reload не подтверждены; нужен exact source/registry/mapping/lock refresh без обхода source gate. Пакет BenefitCard r3: независимо сверены 32 native variants / 96 bindings; replay десяти пользовательских отчётов даёт четыре ожидаемых violation и 16 compliant, без unknown в двух quantity checks. Private captures остаются в current-contract-packages, не в source fixtures. **Полный live coverage и release/publication открыты**; свежий user cycle Title/Graphic зафиксирован ниже; 29 context-only норм BenefitCard этим изменением не закрыты.

ButtonsGroup data handoff: desktop r60 сохраняет 17 Reviewed Figma norms / 30 неизменённых predicate bodies, mobile-web r3 — 19 Draft Figma norms / 29 bodies. Девять mixed context/recipe/interactive норм с исходными RuleID и текстами перенесены в `context/recipe-rules.json` каждого пакета. Loading уже проверяется direct-child Button r31 (Spinner r8); width требует двух последовательных снимков. Group Loading и фиктивные handlers/action IDs не вводятся. Source/code parity, актуальные Generation/registry lock pins и frontend/live/release приёмка отдельно открыты. Закрытие consumer rollout: прочитать точные новые ZIP/source hashes, подтвердить fail-closed старого/неподдерживаемого policy и получить свежий положительный/отрицательный прогон в установленном Editor/Apollo. Парные записи: Editor `docs/BACKLOG.ru.md` и Apollo `docs/ARCHITECTURE_BACKLOG.md` под этим stable ID.

09.10.2026: fresh installed Editor 0.2.93 / BenefitCard r3 scope verified by 8 user reports: desktop/mobile baseline, hidden Title, reset and hidden Graphic. Exact source/runtime/snapshot hashes and engine/editor replay match. Four expected violations, 12 compliant, zero inconclusive; Root/Title/Graphic all resolved. Scope is Vertical/Left/Background=True/Compact=False on two captured published variants, in authoring preview with Draft rules activated. All32-variant live acceptance, remaining29 norms, manual Reviewed/source/code/release gates remain open. Evidence: shared/design-system_ab/experiments/current-contract-packages/BenefitCard/reports/r3-user-runs-review.2026-10-09.json; private reports stay outside source fixtures. Google Rules/ledger/Predicate comments read back; full Predicate remains Draft.

### CC-COMPAT-DECLARED-TARGET-IDENTITY-01 — local shared application

Opt-in `declaredTargetIdentityVersion: 1` and closed `identityBindingsV1` declarations separate exact native membership from diagnostic roles. Shared core adds guarded resolver, compiler membership selectors and complete-chain presence/visibility facts; unmarked contracts keep the original compiler/evaluation route. Paired local technical versions: core 0.1.11, Editor 0.2.92, Apollo profile 0.4.1. The new compiled opt-in stamp is `component-contract-editor@0.2.92`. Reviewed repair applied locally to shared source; no release publication.

Consumer impact: explicit support and malformed/unknown policy rejection in Apollo profile; Editor export/import through the same candidate core. Normative rules/permissions, Draft/source/coverage and native/live/release acceptance remain unchanged. Verified privately: legacy38 exact replay 38/38, core 115/115, Apollo 357/357, generation-core 179/179, Editor 822/822, Apollo root 81 regression files, paired consumer proof 3/3 and final builds. The scoped NATIVE-12 opt-in revisions are conclusive; CORRESPONDENCE-3 remains UNKNOWN. Private candidate independently reviewed by General. Status: local shared application and current UI03 paired compatibility verified: core115, Apollo 374 (all UI03 tests retained), generation-core179, Editor822 and root81 PASS; final generation build uses SDK0.1.11/profile0.4.1 with171 inputs. Current built chat/browser153 checks and declared-target UI76 checks/9cases passed, plus existing audit/generation/native/static-review browser gates. Original38 replay remains deep-exact and three unmarked authoring families compile identically. General stage2 independent review is pending. Native/source/coverage/live/release acceptance remains separate. BC-D06/PC-D04/PC-M06 native correspondence and BenefitsBlock current26 source remain separate inputs.

Paired records: Editor `docs/BACKLOG.ru.md#cc-compat-declared-target-identity-01--local-shared-application`; Apollo `docs/ARCHITECTURE_BACKLOG.md#cc-compat-declared-target-identity-01--local-shared-application`. No private captures/catalogs are checked into source fixtures.

#### 07.10.2026 · Cycle52 · configured-native и BC-D06: этапы разделены

Точный opt-in configured-native@1 source delta принят General:6 core source/test
files,54 focused regressions на identical private bundle, independent rebuild
из actual shared source. Shared implementation accepted; shared core dist0.1.11,
Editor0.2.92 и Apollo profile0.4.1 остаются прежними. API: root/self typed BOOLEAN/
VARIANT configuration conformance; unmarked/visual guards сохранены. SourceReady,
consumer integration, live/release и main norm activation не приняты.
Generation реализует только private paired runtime/Editor/v4 consumer candidate:
version mismatch fail-closed, missing-root diagnostics UNKNOWN в ledger/coverage/report,
без false pass/complete/Ready. Критерий consumer закрытия: concrete reviewed diff,
полный actual private source/build inventory и focused consumer boundaries;
последующий shared rollout получает отдельный exact sole-writer handoff.

BC-D06: independently replayed3 reports/5 probes. Текущий V1 не объявляет связь
Title с независимой Secondary native branch; data-only замена/duplicate/stale
reference отвергнуты. Contract готовит private closed declaration/schema data,
без core implementation и нормативного изменения. Отдельный библиотечный
Compact default расходится с main нормой; Figma repair не назначен. HiddenTitle,
ambiguous/foreign/stale/SLOT guards остаются обязательными. Сопоставление identity
и соблюдение Compact-нормы проверяются раздельно.

General source review: /private/tmp/apollo-pc-configured-property-source-general-review-2026-10-07/general-source-review.json.
General BC review: /private/tmp/benefitcard-BC-D06-general-review-2026-10-07/general-review.json.
Парная запись: ComponentContractEditor/docs/BACKLOG.ru.md и Apollo/docs/ARCHITECTURE_BACKLOG.md,
existing CC-COMPAT-DECLARED-TARGET-IDENTITY-01. Private captures не добавлены в tracked fixtures.


## CC-COMPAT-DEPENDENCY-USAGE-01 — parent usage rules на fixed child (12.10.2026)

**20.10.2026 — перенос в общий Core 0.1.21 / Editor 0.2.107.**
Общая реализация компилирует и материализует opt-in `editorDependencyUsages`
version1 с прежними prefix/producer0.2.104. Editor использует re-exports;
32 символа и одна строка остаются нормами manual BenefitCard, не глобального Link.
Exact dependency pins, child TEXT identity, root TEXT control и независимый
baseline проверяются прежним способом. Missing/foreign/stale/неполные факты
остаются UNKNOWN; producer/baseProducer и неизвестные метрики fail closed.

Consumer impact: Apollo source compilation теперь может воспроизвести весь
сохранённый usage projection. Source/cache/stamp guards не обходятся. Отдельный
существующий gate `authoring-preview requires ready dependencies` сохраняется:
Link6/IconView9/BackgroundPlate6 остаются Draft. Подключение BenefitCard к
checking требует самостоятельного решения этого admission gate и последующей
приёмки данных; перенос сам по себе не делает компонент Ready.

Private evidence:22 generic tests, exact compiled caches всех11 current data
contracts и10 retained native captures/3222 evaluations совпали. Это offline
reuse, не fresh native PASS. Shared configured validate и независимая приёмка
ожидаются в согласованном sole-writer окне General.
Evidence: `.local/apollo-contract-creation-2026-10-20/shared-dependency-usage/`.
Парная запись: `CC-COMPAT-DEPENDENCY-USAGE-01` в соседнем бэклоге Editor/Apollo.


**Исторический план r6 (до локальной реализации Editor ниже).** BenefitCard r6 candidate закрепляет Link r5
через exact pin/closure. Parent reference BottomContent=SwapMe не содержит
Link/Label; current core проверяет child отдельно и не переносит доказанную
child target identity в parent constraints. Нужна explicit opt-in привязка
`dependencyId + bindingId + childTargetId` для parent-owned правил: только текст,
≤32 символа, ≤1 строки. Не переносить эти лимиты в глобальный Link.

Использовать fixed-nested resolver, validated independent child capture/nodeMap
и child target ledger; сравнение запрета настроек — с pristine BottomContent.Link,
без принятия actual overrides. Missing/foreign/stale/ambiguous proof, отсутствующий
closure или line evidence → UNKNOWN; Bottom=false → notApplicable. Child Draft
authority не повышается parent preview. Нужны D/M positive/negative/RESET, hidden,
unknown и 37 прежних IR regressions. Exact pins и план: [BenefitCard r6](../../../shared/design-system_ab/experiments/current-contract-packages/BenefitCard/authoring/candidates/link-r5-integration-r6-2026-10-12/READER_FIX_PLAN.ru.md).

Парная запись Editor/Apollo. Общие core/compiler/runtime/build/config не менять
до sole-writer окна General по docs/APOLLO_SYNC_WORKFLOW.md. Generation pilot
не расширяется; native r6 и Ready не приняты.


**Уточнение владельца / Editor 0.2.104, 12.10.2026:** локальная реализация Editor
готова; перенос reader в Apollo **HELD_UNTIL_CONTRACT_ACCEPTANCE**. Shared core
остаётся 0.1.17. Подтверждено отсутствие Editor в 347 наблюдаемых физических входах
consumer/descriptor пилота; общий source/build/config и canvas не записывались.

Manual и compiled содержат явный Editor-only `editorDependencyUsages.version=1`
с exact dependency/binding/child TEXT target/host TEXT port. Derived факты root:
`editorDependencyUsageV1.<id>.nonTextChanged`, `characterCount`, `lineCount`.
Parent source limits не переносятся в глобальный Link. Конфигурация, layout, стили
и устройство сверяются с независимым BottomContent.Link; bounds/позиции, меняющиеся
при text reflow, остаются в собственных geometry нормах child. Child Draft authority
не повышается. Missing/foreign/stale proof остаётся UNKNOWN, hidden Bottom —
notApplicable. Projection пересчитывается после каждого capture, cached факты
не заменяют proof. Producer 0.2.104 opt-in отклоняется прежним общим reader.

Проверки Editor: typecheck, 852 regressions PASS (включая 23 целевых); ZIP/reopen,
37 прежних IR и 57 retained captures с новым synthetic scenario PASS. Native r7
D/M ещё NOT_RUN_USER_ONLY; полный контракт Draft. Изолированный пакет:
[BenefitCard r7](../../../shared/design-system_ab/experiments/current-contract-packages/BenefitCard.r7.editor-candidate.component-contract.zip);
[final evidence](../../../shared/design-system_ab/experiments/current-contract-packages/BenefitCard/reports/reading-fixes/editor-parent-usage-2026-10-12/HANDOFF.json).

Для v4: после приёмки native positive/violation/RESET принять совместимый producer
и explicit projection в общем reader в sole-writer окне General, проверить точные
pins/closure, historical replay, report/export semantics, UNKNOWN и child authority;
собрать и принять свежий consumer отдельной передачей. Тесты Editor не закрывают
Apollo consumer verification. Generation pilot scope не расширяется.


**Native r7 readback, 13.10.2026:** оба пользовательских baseline D/M от
12.10 (21:20:33Z / 21:21:00Z) дают UNKNOWN по трём parent Link usage нормам.
Validated child capture/nodeMap проходит; declared target.label остаётся
`reference-pin-stale`. API независимого эталона Link r5 содержит 10 полей и
4 Size, опубликованный вложенный Link — 8 полей и 3 Size; отсутствуют точные
`Left icon 20#145985:35` и `Right icon 20#145985:40`. Причина различия источников
пока не установлена; нормативный источник зависимости согласуется с владельцем.
Guard не ослаблен, Editor/shared core/v4 не менялись. Карточка и Link остаются
Draft; v4 перенос HELD. Отдельно в обоих сценариях отсутствует CardPlacement.
[Receipt](../../../shared/design-system_ab/experiments/current-contract-packages/BenefitCard/reports/live-review-r7-2026-10-12T21-20-33Z/review.json)
содержит точные pins и byte-equivalent engine replay обоих исходных отчётов.


**Source choice и черновик библиотеки, 13.10.2026:** владелец выбрал точный Link r5: 4 Size и порты20px. В исходной Corp Promo библиотеке обновлены только Link instances17:12838/17:12843 внутри D/M BottomContent; восемь прежних typed настроек, layout и Label typography сохранены. Native readback подтверждает10 полей/4 Size. Независимый pristine reference в Workshop совпал с configurationReferenceHash r5 `03e123c8e49794fafbd515175a102a28409297f46bd948087909ab7a111ce444`. Публикация не выполнялась; fresh parent native D/M baseline/negative/RESET ещё NOT_RUN_USER_ONLY. Сравнение этого pin в другом file context расходится по локальным ID неактивных INSTANCE_SWAP портов; переносимость в другие файлы не принята, guard не обходится. Editor0.2.104/core0.1.17 и ZIP r7/r5 неизменны; v4 HELD_UNTIL_CONTRACT_ACCEPTANCE. Evidence: `shared/design-system_ab/experiments/current-contract-packages/BenefitCard/reports/source-upgrade-r5-2026-10-13/HANDOFF.json`.


### CC-COMPAT-SCOPED-FIXED-DEPENDENCY-01 — зависимости по Figma representation и authoring admission

Review313: ошибочный Draft после снимка сохраняет доступ к паспорту и форме
dependencyDomain; подсказки используют снимок только при успешной admission.
Исполнение ошибочного источника остаётся запрещено. Mixed owned-code/scoped
проекция использует каноническую derived bindingVersion, сохраняя строгие отказы.
Обе регрессии воспроизведены до исправления; private repair314 ожидает приёмки.

Core 0.1.19 / Editor 0.2.106 candidate. Новый opt-in `fixed-nested-scoped` требует
непустые уникальные `representationIds` и `crossRepresentationBindingsVersion=2`.
Один точный child pin может иметь непересекающиеся D/M bindings через FRAME.
Off-scope становится notApplicable только после независимого доказательства
единственного actual host representation; stale/foreign/ambiguous/missing capture
сохраняют UNKNOWN. Старый unscoped route и direct-child не расширяются.

Editor проверяет compiler errors до preview/capture, повторного запроса и evaluation.
Неизвестная manual schema отклоняется при импорте. Compiled-only evidence остаётся
read-only; запуск и экспорт восстановленного без исходного manual пакета запрещены.
Ошибочный авторский Draft можно сохранить с validation=false без исторического
projection stamp, но после reopen он по-прежнему не допускается к исполнению.

Совместимость: старый compiled Core/Editor/V4 reader отклоняет feature version2;
старый Editor может повторно скомпилировать ошибочный источник, поэтому universal
old-authoring refusal не заявляется. Поддержка scoped-пакета требует установки
проверенной пары нового UI + core Editor 0.2.106; одиночная замена core недостаточна.

Private проверки: actual bundled UI/controller с controlled mocks, ZIP/reopen,
legacy compiler/runtime equality и fail-closed cases. Shared integration, полный
validate, текущие V4 consumers/config/runtime и native acceptance имеют отдельные
гейты; статус — **PRIVATE_VERIFIED / SHARED_ACCEPTANCE_PENDING**.
Generation pilot и Ready не расширяются. Закрытие: точная совместная сборка UI/core,
полный validate и paired consumer verification; затем отдельный native тест пакета.
Парная запись: [CC-COMPAT-SCOPED-FIXED-DEPENDENCY-01](../../Apollo/docs/ARCHITECTURE_BACKLOG.md).

### CC-COMPAT-NESTED-OWNER-TARGETS-01 — owner baseline и точные configured targets во вложенных проверках

19.10.2026. **SHARED_IMPLEMENTATION / CONSUMER_AND_NATIVE_PENDING**.
Core **0.1.20** / Editor **0.2.107**; точный согласованный patch применён.
Общий reader сохраняет независимо доказанный effective baseline вложенного owner
через child preparation и alias restore; более локальные child references имеют
приоритет. Для baseline-dependent IR объявленная отсутствующая/устаревшая/чужая/unknown
owner evidence не превращается в standalone HUG или expected из actual.
При unadvertised отсутствии owner payload сохраняется прежняя независимая проверка;
actual-only IR не требует owner baseline. Historical captures сохраняют семантику.
Typed public swap сохраняет только корень явно разрешённого слота и его независимо
известные native VARIANT поля. Потомки не наследуют идентичность. Для configured
variant descendant требуется уже объявленная exact native alternative того же
semantic target, representation/family и выбранная owner occurrence с полным
independent native ancestry proof. Имена и componentSet сами по себе не доказательство.

При reprepare/RESET очищаются только старые derived baseline.effective UNKNOWN
markers; actual uncertainty сохраняется, более локальный independent proof приоритетен.

Private generic regressions и bounded 18-child replay проверяют child baseline,
public swap root/foreign descendants, missing/stale/forged/unknown evidence,
physical ambiguity, native Size domain и RGB negative. Parent Size negatives
r11 [1,0,0,1,1,0,1,0] сохраняются; 4 canonical compiled hashes не меняются;
standalone Link RESET HUG/HUG и BackgroundPlate сохраняют прежние результаты.
Нормы, authority, ZIP/manifest/Sheets не меняются. Numeric FIXED20→33 остаётся
NOT_COVERED: существующий Link r5 не содержит root bounds.height IR.

Consumer impact: Editor и Apollo используют общий reader; explicit owner context
передаётся только internal typed аргументом/результатом, нового serialized capture
protocol или opt-in нет. Это меняет source/build pins при применении и требует
согласованного sole-writer окна, полного configured validate и consumer проверки.
Private PASS не означает shared apply/install, native acceptance или Ready.
Пилот генерации и его пауза не меняются. Shared apply/full validate PASS;
consumer/native acceptance ещё не выполнены.
Финальная совместимость: 71/71 generic, 212/212 тестов всех ранее упавших групп;
Core 427/427, Editor 877/877, Apollo root и V4 1102/1102 — full validate PASS.
Golden reports и нормы не менялись. 18 сохранённых child runs: 0 violation/human-review;
родительские Size negatives [1,0,0,1,1,0,1,0] и четыре ZIP/manual/compiled pins сохранены.
Exact source/build/config inventory и первый failed Editor log сохранены в
`.local/apollo-contract-creation-2026-10-19/benefitcard-residual-reader-working-apply`.
Это не приёмка runtime consumer или Ready.

Критерий закрытия: независимое private review, согласованное применение точного
patch, full configured validate, actual Editor/consumer acceptance и новые pins.
Парная запись: [CC-COMPAT-NESTED-OWNER-TARGETS-01](../../Apollo/docs/ARCHITECTURE_BACKLOG.md).

### CC-COMPAT-DEPENDENCY-REPRESENTATION-CONTEXT-01 — контекст независимых references дочернего контракта

19.10.2026. **SHARED_IMPLEMENTATION / CONSUMER_AND_NATIVE_PENDING**.
Применён общий fix `validatedDependencyCapture`: Core **0.1.20** / Editor **0.2.107**.
для единственной доказанной universal representation согласован собственный
bundle base/attempts; nested captures клонируются и сохраняют собственный канал.
Проекция references включается только при существующем `occurrenceAddressVersion=1`;
unversioned historical путь сохраняет прежний root-only rebase и точные replay hashes. Missing/foreign channel, modes, identity, reference и topology остаются
строгими отказами. Исходные snapshots не мутируют; новых opt-in/stamp/норм нет.

Private proof: 28 generic regressions PASS, 3 существующих singleton/Spinner tests
PASS, noEmit typecheck PASS. На двух сохранённых D/M Link materializations Underline
восстановлен; paired 18 child cases сократили human-review 158→8, r2 сохранил результат.
Все 4 canonical compiled hashes, standalone Link HUG/HUG и 8 BackgroundPlate runs
неизменны. FIXED/HUG и оставшиеся Link/IconView UNKNOWN не закрыты этой правкой;
приоритет host baseline не менялся. Source authority и Ready не повышаются.

Consumer impact: общий reader используется Editor и Apollo; применение меняет
source/build pins и требует sole-writer окна, configured validate и отдельной
совместимости фактического consumer. Private PASS не означает установку в Editor,
приёмку Apollo/Proxy или снятие паузы генерации. Shared apply и полный configured validate **PASS**; consumer/native acceptance
ещё не выполнены. Pilot scope не расширяется.

Финальная совместимость: 71/71 generic, 212/212 тестов всех ранее упавших групп;
Core 427/427, Editor 877/877, Apollo root и V4 1102/1102 — full validate PASS.
Golden reports и нормы не менялись. 18 сохранённых child runs: 0 violation/human-review;
родительские Size negatives [1,0,0,1,1,0,1,0] и четыре ZIP/manual/compiled pins сохранены.
Exact source/build/config inventory и первый failed Editor log сохранены в
`.local/apollo-contract-creation-2026-10-19/benefitcard-residual-reader-working-apply`.
Это не приёмка runtime consumer или Ready.

Критерий закрытия: независимая приёмка private diff; согласованное применение общего
fix и регрессий; полный configured validate и точные новые pins; проверка actual
Editor/consumer с сохранением negative guards. Оставшаяся высота и capability gaps
принимаются отдельно. Парная запись: [CC-COMPAT-DEPENDENCY-REPRESENTATION-CONTEXT-01](../../Apollo/docs/ARCHITECTURE_BACKLOG.md).

## APOLLO-MAIN-REPOSITORY-001

20.10.2026: Core0.1.21 теперь читается из sibling Apollo/packages вместо Apollo-v3/packages; Editor0.2.107 не меняет формат или интерпретацию контрактов. Изменение только путей; конфигурированная проверка Editor и common Core parity входят в migration handoff General. Парная запись — ../Apollo/docs/ARCHITECTURE_BACKLOG.md.

### CC-COMPAT-NATIVE-INSTANCE-REPLACEMENT-01 — допустимая замена вложенного экземпляра

Core **0.1.22**, Editor **0.2.108**: явный `instanceReplacementDomain` проверяет
семейство и native VARIANT-параметры замены по root-owned source address без
выдуманного публичного INSTANCE_SWAP порта. Неизвестная/неоднозначная identity
остаётся UNKNOWN. Доказанный чужой subtree исключается только из собственного
recursive baseline родителя; остальные проверки родителя сохраняются. Старые
контракты без opt-in сохраняют поведение. Дубликаты ограничений и неверный shape
`properties` отклоняются до Ready.

Editor сохраняет ограничение при открытии, изменении описания и ZIP roundtrip;
набор замен показан из пакета без ручного редактирования component keys.
Влияние на Apollo/Proxy: нужен общий Core reader со stamp0.2.108; пересборка,
проверка admission и установка имеют отдельные статусы. Passing Editor tests
не означает release/adoption или native Ready. Generation pilot не расширяется.

Статус на 20.10.2026: shared implementation применён; Core469/469,
Editor856/856 и Apollo1134/1134 configured checks PASS. Private21
retained-native/guard checks и Editor typed replacement UI roundtrip PASS.
Новая installed-native приёмка IconView не выполнена: действующий контракт r9
остаётся Draft; владелец поручил сначала завершить Link. Proxy adoption и
установка отдельно, без расширения пилота генерации.
Закрытие: согласованный shared apply и validate, consumer проверка compatible
legacy contracts и нового opt-in, scoped native acceptance Indicator24/16;
установка Proxy отдельно по принятому runtime/data scope.

Парная запись: [Apollo architecture backlog](../../Apollo/docs/ARCHITECTURE_BACKLOG.md#cc-compat-native-instance-replacement-01--допустимая-замена-вложенного-экземпляра).
