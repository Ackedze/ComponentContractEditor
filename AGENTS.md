# ComponentContract Editor — межпроектные изменения контрактов

Решение владельца от 01.10.2026: изменения Editor, которые влияют на чтение
контрактов, в той же задаче фиксируются в бэклоге Apollo.

Канонический бэклог: `../Apollo/docs/ARCHITECTURE_BACKLOG.md`, раздел
«Apollo: совместимость с ComponentContract Editor». Создай запись со
стабильным ID или обнови соответствующую существующую; свяжи её с записью
в `docs/BACKLOG.ru.md` и укажи версию Editor / общего core.

Это относится к schema/import/export и hashes/pins, compiler/runtime policy,
capability и applicability, capture/facts/topology, reference correspondence,
ownership/dependencies, scenario inputs/transitions и coverage/report semantics.
Чистое оформление интерфейса без влияния на эти данные записи не требует.

В записи нужны: что изменилось, влияние на consumer Apollo/Proxy, необходимые
доработки или проверка совместимости, текущий статус и критерий закрытия.
Если код уже общий, так и напиши: реализация в core готова, а интеграция,
сборка/release и consumer verification имеют собственный статус. Прохождение
тестов Editor само по себе не закрывает приёмку Apollo. Если изменение уже
проверено в Apollo, фиксируй выполненную проверку вместо выдуманной задачи.

Не копируй private reports и каталоги в Apollo. Сохраняй исходные нормативные
контракты и historical replay; отсутствие фактов остаётся явной неполнотой.
