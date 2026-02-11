import {
  ConditionGroup,
  ConditionValue,
  ComparisonOperator,
  isConditionValue,
  isConditionGroup,
  FormValues,
} from '@/types';

/**
 * Check if a value is empty
 * Empty values: null, undefined, '', [], {}
 */
function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Check if a value is a valid ISO date string
 */
function isISODateString(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;

  return isoDateRegex.test(value);
}

/**
 * Get comparable value for date or number comparisons
 * Handles ISO date strings and numbers
 */
function getComparableValue(value: unknown): number {
  // If it's an ISO date string, convert to timestamp
  if (isISODateString(value)) {
    return new Date(value).getTime();
  }
  // Otherwise convert to number
  return Number(value);
}

/**
 * Get field value, supports $ prefix for field references
 */
function getFieldValue(value: unknown, formValues: FormValues): unknown {
  // If value is a string starting with $, treat it as a field reference
  if (typeof value === 'string' && value.startsWith('$')) {
    const fieldName = value.substring(1);

    return formValues[fieldName];
  }
  return value;
}

/**
 * Compare two values based on operator
 */
// eslint-disable-next-line complexity
function compareValues(
  leftValue: unknown,
  operator: ComparisonOperator,
  rightValue: unknown,
): boolean {
  try {
    switch (operator) {
    case '<':
      return getComparableValue(leftValue) < getComparableValue(rightValue);

    case '>':
      return getComparableValue(leftValue) > getComparableValue(rightValue);

    case '<=':
      return getComparableValue(leftValue) <= getComparableValue(rightValue);

    case '>=':
      return getComparableValue(leftValue) >= getComparableValue(rightValue);

    case '===':
      return leftValue === rightValue;

    case '!==':
      return leftValue !== rightValue;

    case '∅':
      return isEmpty(leftValue);

    case '!∅':
      return !isEmpty(leftValue);

    case 'includes':
      if (typeof leftValue === 'string' && typeof rightValue === 'string') {
        return leftValue.includes(rightValue);
      }
      if (Array.isArray(leftValue)) {
        return leftValue.includes(rightValue);
      }
      return false;

    case 'startsWith':
      if (typeof leftValue === 'string' && typeof rightValue === 'string') {
        return leftValue.startsWith(rightValue);
      }
      return false;

    case 'endsWith':
      if (typeof leftValue === 'string' && typeof rightValue === 'string') {
        return leftValue.endsWith(rightValue);
      }
      return false;

    case 'match':
      if (typeof leftValue === 'string' && typeof rightValue === 'string') {
        try {
          const regex = new RegExp(rightValue);

          return regex.test(leftValue);
        } catch (e) {
          console.error(`[Form Generator] Invalid regex pattern: ${rightValue}`, e);
          return false;
        }
      }
      return false;

    default:
      console.error(`[Form Generator] Unknown operator: ${operator}`);
      return false;
    }
  } catch (error) {
    console.error('[Form Generator] Error comparing values:', error, {
      leftValue,
      operator,
      rightValue,
    });
    return false;
  }
}

/**
 * Evaluate a single condition value
 */
function evaluateConditionValue(
  condition: ConditionValue,
  formValues: FormValues,
): boolean {
  const { field, condition: operator, value } = condition;

  // Check if field exists in form values (but don't fail if it doesn't)
  const fieldValue = formValues[field];

  // Get the comparison value (resolve field references with $)
  const comparisonValue = getFieldValue(value, formValues);

  return compareValues(fieldValue, operator, comparisonValue);
}

/**
 * Evaluate a condition group recursively
 */
function evaluateConditionGroupInternal(
  group: ConditionGroup,
  formValues: FormValues,
  depth: number = 0,
): boolean {
  // Protect against circular dependencies
  if (depth > 50) {
    console.error('[Form Generator] Maximum condition depth exceeded. Possible circular dependency.');
    return false;
  }

  const { comparisonType, children } = group;

  if (!children || children.length === 0) {
    console.error('[Form Generator] ConditionGroup has no children');
    return false;
  }

  const results = children.map((child) => {
    if (isConditionValue(child)) {
      return evaluateConditionValue(child, formValues);
    } else if (isConditionGroup(child)) {
      return evaluateConditionGroupInternal(child, formValues, depth + 1);
    } else {
      console.error('[Form Generator] Invalid child in ConditionGroup:', child);
      return false;
    }
  });

  if (comparisonType === 'and') {
    return results.every((result) => result === true);
  } else if (comparisonType === 'or') {
    return results.some((result) => result === true);
  } else {
    console.error(`[Form Generator] Unknown comparisonType: ${comparisonType}`);
    return false;
  }
}

