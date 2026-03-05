import { FC, useMemo } from 'react';
import { Form, Button } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { Control, useFieldArray, useFormState } from 'react-hook-form';
import { DynamicListField as DynamicListFieldConfig, FormValues } from '@/types';
import { evaluateConditions, collectValidationMessages, isFieldRequired } from '@/utils';
import { FieldRenderer } from '@/components/FieldRenderer';

interface DynamicListFieldComponentProps {
  config: DynamicListFieldConfig
  control: Control<FormValues>
  formValues: FormValues
  forceShowErrors: boolean
  error?: string
  required?: boolean
}

/**
 * Компонент динамического списка
 * Отображает список элементов, каждый из которых представляет собой группу вложенных полей.
 * Условия в полях элементов вычисляются в контексте значений конкретного элемента.
 */
export const DynamicListField: FC<DynamicListFieldComponentProps> = ({
  config,
  control,
  formValues,
  forceShowErrors,
  error,
  required,
}) => {
  const { fields: items, append, remove } = useFieldArray({
    control,
    name: config.name as never,
  });

  const { touchedFields: nestedTouched } = useFormState({ control });

  const isVisible = useMemo(
    () => evaluateConditions(config.visibleCondition, formValues),
     
    [config.visibleCondition, formValues],
  );

  const isDisabled = useMemo(
    () => config.disabledCondition
      ? evaluateConditions(config.disabledCondition, formValues)
      : false,
     
    [config.disabledCondition, formValues],
  );

  if (!isVisible) {
    return null;
  }

  const handleAppend = () => {
    const defaults = Object.fromEntries(
      config.itemFields
        .filter(f => f.defaultValue !== undefined)
        .map(f => [f.name, f.defaultValue]),
    );
    append(defaults as FormValues);
  };

  const {
    label: addButtonLabel = 'Add item',
    position = 'bottom',
    size,
    block = true,
    icon = <PlusOutlined />,
  } = config.addButton ?? {};

  const addBtn = (
    <Button
      type="dashed"
      onClick={handleAppend}
      icon={icon}
      disabled={isDisabled}
      size={size}
      block={block}
    >
      {addButtonLabel}
    </Button>
  );

  return (
    <Form.Item label={config.label} validateStatus={error ? 'error' : undefined} help={error} required={required}>
      {position === 'top' && addBtn}
      {items.map((item, index) => {
        const itemValues = ((formValues[config.name] as Array<Record<string, unknown>>)?.[index] ?? {}) as FormValues;

        return (
          <div
            key={item.id}
            style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}
          >
            {config.itemFields.map((itemField) => {
              const isItemVisible = evaluateConditions(itemField.visibleCondition, itemValues);
              if (!isItemVisible) return null;

              const isItemDisabled = itemField.disabledCondition
                ? evaluateConditions(itemField.disabledCondition, itemValues)
                : isDisabled;

              const isItemValid = evaluateConditions(itemField.validateCondition, itemValues);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const isTouched = Boolean((nestedTouched as any)?.[config.name]?.[index]?.[itemField.name]);
              const error = !isItemValid && (isTouched || forceShowErrors)
                ? collectValidationMessages(itemField.validateCondition, itemValues).join(', ')
                : undefined;
              const isItemRequired = isFieldRequired(itemField.validateCondition, itemValues);

              return (
                <FieldRenderer
                  key={itemField.name}
                  field={{ ...itemField, name: `${config.name}.${index}.${itemField.name}` } as typeof itemField}
                  control={control}
                  error={error}
                  disabled={isItemDisabled}
                  required={isItemRequired}
                />
              );
            })}
            <Form.Item
              label=" "
              colon={false}>
              <Button
                type="text"
                danger={true}
                icon={<MinusCircleOutlined />}
                onClick={() => remove(index)}
                disabled={isDisabled}
              />
            </Form.Item>
          </div>
        );
      })}
      {position === 'bottom' && addBtn}
    </Form.Item>
  );
};

DynamicListField.displayName = 'DynamicListField';
