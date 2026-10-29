# ButtonsGroup — план доработок ComponentContract Editor

Дата: 01.10.2026. База анализа: Editor 0.2.74, shared component-contract core 0.1.0.
Состояние на 02.10.2026: механика этапов 1–5 реализована в Editor 0.2.77 /
shared core 0.1.3. Локальные tests/UI/consumer gates пройдены. Этап 6 —
авторский manual, live acceptance и release/Proxy integration — остаётся открытым.

Сверка 05.10.2026: локальная механика Editor **0.2.90 / core 0.1.9**,
desktop source **r56 / 17 Reviewed**, часть Size=56 live Editor cases принята.
Иконка SingleIcon защищена во всех размерах, выбор охватывает Icon-16/20/24.
Main-alias reset Size=56 / Overflow=true принят fresh report 0.2.90
05.10.2026, 12:12:48 UTC: 452 evaluations, полный PASS, 56/56 baseline matches
и четыре child runs. Fresh negative того же instance/r56 в 12:33:21 UTC:
замена на dots-bracket даёт ровно один icon-lock violation, полный coverage,
56/56 matches и четыре child runs. Remaining variants,
mobile contract, полное scenario coverage и consumer/release acceptance открыты.
Актуальная очередь — [срез Apollo v4](../../Apollo-v3/docs/ARCHITECTURE_BACKLOG.md#сверка-с-editor--05102026).

Дополнение 02.10.2026, Editor 0.2.78: source-only dependency ZIP принимается
через проверяемую компиляцию, ошибки видны в паспорте; новую semantic target
можно создать отдельно от правила и подтвердить existing remap. Проверка на
предоставленных ButtonsGroup/Button ZIP сохраняет rules/targets. Локальные
gates: Editor 780/780, core 5/5, Apollo v4 103/103 и Chromium import/remap/forms/
18 layouts. Подробнее — EDITOR-DEPENDENCY-IMPORT-001 в бэклоге Editor.

Дополнение 02.10.2026, Editor 0.2.79 / core 0.1.4: исправлена проверка scope
memberCollection и dependencyDomain для явного корня с role `buttons-group`. Сохраняются historical
`root` route, independent runtime proof и прежние schema/runtime flags; nested,
unknown и конфликтующие alias anchors отклоняются. Editor 783/783, core 5/5,
Apollo v4 104/104; browser save/ZIP/session gate пройден. Live приёмка —
EDITOR-MEMBER-COLLECTION-ROOT-001.

Исторический live checkpoint 02.10.2026, Editor 0.2.79 / core 0.1.4: первый actual negative
View=Accent в manual r20 не обнаружен. Подтверждены три блокера: сравнение Figma
и snapshot IDs в collection graph, конфликт двух root targets, лишний mode
catalog при проверке child capture. Диагностический replay отделяет каждую
причину; на тот момент исправления ещё не были реализованы. Этап 6 был заблокирован до
EDITOR-BUTTONSGROUP-LIVE-001 / APOLLO-V4-PARITY-011. Ready и authoring/export
acceptance выше не означают успешного actual runtime теста.

Исправление checkpoint: Editor **0.2.80** / core **0.1.5** устраняет три
production capture дефекта. Явный `rootTargetAliasesVersion=1` сохраняет legacy
route; local graph IDs и relevant mode catalogs проверяются общим core.
Editor 786/786, core 5/5, Apollo v4 107/107, historical replay пройдены; actual
report на копии выявляет Accent и выполняет видимые child contracts. Также
реализованы property picker, compact rule sections и viewport focus fix.
Свежие Figma negative/reset, остальные variants и release/Proxy — ещё этап 6.

Цель: автор вручную описывает desktop/mobile ButtonsGroup, а Editor сохраняет,
компилирует и проверяет его состав и правила без изменения библиотечных слоёв.
Те же данные и проверки затем читает Apollo v4 / Proxy через общее ядро.

Основание: 32 manual source rules, composition-contract и принятые решения владельца
из [разбора компонента](../../../shared/design-system_ab/experiments/web-corp/ButtonsGroup/authoring/ANALYSIS.ru.md).
Это план развития Editor; он не является новым нормативным контрактом ButtonsGroup.

Реализация: occurrence/source addressing и per-variant remap; typed direct-child
pins; `memberCollection` с membership/count/position/propertyDomain/
propertyMapping/hostRequirement; формы package/owner/member/representation и
typed условий. View/Size можно задавать как existing dependencyDomain либо
typed collection domain/mapping. Для conditional icon scope добавлен общий
`dependency.subjectCondition` по доказанной semantic цели. Exact icon domains
остальных Size требуют source readback при заполнении manual.

Проверено: core 5/5, Apollo v4 103/103, Editor full validate 774/774; Chromium forms,
ZIP/session reopen, 18 responsive/dialog layouts, occurrence remap и desktop/
mobile export. Historical 33-capture replay сохранён. Legacy Apollo typecheck,
build и Figma-runtime проходят; общий runner останавливает ранее отсутствующая
CardImage compiled fixture. Normative source/pins и published release не изменены.

## 1. Нормы, которые должен выражать Editor

| Аспект | Принятая норма | Требование к механике Editor |
| --- | --- | --- |
| Видимые кнопки | D 1–4, M 1–2, включая SingleIcon | Явная коллекция встроенных экземпляров, effective visibility, диапазон количества |
| Primary | Необязателен; максимум один, первый видимый | Отбор по typed View, count и позиция в видимой коллекции |
| View | Только Primary/Secondary | Узкий domain родителя поверх широкого Button API |
| Size | 32/40/48/56; видимые Button используют Size группы | Typed root API и существующий nested VARIANT mapping |
| SingleIcon | Максимум один, последний видимый; требует Overflow=true и минимум две кнопки | Условия от host и member, count-by-value, last-visible, conditional quantity |
| Overflow | При true минимум две видимые кнопки; включение разрешено до лимита платформы | Условие на host VARIANT, без требования обязательного видимого SingleIcon |
| Состав | Только предусмотренные 4/2 экземпляра; разрешено скрывать, включая средний | Закрытый состав по доказанной identity, отдельно от видимости и порядка |
| Корень | HORIZONTAL; gap по выбранному Size; padding по baseline; визуальные изменения корня запрещены относительно эталона | Layout задавать точечно, внешний вид — группой `visual-style@1`; scope self |
| Root sizing | Норма Hug/Hug отменена | Исключить sizing и width/height из группового baseline lock |
| Дочерние правила | Button r31 с зависимостью Spinner r8 | Один pin Button, отдельные bindings для каждого экземпляра и полный closure |
| Иконка SingleIcon | Сохраняет предусмотренную иконку | Условное сужение для активного SingleIcon, с подтверждённым reference |

Overflow у root — VARIANT со строками `false`/`true`; SingleIcon у Button —
VARIANT со строками `False`/`True`. Значения и property types сохраняются явно.
Преобразование в boolean допустимо только через объявленный transform.

Уточнение владельца при ручном заполнении 02.10.2026: правило 5 обобщается
с opacity на запрет любых визуальных изменений корня относительно эталона.
В форме выбрать «Внешний вид» целиком: fill/stroke/opacity/radius/effects.
Это отдельное новое решение, включая effects; прежнее ограничение исходного
source не отменяется задним числом. Нормативный manual заполняет пользователь.
Группа `visual-style@1` имеет фиксированный состав из этих пяти capabilities;
другие визуальные атрибуты требуют отдельных явных правил, если они применимы.
Область остаётся self; отменённая root sizing норма не возвращается.

Видимая коллекция определяется подтверждённым порядком childIds и effective
visibility. Скрытая средняя кнопка не создаёт пропуск в нормативной последовательности.
Primary и SingleIcon проверяются среди оставшихся видимых экземпляров.

## 2. Что уже есть и что действительно требует доработки

| Возможность | Состояние на базе 0.2.74 / core 0.1.0 | Действие |
| --- | --- | --- |
| Root domain и точечный effective baseline | Поддержаны | Переиспользовать; не добавлять специальный код ButtonGroup |
| Quantity по semantic roles / зависимости | Поддержана модель | Использовать после исправления identity и direct bindings |
| Nested VARIANT domain и mapping | Поддержаны через dependencyDomain | Переиспользовать для View и Size; проверить direct-child subjects |
| Host applicability, policy/delegated/context routes | Поддержаны | Явно назначить маршрут и требуемые факты каждой source норме |
| Одноимённые siblings | snapshotPaths требует уникальный именной путь; variant evidence теряется | P0: новая адресация occurrences по доказанной структуре и source identity |
| Прямые дочерние зависимости | FixedNestedBinding требует owner INSTANCE и непустой childPath | P0: отдельный прямой binding, сохраняющий прежний wrapper route |
| Контроль состава | Quantity считает объявленные цели; exact order не равен запрету добавления/замены | P0: общий контроль закрытого состава, включая скрытые экземпляры |
| Условное количество и крайняя позиция | positionOrder задаёт точную последовательность | P1: общий typed контур conditional collection rules |
| Ручное заполнение зависимостей | componentDependencies и subjects вводятся как JSON | P1: формы выбора owner/member, pin и typed property |

Проверка количества не доказывает исходное происхождение кнопки. При том же
числе видимых элементов можно заменить один из них; скрытый дубликат также
не меняет visible count. Поэтому контроль состава нужен отдельным правилом.

## 3. Порядок реализации

| Очередь | Задача Editor | Приоритет | Предшественники | Проверяемый результат | Apollo v4 |
| --- | --- | --- | --- | --- | --- |
| 0 | Зафиксировать crosswalk и применимость | Подготовка | — | Для всех 32 source IDs задан маршрут; решения min/View/sizing сохранены | PARITY-004 |
| 1 | BUTTONSGROUP-AUTHORING-003: occurrence identity | P0 | 0 | Четыре/две одноимённые кнопки адресуются независимо | PARITY-007 |
| 2 | BUTTONSGROUP-AUTHORING-002: прямые зависимости | P0 | 1 | Button r31 исполняется отдельно для каждого доказанного child | PARITY-008 |
| 3 | BUTTONSGROUP-AUTHORING-004: закрытый состав | P0 | 1; интеграция с 2 | Добавление, дубликат и подмена обнаруживаются независимо от visible count | PARITY-010 |
| 4 | BUTTONSGROUP-AUTHORING-001: условные коллекции | P1, обязательно для готовности | 1–3 | Primary/SingleIcon/count/Overflow проверяются при скрытии middle | PARITY-006 |
| 5 | BUTTONSGROUP-AUTHORING-005: формы authoring | P1 | Формы проектируются с 1; сохраняемая модель после 2–4 | Автор задаёт цели, pins и условия без обязательного ручного JSON | PARITY-006/007/008/010 |
| 6 | BUTTONSGROUP-AUTHORING-006: совместимость и приёмка | Release gate | 1–5 | Round-trip, replay, source coverage и D/M live negative/reset | PARITY-004/006/007/008/010 |

Каждый этап оформляется отдельным изменением с собственными regressions.
Рабочие версии Editor/core и capability versions назначаются по фактическому
изменению схемы и runtime. Этот план не резервирует номера будущих релизов.

### Этап 0 — source coverage и входные данные

- Сохранить соответствие всех 32 source IDs authored правилам, разрешениям,
  dependency или context routes. Несколько source IDs могут ссылаться на один
  проверяемый invariant; одинаковый check не дублируется.
- Старый minimum-two-buttons отметить superseded решением min=1; старый
  root-sizing-is-hug-hug — retired. Его compiled predicate не переносится.
- Подтвердить remaining SingleIcon references для всех Size D/M при реализации:
  текущий углублённый readback иконки покрывает Size=56 на обеих платформах.
  Порт Icon-24 и 24 px не превращаются в норму для остальных размеров.
- Legacy executionPolicy и его coverageGaps использовать как evidence:
  упоминание effects/blendMode в старом gap не добавляет запрет в точную
  source норму root visual-and-layout-baseline-is-fixed. Новый запрет effects
  для authored manual основан на отдельном решении владельца от 02.10.2026 выше.

Критерий: новый draft сохраняет lineage решений и scope каждой нормы;
отсутствующие runtime/action facts показаны до объявления готовности.

### Этап 1 — BUTTONSGROUP-AUTHORING-003: идентичность occurrences

Реализация 01.10.2026: opt-in `occurrenceAddressVersion=1`, отдельные
source/local/catalog addresses, диагностические names, owned-layer source
proof и reviewed `variantHints` для каждого выбранного library variant.
Нормализованные Athena IDs не используются как Figma lineage. Existing remap
сохраняет только текущий variant/representation; другие bindings не меняются.
Core/Editor/Apollo regressions пройдены. Подробный статус и оставшийся live gate:
[BUTTONSGROUP-AUTHORING-003](BACKLOG.ru.md#buttonsgroup-authoring-003--адресация-одноимённых-occurrences).

Единица адресации — отдельное вхождение слоя внутри проверенного владельца.
Имя, номер в списке, координаты и одинаковый library key не доказывают это вхождение.

- Разделить диагностический name path, локальный адрес в snapshot и
  подтверждённую source-layer identity относительно владельца.
- Использовать валидированные parent/child edges; сохранять проверки duplicate
  IDs, циклов, отсутствующих/conflicting edges, truncation и текущий node limit.
- Перевести snapshot shape, variant facts, reference properties, target resolution,
  boundaries, remap, dependency subjects и child captures на общую адресацию.
- Imported main подтверждать независимым reference по действующему capture
  маршруту. Временные pristine IDs остаются capture evidence, а не ручными pins.
- Для смены Size/Overflow и representation хранить доказанные привязки целей
  в каждом variant. Совпадение номера child не заменяет continuity evidence.
- Коллизия или отсутствие source evidence оставляет конкретную цель unknown;
  доступные независимые root facts продолжают проверяться.

Критерий: одинаковые имена и Secondary keys не схлопывают 4 D / 2 M Button;
rename и разрешённый reorder не переносят отклонение на соседнюю кнопку.
Все 16 исходных вариантов имеют полноценный reference. Unknown и corruption
различаются диагностикой; исходная библиотека не требует переименования.

Файлы: shared snapshot-topology, variant-facts, instance-correspondence,
target-resolution/remap, instance boundaries и capture; Editor anatomy/target UI.

### Этап 2 — BUTTONSGROUP-AUTHORING-002: прямые pinned dependencies

- Ввести различимый typed маршрут direct-child рядом с существующим
  fixed-nested wrapper маршрутом. Пустой legacy childPath не переосмысливается.
- Direct binding указывает semantic occurrence ребёнка и его владельца;
  выбранный child подтверждается независимым library reference и source lineage.
- Единственный pin Button r31 используется для нескольких уникальных bindings.
  Один actual child не должен исполняться дважды из-за повторных bindings.
- Проверять pin componentId/revision/manualSourceHash/compiledHash, source
  closure, platform, selected variant, cycles/depth и соответствие child capture
  тому же host subtree. Spinner r8 остаётся транзитивной зависимостью Button.
- Membership проверяется и для скрытой кнопки. Child execution становится
  inactive при доказанной скрытой цели; потерянная identity не маскируется скрытием.
- Host View/Size narrowing действует отдельно; Label/DisabledState/addons и
  визуальные нормы ребёнка исполняет Button. Host не перезаписывает child manual.
- Диагностика сохраняет child RuleID, binding/occurrence и focus внутри группы.

Критерий: 4/2 bindings работают в своих D/M representations; hidden middle
не исполняет child checks и не теряет membership. Неверные pins, platform,
подменённый child, отсутствующий reference и corrupt capture имеют явные результаты.
Button → Addon → Spinner и исторические отчёты сохраняют прежнюю семантику.

Файлы: types/validator/compiler/importer/exporter, component-dependencies,
dependency composition/facts, child capture, ownership, validation/report.

### Этап 3 — BUTTONSGROUP-AUTHORING-004: закрытый состав

- Добавить общий authoring-контур фиксированного состава из объявленных
  occurrences. Его область — direct children нужного owner, включая скрытые.
- Отдельно проверять принадлежность исходному составу и допустимость child
  family/variant: разрешённая смена View/Size внутри Button не равна instance swap.
- Проверять добавленные и повторные children, подмену при том же count и
  исчезновение обязательного исходного member при полном snapshot.
- При неполном capture/reference отсутствие member остаётся unknown,
  а не превращается в доказанное удаление или нулевое количество.
- Политика состава допускает hide/show. Порядок задаётся отдельными условиями;
  полный неизменный список ролей не используется как подмена membership.
- Состав относится к Button children host; внутренности Button/Addon/Spinner
  сохраняют свою ownership и не считаются новыми кнопками группы.

Критерий: разрешённое скрытие middle проходит; скрытый дубликат, добавленный
foreign child и подмена существующего member не получают PASS по количеству.
Отклонение связано с конкретным owner/member и исходной structural rule.

### Этап 4 — BUTTONSGROUP-AUTHORING-001: условные коллекции

Модель должна позволять объявить коллекцию semantic occurrences или direct
dependency bindings, область owner, effective visibility и доказанный порядок.
На неё накладываются условия от typed host/member facts и ограничения.
Окончательный shape JSON определяется при реализации в shared types/validator.

Минимальный общий набор операций:

1. Количество всех видимых members и количество members с заданным typed значением.
2. Первый/последний среди видимых при наличии отобранного member.
3. Условия от root variant и member property без смешения типов и владельцев.
4. Переиспользование domain/mapping для selected members и условного narrowing.

Точные проверки ButtonsGroup:

- visible count: D 1–4, M 1–2;
- count(View=Primary) 0–1; если равен 1 — member первый видимый;
- View каждого видимого Button входит в Primary/Secondary;
- Size каждого видимого Button равен Size host;
- count(SingleIcon=True) 0–1; если равен 1 — member последний видимый,
  Overflow host равно строке true, общий visible count не меньше 2;
- при Overflow=true общий visible count не меньше 2;
- fixed icon narrowing применяется к фактическому видимому SingleIcon.

Отсутствие Primary и отсутствие видимого SingleIcon сами по себе допустимы.
SingleIcon=True при Overflow=false даёт нарушение, а не исключение проверки.
Условия и assertion должны выражать это как требование, а не только как when gate.

У root и ребёнка свой typed API. Для View/Size сначала использовать имеющийся
dependencyDomain; для fixed SingleIcon icon проверить композицию существующих
условий, owner и asset reference. Расширение добавляется только при подтверждённом
пробеле выразимости и остаётся общим для компонентов.

Missing identity/visibility/order/property блокирует зависимый вывод и показывает
причину. Неизвестное значение не равно False/Secondary, неизвестный count не равен 0.
Полнота материализуется по нужным полям, чтобы один неизвестный member не
обнулял независимый root baseline и доказанные child violations.

Критерий: разрешённый hidden middle проходит без перебора всех комбинаций
configuration profiles. Контроль Primary/SingleIcon даёт конкретные фактические
count, позицию, member и host property. RuleIR/hash/coverage сохраняют source linkage.

### Этап 5 — BUTTONSGROUP-AUTHORING-005: ручной authoring

- В Anatomy показать одноимённые экземпляры отдельными строками с semantic
  role, owner и состоянием привязки. Порядковая подпись служит навигации;
  сохраняемая identity опирается на доказанное occurrence.
- Добавить формы создания dependency pin и direct binding: выбрать пакет,
  owner, child targets, representation и применимость; отобразить проверенные
  revision/hashes и доступность полного closure.
- Для коллекции выбрать объявленные targets/bindings, «только видимые»,
  ограничения count, фильтр по typed property, первую/последнюю позицию и
  условия от host. Показывать читаемое описание сохраняемого правила.
- Domain и Size mapping предлагать по фактическим API domains; несовпадение
  VARIANT/BOOLEAN и регистра значения ловить в форме до compile.
- Для conditional SingleIcon narrowing выбирать подтверждённую nested цель;
  обычные Button addons остаются в своём child scope.
- Сохранить JSON import/export и продвинутый режим. Save/reopen и ZIP
  round-trip обязаны сохранять targets, conditions, bindings и pins.
- В UI разделить structural membership, видимый состав и child execution.
  Pending context/delegated checks показаны с недостающими входами.

Критерий: пользователь вручную задаёт D/M правила в формах, видит их смысл и
после reopen получает те же данные. Неподдержанный constraint не сохраняется
как якобы исполняемый. Типовые действия authoring не требуют писать массив bindings.

### Этап 6 — BUTTONSGROUP-AUTHORING-006: проверка и выпуск

- Для нового capture/reference/constraint/binding формата установить явную
  version/capability границу. Старые manual и reports проходят старый route;
  import не пересчитывает их hashes и не дописывает новые evidence как исторические.
- Старый consumer явно сообщает о неподдержанной новой возможности.
  Schema миграция, если нужна, оформляется отдельно и проверяется round-trip.
- Прогнать shared core validate, Editor validate и соответствующие UI/browser
  проверки authoring. Сравнить compiled/evaluation/coverage в Editor и Apollo v4.
- Apollo/Proxy обновлять и принимать отдельным этапом: release pins, plugin
  capture, importer и Proxy source closure должны использовать совместимый runtime.
- Синтетические fixtures содержат минимальные обезличенные структуры;
  private каталоги и реальные пользовательские отчёты остаются в DS workspace.
- Подготовить D/M live cases с полным текстом нормы и стабильным RuleID.
  Пользователь выполняет negative/reset; итоговые reports сохраняются с exact replay.

Завершение разработки механики и Ready authored контракта — отдельные результаты.
Ready задаётся только для принятого scope; interaction/action/code правила
с отсутствующими evidence сохраняют явную неполноту.

## 4. Минимальная матрица приёмки

| Проверка | Ожидаемый результат |
| --- | --- |
| Одинаковые имена у 4 D / 2 M; одинаковые Secondary keys | Каждый member разрешён отдельно, данные не схлопываются |
| Rename/reorder без потери source lineage | Та же identity; порядок проверяет своё правило |
| Смена Size/Overflow, все 16 library variants | Полный reference и доказанные привязки каждой цели |
| Одна текстовая Button, Overflow=false | Compliant D/M |
| Ни одной видимой Button | Нарушение общего min=1 |
| Все Secondary, Primary отсутствует | Compliant |
| Две Primary; Primary не первый видимый | Нарушение count/position с правильным focus |
| Hidden middle с корректными count/order | Compliant; hidden child execution inactive |
| Host Size=40, видимый child Size=48 | Нарушение host mapping |
| View Accent/Outlined | Нарушение узкого group domain |
| SingleIcon middle; два SingleIcon | Нарушение last/maxCount |
| SingleIcon при Overflow=false | Нарушение требования host Overflow |
| Одиночный kebab; Overflow=true с одной текстовой Button | Нарушение соответствующего conditional min=2 |
| D: Overflow=true, две текстовые кнопки, SingleIcon скрыт | Само отсутствие видимого SingleIcon не нарушает composition; interaction отдельно |
| SingleIcon icon заменён; обычный Button addon изменён | Fixed icon rule у SingleIcon; обычный addon проверяет Button |
| Добавленный/дублированный Button при прежнем visible count | Structural violation, включая скрытый extra member |
| Подмена Button при том же count/разрешённом View | Structural/identity violation по доказательствам |
| Неизвестные lineage, visibility, order, property или pin | Явный missing/unknown по зависимому check |
| Corrupt topology, real truncation, stale actual/reference | Конкретный incomplete result; существующие guards сохранены |
| D Size=40 gap=12 / gap=16; M gap=8 | Правильный selected baseline / нарушение |
| Изменены только root width/height/sizing | Отменённый Hug/Hug check не возникает |
| Root visual/padding изменён; child Label/DisabledState настроен штатно | Root violation отделён от child результата |
| Неверный pin / потерян Spinner closure / повторный binding | Явная ошибка зависимости, без ложного исполнения |
| Старые Button/Spinner/CorporateContent ZIP и reports | Pins/manual сохраняются, historical replay совпадает |
| Save/reopen, ZIP export/import, Editor ↔ Apollo/Proxy | Одинаковые constraints, bindings, facts и classification для одинакового input |

## 5. Crosswalk исходных правил к плану

Префикс каждого suffix: `component:web-corp.buttons-group.`.

| Source ID suffix | Маршрут / этап |
| --- | --- |
| exists-in-code | Context/reference: code availability проверяется своим evidence, этап 0/6 |
| prefer-group-for-related-buttons | Screen pattern/delegated, этап 0/6 |
| visible-button-limit | Видимая коллекция и quantity, этапы 1–4 |
| primary-is-first-and-unique | Conditional collection, этап 4 |
| minimum-two-buttons | Superseded: новый общий min=1, этап 0/4 |
| uniform-size | Existing nested VARIANT mapping после direct bindings, этап 2/4 |
| nested-button-views-are-primary-or-secondary | Host domain Primary/Secondary, этап 2/4 |
| nested-buttons-follow-button-contract | Button r31 dependency с Spinner r8 closure, этап 2 |
| horizontal-layout-is-fixed | Existing root propertyDomain; acceptance, этап 6 |
| spacing-uses-effective-baseline | Existing selected root baseline; acceptance, этап 6 |
| visual-and-layout-baseline-is-fixed | Existing точечный root baseline; acceptance, этап 6 |
| root-sizing-is-hug-hug | Retired решением владельца; omission и acceptance, этап 0/6 |
| actions-descend-by-priority | Pattern/action context; priority не выводится из View, этап 0/6 |
| built-in-buttons-can-be-hidden | Direct visibility permission + membership, этап 3/4 |
| overflow-moves-nearest-action-first | Before/actions runtime context, этап 0/6 |
| has-no-group-state | API classification; состояния детей по Button, этап 0/2 |
| single-icon-opens-overflow-list | Interaction context, этап 0/6 |
| single-icon-icon-is-fixed | Conditional asset narrowing с independent reference, этап 0/2/4 |
| overflow-container-follows-platform | External interaction target: D OptionList / M BottomSheet без footer, этап 0/6 |
| overflow-items-preserve-action-content | Связь action/label/icon в runtime context, этап 0/6 |
| overflow-item-count-is-contextual | Context permission; max группы не переносится на меню, этап 0/6 |
| button-labels-follow-button-contract | Child dependency + editorial pattern, этап 2/6 |
| visible-and-overflow-actions-are-unique | Action identity context; Label не доказывает identity, этап 0/6 |
| use-only-built-in-button-slots | Закрытый состав по occurrence identity, этап 3 |
| overflow-enables-last-single-icon | Conditional host/member invariant; interaction отдельно, этап 4/6 |
| overflow-is-optional-from-two-buttons | Conditional quantity/permission, этап 4 |
| disabled-state-is-preserved-in-overflow | Action/disabled/Tooltip runtime context, этап 0/6 |
| overflow-list-closes-after-action | Post-action interaction context, этап 0/6 |
| visible-button-loading-follows-button | Child runtime dependency; Loading не придумывается в Figma, этап 2/6 |
| skeleton-is-code-only | Code-only / Figma not-applicable, этап 0/6 |
| single-icon-is-last | Общий last-visible invariant с source linkage, этап 4 |
| single-icon-requires-two-buttons | Conditional quantity, этап 4 |

Editor сохраняет эти context/delegated/code scopes через существующие маршруты.
Механика меню, action identity, hover и закрытие списка требуют других входов
и своей runtime/code интеграции. Figma snapshot не подтверждает их автоматически.

## 6. Связи и проверенная база

- [Бэклог Editor](BACKLOG.ru.md): BUTTONSGROUP-AUTHORING-001–006.
- [Бэклог Apollo v4](../../Apollo-v3/docs/ARCHITECTURE_BACKLOG.md):
  PARITY-004/006/007/008/010; в каждой реализации обновить соответствующую запись.
- Normative source: `shared/design-system_ab/JSONS/web/components/web-corp/ButtonGroup [D]`.
  rules SHA-256: `038cd923d9bca88bb4f718723fc7bbf2f98de20dfb9623c7d8f73be6461ebf22`.
  composition SHA-256: `f8609190ca48af5eb6dccf07f24412cad7ee4a41236efe807c2228ca567cc2d6`.
  overrides SHA-256: `f856ae9a47275b6b188f2e3d5ada1c7e21673f600300cf5e2e2aa7c90d9118a3`.
- Code basis: shared `snapshot-topology.ts:4`, `variant-facts.ts:49`,
  `target-resolution.ts:23`, `component-dependencies.ts:29–33`,
  `compiler.ts:409–446` и `types.ts:382–398`;
  Editor `ui.ts:264,661–716,2046–2074,2142–2188`.
- Первоначальный план сформирован чтением кода и существующего source evidence.
  В реализации добавлены synthetic runtime/consumer и browser tests.
  Live Figma audit и пользовательский manual остаются следующей приёмкой.
  Normative rules, принятые pins/ZIP и published release не изменены.
