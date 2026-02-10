import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { SwitchField } from './SwitchField'
import { SwitchField as SwitchFieldConfig } from '@/types'

// Wrapper component to provide react-hook-form context
const TestWrapper = ({ config, error, disabled }: { config: SwitchFieldConfig; error?: string; disabled?: boolean }) => {
  const { control } = useForm()
  return <SwitchField config={config} control={control} error={error} disabled={disabled} />
}

describe('SwitchField', () => {
  const baseConfig: SwitchFieldConfig = {
    type: 'switch',
    name: 'testSwitch',
    label: 'Test Switch',
  }

  it('should render with label', () => {
    render(<TestWrapper config={baseConfig} />)
    expect(screen.getByText('Test Switch')).toBeInTheDocument()
  })

  it('should render switch element', () => {
    render(<TestWrapper config={baseConfig} />)
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('should toggle on click', async () => {
    const user = userEvent.setup()
    render(<TestWrapper config={baseConfig} />)

    const switchEl = screen.getByRole('switch')
    expect(switchEl).toHaveAttribute('aria-checked', 'false')

    await user.click(switchEl)
    expect(switchEl).toHaveAttribute('aria-checked', 'true')
  })

  it('should display error message', () => {
    render(<TestWrapper config={baseConfig} error="You must agree" />)
    expect(screen.getByText('You must agree')).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<TestWrapper config={baseConfig} disabled={true} />)
    const switchEl = screen.getByRole('switch')
    expect(switchEl).toBeDisabled()
  })

  it('should render with checked text', () => {
    const config: SwitchFieldConfig = {
      ...baseConfig,
      checkedText: 'Yes',
      uncheckedText: 'No',
    }
    render(<TestWrapper config={config} />)
    expect(screen.getByText('No')).toBeInTheDocument()
  })

  it('should display config error for invalid config', () => {
    const invalidConfig = {
      type: 'switch',
      name: '',
      label: '',
    } as SwitchFieldConfig

    render(<TestWrapper config={invalidConfig} />)
    expect(screen.getByText('Невозможно отобразить поле')).toBeInTheDocument()
  })

  it('should render with default value true', async () => {
    const config: SwitchFieldConfig = {
      ...baseConfig,
      defaultValue: true,
    }
    render(<TestWrapper config={config} />)
    const switchEl = screen.getByRole('switch')
    expect(switchEl).toHaveAttribute('aria-checked', 'true')
  })

  it('should default to false when no defaultValue provided', () => {
    render(<TestWrapper config={baseConfig} />)
    const switchEl = screen.getByRole('switch')
    expect(switchEl).toHaveAttribute('aria-checked', 'false')
  })

  it('should default to false when defaultValue is undefined', () => {
    const config: SwitchFieldConfig = {
      ...baseConfig,
      defaultValue: undefined,
    }
    render(<TestWrapper config={config} />)
    const switchEl = screen.getByRole('switch')
    expect(switchEl).toHaveAttribute('aria-checked', 'false')
  })
})
