# Установка библиотеки

## Локальная установка (для разработки)

### 1. Сборка библиотеки

```bash
npm run build
```

Это создаст папку `dist/` с собранной библиотекой.

### 2. Установка в другой проект

#### Вариант А: npm link (рекомендуется для разработки)

В папке с библиотекой:
```bash
npm link
```

В вашем проекте:
```bash
npm link form-generator
```

#### Вариант Б: Прямая установка из файловой системы

В вашем проекте:
```bash
npm install /path/to/form-generator
```

Или добавьте в `package.json`:
```json
{
  "dependencies": {
    "form-generator": "file:../form-generator"
  }
}
```

## Публикация в npm registry

### 1. Настройка package.json

Обновите следующие поля перед публикацией:
```json
{
  "name": "@your-scope/form-generator",
  "version": "0.1.0",
  "author": "Your Name",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/form-generator"
  }
}
```

### 2. Публикация

```bash
# Логин в npm (если еще не залогинены)
npm login

# Публикация
npm publish --access public
```

### 3. Установка из npm

```bash
npm install @your-scope/form-generator
```

## Зависимости

Убедитесь, что в вашем проекте установлены peer dependencies:

```bash
npm install antd@^4.24.15 moment@^2.30.1 react@^17.0.2 react-dom@^17.0.2 react-hook-form@^7.43.0
```

## Использование

```tsx
import { FormGenerator } from 'form-generator'
import type { FormConfig } from 'form-generator'
import 'antd/dist/antd.css'

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
          type: 'inputNumber',
          name: 'age',
          label: 'Age',
          placeholder: 'Enter your age',
          min: 0,
          max: 120,
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
