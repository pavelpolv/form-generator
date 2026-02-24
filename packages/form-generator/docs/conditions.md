# Условия: visibleCondition, validateCondition, disabledCondition

## Что такое условия

Условия - это декларативные правила, которые управляют поведением полей и групп формы:

| Свойство | Где применяется | Эффект при `true` |
|---|---|---|
| `visibleCondition` | поле, группа | элемент отображается |
| `validateCondition` | поле, группа | валидация пройдена |
| `disabledCondition` | поле, `dynamicList` | элемент заблокирован |

Если условие не задано - поле/группа всегда видимы, всегда проходят валидацию, никогда не заблокированы.

---

## Структура условия

Условие - это либо **одиночная проверка** (`ConditionValue`), либо **группа проверок** (`ConditionGroup`).

### ConditionValue - одиночная проверка

```typescript
interface ConditionValue {
  field: string           // имя поля формы
  condition: ComparisonOperator
  value?: any             // с чем сравниваем (необязательно для ∅ / !∅)
  message?: string        // текст ошибки (только для validateCondition)
}
```

### ConditionGroup - группа проверок

```typescript
interface ConditionGroup {
  comparisonType: 'and' | 'or'
  children: Array<ConditionValue | ConditionGroup>  // можно вкладывать
}
```

- `'and'` - все условия из `children` должны быть `true`
- `'or'` - достаточно одного `true`
- `children` не может быть пустым

---

## Операторы

| Оператор | Тип значений | Описание |
|---|---|---|
| `===` | любой | Строгое равенство |
| `!==` | любой | Строгое неравенство |
| `<` | число, дата | Меньше |
| `>` | число, дата | Больше |
| `<=` | число, дата | Меньше или равно |
| `>=` | число, дата | Больше или равно |
| `∅` | любой | Пусто (см. ниже) |
| `!∅` | любой | Не пусто |
| `includes` | строка, массив | Строка/массив содержит значение |
| `startsWith` | строка | Строка начинается с |
| `endsWith` | строка | Строка заканчивается на |
| `match` | строка | Строка соответствует регулярному выражению |

### Что считается «пустым» (`∅`)

| Значение | Пусто? |
|---|---|
| `null` | да |
| `undefined` | да |
| `''` (пустая строка) | да |
| `'  '` (только пробелы) | да |
| `[]` | да |
| `{}` | да |
| `0` | **нет** |
| `false` | **нет** |
| `'text'` | нет |
| `[1, 2]` | нет |

### Ссылка на другое поле (`$fieldName`)

В `value` можно передать имя другого поля с префиксом `$` - тогда берётся его текущее значение:

```typescript
// password должен совпадать с confirmPassword
{ field: 'password', condition: '===', value: '$confirmPassword' }

// startDate должна быть раньше endDate
{ field: 'startDate', condition: '<', value: '$endDate' }
```

---

## Примеры

### visibleCondition - показать поле при условии

```typescript
// Поле видно только если выбрана категория 'other'
{
  type: 'input',
  name: 'customCategory',
  label: 'Specify category',
  visibleCondition: {
    comparisonType: 'and',
    children: [
      { field: 'category', condition: '===', value: 'other' },
    ],
  },
}
```

```typescript
// Поле видно если страна - США или Канада
{
  visibleCondition: {
    comparisonType: 'or',
    children: [
      { field: 'country', condition: '===', value: 'US' },
      { field: 'country', condition: '===', value: 'CA' },
    ],
  },
}
```

### validateCondition - валидация поля

Условие должно вернуть `true`, чтобы поле считалось валидным. Ошибки показываются после того, как поле было тронуто (или при попытке сабмита).

```typescript
// Поле обязательно
{
  type: 'input',
  name: 'email',
  label: 'Email',
  validateCondition: {
    comparisonType: 'and',
    children: [
      { field: 'email', condition: '!∅', message: 'Email is required' },
    ],
  },
}
```

```typescript
// Несколько правил в одном условии
{
  type: 'inputNumber',
  name: 'age',
  label: 'Age',
  validateCondition: {
    comparisonType: 'and',
    children: [
      { field: 'age', condition: '!∅',  message: 'Age is required' },
      { field: 'age', condition: '>=', value: 18, message: 'Must be 18 or older' },
      { field: 'age', condition: '<=', value: 120, message: 'Invalid age' },
    ],
  },
}
```

