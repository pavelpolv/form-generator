import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { FormGenerator } from '../../src/components/FormGenerator'
import { FormConfig } from '../../src/types'

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
    config: simpleFormConfig,
    initialValues: {},
    showSubmitButton: true,
    showResetButton: true,
  },
}

export const WithInitialValues: Story = {
  args: {
    config: simpleFormConfig,
    initialValues: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      age: 30,
      country: 'US',
      newsletter: true,
    },
    showSubmitButton: true,
    showResetButton: true,
  },
}
