import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { InputField } from './InputField';
import { InputField as InputFieldConfig } from '@/types';

// Wrapper component to provide react-hook-form context
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
      label: 'First Name',
      placeholder: 'Enter your first name',
      inputType: 'text',
    },
  },
};

export const Password: Story = {
  args: {
    config: {
      type: 'input',
      name: 'password',
      label: 'Password',
      placeholder: 'Enter your password',
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
        error="This field is required"
      />
    );
  },
  args: {
    config: {
      type: 'input',
      name: 'required',
      label: 'Required Field',
      placeholder: 'This field has an error',
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
      label: 'Disabled Field',
      placeholder: 'This field is disabled',
      inputType: 'text',
      defaultValue: 'Cannot edit this',
    },
  },
};
