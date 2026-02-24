import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { SwitchField } from './SwitchField';
import { SwitchField as SwitchFieldConfig } from '@/types';

// Компонент-обёртка для предоставления контекста react-hook-form
const TestWrapper = ({ config, error, disabled }: { config: SwitchFieldConfig; error?: string; disabled?: boolean }) => {
  const { control } = useForm();

  return <SwitchField
    config={config}
    control={control}
    error={error}
    disabled={disabled} />;
};

describe('SwitchField', () => {
  const baseConfig: SwitchFieldConfig = {
    type: 'switch',
    name: 'testSwitch',
    label: 'Test Switch',
  };

  it('1. рендерит с лейблом', () => {
    render(<TestWrapper config={baseConfig} />);
    expect(screen.getByText('Test Switch')).toBeInTheDocument();
  });

  it('2. рендерит элемент переключателя', () => {
    render(<TestWrapper config={baseConfig} />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('3. переключается при клике', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const switchEl = screen.getByRole('switch');
    expect(switchEl).toHaveAttribute('aria-checked', 'false');

    await user.click(switchEl);
    expect(switchEl).toHaveAttribute('aria-checked', 'true');
  });

  it('4. отображает сообщение об ошибке', () => {
    render(<TestWrapper
      config={baseConfig}
      error="You must agree" />);
    expect(screen.getByText('You must agree')).toBeInTheDocument();
  });

  it('5. отключён, когда передан prop disabled=true', () => {
    render(<TestWrapper
      config={baseConfig}
      disabled={true} />);
    const switchEl = screen.getByRole('switch');
    expect(switchEl).toBeDisabled();
  });

  it('6. рендерит с текстом для состояния включено', () => {
    const config: SwitchFieldConfig = {
      ...baseConfig,
      checkedText: 'Yes',
      uncheckedText: 'No',
    };
    render(<TestWrapper config={config} />);
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('7. отображает ошибку конфигурации при невалидном конфиге', () => {
    const invalidConfig = {
      type: 'switch',
      name: '',
      label: '',
    } as SwitchFieldConfig;

    render(<TestWrapper config={invalidConfig} />);
    expect(screen.getByText('Невозможно отобразить поле')).toBeInTheDocument();
  });

  it('8. рендерит с defaultValue=true', async () => {
    const config: SwitchFieldConfig = {
      ...baseConfig,
      defaultValue: true,
    };
    render(<TestWrapper config={config} />);
    const switchEl = screen.getByRole('switch');
    expect(switchEl).toHaveAttribute('aria-checked', 'true');
  });

  it('9. по умолчанию false, если defaultValue не передан', () => {
    render(<TestWrapper config={baseConfig} />);
    const switchEl = screen.getByRole('switch');
    expect(switchEl).toHaveAttribute('aria-checked', 'false');
  });

  it('10. по умолчанию false, если defaultValue равен undefined', () => {
    const config: SwitchFieldConfig = {
      ...baseConfig,
      defaultValue: undefined,
    };
    render(<TestWrapper config={config} />);
    const switchEl = screen.getByRole('switch');
    expect(switchEl).toHaveAttribute('aria-checked', 'false');
  });
});
