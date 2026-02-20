import {
  ArithmeticExpression,
  ArithmeticOperator,
  ComputedOperand,
  ComputedResultValue,
  ComputedValueConfig,
  isArithmeticExpression,
} from '@/types';
import { FormValues } from '@/types';
import { evaluateConditions } from '@/utils/evaluateConditions';

/**
 * Resolve an operand: if it's a $fieldRef string, return the form field value;
 * otherwise return the literal value as-is.
 */
function resolveOperand(operand: ComputedOperand, formValues: FormValues): unknown {
  if (typeof operand === 'string' && operand.startsWith('$')) {
    const fieldName = operand.substring(1);
    return formValues[fieldName];
  }
  return operand;
}

/**
 * Evaluate arithmetic expression with two operands.
 * Returns null if operands are invalid or division by zero occurs.
 */
function evaluateArithmetic(expr: ArithmeticExpression, formValues: FormValues): number | null {
  const left = resolveOperand(expr.left, formValues);
  const right = resolveOperand(expr.right, formValues);

  if (left === null || left === undefined || right === null || right === undefined) {
    return null;
  }

  const leftNum = Number(left);
  const rightNum = Number(right);

  if (isNaN(leftNum) || isNaN(rightNum)) {
    console.error('[Form Generator] evaluateComputedValue: non-numeric operands in arithmetic expression', { left, right });
    return null;
  }

  const operator: ArithmeticOperator = expr.operator;

  if (operator === '/' && rightNum === 0) {
    console.error('[Form Generator] evaluateComputedValue: division by zero');
    return null;
  }

  switch (operator) {
  case '+': return leftNum + rightNum;
  case '-': return leftNum - rightNum;
  case '*': return leftNum * rightNum;
  case '/': return leftNum / rightNum;
  }
}

/**
 * Resolve a ComputedResultValue to an actual value using current form values.
 */
function resolveResultValue(resultValue: ComputedResultValue, formValues: FormValues): unknown {
  if (isArithmeticExpression(resultValue)) {
    return evaluateArithmetic(resultValue, formValues);
  }
  return resolveOperand(resultValue, formValues);
}

/**
 * Evaluate computed value configuration against current form values.
 *
 * Iterates through cases and returns the value from the first matching case.
 * Falls back to `default` if no case matches.
 * Returns `{ shouldUpdate: false }` if no case matches and no default is defined.
 */
export function evaluateComputedValue(
  config: ComputedValueConfig,
  formValues: FormValues,
): { shouldUpdate: true; value: unknown } | { shouldUpdate: false } {
  for (const computedCase of config.cases) {
    const matches = evaluateConditions(computedCase.condition, formValues);
    if (matches) {
      return {
        shouldUpdate: true,
        value: resolveResultValue(computedCase.value, formValues),
      };
    }
  }

  if ('default' in config) {
    return {
      shouldUpdate: true,
      value: resolveResultValue(config.default as ComputedResultValue, formValues),
    };
  }

  return { shouldUpdate: false };
}
