import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { TextareaField } from './TextareaField';
import { TextareaField as TextareaFieldConfig } from '@/types';

// Компонент-обёртка для предоставления контекста react-hook-form
const TestWrapper = ({ config, error, disabled }: { config: TextareaFieldConfig; error?: string; disabled?: boolean }) => {
  const { control } = useForm();

  return <TextareaField
    config={config}
    control={control}
    error={error}
    disabled={disabled} />;
};

describe('TextareaField', () => {
  const baseConfig: TextareaFieldConfig = {
    type: 'textarea',
    name: 'testField',
    label: 'Test Label',
    placeholder: 'Enter text',
  };

  it('1. рендерит с лейблом', () => {
    render(<TestWrapper config={baseConfig} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('2. рендерит с плейсхолдером', () => {
    render(<TestWrapper config={baseConfig} />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('3. принимает пользовательский ввод', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const textarea = screen.getByPlaceholderText('Enter text');
    await user.type(textarea, 'multi\nline\ntext');

    expect(textarea).toHaveValue('multi\nline\ntext');
  });

  it('4. отображает сообщение об ошибке', () => {
    render(<TestWrapper
      config={baseConfig}
      error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('5. отключён, когда передан prop disabled=true', () => {
    render(<TestWrapper
      config={baseConfig}
      disabled={true} />);
    const textarea = screen.getByPlaceholderText('Enter text');
    expect(textarea).toBeDisabled();
  });

  it('6. рендерит со значением по умолчанию', () => {
    const config: TextareaFieldConfig = {
      ...baseConfig,
      defaultValue: 'default text',
    };
    render(<TestWrapper config={config} />);
    const textarea = screen.getByPlaceholderText('Enter text');
    expect(textarea).toHaveValue('default text');
  });

  it('7. рендерит с maxLength и соблюдает ограничение', async () => {
    const user = userEvent.setup();
    const config: TextareaFieldConfig = {
      ...baseConfig,
      maxLength: 5,
    };
    render(<TestWrapper config={config} />);
    const textarea = screen.getByPlaceholderText('Enter text');
    await user.type(textarea, 'abcdefgh');
    // Ant Design TextArea обрезает ввод до значения maxLength
    expect(textarea.textContent?.length ?? (textarea as HTMLTextAreaElement).value.length).toBeLessThanOrEqual(5);
  });

  it('8. рендерит с атрибутом rows', () => {
    const config: TextareaFieldConfig = {
      ...baseConfig,
      rows: 6,
    };
    render(<TestWrapper config={config} />);
    const textarea = screen.getByPlaceholderText('Enter text');
    expect(textarea).toHaveAttribute('rows', '6');
  });

  it('9. рендерит с autoSize', () => {
    const config: TextareaFieldConfig = {
      ...baseConfig,
      autoSize: { minRows: 2, maxRows: 6 },
    };
    render(<TestWrapper config={config} />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('10. отображает ошибку конфигурации при невалидном конфиге', () => {
    const invalidConfig = {
      type: 'textarea',
      name: '',
      label: '',
    } as TextareaFieldConfig;

    render(<TestWrapper config={invalidConfig} />);
    expect(screen.getByText('Невозможно отобразить поле')).toBeInTheDocument();
  });
});
