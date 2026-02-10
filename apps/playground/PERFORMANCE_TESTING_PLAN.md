# План реализации Performance Testing

## Статус: Частично реализовано

### Реализовано:
- ✅ Форма заказа (OrderForm) с 50 полями и 7 группами
- ✅ Playwright настроен и работает
- ✅ 9 базовых E2E тестов проходят
- ✅ Метрики сохраняются в metrics/results.json
- ✅ React Profiler интегрирован для измерения времени рендеров

### Обнаруженные проблемы:
- ⚠️ **Критический баг в form-generator**: После заполнения поля (например, lastName) и попытки заполнить другое поле (например, firstName), приложение падает. Скриншоты показывают пустую страницу.
- ⚠️ Visibility conditions и validation тесты пропущены из-за бага выше
- ⚠️ WDYR интеграция не работает корректно в тестах

### Запуск тестов:
```bash
cd apps/playground
npm run test:e2e           # 9 тестов
npm run test:e2e:ui        # С UI интерфейсом
npm run test:e2e:headed    # С видимым браузером
```

### Текущие метрики (из последнего запуска):
- Initial Load: ~127ms
- Single Input: ~34ms
- Number Input: ~22ms
- Tab Navigation (5 fields): ~190ms
- Form Submit: ~225ms

---

## Обзор

Создание статичной формы заказа с E2E тестами для измерения производительности через подсчёт рендеров.

---

## Фаза 1: Статичная форма заказа

### Структура формы (50 полей, 7 групп)

```
Группа 1: Информация о покупателе (8 полей)
├── firstName (input) — обязательное
├── lastName (input) — обязательное
├── email (input) — обязательное, валидация email
├── phone (input) — валидация формата
├── birthDate (date) — проверка возраста >= 18
├── isCompany (switch)
├── companyName (input) — visible: isCompany === true
└── companyTaxId (input) — visible: isCompany === true, валидация ИНН

Группа 2: Адрес доставки (7 полей)
├── country (select) — обязательное
├── city (input) — обязательное
├── street (input) — обязательное
├── building (input) — обязательное
├── apartment (input)
├── postalCode (input) — валидация формата по стране
└── deliveryNotes (input)

Группа 3: Способ доставки (6 полей)
├── deliveryType (select: courier/pickup/post) — обязательное
├── courierDate (date) — visible: deliveryType === 'courier'
├── courierTimeSlot (select) — visible: deliveryType === 'courier'
├── pickupPoint (select) — visible: deliveryType === 'pickup'
├── postOffice (input) — visible: deliveryType === 'post'
└── urgentDelivery (switch) — влияет на стоимость

Группа 4: Товары в заказе (8 полей)
├── productCategory (select) — обязательное
├── productName (input) — обязательное
├── quantity (inputNumber) — min: 1, max: 100
├── pricePerUnit (inputNumber) — disabled (рассчитывается)
├── discount (inputNumber) — max: 50%
├── giftWrap (switch)
├── giftMessage (input) — visible: giftWrap === true
└── totalPrice (inputNumber) — disabled (рассчитывается)

Группа 5: Оплата (7 полей)
├── paymentMethod (select: card/cash/invoice)
├── cardNumber (input) — visible: paymentMethod === 'card', валидация Luhn
├── cardExpiry (input) — visible: paymentMethod === 'card'
├── cardCvv (input) — visible: paymentMethod === 'card'
├── invoiceEmail (input) — visible: paymentMethod === 'invoice'
├── invoiceAddress (input) — visible: paymentMethod === 'invoice'
└── useDeliveryAddress (switch) — visible: paymentMethod === 'invoice'

Группа 6: Промокод и бонусы (6 полей)
├── hasPromoCode (switch)
├── promoCode (input) — visible: hasPromoCode === true
├── promoDiscount (inputNumber) — disabled, рассчитывается
├── useBonusPoints (switch)
├── bonusPointsAmount (inputNumber) — visible: useBonusPoints === true, max: available
└── finalPrice (inputNumber) — disabled (итоговая цена)

Группа 7: Подтверждение (8 полей)
├── agreeTerms (switch) — обязательное
├── agreePrivacy (switch) — обязательное
├── subscribeNews (switch)
├── subscribePromo (switch) — visible: subscribeNews === true
├── preferredContactMethod (select: email/phone/both)
├── contactTime (select) — visible: preferredContactMethod !== 'email'
├── additionalComments (input)
└── confirmOrder (switch) — disabled until agreeTerms && agreePrivacy
```

