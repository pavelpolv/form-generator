import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { InputNumberField } from './InputNumberField';
import { InputNumberField as InputNumberFieldConfig } from '@/types';

// Компонент-обёртка для предоставления контекста react-hook-form
const InputNumberFieldWrapper = ({ config }: { config: InputNumberFieldConfig }) => {
  const { control } = useForm();

  return <InputNumberField
    config={config}
    control={control} />;
};

const meta: Meta<typeof InputNumberFieldWrapper> = {
  title: 'Fields/InputNumberField',
  component: InputNumberFieldWrapper,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof InputNumberFieldWrapper>

export const Basic: Story = {
  args: {
    config: {
      type: 'inputNumber',
      name: 'age',
      label: 'Возраст',
      placeholder: 'Введите ваш возраст',
    },
  },
};

export const WithMinMax: Story = {
  args: {
    config: {
      type: 'inputNumber',
      name: 'age',
      label: 'Возраст (0–120)',
      placeholder: 'Введите ваш возраст',
      min: 0,
      max: 120,
    },
  },
};

export const WithStep: Story = {
  args: {
    config: {
      type: 'inputNumber',
      name: 'price',
      label: 'Цена',
      placeholder: 'Введите цену',
      step: 0.01,
      min: 0,
    },
  },
};

export const WithError: Story = {
  render: (args) => {
    const { control } = useForm();

    return (
      <InputNumberField
        config={args.config}
        control={control}
        error="Значение должно быть от 0 до 100"
      />
    );
  },
  args: {
    config: {
      type: 'inputNumber',
      name: 'percentage',
      label: 'Процент',
      placeholder: 'Введите процент',
      min: 0,
      max: 100,
    },
  },
};

export const Disabled: Story = {
  render: (args) => {
    const { control } = useForm();

    return (
      <InputNumberField
        config={args.config}
        control={control}
        disabled={true}
      />
    );
  },
  args: {
    config: {
      type: 'inputNumber',
      name: 'score',
      label: 'Счёт',
      placeholder: 'Счёт заблокирован',
      defaultValue: 100,
    },
  },
};
