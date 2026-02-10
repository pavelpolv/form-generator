import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import moment from 'moment'
import { DateField as DateFieldConfig } from '@/types'

// Mock antd DatePicker to expose onChange and disabledDate callbacks directly
vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd')
  return {
    ...actual,
    DatePicker: (props: any) => {
      return (
        <div data-testid="mock-datepicker">
          <input
            placeholder={props.placeholder}
            disabled={props.disabled}
            readOnly
          />
          <button
            data-testid="select-date"
            onClick={() => props.onChange?.(moment('2024-06-15'))}
          >
            Select
          </button>
          <button
            data-testid="clear-date"
            onClick={() => props.onChange?.(null)}
          >
            Clear
          </button>
          {props.disabledDate && (
            <button
              data-testid="check-disabled-null"
              onClick={() => {
                const result = props.disabledDate(null)
                // eslint-disable-next-line no-extra-semi
                ;(document.querySelector('[data-testid="disabled-result"]') as HTMLElement).textContent = String(result)
              }}
            >
              Check null
            </button>
          )}
          <span data-testid="disabled-result"></span>
        </div>
      )
    },
  }
})

// Must import DateField AFTER the mock
const { DateField } = await import('./DateField')

const TestWrapper = ({
  config,
  defaultValues = {},
}: {
  config: DateFieldConfig
  defaultValues?: Record<string, any>
}) => {
  const { control, watch } = useForm({ defaultValues })
  const currentValue = watch(config.name)
  return (
    <div>
      <DateField config={config} control={control} />
      <div data-testid="current-value">{currentValue ?? 'empty'}</div>
    </div>
  )
}

describe('DateField callbacks (mocked DatePicker)', () => {
  const baseConfig: DateFieldConfig = {
    type: 'date',
    name: 'testDate',
    label: 'Test Date',
    placeholder: 'Select date',
  }

  it('should call field.onChange with ISO string when date is selected', () => {
    render(<TestWrapper config={baseConfig} />)

    // Click the mock "select date" button which directly calls onChange(moment('2024-06-15'))
    fireEvent.click(screen.getByTestId('select-date'))

    // The form value should now be an ISO string (timezone may shift the date)
    const value = screen.getByTestId('current-value').textContent!
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    expect(value).not.toBe('empty')
  })

  it('should call field.onChange with null when date is cleared', () => {
    render(<TestWrapper config={baseConfig} defaultValues={{ testDate: '2024-06-15T00:00:00.000Z' }} />)

    // Click the mock "clear date" button which directly calls onChange(null)
    fireEvent.click(screen.getByTestId('clear-date'))

    const value = screen.getByTestId('current-value').textContent
    expect(value).toBe('empty')
  })

  it('should return false from disabledDate when current is null/falsy', () => {
    const config: DateFieldConfig = {
      ...baseConfig,
      disabledDateBefore: new Date('2024-01-01'),
    }
    render(<TestWrapper config={config} />)

    // Click the button that calls disabledDate(null)
    fireEvent.click(screen.getByTestId('check-disabled-null'))

    const result = screen.getByTestId('disabled-result').textContent
    expect(result).toBe('false')
  })
})
