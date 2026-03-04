import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { FormGenerator } from '@/components/FormGenerator'
import { FormConfig } from '@/types'

const meta: Meta<typeof FormGenerator> = {
  title: 'Examples/Required Fields',
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

const requiredFieldsConfig: FormConfig = {
  groups: [
    {
      name: 'Контактная форма',
      fields: [
        {
          type: 'input',
          name: 'fullName',
          label: 'Полное имя',
          placeholder: 'Введите ваше полное имя',
          inputType: 'text',
          validateCondition: {
            comparisonType: 'and',
            children: [
              {
                field: 'fullName',
                condition: '!∅',
                message: 'Полное имя обязательно',
              },
            ],
          },
        },
        {
          type: 'input',
          name: 'email',
          label: 'Адрес электронной почты',
          placeholder: 'your.email@example.com',
          inputType: 'email',
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
                message: 'Пожалуйста, введите корректный адрес электронной почты',
              },
              {
                field: 'email',
                condition: 'includes',
                value: '.',
                message: 'Пожалуйста, введите корректный адрес электронной почты',
              },
            ],
          },
        },
        {
          type: 'input',
          name: 'phone',
          label: 'Номер телефона',
          placeholder: '+7 (999) 123-45-67',
          inputType: 'tel',
        },
        {
          type: 'select',
          name: 'subject',
          label: 'Тема',
          placeholder: 'Выберите тему',
          options: [
            { label: 'Общий вопрос', value: 'general' },
            { label: 'Техническая поддержка', value: 'support' },
            { label: 'Продажи', value: 'sales' },
            { label: 'Отзыв', value: 'feedback' },
          ],
          validateCondition: {
            comparisonType: 'and',
            children: [
              {
                field: 'subject',
                condition: '!∅',
                message: 'Пожалуйста, выберите тему',
              },
            ],
          },
        },
        {
          type: 'textarea',
          name: 'message',
          label: 'Сообщение',
          placeholder: 'Ваше сообщение здесь...',
          rows: 4,
          maxLength: 1000,
        },
        {
          type: 'switch',
          name: 'agreeToTerms',
          label: 'Я принимаю условия пользовательского соглашения',
          checkedText: 'Да',
          uncheckedText: 'Нет',
          defaultValue: false,
          validateCondition: {
            comparisonType: 'and',
            children: [
              {
                field: 'agreeToTerms',
                condition: '===',
                value: true,
                message: 'Вы должны принять условия пользовательского соглашения',
              },
            ],
          },
        },
      ],
    },
  ],
}

export const BasicRequiredFields: Story = {
  args: {
    config: {
      ...requiredFieldsConfig,
      buttons: [
        { key: 'submit', label: 'Отправить форму', type: 'primary', action: 'submit', requiresValidation: true, url: 'http://localhost:9999' },
        { key: 'reset', label: 'Очистить форму', action: 'reset' },
      ],
    },
  },
}

