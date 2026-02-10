import type { FormConfig } from '@form-generator/core'

export const orderFormConfig: FormConfig = {
  groups: [
    // ==========================================
    // Группа 1: Информация о покупателе (8 полей)
    // ==========================================
    {
      name: 'Информация о покупателе',
      showTitle: true,
      showBorder: true,
      fields: [
        {
          name: 'firstName',
          label: 'Имя',
          type: 'input',
          placeholder: 'Введите имя',
          validateCondition: {
            comparisonType: 'and',
            children: [
              { field: 'firstName', condition: '!∅', message: 'Имя обязательно' },
            ],
          },
        },
        {
          name: 'lastName',
          label: 'Фамилия',
          type: 'input',
          placeholder: 'Введите фамилию',
          validateCondition: {
            comparisonType: 'and',
            children: [
              { field: 'lastName', condition: '!∅', message: 'Фамилия обязательна' },
            ],
          },
        },
        {
          name: 'email',
          label: 'Email',
          type: 'input',
          inputType: 'email',
          placeholder: 'example@mail.com',
          validateCondition: {
            comparisonType: 'and',
            children: [
              { field: 'email', condition: '!∅', message: 'Email обязателен' },
              { field: 'email', condition: 'match', value: '^[^@]+@[^@]+\\.[^@]+$', message: 'Неверный формат email' },
            ],
          },
        },
        {
          name: 'phone',
          label: 'Телефон',
          type: 'input',
          inputType: 'tel',
          placeholder: '+7 (999) 123-45-67',
          validateCondition: {
            comparisonType: 'or',
            children: [
              { field: 'phone', condition: '∅' },
              { field: 'phone', condition: 'match', value: '^\\+?[0-9\\s\\-\\(\\)]{10,}$', message: 'Неверный формат телефона' },
            ],
          },
        },
        {
          name: 'birthDate',
          label: 'Дата рождения',
          type: 'date',
          placeholder: 'Выберите дату',
        },
        {
          name: 'isCompany',
          label: 'Заказ от юридического лица',
          type: 'switch',
        },
        {
          name: 'companyName',
          label: 'Название компании',
          type: 'input',
          placeholder: 'ООО "Компания"',
          visibleCondition: {
            comparisonType: 'and',
            children: [
              { field: 'isCompany', condition: '===', value: true },
            ],
          },
          validateCondition: {
            comparisonType: 'or',
            children: [
              { field: 'isCompany', condition: '===', value: false },
              { field: 'companyName', condition: '!∅', message: 'Название компании обязательно' },
            ],
          },
        },
        {
          name: 'companyTaxId',
          label: 'ИНН',
          type: 'input',
          placeholder: '1234567890',
          visibleCondition: {
            comparisonType: 'and',
            children: [
              { field: 'isCompany', condition: '===', value: true },
            ],
          },
          validateCondition: {
            comparisonType: 'or',
            children: [
              { field: 'isCompany', condition: '===', value: false },
              {
                comparisonType: 'and',
                children: [
                  { field: 'companyTaxId', condition: '!∅', message: 'ИНН обязателен' },
                  { field: 'companyTaxId', condition: 'match', value: '^[0-9]{10,12}$', message: 'ИНН должен содержать 10-12 цифр' },
                ],
              },
            ],
          },
        },
      ],
    },

    // ==========================================
    // Группа 2: Адрес доставки (7 полей)
    // ==========================================
    {
      name: 'Адрес доставки',
      showTitle: true,
      showBorder: true,
      fields: [
        {
          name: 'country',
          label: 'Страна',
          type: 'select',
          placeholder: 'Выберите страну',
          options: [
            { value: 'ru', label: 'Россия' },
            { value: 'kz', label: 'Казахстан' },
            { value: 'by', label: 'Беларусь' },
          ],
          validateCondition: {
            comparisonType: 'and',
            children: [
              { field: 'country', condition: '!∅', message: 'Выберите страну' },
            ],
          },
        },
        {
          name: 'city',
          label: 'Город',
          type: 'input',
          placeholder: 'Введите город',
          validateCondition: {
            comparisonType: 'and',
            children: [
              { field: 'city', condition: '!∅', message: 'Город обязателен' },
            ],
          },
        },
        {
          name: 'street',
          label: 'Улица',
          type: 'input',
          placeholder: 'Введите улицу',
          validateCondition: {
            comparisonType: 'and',
            children: [
              { field: 'street', condition: '!∅', message: 'Улица обязательна' },
            ],
          },
        },
        {
          name: 'building',
          label: 'Дом',
          type: 'input',
          placeholder: '123',
          validateCondition: {
            comparisonType: 'and',
            children: [
              { field: 'building', condition: '!∅', message: 'Номер дома обязателен' },
            ],
          },
        },
        {
          name: 'apartment',
          label: 'Квартира/Офис',
          type: 'input',
          placeholder: '45',
        },
        {
          name: 'postalCode',
          label: 'Почтовый индекс',
          type: 'input',
          placeholder: '123456',
          validateCondition: {
            comparisonType: 'or',
            children: [
              { field: 'postalCode', condition: '∅' },
              { field: 'postalCode', condition: 'match', value: '^[0-9]{5,6}$', message: 'Индекс должен содержать 5-6 цифр' },
            ],
          },
        },
        {
          name: 'deliveryNotes',
          label: 'Комментарий для курьера',
          type: 'input',
          placeholder: 'Код домофона, этаж и т.д.',
        },
      ],
    },

    // ==========================================
    // Группа 3: Способ доставки (6 полей)
    // ==========================================
    {
      name: 'Способ доставки',
      showTitle: true,
      showBorder: true,
      fields: [
        {
          name: 'deliveryType',
          label: 'Тип доставки',
          type: 'select',
          placeholder: 'Выберите способ доставки',
          options: [
            { value: 'courier', label: 'Курьер' },
            { value: 'pickup', label: 'Самовывоз' },
            { value: 'post', label: 'Почта' },
          ],
          validateCondition: {
            comparisonType: 'and',
            children: [
              { field: 'deliveryType', condition: '!∅', message: 'Выберите способ доставки' },
            ],
          },
        },
        {
          name: 'courierDate',
          label: 'Дата доставки',
          type: 'date',
          placeholder: 'Выберите дату',
          visibleCondition: {
            comparisonType: 'and',
            children: [
              { field: 'deliveryType', condition: '===', value: 'courier' },
            ],
          },
          validateCondition: {
            comparisonType: 'or',
            children: [
              { field: 'deliveryType', condition: '!==', value: 'courier' },
              { field: 'courierDate', condition: '!∅', message: 'Выберите дату доставки' },
            ],
          },
        },
        {
          name: 'courierTimeSlot',
          label: 'Время доставки',
          type: 'select',
          placeholder: 'Выберите время',
          options: [
            { value: 'morning', label: '09:00 - 12:00' },
            { value: 'afternoon', label: '12:00 - 18:00' },
            { value: 'evening', label: '18:00 - 21:00' },
          ],
          visibleCondition: {
            comparisonType: 'and',
            children: [
              { field: 'deliveryType', condition: '===', value: 'courier' },
            ],
          },
        },
        {
          name: 'pickupPoint',
          label: 'Пункт выдачи',
          type: 'select',
          placeholder: 'Выберите пункт',
          options: [
            { value: 'point1', label: 'ТЦ Мега, 1 этаж' },
            { value: 'point2', label: 'ТЦ Европейский, 2 этаж' },
            { value: 'point3', label: 'ТЦ Атриум, -1 этаж' },
          ],
          visibleCondition: {
            comparisonType: 'and',
            children: [
              { field: 'deliveryType', condition: '===', value: 'pickup' },
            ],
          },
          validateCondition: {
            comparisonType: 'or',
            children: [
              { field: 'deliveryType', condition: '!==', value: 'pickup' },
              { field: 'pickupPoint', condition: '!∅', message: 'Выберите пункт выдачи' },
            ],
          },
        },
        {
          name: 'postOffice',
          label: 'Номер почтового отделения',
          type: 'input',
          placeholder: '123456',
          visibleCondition: {
            comparisonType: 'and',
            children: [
              { field: 'deliveryType', condition: '===', value: 'post' },
            ],
          },
        },
        {
          name: 'urgentDelivery',
          label: 'Срочная доставка (+500 ₽)',
          type: 'switch',
          visibleCondition: {
            comparisonType: 'and',
            children: [
              { field: 'deliveryType', condition: '===', value: 'courier' },
            ],
          },
        },
      ],
    },

    // ==========================================
    // Группа 4: Товары в заказе (8 полей)
    // ==========================================
    {
      name: 'Товары в заказе',
      showTitle: true,
      showBorder: true,
      fields: [
        {
          name: 'productCategory',
          label: 'Категория товара',
          type: 'select',
          placeholder: 'Выберите категорию',
          options: [
            { value: 'electronics', label: 'Электроника' },
            { value: 'clothing', label: 'Одежда' },
            { value: 'food', label: 'Продукты' },
            { value: 'other', label: 'Другое' },
          ],
          validateCondition: {
            comparisonType: 'and',
            children: [
              { field: 'productCategory', condition: '!∅', message: 'Выберите категорию' },
            ],
          },
        },
        {
          name: 'productName',
          label: 'Название товара',
          type: 'input',
          placeholder: 'Введите название',
          validateCondition: {
            comparisonType: 'and',
            children: [
              { field: 'productName', condition: '!∅', message: 'Название товара обязательно' },
            ],
          },
        },
        {
          name: 'quantity',
          label: 'Количество',
          type: 'inputNumber',
          min: 1,
          max: 100,
          defaultValue: 1,
          validateCondition: {
            comparisonType: 'and',
            children: [
              { field: 'quantity', condition: '>=', value: 1, message: 'Минимум 1 единица' },
              { field: 'quantity', condition: '<=', value: 100, message: 'Максимум 100 единиц' },
            ],
          },
        },
        {
          name: 'pricePerUnit',
          label: 'Цена за единицу (₽)',
          type: 'inputNumber',
          min: 0,
          placeholder: '0',
          validateCondition: {
            comparisonType: 'and',
            children: [
              { field: 'pricePerUnit', condition: '>', value: 0, message: 'Укажите цену' },
            ],
          },
        },
        {
          name: 'discount',
          label: 'Скидка (%)',
          type: 'inputNumber',
          min: 0,
          max: 50,
          defaultValue: 0,
          validateCondition: {
            comparisonType: 'and',
            children: [
              { field: 'discount', condition: '>=', value: 0, message: 'Скидка не может быть отрицательной' },
              { field: 'discount', condition: '<=', value: 50, message: 'Максимальная скидка 50%' },
            ],
          },
        },
        {
          name: 'giftWrap',
          label: 'Подарочная упаковка (+200 ₽)',
          type: 'switch',
        },
        {
          name: 'giftMessage',
          label: 'Текст поздравления',
          type: 'input',
          placeholder: 'Введите текст',
          maxLength: 200,
          visibleCondition: {
            comparisonType: 'and',
            children: [
              { field: 'giftWrap', condition: '===', value: true },
            ],
          },
        },
        {
          name: 'productNotes',
          label: 'Примечания к товару',
          type: 'input',
          placeholder: 'Цвет, размер и т.д.',
        },
      ],
    },

    // ==========================================
    // Группа 5: Оплата (7 полей)
    // ==========================================
    {
      name: 'Оплата',
      showTitle: true,
      showBorder: true,
      fields: [
        {
          name: 'paymentMethod',
          label: 'Способ оплаты',
          type: 'select',
          placeholder: 'Выберите способ оплаты',
          options: [
            { value: 'card', label: 'Банковская карта' },
            { value: 'cash', label: 'Наличные при получении' },
            { value: 'invoice', label: 'Счёт для юр. лиц' },
          ],
          validateCondition: {
            comparisonType: 'and',
            children: [
              { field: 'paymentMethod', condition: '!∅', message: 'Выберите способ оплаты' },
            ],
          },
        },
        {
          name: 'cardNumber',
          label: 'Номер карты',
          type: 'input',
          placeholder: '0000 0000 0000 0000',
          visibleCondition: {
            comparisonType: 'and',
            children: [
              { field: 'paymentMethod', condition: '===', value: 'card' },
            ],
          },
          validateCondition: {
            comparisonType: 'or',
            children: [
              { field: 'paymentMethod', condition: '!==', value: 'card' },
              {
                comparisonType: 'and',
                children: [
                  { field: 'cardNumber', condition: '!∅', message: 'Введите номер карты' },
                  { field: 'cardNumber', condition: 'match', value: '^[0-9\\s]{16,19}$', message: 'Неверный номер карты' },
                ],
              },
            ],
          },
        },
        {
          name: 'cardExpiry',
          label: 'Срок действия',
          type: 'input',
          placeholder: 'MM/YY',
          visibleCondition: {
            comparisonType: 'and',
            children: [
              { field: 'paymentMethod', condition: '===', value: 'card' },
            ],
          },
          validateCondition: {
            comparisonType: 'or',
            children: [
              { field: 'paymentMethod', condition: '!==', value: 'card' },
              {
                comparisonType: 'and',
                children: [
                  { field: 'cardExpiry', condition: '!∅', message: 'Введите срок действия' },
                  { field: 'cardExpiry', condition: 'match', value: '^(0[1-9]|1[0-2])\\/[0-9]{2}$', message: 'Формат: MM/YY' },
                ],
              },
            ],
          },
        },
        {
          name: 'cardCvv',
          label: 'CVV',
          type: 'input',
          inputType: 'password',
          placeholder: '***',
          maxLength: 4,
          visibleCondition: {
            comparisonType: 'and',
            children: [
              { field: 'paymentMethod', condition: '===', value: 'card' },
            ],
          },
          validateCondition: {
            comparisonType: 'or',
            children: [
              { field: 'paymentMethod', condition: '!==', value: 'card' },
              {
                comparisonType: 'and',
                children: [
                  { field: 'cardCvv', condition: '!∅', message: 'Введите CVV' },
                  { field: 'cardCvv', condition: 'match', value: '^[0-9]{3,4}$', message: 'CVV: 3-4 цифры' },
                ],
              },
            ],
          },
        },
        {
          name: 'invoiceEmail',
          label: 'Email для счёта',
          type: 'input',
          inputType: 'email',
          placeholder: 'accounting@company.com',
          visibleCondition: {
            comparisonType: 'and',
            children: [
              { field: 'paymentMethod', condition: '===', value: 'invoice' },
            ],
          },
        },
        {
          name: 'invoiceAddress',
          label: 'Юридический адрес',
          type: 'input',
          placeholder: 'Адрес для счёта',
          visibleCondition: {
            comparisonType: 'and',
            children: [
              { field: 'paymentMethod', condition: '===', value: 'invoice' },
            ],
          },
        },
        {
          name: 'savePaymentMethod',
          label: 'Сохранить способ оплаты',
          type: 'switch',
          visibleCondition: {
            comparisonType: 'and',
            children: [
              { field: 'paymentMethod', condition: '===', value: 'card' },
            ],
          },
        },
      ],
    },

    // ==========================================
    // Группа 6: Промокод и бонусы (6 полей)
    // ==========================================
    {
      name: 'Промокод и бонусы',
      showTitle: true,
      showBorder: true,
      fields: [
        {
          name: 'hasPromoCode',
          label: 'У меня есть промокод',
          type: 'switch',
        },
        {
          name: 'promoCode',
          label: 'Промокод',
          type: 'input',
          placeholder: 'PROMO2024',
          visibleCondition: {
            comparisonType: 'and',
            children: [
              { field: 'hasPromoCode', condition: '===', value: true },
            ],
          },
          validateCondition: {
            comparisonType: 'or',
            children: [
              { field: 'hasPromoCode', condition: '===', value: false },
              { field: 'promoCode', condition: '!∅', message: 'Введите промокод' },
            ],
          },
        },
        {
          name: 'promoApplied',
          label: 'Промокод применён',
          type: 'switch',
          visibleCondition: {
            comparisonType: 'and',
            children: [
              { field: 'hasPromoCode', condition: '===', value: true },
              { field: 'promoCode', condition: '!∅' },
            ],
          },
          disabledCondition: {
            comparisonType: 'and',
            children: [
              { field: 'promoCode', condition: '∅' },
            ],
          },
        },
        {
          name: 'useBonusPoints',
          label: 'Использовать бонусные баллы',
          type: 'switch',
        },
        {
          name: 'bonusPointsAmount',
          label: 'Количество баллов',
          type: 'inputNumber',
          min: 0,
          max: 10000,
          placeholder: '0',
          visibleCondition: {
            comparisonType: 'and',
            children: [
              { field: 'useBonusPoints', condition: '===', value: true },
            ],
          },
          validateCondition: {
            comparisonType: 'or',
            children: [
              { field: 'useBonusPoints', condition: '===', value: false },
              {
                comparisonType: 'and',
                children: [
                  { field: 'bonusPointsAmount', condition: '>=', value: 0, message: 'Минимум 0 баллов' },
                  { field: 'bonusPointsAmount', condition: '<=', value: 10000, message: 'Максимум 10000 баллов' },
                ],
              },
            ],
          },
        },
        {
          name: 'certificateNumber',
          label: 'Номер подарочного сертификата',
          type: 'input',
          placeholder: 'CERT-XXXX-XXXX',
        },
      ],
    },

    // ==========================================
    // Группа 7: Подтверждение (8 полей)
    // ==========================================
    {
      name: 'Подтверждение заказа',
      showTitle: true,
      showBorder: true,
      validateCondition: {
        comparisonType: 'and',
        children: [
          { field: 'agreeTerms', condition: '===', value: true, message: 'Необходимо принять условия' },
          { field: 'agreePrivacy', condition: '===', value: true, message: 'Необходимо принять политику конфиденциальности' },
        ],
      },
      fields: [
        {
          name: 'agreeTerms',
          label: 'Согласен с условиями использования',
          type: 'switch',
          validateCondition: {
            comparisonType: 'and',
            children: [
              { field: 'agreeTerms', condition: '===', value: true, message: 'Необходимо принять условия' },
            ],
          },
        },
        {
          name: 'agreePrivacy',
          label: 'Согласен с политикой конфиденциальности',
          type: 'switch',
          validateCondition: {
            comparisonType: 'and',
            children: [
              { field: 'agreePrivacy', condition: '===', value: true, message: 'Необходимо принять политику' },
            ],
          },
        },
        {
          name: 'subscribeNews',
          label: 'Подписаться на новости',
          type: 'switch',
        },
        {
          name: 'subscribePromo',
          label: 'Получать промо-акции',
          type: 'switch',
          visibleCondition: {
            comparisonType: 'and',
            children: [
              { field: 'subscribeNews', condition: '===', value: true },
            ],
          },
        },
        {
          name: 'preferredContactMethod',
          label: 'Предпочтительный способ связи',
          type: 'select',
          placeholder: 'Выберите способ',
          options: [
            { value: 'email', label: 'Email' },
            { value: 'phone', label: 'Телефон' },
            { value: 'both', label: 'Email и телефон' },
          ],
        },
        {
          name: 'contactTime',
          label: 'Удобное время для звонка',
          type: 'select',
          placeholder: 'Выберите время',
          options: [
            { value: 'morning', label: 'Утро (9:00-12:00)' },
            { value: 'afternoon', label: 'День (12:00-18:00)' },
            { value: 'evening', label: 'Вечер (18:00-21:00)' },
          ],
          visibleCondition: {
            comparisonType: 'and',
            children: [
              {
                comparisonType: 'or',
                children: [
                  { field: 'preferredContactMethod', condition: '===', value: 'phone' },
                  { field: 'preferredContactMethod', condition: '===', value: 'both' },
                ],
              },
            ],
          },
        },
        {
          name: 'additionalComments',
          label: 'Дополнительные комментарии',
          type: 'input',
          placeholder: 'Любая дополнительная информация',
        },
        {
          name: 'confirmOrder',
          label: 'Подтверждаю правильность данных',
          type: 'switch',
          disabledCondition: {
            comparisonType: 'or',
            children: [
              { field: 'agreeTerms', condition: '!==', value: true },
              { field: 'agreePrivacy', condition: '!==', value: true },
            ],
          },
        },
      ],
    },
  ],
}