```typescript
// Валидация через ссылку на другое поле
{
  type: 'input',
  name: 'confirmPassword',
  label: 'Confirm password',
  validateCondition: {
    comparisonType: 'and',
    children: [
      {
        field: 'confirmPassword',
        condition: '===',
        value: '$password',
        message: 'Passwords do not match',
      },
    ],
  },
}
```

### disabledCondition - блокировка поля

```typescript
// Поле заблокировано если форма в режиме просмотра
{
  type: 'input',
  name: 'name',
  label: 'Name',
  disabledCondition: {
    comparisonType: 'and',
    children: [
      { field: 'readonly', condition: '===', value: true },
    ],
  },
}
```

### Вложенные группы (AND + OR)

```typescript
// Поле видно если: isPremium === true  ИЛИ  (age >= 18  И  hasConsent === true)
{
  visibleCondition: {
    comparisonType: 'or',
    children: [
      { field: 'isPremium', condition: '===', value: true },
      {
        comparisonType: 'and',
        children: [
          { field: 'age', condition: '>=', value: 18 },
          { field: 'hasConsent', condition: '===', value: true },
        ],
      },
    ],
  },
}
```

---

## Сообщения об ошибках (`message`)

Поле `message` задаётся только в `ConditionValue` внутри `validateCondition`. Оно игнорируется в `visibleCondition` и `disabledCondition`.

Логика показа сообщений:

- **AND-группа**: показываются сообщения от всех *упавших* условий
- **OR-группа**: если вся группа упала (все условия `false`) - показываются сообщения от всех условий

```typescript
validateCondition: {
  comparisonType: 'and',
  children: [
    { field: 'email', condition: '!∅',       message: 'Email is required' },  // показывается если email пуст
    { field: 'email', condition: 'includes', value: '@', message: 'Invalid email format' },  // показывается если нет @
  ],
}
// При email='' → оба сообщения
// При email='noatsign' → только 'Invalid email format'
// При email='a@b.com' → нет ошибок
```

---

## Даты

Операторы `<`, `>`, `<=`, `>=` автоматически определяют ISO-строки и сравнивают их как даты:

```typescript
// Дата начала должна быть раньше даты окончания
{
  type: 'date',
  name: 'startDate',
  label: 'Start date',
  validateCondition: {
    comparisonType: 'and',
    children: [
      {
        field: 'startDate',
        condition: '<=',
        value: '$endDate',
        message: 'Start date must be before end date',
      },
    ],
  },
}
```

Поддерживаемый формат: `YYYY-MM-DDTHH:mm:ss[.mmm]Z` (ISO 8601).

---

## Условия на группах

`visibleCondition` и `validateCondition` можно задавать на уровне группы (`GroupField`):

```typescript
{
  name: 'Shipping',
  visibleCondition: {
    comparisonType: 'and',
    children: [
      { field: 'needsShipping', condition: '===', value: true },
    ],
  },
  fields: [...],
}
```

Если группа скрыта - все её поля скрыты и исключены из валидации.

---

## Скоуп вычисления

- **Поля верхнего уровня** и **группы**: условия вычисляются относительно всех значений формы.
- **Поля внутри `dynamicList`**: условия вычисляются относительно значений **конкретного элемента** списка. `$fieldRef` ссылается на поле того же item, а не на глобальное поле.

```typescript
// Поле 'passport' в itemFields видно только если 'docType' этого item === 'passport'
{
  type: 'dynamicList',
  name: 'passengers',
  itemFields: [
    {
      type: 'select',
      name: 'docType',
      label: 'Document type',
      options: [
        { label: 'Passport', value: 'passport' },
        { label: "Driver's license", value: 'license' },
      ],
    },
    {
      type: 'input',
      name: 'passportNumber',
      label: 'Passport number',
      visibleCondition: {
        comparisonType: 'and',
        children: [
          { field: 'docType', condition: '===', value: 'passport' },
          //        ↑ docType этого item, не глобальное поле
        ],
      },
    },
  ],
}
```

---

## Ограничения

- Максимальная глубина вложенности условий: **50 уровней**. При превышении вычисление возвращает `false`.
- `children` группы не может быть пустым - группа с `children: []` возвращает `false`.
- Неизвестный оператор возвращает `false` (ошибка в консоль).
- Несуществующее поле в `field` не вызывает ошибку - значение считается `undefined`.
