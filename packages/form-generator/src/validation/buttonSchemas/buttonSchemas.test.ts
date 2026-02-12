import { describe, it, expect } from 'vitest';
import {
  submitButtonSchema,
  resetButtonSchema,
  buttonConfigSchema,
  buttonsArraySchema,
  validateButtonsConfig,
} from './buttonSchemas';

describe('buttonSchemas', () => {
  describe('submitButtonSchema', () => {
    it('should validate valid submit button config', () => {
      const config = {
        key: 'save',
        label: 'Save',
        action: 'submit',
        requiresValidation: true,
        url: 'https://api.example.com/save',
      };
      expect(() => submitButtonSchema.parse(config)).not.toThrow();
    });

    it('should validate submit button with all optional fields', () => {
      const config = {
        key: 'save',
        label: 'Save',
        type: 'primary',
        action: 'submit',
        requiresValidation: true,
        url: 'https://api.example.com/save',
        method: 'PUT',
        resetAfterSubmit: true,
      };
      expect(() => submitButtonSchema.parse(config)).not.toThrow();
    });

    it('should fail without key', () => {
      const config = {
        key: '',
        label: 'Save',
        action: 'submit',
        requiresValidation: true,
        url: 'https://api.example.com/save',
      };
      expect(() => submitButtonSchema.parse(config)).toThrow();
    });

    it('should fail without label', () => {
      const config = {
        key: 'save',
        label: '',
        action: 'submit',
        requiresValidation: true,
        url: 'https://api.example.com/save',
      };
      expect(() => submitButtonSchema.parse(config)).toThrow();
    });

    it('should fail with invalid url', () => {
      const config = {
        key: 'save',
        label: 'Save',
        action: 'submit',
        requiresValidation: true,
        url: 'not-a-url',
      };
      expect(() => submitButtonSchema.parse(config)).toThrow();
    });

    it('should fail with invalid method', () => {
      const config = {
        key: 'save',
        label: 'Save',
        action: 'submit',
        requiresValidation: true,
        url: 'https://api.example.com/save',
        method: 'GET',
      };
      expect(() => submitButtonSchema.parse(config)).toThrow();
    });

    it('should fail with invalid button type', () => {
      const config = {
        key: 'save',
        label: 'Save',
        type: 'invalid',
        action: 'submit',
        requiresValidation: true,
        url: 'https://api.example.com/save',
      };
      expect(() => submitButtonSchema.parse(config)).toThrow();
    });

    it('should fail without requiresValidation', () => {
      const config = {
        key: 'save',
        label: 'Save',
        action: 'submit',
        url: 'https://api.example.com/save',
      };
      expect(() => submitButtonSchema.parse(config)).toThrow();
    });
  });

  describe('resetButtonSchema', () => {
    it('should validate valid reset button config', () => {
      const config = {
        key: 'reset',
        label: 'Reset',
        action: 'reset',
      };
      expect(() => resetButtonSchema.parse(config)).not.toThrow();
    });

    it('should validate reset button with type', () => {
      const config = {
        key: 'reset',
        label: 'Clear Form',
        type: 'dashed',
        action: 'reset',
      };
      expect(() => resetButtonSchema.parse(config)).not.toThrow();
    });

    it('should fail without key', () => {
      const config = {
        key: '',
        label: 'Reset',
        action: 'reset',
      };
      expect(() => resetButtonSchema.parse(config)).toThrow();
    });
  });

  describe('buttonConfigSchema', () => {
    it('should accept submit button', () => {
      const config = {
        key: 'save',
        label: 'Save',
        action: 'submit',
        requiresValidation: true,
        url: 'https://api.example.com/save',
      };
      expect(() => buttonConfigSchema.parse(config)).not.toThrow();
    });

    it('should accept reset button', () => {
      const config = {
        key: 'reset',
        label: 'Reset',
        action: 'reset',
      };
      expect(() => buttonConfigSchema.parse(config)).not.toThrow();
    });

    it('should fail with unknown action', () => {
      const config = {
        key: 'custom',
        label: 'Custom',
        action: 'custom',
      };
      expect(() => buttonConfigSchema.parse(config)).toThrow();
    });
  });

  describe('buttonsArraySchema', () => {
    it('should validate array of buttons', () => {
      const config = [
        {
          key: 'save',
          label: 'Save',
          action: 'submit',
          requiresValidation: true,
          url: 'https://api.example.com/save',
        },
        {
          key: 'reset',
          label: 'Reset',
          action: 'reset',
        },
      ];
      expect(() => buttonsArraySchema.parse(config)).not.toThrow();
    });

    it('should validate empty array', () => {
      expect(() => buttonsArraySchema.parse([])).not.toThrow();
    });

    it('should fail with duplicate keys', () => {
      const config = [
        {
          key: 'save',
          label: 'Save',
          action: 'submit',
          requiresValidation: true,
          url: 'https://api.example.com/save',
        },
        {
          key: 'save',
          label: 'Save Draft',
          action: 'submit',
          requiresValidation: false,
          url: 'https://api.example.com/draft',
        },
      ];
      expect(() => buttonsArraySchema.parse(config)).toThrow();
    });
  });

  describe('validateButtonsConfig', () => {
    it('should return null for valid config', () => {
      const config = [
        {
          key: 'save',
          label: 'Save',
          action: 'submit',
          requiresValidation: true,
          url: 'https://api.example.com/save',
        },
      ];
      expect(validateButtonsConfig(config)).toBeNull();
    });

    it('should return null for empty array', () => {
      expect(validateButtonsConfig([])).toBeNull();
    });

    it('should return error for non-array', () => {
      expect(validateButtonsConfig('not an array')).toBe('Buttons config must be an array');
    });

    it('should return error for null', () => {
      expect(validateButtonsConfig(null)).toBe('Buttons config must be an array');
    });

    it('should return error for invalid button in array', () => {
      const config = [
        {
          key: '',
          label: 'Save',
          action: 'submit',
          requiresValidation: true,
          url: 'https://api.example.com/save',
        },
      ];
      const error = validateButtonsConfig(config);
      expect(error).not.toBeNull();
      expect(error).toContain('key');
    });

    it('should return error for duplicate keys', () => {
      const config = [
        {
          key: 'btn',
          label: 'Button 1',
          action: 'submit',
          requiresValidation: true,
          url: 'https://api.example.com/a',
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
  });
});
