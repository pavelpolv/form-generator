import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useForm, useFormState } from 'react-hook-form';
import { Button, Form, Space, notification } from 'antd';
import { ComputedValueConfig, FormConfig, FormValues, SubmitButtonConfig } from '@/types';
import { evaluateComputedValue, evaluateConditions } from '@/utils';
import { FieldGroup } from '@/components/FieldGroup';
import { FormButtons } from '@/components/FormButtons';

export interface FormGeneratorRef {
  getValues: () => FormValues
  reset: (values?: FormValues) => void
  submit: () => void
  setValue: (name: string, value: unknown) => void
}

export interface FormGeneratorProps {
  /**
   * Конфигурация формы
   */
  config: FormConfig

  /**
   * Начальные значения формы
   */
  initialValues?: FormValues

  /**
   * Колбэк при изменении значений формы
   */
  onChange?: (values: FormValues) => void

  /**
   * Колбэк при отправке формы
   */
  onSubmit?: (values: FormValues) => void
}

/**
 * Компонент генератора форм
 * Основной компонент для рендеринга динамических форм на основе конфигурации
 */
export const FormGenerator = forwardRef<FormGeneratorRef, FormGeneratorProps>(
  (
    {
      config,
      initialValues = {},
      onChange,
      onSubmit,
    },
    ref,
  ) => {
    // Собираем defaultValue из конфига и мержим с initialValues (initialValues имеет приоритет)
    const mergedDefaultValues = useMemo(() => {
      const defaults: FormValues = {};
      for (const group of config.groups) {
        for (const field of group.fields) {
          if (field.defaultValue !== undefined) {
            defaults[field.name] = field.defaultValue;
          }
        }
      }

      return { ...defaults, ...initialValues };
    }, [config.groups, initialValues]);

    const { control, handleSubmit, watch, reset, getValues, setValue } = useForm({
      defaultValues: mergedDefaultValues,
      mode: 'onBlur', // Валидация при потере фокуса (первая ошибка)
      reValidateMode: 'onChange', // Повторная валидация при изменении (если уже есть ошибка)
    });

    const [loadingKey, setLoadingKey] = useState<string | null>(null);
    const [forceShowErrors, setForceShowErrors] = useState(false);

    // Подписываемся на изменения touchedFields через useFormState
    // Создаёт корректную подписку и вызывает повторный рендер при изменении touchedFields
    const { touchedFields } = useFormState({ control });

    // Следим за всеми значениями формы для условий
    const formValues = watch();

    // Собираем поля с computedValue (мемоизировано, зависит только от config)
    const computedFields = useMemo(() => {
      const result: Array<{ name: string; config: ComputedValueConfig }> = [];
      for (const group of config.groups) {
        for (const field of group.fields) {
          if (field.computedValue) {
            result.push({ name: field.name, config: field.computedValue });
          }
        }
      }
      return result;
    }, [config.groups]);

    // Вычисляем значения полей при каждом изменении формы
    // Защита от зацикливания: сравниваем с текущим значением перед вызовом setValue
    useEffect(() => {
      if (computedFields.length === 0) return;
      for (const { name, config: cvConfig } of computedFields) {
        const result = evaluateComputedValue(cvConfig, formValues);
        if (result.shouldUpdate && formValues[name] !== result.value) {
          setValue(name, result.value, { shouldValidate: false, shouldDirty: false });
        }
      }
    }, [formValues, computedFields, setValue]);

    // Создаём простую копию объекта touchedFields для дочерних компонентов
    // react-hook-form использует Proxy-объекты, которые могут вызывать проблемы
    // при сравнении зависимостей в хуках React
    // Используем ref для отслеживания предыдущего значения и обновляем только при реальных изменениях ключей
    const touchedFieldsRef = useRef<Record<string, boolean>>({});

    // Безопасно формируем текущее состояние touched
    const currentTouchedKeys: string[] = [];
    try {
      for (const key in touchedFields) {
        if (Object.prototype.hasOwnProperty.call(touchedFields, key) && touchedFields[key]) {
          currentTouchedKeys.push(key);
        }
      }
    } catch {
      // Итерация по Proxy не удалась, сохраняем предыдущее значение
    }

    // Обновляем ref только при реальном изменении touched-полей
    const currentTouchedKey = currentTouchedKeys.sort().join(',');
    const prevTouchedKey = Object.keys(touchedFieldsRef.current).sort().join(',');

    if (currentTouchedKey !== prevTouchedKey) {
      const newTouched: Record<string, boolean> = {};
      for (const key of currentTouchedKeys) {
        newTouched[key] = true;
      }
      touchedFieldsRef.current = newTouched;
    }

    const touchedFieldsSnapshot = touchedFieldsRef.current;

    // Уведомляем родителя об изменениях
    useEffect(() => {
      if (onChange) {
        onChange(formValues);
      }
    }, [formValues, onChange]);

    const handleFormSubmit = (values: FormValues) => {
      if (onSubmit) {
        onSubmit(values);
      }
    };

    const handleButtonSubmit = useCallback(async (button: SubmitButtonConfig, values: FormValues) => {
      setLoadingKey(button.key);
      try {
        const response = await fetch(button.url, {
          method: button.method ?? 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        notification.success({
          message: button.successNotification?.message ?? 'Данные отправлены',
          description: button.successNotification?.description,
        });
        if (button.resetAfterSubmit) {
          reset(mergedDefaultValues);
        }
        onSubmit?.(values);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        notification.error({
          message: button.errorNotification?.message ?? 'Ошибка отправки',
          description: button.errorNotification?.description ?? errorMessage,
        });
      } finally {
        setLoadingKey(null);
      }
    }, [initialValues, onSubmit, reset]);

    const handleSubmitButtonClick = useCallback((button: SubmitButtonConfig) => {
      if (button.requiresValidation) {
        const values = getValues();
        let hasValidationErrors = false;

        for (const group of config.groups) {
          if (!evaluateConditions(group.validateCondition, values)) {
            hasValidationErrors = true;
          }
          for (const field of group.fields) {
            if (!evaluateConditions(field.validateCondition, values)) {
              hasValidationErrors = true;
            }
          }
        }

        if (hasValidationErrors) {
          setForceShowErrors(true);
          return;
        }

        handleButtonSubmit(button, values);
      } else {
        const values = getValues();
        handleButtonSubmit(button, values);
      }
    }, [config.groups, getValues, handleButtonSubmit]);

    // Открываем методы формы через ref
    useImperativeHandle(ref, () => ({
      getValues: () => formValues,
      reset: (values?: FormValues) => reset(values || mergedDefaultValues),
      submit: () => handleSubmit(handleFormSubmit)(),
      setValue: (name: string, value: unknown) => setValue(name, value),
    }));

    const handleReset = useCallback(() => {
      reset(mergedDefaultValues);
    }, [mergedDefaultValues, reset]);

    const sortedGroups = useMemo(
      () => [...config.groups].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      [config.groups],
    );

    const hasButtons = config.buttons !== undefined;

    return (
      <Form
        layout="vertical"
        onFinish={hasButtons ? undefined : handleSubmit(handleFormSubmit)}>
        {/* Рендерим группы полей */}
        {sortedGroups.map((group, index) => (
          <FieldGroup
            key={`${group.name}-${index}`}
            group={group}
            control={control}
            formValues={formValues}
            touchedFields={touchedFieldsSnapshot}
            forceShowErrors={forceShowErrors}
          />
        ))}

        {/* Кнопки действий */}
        {hasButtons ? (
          <FormButtons
            buttons={config.buttons!}
            loadingKey={loadingKey}
            onSubmitClick={handleSubmitButtonClick}
            onResetClick={handleReset}
          />
        ) : (
          <Space style={{ marginTop: 16 }}>
            <Button
              type="primary"
              htmlType="submit">
              Submit
            </Button>
          </Space>
        )}
      </Form>
    );
  },
);

FormGenerator.displayName = 'FormGenerator';
