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
 * Разрешает операнд: если это строка $fieldRef, возвращает значение поля формы;
 * иначе возвращает литеральное значение как есть.
 */
function resolveOperand(operand: ComputedOperand, formValues: FormValues): unknown {
  if (typeof operand === 'string' && operand.startsWith('$')) {
    const fieldName = operand.substring(1);
    return formValues[fieldName];
  }
  return operand;
}

/**
 * Вычисляет арифметическое выражение с двумя операндами.
 * Возвращает null, если операнды некорректны или происходит деление на ноль.
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
 * Разрешает ComputedResultValue в конкретное значение, используя текущие значения формы.
 */
function resolveResultValue(resultValue: ComputedResultValue, formValues: FormValues): unknown {
  if (isArithmeticExpression(resultValue)) {
    return evaluateArithmetic(resultValue, formValues);
  }
  return resolveOperand(resultValue, formValues);
}

/**
 * Вычисляет конфигурацию вычисляемого значения относительно текущих значений формы.
 *
 * Перебирает условия и возвращает значение первого совпавшего.
 * Если ни одно условие не совпало, возвращает значение из `default`.
 * Возвращает `{ shouldUpdate: false }`, если нет совпадений и `default` не задан.
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
