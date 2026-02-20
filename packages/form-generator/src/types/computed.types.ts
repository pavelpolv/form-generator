import { ConditionGroup, ConditionValue } from './condition.types'

export type ArithmeticOperator = '+' | '-' | '*' | '/'

// Операнд: литерал или '$fieldRef'
export type ComputedOperand = string | number | boolean | null

// Арифметическое выражение
export interface ArithmeticExpression {
  left: ComputedOperand      // литерал или '$fieldName'
  operator: ArithmeticOperator
  right: ComputedOperand     // литерал или '$fieldName'
}

export function isArithmeticExpression(value: ComputedResultValue): value is ArithmeticExpression {
  return value !== null && typeof value === 'object' && 'operator' in value
}

// Что присвоить полю: литерал / $fieldRef / арифметика
export type ComputedResultValue = ComputedOperand | ArithmeticExpression

// Один кейс (первый совпавший выигрывает)
export interface ComputedCase {
  condition: ConditionGroup | ConditionValue  // когда активен
  value: ComputedResultValue                   // что присвоить
}

// Конфиг поля
export interface ComputedValueConfig {
  cases: ComputedCase[]
  default?: ComputedResultValue   // если нет — поле не изменяется
}
