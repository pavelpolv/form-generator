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
          name: 'lastName',
          label: 'Last Name',
          placeholder: 'Enter your last name',
          inputType: 'text',
        },
        {
          type: 'input',
          name: 'email',
          label: 'Email',
          placeholder: 'Enter your email',
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
    {
      name: 'Preferences',
      fields: [
        {
          type: 'select',
          name: 'country',
          label: 'Country',
          placeholder: 'Select your country',
          options: [
            { label: 'United States', value: 'US' },
            { label: 'United Kingdom', value: 'UK' },
            { label: 'Canada', value: 'CA' },
            { label: 'Australia', value: 'AU' },
            { label: 'Germany', value: 'DE' },
          ],
          searchable: true,
        },
        {
          type: 'switch',
          name: 'newsletter',
          label: 'Subscribe to Newsletter',
          checkedText: 'Yes',
          uncheckedText: 'No',
          defaultValue: false,
        },
        {
          type: 'date',
          name: 'birthDate',
          label: 'Birth Date',
          placeholder: 'Select your birth date',
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
        { key: 'submit', label: 'Submit', type: 'primary', action: 'submit', requiresValidation: true, url: 'https://httpbin.org/post' },
        { key: 'reset', label: 'Reset', action: 'reset' },
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
          label: 'First Name',
          placeholder: 'Enter your first name',
          inputType: 'text',
        },
        {
          type: 'input',
          name: 'lastName',
          label: 'Last Name',
          placeholder: 'Enter your last name',
          inputType: 'text',
        },
        {
          type: 'input',
          name: 'email',
          label: 'Email',
          placeholder: 'Enter your email',
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
        { key: 'submit', label: 'Submit', type: 'primary', action: 'submit', requiresValidation: true, url: 'https://httpbin.org/post' },
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
        { key: 'submit', label: 'Submit', type: 'primary', action: 'submit', requiresValidation: true, url: 'https://httpbin.org/post' },
        { key: 'reset', label: 'Reset', action: 'reset' },
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
