# Form Generator

Генератор форм для React с поддержкой условной логики, конфигурируемый через код.

## Возможности

- ✅ **Условная видимость**: Показывать/скрывать поля и группы на основе значений формы
- ✅ **Условная валидация**: Динамические правила валидации с пользовательскими сообщениями об ошибках
- ✅ **Disabled состояние**: Включать/отключать поля на основе условий
- ✅ **Типобезопасность**: Полная типизация с TypeScript
- ✅ **Оптимизация производительности**: Минимальные ре-рендеры с React Hook Form
- ✅ **Расширяемость**: Легко добавлять новые типы полей

## Технологический стек

- React 17
- TypeScript
- AntD v4
- React Hook Form
- Moment.js (для AntD DatePicker)
- Day.js (опционально)

## Установка

```bash
npm install form-generator
```

## Быстрый старт

```tsx
import { FormGenerator, FormConfig } from 'form-generator'

const config: FormConfig = {
  groups: [
    {
      name: 'Personal Information',
      fields: [
        {
          type: 'input',
          name: 'firstName',
          label: 'First Name',
          placeholder: 'Enter your first name',
          inputType: 'text',
        },
        {
          type: 'input',
          name: 'email',
          label: 'Email',
          placeholder: 'Enter your email',
          inputType: 'email',
        },
      ],
    },
  ],
}

function App() {
  return (
    <FormGenerator
      config={config}
      onSubmit={(values) => console.log(values)}
    />
  )
}
```

## Типы полей

### Input Field

Поддерживает различные типы ввода: text, number, email, password, tel, url.

```tsx
{
  type: 'input',
  name: 'age',
  label: 'Age',
  inputType: 'number',
  min: 0,
  max: 120,
  placeholder: 'Enter your age'
}
```

### Select Field

Поддерживает одиночный и множественный выбор с поиском.

```tsx
{
  type: 'select',
  name: 'country',
  label: 'Country',
  options: [
    { label: 'United States', value: 'US' },
    { label: 'Canada', value: 'CA' },
  ],
  multiple: false,
  searchable: true
}
```

### Switch Field

Логический переключатель.

```tsx
{
  type: 'switch',
  name: 'newsletter',
  label: 'Subscribe to Newsletter',
  checkedText: 'Yes',
  uncheckedText: 'No',
  defaultValue: false
}
```

### Date Field

Выбор даты с настраиваемым форматом.

```tsx
{
  type: 'date',
  name: 'birthDate',
  label: 'Birth Date',
  format: 'YYYY-MM-DD',
  showTime: false
}
```

## Условная логика

### Операторы сравнения

- `<`, `>`, `<=`, `>=` - Числовые сравнения
- `===`, `!==` - Строгое равенство/неравенство
- `∅` - Пустое значение (null, undefined, '', [], {})
- `!∅` - Не пустое значение
- `includes` - Содержит подстроку/элемент
- `startsWith` - Начинается с
- `endsWith` - Заканчивается на
- `match` - Соответствует regex

### Условная видимость

Показать группу только если выбран определенный тип пользователя:

```tsx
{
  name: 'Student Information',
  visibleCondition: {
    comparisonType: 'and',
    children: [
      { field: 'userType', condition: '===', value: 'student' }
    ]
  },
  fields: [...]
}
```

Показать поле только если другое поле заполнено:

```tsx
{
  type: 'input',
  name: 'licenseNumber',
  label: 'License Number',
  visibleCondition: {
    comparisonType: 'and',
    children: [
      { field: 'hasLicense', condition: '===', value: true }
    ]
  }
}
```

### Вложенные условия

Логика OR с вложенными AND группами:

```tsx
{
  visibleCondition: {
    comparisonType: 'or',
    children: [
      { field: 'isPremium', condition: '===', value: true },
      {
        comparisonType: 'and',
        children: [
          { field: 'age', condition: '>=', value: 18 },
          { field: 'hasParentalConsent', condition: '===', value: true }
        ]
      }
    ]
  }
}
```

### Условная валидация

Обязательное поле:

```tsx
{
  type: 'input',
  name: 'email',
  label: 'Email *',
  validateCondition: {
    comparisonType: 'and',
    children: [
      {
        field: 'email',
        condition: '!∅',
        message: 'Email is required'
      },
      {
        field: 'email',
        condition: 'includes',
        value: '@',
        message: 'Please enter a valid email'
      }
    ]
  }
}
```

Сравнение с другим полем (префикс `$`):

