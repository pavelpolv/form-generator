import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { SelectField } from './SelectField'
import { SelectField as SelectFieldConfig } from '@/types'

// Wrapper component to provide react-hook-form context
const TestWrapper = ({ config, error, disabled }: { config: SelectFieldConfig; error?: string; disabled?: boolean }) => {
  const { control } = useForm()
  return <SelectField config={config} control={control} error={error} disabled={disabled} />
}

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
  }

  it('should render with label', () => {
    render(<TestWrapper config={baseConfig} />)
    expect(screen.getByText('Test Select')).toBeInTheDocument()
  })

  it('should display error message', () => {
    render(<TestWrapper config={baseConfig} error="Selection required" />)
    expect(screen.getByText('Selection required')).toBeInTheDocument()
  })

  it('should display config error for empty options', () => {
    const invalidConfig: SelectFieldConfig = {
      type: 'select',
      name: 'invalid',
      label: 'Invalid',
      options: [],
    }

    render(<TestWrapper config={invalidConfig} />)
    expect(screen.getByText('Невозможно отобразить поле')).toBeInTheDocument()
  })

  it('should display config error for missing label', () => {
    const invalidConfig = {
      type: 'select',
      name: 'test',
      label: '',
      options: [{ label: 'Opt', value: 1 }],
    } as SelectFieldConfig

    render(<TestWrapper config={invalidConfig} />)
    expect(screen.getByText('Невозможно отобразить поле')).toBeInTheDocument()
  })
})
