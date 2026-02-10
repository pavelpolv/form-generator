# Оптимизация производительности FormGenerator

## Текущие метрики (baseline)

### Стресс-тест в браузере (50 полей, 5 групп × 10)

| Метрика | Значение | Цель | Статус |
|---------|----------|------|--------|
| Mount (avg) | 33.80 ms | < 16 ms | Требует оптимизации |
| Update (avg) | 1.32 ms | < 16 ms | OK |
| Update (max) | 8.00 ms | < 16 ms | OK |

### Vitest benchmark (evaluateConditions) - 2026-02-09

| Сценарий | ops/sec | Время (mean) |
|----------|---------|--------------|
| Простое условие (2 проверки) | 5,949,811 | 0.17 μs |
| Сложное условие (глубина 3×3) | 213,293 | 4.7 μs |
| Глубокое условие (глубина 5) | 148,430 | 6.7 μs |
| Широкое условие (50 полей) | 474,638 | 2.1 μs |
| Полный цикл 20 полей (visible+validate+disabled) | 235,023 | 4.3 μs |

#### Дополнительные метрики (2026-02-09)

| Сценарий | ops/sec |
|----------|---------|
| Оператор === | 12,846,118 |
| Оператор !∅ (не пусто) | 11,698,097 |
| Оператор includes (строка) | 10,931,487 |
| Оператор match (regex) | 6,154,293 |
| Ссылка на поле ($) | 6,100,447 |
| Сбор сообщений (простое) | 2,660,198 |
| Сбор полей (простое) | 4,197,841 |

### E2E тесты (Playwright) - 2026-02-09

**21 тест пройден за 12.5 сек**

| Категория | Тест | Время |
|-----------|------|-------|
| Initial Render | Initial form mount | 129 ms |
| Field Input | Single text input | 39 ms |
| Field Input | Multiple text inputs | 39 ms |
| Field Input | Select dropdown | 399 ms |
| Field Input | Number input | 15 ms |
| Visibility | Toggle company fields | 154 ms |
| Visibility | Delivery type chain | 493 ms |
| Visibility | Multiple toggles | 503 ms |
| Validation | Required field (blur) | 124 ms |
| Validation | Email format | 189 ms |
| Validation | Phone format | 187 ms |
| Validation Conditions | Conditional required | 221 ms |
| Validation Conditions | Card validation | 240 ms |
| Focus/Blur | Focus-blur cycle | 153 ms |
| Focus/Blur | Tab navigation | 199 ms |
| Focus/Blur | Rapid focus changes | 125 ms |
| Form Submit | Submit empty form | 279 ms |
| Form Submit | Submit partial data | 269 ms |
| Form Submit | Form reset | 174 ms |

---

## Выявленные проблемы

### 1. JSON.stringify в useMemo (КРИТИЧНО)

**Файл:** `src/components/FormGenerator/FormGenerator.tsx:95`

```typescript
const touchedFieldsSnapshot = useMemo(
  () => ({ ...touchedFields }),
  [JSON.stringify(touchedFields)]  // <- Проблема
)
```

**Проблема:**
- `JSON.stringify()` вызывается при КАЖДОМ рендере, независимо от результата useMemo
- Это O(n) операция по количеству полей
- Создаёт новую строку на каждый рендер

**Влияние:** Лишние вычисления при каждом изменении любого поля

**Решение:** Использовать `useRef` для хранения предыдущего значения и глубокое сравнение

---

### 2. Пересчёт условий для ВСЕХ полей при изменении одного (КРИТИЧНО)

**Файл:** `src/components/FieldGroup/FieldGroup.tsx`

```typescript
{fields.map((field) => {
  const isFieldVisible = evaluateConditions(field.visibleCondition, formValues)
  const isFieldValid = evaluateConditions(field.validateCondition, formValues)
  const isFieldDisabled = evaluateConditions(field.disabledCondition, formValues)
  // ...
})}
```

