import React from 'react'
import { Select, Form } from 'antd'
import { Controller, Control } from 'react-hook-form'
import { SelectField as SelectFieldConfig, FormValues } from '@/types'
import { validateFieldConfig } from '@/validation/fieldSchemas'

const { Option } = Select

interface SelectFieldProps {
  config: SelectFieldConfig
  control: Control<FormValues>
  error?: string
  disabled?: boolean
}

/**
 * Select field component
 * Supports single and multiple selection with optional search
 */
export const SelectField: React.FC<SelectFieldProps> = ({
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
    options,
    multiple = false,
    searchable = false,
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
          <Select
            {...field}
            mode={multiple ? 'multiple' : undefined}
            placeholder={placeholder}
            disabled={disabled}
            showSearch={searchable}
            filterOption={
              searchable
                ? (input, option) =>
                    (option?.children as string)
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                : undefined
            }
            onBlur={() => {
              console.log('[SelectField] onBlur called for:', name)
              field.onBlur()
            }}
            style={{ width: '100%' }}
          >
            {options.map((option) => (
              <Option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
      )}
    />
  )
}
