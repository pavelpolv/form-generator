# Динамические списки (dynamicList)

## Что такое dynamicList

Тип поля `dynamicList` позволяет создавать список элементов, где каждый элемент является набором полей (вложенная форма). Пользователь может добавлять и удалять элементы. Аналог [Ant Design dynamic form](https://4x.ant.design/components/form/#components-form-demo-dynamic-form-item).

## Структура конфига

```typescript
interface DynamicListField {
  /** Тип поля — всегда 'dynamicList' */
  type: 'dynamicList'

  /** Уникальное имя поля — используется как ключ в значениях формы */
  name: string

  /** Отображаемая метка */
  label: string

  /** Поля, отображаемые внутри каждого элемента списка */
  itemFields: DynamicListItemField[]

  /** Настройка кнопки добавления элемента */
  addButton?: DynamicListAddButtonConfig

  /** Условие отображения всего списка */
  visibleCondition?: ConditionGroup

  /** Условие валидации (на уровне списка, для кастомного использования) */
  validateCondition?: ConditionGroup

  /** Условие блокировки — если true, кнопка добавления и кнопки удаления отключены */
  disabledCondition?: ConditionGroup

  /** Порядок отображения (меньше = раньше) */
  order?: number
}
```

### Поддерживаемые типы для itemFields

В `itemFields` поддерживаются все базовые типы полей:
- `input`
- `inputNumber`
- `select`
- `switch`
- `date`
- `money`
- `textarea`

## Структура значений

Значения `dynamicList` хранятся как массив объектов:

```typescript
// Конфиг:
{
  type: 'dynamicList',
  name: 'passengers',
  itemFields: [
    { type: 'input', name: 'name', label: 'Name' },
    { type: 'inputNumber', name: 'age', label: 'Age' },
  ]
}

// Значения формы:
{
  passengers: [
    { name: 'John', age: 30 },
    { name: 'Jane', age: 25 },
  ]
}
```

## Условия на уровне списка

`visibleCondition`, `disabledCondition`, `validateCondition` на уровне `DynamicListField` вычисляются относительно **всей формы** (глобальный скоуп).

```typescript
{
  type: 'dynamicList',
  name: 'passengers',
  label: 'Passengers',
  // Список виден только если выбран рейс
  visibleCondition: {
    comparisonType: 'and',
    children: [{ field: 'flightNumber', condition: '!∅' }],
  },
  // Список заблокирован если форма readonly
  disabledCondition: {
    comparisonType: 'and',
    children: [{ field: 'readonly', condition: '===', value: true }],
  },
  itemFields: [...],
}
```

## Условия внутри item-полей

Условия (`visibleCondition`, `disabledCondition`, `validateCondition`) в полях `itemFields` вычисляются в **скоупе item** — то есть относительно значений конкретного элемента списка, а не всей формы.

Это значит что `$fieldRef` в условии item-поля ссылается на другое поле **того же item**, а не на глобальное поле.

```typescript
{
  type: 'dynamicList',
  name: 'passengers',
  label: 'Passengers',
  itemFields: [
    {
      type: 'input',
      name: 'name',
      label: 'Name',
      // Условие вычисляется в скоупе item — поле 'name' этого элемента
      validateCondition: {
        comparisonType: 'and',
        children: [{ field: 'name', condition: '!∅', message: 'Name is required' }],
      },
    },
    {
      type: 'input',
      name: 'passport',
      label: 'Passport',
      // Поле 'passport' видно только если 'name' заполнено В ЭТОМ же item
      visibleCondition: {
        comparisonType: 'and',
        children: [{ field: 'name', condition: '!∅' }],
      },
    },
  ],
}
```

## Настройка кнопки добавления (`addButton`)

Кнопка добавления элемента настраивается через объект `addButton`:

```typescript
interface DynamicListAddButtonConfig {
  /** Текст кнопки. По умолчанию: 'Add item' */
  label?: string
  /** Позиция относительно списка: 'top' или 'bottom'. По умолчанию: 'bottom' */
  position?: 'top' | 'bottom'
  /** Размер кнопки (Ant Design). По умолчанию: 'middle' */
  size?: 'large' | 'middle' | 'small'
  /** Растянуть на всю ширину. По умолчанию: true */
  block?: boolean
  /** Кастомная иконка. По умолчанию: <PlusOutlined /> */
  icon?: ReactNode
}
```

Пример — кнопка сверху, маленькая, не на всю ширину:

```typescript
{
  type: 'dynamicList',
  name: 'passengers',
  label: 'Passengers',
  addButton: {
    label: 'Add passenger',
    position: 'top',
    size: 'small',
    block: false,
  },
  itemFields: [...],
}
```

## Полные примеры

### Простой список

```typescript
const config: FormConfig = {
  groups: [{
    name: 'Order',
    fields: [
      {
        type: 'dynamicList',
        name: 'items',
        label: 'Order Items',
        addButton: { label: 'Add item' },
        itemFields: [
          { type: 'input', name: 'product', label: 'Product', placeholder: 'Product name' },
          { type: 'inputNumber', name: 'qty', label: 'Qty', placeholder: '1', min: 1, defaultValue: 1 },
          { type: 'money', name: 'price', label: 'Price', prefix: '$' },
        ],
      },
    ],
  }],
}
```

### Список с валидацией

```typescript
const config: FormConfig = {
  groups: [{
    name: 'Contacts',
    fields: [
      {
        type: 'dynamicList',
        name: 'contacts',
        label: 'Contacts',
        addButton: { label: 'Add contact' },
        itemFields: [
          {
            type: 'input',
            name: 'name',
            label: 'Name',
            placeholder: 'Full name',
            validateCondition: {
              comparisonType: 'and',
              children: [{ field: 'name', condition: '!∅', message: 'Name is required' }],
            },
          },
          {
            type: 'input',
            name: 'email',
            label: 'Email',
            placeholder: 'email@example.com',
            inputType: 'email',
            validateCondition: {
              comparisonType: 'and',
              children: [{ field: 'email', condition: '!∅', message: 'Email is required' }],
            },
          },
        ],
      },
    ],
  }],
}
```

### Список с условной видимостью полей

```typescript
const config: FormConfig = {
  groups: [{
    name: 'Passengers',
    fields: [
      {
        type: 'dynamicList',
        name: 'passengers',
        label: 'Passengers',
        addButton: { label: 'Add passenger' },
        itemFields: [
          { type: 'input', name: 'name', label: 'Name', placeholder: 'Full name' },
          {
            type: 'select',
            name: 'docType',
            label: 'Document Type',
            defaultValue: 'passport',
            options: [
              { label: 'Passport', value: 'passport' },
              { label: "Driver's License", value: 'license' },
            ],
          },
          {
            type: 'input',
            name: 'passportNumber',
            label: 'Passport Number',
            placeholder: 'XX 000000',
            // Видно только если выбран паспорт (скоуп: поля этого item)
            visibleCondition: {
              comparisonType: 'and',
              children: [{ field: 'docType', condition: '===', value: 'passport' }],
            },
          },
          {
            type: 'input',
            name: 'licenseNumber',
            label: 'License Number',
            placeholder: '0000 000000',
            // Видно только если выбраны права (скоуп: поля этого item)
            visibleCondition: {
              comparisonType: 'and',
              children: [{ field: 'docType', condition: '===', value: 'license' }],
            },
          },
        ],
      },
    ],
  }],
}
```

## Ограничения

- **Нет вложенных `dynamicList`** — использование `dynamicList` внутри `itemFields` не поддерживается.
- **Нет `computedValue` в item-полях** — `computedValue` в `itemFields` игнорируется. Используйте только в полях верхнего уровня.
- **Нет `minItems`/`maxItems`** — ограничений на количество элементов нет. Если нужна такая валидация, реализуйте её на уровне `validateCondition` группы или кастомной логики формы.
