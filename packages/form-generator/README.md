# @form-generator/core

Настраиваемый генератор форм для React с условной логикой, вычисляемыми значениями и динамической валидацией. Сложные формы — из простого JSON-конфига, без boilerplate-кода.

## Стек

- React 17 / 18
- TypeScript
- Ant Design v4
- React Hook Form

## Установка

```bash
npm install @form-generator/core
# peer-зависимости
npm install antd react react-dom react-hook-form
```

## Быстрый старт

```tsx
import { FormGenerator, FormConfig } from '@form-generator/core'

const config: FormConfig = {
  groups: [
    {
      name: 'Личные данные',
      fields: [
        { type: 'input', name: 'name', label: 'Имя' },
        { type: 'inputNumber', name: 'age', label: 'Возраст', min: 0, max: 120 },
      ],
    },
  ],
}

export default function App() {
  return <FormGenerator config={config} onSubmit={console.log} />
}
```

## Типы полей

| Тип           | Описание                                        |
|---------------|-------------------------------------------------|
| `input`       | Текстовый ввод (text, email, password и др.)   |
| `inputNumber` | Числовой ввод с min / max / step               |
| `select`      | Выпадающий список, поддерживает мультивыбор    |
| `switch`      | Булев переключатель                             |
| `date`        | Выбор даты и времени                           |
| `money`       | Денежный ввод с префиксом/суффиксом            |
| `textarea`    | Многострочный текст с авторазмером             |

## Условная логика

Условия можно задавать на полях (`visibleCondition`, `validateCondition`, `disabledCondition`) и на группах (`visibleCondition`, `validateCondition`).

### Операторы

| Оператор           | Смысл                                             |
|--------------------|---------------------------------------------------|
| `===`              | Строгое равенство                                 |
| `!==`              | Строгое неравенство                               |
| `<` `>` `<=` `>=` | Числовое / дата-сравнение                         |
| `∅`                | Пусто (null, undefined, `''`, `[]`, `{}`)         |
| `!∅`               | Не пусто                                          |
| `includes`         | Строка / массив содержит значение                 |
| `startsWith`       | Строка начинается с                               |
| `endsWith`         | Строка заканчивается на                           |
| `match`            | Совпадение с регулярным выражением                |

Чтобы сослаться на другое поле, используйте `$` в `value`: `{ field: 'confirm', condition: '===', value: '$password' }`.

### ConditionValue

```ts
{ field: 'role', condition: '===', value: 'admin' }
```

### ConditionGroup

Объединяет несколько условий через `and` / `or`. Группы могут быть вложены произвольно.

```ts
{
  comparisonType: 'and',
  children: [
    { field: 'age', condition: '>=', value: 18 },
    { field: 'country', condition: '===', value: 'RU' },
  ],
}
```

### visibleCondition — показать / скрыть

```ts
{
  type: 'input',
  name: 'licenseNumber',
  label: 'Номер прав',
  visibleCondition: {
    comparisonType: 'and',
    children: [{ field: 'hasLicense', condition: '===', value: true }],
  },
}
```

### disabledCondition — заблокировать

```ts
{
  type: 'input',
  name: 'promoCode',
  label: 'Промокод',
  disabledCondition: {
    comparisonType: 'and',
    children: [{ field: 'isPremium', condition: '===', value: true }],
  },
}
```

### validateCondition — кастомная валидация

Поле считается невалидным, когда условие возвращает `false`. Используйте `message` в `ConditionValue` для текста ошибки.

```ts
{
  type: 'input',
  name: 'comment',
  label: 'Комментарий',
  validateCondition: {
    comparisonType: 'or',
    children: [
      { field: 'type', condition: '!==', value: 'complaint' },
      { field: 'comment', condition: '!∅', message: 'Комментарий обязателен для жалоб' },
    ],
  },
}
```

## Вычисляемые значения

`computedValue` автоматически устанавливает значение поля на основе других полей. Побеждает первый совпавший `case`; при отсутствии совпадений используется `default`. Если `default` не задан — поле не изменяется.

### Условная подстановка

```ts
{
  type: 'select',
  name: 'orderType',
  label: 'Тип заказа',
  computedValue: {
    cases: [
      {
        condition: {
          comparisonType: 'and',
          children: [
            { field: 'category', condition: '===', value: 'B' },
            { field: 'enabled', condition: '===', value: true },
          ],
        },
        value: 'manual',   // литерал или '$fieldRef'
      },
    ],
    default: 'auto',
  },
}
```

### Арифметические выражения

`value` может быть `ArithmeticExpression` с оператором `+` `-` `*` `/`. Операнды — литералы или строки `$fieldRef`.

```ts
computedValue: {
  cases: [
    {
      condition: { field: 'enabled', condition: '===', value: true },
      value: { left: '$price', operator: '*', right: '$quantity' },
    },
  ],
  default: null,
}
```

> При `null`/`undefined` операндах, нечисловых значениях или делении на ноль арифметика возвращает `null`.

## Кнопки

```ts
buttons: [
  {
    key: 'submit',
    label: 'Отправить',
    type: 'primary',
    action: 'submit',
    requiresValidation: true,
    url: 'https://api.example.com/form',
    method: 'POST',
    resetAfterSubmit: true,
    successNotification: { message: 'Данные отправлены!' },
    errorNotification: { message: 'Ошибка', description: 'Попробуйте позже' },
  },
  { key: 'reset', label: 'Сбросить', action: 'reset' },
]
```

Если `buttons` не задан, рендерится стандартная кнопка Submit, использующая проп `onSubmit`.

## Программное управление

```tsx
import { useRef } from 'react'
import { FormGenerator, FormGeneratorRef } from '@form-generator/core'

function App() {
  const ref = useRef<FormGeneratorRef>(null)

  return (
    <>
      <FormGenerator ref={ref} config={config} />
      <button onClick={() => ref.current?.submit()}>Отправить снаружи</button>
      <button onClick={() => ref.current?.reset()}>Сбросить</button>
      <button onClick={() => console.log(ref.current?.getValues())}>Получить значения</button>
      <button onClick={() => ref.current?.setValue('name', 'Алиса')}>Установить значение</button>
    </>
  )
}
```

## Разработка

```bash
# Запустить тесты
npm test

# Тесты с покрытием
npm run test:coverage

# Storybook
npm run storybook

# Сборка пакета
npm run build
```

## Лицензия

MIT
