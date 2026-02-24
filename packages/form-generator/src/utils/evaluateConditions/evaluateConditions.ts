import {
  ConditionGroup,
  ConditionValue,
  ComparisonOperator,
  isConditionValue,
  isConditionGroup,
  FormValues,
} from '@/types';

/**
 * Проверяет, является ли значение пустым
 * Пустые значения: null, undefined, '', [], {}
 */
function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Проверяет, является ли значение валидной строкой в формате ISO-даты
 */
function isISODateString(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;

  return isoDateRegex.test(value);
}

/**
 * Возвращает сравниваемое значение для дат или чисел
 * Обрабатывает строки в формате ISO-даты и числа
 */
function getComparableValue(value: unknown): number {
  // Если значение — строка в формате ISO-даты, преобразуем в timestamp
  if (isISODateString(value)) {
    return new Date(value).getTime();
  }
  // Иначе преобразуем в число
  return Number(value);
}

/**
 * Возвращает значение поля; поддерживает префикс $ для ссылок на поля
 */
function getFieldValue(value: unknown, formValues: FormValues): unknown {
  // Если значение — строка, начинающаяся с $, трактуем её как ссылку на поле
  if (typeof value === 'string' && value.startsWith('$')) {
    const fieldName = value.substring(1);

    return formValues[fieldName];
  }
  return value;
}

/**
 * Сравнивает два значения по заданному оператору
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
 * Вычисляет результат отдельного условия
 */
function evaluateConditionValue(
  condition: ConditionValue,
  formValues: FormValues,
): boolean {
  const { field, condition: operator, value } = condition;

  // Получаем значение поля (не ошибаемся, если поле отсутствует)
  const fieldValue = formValues[field];

  // Получаем значение для сравнения (разрешаем ссылки на поля через $)
  const comparisonValue = getFieldValue(value, formValues);

  return compareValues(fieldValue, operator, comparisonValue);
}

/**
 * Рекурсивно вычисляет результат группы условий
 */
function evaluateConditionGroupInternal(
  group: ConditionGroup,
  formValues: FormValues,
  depth: number = 0,
): boolean {
  // Защита от циклических зависимостей
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
 * Вычисляет условие (группу или значение) относительно текущих значений формы
 *
 * @param condition - Условие для вычисления (ConditionGroup или ConditionValue)
 * @param formValues - Текущие значения формы (плоская структура)
 * @returns true если условие выполнено, false в противном случае
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
  // Если условие не задано, возвращаем true (нет ограничений)
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
 * Собирает все сообщения об ошибках валидации из условия
 * Используется для отображения ошибок при невыполнении validateCondition
 *
 * @param condition - Условие для проверки
 * @param formValues - Текущие значения формы
 * @returns Массив сообщений об ошибках из невыполненных условий
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
      // Для групп 'and' собираем все невыполненные условия
      // Для групп 'or' собираем только если ВСЕ условия не выполнены
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
        // Собираем сообщения из дочерних элементов
        cond.children.forEach((child, index) => {
          if (cond.comparisonType === 'and') {
            // Для 'and' собираем из невыполненных условий
            if (!allResults[index]) {
              collect(child);
            }
          } else {
            // Для 'or' собираем из всех, если группа не выполнена
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
 * Собирает все имена полей, на которые ссылается условие
 * Используется для проверки, были ли затронуты все поля в условии валидации
 *
 * @param condition - Условие для анализа
 * @returns Массив имён полей, упоминаемых в условии
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
      // Добавляем имя поля
      if (cond.field) {
        fieldNames.push(cond.field);
      }
      // Проверяем, ссылается ли значение на другое поле (начинается с $)
      if (typeof cond.value === 'string' && cond.value.startsWith('$')) {
        const referencedField = cond.value.substring(1);
        fieldNames.push(referencedField);
      }
    } else if (isConditionGroup(cond)) {
      // Рекурсивно собираем из дочерних элементов
      cond.children.forEach((child) => {
        collect(child);
      });
    }
  }

  try {
    collect(condition);
    // Возвращаем уникальные имена полей
    return [...new Set(fieldNames)];
  } catch (error) {
    console.error('[Form Generator] Error collecting fields from condition:', error);
    return [];
  }
}
