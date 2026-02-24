/**
 * Визуальный тип кнопки (соответствует типу кнопки Ant Design)
 */
export type ButtonType = 'primary' | 'default' | 'dashed' | 'link' | 'text'

/**
 * Поддерживаемые HTTP-методы для кнопок отправки
 */
export type HttpMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * Конфигурация уведомления о результате отправки
 */
export interface NotificationConfig {
  message: string
  description?: string
}

/**
 * Конфигурация кнопки отправки
 * Отправляет данные формы на URL через fetch
 */
export interface SubmitButtonConfig {
  key: string
  label: string
  type?: ButtonType
  action: 'submit'
  requiresValidation: boolean
  url: string
  method?: HttpMethod
  resetAfterSubmit?: boolean
  successNotification?: NotificationConfig
  errorNotification?: NotificationConfig
}

/**
 * Конфигурация кнопки сброса
 * Сбрасывает форму к начальным значениям
 */
export interface ResetButtonConfig {
  key: string
  label: string
  type?: ButtonType
  action: 'reset'
}

/**
 * Размеченное объединение всех конфигураций кнопок
 */
export type ButtonConfig = SubmitButtonConfig | ResetButtonConfig
