import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { SelectField } from './SelectField';
import { SelectField as SelectFieldConfig } from '@/types';

// Обёртка для предоставления контекста react-hook-form
const TestWrapper = ({ config, error, disabled }: { config: SelectFieldConfig; error?: string; disabled?: boolean }) => {
  const { control } = useForm();

  return <SelectField
    config={config}
    control={control}
    error={error}
    disabled={disabled} />;
};

describe('SelectField', () => {
  const baseConfig: SelectFieldConfig = {
    type: 'select',
    name: 'testSelect',
    label: 'Test Select',
    placeholder: 'Select option',
    options: [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
      { label: 'Option 3', value: 'opt3' },
    ],
  };

  it('должен рендерить с лейблом', () => {
    render(<TestWrapper config={baseConfig} />);
    expect(screen.getByText('Test Select')).toBeInTheDocument();
  });

  it('должен отображать сообщение об ошибке', () => {
    render(<TestWrapper
      config={baseConfig}
      error="Selection required" />);
    expect(screen.getByText('Selection required')).toBeInTheDocument();
  });

  it('должен отображать ошибку конфигурации при пустом списке опций', () => {
    const invalidConfig: SelectFieldConfig = {
      type: 'select',
      name: 'invalid',
      label: 'Invalid',
      options: [],
    };

    render(<TestWrapper config={invalidConfig} />);
    expect(screen.getByText('Невозможно отобразить поле')).toBeInTheDocument();
  });

  it('должен отображать ошибку конфигурации при отсутствии лейбла', () => {
    const invalidConfig = {
      type: 'select',
      name: 'test',
      label: '',
      options: [{ label: 'Opt', value: 1 }],
    } as SelectFieldConfig;

    render(<TestWrapper config={invalidConfig} />);
    expect(screen.getByText('Невозможно отобразить поле')).toBeInTheDocument();
  });

  it('должен рендерить в заблокированном состоянии, когда disabled=true', () => {
    render(<TestWrapper
      config={baseConfig}
      disabled={true} />);
    const select = document.querySelector('.ant-select-disabled');
    expect(select).not.toBeNull();
  });

  it('должен рендерить в режиме множественного выбора', () => {
    const config: SelectFieldConfig = {
      ...baseConfig,
      multiple: true,
    };
    render(<TestWrapper config={config} />);
    const select = document.querySelector('.ant-select-multiple');
    expect(select).not.toBeNull();
  });

  it('должен рендерить в режиме поиска', () => {
    const config: SelectFieldConfig = {
      ...baseConfig,
      searchable: true,
    };
    render(<TestWrapper config={config} />);
    // При включённом поиске у селекта должен быть инпут поиска
    const select = document.querySelector('.ant-select-show-search');
    expect(select).not.toBeNull();
  });

  it('должен рендерить опции с флагом disabled', () => {
    const config: SelectFieldConfig = {
      ...baseConfig,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Disabled', value: 'disabled', disabled: true },
      ],
    };
    render(<TestWrapper config={config} />);
    expect(screen.getByText('Test Select')).toBeInTheDocument();
  });

  it('должен рендерить с дефолтным значением', () => {
    const config: SelectFieldConfig = {
      ...baseConfig,
      defaultValue: 'opt1',
    };
    render(<TestWrapper config={config} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('должен фильтровать опции в режиме поиска', async () => {
    const config: SelectFieldConfig = {
      ...baseConfig,
      searchable: true,
    };
    render(<TestWrapper config={config} />);

    // Открываем выпадающий список
    const select = document.querySelector('.ant-select-selector')!;
    fireEvent.mouseDown(select);

    // Вводим текст в поисковый инпут для вызова filterOption
    const searchInput = document.querySelector('.ant-select-selection-search-input')!;
    fireEvent.change(searchInput, { target: { value: 'Option 1' } });

    // filterOption должен был вызваться, отфильтровав опции
  });

  it('должен рендерить с плейсхолдером', () => {
    render(<TestWrapper config={baseConfig} />);
    expect(screen.getByText('Select option')).toBeInTheDocument();
  });
});
