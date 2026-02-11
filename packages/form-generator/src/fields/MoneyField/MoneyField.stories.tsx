import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { MoneyField } from './MoneyField';
import { MoneyField as MoneyFieldConfig } from '@/types';

// Wrapper component to provide react-hook-form context
const MoneyFieldWrapper = ({ config }: { config: MoneyFieldConfig }) => {
  const { control } = useForm();

  return <MoneyField
    config={config}
    control={control} />;
};

const meta: Meta<typeof MoneyFieldWrapper> = {
  title: 'Fields/MoneyField',
  component: MoneyFieldWrapper,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof MoneyFieldWrapper>

export const Basic: Story = {
  args: {
    config: {
      type: 'money',
      name: 'amount',
      label: 'Amount',
      placeholder: 'Enter amount',
    },
  },
};

export const WithPrefix: Story = {
  args: {
    config: {
      type: 'money',
      name: 'price',
      label: 'Price',
      placeholder: 'Enter price',
      prefix: '$',
    },
  },
};

export const WithSuffix: Story = {
  args: {
    config: {
      type: 'money',
      name: 'salary',
      label: 'Salary',
      placeholder: 'Enter salary',
      suffix: 'RUB',
    },
  },
};

export const CustomDecimalPlaces: Story = {
  args: {
    config: {
      type: 'money',
      name: 'wholeAmount',
      label: 'Whole Amount (no decimals)',
      placeholder: 'Enter amount',
      decimalPlaces: 0,
    },
  },
};

export const AllowNegative: Story = {
  args: {
    config: {
      type: 'money',
      name: 'balance',
      label: 'Balance (can be negative)',
      placeholder: 'Enter balance',
      allowNegative: true,
      suffix: 'EUR',
    },
  },
};

export const Disabled: Story = {
  render: (args) => {
    const { control } = useForm();

    return (
      <MoneyField
        config={args.config}
        control={control}
        disabled={true}
      />
    );
  },
  args: {
    config: {
      type: 'money',
      name: 'total',
      label: 'Total',
      placeholder: 'Total is locked',
      defaultValue: 1250000,
      prefix: '$',
    },
  },
};
