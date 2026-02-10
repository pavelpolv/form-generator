import { vi, describe, it, expect } from 'vitest'

// Create a throwing proxy that simulates react-hook-form Proxy iteration failure
const throwingProxy = new Proxy({} as Record<string, boolean>, {
  ownKeys() { throw new Error('Proxy iteration error') },
  getOwnPropertyDescriptor() { throw new Error('Proxy iteration error') },
})

// Mock useFormState to return a touchedFields proxy that throws during iteration
vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual<typeof import('react-hook-form')>('react-hook-form')
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
  }
})

import React from 'react'
import { render, screen } from '@testing-library/react'
import { FormGenerator } from './FormGenerator'
import { FormConfig } from '@/types'

const simpleConfig: FormConfig = {
  groups: [
    {
      name: 'Test Group',
      fields: [
        { type: 'input', name: 'field1', label: 'Field 1', placeholder: 'Enter' },
      ],
    },
  ],
}

describe('FormGenerator - touchedFields Proxy error handling', () => {
  it('should render without crashing when Proxy iteration throws', () => {
    // The catch block in FormGenerator handles Proxy iteration errors gracefully
    render(<FormGenerator config={simpleConfig} />)
    expect(screen.getByText('Test Group')).toBeInTheDocument()
    expect(screen.getByText('Field 1')).toBeInTheDocument()
  })
})
