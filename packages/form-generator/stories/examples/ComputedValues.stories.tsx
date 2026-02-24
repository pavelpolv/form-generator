import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { FormGenerator } from '@/components/FormGenerator'
import { FormConfig } from '@/types'

const meta: Meta<typeof FormGenerator> = {
  title: 'Examples/Computed Values',
  component: FormGenerator,
  parameters: {
    layout: 'padded',
  },
  args: {
    onSubmit: fn(),
  },
}

export default meta
type Story = StoryObj<typeof FormGenerator>

/**
 * ConditionalSubstitution демонстрирует функцию `computedValue` с условной подстановкой значений.
 *
 * Поле `orderType` вычисляется автоматически на основе других значений формы:
 *
 * ```ts
 * computedValue: {
 *   // `cases` — массив пар { condition, value }.
 *   // Побеждает первое совпавшее условие.
 *   cases: [
 *     {
 *       // `condition` принимает ConditionGroup или ConditionValue (аналогично visibleCondition)
 *       condition: {
 *         comparisonType: 'and',
 *         children: [
 *           { field: 'category', condition: '===', value: 'B' },
 *           { field: 'enabled', condition: '===', value: true },
 *         ],
 *       },
 *       // `value` присваивается при совпадении условия.
 *       // Может быть литералом (string, number, boolean, null) или '$fieldRef'.
 *       value: 'manual',
 *     },
 *   ],
 *   // `default` используется, когда ни одно условие не совпало.
 *   // Отсутствие `default` означает, что значение поля остаётся без изменений.
 *   default: 'auto',
 * }
 * ```
 *
 * Попробуйте: выберите категорию **B**, затем переключите свитч — `orderType` переключится на `manual`.
 * Выключите свитч или смените категорию — значение вернётся к `auto`.
 */
export const ConditionalSubstitution: Story = {
  args: {
    config: {
      groups: [
        {
          name: 'Настройки заказа',
          fields: [
            {
              type: 'select',
              name: 'category',
              label: 'Категория',
              placeholder: 'Выберите категорию',
              options: [
                { label: 'Категория A', value: 'A' },
                { label: 'Категория B', value: 'B' },
                { label: 'Категория C', value: 'C' },
              ],
              defaultValue: 'A',
            },
            {
              type: 'switch',
              name: 'enabled',
              label: 'Включить ручное управление',
              checkedText: 'Вкл',
              uncheckedText: 'Выкл',
              defaultValue: false,
            },
            {
              type: 'select',
              name: 'orderType',
              label: 'Тип заказа (вычисляемый)',
              options: [
                { label: 'Авто', value: 'auto' },
                { label: 'Пользователь', value: 'user' },
                { label: 'Вручную', value: 'manual' },
              ],
              defaultValue: 'auto',
              disabledCondition: {
                comparisonType: 'or',
                children: [
                  { field: 'orderType', condition: '!∅' },
                ],
              },
              computedValue: {
                cases: [
                  {
                    condition: {
                      comparisonType: 'and',
                      children: [
                        { field: 'category', condition: '===', value: 'B' },
                        { field: 'enabled', condition: '===', value: true },
                      ],
                    },
                    value: 'manual',
                  },
                ],
                default: 'auto',
              },
            },
          ],
        },
      ],
    } satisfies FormConfig,
  },
}

/**
 * ArithmeticComputation демонстрирует функцию `computedValue` с арифметическими выражениями.
 *
 * Поле `result` автоматически вычисляется как `value1 * value2`, когда `enabled` равно true:
 *
 * ```ts
 * computedValue: {
 *   cases: [
 *     {
 *       condition: { field: 'enabled', condition: '===', value: true },
 *       // `value` может быть ArithmeticExpression: { left, operator, right }
 *       // `operator` — одно из: '+' | '-' | '*' | '/'
 *       // `left` и `right` — ComputedOperand: string | number | boolean | null
 *       // Строковые операнды, начинающиеся с '$', разрешаются как ссылки на поля.
 *       value: { left: '$value1', operator: '*', right: '$value2' },
 *     },
 *   ],
 *   // Когда `enabled` равно false, результат устанавливается в null.
 *   // Примечание: арифметика с null/undefined операндами также возвращает null.
 *   default: null,
 * }
 * ```
 *
 * Попробуйте: установите **value1** = 3, **value2** = 4, затем включите **enabled** — `result` станет 12.
 * Выключите — `result` будет очищен (null).
 */
export const ArithmeticComputation: Story = {
  args: {
    config: {
      groups: [
        {
          name: 'Калькулятор',
          fields: [
            {
              type: 'select',
              name: 'value1',
              label: 'Значение 1',
              options: Array.from({ length: 11 }, (_, i) => ({ label: String(i), value: i })),
              defaultValue: 0,
            },
            {
              type: 'inputNumber',
              name: 'value2',
              label: 'Значение 2',
              defaultValue: 0,
            },
            {
              type: 'switch',
              name: 'enabled',
              label: 'Вычислить результат',
              checkedText: 'Вкл',
              uncheckedText: 'Выкл',
              defaultValue: false,
            },
            {
              type: 'inputNumber',
              name: 'result',
              label: 'Результат = значение1 × значение2 (вычисляемый)',
              disabledCondition: {
                comparisonType: 'or',
                children: [
                  { field: 'result', condition: '!∅' },
                ],
              },
              computedValue: {
                cases: [
                  {
                    condition: { field: 'enabled', condition: '===', value: true },
                    value: { left: '$value1', operator: '*', right: '$value2' },
                  },
                ],
                default: null,
              },
            },
          ],
        },
      ],
    } satisfies FormConfig,
  },
}
