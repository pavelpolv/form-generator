import { ConditionGroup, ConditionValue, isConditionValue, isConditionGroup, FormValues } from '@/types';
import { evaluateConditions } from '@/utils/evaluateConditions';

/**
 * Проверяет, содержит ли условие хотя бы одну проверку на непустоту (!∅)
 */
function containsRequiredCheck(condition: ConditionGroup | ConditionValue): boolean {
  if (isConditionValue(condition)) {
    return condition.condition === '!∅';
  }
  return condition.children.some((child) => containsRequiredCheck(child));
}

/**
 * Удаляет из дерева условий все проверки на непустоту (!∅),
 * оставляя только контекстные условия.
 * Возвращает null, если после удаления ничего не осталось.
 */
function stripRequiredChecks(
  condition: ConditionGroup | ConditionValue,
): ConditionGroup | ConditionValue | null {
  if (isConditionValue(condition)) {
    return condition.condition === '!∅' ? null : condition;
  }

  const filteredChildren = condition.children
    .map((child) => stripRequiredChecks(child))
    .filter((c): c is ConditionGroup | ConditionValue => c !== null);

  if (filteredChildren.length === 0) return null;

  return { ...condition, children: filteredChildren };
}

/**
 * Определяет, является ли поле обязательным в текущем контексте.
 *
 * Логика:
 * - Если validateCondition не задан или не содержит !∅ - поле не обязательно
 * - Если validateCondition содержит только !∅ - поле всегда обязательно
 * - Если validateCondition содержит !∅ вместе с другими условиями -
 *   поле обязательно тогда, когда остальные (контекстные) условия выполняются
 *
 * Это позволяет корректно обрабатывать кейсы вида:
 * "ИНН обязателен только если выбран тип 'юридическое лицо'"
 *
 * @example
 * // Всегда обязательно
 * isFieldRequired({ comparisonType: 'and', children: [{ field: 'name', condition: '!∅' }] }, {})
 * // → true
 *
 * @example
 * // Обязательно только когда type === 'business'
 * isFieldRequired({
 *   comparisonType: 'and',
 *   children: [
 *     { field: 'type', condition: '===', value: 'business' },
 *     { field: 'inn', condition: '!∅' },
 *   ]
 * }, { type: 'business' })
 * // → true
 *
 * isFieldRequired(..., { type: 'personal' })
 * // → false
 */
export function isFieldRequired(
  validateCondition: ConditionGroup | ConditionValue | undefined,
  formValues: FormValues,
): boolean {
  if (!validateCondition) return false;
  if (!isConditionValue(validateCondition) && !isConditionGroup(validateCondition)) return false;
  if (!containsRequiredCheck(validateCondition)) return false;

  const contextCondition = stripRequiredChecks(validateCondition);

  // Все условия были !∅ - поле всегда обязательно
  if (!contextCondition) return true;

  // Оцениваем оставшиеся контекстные условия
  return evaluateConditions(contextCondition, formValues);
}
