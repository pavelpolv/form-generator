# Вычисляемые значения (computedValue)

## Что такое computedValue

`computedValue` - конфигурация, которая автоматически вычисляет и устанавливает значение поля на основе значений других полей формы. Вычисление происходит при каждом изменении формы.

```typescript
{
  type: 'inputNumber',
  name: 'total',
  label: 'Total',
  computedValue: {
    cases: [
      {
        condition: { field: 'qty', condition: '!∅' },
        value: { left: '$qty', operator: '*', right: '$price' },
      },
    ],
    default: null,
  },
}
```

---

## Структура

```typescript
interface ComputedValueConfig {
  /** Список кейсов, проверяемых по порядку. Первый совпавший выигрывает */
  cases: ComputedCase[]
  /** Значение, если ни один кейс не совпал. Если не задан - поле не изменяется */
  default?: ComputedResultValue
}

interface ComputedCase {
  /** Условие активации кейса (ConditionValue или ConditionGroup) */
  condition: ConditionGroup | ConditionValue
  /** Что присвоить полю */
  value: ComputedResultValue
}

// Что можно присвоить:
type ComputedResultValue =
  | string      // литерал или '$fieldRef'
  | number      // числовой литерал
  | boolean     // булев литерал
  | null        // очистить поле
  | ArithmeticExpression  // арифметика

interface ArithmeticExpression {
  left: string | number | boolean | null   // литерал или '$fieldRef'
  operator: '+' | '-' | '*' | '/'
  right: string | number | boolean | null  // литерал или '$fieldRef'
}
```

---

## Виды значений (`value`)

### Литерал

Фиксированное значение - строка, число, булев или `null`:

```typescript
{ condition: { field: 'type', condition: '===', value: 'premium' }, value: 'VIP' }
{ condition: { field: 'active', condition: '===', value: true },    value: 100  }
{ condition: { field: 'reset', condition: '===', value: true },     value: null }
```

### Ссылка на другое поле (`$fieldName`)

Значение берётся из другого поля формы в момент вычисления:

```typescript
// Скопировать значение поля 'firstName' в поле 'displayName'
{ condition: { field: 'useFirst', condition: '===', value: true }, value: '$firstName' }
```

### Арифметическое выражение

Два операнда и оператор. Операнды - литералы или `$fieldRef`:

```typescript
// total = qty * price
{
  condition: { field: 'qty', condition: '!∅' },
  value: { left: '$qty', operator: '*', right: '$price' },
}

// discountedPrice = price - discount
{
  condition: { field: 'discount', condition: '!∅' },
  value: { left: '$price', operator: '-', right: '$discount' },
}

// Смешанное: (qty * price) + 5 - не поддерживается напрямую, только два операнда
// Для сложных выражений используйте промежуточные вычисляемые поля
```

| Оператор | Описание |
|---|---|
| `+` | Сложение |
| `-` | Вычитание |
| `*` | Умножение |
| `/` | Деление |

---

## Логика кейсов

Кейсы проверяются **по порядку**. Срабатывает **первый совпавший**:

```typescript
computedValue: {
  cases: [
    { condition: { field: 'tier', condition: '===', value: 'gold'   }, value: 0.1  },
    { condition: { field: 'tier', condition: '===', value: 'silver' }, value: 0.05 },
    { condition: { field: 'tier', condition: '===', value: 'bronze' }, value: 0.02 },
  ],
  default: 0,
}
// tier='gold'   → 0.1
// tier='silver' → 0.05
// tier='bronze' → 0.02
// tier='none'   → 0  (default)
```

Если ни один кейс не совпал и `default` не задан - поле **не изменяется** (пользователь может редактировать его вручную).

---

## Примеры

### Автоматическая сумма

```typescript
{
  type: 'inputNumber',
  name: 'total',
  label: 'Total',
  computedValue: {
    cases: [
      {
        condition: {
          comparisonType: 'and',
          children: [
            { field: 'qty',   condition: '!∅' },
            { field: 'price', condition: '!∅' },
          ],
        },
        value: { left: '$qty', operator: '*', right: '$price' },
      },
    ],
    default: null,
  },
}
```

### Копирование значения из другого поля

```typescript
{
  type: 'input',
  name: 'billingCity',
  label: 'Billing City',
  computedValue: {
    cases: [
      {
        // Если "same as shipping" включён - копируем город
        condition: { field: 'sameAsShipping', condition: '===', value: true },
        value: '$shippingCity',
      },
    ],
    // Когда флаг выключен - не трогаем (пользователь вводит сам)
  },
}
```

### Присвоение по условию (enum → label)

```typescript
{
  type: 'input',
  name: 'statusLabel',
  label: 'Status',
  computedValue: {
    cases: [
      { condition: { field: 'status', condition: '===', value: 'active'   }, value: 'Active'   },
      { condition: { field: 'status', condition: '===', value: 'inactive' }, value: 'Inactive' },
      { condition: { field: 'status', condition: '===', value: 'pending'  }, value: 'Pending'  },
    ],
    default: '-',
  },
}
```

### Скидка в процентах

```typescript
// Поле discount_pct вычисляется как discount / price * 100
// (два шага, т.к. арифметика поддерживает только одно выражение)

// Шаг 1: промежуточное поле ratio = discount / price
{
  type: 'inputNumber',
  name: 'ratio',
  label: '',  // скрытое вспомогательное поле
  computedValue: {
    cases: [
      {
        condition: { field: 'price', condition: '!==', value: 0 },
        value: { left: '$discount', operator: '/', right: '$price' },
      },
    ],
    default: null,
  },
}

// Шаг 2: discount_pct = ratio * 100
{
  type: 'inputNumber',
  name: 'discountPct',
  label: 'Discount %',
  computedValue: {
    cases: [
      {
        condition: { field: 'ratio', condition: '!∅' },
        value: { left: '$ratio', operator: '*', right: 100 },
      },
    ],
    default: null,
  },
}
```

---

## Как работает внутри

1. При каждом изменении любого поля формы `FormGenerator` пробегает по всем полям с `computedValue`.
2. Для каждого поля вычисляется результат: перебираются `cases` по порядку, первый совпавший возвращает значение; если ни один не совпал - используется `default`.
3. Если `shouldUpdate: true` и новое значение **отличается** от текущего - вызывается `setValue`. Защита от бесконечных циклов: `setValue` не вызывается если значение не изменилось.
4. `setValue` устанавливает значение с `{ shouldValidate: false, shouldDirty: false }` - не помечает поле как «изменённое» и не запускает ре-валидацию.

---

## Граничные случаи

| Ситуация | Результат |
|---|---|
| `$fieldRef` ссылается на несуществующее поле | Значение `undefined`, арифметика вернёт `null` |
| Деление на ноль (`/ 0`) | Арифметика вернёт `null` |
| Нечисловые операнды в арифметике (`'abc' * 2`) | Арифметика вернёт `null`, ошибка в консоль |
| Оба операнда `null` / `undefined` | Арифметика вернёт `null` |
| Нет совпавших кейсов и нет `default` | Поле не изменяется |
| `default: null` (явно задан) | Поле сбрасывается в `null` |

---

## Ограничения

- **Только поля верхнего уровня.** `computedValue` в `itemFields` динамического списка (`dynamicList`) игнорируется.
- **Одно арифметическое выражение - два операнда.** Для `(a + b) * c` используйте промежуточное вычисляемое поле.
- **Условие `condition` обязательно.** Чтобы значение вычислялось всегда, используйте `default` вместо кейса без условия.
- **Нет строковых операций.** `value` - это литерал, `$fieldRef` или арифметика; конкатенация строк не поддерживается.
