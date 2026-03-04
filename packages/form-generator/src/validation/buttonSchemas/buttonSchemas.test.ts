import { describe, it, expect, vi } from 'vitest';
import {
  submitButtonSchema,
  resetButtonSchema,
  buttonConfigSchema,
  buttonsArraySchema,
  validateButtonsConfig,
} from './buttonSchemas';

describe('buttonSchemas', () => {
  describe('submitButtonSchema', () => {
    it('должен валидировать корректную конфигурацию кнопки submit', () => {
      const config = {
        key: 'save',
        label: 'Save',
        action: 'submit',
        requiresValidation: true,
        url: 'http://localhost:9999',
      };
      expect(() => submitButtonSchema.parse(config)).not.toThrow();
    });

    it('должен валидировать кнопку submit со всеми опциональными полями', () => {
      const config = {
        key: 'save',
        label: 'Save',
        type: 'primary',
        action: 'submit',
        requiresValidation: true,
        url: 'http://localhost:9999',
        method: 'PUT',
        resetAfterSubmit: true,
      };
      expect(() => submitButtonSchema.parse(config)).not.toThrow();
    });

    it('должен завершаться неудачей без key', () => {
      const config = {
        key: '',
        label: 'Save',
        action: 'submit',
        requiresValidation: true,
        url: 'http://localhost:9999',
      };
      expect(() => submitButtonSchema.parse(config)).toThrow();
    });

    it('должен завершаться неудачей без label', () => {
      const config = {
        key: 'save',
        label: '',
        action: 'submit',
        requiresValidation: true,
        url: 'http://localhost:9999',
      };
      expect(() => submitButtonSchema.parse(config)).toThrow();
    });

    it('должен завершаться неудачей с невалидным url', () => {
      const config = {
        key: 'save',
        label: 'Save',
        action: 'submit',
        requiresValidation: true,
        url: 'not-a-url',
      };
      expect(() => submitButtonSchema.parse(config)).toThrow();
    });

    it('должен завершаться неудачей с невалидным method', () => {
      const config = {
        key: 'save',
        label: 'Save',
        action: 'submit',
        requiresValidation: true,
        url: 'http://localhost:9999',
        method: 'GET',
      };
      expect(() => submitButtonSchema.parse(config)).toThrow();
    });

    it('должен завершаться неудачей с невалидным типом кнопки', () => {
      const config = {
        key: 'save',
        label: 'Save',
        type: 'invalid',
        action: 'submit',
        requiresValidation: true,
        url: 'http://localhost:9999',
      };
      expect(() => submitButtonSchema.parse(config)).toThrow();
    });

    it('должен завершаться неудачей без requiresValidation', () => {
      const config = {
        key: 'save',
        label: 'Save',
        action: 'submit',
        url: 'http://localhost:9999',
      };
      expect(() => submitButtonSchema.parse(config)).toThrow();
    });
  });

  describe('resetButtonSchema', () => {
    it('должен валидировать корректную конфигурацию кнопки reset', () => {
      const config = {
        key: 'reset',
        label: 'Reset',
        action: 'reset',
      };
      expect(() => resetButtonSchema.parse(config)).not.toThrow();
    });

    it('должен валидировать кнопку reset с типом', () => {
      const config = {
        key: 'reset',
        label: 'Clear Form',
        type: 'dashed',
        action: 'reset',
      };
      expect(() => resetButtonSchema.parse(config)).not.toThrow();
    });

    it('должен завершаться неудачей без key', () => {
      const config = {
        key: '',
        label: 'Reset',
        action: 'reset',
      };
      expect(() => resetButtonSchema.parse(config)).toThrow();
    });
  });

  describe('buttonConfigSchema', () => {
    it('должен принимать кнопку submit', () => {
      const config = {
        key: 'save',
        label: 'Save',
        action: 'submit',
        requiresValidation: true,
        url: 'http://localhost:9999',
      };
      expect(() => buttonConfigSchema.parse(config)).not.toThrow();
    });

    it('должен принимать кнопку reset', () => {
      const config = {
        key: 'reset',
        label: 'Reset',
        action: 'reset',
      };
      expect(() => buttonConfigSchema.parse(config)).not.toThrow();
    });

    it('должен завершаться неудачей с неизвестным action', () => {
      const config = {
        key: 'custom',
        label: 'Custom',
        action: 'custom',
      };
      expect(() => buttonConfigSchema.parse(config)).toThrow();
    });
  });

  describe('buttonsArraySchema', () => {
    it('должен валидировать массив кнопок', () => {
      const config = [
        {
          key: 'save',
          label: 'Save',
          action: 'submit',
          requiresValidation: true,
          url: 'http://localhost:9999',
        },
        {
          key: 'reset',
          label: 'Reset',
          action: 'reset',
        },
      ];
      expect(() => buttonsArraySchema.parse(config)).not.toThrow();
    });

    it('должен валидировать пустой массив', () => {
      expect(() => buttonsArraySchema.parse([])).not.toThrow();
    });

    it('должен завершаться неудачей с дублирующимися ключами', () => {
      const config = [
        {
          key: 'save',
          label: 'Save',
          action: 'submit',
          requiresValidation: true,
          url: 'http://localhost:9999',
        },
        {
          key: 'save',
          label: 'Save Draft',
          action: 'submit',
          requiresValidation: false,
          url: 'http://localhost:9999/draft',
        },
      ];
      expect(() => buttonsArraySchema.parse(config)).toThrow();
    });
  });

  describe('validateButtonsConfig', () => {
    it('должен возвращать null для валидной конфигурации', () => {
      const config = [
        {
          key: 'save',
          label: 'Save',
          action: 'submit',
          requiresValidation: true,
          url: 'http://localhost:9999',
        },
      ];
      expect(validateButtonsConfig(config)).toBeNull();
    });

    it('должен возвращать null для пустого массива', () => {
      expect(validateButtonsConfig([])).toBeNull();
    });

    it('должен возвращать ошибку для не-массива', () => {
      expect(validateButtonsConfig('not an array')).toBe('Buttons config must be an array');
    });

    it('должен возвращать ошибку для null', () => {
      expect(validateButtonsConfig(null)).toBe('Buttons config must be an array');
    });

    it('должен возвращать ошибку для невалидной кнопки в массиве', () => {
      const config = [
        {
          key: '',
          label: 'Save',
          action: 'submit',
          requiresValidation: true,
          url: 'http://localhost:9999',
        },
      ];
      const error = validateButtonsConfig(config);
      expect(error).not.toBeNull();
      expect(error).toContain('key');
    });

    it('должен возвращать ошибку для дублирующихся ключей', () => {
      const config = [
        {
          key: 'btn',
          label: 'Button 1',
          action: 'submit',
          requiresValidation: true,
          url: 'http://localhost:9999',
        },
        {
          key: 'btn',
          label: 'Button 2',
          action: 'reset',
        },
      ];
      const error = validateButtonsConfig(config);
      expect(error).not.toBeNull();
      expect(error).toContain('unique');
    });

    it('должен обрабатывать исключения не являющиеся ZodError', () => {
      const spy = vi.spyOn(buttonsArraySchema, 'parse').mockImplementation(() => {
        throw new Error('unexpected error');
      });
      const result = validateButtonsConfig([]);
      expect(result).toBe('Error: unexpected error');
      spy.mockRestore();
    });
  });
});
