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
      label: 'Элементы',
      itemFields: [
        { type: 'input', name: 'title', label: 'Название', placeholder: 'Введите название' },
        { type: 'inputNumber', name: 'quantity', label: 'Количество', placeholder: 'Введите количество', min: 1 },
      ],
    },
  },
};

export const WithCustomAddLabel: Story = {
  args: {
    config: {
      type: 'dynamicList',
      name: 'contacts',
      label: 'Контакты',
      addButton: { label: 'Добавить контакт' },
      itemFields: [
        { type: 'input', name: 'name', label: 'Имя', placeholder: 'Введите имя' },
        { type: 'input', name: 'email', label: 'Электронная почта', placeholder: 'Введите e-mail', inputType: 'email' },
      ],
    },
  },
};

export const TopPosition: Story = {
  args: {
    config: {
      type: 'dynamicList',
      name: 'items',
      label: 'Элементы',
      addButton: { position: 'top', size: 'small', block: false },
      itemFields: [
        { type: 'input', name: 'title', label: 'Название', placeholder: 'Введите название' },
      ],
    },
  },
};

export const WithDefaultValues: Story = {
  args: {
    config: {
      type: 'dynamicList',
      name: 'passengers',
      label: 'Пассажиры',
      addButton: { label: 'Добавить пассажира' },
      itemFields: [
        { type: 'input', name: 'name', label: 'Имя', placeholder: 'Имя пассажира' },
        {
          type: 'select',
          name: 'class',
          label: 'Класс',
          defaultValue: 'economy',
          options: [
            { label: 'Эконом', value: 'economy' },
            { label: 'Бизнес', value: 'business' },
            { label: 'Первый', value: 'first' },
          ],
        },
      ],
    },
  },
};
