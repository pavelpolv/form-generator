import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import { DateField as DateFieldConfig } from '@/types';

// Мок antd DatePicker для прямого вызова колбэков onChange и disabledDate
vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');

  return {
    ...actual,
    DatePicker: (props: any) => {
      return (
        <div data-testid="mock-datepicker">
          <input
            placeholder={props.placeholder}
            disabled={props.disabled}
            readOnly={true}
          />
          <button
            data-testid="select-date"
            onClick={() => props.onChange?.(moment('2024-06-15'))}
          >
            Select
          </button>
          <button
            data-testid="clear-date"
            onClick={() => props.onChange?.(null)}
          >
            Clear
          </button>
          {props.disabledDate && (
            <button
              data-testid="check-disabled-null"
              onClick={() => {
                const result = props.disabledDate(null)
                 
                ;(document.querySelector('[data-testid="disabled-result"]') as HTMLElement).textContent = String(result);
              }}
            >
              Check null
            </button>
          )}
          <span data-testid="disabled-result"></span>
        </div>
      );
    },
  };
});

// DateField нужно импортировать ПОСЛЕ объявления мока
const { DateField } = await import('./DateField');

const TestWrapper = ({
  config,
  defaultValues = {},
}: {
  config: DateFieldConfig
  defaultValues?: Record<string, any>
}) => {
  const { control, watch } = useForm({ defaultValues });
  const currentValue = watch(config.name);

  return (
    <div>
      <DateField
        config={config}
        control={control} />
      <div data-testid="current-value">{currentValue ?? 'empty'}</div>
    </div>
  );
};

describe('DateField колбэки (с моком DatePicker)', () => {
  const baseConfig: DateFieldConfig = {
    type: 'date',
    name: 'testDate',
    label: 'Test Date',
    placeholder: 'Select date',
  };

  it('1. вызывает field.onChange с ISO-строкой при выборе даты', () => {
    render(<TestWrapper config={baseConfig} />);

    // Кликаем по кнопке мока "select date", которая напрямую вызывает onChange(moment('2024-06-15'))
    fireEvent.click(screen.getByTestId('select-date'));

    // Значение формы должно быть ISO-строкой (часовой пояс может сдвинуть дату)
    const value = screen.getByTestId('current-value').textContent!;
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(value).not.toBe('empty');
  });

  it('2. вызывает field.onChange с null при очистке даты', () => {
    render(<TestWrapper
      config={baseConfig}
      defaultValues={{ testDate: '2024-06-15T00:00:00.000Z' }} />);

    // Кликаем по кнопке мока "clear date", которая напрямую вызывает onChange(null)
    fireEvent.click(screen.getByTestId('clear-date'));

    const value = screen.getByTestId('current-value').textContent;
    expect(value).toBe('empty');
  });

  it('3. возвращает false из disabledDate, если current равен null/falsy', () => {
    const config: DateFieldConfig = {
      ...baseConfig,
      disabledDateBefore: new Date('2024-01-01'),
    };
    render(<TestWrapper config={config} />);

    // Кликаем по кнопке, которая вызывает disabledDate(null)
    fireEvent.click(screen.getByTestId('check-disabled-null'));

    const result = screen.getByTestId('disabled-result').textContent;
    expect(result).toBe('false');
  });
});
