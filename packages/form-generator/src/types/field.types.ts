import { ReactNode } from 'react';
import { ConditionGroup } from './condition.types';
import { ComputedValueConfig } from './computed.types';

/**
 * Available field types
 * Each type corresponds to a specific field component
 */
export type FieldType = 'input' | 'inputNumber' | 'select' | 'switch' | 'date' | 'money' | 'textarea' | 'dynamicList'

/**
 * Base field configuration shared by all field types
 */
export interface BaseField {
  /**
   * Unique field name (used as key in form values)
   */
  name: string

  /**
   * Display label for the field
   */
  label: string

  /**
   * Field type
   */
  type: FieldType

  /**
   * Condition to show/hide the field
   * If condition evaluates to false, field is hidden
   */
  visibleCondition?: ConditionGroup

  /**
   * Condition for field validation
   * If condition evaluates to false, validation error is shown
   */
  validateCondition?: ConditionGroup

  /**
   * Condition to enable/disable the field
   * If condition evaluates to true, field is disabled
   */
  disabledCondition?: ConditionGroup

  /**
   * Configuration for automatically computing the field value from other fields
   */
  computedValue?: ComputedValueConfig

  /**
   * Display order (lower values rendered first, default 0)
   */
  order?: number

  /**
   * Placeholder text
   */
  placeholder?: string

  /**
   * Default value for the field
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any
}

/**
 * HTML input type for text-based inputs
 */
export type InputType = 'text' | 'password' | 'email' | 'tel' | 'url' | 'search'

/**
 * Input field specific props
 */
export interface InputFieldProps {
  /**
   * Input type (text, password, email, tel, url, search)
   */
  inputType?: InputType

  /**
   * Maximum length
   */
  maxLength?: number
}

/**
 * Input number field specific props
 */
export interface InputNumberFieldProps {
  /**
   * Minimum value
   */
  min?: number

  /**
   * Maximum value
   */
  max?: number

  /**
   * Step value
   */
  step?: number
}

/**
 * Select field option
 */
export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

/**
 * Select field specific props
 */
export interface SelectFieldProps {
  /**
   * Options for select dropdown
   */
  options: SelectOption[]

  /**
   * Allow multiple selection
   */
  multiple?: boolean

  /**
   * Allow search/filter options
   */
  searchable?: boolean
}

/**
 * Switch field specific props
 */
export interface SwitchFieldProps {
  /**
   * Text to display when switch is on
   */
  checkedText?: string

  /**
   * Text to display when switch is off
   */
  uncheckedText?: string
}

/**
 * Date field specific props
 */
export interface DateFieldProps {
  /**
   * Date format for display
   * @default 'YYYY-MM-DD'
   */
  format?: string

  /**
   * Show time picker
   */
  showTime?: boolean

  /**
   * Disable dates before this date
   */
  disabledDateBefore?: Date

  /**
   * Disable dates after this date
   */
  disabledDateAfter?: Date
}

/**
 * Money field specific props
 */
export interface MoneyFieldProps {
  /**
   * Number of decimal places
   * @default 2
   */
  decimalPlaces?: number

  /**
   * Prefix displayed before the input (e.g. currency symbol)
   */
  prefix?: string

  /**
   * Suffix displayed after the input (e.g. currency code)
   */
  suffix?: string

  /**
   * Allow negative values
   * @default false
   */
  allowNegative?: boolean

  /**
   * Minimum value
   */
  min?: number

  /**
   * Maximum value
   */
  max?: number
}

/**
 * Textarea field specific props
 */
export interface TextareaFieldProps {
  /**
   * Number of visible text rows
   */
  rows?: number

  /**
   * Maximum length
   */
  maxLength?: number

  /**
   * Auto size configuration
   * If true, textarea will auto-resize based on content
   * If object, can specify min and max rows
   */
  autoSize?: boolean | { minRows?: number; maxRows?: number }
}

/**
 * Input field configuration
 */
export interface InputField extends BaseField, InputFieldProps {
  type: 'input'
}

/**
 * Input number field configuration
 */
export interface InputNumberField extends BaseField, InputNumberFieldProps {
  type: 'inputNumber'
}

/**
 * Select field configuration
 */
export interface SelectField extends BaseField, SelectFieldProps {
  type: 'select'
}

/**
 * Switch field configuration
 */
export interface SwitchField extends BaseField, SwitchFieldProps {
  type: 'switch'
}

/**
 * Date field configuration
 */
export interface DateField extends BaseField, DateFieldProps {
  type: 'date'
}

/**
 * Money field configuration
 */
export interface MoneyField extends BaseField, MoneyFieldProps {
  type: 'money'
}

/**
 * Textarea field configuration
 */
export interface TextareaField extends BaseField, TextareaFieldProps {
  type: 'textarea'
}

/**
 * Item field types supported inside dynamicList
 */
export type DynamicListItemField =
  | InputField
  | InputNumberField
  | SelectField
  | SwitchField
  | DateField
  | MoneyField
  | TextareaField

/**
 * Configuration for the "Add" button in a dynamic list field
 */
export interface DynamicListAddButtonConfig {
  /** Button label text. Default: 'Add item' */
  label?: string
  /** Position relative to the list items. Default: 'bottom' */
  position?: 'top' | 'bottom'
  /** Button size (Ant Design). Default: 'middle' */
  size?: 'large' | 'middle' | 'small'
  /** Stretch to full width. Default: true */
  block?: boolean
  /** Custom icon. Default: <PlusOutlined /> */
  icon?: ReactNode
}

/**
 * Dynamic list field specific props
 */
export interface DynamicListFieldProps {
  /**
   * Fields rendered inside each list item
   */
  itemFields: DynamicListItemField[]

  /**
   * Configuration for the "Add" button
   */
  addButton?: DynamicListAddButtonConfig
}

/**
 * Dynamic list field configuration
 */
export interface DynamicListField extends BaseField, DynamicListFieldProps {
  type: 'dynamicList'
}

/**
 * Union type of all field configurations
 */
export type Field = InputField | InputNumberField | SelectField | SwitchField | DateField | MoneyField | TextareaField | DynamicListField
