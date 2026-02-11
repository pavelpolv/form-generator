import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { SwitchField } from './SwitchField';
import { SwitchField as SwitchFieldConfig } from '@/types';

// Wrapper component to provide react-hook-form context
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
      label: 'Enable Feature',
    },
  },
};

export const WithCheckedText: Story = {
  args: {
    config: {
      type: 'switch',
      name: 'newsletter',
      label: 'Subscribe to Newsletter',
      checkedText: 'Yes',
      uncheckedText: 'No',
    },
  },
};

export const DefaultChecked: Story = {
  args: {
    config: {
      type: 'switch',
      name: 'agree',
      label: 'I agree to terms and conditions',
      defaultValue: true,
      checkedText: 'Yes',
      uncheckedText: 'No',
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
        error="You must agree to continue"
      />
    );
  },
  args: {
    config: {
      type: 'switch',
      name: 'terms',
      label: 'I agree to terms and conditions',
      checkedText: 'Agree',
      uncheckedText: 'Disagree',
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
      label: 'This switch is disabled',
      defaultValue: true,
      checkedText: 'ON',
      uncheckedText: 'OFF',
    },
  },
};
