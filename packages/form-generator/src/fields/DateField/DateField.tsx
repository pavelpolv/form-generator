import { FC, memo, useMemo, useCallback } from 'react';
import { DatePicker, Form } from 'antd';
import { Controller, Control } from 'react-hook-form';
import { DateField as DateFieldConfig, FormValues } from '@/types';
import moment, { Moment } from 'moment';
import { validateFieldConfig } from '@/validation/fieldSchemas';

interface DateFieldProps {
  config: DateFieldConfig
  control: Control<FormValues>
  error?: string
  disabled?: boolean
  required?: boolean
}

/**
 * Компонент поля даты
 * Поддерживает выбор даты и даты со временем с настройкой формата
 */
export const DateField: FC<DateFieldProps> = memo(({
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
    format = 'YYYY-MM-DD',
    showTime = false,
    disabledDateBefore,
    disabledDateAfter,
  } = config;

  // Мемоизация функции disabledDate для предотвращения пересоздания при каждом рендере
  const disabledDate = useCallback((current: Moment) => {
    if (!current) return false;

    let isDisabled = false;

    if (disabledDateBefore) {
      isDisabled = isDisabled || current.isBefore(moment(disabledDateBefore), 'day');
    }

    if (disabledDateAfter) {
      isDisabled = isDisabled || current.isAfter(moment(disabledDateAfter), 'day');
    }

    return isDisabled;
  }, [disabledDateBefore, disabledDateAfter]);

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
          <DatePicker
            value={field.value ? moment(field.value) : null}
            onChange={(date: Moment | null) => {
              field.onChange(date ? date.toISOString() : null);
            }}
            onBlur={field.onBlur}
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
  );
});

DateField.displayName = 'DateField';
