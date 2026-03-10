import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { SelectField } from './SelectField';
import { SelectField as SelectFieldConfig } from '@/types';

// Компонент-обёртка для предоставления контекста react-hook-form
const SelectFieldWrapper = ({ config }: { config: SelectFieldConfig }) => {
  const { control } = useForm();

  return <SelectField
    config={config}
    control={control} />;
};

const meta: Meta<typeof SelectFieldWrapper> = {
  title: 'Fields/SelectField',
  component: SelectFieldWrapper,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof SelectFieldWrapper>

const countryOptions = [
  { label: 'Соединённые Штаты', value: 'US' },
  { label: 'Великобритания', value: 'UK' },
  { label: 'Канада', value: 'CA' },
  { label: 'Австралия', value: 'AU' },
  { label: 'Германия', value: 'DE' },
  { label: 'Франция', value: 'FR' },
];

export const SingleSelect: Story = {
  args: {
    config: {
      type: 'select',
      name: 'country',
      label: 'Страна',
      placeholder: 'Выберите вашу страну',
      options: countryOptions,
    },
  },
};

export const MultipleSelect: Story = {
  args: {
    config: {
      type: 'select',
      name: 'countries',
      label: 'Страны',
      placeholder: 'Выберите несколько стран',
      options: countryOptions,
      multiple: true,
    },
  },
};

export const SearchableSelect: Story = {
  args: {
    config: {
      type: 'select',
      name: 'country',
      label: 'Страна (с поиском)',
      placeholder: 'Найдите и выберите страну',
      options: countryOptions,
      searchable: true,
    },
  },
};

export const WithDefaultValue: Story = {
  args: {
    config: {
      type: 'select',
      name: 'country',
      label: 'Страна',
      placeholder: 'Выберите вашу страну',
      options: countryOptions,
      defaultValue: 'US',
    },
  },
};

export const WithDisabledOptions: Story = {
  args: {
    config: {
      type: 'select',
      name: 'country',
      label: 'Страна',
      placeholder: 'Выберите вашу страну',
      options: [
        { label: 'Соединённые Штаты', value: 'US' },
        { label: 'Великобритания', value: 'UK', disabled: true },
        { label: 'Канада', value: 'CA' },
      ],
    },
  },
};

export const WithError: Story = {
  render: (args) => {
    const { control } = useForm();

    return (
      <SelectField
        config={args.config}
        control={control}
        error="Пожалуйста, выберите страну"
      />
    );
  },
  args: {
    config: {
      type: 'select',
      name: 'country',
      label: 'Страна',
      placeholder: 'Выберите вашу страну',
      options: countryOptions,
    },
  },
};

export const Disabled: Story = {
  render: (args) => {
    const { control } = useForm();

    return (
      <SelectField
        config={args.config}
        control={control}
        disabled={true}
      />
    );
  },
  args: {
    config: {
      type: 'select',
      name: 'country',
      label: 'Страна',
      placeholder: 'Выберите вашу страну',
      options: countryOptions,
      defaultValue: 'US',
    },
  },
};

export const WithAllowClear: Story = {
  args: {
    config: {
      type: 'select',
      name: 'country',
      label: 'Страна (с очисткой)',
      placeholder: 'Выберите страну',
      options: countryOptions,
      defaultValue: 'US',
      allowClear: true,
    },
  },
};
