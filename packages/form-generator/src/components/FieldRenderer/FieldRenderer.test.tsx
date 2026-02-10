import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { FieldRenderer } from './FieldRenderer'
import { Field } from '@/types'

const TestWrapper = ({ field, error, disabled }: { field: Field; error?: string; disabled?: boolean }) => {
  const { control } = useForm()
  return <FieldRenderer field={field} control={control} error={error} disabled={disabled} />
}

describe('FieldRenderer', () => {
  it('should render input field', () => {
    const field: Field = { type: 'input', name: 'test', label: 'Test Input' }
    render(<TestWrapper field={field} />)
    expect(screen.getByText('Test Input')).toBeInTheDocument()
  })

  it('should render inputNumber field', () => {
    const field: Field = { type: 'inputNumber', name: 'num', label: 'Test Number' }
    render(<TestWrapper field={field} />)
    expect(screen.getByText('Test Number')).toBeInTheDocument()
  })

  it('should render select field', () => {
    const field: Field = {
      type: 'select',
      name: 'sel',
      label: 'Test Select',
      options: [{ label: 'Option 1', value: 'opt1' }],
    }
    render(<TestWrapper field={field} />)
    expect(screen.getByText('Test Select')).toBeInTheDocument()
  })

  it('should render switch field', () => {
    const field: Field = { type: 'switch', name: 'sw', label: 'Test Switch' }
    render(<TestWrapper field={field} />)
    expect(screen.getByText('Test Switch')).toBeInTheDocument()
  })

  it('should render date field', () => {
    const field: Field = { type: 'date', name: 'dt', label: 'Test Date' }
    render(<TestWrapper field={field} />)
    expect(screen.getByText('Test Date')).toBeInTheDocument()
  })

  it('should return null and log error for unknown field type', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const field = { type: 'unknown', name: 'unk', label: 'Unknown' } as any
    const { container } = render(<TestWrapper field={field} />)
    expect(container.querySelector('.ant-form-item')).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown field type'))
    consoleSpy.mockRestore()
  })

  it('should pass error prop to field', () => {
    const field: Field = { type: 'input', name: 'test', label: 'Test' }
    render(<TestWrapper field={field} error="Required field" />)
    expect(screen.getByText('Required field')).toBeInTheDocument()
  })

  it('should pass disabled prop to field', () => {
    const field: Field = { type: 'input', name: 'test', label: 'Test', placeholder: 'Enter' }
    render(<TestWrapper field={field} disabled={true} />)
    expect(screen.getByPlaceholderText('Enter')).toBeDisabled()
  })
})
