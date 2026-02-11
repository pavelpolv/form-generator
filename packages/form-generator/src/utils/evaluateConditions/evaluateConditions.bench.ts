import { bench, describe } from 'vitest';
import { evaluateConditions, collectValidationMessages, collectFieldsFromCondition } from './evaluateConditions';
import { ConditionGroup, FormValues } from '@/types';

// Генерация тестовых данных разного размера
function generateFormValues(fieldCount: number): FormValues {
  const values: FormValues = {};
  for (let i = 0; i < fieldCount; i++) {
    values[`field_${i}`] = i % 2 === 0 ? `value_${i}` : i;
  }
  return values;
}

function generateSimpleCondition(): ConditionGroup {
  return {
    comparisonType: 'and',
    children: [
      { field: 'field_0', condition: '!∅' },
      { field: 'field_1', condition: '>', value: 0 },
    ],
  };
}

function generateComplexCondition(depth: number, breadth: number): ConditionGroup {
  if (depth <= 0) {
    return {
      comparisonType: 'and',
      children: [
        { field: 'field_0', condition: '!∅' },
        { field: 'field_1', condition: '===', value: 1 },
      ],
    };
  }

  const children: ConditionGroup[] = [];
  for (let i = 0; i < breadth; i++) {
    children.push(generateComplexCondition(depth - 1, breadth));
  }

  return {
    comparisonType: depth % 2 === 0 ? 'and' : 'or',
    children,
  };
}

function generateManyFieldsCondition(fieldCount: number): ConditionGroup {
  const children = [];
  for (let i = 0; i < fieldCount; i++) {
    children.push({ field: `field_${i}`, condition: '!∅' as const });
  }
  return {
    comparisonType: 'and',
    children,
  };
}

// Данные для бенчмарков
const smallFormValues = generateFormValues(10);
const mediumFormValues = generateFormValues(50);
const largeFormValues = generateFormValues(100);

const simpleCondition = generateSimpleCondition();
const complexCondition = generateComplexCondition(3, 3); // 3 уровня глубины, 3 ветки
const deepCondition = generateComplexCondition(5, 2); // 5 уровней глубины
const wideCondition = generateManyFieldsCondition(50); // 50 полей в одном условии

describe('evaluateConditions - размер формы', () => {
  bench('10 полей, простое условие', () => {
    evaluateConditions(simpleCondition, smallFormValues);
  });

  bench('50 полей, простое условие', () => {
    evaluateConditions(simpleCondition, mediumFormValues);
  });

  bench('100 полей, простое условие', () => {
    evaluateConditions(simpleCondition, largeFormValues);
  });
});

describe('evaluateConditions - сложность условий', () => {
  bench('простое условие (2 проверки)', () => {
    evaluateConditions(simpleCondition, mediumFormValues);
  });

  bench('сложное условие (глубина 3, ширина 3)', () => {
    evaluateConditions(complexCondition, mediumFormValues);
  });

  bench('глубокое условие (глубина 5)', () => {
    evaluateConditions(deepCondition, mediumFormValues);
  });

  bench('широкое условие (50 полей)', () => {
    evaluateConditions(wideCondition, mediumFormValues);
  });
});

describe('evaluateConditions - типы операторов', () => {
  const values = { str: 'hello world', num: 42, arr: [1, 2, 3] };

  bench('оператор ===', () => {
    evaluateConditions({ field: 'num', condition: '===', value: 42 }, values);
  });

  bench('оператор !∅', () => {
    evaluateConditions({ field: 'str', condition: '!∅' }, values);
  });

  bench('оператор includes (строка)', () => {
    evaluateConditions({ field: 'str', condition: 'includes', value: 'world' }, values);
  });

  bench('оператор match (regex)', () => {
    evaluateConditions({ field: 'str', condition: 'match', value: '^hello' }, values);
  });

  bench('ссылка на поле ($)', () => {
    evaluateConditions(
      { comparisonType: 'and', children: [{ field: 'num', condition: '===', value: '$num' }] },
      values,
    );
  });
});

describe('collectValidationMessages', () => {
  const conditionWithMessages: ConditionGroup = {
    comparisonType: 'and',
    children: [
      { field: 'field_0', condition: '∅', message: 'Field 0 must be empty' },
      { field: 'field_1', condition: '<', value: 0, message: 'Field 1 must be negative' },
    ],
  };

  bench('сбор сообщений (простое условие)', () => {
    collectValidationMessages(conditionWithMessages, smallFormValues);
  });

  bench('сбор сообщений (сложное условие)', () => {
    collectValidationMessages(complexCondition, mediumFormValues);
  });
});

describe('collectFieldsFromCondition', () => {
  bench('сбор полей (простое условие)', () => {
    collectFieldsFromCondition(simpleCondition);
  });

  bench('сбор полей (сложное условие)', () => {
    collectFieldsFromCondition(complexCondition);
  });

  bench('сбор полей (широкое условие)', () => {
    collectFieldsFromCondition(wideCondition);
  });
});

// Симуляция реального сценария: рендер группы с 20 полями
describe('реальный сценарий - группа с 20 полями', () => {
  const formValues = generateFormValues(20);
  const fieldConditions = Array.from({ length: 20 }, (_, i) => ({
    visible: { field: `field_${i % 5}`, condition: '!∅' as const },
    validate: {
      comparisonType: 'and' as const,
      children: [{ field: `field_${i}`, condition: '!∅' as const }],
    },
  }));

  bench('проверка видимости всех 20 полей', () => {
    fieldConditions.forEach((fc) => evaluateConditions(fc.visible, formValues));
  });

  bench('проверка валидации всех 20 полей', () => {
    fieldConditions.forEach((fc) => evaluateConditions(fc.validate, formValues));
  });

  bench('полный цикл: visible + validate + disabled (20 полей)', () => {
    fieldConditions.forEach((fc) => {
      evaluateConditions(fc.visible, formValues);
      evaluateConditions(fc.validate, formValues);
      evaluateConditions(fc.visible, formValues); // disabled как пример
    });
  });
});
