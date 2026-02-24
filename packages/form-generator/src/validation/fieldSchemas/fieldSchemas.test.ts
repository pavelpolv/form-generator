import { describe, it, expect } from 'vitest';
import {
  inputFieldSchema,
  inputNumberFieldSchema,
  selectFieldSchema,
  switchFieldSchema,
  dateFieldSchema,
  textareaFieldSchema,
  validateFieldConfig,
} from './fieldSchemas';

describe('fieldSchemas', () => {
  describe('inputFieldSchema', () => {
    it('должен валидировать корректную конфигурацию input', () => {
      const config = {
        type: 'input',
        name: 'email',
        label: 'Email',
        placeholder: 'Enter email',
        inputType: 'text',
      };
      expect(() => inputFieldSchema.parse(config)).not.toThrow();
    });

    it('должен валидировать тип input password', () => {
      const config = {
        type: 'input',
        name: 'password',
        label: 'Password',
        inputType: 'password',
      };
      expect(() => inputFieldSchema.parse(config)).not.toThrow();
    });

    it('должен завершаться неудачей без name', () => {
      const config = {
        type: 'input',
        name: '',
        label: 'Email',
      };
      expect(() => inputFieldSchema.parse(config)).toThrow();
    });

    it('должен завершаться неудачей без label', () => {
      const config = {
        type: 'input',
        name: 'email',
        label: '',
      };
      expect(() => inputFieldSchema.parse(config)).toThrow();
    });

    it('должен завершаться неудачей с невалидным maxLength', () => {
      const config = {
        type: 'input',
        name: 'email',
        label: 'Email',
        maxLength: -5,
      };
      expect(() => inputFieldSchema.parse(config)).toThrow();
    });

    it('должен завершаться неудачей с нецелым maxLength', () => {
      const config = {
        type: 'input',
        name: 'email',
        label: 'Email',
        maxLength: 5.5,
      };
      expect(() => inputFieldSchema.parse(config)).toThrow();
    });
  });

  describe('свойство order', () => {
    it('должен принимать order как число', () => {
      const config = {
        type: 'input',
        name: 'field',
        label: 'Field',
        order: 5,
      };
      expect(() => inputFieldSchema.parse(config)).not.toThrow();
    });

    it('должен принимать конфигурацию без order', () => {
      const config = {
        type: 'input',
        name: 'field',
        label: 'Field',
      };
      expect(() => inputFieldSchema.parse(config)).not.toThrow();
    });

    it('должен отклонять нечисловой order', () => {
      const config = {
        type: 'input',
        name: 'field',
        label: 'Field',
        order: 'first',
      };
      expect(() => inputFieldSchema.parse(config)).toThrow();
    });
  });

  describe('inputNumberFieldSchema', () => {
    it('должен валидировать корректную конфигурацию inputNumber', () => {
      const config = {
        type: 'inputNumber',
        name: 'age',
        label: 'Age',
        min: 0,
        max: 120,
        step: 1,
      };
      expect(() => inputNumberFieldSchema.parse(config)).not.toThrow();
    });

    it('должен валидировать конфигурацию без min/max/step', () => {
      const config = {
        type: 'inputNumber',
        name: 'quantity',
        label: 'Quantity',
      };
      expect(() => inputNumberFieldSchema.parse(config)).not.toThrow();
    });

    it('должен завершаться неудачей с отрицательным step', () => {
      const config = {
        type: 'inputNumber',
        name: 'price',
        label: 'Price',
        step: -0.1,
      };
      expect(() => inputNumberFieldSchema.parse(config)).toThrow();
    });

    it('должен завершаться неудачей с нулевым step', () => {
      const config = {
        type: 'inputNumber',
        name: 'price',
        label: 'Price',
        step: 0,
      };
      expect(() => inputNumberFieldSchema.parse(config)).toThrow();
    });

    it('должен допускать дробный step', () => {
      const config = {
        type: 'inputNumber',
        name: 'price',
        label: 'Price',
        step: 0.01,
      };
      expect(() => inputNumberFieldSchema.parse(config)).not.toThrow();
    });
  });

  describe('selectFieldSchema', () => {
    it('должен валидировать корректную конфигурацию select', () => {
      const config = {
        type: 'select',
        name: 'country',
        label: 'Country',
        options: [
          { label: 'USA', value: 'US' },
          { label: 'UK', value: 'UK' },
        ],
      };
      expect(() => selectFieldSchema.parse(config)).not.toThrow();
    });

    it('должен валидировать множественный select', () => {
      const config = {
        type: 'select',
        name: 'countries',
        label: 'Countries',
        options: [{ label: 'USA', value: 'US' }],
        multiple: true,
        searchable: true,
      };
      expect(() => selectFieldSchema.parse(config)).not.toThrow();
    });

    it('должен валидировать options с числовыми значениями', () => {
      const config = {
        type: 'select',
        name: 'rating',
        label: 'Rating',
        options: [
          { label: 'One', value: 1 },
          { label: 'Two', value: 2 },
        ],
      };
      expect(() => selectFieldSchema.parse(config)).not.toThrow();
    });

    it('должен валидировать options с флагом disabled', () => {
      const config = {
        type: 'select',
        name: 'status',
        label: 'Status',
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive', disabled: true },
        ],
      };
      expect(() => selectFieldSchema.parse(config)).not.toThrow();
    });

    it('должен завершаться неудачей с пустым массивом options', () => {
      const config = {
        type: 'select',
        name: 'country',
        label: 'Country',
        options: [],
      };
      expect(() => selectFieldSchema.parse(config)).toThrow();
    });

    it('должен завершаться неудачей с пустым label у option', () => {
      const config = {
        type: 'select',
        name: 'country',
        label: 'Country',
        options: [{ label: '', value: 'US' }],
      };
      expect(() => selectFieldSchema.parse(config)).toThrow();
    });
  });

  describe('switchFieldSchema', () => {
    it('должен валидировать корректную конфигурацию switch', () => {
      const config = {
        type: 'switch',
        name: 'enabled',
        label: 'Enable Feature',
      };
      expect(() => switchFieldSchema.parse(config)).not.toThrow();
    });

    it('должен валидировать switch с текстом для включённого/выключённого состояния', () => {
      const config = {
        type: 'switch',
        name: 'agree',
        label: 'Agree',
        checkedText: 'Yes',
        uncheckedText: 'No',
      };
      expect(() => switchFieldSchema.parse(config)).not.toThrow();
    });

    it('должен валидировать switch с дефолтным значением', () => {
      const config = {
        type: 'switch',
        name: 'enabled',
        label: 'Enable',
        defaultValue: true,
      };
      expect(() => switchFieldSchema.parse(config)).not.toThrow();
    });
  });

  describe('dateFieldSchema', () => {
    it('должен валидировать корректную конфигурацию date', () => {
      const config = {
        type: 'date',
        name: 'birthDate',
        label: 'Birth Date',
      };
      expect(() => dateFieldSchema.parse(config)).not.toThrow();
    });

    it('должен валидировать date с format и showTime', () => {
      const config = {
        type: 'date',
        name: 'appointment',
        label: 'Appointment',
        format: 'YYYY-MM-DD HH:mm',
        showTime: true,
      };
      expect(() => dateFieldSchema.parse(config)).not.toThrow();
    });

    it('должен валидировать date с отключёнными датами (строка)', () => {
      const config = {
        type: 'date',
        name: 'futureDate',
        label: 'Future Date',
        disabledDateBefore: '2024-01-01T00:00:00.000Z',
        disabledDateAfter: '2024-12-31T23:59:59.999Z',
      };
      expect(() => dateFieldSchema.parse(config)).not.toThrow();
    });

    it('должен валидировать date с отключёнными датами (объект Date)', () => {
      const config = {
        type: 'date',
        name: 'pastDate',
        label: 'Past Date',
        disabledDateAfter: new Date(),
      };
      expect(() => dateFieldSchema.parse(config)).not.toThrow();
    });
  });

  describe('textareaFieldSchema', () => {
    it('должен валидировать корректную конфигурацию textarea', () => {
      const config = {
        type: 'textarea',
        name: 'description',
        label: 'Description',
        placeholder: 'Enter description',
      };
      expect(() => textareaFieldSchema.parse(config)).not.toThrow();
    });

    it('должен валидировать textarea с rows', () => {
      const config = {
        type: 'textarea',
        name: 'notes',
        label: 'Notes',
        rows: 6,
      };
      expect(() => textareaFieldSchema.parse(config)).not.toThrow();
    });

    it('должен валидировать textarea с maxLength', () => {
      const config = {
        type: 'textarea',
        name: 'bio',
        label: 'Bio',
        maxLength: 500,
      };
      expect(() => textareaFieldSchema.parse(config)).not.toThrow();
    });

    it('должен валидировать textarea с булевым autoSize', () => {
      const config = {
        type: 'textarea',
        name: 'comment',
        label: 'Comment',
        autoSize: true,
      };
      expect(() => textareaFieldSchema.parse(config)).not.toThrow();
    });

    it('должен валидировать textarea с объектным autoSize', () => {
      const config = {
        type: 'textarea',
        name: 'comment',
        label: 'Comment',
        autoSize: { minRows: 2, maxRows: 6 },
      };
      expect(() => textareaFieldSchema.parse(config)).not.toThrow();
    });

    it('должен завершаться неудачей с невалидным rows', () => {
      const config = {
        type: 'textarea',
        name: 'notes',
        label: 'Notes',
        rows: -1,
      };
      expect(() => textareaFieldSchema.parse(config)).toThrow();
    });

    it('должен завершаться неудачей с нецелым rows', () => {
      const config = {
        type: 'textarea',
        name: 'notes',
        label: 'Notes',
        rows: 3.5,
      };
      expect(() => textareaFieldSchema.parse(config)).toThrow();
    });

    it('должен завершаться неудачей с невалидным maxLength', () => {
      const config = {
        type: 'textarea',
        name: 'bio',
        label: 'Bio',
        maxLength: -10,
      };
      expect(() => textareaFieldSchema.parse(config)).toThrow();
    });
  });

  describe('validateFieldConfig', () => {
    it('должен возвращать null для валидной конфигурации input', () => {
      const config = {
        type: 'input',
        name: 'email',
        label: 'Email',
      };
      expect(validateFieldConfig(config)).toBeNull();
    });

    it('должен возвращать null для валидной конфигурации inputNumber', () => {
      const config = {
        type: 'inputNumber',
        name: 'age',
        label: 'Age',
        min: 0,
      };
      expect(validateFieldConfig(config)).toBeNull();
    });

    it('должен возвращать null для валидной конфигурации select', () => {
      const config = {
        type: 'select',
        name: 'country',
        label: 'Country',
        options: [{ label: 'USA', value: 'US' }],
      };
      expect(validateFieldConfig(config)).toBeNull();
    });

    it('должен возвращать null для валидной конфигурации switch', () => {
      const config = {
        type: 'switch',
        name: 'enabled',
        label: 'Enabled',
      };
      expect(validateFieldConfig(config)).toBeNull();
    });

    it('должен возвращать null для валидной конфигурации date', () => {
      const config = {
        type: 'date',
        name: 'date',
        label: 'Date',
      };
      expect(validateFieldConfig(config)).toBeNull();
    });

    it('должен возвращать null для валидной конфигурации textarea', () => {
      const config = {
        type: 'textarea',
        name: 'description',
        label: 'Description',
      };
      expect(validateFieldConfig(config)).toBeNull();
    });

    it('должен возвращать сообщение об ошибке для неизвестного типа поля', () => {
      const config = {
        type: 'unknown',
        name: 'field',
        label: 'Field',
      };
      expect(validateFieldConfig(config)).toBe('Unknown field type: unknown');
    });

    it('должен возвращать сообщение об ошибке для невалидной конфигурации input', () => {
      const config = {
        type: 'input',
        name: '',
        label: 'Email',
      };
      const error = validateFieldConfig(config);
      expect(error).not.toBeNull();
      expect(error).toContain('name');
    });

    it('должен возвращать сообщение об ошибке для невалидной конфигурации select', () => {
      const config = {
        type: 'select',
        name: 'country',
        label: 'Country',
        options: [],
      };
      const error = validateFieldConfig(config);
      expect(error).not.toBeNull();
      expect(error).toContain('options');
    });

    it('должен возвращать несколько ошибок объединённых вместе', () => {
      const config = {
        type: 'input',
        name: '',
        label: '',
      };
      const error = validateFieldConfig(config);
      expect(error).not.toBeNull();
      expect(error).toContain('name');
      expect(error).toContain('label');
    });

    it('должен возвращать ошибку для null конфигурации', () => {
      expect(validateFieldConfig(null)).toBe('Config must be an object');
    });

    it('должен возвращать ошибку для числовой конфигурации', () => {
      expect(validateFieldConfig(42)).toBe('Config must be an object');
    });

    it('должен возвращать ошибку для строковой конфигурации', () => {
      expect(validateFieldConfig('not an object')).toBe('Config must be an object');
    });

    it('должен возвращать ошибку для объекта без type', () => {
      expect(validateFieldConfig({ name: 'test', label: 'Test' })).toBe('Config must have a type property');
    });

    it('должен возвращать ошибку для объекта с нестроковым type', () => {
      expect(validateFieldConfig({ type: 123, name: 'test', label: 'Test' })).toBe('Config must have a type property');
    });

    it('должен обрабатывать не-ZodError в блоке catch', () => {
      // Создаём конфигурацию которая вызовет не-Zod ошибку передав
      // объект с геттером который выбрасывает исключение
      const config = {
        type: 'input',
        get name() { throw new Error('getter error'); },
        label: 'Test',
      };
      const error = validateFieldConfig(config);
      expect(error).not.toBeNull();
    });
  });
});
