import React from 'react'
import { DatePicker, Form } from 'antd'
import { Controller, Control } from 'react-hook-form'
import { DateField as DateFieldConfig } from '@/types'
import moment, { Moment } from 'moment'
import { validateFieldConfig } from '@/validation/fieldSchemas'

interface DateFieldProps {
  config: DateFieldConfig
  control: Control<any>
  error?: string
  disabled?: boolean
}

/**
 * Date field component
 * Supports date and datetime selection with format customization
 */
export const DateField: React.FC<DateFieldProps> = ({
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
    format = 'YYYY-MM-DD',
    showTime = false,
    disabledDateBefore,
    disabledDateAfter,
  } = config

  const validateStatus = error ? 'error' : undefined
  const help = error || undefined

  const disabledDate = (current: Moment) => {
    if (!current) return false

    let disabled = false

    if (disabledDateBefore) {
      disabled = disabled || current.isBefore(moment(disabledDateBefore), 'day')
    }

    if (disabledDateAfter) {
      disabled = disabled || current.isAfter(moment(disabledDateAfter), 'day')
    }

    return disabled
  }

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
          <DatePicker
            value={field.value ? moment(field.value) : null}
            onChange={(date) => {
              field.onChange(date ? date.toISOString() : null)
            }}
            onBlur={() => {
              console.log('[DateField] onBlur called for:', name)
              field.onBlur()
            }}
            format={format}
            placeholder={placeholder}
            disabled={disabled}
            showTime={showTime}
            disabledDate={disabledDateBefore || disabledDateAfter ? disabledDate : undefined}
            style={{ width: '100%' }}
          />
        </Form.Item>
      )}
    />
  )
}