**Проблема:**
- При изменении одного поля пересчитываются условия для ВСЕХ полей в группе
- Сложность O(N × M), где N — кол-во полей, M — сложность условий

**Влияние:** Линейное падение производительности с ростом числа полей

**Решение:** Мемоизировать результаты evaluateConditions для каждого поля отдельно

---

### 3. validateFieldConfig при каждом рендере (СРЕДНЯЯ)

**Файлы:** Все компоненты в `src/fields/*`

```typescript
export const InputField: React.FC = React.memo(({ config, ... }) => {
  const configError = validateFieldConfig(config)  // <- Каждый рендер
  // ...
})
```

**Проблема:**
- Zod-валидация выполняется при каждом рендере
- Config не меняется после инициализации

**Влияние:** Лишние CPU-циклы на парсинг Zod-схемы

**Решение:** Перенести валидацию в `useMemo` или валидировать один раз на уровне FormGenerator

---

### 4. Moment.js вместо Day.js (СРЕДНЯЯ)

**Файл:** `src/fields/DateField/DateField.tsx`

```typescript
import moment from 'moment'  // ~70KB
```

**Проблема:**
- Moment.js весит ~70KB (минифицированный)
- Day.js весит ~14KB с тем же API
- Day.js уже есть в devDependencies, но не используется

**Влияние:** +56KB к размеру бандла

**Решение:** Заменить moment на dayjs

---

### 5. Inline функция filterOption в SelectField (НИЗКАЯ)

**Файл:** `src/fields/SelectField/SelectField.tsx:64-70`

```typescript
filterOption={
  searchable
    ? (input, option) => (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
    : undefined
}
```

**Проблема:**
- Новая функция создаётся при каждом рендере
- Может вызывать лишние перерендеры Select компонента

**Влияние:** Минимальное, но легко исправить

**Решение:** Обернуть в `useCallback`

---

## План оптимизации

### Фаза 1: Критические исправления

| # | Задача | Ожидаемый эффект |
|---|--------|------------------|
| 1.1 | Убрать JSON.stringify, использовать useRef | -5-10ms на mount |
| 1.2 | Мемоизировать evaluateConditions в FieldGroup | -30-50% времени рендера |

### Фаза 2: Средние улучшения

| # | Задача | Ожидаемый эффект |
|---|--------|------------------|
| 2.1 | Перенести validateFieldConfig в useMemo | -2-5ms на mount |
| 2.2 | Заменить moment на dayjs | -56KB бандла |

### Фаза 3: Мелкие улучшения

| # | Задача | Ожидаемый эффект |
|---|--------|------------------|
| 3.1 | useCallback для filterOption | Чище код |
| 3.2 | Кэширование regex в операторе match | +10% для regex условий |

---

## Целевые метрики после оптимизации

### Стресс-тест (50 полей)

| Метрика | Текущее | Цель |
|---------|---------|------|
| Mount (avg) | 33.80 ms | < 16 ms |
| Update (avg) | 1.32 ms | < 1 ms |
| Update (max) | 8.00 ms | < 5 ms |

### Стресс-тест (100 полей)

| Метрика | Цель |
|---------|------|
| Mount (avg) | < 30 ms |
| Update (avg) | < 2 ms |
| Update (max) | < 10 ms |

### Bundle size

| Метрика | Текущее | Цель |
|---------|---------|------|
| moment.js | ~70KB | 0 KB (удалить) |
| dayjs | 0 KB | ~14KB (добавить) |
| **Экономия** | — | **56 KB** |

---

## Как измерять

### 1. Vitest benchmarks (unit-тесты)

```bash
npm run bench
```

Измеряет:
- Производительность evaluateConditions
- Скорость разных операторов сравнения
- Влияние глубины/ширины условий

**Пример вывода:**
```
evaluateConditions - сложность условий
  · простое условие (2 проверки)           5,913,458 ops/sec
  · сложное условие (глубина 3, ширина 3)    211,595 ops/sec
  · глубокое условие (глубина 5)             147,214 ops/sec
```