### Типы условий покрытые формой

| Тип условия | Пример | Количество |
|-------------|--------|------------|
| Простая видимость | companyName visible if isCompany | 12 |
| Цепочка условий | subscribePromo → subscribeNews → visible | 3 |
| Кросс-валидация | cardExpiry > today | 4 |
| Зависимость disabled | confirmOrder disabled until terms agreed | 3 |
| Валидация формата | email, phone, cardNumber | 5 |
| Валидация диапазона | quantity 1-100, discount 0-50 | 4 |

---

## Фаза 2: Настройка Playwright

### Установка

```bash
npm install -D @playwright/test
npx playwright install
```

### Структура тестов

```
apps/playground/
├── e2e/
│   ├── fixtures/
│   │   └── orderForm.ts          # Page Object для формы
│   ├── tests/
│   │   ├── 01-initial-render.spec.ts
│   │   ├── 02-field-input.spec.ts
│   │   ├── 03-visibility-conditions.spec.ts
│   │   ├── 04-validation.spec.ts
│   │   ├── 05-blur-focus.spec.ts
│   │   └── 06-form-submit.spec.ts
│   ├── utils/
│   │   ├── renderCounter.ts      # Интеграция с WDYR
│   │   └── metricsCollector.ts   # Сбор и сохранение метрик
│   └── playwright.config.ts
├── metrics/
│   └── results.json              # Результаты тестов
```

---

## Фаза 3: Группы тестов

### Группа 1: Initial Render (01-initial-render.spec.ts)

**Цель:** Измерить количество рендеров при первой загрузке формы

```typescript
// Тесты:
- test('empty form initial render')
- test('form with initial values render')
- test('form with partial values render')

// Метрики:
- totalRenders: number
- mountTime: number (ms)
- componentsRendered: string[]
```

### Группа 2: Field Input (02-field-input.spec.ts)

**Цель:** Измерить рендеры при вводе в поля

```typescript
// Тесты:
- test('typing in text input')
- test('changing number input')
- test('selecting from dropdown')
- test('toggling switch')
- test('picking date')

// Метрики для каждого:
- rendersPerKeystroke: number
- totalRenders: number
- affectedComponents: string[]
```

### Группа 3: Visibility Conditions (03-visibility-conditions.spec.ts)

**Цель:** Измерить рендеры при показе/скрытии полей

```typescript
// Тесты:
- test('show single field (isCompany toggle)')
- test('show multiple fields (paymentMethod change)')
- test('chain visibility (subscribeNews → subscribePromo)')
- test('hide fields')

// Метрики:
- rendersOnShow: number
- rendersOnHide: number
- cascadeRenders: number
```

### Группа 4: Validation (04-validation.spec.ts)

**Цель:** Измерить рендеры при встроенной валидации полей

```typescript
// Тесты:
- test('required field validation on blur')
- test('format validation (email)')
- test('range validation (quantity min/max)')
- test('pattern validation (phone format)')

// Метрики:
- rendersOnValidationError: number
- rendersOnValidationClear: number
```

### Группа 5: Validation Conditions (05-validation-conditions.spec.ts)

**Цель:** Измерить рендеры при срабатывании validateCondition

```typescript
// Тесты:
- test('field validateCondition triggers on dependency change')
- test('group validateCondition shows error')
- test('validateCondition with cross-field reference ($field)')
- test('nested validateCondition (and/or groups)')
- test('validateCondition message display')
- test('validateCondition clears when condition met')

// Метрики:
- rendersOnConditionTrigger: number
- rendersOnConditionClear: number
- cascadeValidationRenders: number
```

### Группа 6: Blur/Focus (06-blur-focus.spec.ts)

**Цель:** Измерить рендеры при переключении фокуса

```typescript
// Тесты:
- test('focus field')
- test('blur field without change')
- test('blur field with change')
- test('tab through fields')

// Метрики:
- rendersOnFocus: number
- rendersOnBlur: number
- rendersOnTabThrough: number
```

### Группа 7: Form Submit (07-form-submit.spec.ts)

