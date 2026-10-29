# P0 — доступность вариантов / SingleIcon, 0.2.17

Manual r8 исправляет ошибку r7: в реальных SingleIcon-вариантах Button отсутствуют
Text, Label, Hint и RightAddon. Тест «включите Label/Hint» из 0.2.16 не был доказан
в Figma; изменение только флага на прежнем snapshot не моделирует смену варианта.

## Правило и ownership

Тот же `component:web-core.button.single-icon-content-shape`: при SingleIcon=true
ровно один видимый Addon и ноль видимых Label/Hint. Два assertions вместо четырёх,
нет требований к отсутствующим BOOLEAN properties. Остальные 23 правила сохранены.
Manual — единственный нормативный источник. Структуры Athena — read-only evidence;
compiler публикует их отдельно от manual. Predicate Engine не менялся.

## Доказательство доступности

Точный variant key + реальные variant properties + Athena topology + полный
reference + topology экземпляра должны согласовываться. Отсутствующий target
должен иметь однозначный путь, встречающийся в другом варианте того же семейства.
Опечатка, duplicate path, stale key, structural drift, truncation — unknown.
Отсутствие не подменяется значением false и не выводится из отсутствующих данных.

Публичное свойство может остаться в API семейства без consumers. Для semantic API
и прямых Component Property проверок это известная неприменимость. Figma bindings
собираются по границе владельца instance, включая скрытые слои.

## Проверки

| Сценарий | Ожидание |
|---|---|
| Настоящая анатомия SingleIcon=True, 4 representations | Обе проверки проходят |
| Настоящая анатомия SingleIcon=False | Не применяется |
| Только флаг True на старой False-анатомии | Unknown, не реальный Figma тест |
| Known-absent target, проверка свойства слоя | Не применяется, причина видна |
| Свойство API без consumer | Не применяется, actual не подменяется |
| Expected-present target потерян / stale / ambiguity | Неполная проверка |
| Усечение / неизвестная структура / новый swap | Неполная проверка |
| Скрытый имеющийся Addon (низкоуровневый fixture) | Нарушение количества |
| Context-only/delegated property rule на confirmed-absent Text/Label | Не применяется (0.2.18) |
| Presence/absence/quantity/order на absent target | Проверка не исключается |
| Compound rule: отсутствующее свойство + применимое ограничение | Правило целиком не исключается |

Live-отчёт 2026-09-25T06-40-26-954Z подтвердил SingleIcon=True и отсутствие
ложного нарушения по сохранённому Label=true. В 0.2.18 его replay сохраняет все
18 результатов движка и исправляет только coverage трёх текстовых правил:
13 пройдено / 10 не применяются / 8 не выполнено. Manual r8 не менялся.

Golden fixtures — structural projection реальных Athena данных, не live capture.
Предыдущие синтетические проверки движка остаются низкоуровневыми тестами и не
объявляются достижимыми сценариями Button. Live acceptance: переключить реальные
True → False → True экземпляры D/M и inverted, скачать отчёты, убедиться в
сохранности manual. Не требуется создавать Label/Hint в SingleIcon.

## Дальше

Это первый общий availability gate, а не полный граф возможностей. Отдельно нужны:
разрешённые structural swaps, exposed nested property bindings, режимные зависимости,
предупреждения о недостижимом scope при authoring/reviewed и фронтовые adapters.
Button остаётся Draft; production не опубликован.
