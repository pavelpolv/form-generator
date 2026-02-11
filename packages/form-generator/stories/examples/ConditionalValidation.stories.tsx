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
      name: 'Registration Form',
      fields: [
        {
          type: 'input',
          name: 'username',
          label: 'Username',
          placeholder: 'Enter username',
          inputType: 'text',
          validateCondition: {
            comparisonType: 'and',
            children: [
              {
                field: 'username',
                condition: '!∅',
                message: 'Username is required',
              },
            ],
          },
        },
        {
          type: 'input',
          name: 'email',
          label: 'Email',
          placeholder: 'Enter email',
          inputType: 'text',
          validateCondition: {
            comparisonType: 'and',
            children: [
              {
                field: 'email',
                condition: '!∅',
                message: 'Email is required',
              },
              {
                field: 'email',
                condition: 'includes',
                value: '@',
                message: 'Email must contain @',
              },
            ],
          },
        },
        {
          type: 'input',
          name: 'password',
          label: 'Password',
          placeholder: 'Enter password',
          inputType: 'password',
          validateCondition: {
            comparisonType: 'and',
            children: [
              {
                field: 'password',
                condition: '!∅',
                message: 'Password is required',
              },
            ],
          },
        },
        {
          type: 'input',
          name: 'confirmPassword',
          label: 'Confirm Password',
          placeholder: 'Confirm your password',
          inputType: 'password',
          validateCondition: {
            comparisonType: 'and',
            children: [
              {
                field: 'confirmPassword',
                condition: '!∅',
                message: 'Please confirm your password',
              },
              {
                field: 'confirmPassword',
                condition: '===',
                value: '$password',
                message: 'Passwords must match',
              },
            ],
          },
        },
      ],
    },
    {
      name: 'Age Verification',
      fields: [
        {
          type: 'inputNumber',
          name: 'age',
          label: 'Age',
          min: 0,
          max: 120,
          validateCondition: {
            comparisonType: 'and',
            children: [
              {
                field: 'age',
                condition: '!∅',
                message: 'Age is required',
              },
              {
                field: 'age',
                condition: '>=',
                value: 18,
                message: 'You must be 18 or older',
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
    config: validationConfig,
    showSubmitButton: true,
    showResetButton: true,
  },
}

const complexValidationConfig: FormConfig = {
  groups: [
    {
      name: 'Price Range Filter',
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
            message: 'Minimum price must be less than or equal to maximum price',
          },
        ],
      },
      fields: [
        {
          type: 'inputNumber',
          name: 'minPrice',
          label: 'Minimum Price',
          placeholder: 'Enter minimum price',
          min: 0,
        },
        {
          type: 'inputNumber',
          name: 'maxPrice',
          label: 'Maximum Price',
          placeholder: 'Enter maximum price',
          min: 0,
        },
        {
          type: 'input',
          name: 'priceComment',
          label: 'Comment (not in validation)',
          placeholder: 'This field does not affect validation',
          inputType: 'text',
        },
      ],
    },
    {
      name: 'Date Range Filter',
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
            message: 'Start date must be before or equal to end date',
          },
        ],
      },
      fields: [
        {
          type: 'date',
          name: 'startDate',
          label: 'Start Date',
          placeholder: 'Select start date',
        },
        {
          type: 'date',
          name: 'endDate',
          label: 'End Date',
          placeholder: 'Select end date',
        },
        {
          type: 'input',
          name: 'dateComment',
          label: 'Comment (not in validation)',
          placeholder: 'This field does not affect validation',
          inputType: 'text',
        },
      ],
    },
  ],
}

export const ComplexValidation: Story = {
  args: {
    config: complexValidationConfig,
    showSubmitButton: true,
    showResetButton: true,
  },
}

const switchRequiredConfig: FormConfig = {
  groups: [
    {
      name: 'Conditional Required Field',
      fields: [
        {
          type: 'switch',
          name: 'enableFeature',
          label: 'Enable feature',
          checkedText: 'Yes',
          uncheckedText: 'No',
          defaultValue: false,
        },
        {
          type: 'input',
          name: 'featureCode',
          label: 'Feature Code',
          placeholder: 'Enter feature code',
          inputType: 'text',
          validateCondition: {
            comparisonType: 'or',
            children: [
              { field: 'enableFeature', condition: '===', value: false },
              {
                field: 'featureCode',
                condition: '!∅',
                message: 'Feature Code is required when feature is enabled',
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
    config: switchRequiredConfig,
    showSubmitButton: true,
    showResetButton: true,
  },
}
