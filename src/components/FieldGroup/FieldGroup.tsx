import React, { useMemo } from 'react'
import { Card } from 'antd'
import { Control } from 'react-hook-form'
import { GroupField, FormValues } from '@/types'
import { evaluateConditions, collectValidationMessages, collectFieldsFromCondition } from '@/utils'
import { FieldRenderer } from '@/components/FieldRenderer'

interface FieldGroupProps {
  group: GroupField
  control: Control<any>
  formValues: FormValues
  touchedFields: Record<string, any>
}

/**
 * Custom comparison function for React.memo
 * Performs deep comparison of touchedFields to detect when new fields are touched
 */
const arePropsEqual = (
  prevProps: FieldGroupProps,
  nextProps: FieldGroupProps
): boolean => {
  // Always re-render if group or control changed
  if (prevProps.group !== nextProps.group) return false
  if (prevProps.control !== nextProps.control) return false

  // Compare formValues by reference (they change on every update anyway)
  if (prevProps.formValues !== nextProps.formValues) return false

  // Deep compare touchedFields - check if the touched state of relevant fields changed
  const prevTouched = prevProps.touchedFields
  const nextTouched = nextProps.touchedFields

  // Get all keys from both objects
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
 * Field group component
 * Renders a group of fields with optional border and title
 * Handles visibility and validation conditions for the group
 */
export const FieldGroup: React.FC<FieldGroupProps> = React.memo(
  ({ group, control, formValues, touchedFields }) => {
    const { name, showTitle = true, showBorder = true, visibleCondition, validateCondition, fields } = group

    // Check if group should be visible
    const isVisible = useMemo(
      () => evaluateConditions(visibleCondition, formValues),
      [visibleCondition, formValues]
    )

    // Check if group validation passes
    const isValid = useMemo(
      () => evaluateConditions(validateCondition, formValues),
      [validateCondition, formValues]
    )

    // Collect validation error messages
    const validationMessages = useMemo(
      () => {
        if (isValid) return []
        return collectValidationMessages(validateCondition, formValues)
      },
      [isValid, validateCondition, formValues]
    )

    // Check if all fields in group validation have been touched
    const allValidationFieldsTouched = useMemo(() => {
      if (!validateCondition) return true
      const fieldsInValidation = collectFieldsFromCondition(validateCondition)
      return fieldsInValidation.every(fieldName => touchedFields[fieldName])
    }, [validateCondition, touchedFields])

    // Don't render if not visible
    if (!isVisible) {
      return null
    }

    const groupContent = (
      <>
        {/* Render fields */}
        {fields.map((field) => {
          // Check if field should be visible
          const isFieldVisible = evaluateConditions(
            field.visibleCondition,
            formValues
          )

          if (!isFieldVisible) {
            return null
          }

          // Check if field validation passes
          const isFieldValid = evaluateConditions(
            field.validateCondition,
            formValues
          )

          // Collect field validation messages
          // Only show errors if field has been touched
          const isFieldTouched = touchedFields[field.name]
          const fieldValidationMessages = isFieldValid || !isFieldTouched
            ? undefined
            : collectValidationMessages(field.validateCondition, formValues).join(', ')

          // Check if field should be disabled
          // Only evaluate if disabledCondition exists, otherwise field is enabled
          const isFieldDisabled = field.disabledCondition
            ? evaluateConditions(field.disabledCondition, formValues)
            : false

          return (
            <FieldRenderer
              key={field.name}
              field={field}
              control={control}
              error={fieldValidationMessages}
              disabled={isFieldDisabled}
            />
          )
        })}

        {/* Show group validation errors below fields */}
        {/* Only show if validation fails AND all fields in validation have been touched */}
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

    // Determine if group should show error state
    const showGroupError = !isValid && allValidationFieldsTouched

    // If showBorder is true, wrap in Card
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

    // If showBorder is false, render without Card
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
