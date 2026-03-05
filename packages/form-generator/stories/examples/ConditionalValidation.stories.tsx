import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { FormGenerator } from '@/components/FormGenerator'
import { FormConfig } from '@/types'

const meta: Meta<typeof FormGenerator> = {
  title: 'Examples/Conditional Validation',
  component: FormGenerator,
  parameters: {
    layout: 'padded',
  },
  args: {
    onSubmit: fn(),
  },
}

export default meta
type Story = StoryObj<typeof FormGenerator>

const validationConfig: FormConfig = {
  groups: [
    {
      name: 'Форма регистрации',
      fields: [
        {
          type: 'input',
          name: 'username',
          label: 'Имя пользователя',
          placeholder: 'Введите имя пользователя',
          inputType: 'text',
          validateCondition: {
            comparisonType: 'and',
            children: [
              {
                field: 'username',
                condition: '!∅',
                message: 'Имя пользователя обязательно',
              },
            ],
          },
        },
        {
          type: 'input',
          name: 'email',
          label: 'Электронная почта',
          placeholder: 'Введите электронную почту',
          inputType: 'text',
          validateCondition: {
            comparisonType: 'and',
            children: [
              {
                field: 'email',
                condition: '!∅',
                message: 'Электронная почта обязательна',
              },
              {
                field: 'email',
                condition: 'includes',
                value: '@',
                message: 'Электронная почта должна содержать @',
              },
            ],
          },
        },
        {
          type: 'input',
          name: 'password',
          label: 'Пароль',
          placeholder: 'Введите пароль',
          inputType: 'password',
          validateCondition: {
            comparisonType: 'and',
            children: [
              {
                field: 'password',
                condition: '!∅',
                message: 'Пароль обязателен',
              },
            ],
          },
        },
        {
          type: 'input',
          name: 'confirmPassword',
          label: 'Подтверждение пароля',
          placeholder: 'Подтвердите ваш пароль',
          inputType: 'password',
          validateCondition: {
            comparisonType: 'and',
            children: [
              {
                field: 'confirmPassword',
                condition: '!∅',
                message: 'Пожалуйста, подтвердите пароль',
              },
              {
                field: 'confirmPassword',
                condition: '===',
                value: '$password',
                message: 'Пароли должны совпадать',
              },
            ],
          },
        },
      ],
    },
    {
      name: 'Подтверждение возраста',
      fields: [
        {
          type: 'inputNumber',
          name: 'age',
          label: 'Возраст',
          min: 0,
          max: 120,
          validateCondition: {
            comparisonType: 'and',
            children: [
              {
                field: 'age',
                condition: '!∅',
                message: 'Возраст обязателен',
              },
              {
                field: 'age',
                condition: '>=',
                value: 18,
                message: 'Вам должно быть 18 лет или старше',
              },
            ],
          },
        },
      ],
    },
  ],
}

export const RequiredFields: Story = {
  args: {
    config: {
      ...validationConfig,
      buttons: [
        {
          key: 'submit', label: 'Отправить', type: 'primary', action: 'submit',
          requiresValidation: true, url: 'http://localhost:9999',
          successNotification: { message: 'Успешно', description: 'Данные успешно отправлены' },
          errorNotification: { message: 'Ошибка', description: 'Не удалось отправить данные' },
        },
        { key: 'reset', label: 'Сбросить', action: 'reset' },
      ],
    },
  },
}

const complexValidationConfig: FormConfig = {
  groups: [
    {
      name: 'Фильтр по диапазону цен',
      validateCondition: {
        comparisonType: 'or',
        children: [
          {
            comparisonType: 'and',
            children: [
              { field: 'minPrice', condition: '∅' },
              { field: 'maxPrice', condition: '∅' },
            ],
          },
          {
            field: 'minPrice',
            condition: '<=',
            value: '$maxPrice',
            message: 'Минимальная цена должна быть меньше или равна максимальной',
          },
        ],
      },
      fields: [
        {
          type: 'inputNumber',
          name: 'minPrice',
          label: 'Минимальная цена',
          placeholder: 'Введите минимальную цену',
          min: 0,
        },
        {
          type: 'inputNumber',
          name: 'maxPrice',
          label: 'Максимальная цена',
          placeholder: 'Введите максимальную цену',
          min: 0,
        },
        {
          type: 'textarea',
          name: 'priceComment',
          label: 'Комментарий (не участвует в валидации)',
          placeholder: 'Это поле не влияет на валидацию',
          rows: 2,
        },
      ],
    },
    {
      name: 'Фильтр по диапазону дат',
      validateCondition: {
        comparisonType: 'or',
        children: [
          {
            comparisonType: 'and',
            children: [
              { field: 'startDate', condition: '∅' },
              { field: 'endDate', condition: '∅' },
            ],
          },
          {
            field: 'startDate',
            condition: '<=',
            value: '$endDate',
            message: 'Дата начала должна быть раньше или равна дате окончания',
          },
        ],
      },
      fields: [
        {
          type: 'date',
          name: 'startDate',
          label: 'Дата начала',
          placeholder: 'Выберите дату начала',
        },
        {
          type: 'date',
          name: 'endDate',
          label: 'Дата окончания',
          placeholder: 'Выберите дату окончания',
        },
        {
          type: 'textarea',
          name: 'dateComment',
          label: 'Комментарий (не участвует в валидации)',
          placeholder: 'Это поле не влияет на валидацию',
          rows: 2,
        },
      ],
    },
  ],
}

