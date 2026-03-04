# Внешнее управление формой (ref)

## Зачем это нужно

По умолчанию кнопки формы задаются через `config.buttons`. Но иногда нужно управлять формой снаружи - например, кнопки находятся в другом компоненте, в шапке страницы или форма является частью многошагового мастера.

Для этого `FormGenerator` принимает `ref` и предоставляет через него четыре метода.

## Подключение ref

```tsx
import { useRef } from 'react'
import { FormGenerator, FormGeneratorRef } from '@form-generator/core'

const MyPage = () => {
  const formRef = useRef<FormGeneratorRef>(null)

  return (
    <>
      <FormGenerator
        ref={formRef}
        config={config}
        // Передай пустой массив, чтобы скрыть встроенные кнопки
        // config={{ ...config, buttons: [] }}
      />

      <button onClick={() => formRef.current?.submit()}>
        Отправить
      </button>
    </>
  )
}
```

## Методы ref

### `getValues(): FormValues`

Возвращает текущие значения формы. Скрытые поля (с `visibleCondition: false`) в результат **не попадают**.

```tsx
const values = formRef.current?.getValues()
// { name: 'Иван', email: 'ivan@example.com' }
```

### `submit(): void`

Программно отправляет форму - вызывает колбэк `onSubmit` с текущими значениями.

```tsx
formRef.current?.submit()
```

### `reset(values?: FormValues): void`

Сбрасывает форму. Без аргументов - к начальным значениям (`initialValues` + `defaultValue` из конфига). С аргументом - к переданным значениям.

```tsx
// Сброс к начальному состоянию
formRef.current?.reset()

// Сброс к конкретным значениям
formRef.current?.reset({ name: 'Иван', email: '' })
```

### `setValue(name: string, value: unknown): void`

Устанавливает значение отдельного поля без сброса остальных.

```tsx
formRef.current?.setValue('status', 'active')
formRef.current?.setValue('amount', 1000)
```

## Примеры

### Внешние кнопки

Кнопки формы вынесены за пределы `FormGenerator`. Чтобы скрыть встроенные кнопки, передай `buttons: []`.

```tsx
const ExternalButtons = () => {
  const formRef = useRef<FormGeneratorRef>(null)

  return (
    <div>
      <FormGenerator
        ref={formRef}
        config={{ ...config, buttons: [] }}
        onSubmit={(values) => console.log(values)}
      />

      <Space>
        <Button type="primary" onClick={() => formRef.current?.submit()}>
          Сохранить
        </Button>
        <Button onClick={() => formRef.current?.reset()}>
          Отменить
        </Button>
      </Space>
    </div>
  )
}
```

### Чтение значений без отправки

Полезно для предпросмотра, автосохранения или передачи данных в другой компонент.

```tsx
const [preview, setPreview] = useState(null)

<Button onClick={() => setPreview(formRef.current?.getValues())}>
  Предпросмотр
</Button>
```

### Программное заполнение полей

```tsx
// Заполнить из внешнего источника (например, из поиска по базе)
const handleSelectUser = (user) => {
  formRef.current?.setValue('name', user.name)
  formRef.current?.setValue('email', user.email)
}
```

### Многошаговый мастер

Каждый шаг - отдельный `FormGenerator`. Данные собираются через `getValues()` перед переходом к следующему шагу.

```tsx
const [step, setStep] = useState(0)
const [data, setData] = useState({})
const formRef = useRef<FormGeneratorRef>(null)

const handleNext = () => {
  const stepValues = formRef.current?.getValues() ?? {}
  setData({ ...data, ...stepValues })
  setStep(step + 1)
}

<FormGenerator
  key={step}
  ref={formRef}
  config={{ ...steps[step], buttons: [] }}
  initialValues={data}
/>

<Button onClick={handleNext}>Далее</Button>
```

> `key={step}` обязателен - он пересоздаёт компонент при смене шага и применяет `initialValues` с уже собранными данными.

## Скрытые поля и getValues

Поля с `visibleCondition` которое вычислилось в `false` автоматически исключаются из результата `getValues()`. Это работает нативно через механизм `shouldUnregister` react-hook-form.

```tsx
const config = {
  groups: [{
    fields: [
      { type: 'input', name: 'type', ... },
      {
        type: 'input',
        name: 'inn',
        // Поле видно только для юрлица
        visibleCondition: {
          comparisonType: 'and',
          children: [{ field: 'type', condition: '===', value: 'business' }],
        },
      },
    ],
  }],
}

// Если type === 'personal', inn в результат не попадёт
formRef.current?.getValues() // { type: 'personal' }

// Если type === 'business'
formRef.current?.getValues() // { type: 'business', inn: '...' }
```
