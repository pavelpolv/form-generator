import { test, expect } from '@playwright/test'

// Selectors
const input = (name: string) => `input[name="${name}"]`
const selectByLabel = (label: string) => `.ant-form-item:has(.ant-form-item-label:has-text("${label}")) .ant-select-selector`
const switchByLabel = (label: string) => `.ant-form-item:has(.ant-form-item-label:has-text("${label}")) .ant-switch`
const datePickerByLabel = (label: string) => `.ant-form-item:has(.ant-form-item-label:has-text("${label}")) .ant-picker`
const errorMessage = (text: string) => `.ant-form-item-explain-error:has-text("${text}")`

test.describe('Order Form - Functional Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/order-form')
    await page.waitForSelector('.ant-card', { timeout: 10000 })
  })

  // ==========================================
  // 1. Базовая валидация обязательных полей
  // ==========================================
  test.describe('1. Required Field Validation', () => {
    test('firstName shows error on blur when empty', async ({ page }) => {
      const firstName = page.locator(input('firstName'))
      await firstName.focus()
      await firstName.blur()

      await expect(page.locator(errorMessage('Имя обязательно'))).toBeVisible()
    })

    test('firstName error disappears when filled', async ({ page }) => {
      const firstName = page.locator(input('firstName'))
      await firstName.focus()
      await firstName.blur()
      await expect(page.locator(errorMessage('Имя обязательно'))).toBeVisible()

      await firstName.fill('Иван')
      await firstName.blur()
      await expect(page.locator(errorMessage('Имя обязательно'))).not.toBeVisible()
    })

    test('lastName shows error on blur when empty', async ({ page }) => {
      const lastName = page.locator(input('lastName'))
      await lastName.focus()
      await lastName.blur()

      await expect(page.locator(errorMessage('Фамилия обязательна'))).toBeVisible()
    })

    test('email shows error on blur when empty', async ({ page }) => {
      const email = page.locator(input('email'))
      await email.focus()
      await email.blur()

      await expect(page.locator(errorMessage('Email обязателен'))).toBeVisible()
    })

    test('country shows error on blur when empty', async ({ page }) => {
      const country = page.locator(selectByLabel('Страна'))
      await country.click()
      await page.keyboard.press('Escape')
      await page.locator(input('firstName')).click() // blur country

      await expect(page.locator(errorMessage('Выберите страну'))).toBeVisible()
    })
  })

  // ==========================================
  // 2. Валидация формата
  // ==========================================
  test.describe('2. Format Validation', () => {
    test('email shows format error for invalid email', async ({ page }) => {
      const email = page.locator(input('email'))
      await email.fill('invalid-email')
      await email.blur()

      await expect(page.locator(errorMessage('Неверный формат email'))).toBeVisible()
    })

    test('email accepts valid email format', async ({ page }) => {
      const email = page.locator(input('email'))
      await email.fill('test@example.com')
      await email.blur()

      await expect(page.locator(errorMessage('Неверный формат email'))).not.toBeVisible()
      await expect(page.locator(errorMessage('Email обязателен'))).not.toBeVisible()
    })

    test('phone shows format error for invalid phone', async ({ page }) => {
      const phone = page.locator(input('phone'))
      await phone.fill('123')
      await phone.blur()

      await expect(page.locator(errorMessage('Неверный формат телефона'))).toBeVisible()
    })

    test('phone accepts valid phone format', async ({ page }) => {
      const phone = page.locator(input('phone'))
      await phone.fill('+7 999 123-45-67')
      await phone.blur()

      await expect(page.locator(errorMessage('Неверный формат телефона'))).not.toBeVisible()
    })

    test('phone allows empty value (optional field)', async ({ page }) => {
      const phone = page.locator(input('phone'))
      await phone.focus()
      await phone.blur()

      await expect(page.locator(errorMessage('Неверный формат телефона'))).not.toBeVisible()
    })

    test('postalCode shows format error for invalid code', async ({ page }) => {
      const postalCode = page.locator(input('postalCode'))
      await postalCode.fill('123')
      await postalCode.blur()

      await expect(page.locator(errorMessage('Индекс должен содержать 5-6 цифр'))).toBeVisible()
    })

    test('postalCode accepts valid format', async ({ page }) => {
      const postalCode = page.locator(input('postalCode'))
      await postalCode.fill('123456')
      await postalCode.blur()

      await expect(page.locator(errorMessage('Индекс должен содержать 5-6 цифр'))).not.toBeVisible()
    })
  })

  // ==========================================
  // 3. Условная видимость полей
  // ==========================================
  test.describe('3. Conditional Visibility', () => {
    test('company fields are hidden by default', async ({ page }) => {
      await expect(page.locator(input('companyName'))).not.toBeVisible()
      await expect(page.locator(input('companyTaxId'))).not.toBeVisible()
    })

    test('company fields appear when isCompany is enabled', async ({ page }) => {
      await page.locator(switchByLabel('Заказ от юридического лица')).click()

      await expect(page.locator(input('companyName'))).toBeVisible()
      await expect(page.locator(input('companyTaxId'))).toBeVisible()
    })

    test('company fields hide when isCompany is disabled', async ({ page }) => {
      await page.locator(switchByLabel('Заказ от юридического лица')).click()
      await expect(page.locator(input('companyName'))).toBeVisible()

      await page.locator(switchByLabel('Заказ от юридического лица')).click()
      await expect(page.locator(input('companyName'))).not.toBeVisible()
    })

    test('courier date field appears when delivery type is courier', async ({ page }) => {
      await expect(page.locator('.ant-form-item:has(.ant-form-item-label:has-text("Дата доставки")) .ant-picker')).not.toBeVisible()

      await page.locator(selectByLabel('Тип доставки')).click()
      await page.locator('.ant-select-item-option-content:has-text("Курьер")').click()

      await expect(page.locator('.ant-form-item:has(.ant-form-item-label:has-text("Дата доставки")) .ant-picker')).toBeVisible()
    })

    test('pickup point field appears when delivery type is pickup', async ({ page }) => {
      await expect(page.locator(selectByLabel('Пункт выдачи'))).not.toBeVisible()

      await page.locator(selectByLabel('Тип доставки')).click()
      await page.locator('.ant-select-item-option-content:has-text("Самовывоз")').click()

      await expect(page.locator(selectByLabel('Пункт выдачи'))).toBeVisible()
    })

    test('card fields appear when payment method is card', async ({ page }) => {
      await expect(page.locator(input('cardNumber'))).not.toBeVisible()

      await page.locator(selectByLabel('Способ оплаты')).click()
      await page.locator('.ant-select-item-option-content:has-text("Банковская карта")').click()

      await expect(page.locator(input('cardNumber'))).toBeVisible()
      await expect(page.locator(input('cardExpiry'))).toBeVisible()
      await expect(page.locator(input('cardCvv'))).toBeVisible()
    })

    test('promo code field appears when hasPromoCode is enabled', async ({ page }) => {
      await expect(page.locator(input('promoCode'))).not.toBeVisible()

      await page.locator(switchByLabel('У меня есть промокод')).click()

      await expect(page.locator(input('promoCode'))).toBeVisible()
    })

    test('gift message appears when giftWrap is enabled', async ({ page }) => {
      await expect(page.locator('.ant-form-item:has(.ant-form-item-label:has-text("Текст поздравления")) input')).not.toBeVisible()

      await page.locator(switchByLabel('Подарочная упаковка (+200 ₽)')).click()

      await expect(page.locator('.ant-form-item:has(.ant-form-item-label:has-text("Текст поздравления")) input')).toBeVisible()
    })
  })

  // ==========================================
  // 4. Условная валидация (cross-field)
  // ==========================================
  test.describe('4. Conditional Validation (Cross-field)', () => {
    test('companyName required only when isCompany is true', async ({ page }) => {
      // isCompany = false - no validation error
      const companyNameHidden = page.locator(input('companyName'))
      await expect(companyNameHidden).not.toBeVisible()

      // Enable isCompany
      await page.locator(switchByLabel('Заказ от юридического лица')).click()

      // Now companyName is visible and required
      const companyName = page.locator(input('companyName'))
      await companyName.focus()
      await companyName.blur()

      await expect(page.locator(errorMessage('Название компании обязательно'))).toBeVisible()
    })

    test('companyTaxId required with format validation when isCompany is true', async ({ page }) => {
      await page.locator(switchByLabel('Заказ от юридического лица')).click()

      const taxId = page.locator(input('companyTaxId'))
      await taxId.focus()
      await taxId.blur()
      await page.waitForTimeout(100)

      await expect(page.locator(errorMessage('ИНН обязателен'))).toBeVisible()

      // Invalid format
      await taxId.fill('123')
      await taxId.blur()
      await page.waitForTimeout(100)
      // Error message now includes format error
      await expect(page.getByText('ИНН должен содержать 10-12 цифр', { exact: true })).toBeVisible()

      // Valid format
      await taxId.fill('1234567890')
      await taxId.blur()
      await page.waitForTimeout(100)
      await expect(page.getByText('ИНН должен содержать 10-12 цифр', { exact: true })).not.toBeVisible()
    })

    test('courierDate required only when deliveryType is courier', async ({ page }) => {
      await page.locator(selectByLabel('Тип доставки')).click()
      await page.locator('.ant-select-item-option-content:has-text("Курьер")').click()

      const courierDate = page.locator('.ant-form-item:has(.ant-form-item-label:has-text("Дата доставки")) .ant-picker')
      await courierDate.click()
      await page.keyboard.press('Escape')
      await page.locator(input('firstName')).click() // blur

      await expect(page.locator(errorMessage('Выберите дату доставки'))).toBeVisible()
    })

    test('pickupPoint required only when deliveryType is pickup', async ({ page }) => {
      await page.locator(selectByLabel('Тип доставки')).click()
      await page.locator('.ant-select-item-option-content:has-text("Самовывоз")').click()

      const pickupPoint = page.locator(selectByLabel('Пункт выдачи'))
      await pickupPoint.click()
      await page.keyboard.press('Escape')
      await page.locator(input('firstName')).click() // blur

      await expect(page.locator(errorMessage('Выберите пункт выдачи'))).toBeVisible()
    })

    test('card fields required only when paymentMethod is card', async ({ page }) => {
      await page.locator(selectByLabel('Способ оплаты')).click()
      await page.locator('.ant-select-item-option-content:has-text("Банковская карта")').click()

      const cardNumber = page.locator(input('cardNumber'))
      await cardNumber.focus()
      await cardNumber.blur()

      await expect(page.locator(errorMessage('Введите номер карты'))).toBeVisible()
    })

    test('cardNumber format validation', async ({ page }) => {
      await page.locator(selectByLabel('Способ оплаты')).click()
      await page.locator('.ant-select-item-option-content:has-text("Банковская карта")').click()

      const cardNumber = page.locator(input('cardNumber'))
      await cardNumber.fill('1234')
      await cardNumber.blur()

      await expect(page.locator(errorMessage('Неверный номер карты'))).toBeVisible()

      await cardNumber.fill('1234 5678 9012 3456')
      await cardNumber.blur()

      await expect(page.locator(errorMessage('Неверный номер карты'))).not.toBeVisible()
    })

    test('cardExpiry format validation', async ({ page }) => {
      await page.locator(selectByLabel('Способ оплаты')).click()
      await page.locator('.ant-select-item-option-content:has-text("Банковская карта")').click()

      const cardExpiry = page.locator(input('cardExpiry'))
      await cardExpiry.fill('13/25')
      await cardExpiry.blur()

      await expect(page.locator(errorMessage('Формат: MM/YY'))).toBeVisible()

      await cardExpiry.fill('12/25')
      await cardExpiry.blur()

      await expect(page.locator(errorMessage('Формат: MM/YY'))).not.toBeVisible()
    })

    test('promoCode required only when hasPromoCode is true', async ({ page }) => {
      await page.locator(switchByLabel('У меня есть промокод')).click()

      const promoCode = page.locator(input('promoCode'))
      await promoCode.focus()
      await promoCode.blur()

      await expect(page.locator(errorMessage('Введите промокод'))).toBeVisible()

      await promoCode.fill('DISCOUNT10')
      await promoCode.blur()

      await expect(page.locator(errorMessage('Введите промокод'))).not.toBeVisible()
    })
  })

  // ==========================================
  // 5. Валидация числовых полей
  // ==========================================
  test.describe('5. Numeric Field Validation', () => {
    test('quantity must be at least 1', async ({ page }) => {
      const quantity = page.locator(input('quantity'))
      await quantity.fill('0')
      await quantity.blur()

      await expect(page.locator(errorMessage('Минимум 1 единица'))).toBeVisible()
    })

    test('quantity must be at most 100', async ({ page }) => {
      const quantity = page.locator(input('quantity'))
      await quantity.fill('101')
      await quantity.blur()

      await expect(page.locator(errorMessage('Максимум 100 единиц'))).toBeVisible()
    })

    test('pricePerUnit must be greater than 0', async ({ page }) => {
      const price = page.locator(input('pricePerUnit'))
      await price.fill('0')
      await price.blur()

      await expect(page.locator(errorMessage('Укажите цену'))).toBeVisible()
    })

    test('discount must be between 0 and 50', async ({ page }) => {
      const discount = page.locator(input('discount'))

      await discount.fill('-1')
      await discount.blur()
      await expect(page.locator(errorMessage('Скидка не может быть отрицательной'))).toBeVisible()

      await discount.fill('51')
      await discount.blur()
      await expect(page.locator(errorMessage('Максимальная скидка 50%'))).toBeVisible()

      await discount.fill('25')
      await discount.blur()
      await expect(page.locator(errorMessage('Скидка не может быть отрицательной'))).not.toBeVisible()
      await expect(page.locator(errorMessage('Максимальная скидка 50%'))).not.toBeVisible()
    })
  })

  // ==========================================
  // 6. Подтверждение заказа
  // ==========================================
  test.describe('6. Order Confirmation', () => {
    test('agreeTerms switch toggles correctly', async ({ page }) => {
      const agreeTerms = page.locator(switchByLabel('Согласен с условиями использования'))

      // Initially unchecked
      await expect(agreeTerms).not.toHaveClass(/ant-switch-checked/)

      // Click to check
      await agreeTerms.click()
      await expect(agreeTerms).toHaveClass(/ant-switch-checked/)

      // Click to uncheck
      await agreeTerms.click()
      await expect(agreeTerms).not.toHaveClass(/ant-switch-checked/)
    })

    test('agreePrivacy switch toggles correctly', async ({ page }) => {
      const agreePrivacy = page.locator(switchByLabel('Согласен с политикой конфиденциальности'))

      await expect(agreePrivacy).not.toHaveClass(/ant-switch-checked/)
      await agreePrivacy.click()
      await expect(agreePrivacy).toHaveClass(/ant-switch-checked/)
    })
  })

  // ==========================================
  // 7. Полный сценарий заполнения формы
  // ==========================================
  test.describe('7. Full Form Flow', () => {
    test('can fill minimum required fields for individual order', async ({ page }) => {
      // Personal info
      await page.locator(input('firstName')).fill('Иван')
      await page.locator(input('lastName')).fill('Иванов')
      await page.locator(input('email')).fill('ivan@example.com')

      // Address
      await page.locator(selectByLabel('Страна')).click()
      await page.locator('.ant-select-item-option-content:has-text("Россия")').click()
      await page.locator(input('city')).fill('Москва')
      await page.locator(input('street')).fill('Ленина')
      await page.locator(input('building')).fill('1')

      // Delivery
      await page.locator(selectByLabel('Тип доставки')).click()
      await page.locator('.ant-select-item-option-content:has-text("Самовывоз")').click()
      await page.locator(selectByLabel('Пункт выдачи')).click()
      await page.locator('.ant-select-item-option-content:has-text("ТЦ Мега")').click()

      // Product
      await page.locator(selectByLabel('Категория товара')).click()
      await page.locator('.ant-select-item-option-content:has-text("Электроника")').click()
      await page.locator(input('productName')).fill('Смартфон')
      await page.locator(input('pricePerUnit')).fill('50000')

      // Payment
      await page.locator(selectByLabel('Способ оплаты')).click()
      await page.locator('.ant-select-item-option-content:has-text("Наличные")').click()

      // Confirmation
      await page.locator(switchByLabel('Согласен с условиями использования')).click()
      await page.locator(switchByLabel('Согласен с политикой конфиденциальности')).click()

      // Check no validation errors visible
      const errors = await page.locator('.ant-form-item-explain-error').count()
      expect(errors).toBe(0)
    })

    test('can fill form as company with card payment', async ({ page }) => {
      // Enable company
      await page.locator(switchByLabel('Заказ от юридического лица')).click()
      await page.locator(input('companyName')).fill('ООО Тест')
      await page.locator(input('companyTaxId')).fill('1234567890')

      // Personal info
      await page.locator(input('firstName')).fill('Иван')
      await page.locator(input('lastName')).fill('Иванов')
      await page.locator(input('email')).fill('ivan@company.com')

      // Address
      await page.locator(selectByLabel('Страна')).click()
      await page.locator('.ant-select-item-option-content:has-text("Россия")').click()
      await page.locator(input('city')).fill('Москва')
      await page.locator(input('street')).fill('Ленина')
      await page.locator(input('building')).fill('1')

      // Delivery - courier
      await page.locator(selectByLabel('Тип доставки')).click()
      await page.locator('.ant-select-item-option-content:has-text("Курьер")').click()

      // Select courier date
      await page.locator('.ant-form-item:has(.ant-form-item-label:has-text("Дата доставки")) .ant-picker').click()
      await page.locator('.ant-picker-cell-today').click()

      // Product
      await page.locator(selectByLabel('Категория товара')).click()
      await page.locator('.ant-select-item-option-content:has-text("Электроника")').click()
      await page.locator(input('productName')).fill('Ноутбук')
      await page.locator(input('pricePerUnit')).fill('100000')

      // Payment - card
      await page.locator(selectByLabel('Способ оплаты')).click()
      await page.locator('.ant-select-item-option-content:has-text("Банковская карта")').click()
      await page.locator(input('cardNumber')).fill('1234 5678 9012 3456')
      await page.locator(input('cardExpiry')).fill('12/25')
      await page.locator(input('cardCvv')).fill('123')

      // Confirmation
      await page.locator(switchByLabel('Согласен с условиями использования')).click()
      await page.locator(switchByLabel('Согласен с политикой конфиденциальности')).click()

      // Check no validation errors
      const errors = await page.locator('.ant-form-item-explain-error').count()
      expect(errors).toBe(0)
    })
  })

  // ==========================================
  // 8. Form Reset
  // ==========================================
  test.describe('8. Form Reset', () => {
    test('reset button clears all fields', async ({ page }) => {
      await page.locator(input('firstName')).fill('Иван')
      await page.locator(input('lastName')).fill('Иванов')

      await page.locator('button:has-text("Очистить")').last().click()

      await expect(page.locator(input('firstName'))).toHaveValue('')
      await expect(page.locator(input('lastName'))).toHaveValue('')
    })
  })
})
