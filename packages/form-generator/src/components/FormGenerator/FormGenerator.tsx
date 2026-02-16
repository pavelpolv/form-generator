import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useForm, useFormState } from 'react-hook-form';
import { Button, Form, Space, notification } from 'antd';
import { FormConfig, FormValues, SubmitButtonConfig } from '@/types';
import { evaluateConditions } from '@/utils';
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
   * Form configuration
   */
  config: FormConfig

  /**
   * Initial form values
   */
  initialValues?: FormValues

  /**
   * Callback when form values change
   */
  onChange?: (values: FormValues) => void

  /**
   * Callback when form is submitted
   */
  onSubmit?: (values: FormValues) => void
}

/**
 * Form Generator Component
 * Main component for rendering dynamic forms based on configuration
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
    const { control, handleSubmit, watch, reset, getValues, setValue } = useForm({
      defaultValues: initialValues,
      mode: 'onBlur', // Validate on blur (first error)
      reValidateMode: 'onChange', // Re-validate on change (if already has error)
    });

    const [loadingKey, setLoadingKey] = useState<string | null>(null);
    const [forceShowErrors, setForceShowErrors] = useState(false);

    // Subscribe to touchedFields changes using useFormState
    // This creates a proper subscription and triggers re-renders when touchedFields change
    const { touchedFields } = useFormState({ control });

    // Watch all form values for conditions
    const formValues = watch();

    // Create a plain object copy of touchedFields for child components
    // react-hook-form uses Proxy objects which can cause issues with React's hook dependency comparison
    // We use a ref to track the previous value and only update when keys actually change
    const touchedFieldsRef = useRef<Record<string, boolean>>({});

    // Build current touched state safely
    const currentTouchedKeys: string[] = [];
    try {
      for (const key in touchedFields) {
        if (Object.prototype.hasOwnProperty.call(touchedFields, key) && touchedFields[key]) {
          currentTouchedKeys.push(key);
        }
      }
    } catch {
      // Proxy iteration failed, keep previous value
    }

    // Update ref only if touched fields actually changed
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

    // Notify parent of changes
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
          reset(initialValues);
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

    // Expose form methods via ref
    useImperativeHandle(ref, () => ({
      getValues: () => formValues,
      reset: (values?: FormValues) => reset(values || initialValues),
      submit: () => handleSubmit(handleFormSubmit)(),
      setValue: (name: string, value: unknown) => setValue(name, value),
    }));

    const handleReset = useCallback(() => {
      reset(initialValues);
    }, [initialValues, reset]);

    const sortedGroups = useMemo(
      () => [...config.groups].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      [config.groups],
    );

    const hasButtons = config.buttons !== undefined;

    return (
      <Form
        layout="vertical"
        onFinish={hasButtons ? undefined : handleSubmit(handleFormSubmit)}>
        {/* Render groups */}
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

        {/* Action buttons */}
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
