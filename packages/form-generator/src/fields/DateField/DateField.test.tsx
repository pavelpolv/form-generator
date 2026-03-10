import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { DateField } from './DateField';
import { DateField as DateFieldConfig } from '@/types';

// Компонент-обёртка для предоставления контекста react-hook-form
const TestWrapper = ({
  config,
  error,
  disabled,
  defaultValues = {},
}: {
  config: DateFieldConfig
  error?: string
  disabled?: boolean
  defaultValues?: Record<string, any>
}) => {
  const { control } = useForm({ defaultValues });

  return <DateField
    config={config}
    control={control}
    error={error}
    disabled={disabled} />;
};

describe('DateField', () => {
  const baseConfig: DateFieldConfig = {
    type: 'date',
    name: 'testDate',
    label: 'Test Date',
    placeholder: 'Select date',
  };

  it('1. рендерит с лейблом', () => {
    render(<TestWrapper config={baseConfig} />);
    expect(screen.getByText('Test Date')).toBeInTheDocument();
  });

  it('2. рендерит с плейсхолдером', () => {
    render(<TestWrapper config={baseConfig} />);
    expect(screen.getByPlaceholderText('Select date')).toBeInTheDocument();
  });

  it('3. отображает сообщение об ошибке', () => {
    render(<TestWrapper
      config={baseConfig}
      error="Date is required" />);
    expect(screen.getByText('Date is required')).toBeInTheDocument();
  });

  it('4. отключён, когда передан prop disabled=true', () => {
    render(<TestWrapper
      config={baseConfig}
      disabled={true} />);
    const input = screen.getByPlaceholderText('Select date');
    expect(input).toBeDisabled();
  });

  it('5. отображает ошибку конфигурации при невалидном конфиге', () => {
    const invalidConfig = {
      type: 'date',
      name: '',
      label: '',
    } as DateFieldConfig;

    render(<TestWrapper config={invalidConfig} />);
    expect(screen.getByText('Невозможно отобразить поле')).toBeInTheDocument();
  });

  it('6. рендерит с кастомным форматом', () => {
    const config: DateFieldConfig = {
      ...baseConfig,
      format: 'DD/MM/YYYY',
    };
    render(<TestWrapper config={config} />);
    expect(screen.getByPlaceholderText('Select date')).toBeInTheDocument();
  });

  it('7. рендерит с showTime=true', () => {
    const config: DateFieldConfig = {
      ...baseConfig,
      showTime: true,
    };
    render(<TestWrapper config={config} />);
    expect(screen.getByPlaceholderText('Select date')).toBeInTheDocument();
  });

  it('8. рендерит с disabledDateBefore', () => {
    const config: DateFieldConfig = {
      ...baseConfig,
      disabledDateBefore: new Date('2024-06-01'),
    };
    render(<TestWrapper config={config} />);
    expect(screen.getByPlaceholderText('Select date')).toBeInTheDocument();
  });

  it('9. рендерит с disabledDateAfter', () => {
    const config: DateFieldConfig = {
      ...baseConfig,
      disabledDateAfter: new Date('2024-12-31'),
    };
    render(<TestWrapper config={config} />);
    expect(screen.getByPlaceholderText('Select date')).toBeInTheDocument();
  });

  it('10. рендерит с одновременно disabledDateBefore и disabledDateAfter', () => {
    const config: DateFieldConfig = {
      ...baseConfig,
      disabledDateBefore: new Date('2024-01-01'),
      disabledDateAfter: new Date('2024-12-31'),
    };
    render(<TestWrapper config={config} />);
    expect(screen.getByPlaceholderText('Select date')).toBeInTheDocument();
  });

  it('11. отображает существующее значение из формы', () => {
    const config: DateFieldConfig = {
      ...baseConfig,
    };
    render(
      <TestWrapper
        config={config}
        defaultValues={{ testDate: '2024-06-15T10:00:00.000Z' }}
      />,
    );
    // DatePicker должен показывать дату
    const input = screen.getByPlaceholderText('Select date');
    expect(input).toHaveValue('2024-06-15');
  });

  it('12. обрабатывает выбор даты через onChange', async () => {
    render(<TestWrapper config={baseConfig} />);
    const input = screen.getByPlaceholderText('Select date');

    // Открываем датапикер
    fireEvent.mouseDown(input);

    // Кликаем по ячейке с сегодняшней датой, чтобы вызвать onChange с датой
    const todayCell = document.querySelector('.ant-picker-cell-today .ant-picker-cell-inner');
    expect(todayCell).not.toBeNull();
    fireEvent.click(todayCell!);
  });

  it('13. обрабатывает очистку даты (onChange с null)', async () => {
    render(
      <TestWrapper
        config={baseConfig}
        defaultValues={{ testDate: '2024-06-15T10:00:00.000Z' }}
      />,
    );

    // Наводим курсор на пикер, чтобы показалась кнопка очистки
    const picker = document.querySelector('.ant-picker')!;
    fireEvent.mouseEnter(picker);

    // Находим и кликаем по кнопке очистки
    const clearBtn = document.querySelector('.ant-picker-clear');
    expect(clearBtn).not.toBeNull();
    fireEvent.mouseDown(clearBtn!);
    fireEvent.click(clearBtn!);
  });

  it('14. вызывает функцию disabledDate при открытии пикера с disabledDateBefore', async () => {
    const config: DateFieldConfig = {
      ...baseConfig,
      disabledDateBefore: new Date('2099-01-01'),
    };
    render(<TestWrapper config={config} />);
    const input = screen.getByPlaceholderText('Select date');

    // Открываем датапикер — это вызывает disabledDate для каждой видимой даты
    fireEvent.mouseDown(input);

    // Даты должны быть отрисованы, и многие из них должны быть отключены
    const disabledCells = document.querySelectorAll('.ant-picker-cell-disabled');
    expect(disabledCells.length).toBeGreaterThan(0);
  });

  it('15. вызывает функцию disabledDate при открытии пикера с disabledDateAfter', async () => {
    const config: DateFieldConfig = {
      ...baseConfig,
      disabledDateAfter: new Date('2000-01-01'),
    };
    render(<TestWrapper config={config} />);
    const input = screen.getByPlaceholderText('Select date');

    // Открываем датапикер
    fireEvent.mouseDown(input);

    // Даты должны быть отрисованы, многие из них отключены
    const disabledCells = document.querySelectorAll('.ant-picker-cell-disabled');
    expect(disabledCells.length).toBeGreaterThan(0);
  });

  it('16. показывает кнопку очистки когда allowClear=true и дата выбрана', () => {
    const config: DateFieldConfig = {
      ...baseConfig,
      allowClear: true,
    };
    render(
      <TestWrapper
        config={config}
        defaultValues={{ testDate: '2024-06-15T10:00:00.000Z' }}
      />,
    );
    const picker = document.querySelector('.ant-picker')!;
    fireEvent.mouseEnter(picker);
    const clearBtn = document.querySelector('.ant-picker-clear');
    expect(clearBtn).not.toBeNull();
  });

  it('17. скрывает кнопку очистки когда allowClear=false', () => {
    const config: DateFieldConfig = {
      ...baseConfig,
      allowClear: false,
    };
    render(
      <TestWrapper
        config={config}
        defaultValues={{ testDate: '2024-06-15T10:00:00.000Z' }}
      />,
    );
    const picker = document.querySelector('.ant-picker')!;
    fireEvent.mouseEnter(picker);
    const clearBtn = document.querySelector('.ant-picker-clear');
    expect(clearBtn).toBeNull();
  });
});
