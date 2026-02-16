import { FC, memo, useMemo } from 'react';
import { Input, Form } from 'antd';
import { Controller, Control } from 'react-hook-form';
import { TextareaField as TextareaFieldConfig, FormValues } from '@/types';
import { validateFieldConfig } from '@/validation/fieldSchemas';

interface TextareaFieldProps {
  config: TextareaFieldConfig
  control: Control<FormValues>
  error?: string
  disabled?: boolean
}

/**
 * Textarea field component
 * Supports multi-line text input with optional auto-sizing
 */
export const TextareaField: FC<TextareaFieldProps> = memo(({
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
    rows,
    maxLength,
    autoSize,
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
          <Input.TextArea
            {...field}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            maxLength={maxLength}
            autoSize={autoSize}
          />
        </Form.Item>
      )}
    />
  );
});

TextareaField.displayName = 'TextareaField';
