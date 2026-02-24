import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { FieldRenderer } from './FieldRenderer';
import { Field } from '@/types';

const TestWrapper = ({ field, error, disabled }: { field: Field; error?: string; disabled?: boolean }) => {
  const { control } = useForm();

  return <FieldRenderer
    field={field}
    control={control}
    error={error}
    disabled={disabled} />;
};

describe('FieldRenderer', () => {
  it('должен рендерить поле input', () => {
    const field: Field = { type: 'input', name: 'test', label: 'Test Input' };
    render(<TestWrapper field={field} />);
    expect(screen.getByText('Test Input')).toBeInTheDocument();
  });

  it('должен рендерить поле inputNumber', () => {
    const field: Field = { type: 'inputNumber', name: 'num', label: 'Test Number' };
    render(<TestWrapper field={field} />);
    expect(screen.getByText('Test Number')).toBeInTheDocument();
  });

  it('должен рендерить поле select', () => {
    const field: Field = {
      type: 'select',
      name: 'sel',
      label: 'Test Select',
      options: [{ label: 'Option 1', value: 'opt1' }],
    };
    render(<TestWrapper field={field} />);
    expect(screen.getByText('Test Select')).toBeInTheDocument();
  });

  it('должен рендерить поле switch', () => {
    const field: Field = { type: 'switch', name: 'sw', label: 'Test Switch' };
    render(<TestWrapper field={field} />);
    expect(screen.getByText('Test Switch')).toBeInTheDocument();
  });

  it('должен рендерить поле date', () => {
    const field: Field = { type: 'date', name: 'dt', label: 'Test Date' };
    render(<TestWrapper field={field} />);
    expect(screen.getByText('Test Date')).toBeInTheDocument();
  });

  it('должен вернуть null и залогировать ошибку для неизвестного типа поля', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const field = { type: 'unknown', name: 'unk', label: 'Unknown' } as any;
    const { container } = render(<TestWrapper field={field} />);
    expect(container.querySelector('.ant-form-item')).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown field type'));
    consoleSpy.mockRestore();
  });

  it('должен передавать проп error в поле', () => {
    const field: Field = { type: 'input', name: 'test', label: 'Test' };
    render(<TestWrapper
      field={field}
      error="Required field" />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('должен передавать проп disabled в поле', () => {
    const field: Field = { type: 'input', name: 'test', label: 'Test', placeholder: 'Enter' };
    render(<TestWrapper
      field={field}
      disabled={true} />);
    expect(screen.getByPlaceholderText('Enter')).toBeDisabled();
  });

  it('должен рендерить поле textarea', () => {
    const field: Field = { type: 'textarea', name: 'desc', label: 'Description' };
    render(<TestWrapper field={field} />);
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('должен рендерить поле money', () => {
    const field: Field = { type: 'money', name: 'amount', label: 'Amount' };
    render(<TestWrapper field={field} />);
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });
});