### 2. Стресс-тест в браузере (React Profiler)

```bash
npm run dev
# Открыть http://localhost:5173
```

**Возможности UI:**
- Настройка количества групп (1-20) и полей (1-50)
- Включение/выключение условий visible/disabled
- Метрики в реальном времени: Mount, Update avg/max/min
- Список последних рендеров с временем

**Метрики:**
| Метрика | Описание | Цель |
|---------|----------|------|
| Mount (avg) | Время первичного рендера | < 16ms |
| Update (avg) | Среднее время обновления | < 16ms |
| Update (max) | Максимальное время обновления | < 16ms |

### 3. Why Did You Render (лишние ре-рендеры)

Установлен `@welldone-software/why-did-you-render`.

**Как использовать:**
1. Запустить `npm run dev`
2. Открыть DevTools → Console
3. Взаимодействовать с формой
4. В консоли будут логи вида:

```
FieldGroup re-rendered
  reason: props changed
  prev { formValues: {...} }
  next { formValues: {...} }
```

**Что искать:**
- Компоненты с частыми ре-рендерами
- Причины: `props changed`, `hooks changed`
- Одинаковые prev/next значения (признак проблемы)

### 4. Bundle size

```bash
npm run build
ls -la dist/
```

**Проверка размера зависимостей:**
```bash
npx vite-bundle-visualizer
```

---

## Порядок внедрения

1. ✅ Снять baseline метрики (выполнено)
2. ✅ Реализовать оптимизацию 1.1 (JSON.stringify → useRef) — ВЫПОЛНЕНО
3. ✅ Реализовать оптимизацию 1.2 (MemoizedField компонент) — ВЫПОЛНЕНО
4. ✅ Реализовать оптимизацию 2.1 (validateFieldConfig в useMemo) — ВЫПОЛНЕНО
5. ⏸️ Оптимизация 2.2 (moment → dayjs) — ОТЛОЖЕНО (antd 4.x требует moment)
6. ✅ Реализовать оптимизацию 3.1 (useCallback для filterOption) — ВЫПОЛНЕНО
7. ✅ E2E тесты прогнаны, метрики записаны (2026-02-09)

---

## Выполненные оптимизации (2026-02-09)

### 1.1 JSON.stringify → useRef
- **Файл:** `FormGenerator.tsx`
- **Изменение:** Заменён `JSON.stringify(touchedFields)` на `useRef` с ручным сравнением ключей
- **Статус:** ✅ Было выполнено ранее

### 1.2 MemoizedField компонент
- **Файл:** `FieldGroup.tsx`
- **Изменение:** Создан `MemoizedField` компонент с `useMemo` для `evaluateConditions`
- **Эффект:** Каждое поле мемоизирует свои условия отдельно

### 2.1 validateFieldConfig в useMemo
- **Файлы:** `InputField.tsx`, `SelectField.tsx`, `DateField.tsx`, `SwitchField.tsx`, `InputNumberField.tsx`
- **Изменение:** `validateFieldConfig(config)` обёрнут в `useMemo(() => ..., [config])`

### 3.1 useCallback для filterOption
- **Файл:** `SelectField.tsx`
- **Изменение:** Inline функция `filterOption` заменена на `useCallback`

---

## Файлы для изменения

```
src/
├── components/
│   ├── FormGenerator/
│   │   └── FormGenerator.tsx      # Проблемы 1
│   └── FieldGroup/
│       └── FieldGroup.tsx         # Проблема 2
├── fields/
│   ├── InputField/InputField.tsx  # Проблема 3
│   ├── SelectField/SelectField.tsx # Проблемы 3, 5
│   ├── DateField/DateField.tsx    # Проблемы 3, 4
│   ├── SwitchField/SwitchField.tsx # Проблема 3
│   └── InputNumberField/...       # Проблема 3
└── utils/
    └── evaluateConditions/        # Возможная оптимизация кэширования
```
