import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { TextareaField } from './TextareaField';
import { TextareaField as TextareaFieldConfig } from '@/types';

// Wrapper component to provide react-hook-form context
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
      label: 'Description',
      placeholder: 'Enter a description...',
    },
  },
};

export const WithRows: Story = {
  args: {
    config: {
      type: 'textarea',
      name: 'bio',
      label: 'Biography',
      placeholder: 'Tell us about yourself...',
      rows: 6,
    },
  },
};

export const WithMaxLength: Story = {
  args: {
    config: {
      type: 'textarea',
      name: 'comment',
      label: 'Comment',
      placeholder: 'Max 200 characters',
      maxLength: 200,
    },
  },
};

export const WithAutoSize: Story = {
  args: {
    config: {
      type: 'textarea',
      name: 'notes',
      label: 'Notes',
      placeholder: 'Auto-resizing textarea (2-6 rows)',
      autoSize: { minRows: 2, maxRows: 6 },
    },
  },
};

export const WithDefaultValue: Story = {
  args: {
    config: {
      type: 'textarea',
      name: 'template',
      label: 'Template',
      placeholder: 'Enter template...',
      rows: 4,
      defaultValue: 'Dear Sir/Madam,\n\nI am writing to inform you that...\n\nBest regards',
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
        error="This field is required"
      />
    );
  },
  args: {
    config: {
      type: 'textarea',
      name: 'required',
      label: 'Required Field',
      placeholder: 'This field has an error',
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
      label: 'Disabled Field',
      placeholder: 'This field is disabled',
      defaultValue: 'This content cannot be edited',
      rows: 3,
    },
  },
};
