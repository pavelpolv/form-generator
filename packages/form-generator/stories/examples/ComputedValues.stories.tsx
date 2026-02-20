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
 * ConditionalSubstitution demonstrates the `computedValue` feature with conditional value substitution.
 *
 * The `orderType` field is automatically computed based on other field values:
 *
 * ```ts
 * computedValue: {
 *   // `cases` is an array of { condition, value } pairs.
 *   // The first matching case wins.
 *   cases: [
 *     {
 *       // `condition` accepts a ConditionGroup or ConditionValue (same as visibleCondition)
 *       condition: {
 *         comparisonType: 'and',
 *         children: [
 *           { field: 'category', condition: '===', value: 'B' },
 *           { field: 'enabled', condition: '===', value: true },
 *         ],
 *       },
 *       // `value` is assigned when the condition matches.
 *       // Can be a literal (string, number, boolean, null) or a '$fieldRef'.
 *       value: 'manual',
 *     },
 *   ],
 *   // `default` is used when no case matches.
 *   // Omitting `default` means the field is left unchanged.
 *   default: 'auto',
 * }
 * ```
 *
 * Try: select category **B**, then toggle the switch — `orderType` switches to `manual`.
 * Switch off or change category — it reverts to `auto`.
 */
export const ConditionalSubstitution: Story = {
  args: {
    config: {
      groups: [
        {
          name: 'Order Settings',
          fields: [
            {
              type: 'select',
              name: 'category',
              label: 'Category',
              placeholder: 'Select category',
              options: [
                { label: 'Category A', value: 'A' },
                { label: 'Category B', value: 'B' },
                { label: 'Category C', value: 'C' },
              ],
              defaultValue: 'A',
            },
            {
              type: 'switch',
              name: 'enabled',
              label: 'Enable manual override',
              checkedText: 'On',
              uncheckedText: 'Off',
              defaultValue: false,
            },
            {
              type: 'select',
              name: 'orderType',
              label: 'Order Type (computed)',
              options: [
                { label: 'Auto', value: 'auto' },
                { label: 'User', value: 'user' },
                { label: 'Manual', value: 'manual' },
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
 * ArithmeticComputation demonstrates the `computedValue` feature with arithmetic expressions.
 *
 * The `result` field is automatically computed as `value1 * value2` when `enabled` is true:
 *
 * ```ts
 * computedValue: {
 *   cases: [
 *     {
 *       condition: { field: 'enabled', condition: '===', value: true },
 *       // `value` can be an ArithmeticExpression: { left, operator, right }
 *       // `operator` is one of: '+' | '-' | '*' | '/'
 *       // `left` and `right` are ComputedOperand: string | number | boolean | null
 *       // String operands starting with '$' are resolved as field references.
 *       value: { left: '$value1', operator: '*', right: '$value2' },
 *     },
 *   ],
 *   // When `enabled` is false, result is set to null.
 *   // Note: arithmetic with null/undefined operands also returns null.
 *   default: null,
 * }
 * ```
 *
 * Try: set **value1** to 3, **value2** to 4, then toggle **enabled** — `result` becomes 12.
 * Toggle off — `result` is cleared (null).
 */
export const ArithmeticComputation: Story = {
  args: {
    config: {
      groups: [
        {
          name: 'Calculator',
          fields: [
            {
              type: 'select',
              name: 'value1',
              label: 'Value 1',
              options: Array.from({ length: 11 }, (_, i) => ({ label: String(i), value: i })),
              defaultValue: 0,
            },
            {
              type: 'inputNumber',
              name: 'value2',
              label: 'Value 2',
              defaultValue: 0,
            },
            {
              type: 'switch',
              name: 'enabled',
              label: 'Compute result',
              checkedText: 'On',
              uncheckedText: 'Off',
              defaultValue: false,
            },
            {
              type: 'inputNumber',
              name: 'result',
              label: 'Result = value1 × value2 (computed)',
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