**Цель:** Измерить рендеры при отправке

```typescript
// Тесты:
- test('submit valid form')
- test('submit invalid form (validation errors)')
- test('submit and reset')

// Метрики:
- rendersOnSubmit: number
- rendersOnReset: number
```

---

## Фаза 4: Интеграция WDYR + Сбор метрик

### Механизм подсчёта рендеров

```typescript
// apps/playground/src/utils/renderTracker.ts

interface RenderEvent {
  component: string
  timestamp: number
  reason: string
  props?: Record<string, unknown>
}

class RenderTracker {
  private events: RenderEvent[] = []
  private isRecording = false

  startRecording() {
    this.events = []
    this.isRecording = true
    // Патчим console для перехвата WDYR
  }

  stopRecording(): RenderEvent[] {
    this.isRecording = false
    return [...this.events]
  }

  getStats() {
    return {
      totalRenders: this.events.length,
      byComponent: this.groupByComponent(),
      byReason: this.groupByReason(),
    }
  }
}

// Экспортируем в window для доступа из Playwright
window.__RENDER_TRACKER__ = new RenderTracker()
```

### Playwright helper

```typescript
// apps/playground/e2e/utils/metricsCollector.ts

async function collectRenderMetrics(page: Page, action: () => Promise<void>) {
  // Начинаем запись
  await page.evaluate(() => window.__RENDER_TRACKER__.startRecording())

  // Выполняем действие
  await action()

  // Ждём стабилизации
  await page.waitForTimeout(100)

  // Получаем метрики
  const metrics = await page.evaluate(() => {
    const events = window.__RENDER_TRACKER__.stopRecording()
    return window.__RENDER_TRACKER__.getStats()
  })

  return metrics
}
```

---

## Фаза 5: Формат результатов (metrics/results.json)

```json
{
  "meta": {
    "lastRun": "2024-02-08T12:00:00Z",
    "gitCommit": "abc123",
    "gitBranch": "main",
    "nodeVersion": "20.x",
    "formVersion": "0.1.0"
  },
  "runs": [
    {
      "id": "run-001",
      "timestamp": "2024-02-08T12:00:00Z",
      "commit": "abc123",
      "results": {
        "initial-render": {
          "totalRenders": 52,
          "mountTime": 45.2,
          "tests": {
            "empty-form": { "renders": 50, "time": 42.1, "status": "pass" },
            "with-values": { "renders": 55, "time": 48.3, "status": "pass" }
          }
        },
        "field-input": {
          "totalRenders": 15,
          "tests": {
            "text-input": { "rendersPerKeystroke": 2, "status": "pass" },
            "number-input": { "rendersPerKeystroke": 2, "status": "pass" },
            "select": { "rendersPerChange": 3, "status": "pass" }
          }
        },
        "visibility-conditions": {
          "tests": {
            "show-single": { "renders": 4, "status": "pass" },
            "show-multiple": { "renders": 8, "status": "pass" },
            "chain": { "renders": 6, "status": "pass" }
          }
        },
        "validation": {
          "tests": {
            "required-blur": { "renders": 3, "status": "pass" },
            "format-email": { "renders": 2, "status": "pass" }
          }
        },
        "blur-focus": {
          "tests": {
            "focus": { "renders": 1, "status": "pass" },
            "blur": { "renders": 2, "status": "pass" }
          }
        },
        "form-submit": {
          "tests": {
            "valid-submit": { "renders": 5, "status": "pass" },
            "invalid-submit": { "renders": 12, "status": "pass" }
          }
        }
      },
      "summary": {
        "totalTests": 18,
        "passed": 18,
        "failed": 0,
        "totalRenders": 156,
        "avgRendersPerTest": 8.7
      }
    }
  ],
  "baseline": {
    "initial-render.empty-form.renders": 50,
    "field-input.text-input.rendersPerKeystroke": 2,
    "visibility-conditions.show-single.renders": 4
  },
  "thresholds": {
    "initial-render.empty-form.renders": { "warn": 60, "fail": 80 },
    "field-input.text-input.rendersPerKeystroke": { "warn": 3, "fail": 5 }
  }
}
```

---

## Фаза 6: Страница MetricsHistory

### Функционал

