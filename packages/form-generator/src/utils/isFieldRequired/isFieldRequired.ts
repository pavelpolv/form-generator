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
 * Удаляет из дерева условий все проверки на непустоту (!∅) и,
 * если передано имя поля, все условия ссылающиеся на то же поле
 * (самовалидация — не контекст для определения обязательности).
 * Возвращает null, если после удаления ничего не осталось.
 */
function stripRequiredChecks(
  condition: ConditionGroup | ConditionValue,
  fieldName?: string,
): ConditionGroup | ConditionValue | null {
  if (isConditionValue(condition)) {
    if (condition.condition === '!∅') return null;
    if (fieldName && condition.field === fieldName) return null;
    return condition;
  }

  const filteredChildren = condition.children
    .map((child) => stripRequiredChecks(child, fieldName))
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
  fieldName?: string,
): boolean {
  if (!validateCondition) return false;
  if (!isConditionValue(validateCondition) && !isConditionGroup(validateCondition)) return false;
  if (!containsRequiredCheck(validateCondition)) return false;

  const contextCondition = stripRequiredChecks(validateCondition, fieldName);

  // Все условия были !∅ - поле всегда обязательно
  if (!contextCondition) return true;

  // Для OR-группы: поле обязательно когда контекстные условия НЕ выполняются.
  // Логика: { or: [A, field !∅] } — валидно если A выполнено (field не нужен)
  // или field заполнен. Значит field обязателен только когда A НЕ выполнено.
  if (isConditionGroup(validateCondition) && validateCondition.comparisonType === 'or') {
    return !evaluateConditions(contextCondition, formValues);
  }

  // Для AND-группы: поле обязательно когда контекстные условия выполняются
  return evaluateConditions(contextCondition, formValues);
}
