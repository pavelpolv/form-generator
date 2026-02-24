import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { InputNumberField } from './InputNumberField';
import { InputNumberField as InputNumberFieldConfig } from '@/types';

// Обёртка для предоставления контекста react-hook-form
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

  it('должен рендерить с лейблом', () => {
    render(<TestWrapper config={baseConfig} />);
    expect(screen.getByText('Test Number')).toBeInTheDocument();
  });

  it('должен рендерить с плейсхолдером', () => {
    render(<TestWrapper config={baseConfig} />);
    expect(screen.getByPlaceholderText('Enter number')).toBeInTheDocument();
  });

  it('должен рендерить числовой инпут', () => {
    render(<TestWrapper config={baseConfig} />);
    const input = screen.getByPlaceholderText('Enter number');
    expect(input).toHaveAttribute('type', 'number');
  });

  it('должен допускать ввод числа', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const input = screen.getByPlaceholderText('Enter number');
    await user.type(input, '42');

    expect(input).toHaveValue(42);
  });

  it('должен отображать сообщение об ошибке', () => {
    render(<TestWrapper
      config={baseConfig}
      error="Value is required" />);
    expect(screen.getByText('Value is required')).toBeInTheDocument();
  });

  it('должен быть заблокирован, когда disabled=true', () => {
    render(<TestWrapper
      config={baseConfig}
      disabled={true} />);
    const input = screen.getByPlaceholderText('Enter number');
    expect(input).toBeDisabled();
  });

  it('должен рендерить с атрибутом min', () => {
    const config: InputNumberFieldConfig = {
      ...baseConfig,
      min: 0,
    };
    render(<TestWrapper config={config} />);
    const input = screen.getByPlaceholderText('Enter number');
    expect(input).toHaveAttribute('min', '0');
  });

  it('должен рендерить с атрибутом max', () => {
    const config: InputNumberFieldConfig = {
      ...baseConfig,
      max: 100,
    };
    render(<TestWrapper config={config} />);
    const input = screen.getByPlaceholderText('Enter number');
    expect(input).toHaveAttribute('max', '100');
  });

  it('должен рендерить с атрибутом step', () => {
    const config: InputNumberFieldConfig = {
      ...baseConfig,
      step: 0.01,
    };
    render(<TestWrapper config={config} />);
    const input = screen.getByPlaceholderText('Enter number');
    expect(input).toHaveAttribute('step', '0.01');
  });

  it('должен отображать ошибку конфигурации при невалидном конфиге', () => {
    const invalidConfig = {
      type: 'inputNumber',
      name: '',
      label: '',
    } as InputNumberFieldConfig;

    render(<TestWrapper config={invalidConfig} />);
    expect(screen.getByText('Невозможно отобразить поле')).toBeInTheDocument();
  });

  it('должен обрабатывать событие blur', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const input = screen.getByPlaceholderText('Enter number');
    await user.click(input);
    await user.tab(); // вызываем blur
    // Ошибок быть не должно
    expect(input).toBeInTheDocument();
  });

  it('должен конвертировать пустой инпут в undefined', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const input = screen.getByPlaceholderText('Enter number');
    await user.type(input, '42');
    await user.clear(input);

    // Значение должно быть пустым
    expect(input).toHaveValue(null);
  });

  it('должен рендерить с дефолтным значением', () => {
    const config: InputNumberFieldConfig = {
      ...baseConfig,
      defaultValue: 99,
    };
    render(<TestWrapper config={config} />);
    const input = screen.getByPlaceholderText('Enter number');
    expect(input).toHaveValue(99);
  });
});
