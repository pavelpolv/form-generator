import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { InputField } from './InputField';
import { InputField as InputFieldConfig } from '@/types';

// Обёртка для предоставления контекста react-hook-form
const TestWrapper = ({ config, error, disabled }: { config: InputFieldConfig; error?: string; disabled?: boolean }) => {
  const { control } = useForm();

  return <InputField
    config={config}
    control={control}
    error={error}
    disabled={disabled} />;
};

describe('InputField', () => {
  const baseConfig: InputFieldConfig = {
    type: 'input',
    name: 'testField',
    label: 'Test Label',
    placeholder: 'Enter value',
    inputType: 'text',
  };

  it('должен рендерить с лейблом', () => {
    render(<TestWrapper config={baseConfig} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('должен рендерить с плейсхолдером', () => {
    render(<TestWrapper config={baseConfig} />);
    expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument();
  });

  it('должен рендерить текстовый инпут по умолчанию', () => {
    render(<TestWrapper config={baseConfig} />);
    const input = screen.getByPlaceholderText('Enter value');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('должен рендерить инпут для пароля', () => {
    const config: InputFieldConfig = {
      ...baseConfig,
      inputType: 'password',
    };
    render(<TestWrapper config={config} />);
    const input = screen.getByPlaceholderText('Enter value');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('должен допускать ввод пользователя', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const input = screen.getByPlaceholderText('Enter value');
    await user.type(input, 'test value');

    expect(input).toHaveValue('test value');
  });

  it('должен отображать сообщение об ошибке', () => {
    render(<TestWrapper
      config={baseConfig}
      error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('должен быть заблокирован, когда disabled=true', () => {
    render(<TestWrapper
      config={baseConfig}
      disabled={true} />);
    const input = screen.getByPlaceholderText('Enter value');
    expect(input).toBeDisabled();
  });

  it('должен отображать ошибку конфигурации при невалидном конфиге', () => {
    const invalidConfig = {
      type: 'input',
      name: '',
      label: '',
    } as InputFieldConfig;

    render(<TestWrapper config={invalidConfig} />);
    expect(screen.getByText('Невозможно отобразить поле')).toBeInTheDocument();
  });

  it('должен рендерить с дефолтным значением', () => {
    const config: InputFieldConfig = {
      ...baseConfig,
      defaultValue: 'default text',
    };
    render(<TestWrapper config={config} />);
    const input = screen.getByPlaceholderText('Enter value');
    expect(input).toHaveValue('default text');
  });

  it('должен рендерить инпут типа email', () => {
    const config: InputFieldConfig = {
      ...baseConfig,
      inputType: 'email',
    };
    render(<TestWrapper config={config} />);
    const input = screen.getByPlaceholderText('Enter value');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('должен рендерить с атрибутом maxLength', () => {
    const config: InputFieldConfig = {
      ...baseConfig,
      maxLength: 50,
    };
    render(<TestWrapper config={config} />);
    const input = screen.getByPlaceholderText('Enter value');
    expect(input).toHaveAttribute('maxlength', '50');
  });
});
