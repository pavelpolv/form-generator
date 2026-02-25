import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { FormGenerator } from '@/components/FormGenerator'
import { FormConfig } from '@/types'

const meta: Meta<typeof FormGenerator> = {
  title: 'Examples/Simple Form',
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

const simpleFormConfig: FormConfig = {
  groups: [
    {
      name: 'Личная информация',
      fields: [
        {
          type: 'input',
          name: 'firstName',
          label: 'Имя',
          placeholder: 'Введите ваше имя',
          inputType: 'text',
        },
        {
          type: 'input',
          name: 'lastName',
          label: 'Фамилия',
          placeholder: 'Введите вашу фамилию',
          inputType: 'text',
        },
        {
          type: 'input',
          name: 'email',
          label: 'Электронная почта',
          placeholder: 'Введите вашу электронную почту',
          inputType: 'text',
        },
        {
          type: 'inputNumber',
          name: 'age',
          label: 'Возраст',
          placeholder: 'Введите ваш возраст',
          min: 0,
          max: 120,
        },
        {
          type: 'textarea',
          name: 'about',
          label: 'О себе',
          placeholder: 'Расскажите что-нибудь о себе...',
          rows: 4,
          maxLength: 500,
        },
      ],
    },
    {
      name: 'Предпочтения',
      fields: [
        {
          type: 'select',
          name: 'country',
          label: 'Страна',
          placeholder: 'Выберите вашу страну',
          options: [
            { label: 'США', value: 'US' },
            { label: 'Великобритания', value: 'UK' },
            { label: 'Канада', value: 'CA' },
            { label: 'Австралия', value: 'AU' },
            { label: 'Германия', value: 'DE' },
          ],
          searchable: true,
        },
        {
          type: 'switch',
          name: 'newsletter',
          label: 'Подписаться на рассылку',
          checkedText: 'Да',
          uncheckedText: 'Нет',
          defaultValue: false,
        },
        {
          type: 'date',
          name: 'birthDate',
          label: 'Дата рождения',
          placeholder: 'Выберите дату рождения',
          format: 'YYYY-MM-DD',
        },
      ],
    },
  ],
}

export const BasicForm: Story = {
  args: {
    config: {
      ...simpleFormConfig,
      buttons: [
        { key: 'submit', label: 'Отправить', type: 'primary', action: 'submit', requiresValidation: true, url: 'https://httpbin.org/post' },
        { key: 'reset', label: 'Сбросить', action: 'reset' },
      ],
    },
    initialValues: {},
  },
}

const noTitleNoBorderConfig: FormConfig = {
  groups: [
    {
      name: 'Hidden Group',
      showTitle: false,
      showBorder: false,
      fields: [
        {
          type: 'input',
          name: 'firstName',
          label: 'Имя',
          placeholder: 'Введите ваше имя',
          inputType: 'text',
        },
        {
          type: 'input',
          name: 'lastName',
          label: 'Фамилия',
          placeholder: 'Введите вашу фамилию',
          inputType: 'text',
        },
        {
          type: 'input',
          name: 'email',
          label: 'Электронная почта',
          placeholder: 'Введите вашу электронную почту',
          inputType: 'text',
        },
      ],
    },
  ],
}

export const NoTitleNoBorder: Story = {
  args: {
    config: {
      ...noTitleNoBorderConfig,
      buttons: [
        { key: 'submit', label: 'Отправить', type: 'primary', action: 'submit', requiresValidation: true, url: 'https://httpbin.org/post' },
      ],
    },
    initialValues: {},
  },
}

export const WithInitialValues: Story = {
  args: {
    config: {
      ...simpleFormConfig,
      buttons: [
        { key: 'submit', label: 'Отправить', type: 'primary', action: 'submit', requiresValidation: true, url: 'https://httpbin.org/post' },
        { key: 'reset', label: 'Сбросить', action: 'reset' },
      ],
    },
    initialValues: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      age: 30,
      country: 'US',
      newsletter: true,
    },
  },
}

// Конфиг с defaultValue у нескольких полей
const defaultValueConfig: FormConfig = {
  groups: [
    {
      name: 'Личная информация',
      fields: [
        {
          type: 'input',
          name: 'firstName',
          label: 'Имя',
          placeholder: 'Введите ваше имя',
          defaultValue: 'Иван',
        },
        {
          type: 'input',
          name: 'lastName',
          label: 'Фамилия',
          placeholder: 'Введите вашу фамилию',
          defaultValue: 'Иванов',
        },
        {
          type: 'input',
          name: 'email',
          label: 'Электронная почта',
          placeholder: 'Введите вашу электронную почту',
        },
        {
          type: 'inputNumber',
          name: 'age',
          label: 'Возраст',
          placeholder: 'Введите ваш возраст',
          min: 0,
          max: 120,
          defaultValue: 25,
        },
      ],
    },
    {
      name: 'Предпочтения',
      fields: [
        {
          type: 'select',
          name: 'country',
          label: 'Страна',
          placeholder: 'Выберите вашу страну',
          defaultValue: 'DE',
          options: [
            { label: 'США', value: 'US' },
            { label: 'Великобритания', value: 'UK' },
            { label: 'Канада', value: 'CA' },
            { label: 'Австралия', value: 'AU' },
            { label: 'Германия', value: 'DE' },
          ],
        },
        {
          type: 'switch',
          name: 'newsletter',
          label: 'Подписаться на рассылку',
          checkedText: 'Да',
          uncheckedText: 'Нет',
          defaultValue: true,
        },
      ],
    },
  ],
}

// Поля имеют defaultValue из конфига, initialValues не передаётся
export const WithDefaultValues: Story = {
  args: {
    config: {
      ...defaultValueConfig,
      buttons: [
        { key: 'submit', label: 'Отправить', type: 'primary', action: 'submit', requiresValidation: false, url: 'https://httpbin.org/post' },
        { key: 'reset', label: 'Сбросить', action: 'reset' },
      ],
    },
  },
}

// initialValues переопределяет defaultValue из конфига для совпадающих полей
export const DefaultValuesOverriddenByInitialValues: Story = {
  args: {
    config: {
      ...defaultValueConfig,
      buttons: [
        { key: 'submit', label: 'Отправить', type: 'primary', action: 'submit', requiresValidation: false, url: 'https://httpbin.org/post' },
        { key: 'reset', label: 'Сбросить', action: 'reset' },
      ],
    },
    // firstName и country переопределены, остальные берутся из defaultValue
    initialValues: {
      firstName: 'Пётр',
      country: 'US',
    },
  },
}
