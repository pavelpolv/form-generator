/**
 * Comparison operators for conditions
 */
export type ComparisonOperator =
  | '<'      // Less than
  | '>'      // Greater than
  | '<='     // Less than or equal
  | '>='     // Greater than or equal
  | '==='    // Strict equality
  | '!=='    // Strict inequality
  | '∅'      // Empty (null, undefined, '', [], {})
  | '!∅'     // Not empty
  | 'includes'   // String/Array contains
  | 'startsWith' // String starts with
  | 'endsWith'   // String ends with
  | 'match'      // Regex match

/**
 * Comparison type for condition groups
 */
export type ComparisonType = 'and' | 'or'

/**
 * Condition value for field comparison
 *
 * @example
 * // Compare with literal value
 * { field: 'age', condition: '>', value: 18 }
 *
 * @example
 * // Compare with another field (use $ prefix)
 * { field: 'password', condition: '===', value: '$confirmPassword' }
 *
 * @example
 * // Check if field is not empty
 * { field: 'email', condition: '!∅', message: 'Email is required' }
 */
export interface ConditionValue {
  /**
   * Field name to read value from (not validated against form fields)
   */
  field: string

  /**
   * Comparison operator
   */
  condition: ComparisonOperator

  /**
   * Value to compare with:
   * - Literal value: string, number, boolean, etc.
   * - Field reference: use $ prefix (e.g., "$otherField")
   * - Not required for ∅ and !∅ operators
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any

  /**
   * Error message to display when validation fails
   * Used only for validateCondition, ignored for visibleCondition and disabledCondition
   */
  message?: string
}

/**
 * Condition group with nested conditions
 *
 * @example
 * // Simple AND group
 * {
 *   comparisonType: 'and',
 *   children: [
 *     { field: 'age', condition: '>=', value: 18 },
 *     { field: 'country', condition: '===', value: 'USA' }
 *   ]
 * }
 *
 * @example
 * // Nested groups
 * {
 *   comparisonType: 'or',
 *   children: [
 *     { field: 'isPremium', condition: '===', value: true },
 *     {
 *       comparisonType: 'and',
 *       children: [
 *         { field: 'age', condition: '>=', value: 18 },
 *         { field: 'hasParentalConsent', condition: '===', value: true }
 *       ]
 *     }
 *   ]
 * }
 */
export interface ConditionGroup {
  /**
   * How to combine children:
   * - 'and': all children must be true
   * - 'or': at least one child must be true
   */
  comparisonType: ComparisonType

  /**
   * Child conditions or nested groups
   */
  children: Array<ConditionGroup | ConditionValue>
}

/**
 * Type guard to check if a condition is a ConditionValue
 */
export function isConditionValue(condition: ConditionGroup | ConditionValue): condition is ConditionValue {
  return 'field' in condition && 'condition' in condition;
}

/**
 * Type guard to check if a condition is a ConditionGroup
 */
export function isConditionGroup(condition: ConditionGroup | ConditionValue): condition is ConditionGroup {
  return 'comparisonType' in condition && 'children' in condition;
}
