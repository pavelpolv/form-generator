// Public API exports

// Components
export type { FormGeneratorProps } from './components/FormGenerator';
export { FormGenerator } from './components/FormGenerator';

// Types
export type {
  ComparisonOperator,
  ComparisonType,
  ConditionGroup,
  ConditionValue,
  DateField,
  Field,
  FieldType,
  FormConfig,
  FormValues,
  GroupField,
  InputField,
  InputNumberField,
  MoneyField,
  SelectField,
  SelectOption,
  SwitchField,
} from './types';

// Utils
export { collectValidationMessages,evaluateConditions } from './utils';

// Version
export const version = '0.1.0';
