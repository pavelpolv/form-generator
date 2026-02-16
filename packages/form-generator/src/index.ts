// Public API exports

// Components
export type { FormGeneratorProps } from './components/FormGenerator';
export { FormGenerator } from './components/FormGenerator';

// Types
export type {
  ButtonConfig,
  ButtonType,
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
  HttpMethod,
  InputField,
  InputNumberField,
  MoneyField,
  ResetButtonConfig,
  SelectField,
  SelectOption,
  SubmitButtonConfig,
  SwitchField,
  TextareaField,
} from './types';

// Validation
export { validateButtonsConfig } from './validation/buttonSchemas';

// Utils
export { collectValidationMessages,evaluateConditions } from './utils';

// Version
export const version = '0.1.0';
