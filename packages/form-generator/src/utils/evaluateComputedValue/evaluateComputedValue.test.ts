import { describe, it, expect, vi, afterEach } from 'vitest';
import { evaluateComputedValue } from './evaluateComputedValue';
import { ComputedValueConfig, FormValues } from '@/types';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('evaluateComputedValue', () => {
  describe('case matching', () => {
    it('should return value from first matching case', () => {
      const config: ComputedValueConfig = {
        cases: [
          {
            condition: { field: 'type', condition: '===', value: 'A' },
            value: 'result-A',
          },
        ],
      };
      const formValues: FormValues = { type: 'A' };
      expect(evaluateComputedValue(config, formValues)).toEqual({ shouldUpdate: true, value: 'result-A' });
    });

    it('should skip non-matching case and use second matching case', () => {
      const config: ComputedValueConfig = {
        cases: [
          {
            condition: { field: 'type', condition: '===', value: 'A' },
            value: 'result-A',
          },
          {
            condition: { field: 'type', condition: '===', value: 'B' },
            value: 'result-B',
          },
        ],
      };
      const formValues: FormValues = { type: 'B' };
      expect(evaluateComputedValue(config, formValues)).toEqual({ shouldUpdate: true, value: 'result-B' });
    });

    it('should return { shouldUpdate: false } when no case matches and no default', () => {
      const config: ComputedValueConfig = {
        cases: [
          {
            condition: { field: 'type', condition: '===', value: 'A' },
            value: 'result-A',
          },
        ],
      };
      const formValues: FormValues = { type: 'X' };
      expect(evaluateComputedValue(config, formValues)).toEqual({ shouldUpdate: false });
    });

    it('should use default when no cases match', () => {
      const config: ComputedValueConfig = {
        cases: [
          {
            condition: { field: 'type', condition: '===', value: 'A' },
            value: 'result-A',
          },
        ],
        default: 'default-value',
      };
      const formValues: FormValues = { type: 'X' };
      expect(evaluateComputedValue(config, formValues)).toEqual({ shouldUpdate: true, value: 'default-value' });
    });

    it('should use default: null and return { shouldUpdate: true, value: null }', () => {
      const config: ComputedValueConfig = {
        cases: [],
        default: null,
      };
      const formValues: FormValues = {};
      expect(evaluateComputedValue(config, formValues)).toEqual({ shouldUpdate: true, value: null });
    });

    it('should handle empty cases with default', () => {
      const config: ComputedValueConfig = {
        cases: [],
        default: 42,
      };
      const formValues: FormValues = {};
      expect(evaluateComputedValue(config, formValues)).toEqual({ shouldUpdate: true, value: 42 });
    });
  });

  describe('literal values', () => {
    it('should return string literal', () => {
      const config: ComputedValueConfig = {
        cases: [
          { condition: { field: 'x', condition: '===', value: 1 }, value: 'hello' },
        ],
      };
      expect(evaluateComputedValue(config, { x: 1 })).toEqual({ shouldUpdate: true, value: 'hello' });
    });

    it('should return number literal', () => {
      const config: ComputedValueConfig = {
        cases: [
          { condition: { field: 'x', condition: '===', value: 1 }, value: 99 },
        ],
      };
      expect(evaluateComputedValue(config, { x: 1 })).toEqual({ shouldUpdate: true, value: 99 });
    });

    it('should return boolean literal', () => {
      const config: ComputedValueConfig = {
        cases: [
          { condition: { field: 'x', condition: '===', value: 1 }, value: true },
        ],
      };
      expect(evaluateComputedValue(config, { x: 1 })).toEqual({ shouldUpdate: true, value: true });
    });

    it('should return null literal', () => {
      const config: ComputedValueConfig = {
        cases: [
          { condition: { field: 'x', condition: '===', value: 1 }, value: null },
        ],
      };
      expect(evaluateComputedValue(config, { x: 1 })).toEqual({ shouldUpdate: true, value: null });
    });
  });

  describe('$fieldRef resolution', () => {
    it('should resolve $fieldRef to form value', () => {
      const config: ComputedValueConfig = {
        cases: [
          { condition: { field: 'enabled', condition: '===', value: true }, value: '$source' },
        ],
      };
      const formValues: FormValues = { enabled: true, source: 'copied-value' };
      expect(evaluateComputedValue(config, formValues)).toEqual({ shouldUpdate: true, value: 'copied-value' });
    });
  });

  describe('arithmetic expressions', () => {
    it('should compute addition with literals', () => {
      const config: ComputedValueConfig = {
        cases: [
          {
            condition: { field: 'active', condition: '===', value: true },
            value: { left: 3, operator: '+', right: 7 },
          },
        ],
      };
      expect(evaluateComputedValue(config, { active: true })).toEqual({ shouldUpdate: true, value: 10 });
    });

    it('should compute subtraction with literals', () => {
      const config: ComputedValueConfig = {
        cases: [
          {
            condition: { field: 'active', condition: '===', value: true },
            value: { left: 10, operator: '-', right: 3 },
          },
        ],
      };
      expect(evaluateComputedValue(config, { active: true })).toEqual({ shouldUpdate: true, value: 7 });
    });

    it('should compute multiplication with literals', () => {
      const config: ComputedValueConfig = {
        cases: [
          {
            condition: { field: 'active', condition: '===', value: true },
            value: { left: 4, operator: '*', right: 5 },
          },
        ],
      };
      expect(evaluateComputedValue(config, { active: true })).toEqual({ shouldUpdate: true, value: 20 });
    });

    it('should compute division with literals', () => {
      const config: ComputedValueConfig = {
        cases: [
          {
            condition: { field: 'active', condition: '===', value: true },
            value: { left: 20, operator: '/', right: 4 },
          },
        ],
      };
      expect(evaluateComputedValue(config, { active: true })).toEqual({ shouldUpdate: true, value: 5 });
    });

    it('should resolve $fieldRef operands in arithmetic', () => {
      const config: ComputedValueConfig = {
        cases: [
          {
            condition: { field: 'enabled', condition: '===', value: true },
            value: { left: '$value1', operator: '*', right: '$value2' },
          },
        ],
      };
      const formValues: FormValues = { enabled: true, value1: 3, value2: 4 };
      expect(evaluateComputedValue(config, formValues)).toEqual({ shouldUpdate: true, value: 12 });
    });

    it('should return null when left operand is null', () => {
      const config: ComputedValueConfig = {
        cases: [
          {
            condition: { field: 'active', condition: '===', value: true },
            value: { left: null, operator: '+', right: 5 },
          },
        ],
      };
      expect(evaluateComputedValue(config, { active: true })).toEqual({ shouldUpdate: true, value: null });
    });

    it('should return null when $fieldRef operand is undefined', () => {
      const config: ComputedValueConfig = {
        cases: [
          {
            condition: { field: 'active', condition: '===', value: true },
            value: { left: '$missing', operator: '+', right: 5 },
          },
        ],
      };
      expect(evaluateComputedValue(config, { active: true })).toEqual({ shouldUpdate: true, value: null });
    });

    it('should return null on division by zero', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const config: ComputedValueConfig = {
        cases: [
          {
            condition: { field: 'active', condition: '===', value: true },
            value: { left: 10, operator: '/', right: 0 },
          },
        ],
      };
      const result = evaluateComputedValue(config, { active: true });
      expect(result).toEqual({ shouldUpdate: true, value: null });
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('division by zero'));
    });

    it('should return null for non-numeric operands and log error', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const config: ComputedValueConfig = {
        cases: [
          {
            condition: { field: 'active', condition: '===', value: true },
            value: { left: 'not-a-number', operator: '+', right: 5 },
          },
        ],
      };
      const result = evaluateComputedValue(config, { active: true });
      expect(result).toEqual({ shouldUpdate: true, value: null });
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('non-numeric'), expect.anything());
    });
  });

  describe('condition types', () => {
    it('should work with ConditionGroup (case 1: category+enabled → orderType)', () => {
      const config: ComputedValueConfig = {
        cases: [
          {
            condition: {
              comparisonType: 'and',
              children: [
                { field: 'category', condition: '===', value: 'B' },
                { field: 'enabled', condition: '===', value: true },
              ],
            },
            value: 'manual',
          },
        ],
        default: 'auto',
      };

      // Both conditions met
      expect(evaluateComputedValue(config, { category: 'B', enabled: true }))
        .toEqual({ shouldUpdate: true, value: 'manual' });

      // Only one condition met → default
      expect(evaluateComputedValue(config, { category: 'B', enabled: false }))
        .toEqual({ shouldUpdate: true, value: 'auto' });

      // Neither condition met → default
      expect(evaluateComputedValue(config, { category: 'A', enabled: false }))
        .toEqual({ shouldUpdate: true, value: 'auto' });
    });

    it('should work with arithmetic (case 2: value1*value2 if enabled, else null)', () => {
      const config: ComputedValueConfig = {
        cases: [
          {
            condition: { field: 'enabled', condition: '===', value: true },
            value: { left: '$value1', operator: '*', right: '$value2' },
          },
        ],
        default: null,
      };

      // Enabled: compute product
      expect(evaluateComputedValue(config, { enabled: true, value1: 6, value2: 7 }))
        .toEqual({ shouldUpdate: true, value: 42 });

      // Disabled: return null
      expect(evaluateComputedValue(config, { enabled: false, value1: 6, value2: 7 }))
        .toEqual({ shouldUpdate: true, value: null });
    });
  });
});
