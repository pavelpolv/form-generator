import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { InputField } from './InputField'
import { InputField as InputFieldConfig } from '@/types'

// Wrapper component to provide react-hook-form context
const TestWrapper = ({ config, error, disabled }: { config: InputFieldConfig; error?: string; disabled?: boolean }) => {
  const { control } = useForm()
  return <InputField config={config} control={control} error={error} disabled={disabled} />
}

describe('InputField', () => {
  const baseConfig: InputFieldConfig = {
    type: 'input',
    name: 'testField',
    label: 'Test Label',
    placeholder: 'Enter value',
    inputType: 'text',
  }

  it('should render with label', () => {
    render(<TestWrapper config={baseConfig} />)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should render with placeholder', () => {
    render(<TestWrapper config={baseConfig} />)
    expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument()
  })

  it('should render text input by default', () => {
    render(<TestWrapper config={baseConfig} />)
    const input = screen.getByPlaceholderText('Enter value')
    expect(input).toHaveAttribute('type', 'text')
  })

  it('should render password input', () => {
    const config: InputFieldConfig = {
      ...baseConfig,
      inputType: 'password',
    }
    render(<TestWrapper config={config} />)
    const input = screen.getByPlaceholderText('Enter value')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('should allow user input', async () => {
    const user = userEvent.setup()
    render(<TestWrapper config={baseConfig} />)

    const input = screen.getByPlaceholderText('Enter value')
    await user.type(input, 'test value')

    expect(input).toHaveValue('test value')
  })

  it('should display error message', () => {
    render(<TestWrapper config={baseConfig} error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<TestWrapper config={baseConfig} disabled={true} />)
    const input = screen.getByPlaceholderText('Enter value')
    expect(input).toBeDisabled()
  })

  it('should display config error for invalid config', () => {
    const invalidConfig = {
      type: 'input',
      name: '',
      label: '',
    } as InputFieldConfig

    render(<TestWrapper config={invalidConfig} />)
    expect(screen.getByText('Невозможно отобразить поле')).toBeInTheDocument()
  })

  it('should render with default value', () => {
    const config: InputFieldConfig = {
      ...baseConfig,
      defaultValue: 'default text',
    }
    render(<TestWrapper config={config} />)
    const input = screen.getByPlaceholderText('Enter value')
    expect(input).toHaveValue('default text')
  })

  it('should render email input type', () => {
    const config: InputFieldConfig = {
      ...baseConfig,
      inputType: 'email',
    }
    render(<TestWrapper config={config} />)
    const input = screen.getByPlaceholderText('Enter value')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('should render with maxLength attribute', () => {
    const config: InputFieldConfig = {
      ...baseConfig,
      maxLength: 50,
    }
    render(<TestWrapper config={config} />)
    const input = screen.getByPlaceholderText('Enter value')
    expect(input).toHaveAttribute('maxlength', '50')
  })
})
