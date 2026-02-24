import { FC, memo } from 'react';
import { Control } from 'react-hook-form';
import { Field, FormValues } from '@/types';
import { InputField, InputNumberField, MoneyField, SelectField, SwitchField, DateField, TextareaField } from '@/fields';

interface FieldRendererProps {
  field: Field
  control: Control<FormValues>
  error?: string
  disabled?: boolean
}

/**
 * Кастомное сравнение для memo
 * Предотвращает лишние перерендеры, когда пропсы функционально не изменились
 */
const arePropsEqual = (
  prevProps: FieldRendererProps,
  nextProps: FieldRendererProps,
): boolean => {
  return (
    prevProps.field === nextProps.field &&
    prevProps.control === nextProps.control &&
    prevProps.error === nextProps.error &&
    prevProps.disabled === nextProps.disabled
  );
};

/**
 * Динамический рендерер полей
 * Рендерит подходящий компонент поля в зависимости от его типа
 */
export const FieldRenderer: FC<FieldRendererProps> = memo(({
  field,
  control,
  error,
  disabled,
}) => {
  switch (field.type) {
  case 'input':
    return (
      <InputField
        config={field}
        control={control}
        error={error}
        disabled={disabled}
      />
    );

  case 'inputNumber':
    return (
      <InputNumberField
        config={field}
        control={control}
        error={error}
        disabled={disabled}
      />
    );

  case 'select':
    return (
      <SelectField
        config={field}
        control={control}
        error={error}
        disabled={disabled}
      />
    );

  case 'switch':
    return (
      <SwitchField
        config={field}
        control={control}
        error={error}
        disabled={disabled}
      />
    );

  case 'date':
    return (
      <DateField
        config={field}
        control={control}
        error={error}
        disabled={disabled}
      />
    );

  case 'money':
    return (
      <MoneyField
        config={field}
        control={control}
        error={error}
        disabled={disabled}
      />
    );

  case 'textarea':
    return (
      <TextareaField
        config={field}
        control={control}
        error={error}
        disabled={disabled}
      />
    );

  default:
    console.error(`[Form Generator] Unknown field type: ${(field as Field).type}`);
    return null;
  }
}, arePropsEqual);

FieldRenderer.displayName = 'FieldRenderer';
