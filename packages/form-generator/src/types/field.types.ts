import { ReactNode } from 'react';
import { ConditionGroup } from './condition.types';
import { ComputedValueConfig } from './computed.types';

/**
 * Доступные типы полей
 * Каждый тип соответствует конкретному компоненту поля
 */
export type FieldType = 'input' | 'inputNumber' | 'select' | 'switch' | 'date' | 'money' | 'textarea' | 'dynamicList'

/**
 * Базовая конфигурация поля, общая для всех типов
 */
export interface BaseField {
  /**
   * Уникальное имя поля (используется как ключ в значениях формы)
   */
  name: string

  /**
   * Отображаемая метка поля
   */
  label: string

  /**
   * Тип поля
   */
  type: FieldType

  /**
   * Условие показа/скрытия поля
   * Если условие ложно, поле скрывается
   */
  visibleCondition?: ConditionGroup

  /**
   * Условие валидации поля
   * Если условие ложно, отображается ошибка валидации
   */
  validateCondition?: ConditionGroup

  /**
   * Условие включения/отключения поля
   * Если условие истинно, поле блокируется
   */
  disabledCondition?: ConditionGroup

  /**
   * Конфигурация автоматического вычисления значения поля из других полей
   */
  computedValue?: ComputedValueConfig

  /**
   * Порядок отображения (меньшие значения рендерятся первыми, по умолчанию 0)
   */
  order?: number

  /**
   * Текст-заглушка
   */
  placeholder?: string

  /**
   * Значение поля по умолчанию
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any
}

/**
 * Тип HTML-инпута для текстовых полей
 */
export type InputType = 'text' | 'password' | 'email' | 'tel' | 'url' | 'search'

/**
 * Специфичные свойства текстового поля
 */
export interface InputFieldProps {
  /**
   * Тип инпута (text, password, email, tel, url, search)
   */
  inputType?: InputType

  /**
   * Максимальная длина
   */
  maxLength?: number

  /**
   * Показывать кнопку очистки значения
   * @default false
   */
  allowClear?: boolean
}

/**
 * Специфичные свойства числового поля
 */
export interface InputNumberFieldProps {
  /**
   * Минимальное значение
   */
  min?: number

  /**
   * Максимальное значение
   */
  max?: number

  /**
   * Шаг изменения значения
   */
  step?: number
}

/**
 * Вариант выбора для поля select
 */
export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

/**
 * Специфичные свойства поля select
 */
export interface SelectFieldProps {
  /**
   * Варианты для выпадающего списка
   */
  options: SelectOption[]

  /**
   * Разрешить множественный выбор
   */
  multiple?: boolean

  /**
   * Разрешить поиск/фильтрацию вариантов
   */
  searchable?: boolean

  /**
   * Показывать кнопку очистки выбранного значения
   * @default false
   */
  allowClear?: boolean
}

/**
 * Специфичные свойства поля-переключателя
 */
export interface SwitchFieldProps {
  /**
   * Текст при включённом состоянии
   */
  checkedText?: string

  /**
   * Текст при выключенном состоянии
   */
  uncheckedText?: string
}

/**
 * Специфичные свойства поля даты
 */
export interface DateFieldProps {
  /**
   * Формат отображения даты
   * @default 'YYYY-MM-DD'
   */
  format?: string

  /**
   * Показывать выбор времени
   */
  showTime?: boolean

  /**
   * Отключить даты до указанной
   */
  disabledDateBefore?: Date

  /**
   * Отключить даты после указанной
   */
  disabledDateAfter?: Date

  /**
   * Показывать кнопку очистки выбранной даты
   * @default true
   */
  allowClear?: boolean
}

/**
 * Специфичные свойства денежного поля
 */
export interface MoneyFieldProps {
  /**
   * Количество знаков после запятой
   * @default 2
   */
  decimalPlaces?: number

  /**
   * Префикс перед инпутом (например, символ валюты)
   */
  prefix?: string

  /**
   * Суффикс после инпута (например, код валюты)
   */
  suffix?: string

  /**
   * Разрешить отрицательные значения
   * @default false
   */
  allowNegative?: boolean

  /**
   * Минимальное значение
   */
  min?: number

  /**
   * Максимальное значение
   */
  max?: number
}

/**
 * Специфичные свойства поля textarea
 */
export interface TextareaFieldProps {
  /**
   * Количество видимых строк текста
   */
  rows?: number

  /**
   * Максимальная длина
   */
  maxLength?: number

  /**
   * Конфигурация автоматического изменения размера
   * Если true, textarea будет автоматически менять размер в зависимости от содержимого
   * Если объект, можно задать минимальное и максимальное количество строк
   */
  autoSize?: boolean | { minRows?: number; maxRows?: number }
}

/**
 * Конфигурация текстового поля
 */
export interface InputField extends BaseField, InputFieldProps {
  type: 'input'
}

/**
 * Конфигурация числового поля
 */
export interface InputNumberField extends BaseField, InputNumberFieldProps {
  type: 'inputNumber'
}

/**
 * Конфигурация поля select
 */
export interface SelectField extends BaseField, SelectFieldProps {
  type: 'select'
}

/**
 * Конфигурация поля-переключателя
 */
export interface SwitchField extends BaseField, SwitchFieldProps {
  type: 'switch'
}

/**
 * Конфигурация поля даты
 */
export interface DateField extends BaseField, DateFieldProps {
  type: 'date'
}

/**
 * Конфигурация денежного поля
 */
export interface MoneyField extends BaseField, MoneyFieldProps {
  type: 'money'
}

/**
 * Конфигурация поля textarea
 */
export interface TextareaField extends BaseField, TextareaFieldProps {
  type: 'textarea'
}

/**
 * Типы элементов, поддерживаемые внутри dynamicList
 */
export type DynamicListItemField =
  | InputField
  | InputNumberField
  | SelectField
  | SwitchField
  | DateField
  | MoneyField
  | TextareaField

/**
 * Конфигурация кнопки "Добавить" в поле динамического списка
 */
export interface DynamicListAddButtonConfig {
  /** Текст кнопки. По умолчанию: 'Add item' */
  label?: string
  /** Положение относительно элементов списка. По умолчанию: 'bottom' */
  position?: 'top' | 'bottom'
  /** Размер кнопки (Ant Design). По умолчанию: 'middle' */
  size?: 'large' | 'middle' | 'small'
  /** Растянуть на всю ширину. По умолчанию: true */
  block?: boolean
  /** Пользовательская иконка. По умолчанию: <PlusOutlined /> */
  icon?: ReactNode
}

/**
 * Специфичные свойства поля динамического списка
 */
export interface DynamicListFieldProps {
  /**
   * Поля, отображаемые внутри каждого элемента списка
   */
  itemFields: DynamicListItemField[]

  /**
   * Конфигурация кнопки "Добавить"
   */
  addButton?: DynamicListAddButtonConfig
}

/**
 * Конфигурация поля динамического списка
 */
export interface DynamicListField extends BaseField, DynamicListFieldProps {
  type: 'dynamicList'
}

/**
 * Объединяющий тип всех конфигураций полей
 */
export type Field = InputField | InputNumberField | SelectField | SwitchField | DateField | MoneyField | TextareaField | DynamicListField
