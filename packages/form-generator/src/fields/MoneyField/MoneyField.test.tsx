import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { MoneyField } from './MoneyField';
import { MoneyField as MoneyFieldConfig } from '@/types';

// Обёртка для предоставления контекста react-hook-form
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

  it('должен рендерить с лейблом', () => {
    render(<TestWrapper config={baseConfig} />);
    expect(screen.getByText('Test Money')).toBeInTheDocument();
  });

  it('должен рендерить с плейсхолдером', () => {
    render(<TestWrapper config={baseConfig} />);
    expect(screen.getByPlaceholderText('Enter amount')).toBeInTheDocument();
  });

  it('должен рендерить текстовый инпут (не числовой)', () => {
    render(<TestWrapper config={baseConfig} />);
    const input = screen.getByPlaceholderText('Enter amount');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('должен форматировать с пробелами сразу во время ввода', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const input = screen.getByPlaceholderText('Enter amount');
    await user.type(input, '12345');

    // Пробелы добавляются при вводе, а не только при потере фокуса
    expect(input).toHaveValue('12 345');
  });

  it('должен форматировать с пробелами-разделителями тысяч при потере фокуса', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const input = screen.getByPlaceholderText('Enter amount');
    await user.type(input, '1234567');
    await user.tab(); // вызываем blur

    expect(input).toHaveValue('1 234 567,00');
  });

  it('должен обрабатывать ввод дробной части через запятую', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const input = screen.getByPlaceholderText('Enter amount');
    await user.type(input, '1234,56');
    await user.tab();

    expect(input).toHaveValue('1 234,56');
  });

  it('должен учитывать конфигурацию decimalPlaces', async () => {
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

  it('должен отображать префикс', () => {
    const config: MoneyFieldConfig = {
      ...baseConfig,
      prefix: '$',
    };
    render(<TestWrapper config={config} />);
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('должен отображать суффикс', () => {
    const config: MoneyFieldConfig = {
      ...baseConfig,
      suffix: 'RUB',
    };
    render(<TestWrapper config={config} />);
    expect(screen.getByText('RUB')).toBeInTheDocument();
  });

  it('должен допускать отрицательные значения, когда allowNegative=true', async () => {
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

  it('должен запрещать знак минуса, когда allowNegative=false', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const input = screen.getByPlaceholderText('Enter amount');
    await user.type(input, '-1000');
    await user.tab();

    // Минус фильтруется
    expect(input).toHaveValue('1 000,00');
  });

  it('должен отображать сообщение об ошибке', () => {
    render(<TestWrapper
      config={baseConfig}
      error="Amount is required" />);
    expect(screen.getByText('Amount is required')).toBeInTheDocument();
  });

  it('должен быть заблокирован, когда disabled=true', () => {
    render(<TestWrapper
      config={baseConfig}
      disabled={true} />);
    const input = screen.getByPlaceholderText('Enter amount');
    expect(input).toBeDisabled();
  });

  it('должен отображать ошибку конфигурации при невалидном конфиге', () => {
    const invalidConfig = {
      type: 'money',
      name: '',
      label: '',
    } as MoneyFieldConfig;

    render(<TestWrapper config={invalidConfig} />);
    expect(screen.getByText('Невозможно отобразить поле')).toBeInTheDocument();
  });

  it('должен конвертировать пустой инпут в undefined при потере фокуса', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const input = screen.getByPlaceholderText('Enter amount');
    await user.type(input, '42');
    await user.clear(input);
    await user.tab();

    expect(input).toHaveValue('');
  });

  it('должен рендерить с дефолтным значением', () => {
    const config: MoneyFieldConfig = {
      ...baseConfig,
      defaultValue: 5000,
    };
    render(<TestWrapper config={config} />);
    const input = screen.getByPlaceholderText('Enter amount');
    expect(input).toHaveValue('5 000,00');
  });

  it('должен ограничивать значение снизу по min', async () => {
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

  it('должен ограничивать значение сверху по max', async () => {
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

  it('должен корректно обрабатывать нечисловой ввод', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const input = screen.getByPlaceholderText('Enter amount');
    await user.type(input, 'abc');
    await user.tab();

    // Нечисловые символы отфильтровываются, результат — пустая строка
    expect(input).toHaveValue('');
  });

  it('должен убирать лишние знаки минуса, когда allowNegative=true', async () => {
    const user = userEvent.setup();
    const config: MoneyFieldConfig = {
      ...baseConfig,
      allowNegative: true,
    };
    render(<TestWrapper config={config} />);

    const input = screen.getByPlaceholderText('Enter amount');
    // Вводим значение с минусом в середине: дополнительные минусы фильтруются
    await user.type(input, '-1-2-3');
    await user.tab();

    // Только ведущий минус сохраняется, остальные удаляются
    expect(input).toHaveValue('-123,00');
  });

  it('должен обрабатывать ввод только запятой', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const input = screen.getByPlaceholderText('Enter amount');
    await user.type(input, ',');
    await user.tab();

    expect(input).toHaveValue('');
  });

  it('должен обрабатывать несколько запятых, оставляя только первую', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const input = screen.getByPlaceholderText('Enter amount');
    await user.type(input, '12,34,56');
    await user.tab();

    // Допускается только одна запятая, вторая отбрасывается → 12,3456 → разбирается как 12.3456
    expect(input).toHaveValue('12,35');
  });

  it('должен обрабатывать положительные значения, когда allowNegative=true', async () => {
    const user = userEvent.setup();
    const config: MoneyFieldConfig = {
      ...baseConfig,
      allowNegative: true,
    };
    render(<TestWrapper config={config} />);

    const input = screen.getByPlaceholderText('Enter amount');
    await user.type(input, '500');
    await user.tab();

    // Без знака минуса всё должно работать в штатном режиме
    expect(input).toHaveValue('500,00');
  });

  it('должен обрабатывать курсор в середине значения (ветка прерывания цикла курсора)', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);

    const input = screen.getByPlaceholderText('Enter amount') as HTMLInputElement;
    await user.type(input, '1234');

    // Симулируем редактирование в середине: устанавливаем selectionStart перед срабатыванием change
    // Значение «1 234», симулируем вставку «5» на позицию 1 → «15 234»
    Object.defineProperty(input, 'selectionStart', { value: 2, writable: true, configurable: true });
    fireEvent.change(input, { target: { value: '15 234' } });

    // Должна была сработать ветка прерывания курсора
    expect(input).toHaveValue('15 234');
  });

  it('должен корректно обрабатывать selectionStart=null (фолбэк ?? 0)', async () => {
    render(<TestWrapper config={baseConfig} />);

    const input = screen.getByPlaceholderText('Enter amount') as HTMLInputElement;

    // Устанавливаем selectionStart=null для вызова фолбэка ?? 0
    Object.defineProperty(input, 'selectionStart', { value: null, writable: true, configurable: true });
    fireEvent.change(input, { target: { value: '999' } });

    // При selectionStart=null, sigCharsBefore=0, курсор остаётся на 0
    // Значение всё равно должно быть отформатировано
    expect(input).toHaveValue('999');
  });
});
