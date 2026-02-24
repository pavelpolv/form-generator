import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { DateField } from './DateField';
import { DateField as DateFieldConfig } from '@/types';

// Компонент-обёртка для предоставления контекста react-hook-form
const DateFieldWrapper = ({ config }: { config: DateFieldConfig }) => {
  const { control } = useForm();

  return <DateField
    config={config}
    control={control} />;
};

const meta: Meta<typeof DateFieldWrapper> = {
  title: 'Fields/DateField',
  component: DateFieldWrapper,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof DateFieldWrapper>

export const BasicDate: Story = {
  args: {
    config: {
      type: 'date',
      name: 'birthDate',
      label: 'Дата рождения',
      placeholder: 'Выберите дату рождения',
    },
  },
};

export const WithCustomFormat: Story = {
  args: {
    config: {
      type: 'date',
      name: 'eventDate',
      label: 'Дата события',
      placeholder: 'Выберите дату события',
      format: 'DD/MM/YYYY',
    },
  },
};

export const WithTime: Story = {
  args: {
    config: {
      type: 'date',
      name: 'appointmentDateTime',
      label: 'Дата и время приёма',
      placeholder: 'Выберите дату и время приёма',
      format: 'YYYY-MM-DD HH:mm',
      showTime: true,
    },
  },
};

export const WithDefaultValue: Story = {
  args: {
    config: {
      type: 'date',
      name: 'joinDate',
      label: 'Дата вступления',
      placeholder: 'Выберите дату вступления',
      format: 'YYYY-MM-DD',
      defaultValue: '2024-01-15T10:00:00.000Z',
    },
  },
};

export const WithDisabledDateBefore: Story = {
  args: {
    config: {
      type: 'date',
      name: 'futureDate',
      label: 'Будущая дата (прошедшие даты недоступны)',
      placeholder: 'Выберите будущую дату',
      format: 'YYYY-MM-DD',
      disabledDateBefore: new Date(),
    },
  },
};

export const WithError: Story = {
  render: (args) => {
    const { control } = useForm();

    return (
      <DateField
        config={args.config}
        control={control}
        error="Дата обязательна для заполнения"
      />
    );
  },
  args: {
    config: {
      type: 'date',
      name: 'requiredDate',
      label: 'Обязательная дата',
      placeholder: 'Выберите дату',
      format: 'YYYY-MM-DD',
    },
  },
};

export const Disabled: Story = {
  render: (args) => {
    const { control } = useForm();

    return (
      <DateField
        config={args.config}
        control={control}
        disabled={true}
      />
    );
  },
  args: {
    config: {
      type: 'date',
      name: 'disabledDate',
      label: 'Заблокированная дата',
      placeholder: 'Выбор даты недоступен',
      format: 'YYYY-MM-DD',
      defaultValue: '2024-01-15T10:00:00.000Z',
    },
  },
};
