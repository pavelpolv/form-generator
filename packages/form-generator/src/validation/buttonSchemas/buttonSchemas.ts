import { z } from 'zod';

const buttonTypeSchema = z.enum(['primary', 'default', 'dashed', 'link', 'text']);
const httpMethodSchema = z.enum(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Схема валидации кнопки отправки
 */
export const submitButtonSchema = z.object({
  key: z.string().min(1, 'Button key is required'),
  label: z.string().min(1, 'Button label is required'),
  type: buttonTypeSchema.optional(),
  action: z.literal('submit'),
  requiresValidation: z.boolean(),
  url: z.string().url('Button url must be a valid URL'),
  method: httpMethodSchema.optional(),
  resetAfterSubmit: z.boolean().optional(),
});

/**
 * Схема валидации кнопки сброса
 */
export const resetButtonSchema = z.object({
  key: z.string().min(1, 'Button key is required'),
  label: z.string().min(1, 'Button label is required'),
  type: buttonTypeSchema.optional(),
  action: z.literal('reset'),
});

/**
 * Размеченное объединение всех конфигураций кнопок
 */
export const buttonConfigSchema = z.discriminatedUnion('action', [
  submitButtonSchema,
  resetButtonSchema,
]);

/**
 * Массив кнопок с валидацией уникальности ключей
 */
export const buttonsArraySchema = z
  .array(buttonConfigSchema)
  .refine(
    (buttons) => {
      const keys = buttons.map((b) => b.key);

      return new Set(keys).size === keys.length;
    },
    { message: 'Button keys must be unique' },
  );

/**
 * Валидирует конфигурацию кнопок и возвращает сообщение об ошибке при неверных данных
 */

export function validateButtonsConfig(config: unknown): string | null {
  if (!Array.isArray(config)) {
    return 'Buttons config must be an array';
  }

  try {
    buttonsArraySchema.parse(config);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues
        .map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`)
        .join('; ');
    }
    return String(error);
  }
}
