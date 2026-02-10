import { ConditionGroup } from './condition.types'

/**
 * Available field types
 * Each type corresponds to a specific field component
 */
export type FieldType = 'input' | 'inputNumber' | 'select' | 'switch' | 'date'

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
 * Union type of all field configurations
 */
export type Field = InputField | InputNumberField | SelectField | SwitchField | DateField
