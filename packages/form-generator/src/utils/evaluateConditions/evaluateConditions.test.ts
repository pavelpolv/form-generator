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

    it('should handle ∅ (empty) operator with empty object', () => {
      const values: FormValues = { emptyObj: {} }
      const condition: ConditionValue = { field: 'emptyObj', condition: '∅' }
      expect(evaluateConditions(condition, values)).toBe(true)
    })

    it('should handle ∅ (empty) operator with number/boolean (not empty)', () => {
      const condition1: ConditionValue = { field: 'age', condition: '∅' }
      expect(evaluateConditions(condition1, formValues)).toBe(false)

      const condition2: ConditionValue = { field: 'active', condition: '∅' }
      expect(evaluateConditions(condition2, formValues)).toBe(false)
    })

    it('should handle includes operator for arrays', () => {
      const values: FormValues = { tags: ['react', 'vue', 'angular'] }
      const condition: ConditionValue = { field: 'tags', condition: 'includes', value: 'react' }
      expect(evaluateConditions(condition, values)).toBe(true)

      const condition2: ConditionValue = { field: 'tags', condition: 'includes', value: 'svelte' }
      expect(evaluateConditions(condition2, values)).toBe(false)
    })

    it('should return false for includes with non-string/non-array left value', () => {
      const condition: ConditionValue = { field: 'age', condition: 'includes', value: '2' }
      expect(evaluateConditions(condition, formValues)).toBe(false)
    })

    it('should return false for startsWith with non-string values', () => {
      const condition: ConditionValue = { field: 'age', condition: 'startsWith', value: '2' }
      expect(evaluateConditions(condition, formValues)).toBe(false)
    })

    it('should return false for endsWith with non-string values', () => {
      const condition: ConditionValue = { field: 'age', condition: 'endsWith', value: '5' }
      expect(evaluateConditions(condition, formValues)).toBe(false)
    })

    it('should return false for match with non-string values', () => {
      const condition: ConditionValue = { field: 'age', condition: 'match', value: '\\d+' }
      expect(evaluateConditions(condition, formValues)).toBe(false)
    })

    it('should return false for unknown operator', () => {
      const condition = { field: 'age', condition: 'unknown' as any, value: 25 }
      expect(evaluateConditions(condition, formValues)).toBe(false)
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

    it('should return false when depth exceeds 50', () => {
      // Build a deeply nested condition group (>50 levels)
      let condition: ConditionGroup = {
        comparisonType: 'and',
        children: [{ field: 'x', condition: '===', value: 1 }],
      }
      for (let i = 0; i < 55; i++) {
        condition = {
          comparisonType: 'and',
          children: [condition],
        }
      }
      expect(evaluateConditions(condition, { x: 1 })).toBe(false)
    })

    it('should return false for unknown comparisonType', () => {
      const condition = {
        comparisonType: 'xor' as any,
        children: [{ field: 'x', condition: '===', value: 1 }],
      }
      expect(evaluateConditions(condition, { x: 1 })).toBe(false)
    })

    it('should return false for invalid child in ConditionGroup', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: 'x', condition: '===', value: 1 },
          { something: 'invalid' } as any,
        ],
      }
      expect(evaluateConditions(condition, { x: 1 })).toBe(false)
    })

    it('should return false for invalid condition object', () => {
      const condition = { invalid: 'object' } as any
      expect(evaluateConditions(condition, {})).toBe(false)
    })

    it('should handle ISO date string without milliseconds', () => {
      const formValues: FormValues = {
        date1: '2024-01-15T10:00:00Z',
        date2: '2024-02-20T10:00:00.000Z',
      }
      const condition: ConditionValue = {
        field: 'date1',
        condition: '<',
        value: '$date2',
      }
      expect(evaluateConditions(condition, formValues)).toBe(true)
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

    it('should collect messages from OR group where all conditions fail', () => {
      const condition: ConditionGroup = {
        comparisonType: 'or',
        children: [
          { field: 'age', condition: '>=', value: 18, message: 'Must be 18 or older' },
          { field: 'email', condition: '!∅', message: 'Email is required' },
        ],
      }
      const messages = collectValidationMessages(condition, formValues)
      expect(messages).toContain('Must be 18 or older')
      expect(messages).toContain('Email is required')
    })

    it('should collect messages from nested groups', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          {
            comparisonType: 'or',
            children: [
              { field: 'age', condition: '>=', value: 18, message: 'Age must be >= 18' },
              { field: 'email', condition: '!∅', message: 'Need email' },
            ],
          },
        ],
      }
      const messages = collectValidationMessages(condition, formValues)
      expect(messages.length).toBeGreaterThan(0)
    })

    it('should return empty messages when group condition passes', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: 'age', condition: '>=', value: 10, message: 'Must be 10+' },
        ],
      }
      const messages = collectValidationMessages(condition, formValues)
      expect(messages).toEqual([])
    })

    it('should not collect message from failed condition without message', () => {
      const condition: ConditionValue = {
        field: 'age',
        condition: '>=',
        value: 18,
      }
      const messages = collectValidationMessages(condition, formValues)
      expect(messages).toEqual([])
    })

    it('should only collect messages from failed children in AND group (skip passing children)', () => {
      // AND group fails because one child fails, but another child passes.
      // The passing child should NOT have its message collected (covers !allResults[index] == false branch)
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: 'age', condition: '>=', value: 18, message: 'Must be 18+' }, // passes (age=10 < 18 → fails)
          { field: 'name', condition: '!∅', message: 'Name required' }, // passes (name='John' → not empty)
        ],
      }
      // age=10 fails >=18, name='John' passes !∅
      const messages = collectValidationMessages(condition, { age: 10, name: 'John' })
      // Only the failing child's message should be collected
      expect(messages).toContain('Must be 18+')
      expect(messages).not.toContain('Name required')
    })

    it('should handle invalid child in group during message collection', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: 'age', condition: '>=', value: 18, message: 'Must be 18 or older' },
          { something: 'invalid' } as any,
        ],
      }
      const messages = collectValidationMessages(condition, formValues)
      expect(messages).toContain('Must be 18 or older')
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

    it('should skip ConditionValue with empty/falsy field name', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: '', condition: '===', value: 'test' },
          { field: 'validField', condition: '===', value: 'test' },
        ],
      }
      const fields = collectFieldsFromCondition(condition)
      // Empty string is falsy, so it should be skipped
      expect(fields).toEqual(['validField'])
    })

    it('should return empty array for invalid condition', () => {
      const condition = { invalid: 'object' } as any
      const fields = collectFieldsFromCondition(condition)
      expect(fields).toEqual([])
    })

    it('should handle error during field collection (catch block)', () => {
      // Create a condition group that passes type guard but throws during iteration
      const badGroup = {
        comparisonType: 'and',
        children: null as any, // forEach on null will throw
      }
      // Wrap in a valid group so the outer checks pass but inner collect throws
      const condition = {
        comparisonType: 'and',
        children: [badGroup],
      } as any
      const fields = collectFieldsFromCondition(condition)
      expect(fields).toEqual([])
    })
  })

  describe('error handling - catch blocks', () => {
    it('should catch error in evaluateConditions main try-catch', () => {
      // Create a condition that passes type guard but throws during evaluation
      const condition = {
        field: 'x',
        condition: '===',
      }
      // Override the field getter to throw after type guard check
      Object.defineProperty(condition, 'field', {
        get() { throw new Error('getter error') },
        enumerable: true,
      })
      expect(evaluateConditions(condition as any, {})).toBe(false)
    })

    it('should catch error in collectValidationMessages', () => {
      const badGroup = {
        comparisonType: 'and',
        children: null as any,
      }
      const condition = {
        comparisonType: 'and',
        children: [badGroup],
      } as any
      const messages = collectValidationMessages(condition, { x: 1 })
      expect(messages).toEqual([])
    })

    it('should catch error in compareValues outer try-catch', () => {
      // Use a value with a valueOf that throws to trigger error in getComparableValue -> Number()
      const throwingValue = {
        valueOf() { throw new Error('valueOf error') },
        toString() { throw new Error('toString error') },
      }
      const formValues: FormValues = { x: throwingValue }
      const condition: ConditionValue = { field: 'x', condition: '<', value: 10 }
      expect(evaluateConditions(condition, formValues)).toBe(false)
    })
  })
})
