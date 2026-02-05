import type { Meta, StoryObj } from '@storybook/react'
import { FormGenerator } from '../../src/components/FormGenerator'
import { FormConfig } from '../../src/types'

const meta: Meta<typeof FormGenerator> = {
  title: 'Examples/Conditional Visibility',
  component: FormGenerator,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof FormGenerator>

const conditionalVisibilityConfig: FormConfig = {
  groups: [
    {
      name: 'User Type',
      fields: [
        {
          type: 'select',
          name: 'userType',
          label: 'I am a',
          placeholder: 'Select user type',
          options: [
            { label: 'Student', value: 'student' },
            { label: 'Professional', value: 'professional' },
            { label: 'Retired', value: 'retired' },
          ],
        },
      ],
    },
    {
      name: 'Student Information',
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
          label: 'University',
          placeholder: 'Enter your university name',
          inputType: 'text',
        },
        {
          type: 'input',
          name: 'studentId',
          label: 'Student ID',
          placeholder: 'Enter your student ID',
          inputType: 'text',
        },
        {
          type: 'inputNumber',
          name: 'expectedGraduation',
          label: 'Expected Graduation Year',
          placeholder: 'e.g., 2025',
          min: 2024,
          max: 2030,
        },
      ],
    },
    {
      name: 'Professional Information',
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
          label: 'Company',
          placeholder: 'Enter your company name',
          inputType: 'text',
        },
        {
          type: 'input',
          name: 'position',
          label: 'Position',
          placeholder: 'Enter your position',
          inputType: 'text',
        },
        {
          type: 'inputNumber',
          name: 'yearsExperience',
          label: 'Years of Experience',
          min: 0,
          max: 50,
        },
      ],
    },
    {
      name: 'Additional Details',
      fields: [
        {
          type: 'switch',
          name: 'hasLicense',
          label: 'Do you have a driving license?',
          checkedText: 'Yes',
          uncheckedText: 'No',
          defaultValue: false,
        },
        {
          type: 'input',
          name: 'licenseNumber',
          label: 'License Number',
          placeholder: 'Enter your license number',
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
    config: conditionalVisibilityConfig,
    showSubmitButton: true,
    showResetButton: true,
    onSubmit: (values) => {
      console.log('Form submitted:', values)
      alert('Form submitted! Check console for values.')
    },
  },
}

const nestedConditionsConfig: FormConfig = {
  groups: [
    {
      name: 'Account Settings',
      fields: [
        {
          type: 'switch',
          name: 'isPremium',
          label: 'Premium Account',
          checkedText: 'Yes',
          uncheckedText: 'No',
          defaultValue: false,
        },
        {
          type: 'inputNumber',
          name: 'age',
          label: 'Age',
          min: 0,
          max: 120,
        },
        {
          type: 'switch',
          name: 'hasParentalConsent',
          label: 'Has Parental Consent',
          checkedText: 'Yes',
          uncheckedText: 'No',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'Premium Features',
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
          label: 'Referral Code',
          placeholder: 'Enter referral code',
          inputType: 'text',
        },
        {
          type: 'select',
          name: 'plan',
          label: 'Premium Plan',
          options: [
            { label: 'Basic - $9.99/month', value: 'basic' },
            { label: 'Pro - $19.99/month', value: 'pro' },
            { label: 'Enterprise - $49.99/month', value: 'enterprise' },
          ],
        },
      ],
    },
  ],
}

export const NestedConditions: Story = {
  args: {
    config: nestedConditionsConfig,
    showSubmitButton: true,
    showResetButton: true,
    onSubmit: (values) => {
      console.log('Form submitted:', values)
      alert('Form submitted! Check console for values.')
    },
  },
}
