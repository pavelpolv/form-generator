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
      name: 'Contact Form',
      fields: [
        {
          type: 'input',
          name: 'fullName',
          label: 'Full Name *',
          placeholder: 'Enter your full name',
          inputType: 'text',
          validateCondition: {
            comparisonType: 'and',
            children: [
              {
                field: 'fullName',
                condition: '!∅',
                message: 'Full name is required',
              },
            ],
          },
        },
        {
          type: 'input',
          name: 'email',
          label: 'Email Address *',
          placeholder: 'your.email@example.com',
          inputType: 'email',
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
                message: 'Please enter a valid email address',
              },
              {
                field: 'email',
                condition: 'includes',
                value: '.',
                message: 'Please enter a valid email address',
              },
            ],
          },
        },
        {
          type: 'input',
          name: 'phone',
          label: 'Phone Number',
          placeholder: '+1 (555) 123-4567',
          inputType: 'tel',
        },
        {
          type: 'select',
          name: 'subject',
          label: 'Subject *',
          placeholder: 'Select a subject',
          options: [
            { label: 'General Inquiry', value: 'general' },
            { label: 'Technical Support', value: 'support' },
            { label: 'Sales', value: 'sales' },
            { label: 'Feedback', value: 'feedback' },
          ],
          validateCondition: {
            comparisonType: 'and',
            children: [
              {
                field: 'subject',
                condition: '!∅',
                message: 'Please select a subject',
              },
            ],
          },
        },
        {
          type: 'input',
          name: 'message',
          label: 'Message',
          placeholder: 'Your message here...',
          inputType: 'text',
        },
        {
          type: 'switch',
          name: 'agreeToTerms',
          label: 'I agree to the terms and conditions *',
          checkedText: 'Yes',
          uncheckedText: 'No',
          defaultValue: false,
          validateCondition: {
            comparisonType: 'and',
            children: [
              {
                field: 'agreeToTerms',
                condition: '===',
                value: true,
                message: 'You must agree to the terms and conditions',
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
        { key: 'submit', label: 'Submit Form', type: 'primary', action: 'submit', requiresValidation: true, url: 'https://httpbin.org/post' },
        { key: 'reset', label: 'Clear Form', action: 'reset' },
      ],
    },
  },
}

const conditionalRequiredConfig: FormConfig = {
  groups: [
    {
      name: 'Shipping Information',
      fields: [
        {
          type: 'select',
          name: 'shippingMethod',
          label: 'Shipping Method *',
          placeholder: 'Select shipping method',
          options: [
            { label: 'Standard Shipping', value: 'standard' },
            { label: 'Express Shipping', value: 'express' },
            { label: 'Pick Up In Store', value: 'pickup' },
          ],
          validateCondition: {
            comparisonType: 'and',
            children: [
              {
                field: 'shippingMethod',
                condition: '!∅',
                message: 'Please select a shipping method',
              },
            ],
          },
        },
        {
          type: 'input',
          name: 'address',
          label: 'Shipping Address *',
          placeholder: 'Enter your address',
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
                    message: 'Address is required for shipping',
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'input',
          name: 'city',
          label: 'City *',
          placeholder: 'Enter your city',
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
                    message: 'City is required for shipping',
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'input',
          name: 'zipCode',
          label: 'ZIP Code *',
          placeholder: 'Enter ZIP code',
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
                    message: 'ZIP code is required for shipping',
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'input',
          name: 'storeName',
          label: 'Store Name *',
          placeholder: 'Store name will appear here',
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
          defaultValue: 'Main Street Store - 123 Main St',
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
        { key: 'submit', label: 'Submit', type: 'primary', action: 'submit', requiresValidation: true, url: 'https://httpbin.org/post' },
        { key: 'reset', label: 'Reset', action: 'reset' },
      ],
    },
  },
}
