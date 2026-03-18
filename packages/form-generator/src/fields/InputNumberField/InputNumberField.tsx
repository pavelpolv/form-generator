import { FC, memo, useMemo, useCallback } from 'react';
import { InputNumber, Form } from 'antd';
import { Controller, Control, ControllerRenderProps } from 'react-hook-form';
import { InputNumberField as InputNumberFieldConfig, FormValues } from '@/types';
import { validateFieldConfig } from '@/validation/fieldSchemas';

interface InputNumberFieldProps {
  config: InputNumberFieldConfig
  control: Control<FormValues>
  error?: string
  disabled?: boolean
  required?: boolean
}

// Мемоизированный внутренний компонент для использования хуков с field из render prop
const InputNumberInner: FC<{
  field: ControllerRenderProps<FormValues, string>
  label?: string
  placeholder?: string
  disabled: boolean
  min?: number
  max?: number
  step?: number
  error?: string
  required?: boolean
}> = memo(({ field, label, placeholder, disabled, min, max, step, error, required }) => {
  const handleChange = useCallback((value: number | null) => {
    field.onChange(value === null ? undefined : value);
  }, [field]);

  const handleBlur = useCallback(() => {
    field.onBlur();
  }, [field]);

  return (
    <Form.Item
      label={label}
      validateStatus={error ? 'error' : undefined}
      help={error}
      required={required}
    >
      <InputNumber
        value={field.value}
        name={field.name}
        ref={field.ref}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </Form.Item>
  );
});

InputNumberInner.displayName = 'InputNumberInner';

/**
 * Компонент числового поля ввода
 * Поддерживает ввод чисел с настройкой минимума, максимума и шага
 */
export const InputNumberField: FC<InputNumberFieldProps> = memo(({
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
    min,
    max,
    step,
  } = config;

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
          required={required}
        />
      )}
    />
  );
});

InputNumberField.displayName = 'InputNumberField';
