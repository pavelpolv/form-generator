import React from 'react'
import { Switch, Form } from 'antd'
import { Controller, Control } from 'react-hook-form'
import { SwitchField as SwitchFieldConfig } from '@/types'
import { validateFieldConfig } from '@/validation/fieldSchemas'

interface SwitchFieldProps {
  config: SwitchFieldConfig
  control: Control<any>
  error?: string
  disabled?: boolean
}

/**
 * Switch field component
 * Represents a boolean toggle with optional checked/unchecked text
 */
export const SwitchField: React.FC<SwitchFieldProps> = ({
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
    defaultValue,
    checkedText,
    uncheckedText,
  } = config

  const validateStatus = error ? 'error' : undefined
  const help = error || undefined

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue ?? false}
      render={({ field }) => (
        <Form.Item
          label={label}
          validateStatus={validateStatus}
          help={help}
          hasFeedback={!!error}
          required={false}
        >
          <Switch
            checked={field.value}
            onChange={field.onChange}
            disabled={disabled}
            checkedChildren={checkedText}
            unCheckedChildren={uncheckedText}
          />
        </Form.Item>
      )}
    />
  )
}
