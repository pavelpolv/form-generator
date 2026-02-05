import type { Meta, StoryObj } from '@storybook/react'
import { useForm } from 'react-hook-form'
import { DateField } from './DateField'
import { DateField as DateFieldConfig } from '@/types'

// Wrapper component to provide react-hook-form context
const DateFieldWrapper = ({ config }: { config: DateFieldConfig }) => {
  const { control } = useForm()
  return <DateField config={config} control={control} />
}

const meta: Meta<typeof DateFieldWrapper> = {
  title: 'Fields/DateField',
  component: DateFieldWrapper,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof DateFieldWrapper>

export const BasicDate: Story = {
  args: {
    config: {
      type: 'date',
      name: 'birthDate',
      label: 'Birth Date',
      placeholder: 'Select your birth date',
    },
  },
}

export const WithCustomFormat: Story = {
  args: {
    config: {
      type: 'date',
      name: 'eventDate',
      label: 'Event Date',
      placeholder: 'Select event date',
      format: 'DD/MM/YYYY',
    },
  },
}

export const WithTime: Story = {
  args: {
    config: {
      type: 'date',
      name: 'appointmentDateTime',
      label: 'Appointment Date & Time',
      placeholder: 'Select appointment date and time',
      format: 'YYYY-MM-DD HH:mm',
      showTime: true,
    },
  },
}

export const WithDefaultValue: Story = {
  args: {
    config: {
      type: 'date',
      name: 'joinDate',
      label: 'Join Date',
      placeholder: 'Select join date',
      format: 'YYYY-MM-DD',
      defaultValue: '2024-01-15T10:00:00.000Z',
    },
  },
}

export const WithDisabledDateBefore: Story = {
  args: {
    config: {
      type: 'date',
      name: 'futureDate',
      label: 'Future Date (no past dates)',
      placeholder: 'Select a future date',
      format: 'YYYY-MM-DD',
      disabledDateBefore: new Date().toISOString(),
    },
  },
}

export const WithError: Story = {
  render: (args) => {
    const { control } = useForm()
    return (
      <DateField
        config={args.config}
        control={control}
        error="This date is required"
      />
    )
  },
  args: {
    config: {
      type: 'date',
      name: 'requiredDate',
      label: 'Required Date',
      placeholder: 'Select a date',
      format: 'YYYY-MM-DD',
    },
  },
}

export const Disabled: Story = {
  render: (args) => {
    const { control } = useForm()
    return (
      <DateField
        config={args.config}
        control={control}
        disabled={true}
      />
    )
  },
  args: {
    config: {
      type: 'date',
      name: 'disabledDate',
      label: 'Disabled Date',
      placeholder: 'This date picker is disabled',
      format: 'YYYY-MM-DD',
      defaultValue: '2024-01-15T10:00:00.000Z',
    },
  },
}
