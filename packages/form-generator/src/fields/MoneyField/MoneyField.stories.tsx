import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { MoneyField } from './MoneyField';
import { MoneyField as MoneyFieldConfig } from '@/types';

// Компонент-обёртка для предоставления контекста react-hook-form
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
      label: 'Сумма',
      placeholder: 'Введите сумму',
    },
  },
};

export const WithPrefix: Story = {
  args: {
    config: {
      type: 'money',
      name: 'price',
      label: 'Цена',
      placeholder: 'Введите цену',
      prefix: '$',
    },
  },
};

export const WithSuffix: Story = {
  args: {
    config: {
      type: 'money',
      name: 'salary',
      label: 'Зарплата',
      placeholder: 'Введите зарплату',
      suffix: 'RUB',
    },
  },
};

export const CustomDecimalPlaces: Story = {
  args: {
    config: {
      type: 'money',
      name: 'wholeAmount',
      label: 'Целая сумма (без дробной части)',
      placeholder: 'Введите сумму',
      decimalPlaces: 0,
    },
  },
};

export const AllowNegative: Story = {
  args: {
    config: {
      type: 'money',
      name: 'balance',
      label: 'Баланс (может быть отрицательным)',
      placeholder: 'Введите баланс',
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
      label: 'Итого',
      placeholder: 'Итого заблокировано',
      defaultValue: 1250000,
      prefix: '$',
    },
  },
};
