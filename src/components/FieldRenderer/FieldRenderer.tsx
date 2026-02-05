import React from 'react'
import { Control } from 'react-hook-form'
import { Field } from '@/types'
import { InputField, InputNumberField, SelectField, SwitchField, DateField } from '@/fields'

interface FieldRendererProps {
  field: Field
  control: Control<any>
  error?: string
  disabled?: boolean
}

/**
 * Dynamic field renderer
 * Renders the appropriate field component based on field type
 */
export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  control,
  error,
  disabled,
}) => {
  switch (field.type) {
    case 'input':
      return (
        <InputField
          config={field}
          control={control}
          error={error}
          disabled={disabled}
        />
      )

    case 'inputNumber':
      return (
        <InputNumberField
          config={field}
          control={control}
          error={error}
          disabled={disabled}
        />
      )

    case 'select':
      return (
        <SelectField
          config={field}
          control={control}
          error={error}
          disabled={disabled}
        />
      )

    case 'switch':
      return (
        <SwitchField
          config={field}
          control={control}
          error={error}
          disabled={disabled}
        />
      )

    case 'date':
      return (
        <DateField
          config={field}
          control={control}
          error={error}
          disabled={disabled}
        />
      )

    default:
      console.error(`[Form Generator] Unknown field type: ${(field as any).type}`)
      return null
  }
}
