import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { InputNumberField } from './InputNumberField';
import { InputNumberField as InputNumberFieldConfig } from '@/types';

// Wrapper component to provide react-hook-form context
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
      label: 'Age',
      placeholder: 'Enter your age',
    },
  },
};

export const WithMinMax: Story = {
  args: {
    config: {
      type: 'inputNumber',
      name: 'age',
      label: 'Age (0-120)',
      placeholder: 'Enter your age',
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
      label: 'Price',
      placeholder: 'Enter price',
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
        error="Value must be between 0 and 100"
      />
    );
  },
  args: {
    config: {
      type: 'inputNumber',
      name: 'percentage',
      label: 'Percentage',
      placeholder: 'Enter percentage',
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
      label: 'Score',
      placeholder: 'Score is locked',
      defaultValue: 100,
    },
  },
};
