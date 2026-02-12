/**
 * Button visual type (maps to Ant Design Button type)
 */
export type ButtonType = 'primary' | 'default' | 'dashed' | 'link' | 'text'

/**
 * Supported HTTP methods for submit buttons
 */
export type HttpMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * Notification configuration for submit results
 */
export interface NotificationConfig {
  message: string
  description?: string
}

/**
 * Submit button configuration
 * Sends form data to a URL via fetch
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
 * Reset button configuration
 * Resets form to initial values
 */
export interface ResetButtonConfig {
  key: string
  label: string
  type?: ButtonType
  action: 'reset'
}

/**
 * Discriminated union of all button configs
 */
export type ButtonConfig = SubmitButtonConfig | ResetButtonConfig