const conditionalRequiredConfig: FormConfig = {
  groups: [
    {
      name: 'Информация о доставке',
      fields: [
        {
          type: 'select',
          name: 'shippingMethod',
          label: 'Способ доставки',
          placeholder: 'Выберите способ доставки',
          options: [
            { label: 'Стандартная доставка', value: 'standard' },
            { label: 'Экспресс-доставка', value: 'express' },
            { label: 'Самовывоз из магазина', value: 'pickup' },
          ],
          validateCondition: {
            comparisonType: 'and',
            children: [
              {
                field: 'shippingMethod',
                condition: '!∅',
                message: 'Пожалуйста, выберите способ доставки',
              },
            ],
          },
        },
        {
          type: 'input',
          name: 'address',
          label: 'Адрес доставки',
          placeholder: 'Введите ваш адрес',
          inputType: 'text',
          visibleCondition: {
            comparisonType: 'or',
            children: [
              { field: 'shippingMethod', condition: '===', value: 'standard' },
              { field: 'shippingMethod', condition: '===', value: 'express' },
            ],
          },
          validateCondition: {
            comparisonType: 'or',
            children: [
              { field: 'shippingMethod', condition: '===', value: 'pickup' },
              {
                comparisonType: 'and',
                children: [
                  {
                    field: 'address',
                    condition: '!∅',
                    message: 'Адрес обязателен для доставки',
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'input',
          name: 'city',
          label: 'Город',
          placeholder: 'Введите ваш город',
          inputType: 'text',
          visibleCondition: {
            comparisonType: 'or',
            children: [
              { field: 'shippingMethod', condition: '===', value: 'standard' },
              { field: 'shippingMethod', condition: '===', value: 'express' },
            ],
          },
          validateCondition: {
            comparisonType: 'or',
            children: [
              { field: 'shippingMethod', condition: '===', value: 'pickup' },
              {
                comparisonType: 'and',
                children: [
                  {
                    field: 'city',
                    condition: '!∅',
                    message: 'Город обязателен для доставки',
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'input',
          name: 'zipCode',
          label: 'Почтовый индекс',
          placeholder: 'Введите почтовый индекс',
          inputType: 'text',
          visibleCondition: {
            comparisonType: 'or',
            children: [
              { field: 'shippingMethod', condition: '===', value: 'standard' },
              { field: 'shippingMethod', condition: '===', value: 'express' },
            ],
          },
          validateCondition: {
            comparisonType: 'or',
            children: [
              { field: 'shippingMethod', condition: '===', value: 'pickup' },
              {
                comparisonType: 'and',
                children: [
                  {
                    field: 'zipCode',
                    condition: '!∅',
                    message: 'Почтовый индекс обязателен для доставки',
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'input',
          name: 'storeName',
          label: 'Название магазина',
          placeholder: 'Здесь появится название магазина',
          inputType: 'text',
          visibleCondition: {
            comparisonType: 'and',
            children: [
              { field: 'shippingMethod', condition: '===', value: 'pickup' },
            ],
          },
          disabledCondition: {
            comparisonType: 'and',
            children: [
              { field: 'shippingMethod', condition: '===', value: 'pickup' },
            ],
          },
          defaultValue: 'Магазин на Главной улице — ул. Главная, 123',
        },
      ],
    },
  ],
}

export const ConditionalRequired: Story = {
  args: {
    config: {
      ...conditionalRequiredConfig,
      buttons: [
        { key: 'submit', label: 'Отправить', type: 'primary', action: 'submit', requiresValidation: true, url: 'http://localhost:9999' },
        { key: 'reset', label: 'Сбросить', action: 'reset' },
      ],
    },
  },
}

// Звёздочка появляется автоматически из validateCondition - вручную в label не нужна
const autoAsteriskConfig: FormConfig = {
  groups: [
    {
      name: 'Регистрация',
      fields: [
        {
          type: 'select',
          name: 'accountType',
          label: 'Тип аккаунта',
          placeholder: 'Выберите тип',
          defaultValue: 'personal',
          options: [
            { label: 'Физическое лицо', value: 'personal' },
            { label: 'Юридическое лицо', value: 'business' },
          ],
          validateCondition: {
            comparisonType: 'and',
            children: [
              { field: 'accountType', condition: '!∅', message: 'Выберите тип аккаунта' },
            ],
          },
        },
        {
          type: 'input',
          name: 'fullName',
          label: 'Полное имя',
          placeholder: 'Иван Иванов',
          validateCondition: {
            comparisonType: 'and',
            children: [
              { field: 'fullName', condition: '!∅', message: 'Имя обязательно' },
            ],
          },
        },
        {
          // Обязательно только для юрлица - звёздочка появляется/исчезает динамически
          type: 'input',
          name: 'inn',
          label: 'ИНН',
          placeholder: '1234567890',
          visibleCondition: {
            comparisonType: 'and',
            children: [
              { field: 'accountType', condition: '===', value: 'business' },
            ],
          },
          validateCondition: {
            comparisonType: 'and',
            children: [
              { field: 'accountType', condition: '===', value: 'business' },
              { field: 'inn', condition: '!∅', message: 'ИНН обязателен для юрлица' },
            ],
          },
        },
        {
          // Обязательно только для юрлица
          type: 'input',
          name: 'companyName',
          label: 'Название компании',
          placeholder: 'ООО "Ромашка"',
          visibleCondition: {
            comparisonType: 'and',
            children: [
              { field: 'accountType', condition: '===', value: 'business' },
            ],
          },
          validateCondition: {
            comparisonType: 'and',
            children: [
              { field: 'accountType', condition: '===', value: 'business' },
              { field: 'companyName', condition: '!∅', message: 'Название компании обязательно' },
            ],
          },
        },
      ],
    },
  ],
}

// Звёздочка у ИНН и Названия компании появляется автоматически при выборе "Юридическое лицо"
export const AutoAsteriskFromCondition: Story = {
  args: {
    config: {
      ...autoAsteriskConfig,
      buttons: [
        { key: 'submit', label: 'Зарегистрироваться', type: 'primary', action: 'submit', requiresValidation: true, url: 'http://localhost:9999' },
        { key: 'reset', label: 'Сбросить', action: 'reset' },
      ],
    },
    initialValues: { accountType: 'personal' },
  },
}
