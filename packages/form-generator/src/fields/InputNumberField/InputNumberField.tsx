import React, { useMemo, useCallback } from 'react'
import { Input, Form } from 'antd'
import { Controller, Control, ControllerRenderProps } from 'react-hook-form'
import { InputNumberField as InputNumberFieldConfig, FormValues } from '@/types'
import { validateFieldConfig } from '@/validation/fieldSchemas'

interface InputNumberFieldProps {
  config: InputNumberFieldConfig
  control: Control<FormValues>
  error?: string
  disabled?: boolean
}

// Memoized inner component to use hooks with field from render prop
const InputNumberInner: React.FC<{
  field: ControllerRenderProps<FormValues, string>
  label?: string
  placeholder?: string
  disabled: boolean
  min?: number
  max?: number
  step?: number
  error?: string
}> = React.memo(({ field, label, placeholder, disabled, min, max, step, error }) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    field.onChange(value === '' ? undefined : Number(value))
  }, [field])

  const handleBlur = useCallback(() => {
    field.onBlur()
  }, [field])

  return (
    <Form.Item
      label={label}
      validateStatus={error ? 'error' : undefined}
      help={error}
    >
      <Input
        {...field}
        type="number"
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </Form.Item>
  )
})

InputNumberInner.displayName = 'InputNumberInner'

/**
 * Input number field component
 * Supports numeric input with min, max, and step configuration
 */
export const InputNumberField: React.FC<InputNumberFieldProps> = React.memo(({
  config,
  control,
  error,
  disabled = false,
}) => {
  // Validate config - memoized since config doesn't change after initialization
  const configError = useMemo(() => validateFieldConfig(config), [config])
  if (configError) {
    return (
      <div style={{ color: '#ff4d4f', marginBottom: 16 }}>
        <div style={{ fontWeight: 600 }}>Невозможно отобразить поле</div>
        <div style={{ fontSize: 12, marginTop: 4 }}>{configError}</div>
      </div>
    )
  }

  const {
    name,
    label,
    placeholder,
    defaultValue,
    min,
    max,
    step,
  } = config

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field }) => (
        <InputNumberInner
          field={field}
          label={label}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          error={error}
        />
      )}
    />
  )
})

InputNumberField.displayName = 'InputNumberField'
