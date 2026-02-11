import React, { useMemo } from 'react';
import { Input, Form } from 'antd';
import { Controller, Control } from 'react-hook-form';
import { InputField as InputFieldConfig, FormValues } from '@/types';
import { validateFieldConfig } from '@/validation/fieldSchemas';

interface InputFieldProps {
  config: InputFieldConfig
  control: Control<FormValues>
  error?: string
  disabled?: boolean
}

/**
 * Input field component
 * Supports text, number, email, password, tel, url input types
 */
export const InputField: React.FC<InputFieldProps> = React.memo(({
  config,
  control,
  error,
  disabled = false,
}) => {
  // Validate config - memoized since config doesn't change after initialization
  const configError = useMemo(() => validateFieldConfig(config), [config]);
  if (configError) {
    return (
      <div style={{ color: '#ff4d4f', marginBottom: 16 }}>
        <div style={{ fontWeight: 600 }}>Невозможно отобразить поле</div>
        <div style={{ fontSize: 12, marginTop: 4 }}>{configError}</div>
      </div>
    );
  }

  const {
    name,
    label,
    placeholder,
    defaultValue,
    inputType = 'text',
    maxLength,
  } = config;

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field }) => (
        <Form.Item
          label={label}
          validateStatus={error ? 'error' : undefined}
          help={error}
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
  );
});

InputField.displayName = 'InputField';
