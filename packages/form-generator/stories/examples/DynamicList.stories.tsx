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
      name: 'Flight Booking',
      fields: [
        {
          type: 'input',
          name: 'flightNumber',
          label: 'Flight Number',
          placeholder: 'e.g. SU 1234',
        },
        {
          type: 'dynamicList',
          name: 'passengers',
          label: 'Passengers',
          addButton: { label: 'Add passenger' },
          itemFields: [
            {
              type: 'input',
              name: 'name',
              label: 'Name',
              placeholder: 'Full name',
            },
            {
              type: 'inputNumber',
              name: 'age',
              label: 'Age',
              placeholder: 'Age',
              min: 0,
              max: 120,
            },
            {
              type: 'select',
              name: 'class',
              label: 'Class',
              defaultValue: 'economy',
              options: [
                { label: 'Economy', value: 'economy' },
                { label: 'Business', value: 'business' },
                { label: 'First Class', value: 'first' },
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
        { key: 'submit', label: 'Submit', type: 'primary', action: 'submit', requiresValidation: true, url: 'https://httpbin.org/post' },
        { key: 'reset', label: 'Reset', action: 'reset' },
      ],
    },
    initialValues: {},
  },
}

const validationConfig: FormConfig = {
  groups: [
    {
      name: 'Contact List',
      fields: [
        {
          type: 'dynamicList',
          name: 'contacts',
          label: 'Contacts',
          addButton: { label: 'Add contact' },
          itemFields: [
            {
              type: 'input',
              name: 'name',
              label: 'Name',
              placeholder: 'Full name',
              validateCondition: {
                comparisonType: 'and',
                children: [
                  { field: 'name', condition: '!∅', message: 'Name is required' },
                ],
              },
            },
            {
              type: 'input',
              name: 'email',
              label: 'Email',
              placeholder: 'Email address',
              inputType: 'email',
              validateCondition: {
                comparisonType: 'and',
                children: [
                  { field: 'email', condition: '!∅', message: 'Email is required' },
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
        { key: 'submit', label: 'Submit', type: 'primary', action: 'submit', requiresValidation: true, url: 'https://httpbin.org/post' },
        { key: 'reset', label: 'Reset', action: 'reset' },
      ],
    },
    initialValues: {},
  },
}