1. **Таблица прогонов** — список всех run с датой, коммитом, summary
2. **Сравнение** — выбрать 2 прогона и показать diff
3. **Графики** — тренд метрик по времени
4. **Alerts** — подсветка если метрика выше threshold
5. **Baseline** — кнопка "Set as baseline"

### Визуализация

```
┌─────────────────────────────────────────────────────────────┐
│ История Performance Тестов                                   │
├─────────────────────────────────────────────────────────────┤
│ [Загрузить JSON] [Сравнить выбранные] [Установить baseline] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 Тренд: Initial Render                                   │
│  ┌──────────────────────────────────────┐                   │
│  │    ╭─╮                               │                   │
│  │ 60 │  ╰─╮    ╭─╮                     │ ← threshold warn  │
│  │ 50 │    ╰────╯ ╰─────────            │ ← baseline        │
│  │    └──────────────────────           │                   │
│  │      run1  run2  run3  run4          │                   │
│  └──────────────────────────────────────┘                   │
│                                                             │
│  📋 Результаты прогонов                                     │
│  ┌──────┬───────────┬────────┬─────────┬─────────┐         │
│  │  ☐   │ Дата      │ Commit │ Renders │ Status  │         │
│  ├──────┼───────────┼────────┼─────────┼─────────┤         │
│  │  ☐   │ 08.02.24  │ abc123 │ 156     │ ✅ Pass │         │
│  │  ☐   │ 07.02.24  │ def456 │ 180     │ ⚠️ Warn │         │
│  │  ☐   │ 06.02.24  │ ghi789 │ 145     │ ✅ Pass │         │
│  └──────┴───────────┴────────┴─────────┴─────────┘         │
│                                                             │
│  📊 Детали прогона: abc123                                  │
│  ┌─────────────────────┬──────────┬──────────┬─────────┐   │
│  │ Группа тестов       │ Renders  │ Baseline │ Diff    │   │
│  ├─────────────────────┼──────────┼──────────┼─────────┤   │
│  │ Initial Render      │ 52       │ 50       │ +2 ⚠️   │   │
│  │ Field Input         │ 15       │ 15       │ 0 ✅    │   │
│  │ Visibility          │ 18       │ 20       │ -2 ✅   │   │
│  │ Validation          │ 25       │ 25       │ 0 ✅    │   │
│  │ Blur/Focus          │ 12       │ 12       │ 0 ✅    │   │
│  │ Form Submit         │ 34       │ 30       │ +4 ⚠️   │   │
│  └─────────────────────┴──────────┴──────────┴─────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Порядок реализации

### Этап 1: Форма (2-3 часа)
1. Создать `src/pages/OrderForm.tsx`
2. Определить конфиг формы со всеми полями
3. Добавить роут `/order-form`
4. Проверить работу всех условий

### Этап 2: Playwright setup (1 час)
1. Установить Playwright
2. Создать playwright.config.ts
3. Создать базовые fixtures
4. Проверить запуск тестов

### Этап 3: RenderTracker (1-2 часа)
1. Создать RenderTracker класс
2. Интегрировать с WDYR
3. Экспортировать в window
4. Проверить сбор метрик

### Этап 4: Тесты (3-4 часа)
1. Initial Render тесты
2. Field Input тесты
3. Visibility тесты
4. Validation тесты
5. Blur/Focus тесты
6. Submit тесты

### Этап 5: Сохранение метрик (1 час)
1. Создать структуру metrics/
2. Реализовать запись results.json
3. Добавить git commit info

### Этап 6: MetricsHistory UI (2 часа)
1. Загрузка и парсинг JSON
2. Таблица прогонов
3. Сравнение с baseline
4. Графики трендов

---

## Скрипты package.json

```json
{
  "scripts": {
    "test:perf": "playwright test",
    "test:perf:ui": "playwright test --ui",
    "test:perf:report": "playwright show-report",
    "metrics:view": "npm run dev & open http://localhost:3000/metrics"
  }
}
```

---

## Ожидаемый результат

После реализации можно будет:

1. Запустить `npm run test:perf`
2. Получить JSON с метриками рендеров
3. Открыть `/metrics` и увидеть историю
4. Сравнить с baseline
5. Увидеть регрессии производительности

Это позволит отслеживать влияние оптимизаций на количество рендеров.
