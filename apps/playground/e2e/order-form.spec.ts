import { test, expect } from '@playwright/test'
import {
  saveTestMetrics,
  startTrackingOnPage,
  clearTrackingOnPage,
  getMetricsFromPage,
  getRenderEventsFromPage,
} from './utils/testHelpers'

// Helper to get input by name
const input = (name: string) => `input[name="${name}"]`
const selectByName = (name: string) => `.ant-select[name="${name}"]`

test.describe('Order Form Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/order-form')
    await page.waitForSelector('.ant-card', { timeout: 10000 })
    // Start tracking and clear previous metrics
    await startTrackingOnPage(page)
    await clearTrackingOnPage(page)
  })

  // ========================================
  // Group 1: Initial Render
  // ========================================
  test.describe('1. Initial Render', () => {
    test('initial form mount', async ({ page }) => {
      // Clear and reload to measure initial mount
      await page.reload()
      await page.waitForSelector('.ant-card', { timeout: 10000 })
      await startTrackingOnPage(page)
      await page.waitForTimeout(200)

      const metrics = await getMetricsFromPage(page)
      const events = await getRenderEventsFromPage(page)

      console.log('Initial Load Metrics:', metrics)
      saveTestMetrics('initial-render', 'initial-form-mount', {
        totalRenders: metrics.totalRenders,
        mounts: metrics.mounts,
        updates: metrics.updates,
        avgUpdate: metrics.avgUpdate,
        events,
      })
    })

    test('all fields visible', async ({ page }) => {
      const inputs = await page.locator('input.ant-input, .ant-select').count()
      console.log('Visible form elements:', inputs)
      expect(inputs).toBeGreaterThan(15)

      const metrics = await getMetricsFromPage(page)
      const events = await getRenderEventsFromPage(page)

      saveTestMetrics('initial-render', 'all-fields-visible', {
        totalRenders: metrics.totalRenders,
        mounts: metrics.mounts,
        updates: metrics.updates,
        avgUpdate: metrics.avgUpdate,
        events,
      })
    })

    test('group headers rendered', async ({ page }) => {
      const groupTitle = page.locator('text=Информация о покупателе')
      expect(await groupTitle.isVisible()).toBeTruthy()

      const metrics = await getMetricsFromPage(page)
      const events = await getRenderEventsFromPage(page)

      saveTestMetrics('initial-render', 'group-headers-rendered', {
        totalRenders: metrics.totalRenders,
        mounts: metrics.mounts,
        updates: metrics.updates,
        avgUpdate: metrics.avgUpdate,
        events,
      })
    })
  })

  // ========================================
  // Group 2: Field Input
  // ========================================
  test.describe('2. Field Input', () => {
    test('single text input - lastName', async ({ page }) => {
      await clearTrackingOnPage(page)
      await page.waitForTimeout(50)

      await page.locator(input('lastName')).fill('Иванов')
      await page.waitForTimeout(100)

      const metrics = await getMetricsFromPage(page)
      const events = await getRenderEventsFromPage(page)

      console.log('Single Input Metrics:', metrics)
      saveTestMetrics('field-input', 'single-text-input-lastName', {
        totalRenders: metrics.totalRenders,
        mounts: metrics.mounts,
        updates: metrics.updates,
        avgUpdate: metrics.avgUpdate,
        events,
      })
    })

    test('multiple text inputs', async ({ page }) => {
      await clearTrackingOnPage(page)
      await page.waitForTimeout(50)

      await page.locator(input('lastName')).fill('Иванов')
      await page.locator(input('firstName')).fill('Иван')
      await page.locator(input('email')).fill('ivan@test.com')
      await page.waitForTimeout(100)

      const metrics = await getMetricsFromPage(page)
      const events = await getRenderEventsFromPage(page)

      console.log('Multiple Inputs Metrics:', metrics)
      saveTestMetrics('field-input', 'multiple-text-inputs', {
        totalRenders: metrics.totalRenders,
        mounts: metrics.mounts,
        updates: metrics.updates,
        avgUpdate: metrics.avgUpdate,
        events,
      })
    })

    test('select dropdown', async ({ page }) => {
      await clearTrackingOnPage(page)
      await page.waitForTimeout(50)

      await page.locator(selectByName('country')).click()
      await page.locator('.ant-select-item-option-content:has-text("Россия")').click()
      await page.waitForTimeout(100)

      const metrics = await getMetricsFromPage(page)
      const events = await getRenderEventsFromPage(page)

      console.log('Select Dropdown Metrics:', metrics)
      saveTestMetrics('field-input', 'select-dropdown', {
        totalRenders: metrics.totalRenders,
        mounts: metrics.mounts,
        updates: metrics.updates,
        avgUpdate: metrics.avgUpdate,
        events,
      })
    })

    test('number input - quantity', async ({ page }) => {
      await clearTrackingOnPage(page)
      await page.waitForTimeout(50)

      await page.locator(input('quantity')).fill('5')
      await page.waitForTimeout(100)

      const metrics = await getMetricsFromPage(page)
      const events = await getRenderEventsFromPage(page)

      console.log('Number Input Metrics:', metrics)
      saveTestMetrics('field-input', 'number-input-quantity', {
        totalRenders: metrics.totalRenders,
        mounts: metrics.mounts,
        updates: metrics.updates,
        avgUpdate: metrics.avgUpdate,
        events,
      })
    })
  })

  // ========================================
  // Group 3: Visibility Conditions
  // ========================================
  test.describe('3. Visibility Conditions', () => {
    test('toggle company fields visibility', async ({ page }) => {
      const companyNameBefore = await page.locator(input('companyName')).isVisible()
      expect(companyNameBefore).toBeFalsy()

      await clearTrackingOnPage(page)
      await page.waitForTimeout(50)

      await page.locator('.ant-switch').first().click()
      await page.waitForTimeout(150)

      const companyNameAfter = await page.locator(input('companyName')).isVisible()
      expect(companyNameAfter).toBeTruthy()

      const metrics = await getMetricsFromPage(page)
      const events = await getRenderEventsFromPage(page)

      console.log('Toggle Company Fields Metrics:', metrics)
      saveTestMetrics('visibility-conditions', 'toggle-company-fields', {
        totalRenders: metrics.totalRenders,
        mounts: metrics.mounts,
        updates: metrics.updates,
        avgUpdate: metrics.avgUpdate,
        events,
      })
    })

    test('delivery type chain visibility', async ({ page }) => {
      await clearTrackingOnPage(page)
      await page.waitForTimeout(50)

      await page.locator(selectByName('deliveryType')).click()
      await page.locator('.ant-select-item-option-content:has-text("Курьер")').click()
      await page.waitForTimeout(150)

      const metrics = await getMetricsFromPage(page)
      const events = await getRenderEventsFromPage(page)

      console.log('Delivery Type Metrics:', metrics)
      saveTestMetrics('visibility-conditions', 'delivery-type-chain', {
        totalRenders: metrics.totalRenders,
        mounts: metrics.mounts,
        updates: metrics.updates,
        avgUpdate: metrics.avgUpdate,
        events,
      })
    })

    test('multiple visibility toggles', async ({ page }) => {
      await clearTrackingOnPage(page)
      await page.waitForTimeout(50)

      await page.locator('.ant-switch').first().click()
      await page.waitForTimeout(50)
      await page.locator(selectByName('deliveryType')).click()
      await page.locator('.ant-select-item-option-content:has-text("Курьер")').click()
      await page.waitForTimeout(50)
      await page.locator(selectByName('paymentMethod')).click()
      await page.locator('.ant-select-item-option-content:has-text("Банковская карта")').click()
      await page.waitForTimeout(150)

      const metrics = await getMetricsFromPage(page)
      const events = await getRenderEventsFromPage(page)

      console.log('Multiple Visibility Toggles Metrics:', metrics)
      saveTestMetrics('visibility-conditions', 'multiple-toggles', {
        totalRenders: metrics.totalRenders,
        mounts: metrics.mounts,
        updates: metrics.updates,
        avgUpdate: metrics.avgUpdate,
        events,
      })
    })
  })

  // ========================================
  // Group 4: Validation
  // ========================================
  test.describe('4. Validation', () => {
    test('required field validation on blur', async ({ page }) => {
      await clearTrackingOnPage(page)
      await page.waitForTimeout(50)

      const lastName = page.locator(input('lastName'))
      await lastName.focus()
      await lastName.blur()
      await page.waitForTimeout(150)

      const metrics = await getMetricsFromPage(page)
      const events = await getRenderEventsFromPage(page)

      console.log('Required Validation Metrics:', metrics)
      saveTestMetrics('validation', 'required-field-blur', {
        totalRenders: metrics.totalRenders,
        mounts: metrics.mounts,
        updates: metrics.updates,
        avgUpdate: metrics.avgUpdate,
        events,
      })
    })

    test('email format validation', async ({ page }) => {
      await clearTrackingOnPage(page)
      await page.waitForTimeout(50)

      const emailInput = page.locator(input('email'))
      await emailInput.fill('invalid-email')
      await emailInput.blur()
      await page.waitForTimeout(50)
      await emailInput.fill('valid@email.com')
      await emailInput.blur()
      await page.waitForTimeout(150)

      const metrics = await getMetricsFromPage(page)
      const events = await getRenderEventsFromPage(page)

      console.log('Email Validation Metrics:', metrics)
      saveTestMetrics('validation', 'email-format-validation', {
        totalRenders: metrics.totalRenders,
        mounts: metrics.mounts,
        updates: metrics.updates,
        avgUpdate: metrics.avgUpdate,
        events,
      })
    })

    test('phone format validation', async ({ page }) => {
      await clearTrackingOnPage(page)
      await page.waitForTimeout(50)

      const phoneInput = page.locator(input('phone'))
      await phoneInput.fill('123')
      await phoneInput.blur()
      await page.waitForTimeout(50)
      await phoneInput.fill('+7 999 123 45 67')
      await phoneInput.blur()
      await page.waitForTimeout(150)

      const metrics = await getMetricsFromPage(page)
      const events = await getRenderEventsFromPage(page)

      console.log('Phone Validation Metrics:', metrics)
      saveTestMetrics('validation', 'phone-format-validation', {
        totalRenders: metrics.totalRenders,
        mounts: metrics.mounts,
        updates: metrics.updates,
        avgUpdate: metrics.avgUpdate,
        events,
      })
    })
  })

  // ========================================
  // Group 5: Validation Conditions (Cross-field)
  // ========================================
  test.describe('5. Validation Conditions', () => {
    test('conditional required - company fields', async ({ page }) => {
      await clearTrackingOnPage(page)
      await page.waitForTimeout(50)

      await page.locator('.ant-switch').first().click()
      await page.waitForTimeout(50)
      const companyNameInput = page.locator(input('companyName'))
      await companyNameInput.focus()
      await companyNameInput.blur()
      await page.waitForTimeout(150)

      const metrics = await getMetricsFromPage(page)
      const events = await getRenderEventsFromPage(page)

      console.log('Conditional Required Metrics:', metrics)
      saveTestMetrics('validation-conditions', 'conditional-required-company', {
        totalRenders: metrics.totalRenders,
        mounts: metrics.mounts,
        updates: metrics.updates,
        avgUpdate: metrics.avgUpdate,
        events,
      })
    })

    test('card validation when card payment selected', async ({ page }) => {
      await clearTrackingOnPage(page)
      await page.waitForTimeout(50)

      await page.locator(selectByName('paymentMethod')).click()
      await page.locator('.ant-select-item-option-content:has-text("Банковская карта")').click()
      await page.waitForTimeout(150)

      const metrics = await getMetricsFromPage(page)
      const events = await getRenderEventsFromPage(page)

      console.log('Card Validation Metrics:', metrics)
      saveTestMetrics('validation-conditions', 'card-payment-validation', {
        totalRenders: metrics.totalRenders,
        mounts: metrics.mounts,
        updates: metrics.updates,
        avgUpdate: metrics.avgUpdate,
        events,
      })
    })
  })

  // ========================================
  // Group 6: Blur/Focus Events
  // ========================================
  test.describe('6. Blur/Focus Events', () => {
    test('single field focus-blur cycle', async ({ page }) => {
      await clearTrackingOnPage(page)
      await page.waitForTimeout(50)

      const lastName = page.locator(input('lastName'))
      await lastName.focus()
      await page.waitForTimeout(30)
      await lastName.blur()
      await page.waitForTimeout(150)

      const metrics = await getMetricsFromPage(page)
      const events = await getRenderEventsFromPage(page)

      console.log('Focus-Blur Cycle Metrics:', metrics)
      saveTestMetrics('blur-focus', 'single-field-focus-blur', {
        totalRenders: metrics.totalRenders,
        mounts: metrics.mounts,
        updates: metrics.updates,
        avgUpdate: metrics.avgUpdate,
        events,
      })
    })

    test('tab navigation through fields', async ({ page }) => {
      await clearTrackingOnPage(page)
      await page.waitForTimeout(50)

      await page.locator(input('firstName')).focus()
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab')
        await page.waitForTimeout(30)
      }
      await page.waitForTimeout(150)

      const metrics = await getMetricsFromPage(page)
      const events = await getRenderEventsFromPage(page)

      console.log('Tab Navigation Metrics:', metrics)
      saveTestMetrics('blur-focus', 'tab-navigation', {
        totalRenders: metrics.totalRenders,
        mounts: metrics.mounts,
        updates: metrics.updates,
        avgUpdate: metrics.avgUpdate,
        events,
      })
    })

    test('rapid focus changes', async ({ page }) => {
      await clearTrackingOnPage(page)
      await page.waitForTimeout(50)

      const fields = ['firstName', 'lastName', 'email', 'phone']
      for (const field of fields) {
        const fieldInput = page.locator(input(field))
        if (await fieldInput.isVisible()) {
          await fieldInput.focus()
          await page.waitForTimeout(20)
        }
      }
      await page.waitForTimeout(150)

      const metrics = await getMetricsFromPage(page)
      const events = await getRenderEventsFromPage(page)

      console.log('Rapid Focus Changes Metrics:', metrics)
      saveTestMetrics('blur-focus', 'rapid-focus-changes', {
        totalRenders: metrics.totalRenders,
        mounts: metrics.mounts,
        updates: metrics.updates,
        avgUpdate: metrics.avgUpdate,
        events,
      })
    })
  })

  // ========================================
  // Group 7: Form Submit
  // ========================================
  test.describe('7. Form Submit', () => {
    test('submit empty form triggers validation', async ({ page }) => {
      await clearTrackingOnPage(page)
      await page.waitForTimeout(50)

      await page.locator('button:has-text("Оформить заказ")').click()
      await page.waitForTimeout(250)

      const metrics = await getMetricsFromPage(page)
      const events = await getRenderEventsFromPage(page)

      console.log('Submit Empty Form Metrics:', metrics)
      saveTestMetrics('form-submit', 'submit-empty-form', {
        totalRenders: metrics.totalRenders,
        mounts: metrics.mounts,
        updates: metrics.updates,
        avgUpdate: metrics.avgUpdate,
        events,
      })
    })

    test('submit with partial data', async ({ page }) => {
      await page.locator(input('lastName')).fill('Иванов')
      await page.locator(input('firstName')).fill('Иван')
      await page.locator(input('email')).fill('ivan@test.com')

      await clearTrackingOnPage(page)
      await page.waitForTimeout(50)

      await page.locator('button:has-text("Оформить заказ")').click()
      await page.waitForTimeout(250)

      const metrics = await getMetricsFromPage(page)
      const events = await getRenderEventsFromPage(page)

      console.log('Submit Partial Form Metrics:', metrics)
      saveTestMetrics('form-submit', 'submit-partial-form', {
        totalRenders: metrics.totalRenders,
        mounts: metrics.mounts,
        updates: metrics.updates,
        avgUpdate: metrics.avgUpdate,
        events,
      })
    })

    test('form reset clears values', async ({ page }) => {
      await page.locator(input('lastName')).fill('Иванов')
      await page.locator(input('firstName')).fill('Иван')

      await clearTrackingOnPage(page)
      await page.waitForTimeout(50)

      await page.locator('button:has-text("Очистить")').last().click()
      await page.waitForTimeout(150)

      const lastNameValue = await page.locator(input('lastName')).inputValue()
      expect(lastNameValue).toBe('')

      const metrics = await getMetricsFromPage(page)
      const events = await getRenderEventsFromPage(page)

      console.log('Form Reset Metrics:', metrics)
      saveTestMetrics('form-submit', 'form-reset', {
        totalRenders: metrics.totalRenders,
        mounts: metrics.mounts,
        updates: metrics.updates,
        avgUpdate: metrics.avgUpdate,
        events,
      })
    })
  })
})
