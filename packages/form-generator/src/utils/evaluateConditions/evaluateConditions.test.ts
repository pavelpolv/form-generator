import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { evaluateConditions, collectValidationMessages, collectFieldsFromCondition } from './evaluateConditions';
import { ConditionGroup, ConditionValue, FormValues } from '@/types';

describe('evaluateConditions', () => {
  describe('ConditionValue - операторы сравнения', () => {
    const formValues: FormValues = {
      age: 25,
      price: 100,
      name: 'John',
      email: 'test@example.com',
      active: true,
      emptyString: '',
      emptyArray: [],
      nullValue: null,
    };

    it('должен обрабатывать оператор <', () => {
      const condition: ConditionValue = { field: 'age', condition: '<', value: 30 };
      expect(evaluateConditions(condition, formValues)).toBe(true);

      const condition2: ConditionValue = { field: 'age', condition: '<', value: 20 };
      expect(evaluateConditions(condition2, formValues)).toBe(false);
    });

    it('должен обрабатывать оператор >', () => {
      const condition: ConditionValue = { field: 'age', condition: '>', value: 20 };
      expect(evaluateConditions(condition, formValues)).toBe(true);

      const condition2: ConditionValue = { field: 'age', condition: '>', value: 30 };
      expect(evaluateConditions(condition2, formValues)).toBe(false);
    });

    it('должен обрабатывать оператор <=', () => {
      const condition: ConditionValue = { field: 'age', condition: '<=', value: 25 };
      expect(evaluateConditions(condition, formValues)).toBe(true);

      const condition2: ConditionValue = { field: 'age', condition: '<=', value: 24 };
      expect(evaluateConditions(condition2, formValues)).toBe(false);
    });

    it('должен обрабатывать оператор >=', () => {
      const condition: ConditionValue = { field: 'age', condition: '>=', value: 25 };
      expect(evaluateConditions(condition, formValues)).toBe(true);

      const condition2: ConditionValue = { field: 'age', condition: '>=', value: 26 };
      expect(evaluateConditions(condition2, formValues)).toBe(false);
    });

    it('должен обрабатывать оператор ===', () => {
      const condition: ConditionValue = { field: 'age', condition: '===', value: 25 };
      expect(evaluateConditions(condition, formValues)).toBe(true);

      const condition2: ConditionValue = { field: 'name', condition: '===', value: 'John' };
      expect(evaluateConditions(condition2, formValues)).toBe(true);

      const condition3: ConditionValue = { field: 'age', condition: '===', value: 30 };
      expect(evaluateConditions(condition3, formValues)).toBe(false);
    });

    it('должен обрабатывать оператор !==', () => {
      const condition: ConditionValue = { field: 'age', condition: '!==', value: 30 };
      expect(evaluateConditions(condition, formValues)).toBe(true);

      const condition2: ConditionValue = { field: 'age', condition: '!==', value: 25 };
      expect(evaluateConditions(condition2, formValues)).toBe(false);
    });

    it('должен обрабатывать оператор ∅ (пусто)', () => {
      const condition1: ConditionValue = { field: 'emptyString', condition: '∅' };
      expect(evaluateConditions(condition1, formValues)).toBe(true);

      const condition2: ConditionValue = { field: 'emptyArray', condition: '∅' };
      expect(evaluateConditions(condition2, formValues)).toBe(true);

      const condition3: ConditionValue = { field: 'nullValue', condition: '∅' };
      expect(evaluateConditions(condition3, formValues)).toBe(true);

      const condition4: ConditionValue = { field: 'name', condition: '∅' };
      expect(evaluateConditions(condition4, formValues)).toBe(false);
    });

    it('должен обрабатывать оператор ∅ (пусто) с пустым объектом', () => {
      const values: FormValues = { emptyObj: {} };
      const condition: ConditionValue = { field: 'emptyObj', condition: '∅' };
      expect(evaluateConditions(condition, values)).toBe(true);
    });

    it('должен обрабатывать оператор ∅ (пусто) с числом/булевым (не пусто)', () => {
      const condition1: ConditionValue = { field: 'age', condition: '∅' };
      expect(evaluateConditions(condition1, formValues)).toBe(false);

      const condition2: ConditionValue = { field: 'active', condition: '∅' };
      expect(evaluateConditions(condition2, formValues)).toBe(false);
    });

    it('должен обрабатывать оператор includes для массивов', () => {
      const values: FormValues = { tags: ['react', 'vue', 'angular'] };
      const condition: ConditionValue = { field: 'tags', condition: 'includes', value: 'react' };
      expect(evaluateConditions(condition, values)).toBe(true);

      const condition2: ConditionValue = { field: 'tags', condition: 'includes', value: 'svelte' };
      expect(evaluateConditions(condition2, values)).toBe(false);
    });

    it('должен возвращать false для includes с нестроковым/немассивным левым значением', () => {
      const condition: ConditionValue = { field: 'age', condition: 'includes', value: '2' };
      expect(evaluateConditions(condition, formValues)).toBe(false);
    });

    it('должен возвращать false для startsWith с нестроковыми значениями', () => {
      const condition: ConditionValue = { field: 'age', condition: 'startsWith', value: '2' };
      expect(evaluateConditions(condition, formValues)).toBe(false);
    });

    it('должен возвращать false для endsWith с нестроковыми значениями', () => {
      const condition: ConditionValue = { field: 'age', condition: 'endsWith', value: '5' };
      expect(evaluateConditions(condition, formValues)).toBe(false);
    });

    it('должен возвращать false для match с нестроковыми значениями', () => {
      const condition: ConditionValue = { field: 'age', condition: 'match', value: '\\d+' };
      expect(evaluateConditions(condition, formValues)).toBe(false);
    });

    it('должен возвращать false для неизвестного оператора', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const condition = { field: 'age', condition: 'unknown' as any, value: 25 };
      expect(evaluateConditions(condition, formValues)).toBe(false);
      consoleSpy.mockRestore();
    });

    it('должен обрабатывать оператор !∅ (не пусто)', () => {
      const condition1: ConditionValue = { field: 'name', condition: '!∅' };
      expect(evaluateConditions(condition1, formValues)).toBe(true);

      const condition2: ConditionValue = { field: 'emptyString', condition: '!∅' };
      expect(evaluateConditions(condition2, formValues)).toBe(false);

      const condition3: ConditionValue = { field: 'nullValue', condition: '!∅' };
      expect(evaluateConditions(condition3, formValues)).toBe(false);
    });

    it('должен обрабатывать оператор includes', () => {
      const condition1: ConditionValue = { field: 'email', condition: 'includes', value: '@' };
      expect(evaluateConditions(condition1, formValues)).toBe(true);

      const condition2: ConditionValue = { field: 'email', condition: 'includes', value: 'example' };
      expect(evaluateConditions(condition2, formValues)).toBe(true);

      const condition3: ConditionValue = { field: 'email', condition: 'includes', value: 'notfound' };
      expect(evaluateConditions(condition3, formValues)).toBe(false);
    });

    it('должен обрабатывать оператор startsWith', () => {
      const condition1: ConditionValue = { field: 'email', condition: 'startsWith', value: 'test' };
      expect(evaluateConditions(condition1, formValues)).toBe(true);

      const condition2: ConditionValue = { field: 'email', condition: 'startsWith', value: '@' };
      expect(evaluateConditions(condition2, formValues)).toBe(false);
    });

    it('должен обрабатывать оператор endsWith', () => {
      const condition1: ConditionValue = { field: 'email', condition: 'endsWith', value: '.com' };
      expect(evaluateConditions(condition1, formValues)).toBe(true);

      const condition2: ConditionValue = { field: 'email', condition: 'endsWith', value: '.org' };
      expect(evaluateConditions(condition2, formValues)).toBe(false);
    });

    it('должен обрабатывать оператор match', () => {
      const condition1: ConditionValue = { field: 'email', condition: 'match', value: '^test.*\\.com$' };
      expect(evaluateConditions(condition1, formValues)).toBe(true);

      const condition2: ConditionValue = { field: 'email', condition: 'match', value: '^admin' };
      expect(evaluateConditions(condition2, formValues)).toBe(false);
    });
  });

  describe('Ссылки на поля с префиксом $', () => {
    const formValues: FormValues = {
      password: 'secret123',
      confirmPassword: 'secret123',
      minAge: 18,
      userAge: 25,
    };

    it('должен сравнивать поле с другим полем через префикс $', () => {
      const condition: ConditionValue = {
        field: 'password',
        condition: '===',
        value: '$confirmPassword',
      };
      expect(evaluateConditions(condition, formValues)).toBe(true);
    });

    it('должен обрабатывать ссылку на поле в числовом сравнении', () => {
      const condition: ConditionValue = {
        field: 'userAge',
        condition: '>=',
        value: '$minAge',
      };
      expect(evaluateConditions(condition, formValues)).toBe(true);
    });

    it('должен возвращать false когда ссылки на поля не совпадают', () => {
      const values: FormValues = {
        password: 'secret123',
        confirmPassword: 'different',
      };
      const condition: ConditionValue = {
        field: 'password',
        condition: '===',
        value: '$confirmPassword',
      };
      expect(evaluateConditions(condition, values)).toBe(false);
    });
  });

  describe('ConditionGroup - логика and/or', () => {
    const formValues: FormValues = {
      age: 25,
      country: 'USA',
      isPremium: false,
    };

    it('должен обрабатывать группу AND (все условия должны выполняться)', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: 'age', condition: '>=', value: 18 },
          { field: 'country', condition: '===', value: 'USA' },
        ],
      };
      expect(evaluateConditions(condition, formValues)).toBe(true);
    });

    it('должен возвращать false для группы AND если одно условие не выполняется', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: 'age', condition: '>=', value: 18 },
          { field: 'country', condition: '===', value: 'UK' },
        ],
      };
      expect(evaluateConditions(condition, formValues)).toBe(false);
    });

    it('должен обрабатывать группу OR (хотя бы одно условие должно выполняться)', () => {
      const condition: ConditionGroup = {
        comparisonType: 'or',
        children: [
          { field: 'isPremium', condition: '===', value: true },
          { field: 'age', condition: '>=', value: 18 },
        ],
      };
      expect(evaluateConditions(condition, formValues)).toBe(true);
    });

    it('должен возвращать false для группы OR если все условия не выполняются', () => {
      const condition: ConditionGroup = {
        comparisonType: 'or',
        children: [
          { field: 'isPremium', condition: '===', value: true },
          { field: 'age', condition: '<', value: 18 },
        ],
      };
      expect(evaluateConditions(condition, formValues)).toBe(false);
    });

    it('должен обрабатывать вложенные группы условий', () => {
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
      };
      expect(evaluateConditions(condition, formValues)).toBe(true);
    });
  });

  describe('Граничные случаи и обработка ошибок', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('должен возвращать true когда условие равно undefined', () => {
      expect(evaluateConditions(undefined, {})).toBe(true);
    });

    it('не должен падать когда поле не существует', () => {
      const condition: ConditionValue = {
        field: 'nonExistentField',
        condition: '===',
        value: 'test',
      };
      expect(evaluateConditions(condition, {})).toBe(false);
    });

    it('должен обрабатывать пустой массив children в ConditionGroup', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [],
      };
      expect(evaluateConditions(condition, {})).toBe(false);
    });

    it('должен обрабатывать невалидный шаблон регулярного выражения', () => {
      const condition: ConditionValue = {
        field: 'email',
        condition: 'match',
        value: '[invalid(regex',
      };
      const formValues = { email: 'test@example.com' };
      expect(evaluateConditions(condition, formValues)).toBe(false);
    });

    it('должен возвращать false когда глубина превышает 50', () => {
      // Строим глубоко вложенную группу условий (>50 уровней)
      let condition: ConditionGroup = {
        comparisonType: 'and',
        children: [{ field: 'x', condition: '===', value: 1 }],
      };
      for (let i = 0; i < 55; i++) {
        condition = {
          comparisonType: 'and',
          children: [condition],
        };
      }
      expect(evaluateConditions(condition, { x: 1 })).toBe(false);
    });

    it('должен возвращать false для неизвестного comparisonType', () => {
      const condition = {
        comparisonType: 'xor' as any,
        children: [{ field: 'x', condition: '===', value: 1 }],
      };
      expect(evaluateConditions(condition, { x: 1 })).toBe(false);
    });

    it('должен возвращать false для невалидного дочернего элемента в ConditionGroup', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: 'x', condition: '===', value: 1 },
          { something: 'invalid' } as any,
        ],
      };
      expect(evaluateConditions(condition, { x: 1 })).toBe(false);
    });

    it('должен возвращать false для невалидного объекта условия', () => {
      const condition = { invalid: 'object' } as any;
      expect(evaluateConditions(condition, {})).toBe(false);
    });

    it('должен обрабатывать ISO строку даты без миллисекунд', () => {
      const formValues: FormValues = {
        date1: '2024-01-15T10:00:00Z',
        date2: '2024-02-20T10:00:00.000Z',
      };
      const condition: ConditionValue = {
        field: 'date1',
        condition: '<',
        value: '$date2',
      };
      expect(evaluateConditions(condition, formValues)).toBe(true);
    });
  });

  describe('Сравнение дат', () => {
    it('должен обрабатывать сравнение дат с оператором <', () => {
      const formValues: FormValues = {
        startDate: '2024-01-15T10:00:00.000Z',
        endDate: '2024-02-20T10:00:00.000Z',
      };
      const condition: ConditionValue = {
        field: 'startDate',
        condition: '<',
        value: '$endDate',
      };
      expect(evaluateConditions(condition, formValues)).toBe(true);
    });

    it('должен обрабатывать сравнение дат с оператором >', () => {
      const formValues: FormValues = {
        startDate: '2024-02-20T10:00:00.000Z',
        endDate: '2024-01-15T10:00:00.000Z',
      };
      const condition: ConditionValue = {
        field: 'startDate',
        condition: '>',
        value: '$endDate',
      };
      expect(evaluateConditions(condition, formValues)).toBe(true);
    });

    it('должен обрабатывать сравнение дат с оператором <=', () => {
      const formValues: FormValues = {
        startDate: '2024-01-15T10:00:00.000Z',
        endDate: '2024-02-20T10:00:00.000Z',
      };
      const condition: ConditionValue = {
        field: 'startDate',
        condition: '<=',
        value: '$endDate',
      };
      expect(evaluateConditions(condition, formValues)).toBe(true);
    });

    it('должен обрабатывать сравнение дат с оператором >=', () => {
      const formValues: FormValues = {
        startDate: '2024-02-20T10:00:00.000Z',
        endDate: '2024-01-15T10:00:00.000Z',
      };
      const condition: ConditionValue = {
        field: 'startDate',
        condition: '>=',
        value: '$endDate',
      };
      expect(evaluateConditions(condition, formValues)).toBe(true);
    });

    it('должен корректно валидировать диапазон дат', () => {
      const formValues: FormValues = {
        startDate: '2024-01-15T10:00:00.000Z',
        endDate: '2024-02-20T10:00:00.000Z',
      };
      const condition: ConditionValue = {
        field: 'startDate',
        condition: '<=',
        value: '$endDate',
        message: 'Start date must be before or equal to end date',
      };
      expect(evaluateConditions(condition, formValues)).toBe(true);
    });

    it('должен завершаться неудачей когда дата начала позже даты окончания', () => {
      const formValues: FormValues = {
        startDate: '2024-02-20T10:00:00.000Z',
        endDate: '2024-01-15T10:00:00.000Z',
      };
      const condition: ConditionValue = {
        field: 'startDate',
        condition: '<=',
        value: '$endDate',
        message: 'Start date must be before or equal to end date',
      };
      expect(evaluateConditions(condition, formValues)).toBe(false);
    });
  });

  describe('collectValidationMessages', () => {
    const formValues: FormValues = {
      age: 15,
      email: '',
    };

    it('должен собирать сообщение из невыполненного условия', () => {
      const condition: ConditionValue = {
        field: 'age',
        condition: '>=',
        value: 18,
        message: 'Must be 18 or older',
      };
      const messages = collectValidationMessages(condition, formValues);
      expect(messages).toEqual(['Must be 18 or older']);
    });

    it('должен собирать сообщения из группы AND', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: 'age', condition: '>=', value: 18, message: 'Must be 18 or older' },
          { field: 'email', condition: '!∅', message: 'Email is required' },
        ],
      };
      const messages = collectValidationMessages(condition, formValues);
      expect(messages).toContain('Must be 18 or older');
      expect(messages).toContain('Email is required');
    });

    it('должен возвращать пустой массив когда все условия выполняются', () => {
      const condition: ConditionValue = {
        field: 'age',
        condition: '>=',
        value: 10,
        message: 'Must be 10 or older',
      };
      const messages = collectValidationMessages(condition, formValues);
      expect(messages).toEqual([]);
    });

    it('должен возвращать пустой массив когда условие равно undefined', () => {
      const messages = collectValidationMessages(undefined, formValues);
      expect(messages).toEqual([]);
    });

    it('должен собирать сообщения из группы OR где все условия не выполняются', () => {
      const condition: ConditionGroup = {
        comparisonType: 'or',
        children: [
          { field: 'age', condition: '>=', value: 18, message: 'Must be 18 or older' },
          { field: 'email', condition: '!∅', message: 'Email is required' },
        ],
      };
      const messages = collectValidationMessages(condition, formValues);
      expect(messages).toContain('Must be 18 or older');
      expect(messages).toContain('Email is required');
    });

    it('должен собирать сообщения из вложенных групп', () => {
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
      };
      const messages = collectValidationMessages(condition, formValues);
      expect(messages.length).toBeGreaterThan(0);
    });

    it('должен возвращать пустые сообщения когда групповое условие выполняется', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: 'age', condition: '>=', value: 10, message: 'Must be 10+' },
        ],
      };
      const messages = collectValidationMessages(condition, formValues);
      expect(messages).toEqual([]);
    });

    it('не должен собирать сообщение из невыполненного условия без сообщения', () => {
      const condition: ConditionValue = {
        field: 'age',
        condition: '>=',
        value: 18,
      };
      const messages = collectValidationMessages(condition, formValues);
      expect(messages).toEqual([]);
    });

    it('должен собирать сообщения только из невыполненных дочерних элементов в группе AND (пропускать выполненные)', () => {
      // Группа AND завершается неудачей потому что один дочерний элемент не выполняется, но другой выполняется.
      // Выполненный дочерний элемент НЕ должен иметь собранное сообщение (покрывает ветку !allResults[index] == false)
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: 'age', condition: '>=', value: 18, message: 'Must be 18+' }, // проходит (age=10 < 18 → не выполняется)
          { field: 'name', condition: '!∅', message: 'Name required' }, // проходит (name='John' → не пусто)
        ],
      };
      // age=10 не выполняет >=18, name='John' выполняет !∅
      const messages = collectValidationMessages(condition, { age: 10, name: 'John' });
      // Должно быть собрано только сообщение невыполненного дочернего элемента
      expect(messages).toContain('Must be 18+');
      expect(messages).not.toContain('Name required');
    });

    it('должен обрабатывать невалидный дочерний элемент в группе при сборе сообщений', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: 'age', condition: '>=', value: 18, message: 'Must be 18 or older' },
          { something: 'invalid' } as any,
        ],
      };
      const messages = collectValidationMessages(condition, formValues);
      expect(messages).toContain('Must be 18 or older');
      consoleSpy.mockRestore();
    });
  });

  describe('collectFieldsFromCondition', () => {
    it('должен собирать поле из простого условия', () => {
      const condition: ConditionValue = {
        field: 'age',
        condition: '>=',
        value: 18,
      };
      const fields = collectFieldsFromCondition(condition);
      expect(fields).toEqual(['age']);
    });

    it('должен собирать поле и поле-ссылку (префикс $)', () => {
      const condition: ConditionValue = {
        field: 'minPrice',
        condition: '<=',
        value: '$maxPrice',
      };
      const fields = collectFieldsFromCondition(condition);
      expect(fields).toContain('minPrice');
      expect(fields).toContain('maxPrice');
      expect(fields).toHaveLength(2);
    });

    it('должен собирать все поля из группы AND', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: 'email', condition: '!∅' },
          { field: 'age', condition: '>=', value: 18 },
        ],
      };
      const fields = collectFieldsFromCondition(condition);
      expect(fields).toContain('email');
      expect(fields).toContain('age');
      expect(fields).toHaveLength(2);
    });

    it('должен собирать все поля из группы OR', () => {
      const condition: ConditionGroup = {
        comparisonType: 'or',
        children: [
          { field: 'isPremium', condition: '===', value: true },
          { field: 'isAdmin', condition: '===', value: true },
        ],
      };
      const fields = collectFieldsFromCondition(condition);
      expect(fields).toContain('isPremium');
      expect(fields).toContain('isAdmin');
      expect(fields).toHaveLength(2);
    });

    it('должен собирать поля из вложенных групп', () => {
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
      };
      const fields = collectFieldsFromCondition(condition);
      expect(fields).toContain('minPrice');
      expect(fields).toContain('maxPrice');
      expect(fields).toHaveLength(2);
    });

    it('должен возвращать пустой массив для условия undefined', () => {
      const fields = collectFieldsFromCondition(undefined);
      expect(fields).toEqual([]);
    });

    it('должен возвращать уникальные имена полей', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: 'age', condition: '>=', value: 18 },
          { field: 'age', condition: '<=', value: 100 },
        ],
      };
      const fields = collectFieldsFromCondition(condition);
      expect(fields).toEqual(['age']);
    });

    it('должен пропускать ConditionValue с пустым/ложным именем поля', () => {
      const condition: ConditionGroup = {
        comparisonType: 'and',
        children: [
          { field: '', condition: '===', value: 'test' },
          { field: 'validField', condition: '===', value: 'test' },
        ],
      };
      const fields = collectFieldsFromCondition(condition);
      // Пустая строка является ложным значением, поэтому должна быть пропущена
      expect(fields).toEqual(['validField']);
    });

    it('должен возвращать пустой массив для невалидного условия', () => {
      const condition = { invalid: 'object' } as any;
      const fields = collectFieldsFromCondition(condition);
      expect(fields).toEqual([]);
    });

    it('должен обрабатывать ошибку при сборе полей (блок catch)', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      // Создаём группу условий которая проходит проверку типа, но выбрасывает исключение при итерации
      const badGroup = {
        comparisonType: 'and',
        children: null as any, // forEach на null выбросит исключение
      };
      // Оборачиваем в валидную группу чтобы внешние проверки прошли, но внутренний сбор выбросил исключение
      const condition = {
        comparisonType: 'and',
        children: [badGroup],
      } as any;
      const fields = collectFieldsFromCondition(condition);
      expect(fields).toEqual([]);
      consoleSpy.mockRestore();
    });
  });

  describe('обработка ошибок - блоки catch', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('должен перехватывать ошибку в главном блоке try-catch evaluateConditions', () => {
      // Создаём условие которое проходит проверку типа, но выбрасывает исключение при вычислении
      const condition = {
        field: 'x',
        condition: '===',
      };
      // Переопределяем геттер поля чтобы выбросить исключение после проверки типа
      Object.defineProperty(condition, 'field', {
        get() { throw new Error('getter error'); },
        enumerable: true,
      });
      expect(evaluateConditions(condition as any, {})).toBe(false);
    });

    it('должен перехватывать ошибку в collectValidationMessages', () => {
      const badGroup = {
        comparisonType: 'and',
        children: null as any,
      };
      const condition = {
        comparisonType: 'and',
        children: [badGroup],
      } as any;
      const messages = collectValidationMessages(condition, { x: 1 });
      expect(messages).toEqual([]);
    });

    it('должен перехватывать ошибку в внешнем блоке try-catch compareValues', () => {
      // Используем значение с valueOf которое выбрасывает исключение для вызова ошибки в getComparableValue -> Number()
      const throwingValue = {
        valueOf() { throw new Error('valueOf error'); },
        toString() { throw new Error('toString error'); },
      };
      const formValues: FormValues = { x: throwingValue };
      const condition: ConditionValue = { field: 'x', condition: '<', value: 10 };
      expect(evaluateConditions(condition, formValues)).toBe(false);
    });
  });
});