/**
 * Evaluate a condition (group or value) against form values
 *
 * @param condition - Condition to evaluate (ConditionGroup or ConditionValue)
 * @param formValues - Current form values (flat structure)
 * @returns true if condition passes, false otherwise
 *
 * @example
 * const condition = {
 *   comparisonType: 'and',
 *   children: [
 *     { field: 'age', condition: '>=', value: 18 },
 *     { field: 'email', condition: '!∅' }
 *   ]
 * }
 * const formValues = { age: 25, email: 'test@example.com' }
 * evaluateConditions(condition, formValues) // true
 */
export function evaluateConditions(
  condition: ConditionGroup | ConditionValue | undefined,
  formValues: FormValues,
): boolean {
  // If no condition is provided, return true (no restrictions)
  if (!condition) {
    return true;
  }

  try {
    if (isConditionValue(condition)) {
      return evaluateConditionValue(condition, formValues);
    } else if (isConditionGroup(condition)) {
      return evaluateConditionGroupInternal(condition, formValues);
    } else {
      console.error('[Form Generator] Invalid condition:', condition);
      return false;
    }
  } catch (error) {
    console.error('[Form Generator] Error evaluating condition:', error, condition);
    return false;
  }
}

/**
 * Collect all validation error messages from a condition
 * Used to display validation errors when validateCondition fails
 *
 * @param condition - Condition to check
 * @param formValues - Current form values
 * @returns Array of error messages from failed conditions
 */
export function collectValidationMessages(
  condition: ConditionGroup | ConditionValue | undefined,
  formValues: FormValues,
): string[] {
  if (!condition) {
    return [];
  }

  const messages: string[] = [];

  function collect(cond: ConditionGroup | ConditionValue): void {
    if (isConditionValue(cond)) {
      const passed = evaluateConditionValue(cond, formValues);
      if (!passed && cond.message) {
        messages.push(cond.message);
      }
    } else if (isConditionGroup(cond)) {
      // For 'and' groups, collect all failing conditions
      // For 'or' groups, only collect if ALL conditions fail
      const allResults = cond.children.map((child) => {
        if (isConditionValue(child)) {
          return evaluateConditionValue(child, formValues);
        } else if (isConditionGroup(child)) {
          return evaluateConditionGroupInternal(child, formValues);
        }
        return false;
      });

      const groupPassed = cond.comparisonType === 'and'
        ? allResults.every((r) => r)
        : allResults.some((r) => r);

      if (!groupPassed) {
        // Collect messages from children
        cond.children.forEach((child, index) => {
          if (cond.comparisonType === 'and') {
            // For 'and', collect from failed conditions
            if (!allResults[index]) {
              collect(child);
            }
          } else {
            // For 'or', collect from all if group failed
            collect(child);
          }
        });
      }
    }
  }

  try {
    collect(condition);
  } catch (error) {
    console.error('[Form Generator] Error collecting validation messages:', error);
  }

  return messages;
}

/**
 * Collect all field names referenced in a condition
 * Used to check if all fields in a validation condition have been touched
 *
 * @param condition - Condition to analyze
 * @returns Array of field names referenced in the condition
 */
export function collectFieldsFromCondition(
  condition: ConditionGroup | ConditionValue | undefined,
): string[] {
  if (!condition) {
    return [];
  }

  const fieldNames: string[] = [];

  function collect(cond: ConditionGroup | ConditionValue): void {
    if (isConditionValue(cond)) {
      // Add the field name
      if (cond.field) {
        fieldNames.push(cond.field);
      }
      // Also check if the value references another field (starts with $)
      if (typeof cond.value === 'string' && cond.value.startsWith('$')) {
        const referencedField = cond.value.substring(1);
        fieldNames.push(referencedField);
      }
    } else if (isConditionGroup(cond)) {
      // Recursively collect from children
      cond.children.forEach((child) => {
        collect(child);
      });
    }
  }

  try {
    collect(condition);
    // Return unique field names
    return [...new Set(fieldNames)];
  } catch (error) {
    console.error('[Form Generator] Error collecting fields from condition:', error);
    return [];
  }
}
