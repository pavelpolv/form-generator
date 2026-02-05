import React from 'react'
import { Input, Form } from 'antd'
import { Controller, Control } from 'react-hook-form'
import { InputField as InputFieldConfig } from '@/types'
import { validateFieldConfig } from '@/validation/fieldSchemas'

interface InputFieldProps {
  config: InputFieldConfig
  control: Control<any>
  error?: string
  disabled?: boolean
}

/**
 * Input field component
 * Supports text, number, email, password, tel, url input types
 */
export const InputField: React.FC<InputFieldProps> = ({
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
    inputType = 'text',
    maxLength,
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
          {inputType === 'password' ? (
            <Input.Password
              {...field}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={maxLength}
            />
          ) : (
            <Input
              {...field}
              type={inputType}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={maxLength}
            />
          )}
        </Form.Item>
      )}
    />
  )
}
