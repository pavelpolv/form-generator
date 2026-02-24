import { describe, it, expect, vi, afterEach } from 'vitest';
import { evaluateComputedValue } from './evaluateComputedValue';
import { ComputedValueConfig, FormValues } from '@/types';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('evaluateComputedValue', () => {
  describe('совпадение с кейсом', () => {
    it('должен возвращать значение из первого совпавшего кейса', () => {
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

    it('должен пропускать несовпавший кейс и использовать второй совпавший', () => {
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

    it('должен возвращать { shouldUpdate: false } когда нет совпавших кейсов и нет default', () => {
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

    it('должен использовать default когда нет совпавших кейсов', () => {
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

    it('должен использовать default: null и возвращать { shouldUpdate: true, value: null }', () => {
      const config: ComputedValueConfig = {
        cases: [],
        default: null,
      };
      const formValues: FormValues = {};
      expect(evaluateComputedValue(config, formValues)).toEqual({ shouldUpdate: true, value: null });
    });

    it('должен обрабатывать пустые кейсы с default', () => {
      const config: ComputedValueConfig = {
        cases: [],
        default: 42,
      };
      const formValues: FormValues = {};
      expect(evaluateComputedValue(config, formValues)).toEqual({ shouldUpdate: true, value: 42 });
    });
  });

  describe('литеральные значения', () => {
    it('должен возвращать строковый литерал', () => {
      const config: ComputedValueConfig = {
        cases: [
          { condition: { field: 'x', condition: '===', value: 1 }, value: 'hello' },
        ],
      };
      expect(evaluateComputedValue(config, { x: 1 })).toEqual({ shouldUpdate: true, value: 'hello' });
    });

    it('должен возвращать числовой литерал', () => {
      const config: ComputedValueConfig = {
        cases: [
          { condition: { field: 'x', condition: '===', value: 1 }, value: 99 },
        ],
      };
      expect(evaluateComputedValue(config, { x: 1 })).toEqual({ shouldUpdate: true, value: 99 });
    });

    it('должен возвращать булев литерал', () => {
      const config: ComputedValueConfig = {
        cases: [
          { condition: { field: 'x', condition: '===', value: 1 }, value: true },
        ],
      };
      expect(evaluateComputedValue(config, { x: 1 })).toEqual({ shouldUpdate: true, value: true });
    });

    it('должен возвращать null литерал', () => {
      const config: ComputedValueConfig = {
        cases: [
          { condition: { field: 'x', condition: '===', value: 1 }, value: null },
        ],
      };
      expect(evaluateComputedValue(config, { x: 1 })).toEqual({ shouldUpdate: true, value: null });
    });
  });

  describe('разрешение $fieldRef', () => {
    it('должен разрешать $fieldRef в значение формы', () => {
      const config: ComputedValueConfig = {
        cases: [
          { condition: { field: 'enabled', condition: '===', value: true }, value: '$source' },
        ],
      };
      const formValues: FormValues = { enabled: true, source: 'copied-value' };
      expect(evaluateComputedValue(config, formValues)).toEqual({ shouldUpdate: true, value: 'copied-value' });
    });
  });

  describe('арифметические выражения', () => {
    it('должен вычислять сложение с литералами', () => {
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

    it('должен вычислять вычитание с литералами', () => {
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

    it('должен вычислять умножение с литералами', () => {
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

    it('должен вычислять деление с литералами', () => {
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

    it('должен разрешать операнды $fieldRef в арифметике', () => {
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

    it('должен возвращать null когда левый операнд равен null', () => {
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

    it('должен возвращать null когда операнд $fieldRef равен undefined', () => {
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

    it('должен возвращать null при делении на ноль', () => {
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

    it('должен возвращать null для нечисловых операндов и логировать ошибку', () => {
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

  describe('типы условий', () => {
    it('должен работать с ConditionGroup (кейс 1: category+enabled → orderType)', () => {
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

      // Оба условия выполняются
      expect(evaluateComputedValue(config, { category: 'B', enabled: true }))
        .toEqual({ shouldUpdate: true, value: 'manual' });

      // Только одно условие выполняется → default
      expect(evaluateComputedValue(config, { category: 'B', enabled: false }))
        .toEqual({ shouldUpdate: true, value: 'auto' });

      // Ни одно условие не выполняется → default
      expect(evaluateComputedValue(config, { category: 'A', enabled: false }))
        .toEqual({ shouldUpdate: true, value: 'auto' });
    });

    it('должен работать с арифметикой (кейс 2: value1*value2 если enabled, иначе null)', () => {
      const config: ComputedValueConfig = {
        cases: [
          {
            condition: { field: 'enabled', condition: '===', value: true },
            value: { left: '$value1', operator: '*', right: '$value2' },
          },
        ],
        default: null,
      };

      // Включено: вычисляем произведение
      expect(evaluateComputedValue(config, { enabled: true, value1: 6, value2: 7 }))
        .toEqual({ shouldUpdate: true, value: 42 });

      // Выключено: возвращаем null
      expect(evaluateComputedValue(config, { enabled: false, value1: 6, value2: 7 }))
        .toEqual({ shouldUpdate: true, value: null });
    });
  });
});
