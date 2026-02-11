import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { InputNumberField } from './InputNumberField';
import { InputNumberField as InputNumberFieldConfig } from '@/types';

// Wrapper component to provide react-hook-form context
const TestWrapper = ({ config, error, disabled }: { config: InputNumberFieldConfig; error?: string; disabled?: boolean }) => {
  const { control } = useForm();

  return <InputNumberField
    config={config}
    control={control}
    error={error}
    disabled={disabled} />;
};

describe('InputNumberField', () => {
  const baseConfig: InputNumberFieldConfig = {
    type: 'inputNumber',
    name: 'testNumber',
    label: 'Test Number',
    placeholder: 'Enter number',
  };

  it('should render with label', () => {
    render(<TestWrapper config={baseConfig} />);
    expect(screen.getByText('Test Number')).toBeInTheDocument();
  });

  it('should render with placeholder', () => {
    render(<TestWrapper config={baseConfig} />);
    expect(screen.getByPlaceholderText('Enter number')).toBeInTheDocument();
  });

  it('should render number input', () => {
    render(<TestWrapper config={baseConfig} />);
    const input = screen.getByPlaceholderText('Enter number');
    expect(input).toHaveAttribute('type', 'number');
  });

  it('should allow numeric input', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const input = screen.getByPlaceholderText('Enter number');
    await user.type(input, '42');

    expect(input).toHaveValue(42);
  });

  it('should display error message', () => {
    render(<TestWrapper
      config={baseConfig}
      error="Value is required" />);
    expect(screen.getByText('Value is required')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<TestWrapper
      config={baseConfig}
      disabled={true} />);
    const input = screen.getByPlaceholderText('Enter number');
    expect(input).toBeDisabled();
  });

  it('should render with min attribute', () => {
    const config: InputNumberFieldConfig = {
      ...baseConfig,
      min: 0,
    };
    render(<TestWrapper config={config} />);
    const input = screen.getByPlaceholderText('Enter number');
    expect(input).toHaveAttribute('min', '0');
  });

  it('should render with max attribute', () => {
    const config: InputNumberFieldConfig = {
      ...baseConfig,
      max: 100,
    };
    render(<TestWrapper config={config} />);
    const input = screen.getByPlaceholderText('Enter number');
    expect(input).toHaveAttribute('max', '100');
  });

  it('should render with step attribute', () => {
    const config: InputNumberFieldConfig = {
      ...baseConfig,
      step: 0.01,
    };
    render(<TestWrapper config={config} />);
    const input = screen.getByPlaceholderText('Enter number');
    expect(input).toHaveAttribute('step', '0.01');
  });

  it('should display config error for invalid config', () => {
    const invalidConfig = {
      type: 'inputNumber',
      name: '',
      label: '',
    } as InputNumberFieldConfig;

    render(<TestWrapper config={invalidConfig} />);
    expect(screen.getByText('Невозможно отобразить поле')).toBeInTheDocument();
  });

  it('should handle blur event', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const input = screen.getByPlaceholderText('Enter number');
    await user.click(input);
    await user.tab(); // trigger blur
    // No error should occur
    expect(input).toBeInTheDocument();
  });

  it('should convert empty input to undefined', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const input = screen.getByPlaceholderText('Enter number');
    await user.type(input, '42');
    await user.clear(input);

    // The value should be empty
    expect(input).toHaveValue(null);
  });

  it('should render with default value', () => {
    const config: InputNumberFieldConfig = {
      ...baseConfig,
      defaultValue: 99,
    };
    render(<TestWrapper config={config} />);
    const input = screen.getByPlaceholderText('Enter number');
    expect(input).toHaveValue(99);
  });
});
