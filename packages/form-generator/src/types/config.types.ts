import { ConditionGroup } from './condition.types'
import { Field } from './field.types'

/**
 * Field group configuration
 * Groups fields together with a visual border and title
 */
export interface GroupField {
  /**
   * Group name/title displayed in the UI
   */
  name: string

  /**
   * Show group title
   * @default true
   */
  showTitle?: boolean

  /**
   * Show group border
   * @default true
   */
  showBorder?: boolean

  /**
   * Condition to show/hide the entire group
   * If condition evaluates to false, group and all its fields are hidden
   */
  visibleCondition?: ConditionGroup

  /**
   * Condition for group validation
   * If condition evaluates to false, validation error is shown for the group
   */
  validateCondition?: ConditionGroup

  /**
   * Display order (lower values rendered first, default 0)
   */
  order?: number

  /**
   * Fields contained in this group
   */
  fields: Field[]
}

/**
 * Complete form configuration
 */
export interface FormConfig {
  /**
   * Array of field groups
   * Groups are rendered vertically in order
   */
  groups: GroupField[]
}

/**
 * Form values structure (flat)
 * Keys are field names, values are field values
 *
 * @example
 * {
 *   firstName: 'John',
 *   age: 25,
 *   isActive: true,
 *   birthDate: '1999-01-01'
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormValues = Record<string, any>
