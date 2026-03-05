import { FC, memo, useMemo } from 'react';
import { Card } from 'antd';
import { Control } from 'react-hook-form';
import { GroupField, FormValues, Field, DynamicListField as DynamicListFieldConfig } from '@/types';
import { evaluateConditions, collectValidationMessages, collectFieldsFromCondition, isFieldRequired } from '@/utils';
import { FieldRenderer } from '@/components/FieldRenderer';
import { DynamicListField } from '@/fields/DynamicListField';

/**
 * Мемоизированная обёртка поля для предотвращения лишних вычислений условий
 */
interface MemoizedFieldProps {
  field: Field
  control: Control<FormValues>
  formValues: FormValues
  touchedFields: Record<string, boolean | undefined>
  forceShowErrors: boolean
}

const MemoizedField: FC<MemoizedFieldProps> = memo(
  ({
    field,
    control,
    formValues,
    touchedFields,
    forceShowErrors,
  }) => {
    // Мемоизируем проверку видимости
    const isFieldVisible = useMemo(
      () => evaluateConditions(field.visibleCondition, formValues),
      [field.visibleCondition, formValues],
    );

    // Мемоизируем проверку валидации
    const isFieldValid = useMemo(
      () => evaluateConditions(field.validateCondition, formValues),
      [field.validateCondition, formValues],
    );
    // Мемоизируем проверку блокировки
    const isFieldDisabled = useMemo(
      () => field.disabledCondition
        ? evaluateConditions(field.disabledCondition, formValues)
        : false,
      [field.disabledCondition, formValues],
    );

    // Мемоизируем сообщения валидации
    const isFieldTouched = touchedFields[field.name];
    const shouldShowErrors = isFieldTouched || forceShowErrors;
    const fieldValidationMessages = useMemo(
      () => {
        if (isFieldValid || !shouldShowErrors) return undefined;
        return collectValidationMessages(field.validateCondition, formValues).join(', ');
      },
      [isFieldValid, shouldShowErrors, field.validateCondition, formValues],
    );

    // Динамически вычисляем обязательность поля по validateCondition
    const required = useMemo(
      () => isFieldRequired(field.validateCondition, formValues),
      [field.validateCondition, formValues],
    );

    if (!isFieldVisible) {
      return null;
    }
    return (
      <FieldRenderer
        key={field.name}
        field={field}
        control={control}
        error={fieldValidationMessages}
        disabled={isFieldDisabled}
        required={required}
      />
    );
  },
  (prevProps, nextProps) => {
    // Кастомное сравнение — перерендериваем только при изменении значимых данных
    if (prevProps.field !== nextProps.field) return false;
    if (prevProps.control !== nextProps.control) return false;
    if (prevProps.formValues !== nextProps.formValues) return false;
    if (prevProps.forceShowErrors !== nextProps.forceShowErrors) return false;

    // Сравниваем touched-состояние только для конкретного поля
    const fieldName = prevProps.field.name;
    if (Boolean(prevProps.touchedFields[fieldName]) !== Boolean(nextProps.touchedFields[fieldName])) {
      return false;
    }

    return true;
  },
);

MemoizedField.displayName = 'MemoizedField';

interface FieldGroupProps {
  group: GroupField
  control: Control<FormValues>
  formValues: FormValues
  touchedFields: Record<string, boolean | undefined>
  forceShowErrors: boolean
}

/**
 * Кастомная функция сравнения для memo
 */
const arePropsEqual = (
  prevProps: FieldGroupProps,
  nextProps: FieldGroupProps,
): boolean => {
  if (prevProps.group !== nextProps.group) return false;
  if (prevProps.control !== nextProps.control) return false;
  if (prevProps.formValues !== nextProps.formValues) return false;
  if (prevProps.forceShowErrors !== nextProps.forceShowErrors) return false;

  const prevTouched = prevProps.touchedFields;
  const nextTouched = nextProps.touchedFields;
  const allKeys = new Set([
    ...Object.keys(prevTouched),
    ...Object.keys(nextTouched),
  ]);

  for (const key of allKeys) {
    if (Boolean(prevTouched[key]) !== Boolean(nextTouched[key])) {
      return false;
    }
  }

  return true;
};

/**
 * Компонент группы полей с оптимизированным рендерингом
 */
export const FieldGroup: FC<FieldGroupProps> = memo(
  ({ group, control, formValues, touchedFields, forceShowErrors }) => {
    const { name, showTitle = true, showBorder = true, visibleCondition, validateCondition, fields } = group;

    const sortedFields = useMemo(
      () => [...fields].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      [fields],
    );

    const isVisible = useMemo(
      () => evaluateConditions(visibleCondition, formValues),
      [visibleCondition, formValues],
    );

    const isValid = useMemo(
      () => evaluateConditions(validateCondition, formValues),
      [validateCondition, formValues],
    );

    const validationMessages = useMemo(
      () => {
        if (isValid) return [];
        return collectValidationMessages(validateCondition, formValues);
      },
      [isValid, validateCondition, formValues],
    );

    const allValidationFieldsTouched = useMemo(() => {
      if (!validateCondition) return true;
      const fieldsInValidation = collectFieldsFromCondition(validateCondition);

      return fieldsInValidation.every(fieldName => touchedFields[fieldName]);
    }, [validateCondition, touchedFields]);

    if (!isVisible) {
      return null;
    }

    const groupContent = (
      <>
        {/* Рендерим поля через MemoizedField для лучшей производительности */}
        {sortedFields.map((field) => {
          if (field.type === 'dynamicList') {
            const isListValid = evaluateConditions(field.validateCondition, formValues);
            const listError = !isListValid && forceShowErrors
              ? collectValidationMessages(field.validateCondition, formValues).join(', ')
              : undefined;
            return (
              <DynamicListField
                key={field.name}
                config={field as DynamicListFieldConfig}
                control={control}
                formValues={formValues}
                forceShowErrors={forceShowErrors}
                error={listError}
              />
            );
          }
          return (
            <MemoizedField
              key={field.name}
              field={field}
              control={control}
              formValues={formValues}
              touchedFields={touchedFields}
              forceShowErrors={forceShowErrors}
            />
          );
        })}

        {!isValid && validationMessages.length > 0 && (allValidationFieldsTouched || forceShowErrors) && (
          <div style={{
            color: '#ff4d4f',
            fontSize: '12px',
            marginTop: '8px',
            lineHeight: '1.5',
          }}>
            {validationMessages.map((msg, idx) => (
              <div key={idx}>{msg}</div>
            ))}
          </div>
        )}
      </>
    );

    const showGroupError = !isValid && (allValidationFieldsTouched || forceShowErrors);

    if (showBorder) {
      return (
        <Card
          title={showTitle ? name : undefined}
          headStyle={{ fontSize: '14px' }}
          style={{
            marginBottom: 24,
            borderColor: showGroupError ? '#ff4d4f' : undefined,
          }}
          className={showGroupError ? 'has-error' : ''}
        >
          {groupContent}
        </Card>
      );
    }

    return (
      <div style={{ marginBottom: 24 }}>
        {showTitle && (
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '16px',
            color: showGroupError ? '#ff4d4f' : undefined,
          }}>
            {name}
          </div>
        )}
        {groupContent}
      </div>
    );
  },
  arePropsEqual,
);

FieldGroup.displayName = 'FieldGroup';
