import { FC, memo, useMemo } from 'react';
import { Switch, Form } from 'antd';
import { Controller, Control } from 'react-hook-form';
import { SwitchField as SwitchFieldConfig, FormValues } from '@/types';
import { validateFieldConfig } from '@/validation/fieldSchemas';

interface SwitchFieldProps {
  config: SwitchFieldConfig
  control: Control<FormValues>
  error?: string
  disabled?: boolean
  required?: boolean
}

/**
 * Компонент поля-переключателя
 * Представляет булев тумблер с опциональным текстом для включённого/выключенного состояния
 */
export const SwitchField: FC<SwitchFieldProps> = memo(({
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
    defaultValue,
    checkedText,
    uncheckedText,
  } = config;

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue ?? false}
      render={({ field }) => (
        <Form.Item
          label={label}
          validateStatus={error ? 'error' : undefined}
          help={error}
          required={required}
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
  );
});

SwitchField.displayName = 'SwitchField';
