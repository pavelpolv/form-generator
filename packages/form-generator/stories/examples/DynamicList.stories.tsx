import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { FormGenerator } from '@/components/FormGenerator'
import { FormConfig } from '@/types'

const meta: Meta<typeof FormGenerator> = {
  title: 'Examples/Dynamic List',
  component: FormGenerator,
  parameters: {
    layout: 'padded',
  },
  args: {
    onSubmit: fn(),
    onChange: fn(),
  },
}

export default meta
type Story = StoryObj<typeof FormGenerator>

const basicListConfig: FormConfig = {
  groups: [
    {
      name: 'Бронирование рейса',
      fields: [
        {
          type: 'input',
          name: 'flightNumber',
          label: 'Номер рейса',
          placeholder: 'напр. SU 1234',
        },
        {
          type: 'dynamicList',
          name: 'passengers',
          label: 'Пассажиры',
          addButton: { label: 'Добавить пассажира' },
          itemFields: [
            {
              type: 'input',
              name: 'name',
              label: 'Имя',
              placeholder: 'Полное имя',
            },
            {
              type: 'inputNumber',
              name: 'age',
              label: 'Возраст',
              placeholder: 'Возраст',
              min: 0,
              max: 120,
            },
            {
              type: 'select',
              name: 'class',
              label: 'Класс',
              defaultValue: 'economy',
              options: [
                { label: 'Эконом', value: 'economy' },
                { label: 'Бизнес', value: 'business' },
                { label: 'Первый класс', value: 'first' },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export const BasicList: Story = {
  args: {
    config: {
      ...basicListConfig,
      buttons: [
        { key: 'submit', label: 'Отправить', type: 'primary', action: 'submit', requiresValidation: true, url: 'http://localhost:9999' },
        { key: 'reset', label: 'Сбросить', action: 'reset' },
      ],
    },
    initialValues: {},
  },
}

const validationConfig: FormConfig = {
  groups: [
    {
      name: 'Список контактов',
      fields: [
        {
          type: 'dynamicList',
          name: 'contacts',
          label: 'Контакты',
          addButton: { label: 'Добавить контакт' },
          itemFields: [
            {
              type: 'input',
              name: 'name',
              label: 'Имя',
              placeholder: 'Полное имя',
              validateCondition: {
                comparisonType: 'and',
                children: [
                  { field: 'name', condition: '!∅', message: 'Имя обязательно' },
                ],
              },
            },
            {
              type: 'input',
              name: 'email',
              label: 'Электронная почта',
              placeholder: 'Адрес электронной почты',
              inputType: 'email',
              validateCondition: {
                comparisonType: 'and',
                children: [
                  { field: 'email', condition: '!∅', message: 'Электронная почта обязательна' },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
}

export const WithValidation: Story = {
  args: {
    config: {
      ...validationConfig,
      buttons: [
        { key: 'submit', label: 'Отправить', type: 'primary', action: 'submit', requiresValidation: true, url: 'http://localhost:9999' },
        { key: 'reset', label: 'Сбросить', action: 'reset' },
      ],
    },
    initialValues: {},
  },
}

/**
 * Список обязателен (хотя бы один элемент) и все поля в каждом элементе обязательны.
 * При попытке сабмита с пустым списком — ошибка на уровне списка.
 * При попытке сабмита с незаполненными полями — ошибки на уровне полей.
 */
const requiredListConfig: FormConfig = {
  groups: [
    {
      name: 'Список получателей',
      fields: [
        {
          type: 'dynamicList',
          name: 'recipients',
          label: 'Получатели',
          addButton: { label: 'Добавить получателя' },
          validateCondition: {
            comparisonType: 'and',
            children: [
              { field: 'recipients', condition: '!∅', message: 'Добавьте хотя бы одного получателя' },
            ],
          },
          itemFields: [
            {
              type: 'input',
              name: 'name',
              label: 'Имя',
              placeholder: 'Полное имя',
              validateCondition: {
                comparisonType: 'and',
                children: [
                  { field: 'name', condition: '!∅', message: 'Имя обязательно' },
                ],
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
                children: [
                  { field: 'email', condition: '!∅', message: 'Email обязателен' },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
}

export const RequiredList: Story = {
  args: {
    config: {
      ...requiredListConfig,
      buttons: [
        { key: 'submit', label: 'Отправить', type: 'primary', action: 'submit', requiresValidation: true, url: 'http://localhost:9999' },
        { key: 'reset', label: 'Сбросить', action: 'reset' },
      ],
    },
    initialValues: {},
    debug: true,
  },
}
