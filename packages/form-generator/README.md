# @form-generator/core

Configurable form generator for React with conditional logic, computed values, and dynamic validation. Build complex forms from a plain JSON config — no boilerplate.

## Tech stack

- React 17 / 18
- TypeScript
- Ant Design v4
- React Hook Form

## Installation

```bash
npm install @form-generator/core
# peer deps
npm install antd react react-dom react-hook-form
```

## Quick start

```tsx
import { FormGenerator } from '@form-generator/core'
import { FormConfig } from '@form-generator/core'

const config: FormConfig = {
  groups: [
    {
      name: 'Personal Info',
      fields: [
        { type: 'input', name: 'name', label: 'Name' },
        { type: 'inputNumber', name: 'age', label: 'Age', min: 0, max: 120 },
      ],
    },
  ],
}

export default function App() {
  return <FormGenerator config={config} onSubmit={console.log} />
}
```

## Field types

| Type          | Description                        |
|---------------|------------------------------------|
| `input`       | Text input (text, email, password…)|
| `inputNumber` | Numeric input with min/max/step    |
| `select`      | Dropdown, supports multi-select    |
| `switch`      | Boolean toggle                     |
| `date`        | Date/datetime picker               |
| `money`       | Currency input with prefix/suffix  |
| `textarea`    | Multiline text with auto-resize    |

## Conditional logic

All conditions can be placed on fields (`visibleCondition`, `validateCondition`, `disabledCondition`) and on groups (`visibleCondition`, `validateCondition`).

### Operators

| Operator     | Meaning                          |
|--------------|----------------------------------|
| `===`        | Strict equal                     |
| `!==`        | Strict not equal                 |
| `<` `>` `<=` `>=` | Numeric / date comparison  |
| `∅`          | Empty (null, undefined, `''`, `[]`, `{}`) |
| `!∅`         | Not empty                        |
| `includes`   | String/array contains            |
| `startsWith` | String starts with               |
| `endsWith`   | String ends with                 |
| `match`      | Regex match                      |

Use a `$` prefix in `value` to reference another field: `{ field: 'confirm', condition: '===', value: '$password' }`.

### ConditionValue

```ts
{ field: 'role', condition: '===', value: 'admin' }
```

### ConditionGroup

Combine multiple conditions with `and` / `or`. Groups can be nested arbitrarily.

```ts
{
  comparisonType: 'and',
  children: [
    { field: 'age', condition: '>=', value: 18 },
    { field: 'country', condition: '===', value: 'US' },
  ],
}
```

### visibleCondition — show / hide

```ts
{
  type: 'input',
  name: 'licenseNumber',
  label: 'License Number',
  visibleCondition: {
    comparisonType: 'and',
    children: [{ field: 'hasLicense', condition: '===', value: true }],
  },
}
```

### disabledCondition — disable

```ts
{
  type: 'input',
  name: 'code',
  label: 'Promo Code',
  disabledCondition: {
    comparisonType: 'and',
    children: [{ field: 'isPremium', condition: '===', value: true }],
  },
}
```

### validateCondition — custom validation

When the condition evaluates to `false`, the field is invalid. Use `message` on `ConditionValue` to display a custom error.

```ts
{
  type: 'input',
  name: 'comment',
  label: 'Comment',
  validateCondition: {
    comparisonType: 'or',
    children: [
      { field: 'type', condition: '!==', value: 'complaint' },
      { field: 'comment', condition: '!∅', message: 'Comment is required for complaints' },
    ],
  },
}
```

## Computed values

`computedValue` automatically sets a field's value based on other fields. The first matching `case` wins; `default` is used as a fallback. Omitting `default` leaves the field unchanged when no case matches.

### Conditional substitution

```ts
{
  type: 'select',
  name: 'orderType',
  label: 'Order Type',
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
        value: 'manual',   // literal or '$fieldRef'
      },
    ],
    default: 'auto',
  },
}
```

### Arithmetic expressions

`value` can be an `ArithmeticExpression` with operator `+` `-` `*` `/`. Operands are literals or `$fieldRef` strings.

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

> Arithmetic returns `null` for `null`/`undefined` operands, non-numeric values, or division by zero.

## Buttons

```ts
buttons: [
  {
    key: 'submit',
    label: 'Send',
    type: 'primary',
    action: 'submit',
    requiresValidation: true,
    url: 'https://api.example.com/form',
    method: 'POST',
    resetAfterSubmit: true,
    successNotification: { message: 'Sent!' },
    errorNotification: { message: 'Error', description: 'Try again later' },
  },
  { key: 'reset', label: 'Reset', action: 'reset' },
]
```

If `buttons` is omitted, a default Submit button using the `onSubmit` prop is rendered.

## Programmatic control

```tsx
import { useRef } from 'react'
import { FormGenerator, FormGeneratorRef } from '@form-generator/core'

function App() {
  const ref = useRef<FormGeneratorRef>(null)

  return (
    <>
      <FormGenerator ref={ref} config={config} />
      <button onClick={() => ref.current?.submit()}>Submit externally</button>
      <button onClick={() => ref.current?.reset()}>Reset</button>
      <button onClick={() => console.log(ref.current?.getValues())}>Log values</button>
      <button onClick={() => ref.current?.setValue('name', 'Alice')}>Set name</button>
    </>
  )
}
```

## Development

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Storybook
npm run storybook

# Build package
npm run build
```

## License

MIT
