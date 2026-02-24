import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { SwitchField } from './SwitchField';
import { SwitchField as SwitchFieldConfig } from '@/types';

// Компонент-обёртка для предоставления контекста react-hook-form
const SwitchFieldWrapper = ({ config }: { config: SwitchFieldConfig }) => {
  const { control } = useForm();

  return <SwitchField
    config={config}
    control={control} />;
};

const meta: Meta<typeof SwitchFieldWrapper> = {
  title: 'Fields/SwitchField',
  component: SwitchFieldWrapper,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof SwitchFieldWrapper>

export const BasicSwitch: Story = {
  args: {
    config: {
      type: 'switch',
      name: 'enabled',
      label: 'Включить функцию',
    },
  },
};

export const WithCheckedText: Story = {
  args: {
    config: {
      type: 'switch',
      name: 'newsletter',
      label: 'Подписаться на рассылку',
      checkedText: 'Да',
      uncheckedText: 'Нет',
    },
  },
};

export const DefaultChecked: Story = {
  args: {
    config: {
      type: 'switch',
      name: 'agree',
      label: 'Я принимаю условия использования',
      defaultValue: true,
      checkedText: 'Да',
      uncheckedText: 'Нет',
    },
  },
};

export const WithError: Story = {
  render: (args) => {
    const { control } = useForm();

    return (
      <SwitchField
        config={args.config}
        control={control}
        error="Необходимо принять условия для продолжения"
      />
    );
  },
  args: {
    config: {
      type: 'switch',
      name: 'terms',
      label: 'Я принимаю условия использования',
      checkedText: 'Принимаю',
      uncheckedText: 'Не принимаю',
    },
  },
};

export const Disabled: Story = {
  render: (args) => {
    const { control } = useForm();

    return (
      <SwitchField
        config={args.config}
        control={control}
        disabled={true}
      />
    );
  },
  args: {
    config: {
      type: 'switch',
      name: 'disabled',
      label: 'Этот переключатель заблокирован',
      defaultValue: true,
      checkedText: 'ВКЛ',
      uncheckedText: 'ВЫКЛ',
    },
  },
};
