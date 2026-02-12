import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { MoneyField } from './MoneyField';
import { MoneyField as MoneyFieldConfig } from '@/types';

// Wrapper component to provide react-hook-form context
const TestWrapper = ({ config, error, disabled }: { config: MoneyFieldConfig; error?: string; disabled?: boolean }) => {
  const { control } = useForm();

  return <MoneyField
    config={config}
    control={control}
    error={error}
    disabled={disabled} />;
};

describe('MoneyField', () => {
  const baseConfig: MoneyFieldConfig = {
    type: 'money',
    name: 'testMoney',
    label: 'Test Money',
    placeholder: 'Enter amount',
  };

  it('should render with label', () => {
    render(<TestWrapper config={baseConfig} />);
    expect(screen.getByText('Test Money')).toBeInTheDocument();
  });

  it('should render with placeholder', () => {
    render(<TestWrapper config={baseConfig} />);
    expect(screen.getByPlaceholderText('Enter amount')).toBeInTheDocument();
  });

  it('should render text input (not number)', () => {
    render(<TestWrapper config={baseConfig} />);
    const input = screen.getByPlaceholderText('Enter amount');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('should format with spaces immediately while typing', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const input = screen.getByPlaceholderText('Enter amount');
    await user.type(input, '12345');

    // Spaces are added during typing, not only on blur
    expect(input).toHaveValue('12 345');
  });

  it('should format with space thousand separators on blur', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const input = screen.getByPlaceholderText('Enter amount');
    await user.type(input, '1234567');
    await user.tab(); // trigger blur

    expect(input).toHaveValue('1 234 567,00');
  });

  it('should handle decimal input with comma', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const input = screen.getByPlaceholderText('Enter amount');
    await user.type(input, '1234,56');
    await user.tab();

    expect(input).toHaveValue('1 234,56');
  });

  it('should respect decimalPlaces config', async () => {
    const user = userEvent.setup();
    const config: MoneyFieldConfig = {
      ...baseConfig,
      decimalPlaces: 0,
    };
    render(<TestWrapper config={config} />);

    const input = screen.getByPlaceholderText('Enter amount');
    await user.type(input, '1234');
    await user.tab();

    expect(input).toHaveValue('1 234');
  });

  it('should display prefix', () => {
    const config: MoneyFieldConfig = {
      ...baseConfig,
      prefix: '$',
    };
    render(<TestWrapper config={config} />);
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('should display suffix', () => {
    const config: MoneyFieldConfig = {
      ...baseConfig,
      suffix: 'RUB',
    };
    render(<TestWrapper config={config} />);
    expect(screen.getByText('RUB')).toBeInTheDocument();
  });

  it('should allow negative values when allowNegative is true', async () => {
    const user = userEvent.setup();
    const config: MoneyFieldConfig = {
      ...baseConfig,
      allowNegative: true,
    };
    render(<TestWrapper config={config} />);

    const input = screen.getByPlaceholderText('Enter amount');
    await user.type(input, '-1000');
    await user.tab();

    expect(input).toHaveValue('-1 000,00');
  });

  it('should not allow minus sign when allowNegative is false', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const input = screen.getByPlaceholderText('Enter amount');
    await user.type(input, '-1000');
    await user.tab();

    // Minus is filtered out
    expect(input).toHaveValue('1 000,00');
  });

  it('should display error message', () => {
    render(<TestWrapper
      config={baseConfig}
      error="Amount is required" />);
    expect(screen.getByText('Amount is required')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<TestWrapper
      config={baseConfig}
      disabled={true} />);
    const input = screen.getByPlaceholderText('Enter amount');
    expect(input).toBeDisabled();
  });

  it('should display config error for invalid config', () => {
    const invalidConfig = {
      type: 'money',
      name: '',
      label: '',
    } as MoneyFieldConfig;

    render(<TestWrapper config={invalidConfig} />);
    expect(screen.getByText('Невозможно отобразить поле')).toBeInTheDocument();
  });

  it('should convert empty input to undefined on blur', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const input = screen.getByPlaceholderText('Enter amount');
    await user.type(input, '42');
    await user.clear(input);
    await user.tab();

    expect(input).toHaveValue('');
  });

  it('should render with default value', () => {
    const config: MoneyFieldConfig = {
      ...baseConfig,
      defaultValue: 5000,
    };
    render(<TestWrapper config={config} />);
    const input = screen.getByPlaceholderText('Enter amount');
    expect(input).toHaveValue('5 000,00');
  });

  it('should clamp value to min', async () => {
    const user = userEvent.setup();
    const config: MoneyFieldConfig = {
      ...baseConfig,
      min: 100,
    };
    render(<TestWrapper config={config} />);

    const input = screen.getByPlaceholderText('Enter amount');
    await user.type(input, '50');
    await user.tab();

    expect(input).toHaveValue('100,00');
  });

  it('should clamp value to max', async () => {
    const user = userEvent.setup();
    const config: MoneyFieldConfig = {
      ...baseConfig,
      max: 1000,
    };
    render(<TestWrapper config={config} />);

    const input = screen.getByPlaceholderText('Enter amount');
    await user.type(input, '5000');
    await user.tab();

    expect(input).toHaveValue('1 000,00');
  });

  it('should handle non-numeric input gracefully', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const input = screen.getByPlaceholderText('Enter amount');
    await user.type(input, 'abc');
    await user.tab();

    // Non-numeric characters are filtered out, resulting in empty
    expect(input).toHaveValue('');
  });

  it('should strip extra minus signs when allowNegative is true', async () => {
    const user = userEvent.setup();
    const config: MoneyFieldConfig = {
      ...baseConfig,
      allowNegative: true,
    };
    render(<TestWrapper config={config} />);

    const input = screen.getByPlaceholderText('Enter amount');
    // Type a value with minus in the middle: type normally, extra minus filtered
    await user.type(input, '-1-2-3');
    await user.tab();

    // Only leading minus kept, extra minuses removed
    expect(input).toHaveValue('-123,00');
  });

  it('should handle only comma input', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const input = screen.getByPlaceholderText('Enter amount');
    await user.type(input, ',');
    await user.tab();

    expect(input).toHaveValue('');
  });

  it('should handle multiple commas by keeping only the first', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const input = screen.getByPlaceholderText('Enter amount');
    await user.type(input, '12,34,56');
    await user.tab();

    // Only one comma allowed, second is stripped → 12,3456 → parsed as 12.3456
    expect(input).toHaveValue('12,35');
  });

  it('should handle positive values when allowNegative is true', async () => {
    const user = userEvent.setup();
    const config: MoneyFieldConfig = {
      ...baseConfig,
      allowNegative: true,
    };
    render(<TestWrapper config={config} />);

    const input = screen.getByPlaceholderText('Enter amount');
    await user.type(input, '500');
    await user.tab();

    // No minus sign, should still work normally
    expect(input).toHaveValue('500,00');
  });
});
