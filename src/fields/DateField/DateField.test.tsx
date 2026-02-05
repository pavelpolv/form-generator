import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { DateField } from './DateField'
import { DateField as DateFieldConfig } from '@/types'

// Wrapper component to provide react-hook-form context
const TestWrapper = ({ config, error, disabled }: { config: DateFieldConfig; error?: string; disabled?: boolean }) => {
  const { control } = useForm()
  return <DateField config={config} control={control} error={error} disabled={disabled} />
}

describe('DateField', () => {
  const baseConfig: DateFieldConfig = {
    type: 'date',
    name: 'testDate',
    label: 'Test Date',
    placeholder: 'Select date',
  }

  it('should render with label', () => {
    render(<TestWrapper config={baseConfig} />)
    expect(screen.getByText('Test Date')).toBeInTheDocument()
  })

  it('should render with placeholder', () => {
    render(<TestWrapper config={baseConfig} />)
    expect(screen.getByPlaceholderText('Select date')).toBeInTheDocument()
  })

  it('should display error message', () => {
    render(<TestWrapper config={baseConfig} error="Date is required" />)
    expect(screen.getByText('Date is required')).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<TestWrapper config={baseConfig} disabled={true} />)
    const input = screen.getByPlaceholderText('Select date')
    expect(input).toBeDisabled()
  })

  it('should display config error for invalid config', () => {
    const invalidConfig = {
      type: 'date',
      name: '',
      label: '',
    } as DateFieldConfig

    render(<TestWrapper config={invalidConfig} />)
    expect(screen.getByText('Невозможно отобразить поле')).toBeInTheDocument()
  })

  it('should render with custom format', () => {
    const config: DateFieldConfig = {
      ...baseConfig,
      format: 'DD/MM/YYYY',
    }
    render(<TestWrapper config={config} />)
    expect(screen.getByPlaceholderText('Select date')).toBeInTheDocument()
  })
})
