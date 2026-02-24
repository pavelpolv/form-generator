import { vi, describe, it, expect } from 'vitest';

// Создаём бросающий прокси, имитирующий ошибку итерации Proxy в react-hook-form
const throwingProxy = new Proxy({} as Record<string, boolean>, {
  ownKeys() { throw new Error('Proxy iteration error'); },
  getOwnPropertyDescriptor() { throw new Error('Proxy iteration error'); },
});

// Мокаем useFormState, возвращая touchedFields в виде прокси, бросающего ошибку при итерации
vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual<typeof import('react-hook-form')>('react-hook-form');

  return {
    ...actual,
    useFormState: () => ({
      touchedFields: throwingProxy,
      isDirty: false,
      isValid: true,
      dirtyFields: {},
      errors: {},
      isSubmitted: false,
      isSubmitting: false,
      isSubmitSuccessful: false,
      submitCount: 0,
      isValidating: false,
      isLoading: false,
    }),
  };
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormGenerator } from './FormGenerator';
import { FormConfig } from '@/types';

const simpleConfig: FormConfig = {
  groups: [
    {
      name: 'Test Group',
      fields: [
        { type: 'input', name: 'field1', label: 'Field 1', placeholder: 'Enter' },
      ],
    },
  ],
};

describe('FormGenerator - обработка ошибок Proxy в touchedFields', () => {
  it('должен рендериться без падения когда итерация Proxy бросает исключение', () => {
    // Блок catch в FormGenerator корректно обрабатывает ошибки итерации Proxy
    render(<FormGenerator config={simpleConfig} />);
    expect(screen.getByText('Test Group')).toBeInTheDocument();
    expect(screen.getByText('Field 1')).toBeInTheDocument();
  });
});
