import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { FormGenerator } from '@/components/FormGenerator'
import { FormConfig } from '@/types'

const meta: Meta<typeof FormGenerator> = {
  title: 'Examples/Conditional Visibility',
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

const conditionalVisibilityConfig: FormConfig = {
  groups: [
    {
      name: 'Тип пользователя',
      fields: [
        {
          type: 'select',
          name: 'userType',
          label: 'Я являюсь',
          placeholder: 'Выберите тип пользователя',
          options: [
            { label: 'Студент', value: 'student' },
            { label: 'Специалист', value: 'professional' },
            { label: 'Пенсионер', value: 'retired' },
          ],
        },
      ],
    },
    {
      name: 'Информация о студенте',
      visibleCondition: {
        comparisonType: 'and',
        children: [
          { field: 'userType', condition: '===', value: 'student' },
        ],
      },
      fields: [
        {
          type: 'input',
          name: 'university',
          label: 'Университет',
          placeholder: 'Введите название университета',
          inputType: 'text',
        },
        {
          type: 'input',
          name: 'studentId',
          label: 'Студенческий билет',
          placeholder: 'Введите номер студенческого билета',
          inputType: 'text',
        },
        {
          type: 'inputNumber',
          name: 'expectedGraduation',
          label: 'Ожидаемый год окончания',
          placeholder: 'напр. 2025',
          min: 2024,
          max: 2030,
        },
        {
          type: 'textarea',
          name: 'researchInterests',
          label: 'Научные интересы',
          placeholder: 'Опишите ваши научные интересы...',
          rows: 3,
          autoSize: { minRows: 2, maxRows: 6 },
        },
      ],
    },
    {
      name: 'Профессиональная информация',
      visibleCondition: {
        comparisonType: 'and',
        children: [
          { field: 'userType', condition: '===', value: 'professional' },
        ],
      },
      fields: [
        {
          type: 'input',
          name: 'company',
          label: 'Компания',
          placeholder: 'Введите название компании',
          inputType: 'text',
        },
        {
          type: 'input',
          name: 'position',
          label: 'Должность',
          placeholder: 'Введите вашу должность',
          inputType: 'text',
        },
        {
          type: 'inputNumber',
          name: 'yearsExperience',
          label: 'Лет опыта',
          min: 0,
          max: 50,
        },
        {
          type: 'textarea',
          name: 'jobDescription',
          label: 'Описание работы',
          placeholder: 'Опишите вашу роль и обязанности...',
          rows: 3,
        },
      ],
    },
    {
      name: 'Дополнительные сведения',
      fields: [
        {
          type: 'switch',
          name: 'hasLicense',
          label: 'Есть ли у вас водительские права?',
          checkedText: 'Да',
          uncheckedText: 'Нет',
          defaultValue: false,
        },
        {
          type: 'input',
          name: 'licenseNumber',
          label: 'Номер водительского удостоверения',
          placeholder: 'Введите номер водительского удостоверения',
          inputType: 'text',
          visibleCondition: {
            comparisonType: 'and',
            children: [
              { field: 'hasLicense', condition: '===', value: true },
            ],
          },
        },
      ],
    },
  ],
}

export const ConditionalGroups: Story = {
  args: {
    config: {
      ...conditionalVisibilityConfig,
      buttons: [
        { key: 'submit', label: 'Отправить', type: 'primary', action: 'submit', requiresValidation: true, url: 'https://httpbin.org/post' },
        { key: 'reset', label: 'Сбросить', action: 'reset' },
      ],
    },
    // Начальные значения заданы для СКРЫТЫХ полей и групп.
    // Цель: проверить, применяются ли они, когда поле/группа не видны.
    initialValues: {
      // Группа "Информация о студенте" скрыта (userType не выбран)
      university: 'MIT',
      studentId: 'S-98765',
      expectedGraduation: 2027,
      researchInterests: 'Machine learning & NLP',
      // Группа "Профессиональная информация" скрыта
      company: 'Acme Corp',
      position: 'Senior Engineer',
      yearsExperience: 8,
      jobDescription: 'Building scalable systems',
      // Поле "Номер водительского удостоверения" скрыто (hasLicense = false по умолчанию)
      licenseNumber: 'AB 1234 CD',
    },
  },
}

const nestedConditionsConfig: FormConfig = {
  groups: [
    {
      name: 'Настройки аккаунта',
      fields: [
        {
          type: 'switch',
          name: 'isPremium',
          label: 'Премиум-аккаунт',
          checkedText: 'Да',
          uncheckedText: 'Нет',
          defaultValue: false,
        },
        {
          type: 'inputNumber',
          name: 'age',
          label: 'Возраст',
          min: 0,
          max: 120,
        },
        {
          type: 'switch',
          name: 'hasParentalConsent',
          label: 'Есть согласие родителей',
          checkedText: 'Да',
          uncheckedText: 'Нет',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'Премиум-функции',
      visibleCondition: {
        comparisonType: 'or',
        children: [
          { field: 'isPremium', condition: '===', value: true },
          {
            comparisonType: 'and',
            children: [
              { field: 'age', condition: '>=', value: 18 },
              { field: 'hasParentalConsent', condition: '===', value: true },
            ],
          },
        ],
      },
      fields: [
        {
          type: 'input',
          name: 'referralCode',
          label: 'Реферальный код',
          placeholder: 'Введите реферальный код',
          inputType: 'text',
        },
        {
          type: 'select',
          name: 'plan',
          label: 'Премиум-план',
          options: [
            { label: 'Базовый — 9.99$/мес.', value: 'basic' },
            { label: 'Про — 19.99$/мес.', value: 'pro' },
            { label: 'Корпоративный — 49.99$/мес.', value: 'enterprise' },
          ],
        },
      ],
    },
  ],
}

export const NestedConditions: Story = {
  args: {
    config: {
      ...nestedConditionsConfig,
      buttons: [
        { key: 'submit', label: 'Отправить', type: 'primary', action: 'submit', requiresValidation: true, url: 'https://httpbin.org/post' },
        { key: 'reset', label: 'Сбросить', action: 'reset' },
      ],
    },
  },
}
