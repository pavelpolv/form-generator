# Кнопки формы (config.buttons)

## Обзор

Кнопки задаются через `config.buttons` — массив объектов. Поддерживаются два типа: `submit` и `reset`. Порядок кнопок соответствует порядку в массиве.

Если `config.buttons` не задан — рендерится дефолтная кнопка `Submit`. Если передан пустой массив `[]` — кнопки не рендерятся совсем (удобно при использовании внешних кнопок через ref).

```tsx
<FormGenerator
  config={{
    groups: [...],
    buttons: [
      { key: 'submit', label: 'Сохранить', action: 'submit', ... },
      { key: 'reset',  label: 'Сбросить',  action: 'reset' },
    ],
  }}
/>
```

## Кнопка submit

Отправляет данные формы на URL через `fetch`.

```typescript
interface SubmitButtonConfig {
  key: string               // уникальный идентификатор
  label: string             // текст кнопки
  action: 'submit'
  requiresValidation: boolean  // проверять validateCondition перед отправкой
  url: string               // куда отправлять данные
  type?: ButtonType         // визуальный стиль (см. ниже)
  method?: HttpMethod       // HTTP-метод: POST | PUT | PATCH | DELETE (по умолчанию POST)
  resetAfterSubmit?: boolean   // сбросить форму после успешной отправки
  successNotification?: {   // уведомление об успехе
    message: string
    description?: string
  }
  errorNotification?: {     // уведомление об ошибке
    message: string
    description?: string
  }
}
```

### Пример

```typescript
{
  key: 'save',
  label: 'Сохранить',
  type: 'primary',
  action: 'submit',
  requiresValidation: true,
  url: 'https://api.example.com/users',
  method: 'POST',
  resetAfterSubmit: true,
  successNotification: {
    message: 'Данные сохранены',
    description: 'Запись успешно создана',
  },
  errorNotification: {
    message: 'Ошибка сохранения',
    description: 'Попробуйте ещё раз',
  },
}
```

### requiresValidation

Если `true` — перед отправкой проверяются все `validateCondition` полей и групп. При наличии ошибок запрос не отправляется, ошибки показываются принудительно (`forceShowErrors`).

Если `false` — форма отправляется без проверки валидации.

### Поведение при отправке

1. Кнопка переходит в состояние `loading`, остальные кнопки блокируются
2. Данные отправляются как `POST` (или указанный `method`) с заголовком `Content-Type: application/json`
3. При успехе (HTTP 2xx) — показывается `successNotification`, вызывается `onSubmit`, опционально сбрасывается форма
4. При ошибке (HTTP 4xx/5xx или сетевая ошибка) — показывается `errorNotification`

## Кнопка reset

Сбрасывает форму к начальным значениям (`initialValues` + `defaultValue` из конфига).

```typescript
interface ResetButtonConfig {
  key: string       // уникальный идентификатор
  label: string     // текст кнопки
  action: 'reset'
  type?: ButtonType // визуальный стиль
}
```

### Пример

```typescript
{
  key: 'reset',
  label: 'Сбросить',
  action: 'reset',
  type: 'default',
}
```

## Визуальные стили (type)

Соответствуют типам кнопок Ant Design:

| Значение | Вид |
|----------|-----|
| `primary` | Основная (синяя заливка) |
| `default` | Стандартная (рамка) — используется если `type` не задан |
| `dashed` | Пунктирная рамка |
| `link` | Ссылка |
| `text` | Без рамки |

## Несколько кнопок submit

Можно добавить несколько кнопок `submit` — например, "Сохранить черновик" и "Опубликовать", отправляющие данные на разные URL.

```typescript
buttons: [
  {
    key: 'draft',
    label: 'Сохранить черновик',
    action: 'submit',
    requiresValidation: false,
    url: 'https://api.example.com/drafts',
    method: 'POST',
  },
  {
    key: 'publish',
    label: 'Опубликовать',
    type: 'primary',
    action: 'submit',
    requiresValidation: true,
    url: 'https://api.example.com/articles',
    method: 'POST',
  },
  {
    key: 'reset',
    label: 'Сбросить',
    action: 'reset',
  },
]
```

Пока одна кнопка находится в состоянии `loading`, остальные блокируются автоматически.

## Скрытие встроенных кнопок

Чтобы убрать кнопки из формы (например, при использовании внешних кнопок через ref):

```typescript
config={{ ...myConfig, buttons: [] }}
```

Подробнее - в документации [Внешнее управление формой](./external-control.md).

## onSubmit колбэк

Помимо отправки через `fetch`, можно обрабатывать данные локально через проп `onSubmit`. Он вызывается при успешном submit (через дефолтную кнопку или через `formRef.current?.submit()`).

```tsx
<FormGenerator
  config={config}
  onSubmit={(values) => {
    console.log('Данные формы:', values)
  }}
/>
```

> При использовании `config.buttons` с `action: 'submit'` колбэк `onSubmit` вызывается **после** успешного fetch-запроса, не вместо него.
