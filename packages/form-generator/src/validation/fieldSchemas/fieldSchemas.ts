import { z } from 'zod';

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
  order: z.number().optional(),
});

/**
 * Input field validation schema
 */
export const inputFieldSchema = baseFieldSchema.extend({
  type: z.literal('input'),
  inputType: z.enum(['text', 'password', 'email', 'tel', 'url', 'search']).optional(),
  maxLength: z.number().int().positive().optional(),
});

/**
 * Input number field validation schema
 */
export const inputNumberFieldSchema = baseFieldSchema.extend({
  type: z.literal('inputNumber'),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().positive().optional(),
});

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
    }),
  ).min(1, 'At least one option is required'),
  multiple: z.boolean().optional(),
  searchable: z.boolean().optional(),
});

/**
 * Switch field validation schema
 */
export const switchFieldSchema = baseFieldSchema.extend({
  type: z.literal('switch'),
  checkedText: z.string().optional(),
  uncheckedText: z.string().optional(),
});

/**
 * Date field validation schema
 */
export const dateFieldSchema = baseFieldSchema.extend({
  type: z.literal('date'),
  format: z.string().optional(),
  showTime: z.boolean().optional(),
  disabledDateBefore: z.string().or(z.date()).optional(),
  disabledDateAfter: z.string().or(z.date()).optional(),
});

/**
 * Money field validation schema
 */
export const moneyFieldSchema = baseFieldSchema.extend({
  type: z.literal('money'),
  decimalPlaces: z.number().int().min(0).optional(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  allowNegative: z.boolean().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
});

/**
 * Textarea field validation schema
 */
export const textareaFieldSchema = baseFieldSchema.extend({
  type: z.literal('textarea'),
  rows: z.number().int().positive().optional(),
  maxLength: z.number().int().positive().optional(),
  autoSize: z.union([
    z.boolean(),
    z.object({
      minRows: z.number().int().positive().optional(),
      maxRows: z.number().int().positive().optional(),
    }),
  ]).optional(),
});

/**
 * Dynamic list field validation schema
 */
export const dynamicListFieldSchema = baseFieldSchema.extend({
  type: z.literal('dynamicList'),
  itemFields: z.array(z.any()).min(1, 'At least one item field is required'),
  addButton: z.object({
    label: z.string().optional(),
    position: z.enum(['top', 'bottom']).optional(),
    size: z.enum(['large', 'middle', 'small']).optional(),
    block: z.boolean().optional(),
    icon: z.any().optional(),
  }).optional(),
});

/**
 * Validate field config and return error message if invalid
 * Accepts unknown input for runtime validation
 */
export function validateFieldConfig(config: unknown): string | null {
  if (typeof config !== 'object' || config === null) {
    return 'Config must be an object';
  }

  const fieldConfig = config as { type?: unknown };
  if (typeof fieldConfig.type !== 'string') {
    return 'Config must have a type property';
  }

  try {
    switch (fieldConfig.type) {
    case 'input':
      inputFieldSchema.parse(config);
      break;
    case 'inputNumber':
      inputNumberFieldSchema.parse(config);
      break;
    case 'select':
      selectFieldSchema.parse(config);
      break;
    case 'switch':
      switchFieldSchema.parse(config);
      break;
    case 'date':
      dateFieldSchema.parse(config);
      break;
    case 'money':
      moneyFieldSchema.parse(config);
      break;
    case 'textarea':
      textareaFieldSchema.parse(config);
      break;
    case 'dynamicList':
      dynamicListFieldSchema.parse(config);
      break;
    default:
      return `Unknown field type: ${fieldConfig.type}`;
    }
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`).join('; ');
    }
    return String(error);
  }
}
