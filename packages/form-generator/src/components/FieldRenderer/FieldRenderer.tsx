import React from 'react'
import { Control } from 'react-hook-form'
import { Field, FormValues } from '@/types'
import { InputField, InputNumberField, SelectField, SwitchField, DateField } from '@/fields'

interface FieldRendererProps {
  field: Field
  control: Control<FormValues>
  error?: string
  disabled?: boolean
}

/**
 * Custom comparison for React.memo
 * Prevents unnecessary re-renders when props are functionally equal
 */
const arePropsEqual = (
  prevProps: FieldRendererProps,
  nextProps: FieldRendererProps
): boolean => {
  return (
    prevProps.field === nextProps.field &&
    prevProps.control === nextProps.control &&
    prevProps.error === nextProps.error &&
    prevProps.disabled === nextProps.disabled
  )
}

/**
 * Dynamic field renderer
 * Renders the appropriate field component based on field type
 */
export const FieldRenderer: React.FC<FieldRendererProps> = React.memo(({
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
      console.error(`[Form Generator] Unknown field type: ${(field as Field).type}`)
      return null
  }
}, arePropsEqual)

FieldRenderer.displayName = 'FieldRenderer'
