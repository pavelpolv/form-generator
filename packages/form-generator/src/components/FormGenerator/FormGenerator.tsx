import React, { useEffect, useMemo } from 'react'
import { useForm, useFormState } from 'react-hook-form'
import { Button, Space, Form } from 'antd'
import { FormConfig, FormValues } from '@/types'
import { FieldGroup } from '@/components/FieldGroup'

export interface FormGeneratorRef {
  getValues: () => FormValues
  reset: (values?: FormValues) => void
  submit: () => void
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
export const FormGenerator = React.forwardRef<FormGeneratorRef, FormGeneratorProps>(
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

    // Watch all form values for conditions
    const formValues = watch()

    // Create a plain object copy of touchedFields for child components
    // react-hook-form uses Proxy objects which can cause issues with React's hook dependency comparison
    // We use a ref to track the previous value and only update when keys actually change
    const touchedFieldsRef = React.useRef<Record<string, boolean>>({})

    // Build current touched state safely
    const currentTouchedKeys: string[] = []
    try {
      for (const key in touchedFields) {
        if (Object.prototype.hasOwnProperty.call(touchedFields, key) && touchedFields[key]) {
          currentTouchedKeys.push(key)
        }
      }
    } catch {
      // Proxy iteration failed, keep previous value
    }

    // Update ref only if touched fields actually changed
    const currentTouchedKey = currentTouchedKeys.sort().join(',')
    const prevTouchedKey = Object.keys(touchedFieldsRef.current).sort().join(',')

    if (currentTouchedKey !== prevTouchedKey) {
      const newTouched: Record<string, boolean> = {}
      for (const key of currentTouchedKeys) {
        newTouched[key] = true
      }
      touchedFieldsRef.current = newTouched
    }

    const touchedFieldsSnapshot = touchedFieldsRef.current

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

    const sortedGroups = useMemo(
      () => [...config.groups].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      [config.groups]
    )

    return (
      <Form layout="vertical" onFinish={handleSubmit(handleFormSubmit)}>
        {/* Render groups */}
        {sortedGroups.map((group, index) => (
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

FormGenerator.displayName = 'FormGenerator'
