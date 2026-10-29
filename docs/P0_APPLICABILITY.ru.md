# P0 — достоверная применимость правил

Первый этап Button-пилота. Реализация: Editor 0.2.11 + общий Apollo Predicate
Engine. Автотесты используют независимые синтетические snapshots; это не
подтверждение полного покрытия опубликованного Button или live-Figma приёмки.

## Проверочные сценарии

| Условие | Ожидаемый результат |
|---|---|
| Button: Product=ab, Hint=true; правило требует Hint=false | violation |
| Button: Product=ab, Hint=false | compliant |
| Button: Product=ao, Hint=true | not-applicable только для AB-правила |
| Product не задан | applicability=unknown; human-review / not-evaluable |
| platform/channel/pageType отсутствует, null, пуст или unknownFacts | unknown |
| Контекст совпадает | Исполняется ограничение |
| Контекст известен и не совпадает | not-applicable |
| Один scope неизвестен, другой заведомо не совпадает | not-applicable |
| Scope неизвестен, но when заведомо false | not-applicable |
| Пустой список scope | Все значения; контекст не требуется |
| Variant или mode отсутствует | unknown, не ложное not-applicable |
| Variant или mode известен и не совпадает | not-applicable |
| Неподтверждённый scope для predicate | Ошибка компиляции правила, contract=draft |
| context.loading задан без runtime binding | RULE_CONTEXT_UNMAPPED; правило не исполняется |
| Неизвестная ось applicability или пустой domain variant | Ошибка; правило не исполняется |
| Экспорт/импорт manual с неподдержанным context | Условие сохраняется без потери |

Проверка условий использует AND между осями и OR внутри списка значений.
Никакое неизвестное значение не является основанием для вывода «всё правильно».
Legacy modes без collectionId пока читаются с предупреждением о remap.

## Проверка в Figma

1. Перезапустить development-плагин, убедиться в версии 0.2.11.
2. Импортировать рабочий manual и Athena evidence, не compiled вместо manual.
3. Для тестового запрета Hint выбрать Product Альфа-Бизнес, подтвердить scope
   и применить constraint `Hint ∈ [false]` к публичному BOOLEAN-свойству корня.
4. В режиме проверки проверить Hint=true/false, затем другой Product.
5. Сохранить ZIP, импортировать заново и повторить сценарии.

Этот рецепт проверяет публичное свойство Hint. Сопоставление скрытого внутреннего
слоя и исполнение controlPaths — отдельные пункты дальнейшего P0.
Существующий manual Button автоматически не утверждается и не перезаписывается.

## Результаты локальной проверки — 2026-09-24

- Editor: `npm run validate` — typecheck, build и 44/44 теста прошли.
- Apollo Proxy: `node --test test/predicate-*.test.js` — 229/230 прошли.
  Единственный сбой — migration-wave audit читает отсутствующий старый путь
  `JSONS/experiments/component-contract-v2/migration-wave-1.json`. Этот путь
  не менялся в текущем патче; перенос инфраструктуры — отдельная задача.
- Dry-run текущего Button manual: 24 source rules, 14 compiled checks,
  13 non-executable entries. Запрет Hint не компилируется до подтверждения
  `scopeStatus` автором. Это намеренный gate, не потеря правила.
- Manual Button не менялся; compiled/reports/ZIP пилота не перезаписывались.
  Старые сохранённые отчёты не являются результатом компиляции 0.2.11.

## Остаток P0

- Live-Figma приёмка четырёх сценариев и нескольких representations.
- Проверенные семантические runtime bindings для contextual conditions.
- Устойчивые semantic targets и условия variants относительно нужного host.
- Исполнение controlPaths и проверки обязательных variable bindings.
- Сохранность manual при новой выгрузке Athena.
- Генерация допустимых экземпляров и проверка намеренных нарушений.
- Общий versioned compiler package и публикация Button после coverage gates.
