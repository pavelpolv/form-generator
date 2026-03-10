import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { InputField } from './InputField';
import { InputField as InputFieldConfig } from '@/types';

// Компонент-обёртка для предоставления контекста react-hook-form
const InputFieldWrapper = ({ config }: { config: InputFieldConfig }) => {
  const { control } = useForm();

  return <InputField
    config={config}
    control={control} />;
};

const meta: Meta<typeof InputFieldWrapper> = {
  title: 'Fields/InputField',
  component: InputFieldWrapper,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof InputFieldWrapper>

export const Basic: Story = {
  args: {
    config: {
      type: 'input',
      name: 'firstName',
      label: 'Имя',
      placeholder: 'Введите ваше имя',
      inputType: 'text',
    },
  },
};

export const Password: Story = {
  args: {
    config: {
      type: 'input',
      name: 'password',
      label: 'Пароль',
      placeholder: 'Введите ваш пароль',
      inputType: 'password',
    },
  },
};

export const WithError: Story = {
  render: (args) => {
    const { control } = useForm();

    return (
      <InputField
        config={args.config}
        control={control}
        error="Это поле обязательно для заполнения"
      />
    );
  },
  args: {
    config: {
      type: 'input',
      name: 'required',
      label: 'Обязательное поле',
      placeholder: 'В этом поле есть ошибка',
      inputType: 'text',
    },
  },
};

export const Disabled: Story = {
  render: (args) => {
    const { control } = useForm();

    return (
      <InputField
        config={args.config}
        control={control}
        disabled={true}
      />
    );
  },
  args: {
    config: {
      type: 'input',
      name: 'disabled',
      label: 'Заблокированное поле',
      placeholder: 'Это поле заблокировано',
      inputType: 'text',
      defaultValue: 'Редактирование недоступно',
    },
  },
};

export const WithAllowClear: Story = {
  args: {
    config: {
      type: 'input',
      name: 'clearable',
      label: 'Поле с очисткой',
      placeholder: 'Введите значение и очистите',
      inputType: 'text',
      defaultValue: 'Нажмите × чтобы очистить',
      allowClear: true,
    },
  },
};
