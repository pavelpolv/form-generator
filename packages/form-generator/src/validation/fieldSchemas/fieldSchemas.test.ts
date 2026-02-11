import { describe, it, expect } from 'vitest'
import {
  inputFieldSchema,
  inputNumberFieldSchema,
  selectFieldSchema,
  switchFieldSchema,
  dateFieldSchema,
  validateFieldConfig,
} from './fieldSchemas'

describe('fieldSchemas', () => {
  describe('inputFieldSchema', () => {
    it('should validate valid input config', () => {
      const config = {
        type: 'input',
        name: 'email',
        label: 'Email',
        placeholder: 'Enter email',
        inputType: 'text',
      }
      expect(() => inputFieldSchema.parse(config)).not.toThrow()
    })

    it('should validate password input type', () => {
      const config = {
        type: 'input',
        name: 'password',
        label: 'Password',
        inputType: 'password',
      }
      expect(() => inputFieldSchema.parse(config)).not.toThrow()
    })

    it('should fail without name', () => {
      const config = {
        type: 'input',
        name: '',
        label: 'Email',
      }
      expect(() => inputFieldSchema.parse(config)).toThrow()
    })

    it('should fail without label', () => {
      const config = {
        type: 'input',
        name: 'email',
        label: '',
      }
      expect(() => inputFieldSchema.parse(config)).toThrow()
    })

    it('should fail with invalid maxLength', () => {
      const config = {
        type: 'input',
        name: 'email',
        label: 'Email',
        maxLength: -5,
      }
      expect(() => inputFieldSchema.parse(config)).toThrow()
    })

    it('should fail with non-integer maxLength', () => {
      const config = {
        type: 'input',
        name: 'email',
        label: 'Email',
        maxLength: 5.5,
      }
      expect(() => inputFieldSchema.parse(config)).toThrow()
    })
  })

  describe('order property', () => {
    it('should accept order as a number', () => {
      const config = {
        type: 'input',
        name: 'field',
        label: 'Field',
        order: 5,
      }
      expect(() => inputFieldSchema.parse(config)).not.toThrow()
    })

    it('should accept config without order', () => {
      const config = {
        type: 'input',
        name: 'field',
        label: 'Field',
      }
      expect(() => inputFieldSchema.parse(config)).not.toThrow()
    })

    it('should reject non-number order', () => {
      const config = {
        type: 'input',
        name: 'field',
        label: 'Field',
        order: 'first',
      }
      expect(() => inputFieldSchema.parse(config)).toThrow()
    })
  })

  describe('inputNumberFieldSchema', () => {
    it('should validate valid inputNumber config', () => {
      const config = {
        type: 'inputNumber',
        name: 'age',
        label: 'Age',
        min: 0,
        max: 120,
        step: 1,
      }
      expect(() => inputNumberFieldSchema.parse(config)).not.toThrow()
    })

    it('should validate config without min/max/step', () => {
      const config = {
        type: 'inputNumber',
        name: 'quantity',
        label: 'Quantity',
      }
      expect(() => inputNumberFieldSchema.parse(config)).not.toThrow()
    })

    it('should fail with negative step', () => {
      const config = {
        type: 'inputNumber',
        name: 'price',
        label: 'Price',
        step: -0.1,
      }
      expect(() => inputNumberFieldSchema.parse(config)).toThrow()
    })

    it('should fail with zero step', () => {
      const config = {
        type: 'inputNumber',
        name: 'price',
        label: 'Price',
        step: 0,
      }
      expect(() => inputNumberFieldSchema.parse(config)).toThrow()
    })

    it('should allow decimal step', () => {
      const config = {
        type: 'inputNumber',
        name: 'price',
        label: 'Price',
        step: 0.01,
      }
      expect(() => inputNumberFieldSchema.parse(config)).not.toThrow()
    })
  })

  describe('selectFieldSchema', () => {
    it('should validate valid select config', () => {
      const config = {
        type: 'select',
        name: 'country',
        label: 'Country',
        options: [
          { label: 'USA', value: 'US' },
          { label: 'UK', value: 'UK' },
        ],
      }
      expect(() => selectFieldSchema.parse(config)).not.toThrow()
    })

    it('should validate multiple select', () => {
      const config = {
        type: 'select',
        name: 'countries',
        label: 'Countries',
        options: [{ label: 'USA', value: 'US' }],
        multiple: true,
        searchable: true,
      }
      expect(() => selectFieldSchema.parse(config)).not.toThrow()
    })

    it('should validate options with numeric values', () => {
      const config = {
        type: 'select',
        name: 'rating',
        label: 'Rating',
        options: [
          { label: 'One', value: 1 },
          { label: 'Two', value: 2 },
        ],
      }
      expect(() => selectFieldSchema.parse(config)).not.toThrow()
    })

    it('should validate options with disabled flag', () => {
      const config = {
        type: 'select',
        name: 'status',
        label: 'Status',
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive', disabled: true },
        ],
      }
      expect(() => selectFieldSchema.parse(config)).not.toThrow()
    })

    it('should fail with empty options array', () => {
      const config = {
        type: 'select',
        name: 'country',
        label: 'Country',
        options: [],
      }
      expect(() => selectFieldSchema.parse(config)).toThrow()
    })

    it('should fail with empty option label', () => {
      const config = {
        type: 'select',
        name: 'country',
        label: 'Country',
        options: [{ label: '', value: 'US' }],
      }
      expect(() => selectFieldSchema.parse(config)).toThrow()
    })
  })

  describe('switchFieldSchema', () => {
    it('should validate valid switch config', () => {
      const config = {
        type: 'switch',
        name: 'enabled',
        label: 'Enable Feature',
      }
      expect(() => switchFieldSchema.parse(config)).not.toThrow()
    })

    it('should validate switch with checked/unchecked text', () => {
      const config = {
        type: 'switch',
        name: 'agree',
        label: 'Agree',
        checkedText: 'Yes',
        uncheckedText: 'No',
      }
      expect(() => switchFieldSchema.parse(config)).not.toThrow()
    })

    it('should validate switch with default value', () => {
      const config = {
        type: 'switch',
        name: 'enabled',
        label: 'Enable',
        defaultValue: true,
      }
      expect(() => switchFieldSchema.parse(config)).not.toThrow()
    })
  })

  describe('dateFieldSchema', () => {
    it('should validate valid date config', () => {
      const config = {
        type: 'date',
        name: 'birthDate',
        label: 'Birth Date',
      }
      expect(() => dateFieldSchema.parse(config)).not.toThrow()
    })

    it('should validate date with format and showTime', () => {
      const config = {
        type: 'date',
        name: 'appointment',
        label: 'Appointment',
        format: 'YYYY-MM-DD HH:mm',
        showTime: true,
      }
      expect(() => dateFieldSchema.parse(config)).not.toThrow()
    })

    it('should validate date with disabled dates (string)', () => {
      const config = {
        type: 'date',
        name: 'futureDate',
        label: 'Future Date',
        disabledDateBefore: '2024-01-01T00:00:00.000Z',
        disabledDateAfter: '2024-12-31T23:59:59.999Z',
      }
      expect(() => dateFieldSchema.parse(config)).not.toThrow()
    })

    it('should validate date with disabled dates (Date object)', () => {
      const config = {
        type: 'date',
        name: 'pastDate',
        label: 'Past Date',
        disabledDateAfter: new Date(),
      }
      expect(() => dateFieldSchema.parse(config)).not.toThrow()
    })
  })

  describe('validateFieldConfig', () => {
    it('should return null for valid input config', () => {
      const config = {
        type: 'input',
        name: 'email',
        label: 'Email',
      }
      expect(validateFieldConfig(config)).toBeNull()
    })

    it('should return null for valid inputNumber config', () => {
      const config = {
        type: 'inputNumber',
        name: 'age',
        label: 'Age',
        min: 0,
      }
      expect(validateFieldConfig(config)).toBeNull()
    })

    it('should return null for valid select config', () => {
      const config = {
        type: 'select',
        name: 'country',
        label: 'Country',
        options: [{ label: 'USA', value: 'US' }],
      }
      expect(validateFieldConfig(config)).toBeNull()
    })

    it('should return null for valid switch config', () => {
      const config = {
        type: 'switch',
        name: 'enabled',
        label: 'Enabled',
      }
      expect(validateFieldConfig(config)).toBeNull()
    })

    it('should return null for valid date config', () => {
      const config = {
        type: 'date',
        name: 'date',
        label: 'Date',
      }
      expect(validateFieldConfig(config)).toBeNull()
    })

    it('should return error message for unknown field type', () => {
      const config = {
        type: 'unknown',
        name: 'field',
        label: 'Field',
      }
      expect(validateFieldConfig(config)).toBe('Unknown field type: unknown')
    })

    it('should return error message for invalid input config', () => {
      const config = {
        type: 'input',
        name: '',
        label: 'Email',
      }
      const error = validateFieldConfig(config)
      expect(error).not.toBeNull()
      expect(error).toContain('name')
    })

    it('should return error message for invalid select config', () => {
      const config = {
        type: 'select',
        name: 'country',
        label: 'Country',
        options: [],
      }
      const error = validateFieldConfig(config)
      expect(error).not.toBeNull()
      expect(error).toContain('options')
    })

    it('should return multiple errors joined', () => {
      const config = {
        type: 'input',
        name: '',
        label: '',
      }
      const error = validateFieldConfig(config)
      expect(error).not.toBeNull()
      expect(error).toContain('name')
      expect(error).toContain('label')
    })

    it('should return error for null config', () => {
      expect(validateFieldConfig(null)).toBe('Config must be an object')
    })

    it('should return error for number config', () => {
      expect(validateFieldConfig(42)).toBe('Config must be an object')
    })

    it('should return error for string config', () => {
      expect(validateFieldConfig('not an object')).toBe('Config must be an object')
    })

    it('should return error for object without type', () => {
      expect(validateFieldConfig({ name: 'test', label: 'Test' })).toBe('Config must have a type property')
    })

    it('should return error for object with non-string type', () => {
      expect(validateFieldConfig({ type: 123, name: 'test', label: 'Test' })).toBe('Config must have a type property')
    })

    it('should handle non-ZodError in catch', () => {
      // Create a config that would cause a non-Zod error by passing
      // an object with a getter that throws
      const config = {
        type: 'input',
        get name() { throw new Error('getter error') },
        label: 'Test',
      }
      const error = validateFieldConfig(config)
      expect(error).not.toBeNull()
    })
  })
})
