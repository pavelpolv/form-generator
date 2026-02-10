import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { DateField } from './DateField'
import { DateField as DateFieldConfig } from '@/types'
import moment from 'moment'

// Wrapper component to provide react-hook-form context
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
  const { control } = useForm({ defaultValues })
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

  it('should render with showTime=true', () => {
    const config: DateFieldConfig = {
      ...baseConfig,
      showTime: true,
    }
    render(<TestWrapper config={config} />)
    expect(screen.getByPlaceholderText('Select date')).toBeInTheDocument()
  })

  it('should render with disabledDateBefore', () => {
    const config: DateFieldConfig = {
      ...baseConfig,
      disabledDateBefore: new Date('2024-06-01'),
    }
    render(<TestWrapper config={config} />)
    expect(screen.getByPlaceholderText('Select date')).toBeInTheDocument()
  })

  it('should render with disabledDateAfter', () => {
    const config: DateFieldConfig = {
      ...baseConfig,
      disabledDateAfter: new Date('2024-12-31'),
    }
    render(<TestWrapper config={config} />)
    expect(screen.getByPlaceholderText('Select date')).toBeInTheDocument()
  })

  it('should render with both disabledDateBefore and disabledDateAfter', () => {
    const config: DateFieldConfig = {
      ...baseConfig,
      disabledDateBefore: new Date('2024-01-01'),
      disabledDateAfter: new Date('2024-12-31'),
    }
    render(<TestWrapper config={config} />)
    expect(screen.getByPlaceholderText('Select date')).toBeInTheDocument()
  })

  it('should display existing value from form', () => {
    const config: DateFieldConfig = {
      ...baseConfig,
    }
    render(
      <TestWrapper
        config={config}
        defaultValues={{ testDate: '2024-06-15T10:00:00.000Z' }}
      />
    )
    // DatePicker should show the date
    const input = screen.getByPlaceholderText('Select date')
    expect(input).toHaveValue('2024-06-15')
  })

  it('should handle date selection via onChange', async () => {
    render(<TestWrapper config={baseConfig} />)
    const input = screen.getByPlaceholderText('Select date')

    // Open the date picker
    fireEvent.mouseDown(input)

    // Click on a date cell (today) to trigger onChange with a date
    const todayCell = document.querySelector('.ant-picker-cell-today .ant-picker-cell-inner')
    expect(todayCell).not.toBeNull()
    fireEvent.click(todayCell!)
  })

  it('should handle clearing date (onChange with null)', async () => {
    render(
      <TestWrapper
        config={baseConfig}
        defaultValues={{ testDate: '2024-06-15T10:00:00.000Z' }}
      />
    )

    // Hover over the picker to reveal the clear button
    const picker = document.querySelector('.ant-picker')!
    fireEvent.mouseEnter(picker)

    // Find and click the clear button
    const clearBtn = document.querySelector('.ant-picker-clear')
    expect(clearBtn).not.toBeNull()
    fireEvent.mouseDown(clearBtn!)
    fireEvent.click(clearBtn!)
  })

  it('should call disabledDate function when picker is opened with disabledDateBefore', async () => {
    const config: DateFieldConfig = {
      ...baseConfig,
      disabledDateBefore: new Date('2099-01-01'),
    }
    render(<TestWrapper config={config} />)
    const input = screen.getByPlaceholderText('Select date')

    // Open the date picker - this triggers disabledDate for each visible date
    fireEvent.mouseDown(input)

    // Dates should be rendered, and many should be disabled
    const disabledCells = document.querySelectorAll('.ant-picker-cell-disabled')
    expect(disabledCells.length).toBeGreaterThan(0)
  })

  it('should call disabledDate function when picker is opened with disabledDateAfter', async () => {
    const config: DateFieldConfig = {
      ...baseConfig,
      disabledDateAfter: new Date('2000-01-01'),
    }
    render(<TestWrapper config={config} />)
    const input = screen.getByPlaceholderText('Select date')

    // Open the date picker
    fireEvent.mouseDown(input)

    // Dates should be rendered with many disabled
    const disabledCells = document.querySelectorAll('.ant-picker-cell-disabled')
    expect(disabledCells.length).toBeGreaterThan(0)
  })
})
