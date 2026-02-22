import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { DynamicListField } from './DynamicListField';
import { DynamicListField as DynamicListFieldConfig } from '@/types';

const DynamicListFieldWrapper = ({
  config,
  formValues = {},
  forceShowErrors = false,
}: {
  config: DynamicListFieldConfig
  formValues?: Record<string, unknown>
  forceShowErrors?: boolean
}) => {
  const { control } = useForm({ defaultValues: formValues });

  return (
    <DynamicListField
      config={config}
      control={control}
      formValues={formValues}
      forceShowErrors={forceShowErrors}
    />
  );
};

const meta: Meta<typeof DynamicListFieldWrapper> = {
  title: 'Fields/DynamicListField',
  component: DynamicListFieldWrapper,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof DynamicListFieldWrapper>;

export const Default: Story = {
  args: {
    config: {
      type: 'dynamicList',
      name: 'items',
      label: 'Items',
      itemFields: [
        { type: 'input', name: 'title', label: 'Title', placeholder: 'Enter title' },
        { type: 'inputNumber', name: 'quantity', label: 'Quantity', placeholder: 'Enter quantity', min: 1 },
      ],
    },
  },
};

export const WithCustomAddLabel: Story = {
  args: {
    config: {
      type: 'dynamicList',
      name: 'contacts',
      label: 'Contacts',
      addButton: { label: 'Add contact' },
      itemFields: [
        { type: 'input', name: 'name', label: 'Name', placeholder: 'Enter name' },
        { type: 'input', name: 'email', label: 'Email', placeholder: 'Enter email', inputType: 'email' },
      ],
    },
  },
};

export const TopPosition: Story = {
  args: {
    config: {
      type: 'dynamicList',
      name: 'items',
      label: 'Items',
      addButton: { position: 'top', size: 'small', block: false },
      itemFields: [
        { type: 'input', name: 'title', label: 'Title', placeholder: 'Enter title' },
      ],
    },
  },
};

export const WithDefaultValues: Story = {
  args: {
    config: {
      type: 'dynamicList',
      name: 'passengers',
      label: 'Passengers',
      addButton: { label: 'Add passenger' },
      itemFields: [
        { type: 'input', name: 'name', label: 'Name', placeholder: 'Passenger name' },
        {
          type: 'select',
          name: 'class',
          label: 'Class',
          defaultValue: 'economy',
          options: [
            { label: 'Economy', value: 'economy' },
            { label: 'Business', value: 'business' },
            { label: 'First', value: 'first' },
          ],
        },
      ],
    },
  },
};
