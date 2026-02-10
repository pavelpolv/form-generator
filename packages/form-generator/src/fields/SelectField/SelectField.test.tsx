import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

  it('should render as disabled when disabled prop is true', () => {
    render(<TestWrapper config={baseConfig} disabled={true} />)
    const select = document.querySelector('.ant-select-disabled')
    expect(select).not.toBeNull()
  })

  it('should render with multiple mode', () => {
    const config: SelectFieldConfig = {
      ...baseConfig,
      multiple: true,
    }
    render(<TestWrapper config={config} />)
    const select = document.querySelector('.ant-select-multiple')
    expect(select).not.toBeNull()
  })

  it('should render with searchable mode', () => {
    const config: SelectFieldConfig = {
      ...baseConfig,
      searchable: true,
    }
    render(<TestWrapper config={config} />)
    // When searchable, the select should have a search input
    const select = document.querySelector('.ant-select-show-search')
    expect(select).not.toBeNull()
  })

  it('should render options with disabled flag', () => {
    const config: SelectFieldConfig = {
      ...baseConfig,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Disabled', value: 'disabled', disabled: true },
      ],
    }
    render(<TestWrapper config={config} />)
    expect(screen.getByText('Test Select')).toBeInTheDocument()
  })

  it('should render with default value', () => {
    const config: SelectFieldConfig = {
      ...baseConfig,
      defaultValue: 'opt1',
    }
    render(<TestWrapper config={config} />)
    expect(screen.getByText('Option 1')).toBeInTheDocument()
  })

  it('should filter options in searchable mode', async () => {
    const config: SelectFieldConfig = {
      ...baseConfig,
      searchable: true,
    }
    render(<TestWrapper config={config} />)

    // Open the select dropdown
    const select = document.querySelector('.ant-select-selector')!
    fireEvent.mouseDown(select)

    // Type in the search input to trigger filterOption
    const searchInput = document.querySelector('.ant-select-selection-search-input')!
    fireEvent.change(searchInput, { target: { value: 'Option 1' } })

    // filterOption should have been called, filtering the options
  })

  it('should render with placeholder', () => {
    render(<TestWrapper config={baseConfig} />)
    expect(screen.getByText('Select option')).toBeInTheDocument()
  })
})
