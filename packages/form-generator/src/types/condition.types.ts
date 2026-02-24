/**
 * Операторы сравнения для условий
 */
export type ComparisonOperator =
  | '<'      // Меньше
  | '>'      // Больше
  | '<='     // Меньше или равно
  | '>='     // Больше или равно
  | '==='    // Строгое равенство
  | '!=='    // Строгое неравенство
  | '∅'      // Пусто (null, undefined, '', [], {})
  | '!∅'     // Не пусто
  | 'includes'   // Строка/массив содержит
  | 'startsWith' // Строка начинается с
  | 'endsWith'   // Строка заканчивается на
  | 'match'      // Соответствие регулярному выражению

/**
 * Тип сравнения для групп условий
 */
export type ComparisonType = 'and' | 'or'

/**
 * Значение условия для сравнения полей
 *
 * @example
 * // Сравнение с литеральным значением
 * { field: 'age', condition: '>', value: 18 }
 *
 * @example
 * // Сравнение с другим полем (использовать префикс $)
 * { field: 'password', condition: '===', value: '$confirmPassword' }
 *
 * @example
 * // Проверка, что поле не пустое
 * { field: 'email', condition: '!∅', message: 'Email is required' }
 */
export interface ConditionValue {
  /**
   * Имя поля, из которого читается значение (не валидируется по полям формы)
   */
  field: string

  /**
   * Оператор сравнения
   */
  condition: ComparisonOperator

  /**
   * Значение для сравнения:
   * - Литеральное значение: строка, число, булево и т.д.
   * - Ссылка на поле: использовать префикс $ (например, "$otherField")
   * - Не требуется для операторов ∅ и !∅
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any

  /**
   * Сообщение об ошибке при неудачной валидации
   * Используется только для validateCondition, игнорируется для visibleCondition и disabledCondition
   */
  message?: string
}

/**
 * Группа условий с вложенными условиями
 *
 * @example
 * // Простая группа AND
 * {
 *   comparisonType: 'and',
 *   children: [
 *     { field: 'age', condition: '>=', value: 18 },
 *     { field: 'country', condition: '===', value: 'USA' }
 *   ]
 * }
 *
 * @example
 * // Вложенные группы
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
   * Способ объединения дочерних условий:
   * - 'and': все дочерние условия должны быть истинны
   * - 'or': хотя бы одно дочернее условие должно быть истинно
   */
  comparisonType: ComparisonType

  /**
   * Дочерние условия или вложенные группы
   */
  children: Array<ConditionGroup | ConditionValue>
}

/**
 * Предикат типа для проверки, является ли условие ConditionValue
 */
export function isConditionValue(condition: ConditionGroup | ConditionValue): condition is ConditionValue {
  return 'field' in condition && 'condition' in condition;
}

/**
 * Предикат типа для проверки, является ли условие ConditionGroup
 */
export function isConditionGroup(condition: ConditionGroup | ConditionValue): condition is ConditionGroup {
  return 'comparisonType' in condition && 'children' in condition;
}
