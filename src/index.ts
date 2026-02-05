// Public API exports

// Components
export { FormGenerator } from './components/FormGenerator'
export type { FormGeneratorProps } from './components/FormGenerator'

// Types
export type {
  FormConfig,
  FormValues,
  GroupField,
  Field,
  FieldType,
  InputField,
  InputNumberField,
  SelectField,
  SwitchField,
  DateField,
  SelectOption,
  ConditionGroup,
  ConditionValue,
  ComparisonOperator,
  ComparisonType,
} from './types'

// Utils
export { evaluateConditions, collectValidationMessages } from './utils'

// Version
export const version = '0.1.0'