```tsx
{
  type: 'input',
  name: 'confirmPassword',
  label: 'Confirm Password',
  inputType: 'password',
  validateCondition: {
    comparisonType: 'and',
    children: [
      {
        field: 'confirmPassword',
        condition: '===',
        value: '$password',
        message: 'Passwords must match'
      }
    ]
  }
}
```

Валидация диапазона:

```tsx
{
  name: 'Price Range',
  validateCondition: {
    comparisonType: 'or',
    children: [
      {
        comparisonType: 'and',
        children: [
          { field: 'minPrice', condition: '∅' },
          { field: 'maxPrice', condition: '∅' }
        ]
      },
      {
        field: 'minPrice',
        condition: '<=',
        value: '$maxPrice',
        message: 'Min price must be <= max price'
      }
    ]
  }
}
```

### Disabled состояние

Отключить поле на основе условия:

```tsx
{
  type: 'input',
  name: 'storeName',
  label: 'Store Name',
  disabledCondition: {
    comparisonType: 'and',
    children: [
      { field: 'shippingMethod', condition: '===', value: 'pickup' }
    ]
  }
}
```

## API компонента FormGenerator

```tsx
interface FormGeneratorProps {
  // Конфигурация формы (обязательно)
  config: FormConfig

  // Начальные значения формы
  initialValues?: FormValues

  // Callback при изменении значений
  onChange?: (values: FormValues) => void

  // Callback при отправке формы
  onSubmit?: (values: FormValues) => void

  // Показать кнопку отправки (по умолчанию: true)
  showSubmitButton?: boolean

  // Текст кнопки отправки (по умолчанию: 'Submit')
  submitButtonText?: string

  // Показать кнопку сброса (по умолчанию: false)
  showResetButton?: boolean

  // Текст кнопки сброса (по умолчанию: 'Reset')
  resetButtonText?: string
}
```

### Использование Ref

Доступ к методам формы через ref:

```tsx
import { useRef } from 'react'

const formRef = useRef()

<FormGenerator
  ref={formRef}
  config={config}
  onSubmit={handleSubmit}
/>

// Получить значения
const values = formRef.current.getValues()

// Сбросить форму
formRef.current.reset()

// Программно отправить форму
formRef.current.submit()
```

## Структура FormConfig

```tsx
interface FormConfig {
  groups: GroupField[]
}

interface GroupField {
  name: string                      // Название группы
  showTitle?: boolean               // Показывать название группы (по умолчанию: true)
  showBorder?: boolean              // Показывать рамку группы (по умолчанию: true)
  visibleCondition?: ConditionGroup // Условие видимости группы
  validateCondition?: ConditionGroup // Условие валидации группы
  fields: Field[]                   // Поля в группе
}

interface Field {
  name: string                      // Уникальное имя поля
  label: string                     // Лейбл поля
  type: FieldType                   // Тип поля
  visibleCondition?: ConditionGroup // Условие видимости поля
  validateCondition?: ConditionGroup // Условие валидации поля
  disabledCondition?: ConditionGroup // Условие неактивности поля
  placeholder?: string              // Placeholder
  defaultValue?: any                // Значение по умолчанию
  // + специфичные props для каждого типа поля
}
```

## Storybook

Проект включает Storybook с множеством примеров:

```bash
npm run storybook
```

Примеры:
- **Simple Form**: Базовая форма со всеми типами полей
- **Conditional Visibility**: Условная видимость полей и групп
- **Conditional Validation**: Условная валидация с ошибками
- **Required Fields**: Обязательные поля со звездочкой

## Разработка

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Запуск Storybook
npm run storybook

# Запуск тестов
npm test

# Проверка типов
npm run type-check

# Линтинг
npm run lint

# Сборка
npm run build
```

## Тестирование

Проект включает unit и component тесты:

```bash
# Запуск всех тестов
npm test

# Запуск тестов с UI
npm run test:ui

# Проверка coverage
npm run test:coverage
```

## Добавление новых типов полей

1. Создайте компонент поля в `src/fields/`:

```tsx
// src/fields/CustomField.tsx
export const CustomField: React.FC<CustomFieldProps> = ({ config, control, error, disabled }) => {
  // Ваша реализация
}
```

2. Добавьте тип в `src/types/field.types.ts`:

```tsx
export type FieldType = 'input' | 'select' | 'switch' | 'date' | 'custom'

export interface CustomField extends BaseField, CustomFieldProps {
  type: 'custom'
}

export type Field = InputField | SelectField | SwitchField | DateField | CustomField
```

3. Добавьте рендеринг в `FieldRenderer.tsx`:

```tsx
case 'custom':
  return <CustomField config={field} control={control} error={error} disabled={disabled} />
```

## Лицензия

MIT

## Автор

Created with ❤️ using Claude Code
