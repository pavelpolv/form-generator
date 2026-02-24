import { ButtonConfig } from './button.types';
import { ConditionGroup } from './condition.types';
import { Field } from './field.types';

/**
 * Конфигурация группы полей
 * Объединяет поля вместе с визуальной рамкой и заголовком
 */
export interface GroupField {
  /**
   * Имя/заголовок группы, отображаемый в интерфейсе
   */
  name: string

  /**
   * Показывать заголовок группы
   * @default true
   */
  showTitle?: boolean

  /**
   * Показывать рамку группы
   * @default true
   */
  showBorder?: boolean

  /**
   * Условие показа/скрытия всей группы
   * Если условие ложно, группа и все её поля скрываются
   */
  visibleCondition?: ConditionGroup

  /**
   * Условие валидации группы
   * Если условие ложно, для группы отображается ошибка валидации
   */
  validateCondition?: ConditionGroup

  /**
   * Порядок отображения (меньшие значения рендерятся первыми, по умолчанию 0)
   */
  order?: number

  /**
   * Поля, входящие в эту группу
   */
  fields: Field[]
}

/**
 * Полная конфигурация формы
 */
export interface FormConfig {
  /**
   * Массив групп полей
   * Группы отображаются вертикально по порядку
   */
  groups: GroupField[]

  /**
   * Конфигурации кнопок
   * Если не указано, отображается кнопка отправки по умолчанию
   */
  buttons?: ButtonConfig[]
}

/**
 * Структура значений формы (плоская)
 * Ключи — имена полей, значения — значения полей
 *
 * @example
 * {
 *   firstName: 'John',
 *   age: 25,
 *   isActive: true,
 *   birthDate: '1999-01-01'
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormValues = Record<string, any>
