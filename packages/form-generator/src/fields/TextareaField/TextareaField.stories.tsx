import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { TextareaField } from './TextareaField';
import { TextareaField as TextareaFieldConfig } from '@/types';

// Компонент-обёртка для предоставления контекста react-hook-form
const TextareaFieldWrapper = ({ config }: { config: TextareaFieldConfig }) => {
  const { control } = useForm();

  return <TextareaField
    config={config}
    control={control} />;
};

const meta: Meta<typeof TextareaFieldWrapper> = {
  title: 'Fields/TextareaField',
  component: TextareaFieldWrapper,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof TextareaFieldWrapper>

export const Basic: Story = {
  args: {
    config: {
      type: 'textarea',
      name: 'description',
      label: 'Описание',
      placeholder: 'Введите описание...',
    },
  },
};

export const WithRows: Story = {
  args: {
    config: {
      type: 'textarea',
      name: 'bio',
      label: 'Биография',
      placeholder: 'Расскажите о себе...',
      rows: 6,
    },
  },
};

export const WithMaxLength: Story = {
  args: {
    config: {
      type: 'textarea',
      name: 'comment',
      label: 'Комментарий',
      placeholder: 'Максимум 200 символов',
      maxLength: 200,
    },
  },
};

export const WithAutoSize: Story = {
  args: {
    config: {
      type: 'textarea',
      name: 'notes',
      label: 'Заметки',
      placeholder: 'Textarea с автоматическим изменением размера (2–6 строк)',
      autoSize: { minRows: 2, maxRows: 6 },
    },
  },
};

export const WithDefaultValue: Story = {
  args: {
    config: {
      type: 'textarea',
      name: 'template',
      label: 'Шаблон',
      placeholder: 'Введите шаблон...',
      rows: 4,
      defaultValue: 'Уважаемый(ая),\n\nСообщаю вам, что...\n\nС уважением',
    },
  },
};

export const WithError: Story = {
  render: (args) => {
    const { control } = useForm();

    return (
      <TextareaField
        config={args.config}
        control={control}
        error="Поле обязательно для заполнения"
      />
    );
  },
  args: {
    config: {
      type: 'textarea',
      name: 'required',
      label: 'Обязательное поле',
      placeholder: 'В этом поле есть ошибка',
    },
  },
};

export const Disabled: Story = {
  render: (args) => {
    const { control } = useForm();

    return (
      <TextareaField
        config={args.config}
        control={control}
        disabled={true}
      />
    );
  },
  args: {
    config: {
      type: 'textarea',
      name: 'disabled',
      label: 'Заблокированное поле',
      placeholder: 'Это поле недоступно для редактирования',
      defaultValue: 'Этот текст нельзя изменить',
      rows: 3,
    },
  },
};
