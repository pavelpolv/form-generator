import { vi, describe, it, expect } from 'vitest';

// Mock useFormState to return touchedFields with falsy values
// This covers the false branch of: hasOwnProperty.call(touchedFields, key) && touchedFields[key]
vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual<typeof import('react-hook-form')>('react-hook-form');

  return {
    ...actual,
    useFormState: () => ({
      touchedFields: { field1: false, field2: undefined },
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

describe('FormGenerator - touchedFields with falsy values', () => {
  it('should skip falsy touchedFields values without error', () => {
    render(<FormGenerator config={simpleConfig} />);
    expect(screen.getByText('Test Group')).toBeInTheDocument();
    expect(screen.getByText('Field 1')).toBeInTheDocument();
  });
});
