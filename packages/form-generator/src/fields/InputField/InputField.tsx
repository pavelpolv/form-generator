import { FC, memo, useMemo } from 'react';
import { Input, Form } from 'antd';
import { Controller, Control } from 'react-hook-form';
import { InputField as InputFieldConfig, FormValues } from '@/types';
import { validateFieldConfig } from '@/validation/fieldSchemas';

interface InputFieldProps {
  config: InputFieldConfig
  control: Control<FormValues>
  error?: string
  disabled?: boolean
  required?: boolean
}

/**
 * Компонент поля ввода
 * Поддерживает типы ввода: text, number, email, password, tel, url
 */
export const InputField: FC<InputFieldProps> = memo(({
  config,
  control,
  error,
  disabled = false,
  required = false,
}) => {
  // Валидация конфига — мемоизирована, так как конфиг не изменяется после инициализации
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
          required={required}
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
