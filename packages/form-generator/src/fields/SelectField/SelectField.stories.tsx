import type { Meta, StoryObj } from '@storybook/react'
import { useForm } from 'react-hook-form'
import { SelectField } from './SelectField'
import { SelectField as SelectFieldConfig } from '@/types'

// Wrapper component to provide react-hook-form context
const SelectFieldWrapper = ({ config }: { config: SelectFieldConfig }) => {
  const { control } = useForm()
  return <SelectField config={config} control={control} />
}

const meta: Meta<typeof SelectFieldWrapper> = {
  title: 'Fields/SelectField',
  component: SelectFieldWrapper,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof SelectFieldWrapper>

const countryOptions = [
  { label: 'United States', value: 'US' },
  { label: 'United Kingdom', value: 'UK' },
  { label: 'Canada', value: 'CA' },
  { label: 'Australia', value: 'AU' },
  { label: 'Germany', value: 'DE' },
  { label: 'France', value: 'FR' },
]

export const SingleSelect: Story = {
  args: {
    config: {
      type: 'select',
      name: 'country',
      label: 'Country',
      placeholder: 'Select your country',
      options: countryOptions,
    },
  },
}

export const MultipleSelect: Story = {
  args: {
    config: {
      type: 'select',
      name: 'countries',
      label: 'Countries',
      placeholder: 'Select multiple countries',
      options: countryOptions,
      multiple: true,
    },
  },
}

export const SearchableSelect: Story = {
  args: {
    config: {
      type: 'select',
      name: 'country',
      label: 'Country (Searchable)',
      placeholder: 'Search and select country',
      options: countryOptions,
      searchable: true,
    },
  },
}

export const WithDefaultValue: Story = {
  args: {
    config: {
      type: 'select',
      name: 'country',
      label: 'Country',
      placeholder: 'Select your country',
      options: countryOptions,
      defaultValue: 'US',
    },
  },
}

export const WithDisabledOptions: Story = {
  args: {
    config: {
      type: 'select',
      name: 'country',
      label: 'Country',
      placeholder: 'Select your country',
      options: [
        { label: 'United States', value: 'US' },
        { label: 'United Kingdom', value: 'UK', disabled: true },
        { label: 'Canada', value: 'CA' },
      ],
    },
  },
}

export const WithError: Story = {
  render: (args) => {
    const { control } = useForm()
    return (
      <SelectField
        config={args.config}
        control={control}
        error="Please select a country"
      />
    )
  },
  args: {
    config: {
      type: 'select',
      name: 'country',
      label: 'Country',
      placeholder: 'Select your country',
      options: countryOptions,
    },
  },
}

export const Disabled: Story = {
  render: (args) => {
    const { control } = useForm()
    return (
      <SelectField
        config={args.config}
        control={control}
        disabled={true}
      />
    )
  },
  args: {
    config: {
      type: 'select',
      name: 'country',
      label: 'Country',
      placeholder: 'Select your country',
      options: countryOptions,
      defaultValue: 'US',
    },
  },
}