export const ComplexValidation: Story = {
  args: {
    config: {
      ...complexValidationConfig,
      buttons: [
        { key: 'submit', label: 'Отправить', type: 'primary', action: 'submit', requiresValidation: true, url: 'http://localhost:9999' },
        { key: 'reset', label: 'Сбросить', action: 'reset' },
      ],
    },
  },
}

const switchRequiredConfig: FormConfig = {
  groups: [
    {
      name: 'Условное обязательное поле',
      fields: [
        {
          type: 'switch',
          name: 'enableFeature',
          label: 'Включить функцию',
          checkedText: 'Да',
          uncheckedText: 'Нет',
          defaultValue: false,
        },
        {
          type: 'input',
          name: 'featureCode',
          label: 'Код функции',
          placeholder: 'Введите код функции',
          inputType: 'text',
          validateCondition: {
            comparisonType: 'or',
            children: [
              { field: 'enableFeature', condition: '===', value: false },
              {
                field: 'featureCode',
                condition: '!∅',
                message: 'Код функции обязателен, когда функция включена',
              },
            ],
          },
        },
      ],
    },
  ],
}

export const SwitchRequiredField: Story = {
  args: {
    config: {
      ...switchRequiredConfig,
      buttons: [
        { key: 'submit', label: 'Отправить', type: 'primary', action: 'submit', requiresValidation: true, url: 'http://localhost:9999' },
        { key: 'reset', label: 'Сбросить', action: 'reset' },
      ],
    },
  },
}

/**
 * Поле 3 (comment) становится обязательным только тогда,
 * когда Поле 1 (category) === 'В' И Поле 2 (enabled) === true.
 *
 * Логика validateCondition через 'or':
 *   валидно, если (category !== 'В') ИЛИ (enabled === false) ИЛИ (comment заполнен)
 *   → ошибка только когда category === 'В' И enabled === true И comment пустой
 */
const selectSwitchRequiredConfig: FormConfig = {
  groups: [
    {
      name: 'Условная обязательность поля',
      fields: [
        {
          type: 'select',
          name: 'category',
          label: 'Поле 1 - Категория',
          placeholder: 'Выберите категорию',
          options: [
            { label: 'А', value: 'А' },
            { label: 'Б', value: 'Б' },
            { label: 'В', value: 'В' },
          ],
        },
        {
          type: 'switch',
          name: 'enabled',
          label: 'Поле 2 - Включить',
          checkedText: 'Да',
          uncheckedText: 'Нет',
          defaultValue: false,
        },
        {
          type: 'input',
          name: 'comment',
          label: 'Поле 3 - Комментарий',
          placeholder: 'Обязательно при Категория=В и Включить=Да',
          inputType: 'text',
          validateCondition: {
            comparisonType: 'or',
            children: [
              // Условие не активно - field1 не равен 'В'
              { field: 'category', condition: '!==', value: 'В' },
              // Условие не активно - свитч выключен
              { field: 'enabled', condition: '===', value: false },
              // Условие активно - поле должно быть заполнено
              {
                field: 'comment',
                condition: '!∅',
                message: 'Комментарий обязателен, когда выбрана категория В и свитч включён',
              },
            ],
          },
        },
      ],
    },
  ],
}

export const SelectSwitchConditionalRequired: Story = {
  args: {
    config: {
      ...selectSwitchRequiredConfig,
      buttons: [
        { key: 'submit', label: 'Отправить', type: 'primary', action: 'submit', requiresValidation: true, url: 'http://localhost:9999' },
        { key: 'reset', label: 'Сбросить', action: 'reset' },
      ],
    },
  },
}

/**
 * Поле "Сдвиг даты" (chargeShift) обязательно только когда passToTranche = true.
 *
 * validateCondition через or:
 *   валидно если passToTranche === false (передаём в транш, сдвиг не нужен)
 *   ИЛИ chargeShift заполнен
 *   → звёздочка появляется только когда passToTranche === true
 */
const passToTrancheConfig: FormConfig = {
  groups: [
    {
      name: 'Настройки транша',
      fields: [
        {
          type: 'switch',
          name: 'passToTranche',
          label: 'Передать в транш',
          checkedText: 'Да',
          uncheckedText: 'Нет',
          defaultValue: true,
        },
        {
          type: 'select',
          name: 'chargeShift',
          label: 'Сдвиг даты',
          placeholder: 'Выберите сдвиг даты',
          options: [
            { label: '1 день', value: '1d' },
            { label: '1 неделя', value: '1w' },
            { label: '1 месяц', value: '1m' },
          ],
          validateCondition: {
            comparisonType: 'or',
            children: [
              { field: 'passToTranche', condition: '===', value: false },
              {
                comparisonType: 'and',
                children: [
                  { field: 'chargeShift', condition: '!∅', message: 'Поле "Сдвиг даты" не должно быть пустым' },
                  { field: 'chargeShift', condition: '!==', value: '1w', message: 'Сдвиг "1 неделя" недоступен при передаче в транш' },
                ],
              },
            ],
          },
        },
      ],
    },
  ],
}

export const PassToTrancheChargeShift: Story = {
  args: {
    config: {
      ...passToTrancheConfig,
      buttons: [
        { key: 'submit', label: 'Отправить', type: 'primary', action: 'submit', requiresValidation: true, url: 'http://localhost:9999' },
        { key: 'reset', label: 'Сбросить', action: 'reset' },
      ],
    },
    debug: true,
  },
}
