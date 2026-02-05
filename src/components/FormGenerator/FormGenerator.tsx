import React, { useEffect, useMemo } from 'react'
import { useForm, useFormState } from 'react-hook-form'
import { Button, Space, Form } from 'antd'
import { FormConfig, FormValues } from '@/types'
import { FieldGroup } from '@/components/FieldGroup'

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

  /**
   * Show submit button
   * @default true
   */
  showSubmitButton?: boolean

  /**
   * Submit button text
   * @default 'Submit'
   */
  submitButtonText?: string

  /**
   * Show reset button
   * @default false
   */
  showResetButton?: boolean

  /**
   * Reset button text
   * @default 'Reset'
   */
  resetButtonText?: string
}

/**
 * Form Generator Component
 * Main component for rendering dynamic forms based on configuration
 */
export const FormGenerator = React.forwardRef<any, FormGeneratorProps>(
  (
    {
      config,
      initialValues = {},
      onChange,
      onSubmit,
      showSubmitButton = true,
      submitButtonText = 'Submit',
      showResetButton = false,
      resetButtonText = 'Reset',
    },
    ref
  ) => {
    const { control, handleSubmit, watch, reset } = useForm({
      defaultValues: initialValues,
      mode: 'onBlur', // Validate on blur (first error)
      reValidateMode: 'onChange', // Re-validate on change (if already has error)
    })

    // Subscribe to touchedFields changes using useFormState
    // This creates a proper subscription and triggers re-renders when touchedFields change
    const { touchedFields } = useFormState({ control })

    // Watch all form values for co nditions
    const formValues = watch()

    // Create a new touchedFields object reference when fields change
    // This ensures child components detect the change
    const touchedFieldsSnapshot = useMemo(
      () => ({ ...touchedFields }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [JSON.stringify(touchedFields)]
    )

    // Notify parent of changes
    useEffect(() => {
      if (onChange) {
        onChange(formValues)
      }
    }, [formValues, onChange])

    // Expose form methods via ref
    React.useImperativeHandle(ref, () => ({
      getValues: () => formValues,
      reset: (values?: FormValues) => reset(values || initialValues),
      submit: () => handleSubmit(handleFormSubmit)(),
    }))

    const handleFormSubmit = (values: FormValues) => {
      if (onSubmit) {
        onSubmit(values)
      }
    }

    const handleReset = () => {
      reset(initialValues)
    }

    return (
      <Form layout="vertical" onFinish={handleSubmit(handleFormSubmit)}>
        {/* Render groups */}
        {config.groups.map((group, index) => (
          <FieldGroup
            key={`${group.name}-${index}`}
            group={group}
            control={control}
            formValues={formValues}
            touchedFields={touchedFieldsSnapshot}
          />
        ))}

        {/* Action buttons */}
        {(showSubmitButton || showResetButton) && (
          <Space style={{ marginTop: 16 }}>
            {showSubmitButton && (
              <Button type="primary" htmlType="submit">
                {submitButtonText}
              </Button>
            )}
            {showResetButton && (
              <Button onClick={handleReset}>
                {resetButtonText}
              </Button>
            )}
          </Space>
        )}
      </Form>
    )
  }
)
