import { FC, useMemo } from 'react';
import { Form, Button } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { Control, useFieldArray, useFormState } from 'react-hook-form';
import { DynamicListField as DynamicListFieldConfig, FormValues } from '@/types';
import { evaluateConditions, collectValidationMessages } from '@/utils';
import { FieldRenderer } from '@/components/FieldRenderer';

interface DynamicListFieldComponentProps {
  config: DynamicListFieldConfig
  control: Control<FormValues>
  formValues: FormValues
  forceShowErrors: boolean
}

/**
 * Dynamic list field component
 * Renders a list of items where each item is a group of sub-fields.
 * Conditions in item fields are evaluated in the scope of the item's values.
 */
export const DynamicListField: FC<DynamicListFieldComponentProps> = ({
  config,
  control,
  formValues,
  forceShowErrors,
}) => {
  const { fields: items, append, remove } = useFieldArray({
    control,
    name: config.name as never,
  });

  const { touchedFields: nestedTouched } = useFormState({ control });

  const isVisible = useMemo(
    () => evaluateConditions(config.visibleCondition, formValues),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.visibleCondition, formValues],
  );

  const isDisabled = useMemo(
    () => config.disabledCondition
      ? evaluateConditions(config.disabledCondition, formValues)
      : false,
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <Form.Item label={config.label}>
      {position === 'top' && addBtn}
      {items.map((item, index) => {
        const itemValues = ((formValues[config.name] as Record<string, unknown>[])?.[index] ?? {}) as FormValues;

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

              return (
                <FieldRenderer
                  key={itemField.name}
                  field={{ ...itemField, name: `${config.name}.${index}.${itemField.name}` } as typeof itemField}
                  control={control}
                  error={error}
                  disabled={isItemDisabled}
                />
              );
            })}
            <Form.Item label=" " colon={false}>
              <Button
                type="text"
                danger
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
