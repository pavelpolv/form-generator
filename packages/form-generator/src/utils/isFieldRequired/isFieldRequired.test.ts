import { describe, it, expect } from 'vitest';
import { isFieldRequired } from './isFieldRequired';
import { ConditionGroup, ConditionValue } from '@/types';

describe('isFieldRequired', () => {
  describe('отсутствие validateCondition', () => {
    it('должен возвращать false, если validateCondition не передан (undefined)', () => {
      expect(isFieldRequired(undefined, {})).toBe(false);
    });
  });

  describe('validateCondition без !∅', () => {
    it('должен возвращать false, если validateCondition не содержит !∅ (ConditionValue)', () => {
      const condition: ConditionValue = { field: 'type', condition: '===', value: 'business' };
      expect(isFieldRequired(condition, { type: 'business' })).toBe(false);
    });

    it('должен возвращать false, если validateCondition не содержит !∅ (ConditionGroup and)', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: 'type', condition: '===', value: 'business' },
          { field: 'age', condition: '>=', value: 18 },
        ],
      };
      expect(isFieldRequired(condition, { type: 'business', age: 20 })).toBe(false);
    });

    it('должен возвращать false, если validateCondition не содержит !∅ (ConditionGroup or)', () => {
      const condition: ConditionGroup = {
        comparisonType: 'or',
        children: [
          { field: 'type', condition: '===', value: 'business' },
          { field: 'type', condition: '===', value: 'enterprise' },
        ],
      };
      expect(isFieldRequired(condition, { type: 'business' })).toBe(false);
    });
  });

  describe('только !∅ — поле всегда обязательно', () => {
    it('должен возвращать true, если validateCondition — единственный !∅ (ConditionValue)', () => {
      const condition: ConditionValue = { field: 'name', condition: '!∅' };
      expect(isFieldRequired(condition, {})).toBe(true);
    });

    it('должен возвращать true, если validateCondition — and-группа только из !∅', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: 'name', condition: '!∅' },
        ],
      };
      expect(isFieldRequired(condition, {})).toBe(true);
    });

    it('должен возвращать true независимо от значений formValues, если только !∅', () => {
      const condition: ConditionValue = { field: 'inn', condition: '!∅' };
      expect(isFieldRequired(condition, { type: 'personal', inn: '' })).toBe(true);
      expect(isFieldRequired(condition, { type: 'business', inn: '123456789' })).toBe(true);
      expect(isFieldRequired(condition, {})).toBe(true);
    });
  });

  describe('and-группа с !∅ и контекст-условием', () => {
    const condition: ConditionGroup = {
      comparisonType: 'and',
      children: [
        { field: 'type', condition: '===', value: 'business' },
        { field: 'inn', condition: '!∅' },
      ],
    };

    it('должен возвращать true, если контекст-условие выполнено', () => {
      expect(isFieldRequired(condition, { type: 'business' })).toBe(true);
    });

    it('должен возвращать false, если контекст-условие не выполнено', () => {
      expect(isFieldRequired(condition, { type: 'personal' })).toBe(false);
    });

    it('должен возвращать false, если formValues пустой (контекст требует значение)', () => {
      expect(isFieldRequired(condition, {})).toBe(false);
    });
  });

  describe('and-группа с несколькими контекст-условиями и !∅', () => {
    const condition: ConditionGroup = {
      comparisonType: 'and',
      children: [
        { field: 'type', condition: '===', value: 'business' },
        { field: 'age', condition: '>=', value: 18 },
        { field: 'inn', condition: '!∅' },
      ],
    };

    it('должен возвращать true, если все контекст-условия выполнены', () => {
      expect(isFieldRequired(condition, { type: 'business', age: 25 })).toBe(true);
    });

    it('должен возвращать false, если первое контекст-условие не выполнено', () => {
      expect(isFieldRequired(condition, { type: 'personal', age: 25 })).toBe(false);
    });

    it('должен возвращать false, если второе контекст-условие не выполнено', () => {
      expect(isFieldRequired(condition, { type: 'business', age: 16 })).toBe(false);
    });

    it('должен возвращать false, если оба контекст-условия не выполнены', () => {
      expect(isFieldRequired(condition, { type: 'personal', age: 16 })).toBe(false);
    });

    it('должен возвращать false, если formValues пустой', () => {
      expect(isFieldRequired(condition, {})).toBe(false);
    });
  });

  describe('вложенный and внутри and с !∅', () => {
    it('должен возвращать true, если !∅ вложен в and внутри and и контекст выполнен', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: 'type', condition: '===', value: 'business' },
          {
            comparisonType: 'and',
            children: [
              { field: 'inn', condition: '!∅' },
            ],
          },
        ],
      };
      expect(isFieldRequired(condition, { type: 'business' })).toBe(true);
    });

    it('должен возвращать false, если !∅ вложен в and внутри and и контекст не выполнен', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: 'type', condition: '===', value: 'business' },
          {
            comparisonType: 'and',
            children: [
              { field: 'inn', condition: '!∅' },
            ],
          },
        ],
      };
      expect(isFieldRequired(condition, { type: 'personal' })).toBe(false);
    });

    it('должен возвращать true, если все условия — вложенные !∅ без контекста', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          {
            comparisonType: 'and',
            children: [
              { field: 'inn', condition: '!∅' },
            ],
          },
        ],
      };
      expect(isFieldRequired(condition, {})).toBe(true);
    });
  });

  describe('or-группа с !∅', () => {
    it('должен возвращать true, если or-группа содержит только !∅ (все условия — !∅, контекста нет)', () => {
      // После stripRequiredChecks children станут пустыми → contextCondition === null → всегда обязательно
      const condition: ConditionGroup = {
        comparisonType: 'or',
        children: [
          { field: 'inn', condition: '!∅' },
        ],
      };
      expect(isFieldRequired(condition, {})).toBe(true);
    });

    it('должен возвращать true, если or-группа содержит !∅ и контекст-условие, и контекст-условие выполнено', () => {
      // После stripRequiredChecks остаётся or [type === 'business'],
      // evaluateConditions для or вернёт true, т.к. контекст выполнен
      const condition: ConditionGroup = {
        comparisonType: 'or',
        children: [
          { field: 'type', condition: '===', value: 'business' },
          { field: 'inn', condition: '!∅' },
        ],
      };
      expect(isFieldRequired(condition, { type: 'business' })).toBe(true);
    });

    it('должен возвращать false, если or-группа содержит !∅ и контекст-условие, и контекст-условие не выполнено', () => {
      // После stripRequiredChecks остаётся or [type === 'business'],
      // evaluateConditions вернёт false, т.к. контекст не выполнен
      const condition: ConditionGroup = {
        comparisonType: 'or',
        children: [
          { field: 'type', condition: '===', value: 'business' },
          { field: 'inn', condition: '!∅' },
        ],
      };
      expect(isFieldRequired(condition, { type: 'personal' })).toBe(false);
    });

    it('должен возвращать false, если or-группа содержит !∅ и контекст-условие, formValues пустой', () => {
      const condition: ConditionGroup = {
        comparisonType: 'or',
        children: [
          { field: 'type', condition: '===', value: 'business' },
          { field: 'inn', condition: '!∅' },
        ],
      };
      expect(isFieldRequired(condition, {})).toBe(false);
    });
  });

  describe('пустой formValues при контекст-зависимом условии', () => {
    it('должен возвращать false, если formValues пустой, а контекст требует конкретное значение поля', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: 'role', condition: '===', value: 'admin' },
          { field: 'permissions', condition: '!∅' },
        ],
      };
      expect(isFieldRequired(condition, {})).toBe(false);
    });

    it('должен возвращать false, если formValues содержит поле с неподходящим значением', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: 'role', condition: '===', value: 'admin' },
          { field: 'permissions', condition: '!∅' },
        ],
      };
      expect(isFieldRequired(condition, { role: 'user' })).toBe(false);
    });

    it('должен возвращать true, если formValues содержит подходящее значение', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: 'role', condition: '===', value: 'admin' },
          { field: 'permissions', condition: '!∅' },
        ],
      };
      expect(isFieldRequired(condition, { role: 'admin' })).toBe(true);
    });
  });
});
