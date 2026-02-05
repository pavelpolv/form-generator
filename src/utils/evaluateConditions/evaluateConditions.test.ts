import { describe, it, expect } from 'vitest'
import { evaluateConditions, collectValidationMessages, collectFieldsFromCondition } from './evaluateConditions'
import { ConditionGroup, ConditionValue, FormValues } from '@/types'

describe('evaluateConditions', () => {
  describe('ConditionValue - comparison operators', () => {
    const formValues: FormValues = {
      age: 25,
      price: 100,
      name: 'John',
      email: 'test@example.com',
      active: true,
      emptyString: '',
      emptyArray: [],
      nullValue: null,
    }

    it('should handle < operator', () => {
      const condition: ConditionValue = { field: 'age', condition: '<', value: 30 }
      expect(evaluateConditions(condition, formValues)).toBe(true)

      const condition2: ConditionValue = { field: 'age', condition: '<', value: 20 }
      expect(evaluateConditions(condition2, formValues)).toBe(false)
    })

    it('should handle > operator', () => {
      const condition: ConditionValue = { field: 'age', condition: '>', value: 20 }
      expect(evaluateConditions(condition, formValues)).toBe(true)

      const condition2: ConditionValue = { field: 'age', condition: '>', value: 30 }
      expect(evaluateConditions(condition2, formValues)).toBe(false)
    })

    it('should handle <= operator', () => {
      const condition: ConditionValue = { field: 'age', condition: '<=', value: 25 }
      expect(evaluateConditions(condition, formValues)).toBe(true)

      const condition2: ConditionValue = { field: 'age', condition: '<=', value: 24 }
      expect(evaluateConditions(condition2, formValues)).toBe(false)
    })

    it('should handle >= operator', () => {
      const condition: ConditionValue = { field: 'age', condition: '>=', value: 25 }
      expect(evaluateConditions(condition, formValues)).toBe(true)

      const condition2: ConditionValue = { field: 'age', condition: '>=', value: 26 }
      expect(evaluateConditions(condition2, formValues)).toBe(false)
    })

    it('should handle === operator', () => {
      const condition: ConditionValue = { field: 'age', condition: '===', value: 25 }
      expect(evaluateConditions(condition, formValues)).toBe(true)

      const condition2: ConditionValue = { field: 'name', condition: '===', value: 'John' }
      expect(evaluateConditions(condition2, formValues)).toBe(true)

      const condition3: ConditionValue = { field: 'age', condition: '===', value: 30 }
      expect(evaluateConditions(condition3, formValues)).toBe(false)
    })

    it('should handle !== operator', () => {
      const condition: ConditionValue = { field: 'age', condition: '!==', value: 30 }
      expect(evaluateConditions(condition, formValues)).toBe(true)

      const condition2: ConditionValue = { field: 'age', condition: '!==', value: 25 }
      expect(evaluateConditions(condition2, formValues)).toBe(false)
    })

    it('should handle ∅ (empty) operator', () => {
      const condition1: ConditionValue = { field: 'emptyString', condition: '∅' }
      expect(evaluateConditions(condition1, formValues)).toBe(true)

      const condition2: ConditionValue = { field: 'emptyArray', condition: '∅' }
      expect(evaluateConditions(condition2, formValues)).toBe(true)

      const condition3: ConditionValue = { field: 'nullValue', condition: '∅' }
      expect(evaluateConditions(condition3, formValues)).toBe(true)

      const condition4: ConditionValue = { field: 'name', condition: '∅' }
      expect(evaluateConditions(condition4, formValues)).toBe(false)
    })

    it('should handle !∅ (not empty) operator', () => {
      const condition1: ConditionValue = { field: 'name', condition: '!∅' }
      expect(evaluateConditions(condition1, formValues)).toBe(true)

      const condition2: ConditionValue = { field: 'emptyString', condition: '!∅' }
      expect(evaluateConditions(condition2, formValues)).toBe(false)

      const condition3: ConditionValue = { field: 'nullValue', condition: '!∅' }
      expect(evaluateConditions(condition3, formValues)).toBe(false)
    })

    it('should handle includes operator', () => {
      const condition1: ConditionValue = { field: 'email', condition: 'includes', value: '@' }
      expect(evaluateConditions(condition1, formValues)).toBe(true)

      const condition2: ConditionValue = { field: 'email', condition: 'includes', value: 'example' }
      expect(evaluateConditions(condition2, formValues)).toBe(true)

      const condition3: ConditionValue = { field: 'email', condition: 'includes', value: 'notfound' }
      expect(evaluateConditions(condition3, formValues)).toBe(false)
    })

    it('should handle startsWith operator', () => {
      const condition1: ConditionValue = { field: 'email', condition: 'startsWith', value: 'test' }
      expect(evaluateConditions(condition1, formValues)).toBe(true)

      const condition2: ConditionValue = { field: 'email', condition: 'startsWith', value: '@' }
      expect(evaluateConditions(condition2, formValues)).toBe(false)
    })

    it('should handle endsWith operator', () => {
      const condition1: ConditionValue = { field: 'email', condition: 'endsWith', value: '.com' }
      expect(evaluateConditions(condition1, formValues)).toBe(true)

      const condition2: ConditionValue = { field: 'email', condition: 'endsWith', value: '.org' }
      expect(evaluateConditions(condition2, formValues)).toBe(false)
    })

    it('should handle match operator', () => {
      const condition1: ConditionValue = { field: 'email', condition: 'match', value: '^test.*\\.com$' }
      expect(evaluateConditions(condition1, formValues)).toBe(true)

      const condition2: ConditionValue = { field: 'email', condition: 'match', value: '^admin' }
      expect(evaluateConditions(condition2, formValues)).toBe(false)
    })
  })

  describe('Field references with $ prefix', () => {
    const formValues: FormValues = {
      password: 'secret123',
      confirmPassword: 'secret123',
      minAge: 18,
      userAge: 25,
    }

    it('should compare field with another field using $ prefix', () => {
      const condition: ConditionValue = {
        field: 'password',
        condition: '===',
        value: '$confirmPassword',
      }
      expect(evaluateConditions(condition, formValues)).toBe(true)
    })

    it('should handle field reference in numeric comparison', () => {
      const condition: ConditionValue = {
        field: 'userAge',
        condition: '>=',
        value: '$minAge',
      }
      expect(evaluateConditions(condition, formValues)).toBe(true)
    })

    it('should return false when field references do not match', () => {
      const values: FormValues = {
        password: 'secret123',
        confirmPassword: 'different',
      }
      const condition: ConditionValue = {
        field: 'password',
        condition: '===',
        value: '$confirmPassword',
      }
      expect(evaluateConditions(condition, values)).toBe(false)
    })
  })

  describe('ConditionGroup - and/or logic', () => {
    const formValues: FormValues = {
      age: 25,
      country: 'USA',
      isPremium: false,
    }

    it('should handle AND group (all conditions must pass)', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: 'age', condition: '>=', value: 18 },
          { field: 'country', condition: '===', value: 'USA' },
        ],
      }
      expect(evaluateConditions(condition, formValues)).toBe(true)
    })

    it('should return false for AND group if one condition fails', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: 'age', condition: '>=', value: 18 },
          { field: 'country', condition: '===', value: 'UK' },
        ],
      }
      expect(evaluateConditions(condition, formValues)).toBe(false)
    })

    it('should handle OR group (at least one condition must pass)', () => {
      const condition: ConditionGroup = {
        comparisonType: 'or',
        children: [
          { field: 'isPremium', condition: '===', value: true },
          { field: 'age', condition: '>=', value: 18 },
        ],
      }
      expect(evaluateConditions(condition, formValues)).toBe(true)
    })

    it('should return false for OR group if all conditions fail', () => {
      const condition: ConditionGroup = {
        comparisonType: 'or',
        children: [
          { field: 'isPremium', condition: '===', value: true },
          { field: 'age', condition: '<', value: 18 },
        ],
      }
      expect(evaluateConditions(condition, formValues)).toBe(false)
    })

    it('should handle nested condition groups', () => {
      const condition: ConditionGroup = {
        comparisonType: 'or',
        children: [
          { field: 'isPremium', condition: '===', value: true },
          {
            comparisonType: 'and',
            children: [
              { field: 'age', condition: '>=', value: 18 },
              { field: 'country', condition: '===', value: 'USA' },
            ],
          },
        ],
      }
      expect(evaluateConditions(condition, formValues)).toBe(true)
    })
  })

  describe('Edge cases and error handling', () => {
    it('should return true when condition is undefined', () => {
      expect(evaluateConditions(undefined, {})).toBe(true)
    })

    it('should not crash when field does not exist', () => {
      const condition: ConditionValue = {
        field: 'nonExistentField',
        condition: '===',
        value: 'test',
      }
      expect(evaluateConditions(condition, {})).toBe(false)
    })

    it('should handle empty ConditionGroup children', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [],
      }
      expect(evaluateConditions(condition, {})).toBe(false)
    })

    it('should handle invalid regex pattern', () => {
      const condition: ConditionValue = {
        field: 'email',
        condition: 'match',
        value: '[invalid(regex',
      }
      const formValues = { email: 'test@example.com' }
      expect(evaluateConditions(condition, formValues)).toBe(false)
    })
  })

  describe('Date comparisons', () => {
    it('should handle date comparison with < operator', () => {
      const formValues: FormValues = {
        startDate: '2024-01-15T10:00:00.000Z',
        endDate: '2024-02-20T10:00:00.000Z',
      }
      const condition: ConditionValue = {
        field: 'startDate',
        condition: '<',
        value: '$endDate',
      }
      expect(evaluateConditions(condition, formValues)).toBe(true)
    })

    it('should handle date comparison with > operator', () => {
      const formValues: FormValues = {
        startDate: '2024-02-20T10:00:00.000Z',
        endDate: '2024-01-15T10:00:00.000Z',
      }
      const condition: ConditionValue = {
        field: 'startDate',
        condition: '>',
        value: '$endDate',
      }
      expect(evaluateConditions(condition, formValues)).toBe(true)
    })

    it('should handle date comparison with <= operator', () => {
      const formValues: FormValues = {
        startDate: '2024-01-15T10:00:00.000Z',
        endDate: '2024-02-20T10:00:00.000Z',
      }
      const condition: ConditionValue = {
        field: 'startDate',
        condition: '<=',
        value: '$endDate',
      }
      expect(evaluateConditions(condition, formValues)).toBe(true)
    })

    it('should handle date comparison with >= operator', () => {
      const formValues: FormValues = {
        startDate: '2024-02-20T10:00:00.000Z',
        endDate: '2024-01-15T10:00:00.000Z',
      }
      const condition: ConditionValue = {
        field: 'startDate',
        condition: '>=',
        value: '$endDate',
      }
      expect(evaluateConditions(condition, formValues)).toBe(true)
    })

    it('should validate date range correctly', () => {
      const formValues: FormValues = {
        startDate: '2024-01-15T10:00:00.000Z',
        endDate: '2024-02-20T10:00:00.000Z',
      }
      const condition: ConditionValue = {
        field: 'startDate',
        condition: '<=',
        value: '$endDate',
        message: 'Start date must be before or equal to end date',
      }
      expect(evaluateConditions(condition, formValues)).toBe(true)
    })

    it('should fail when start date is after end date', () => {
      const formValues: FormValues = {
        startDate: '2024-02-20T10:00:00.000Z',
        endDate: '2024-01-15T10:00:00.000Z',
      }
      const condition: ConditionValue = {
        field: 'startDate',
        condition: '<=',
        value: '$endDate',
        message: 'Start date must be before or equal to end date',
      }
      expect(evaluateConditions(condition, formValues)).toBe(false)
    })
  })

  describe('collectValidationMessages', () => {
    const formValues: FormValues = {
      age: 15,
      email: '',
    }

    it('should collect message from failed condition', () => {
      const condition: ConditionValue = {
        field: 'age',
        condition: '>=',
        value: 18,
        message: 'Must be 18 or older',
      }
      const messages = collectValidationMessages(condition, formValues)
      expect(messages).toEqual(['Must be 18 or older'])
    })

    it('should collect messages from AND group', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: 'age', condition: '>=', value: 18, message: 'Must be 18 or older' },
          { field: 'email', condition: '!∅', message: 'Email is required' },
        ],
      }
      const messages = collectValidationMessages(condition, formValues)
      expect(messages).toContain('Must be 18 or older')
      expect(messages).toContain('Email is required')
    })

    it('should return empty array when all conditions pass', () => {
      const condition: ConditionValue = {
        field: 'age',
        condition: '>=',
        value: 10,
        message: 'Must be 10 or older',
      }
      const messages = collectValidationMessages(condition, formValues)
      expect(messages).toEqual([])
    })

    it('should return empty array when condition is undefined', () => {
      const messages = collectValidationMessages(undefined, formValues)
      expect(messages).toEqual([])
    })
  })

  describe('collectFieldsFromCondition', () => {
    it('should collect field from simple condition', () => {
      const condition: ConditionValue = {
        field: 'age',
        condition: '>=',
        value: 18,
      }
      const fields = collectFieldsFromCondition(condition)
      expect(fields).toEqual(['age'])
    })

    it('should collect field and referenced field ($prefix)', () => {
      const condition: ConditionValue = {
        field: 'minPrice',
        condition: '<=',
        value: '$maxPrice',
      }
      const fields = collectFieldsFromCondition(condition)
      expect(fields).toContain('minPrice')
      expect(fields).toContain('maxPrice')
      expect(fields).toHaveLength(2)
    })

    it('should collect all fields from AND group', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: 'email', condition: '!∅' },
          { field: 'age', condition: '>=', value: 18 },
        ],
      }
      const fields = collectFieldsFromCondition(condition)
      expect(fields).toContain('email')
      expect(fields).toContain('age')
      expect(fields).toHaveLength(2)
    })

    it('should collect all fields from OR group', () => {
      const condition: ConditionGroup = {
        comparisonType: 'or',
        children: [
          { field: 'isPremium', condition: '===', value: true },
          { field: 'isAdmin', condition: '===', value: true },
        ],
      }
      const fields = collectFieldsFromCondition(condition)
      expect(fields).toContain('isPremium')
      expect(fields).toContain('isAdmin')
      expect(fields).toHaveLength(2)
    })

    it('should collect fields from nested groups', () => {
      const condition: ConditionGroup = {
        comparisonType: 'or',
        children: [
          {
            comparisonType: 'and',
            children: [
              { field: 'minPrice', condition: '∅' },
              { field: 'maxPrice', condition: '∅' },
            ],
          },
          {
            field: 'minPrice',
            condition: '<=',
            value: '$maxPrice',
          },
        ],
      }
      const fields = collectFieldsFromCondition(condition)
      expect(fields).toContain('minPrice')
      expect(fields).toContain('maxPrice')
      expect(fields).toHaveLength(2)
    })

    it('should return empty array for undefined condition', () => {
      const fields = collectFieldsFromCondition(undefined)
      expect(fields).toEqual([])
    })

    it('should return unique field names', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: 'age', condition: '>=', value: 18 },
          { field: 'age', condition: '<=', value: 100 },
        ],
      }
      const fields = collectFieldsFromCondition(condition)
      expect(fields).toEqual(['age'])
    })
  })
})
