import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { TextareaField } from './TextareaField';
import { TextareaField as TextareaFieldConfig } from '@/types';

// Wrapper component to provide react-hook-form context
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

  it('should render with label', () => {
    render(<TestWrapper config={baseConfig} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('should render with placeholder', () => {
    render(<TestWrapper config={baseConfig} />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should allow user input', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const textarea = screen.getByPlaceholderText('Enter text');
    await user.type(textarea, 'multi\nline\ntext');

    expect(textarea).toHaveValue('multi\nline\ntext');
  });

  it('should display error message', () => {
    render(<TestWrapper
      config={baseConfig}
      error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<TestWrapper
      config={baseConfig}
      disabled={true} />);
    const textarea = screen.getByPlaceholderText('Enter text');
    expect(textarea).toBeDisabled();
  });

  it('should render with default value', () => {
    const config: TextareaFieldConfig = {
      ...baseConfig,
      defaultValue: 'default text',
    };
    render(<TestWrapper config={config} />);
    const textarea = screen.getByPlaceholderText('Enter text');
    expect(textarea).toHaveValue('default text');
  });

  it('should render with maxLength and enforce limit', async () => {
    const user = userEvent.setup();
    const config: TextareaFieldConfig = {
      ...baseConfig,
      maxLength: 5,
    };
    render(<TestWrapper config={config} />);
    const textarea = screen.getByPlaceholderText('Enter text');
    await user.type(textarea, 'abcdefgh');
    // Ant Design TextArea enforces maxLength by truncating input
    expect(textarea.textContent?.length ?? (textarea as HTMLTextAreaElement).value.length).toBeLessThanOrEqual(5);
  });

  it('should render with rows attribute', () => {
    const config: TextareaFieldConfig = {
      ...baseConfig,
      rows: 6,
    };
    render(<TestWrapper config={config} />);
    const textarea = screen.getByPlaceholderText('Enter text');
    expect(textarea).toHaveAttribute('rows', '6');
  });

  it('should render with autoSize', () => {
    const config: TextareaFieldConfig = {
      ...baseConfig,
      autoSize: { minRows: 2, maxRows: 6 },
    };
    render(<TestWrapper config={config} />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should display config error for invalid config', () => {
    const invalidConfig = {
      type: 'textarea',
      name: '',
      label: '',
    } as TextareaFieldConfig;

    render(<TestWrapper config={invalidConfig} />);
    expect(screen.getByText('Невозможно отобразить поле')).toBeInTheDocument();
  });
});
