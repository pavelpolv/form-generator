import React, { useMemo } from 'react'
import { Card } from 'antd'
import { Control } from 'react-hook-form'
import { GroupField, FormValues, Field } from '@/types'
import { evaluateConditions, collectValidationMessages, collectFieldsFromCondition } from '@/utils'
import { FieldRenderer } from '@/components/FieldRenderer'

/**
 * Memoized field wrapper to prevent unnecessary re-calculations of conditions
 */
interface MemoizedFieldProps {
  field: Field
  control: Control<FormValues>
  formValues: FormValues
  touchedFields: Record<string, boolean | undefined>
}

const MemoizedField: React.FC<MemoizedFieldProps> = React.memo(
  ({ field, control, formValues, touchedFields }) => {
    // Memoize visibility check
    const isFieldVisible = useMemo(
      () => evaluateConditions(field.visibleCondition, formValues),
      [field.visibleCondition, formValues]
    )

    // Memoize validation check
    const isFieldValid = useMemo(
      () => evaluateConditions(field.validateCondition, formValues),
      [field.validateCondition, formValues]
    )

    // Memoize disabled check
    const isFieldDisabled = useMemo(
      () => field.disabledCondition
        ? evaluateConditions(field.disabledCondition, formValues)
        : false,
      [field.disabledCondition, formValues]
    )

    // Memoize validation messages
    const isFieldTouched = touchedFields[field.name]
    const fieldValidationMessages = useMemo(
      () => {
        if (isFieldValid || !isFieldTouched) return undefined
        return collectValidationMessages(field.validateCondition, formValues).join(', ')
      },
      [isFieldValid, isFieldTouched, field.validateCondition, formValues]
    )

    if (!isFieldVisible) {
      return null
    }

    return (
      <FieldRenderer
        key={field.name}
        field={field}
        control={control}
        error={fieldValidationMessages}
        disabled={isFieldDisabled}
      />
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison - only re-render if relevant data changed
    if (prevProps.field !== nextProps.field) return false
    if (prevProps.control !== nextProps.control) return false
    if (prevProps.formValues !== nextProps.formValues) return false

    // Only compare touched state for this specific field
    const fieldName = prevProps.field.name
    if (Boolean(prevProps.touchedFields[fieldName]) !== Boolean(nextProps.touchedFields[fieldName])) {
      return false
    }

    return true
  }
)

MemoizedField.displayName = 'MemoizedField'

interface FieldGroupProps {
  group: GroupField
  control: Control<FormValues>
  formValues: FormValues
  touchedFields: Record<string, boolean | undefined>
}

/**
 * Custom comparison function for React.memo
 */
const arePropsEqual = (
  prevProps: FieldGroupProps,
  nextProps: FieldGroupProps
): boolean => {
  if (prevProps.group !== nextProps.group) return false
  if (prevProps.control !== nextProps.control) return false
  if (prevProps.formValues !== nextProps.formValues) return false

  const prevTouched = prevProps.touchedFields
  const nextTouched = nextProps.touchedFields
  const allKeys = new Set([
    ...Object.keys(prevTouched),
    ...Object.keys(nextTouched),
  ])

  for (const key of allKeys) {
    if (Boolean(prevTouched[key]) !== Boolean(nextTouched[key])) {
      return false
    }
  }

  return true
}

/**
 * Field group component with optimized field rendering
 */
export const FieldGroup: React.FC<FieldGroupProps> = React.memo(
  ({ group, control, formValues, touchedFields }) => {
    const { name, showTitle = true, showBorder = true, visibleCondition, validateCondition, fields } = group

    const sortedFields = useMemo(
      () => [...fields].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      [fields]
    )

    const isVisible = useMemo(
      () => evaluateConditions(visibleCondition, formValues),
      [visibleCondition, formValues]
    )

    const isValid = useMemo(
      () => evaluateConditions(validateCondition, formValues),
      [validateCondition, formValues]
    )

    const validationMessages = useMemo(
      () => {
        if (isValid) return []
        return collectValidationMessages(validateCondition, formValues)
      },
      [isValid, validateCondition, formValues]
    )

    const allValidationFieldsTouched = useMemo(() => {
      if (!validateCondition) return true
      const fieldsInValidation = collectFieldsFromCondition(validateCondition)
      return fieldsInValidation.every(fieldName => touchedFields[fieldName])
    }, [validateCondition, touchedFields])

    if (!isVisible) {
      return null
    }

    const groupContent = (
      <>
        {/* Render fields using MemoizedField for better performance */}
        {sortedFields.map((field) => (
          <MemoizedField
            key={field.name}
            field={field}
            control={control}
            formValues={formValues}
            touchedFields={touchedFields}
          />
        ))}

        {!isValid && validationMessages.length > 0 && allValidationFieldsTouched && (
          <div style={{
            color: '#ff4d4f',
            fontSize: '12px',
            marginTop: '8px',
            lineHeight: '1.5'
          }}>
            {validationMessages.map((msg, idx) => (
              <div key={idx}>{msg}</div>
            ))}
          </div>
        )}
      </>
    )

    const showGroupError = !isValid && allValidationFieldsTouched

    if (showBorder) {
      return (
        <Card
          title={showTitle ? name : undefined}
          style={{
            marginBottom: 24,
            borderColor: showGroupError ? '#ff4d4f' : undefined,
          }}
          className={showGroupError ? 'has-error' : ''}
        >
          {groupContent}
        </Card>
      )
    }

    return (
      <div style={{ marginBottom: 24 }}>
        {showTitle && (
          <div style={{
            fontSize: '16px',
            fontWeight: 600,
            marginBottom: '16px',
            color: showGroupError ? '#ff4d4f' : undefined,
          }}>
            {name}
          </div>
        )}
        {groupContent}
      </div>
    )
  },
  arePropsEqual
)

FieldGroup.displayName = 'FieldGroup'
