import React from 'react'
import { Input, Form } from 'antd'
import { Controller, Control } from 'react-hook-form'
import { InputNumberField as InputNumberFieldConfig } from '@/types'
import { validateFieldConfig } from '@/validation/fieldSchemas'

interface InputNumberFieldProps {
  config: InputNumberFieldConfig
  control: Control<any>
  error?: string
  disabled?: boolean
}

/**
 * Input number field component
 * Supports numeric input with min, max, and step configuration
 */
export const InputNumberField: React.FC<InputNumberFieldProps> = ({
  config,
  control,
  error,
  disabled = false,
}) => {
  // Validate config
  const configError = validateFieldConfig(config)
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

  const validateStatus = error ? 'error' : undefined
  const help = error || undefined

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field }) => (
        <Form.Item
          label={label}
          validateStatus={validateStatus}
          help={help}
          hasFeedback={!!error}
          required={false}
        >
          <Input
            {...field}
            type="number"
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const value = e.target.value
              field.onChange(value === '' ? undefined : Number(value))
            }}
            onBlur={() => {
              field.onBlur()
            }}
          />
        </Form.Item>
      )}
    />
  )
}
