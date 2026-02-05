import { z } from 'zod'
import { Field } from '@/types'

/**
 * Base field schema shared by all field types
 */
const baseFieldSchema = z.object({
  name: z.string().min(1, 'Field name is required'),
  label: z.string().min(1, 'Field label is required'),
  placeholder: z.string().optional(),
  defaultValue: z.any().optional(),
  visibleCondition: z.any().optional(),
  validateCondition: z.any().optional(),
  disabledCondition: z.any().optional(),
})

/**
 * Input field validation schema
 */
export const inputFieldSchema = baseFieldSchema.extend({
  type: z.literal('input'),
  inputType: z.enum(['text', 'password']).optional(),
  maxLength: z.number().int().positive().optional(),
})

/**
 * Input number field validation schema
 */
export const inputNumberFieldSchema = baseFieldSchema.extend({
  type: z.literal('inputNumber'),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().positive().optional(),
})

/**
 * Select field validation schema
 */
export const selectFieldSchema = baseFieldSchema.extend({
  type: z.literal('select'),
  options: z.array(
    z.object({
      label: z.string().min(1, 'Option label is required'),
      value: z.union([z.string(), z.number()]),
      disabled: z.boolean().optional(),
    })
  ).min(1, 'At least one option is required'),
  multiple: z.boolean().optional(),
  searchable: z.boolean().optional(),
})

/**
 * Switch field validation schema
 */
export const switchFieldSchema = baseFieldSchema.extend({
  type: z.literal('switch'),
  checkedText: z.string().optional(),
  uncheckedText: z.string().optional(),
})

/**
 * Date field validation schema
 */
export const dateFieldSchema = baseFieldSchema.extend({
  type: z.literal('date'),
  format: z.string().optional(),
  showTime: z.boolean().optional(),
  disabledDateBefore: z.string().or(z.date()).optional(),
  disabledDateAfter: z.string().or(z.date()).optional(),
})

/**
 * Validate field config and return error message if invalid
 */
export function validateFieldConfig(config: Field): string | null {
  try {
    switch (config.type) {
      case 'input':
        inputFieldSchema.parse(config)
        break
      case 'inputNumber':
        inputNumberFieldSchema.parse(config)
        break
      case 'select':
        selectFieldSchema.parse(config)
        break
      case 'switch':
        switchFieldSchema.parse(config)
        break
      case 'date':
        dateFieldSchema.parse(config)
        break
      default: {
        const unknownConfig = config as { type: string }
        return `Unknown field type: ${unknownConfig.type}`
      }
    }
    return null
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`).join('; ')
    }
    return String(error)
  }
}
