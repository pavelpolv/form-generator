import { useRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button, Card, Space } from 'antd'
import { FormGenerator } from '@/components/FormGenerator'
import { FormGeneratorRef } from '@/components/FormGenerator/FormGenerator'
import { FormConfig } from '@/types'

const meta: Meta = {
  title: 'Examples/Loan Issuance Fee',
  parameters: {
    layout: 'padded',
  },
}

export default meta

const loanIssuanceFeeConfig: FormConfig = {
  groups: [
    {
      name: 'Параметры комиссии',
      showTitle: false,
      showBorder: false,
      fields: [
        {
          type: 'switch',
          name: 'passToTranche',
          label: 'Передавать условие на транш',
          checkedText: 'Да',
          uncheckedText: 'Нет',
          defaultValue: true,
        },
        {
          type: 'textarea',
          name: 'chargeComment',
          label: 'Комментарий',
        },
        {
          type: 'select',
          label: 'Вид комиссии',
          name: 'chageComissType',
          options: [
            { label: 'Фиксированная', value: '1' },
            { label: 'Расчетная', value: '2' },
            { label: 'Ручной график', value: 'manual' },
          ],
          validateCondition: {
            comparisonType: 'or',
            children: [
              { field: 'passToTranche', condition: '===', value: false },
              {
                comparisonType: 'and',
                children: [
                  { field: 'chageComissType', condition: '!∅', message: 'Вид комиссии обязательное поле.' },
                  {
                    field: 'chageComissType',
                    condition: '!==',
                    value: 'manual',
                    message: 'Для Ручного графика значение "Передавать условие на транш" должно быть = НЕТ',
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'inputNumber',
          name: 'chargePercentRate',
          label: 'Значение ставки',
          min: 0,
          visibleCondition: {
            comparisonType: 'and',
            children: [
              { field: 'chageComissType', condition: '===', value: '2' },
            ],
          },
          validateCondition: {
            comparisonType: 'or',
            children: [
              { field: 'passToTranche', condition: '===', value: false },
              { field: 'rateValue', condition: '!∅', message: 'Поле "Значение ставки" не должно быть пустым' },
            ],
          },
        },
        {
          type: 'select',
          name: 'chargePercentOf',
          label: 'База расчета',
          allowClear: true,
          options: [
            { label: '% от суммы договора/транша', value: '1' },
          ],
          visibleCondition: {
            comparisonType: 'and',
            children: [
              { field: 'chageComissType', condition: '===', value: '2' },
            ],
          },
          validateCondition: {
            comparisonType: 'or',
            children: [
              { field: 'passToTranche', condition: '===', value: false },
              { field: 'rateValue', condition: '!∅', message: 'Поле "База расчета" не должно быть пустым' },
            ],
          },
        },
        {
          type: 'money',
          name: 'chargeAmount',
          label: 'Сумма',
          visibleCondition: {
            comparisonType: 'and',
            children: [{ field: 'chageComissType', condition: '===', value: '1' }],
          },
          validateCondition: {
            comparisonType: 'or',
            children: [
              { field: 'passToTranche', condition: '===', value: false },
              { field: 'chargeAmount', condition: '!∅', message: 'Поле "Сумма" не должно быть пустым' },
            ],
          },
        },
        {
          type: 'select',
          name: 'comissCurrency',
          label: 'Валюта',
          options: [
            { label: 'Российский рубль', value: 643 },
            { label: 'Евро', value: 978 },
            { label: 'Доллар США', value: 840 },
            { label: 'Китайский юань', value: 156 },
            { label: 'Киргизский сом', value: 417 },
            { label: 'Казахстанский тенге', value: 398 },
          ],
        },
        {
          type: 'select',
          name: 'chargeChartType',
          label: 'Периодичность',
          options: [{ label: 'Единовременно', value: 'INDATE' }],
          allowClear: true,
          visibleCondition: {
            comparisonType: 'and',
            children: [
              { field: 'chageComissType', condition: '!==', value: 'manual' },
              { field: 'chageComissType', condition: '!∅' },
            ],
          },
          validateCondition: {
            comparisonType: 'or',
            children: [
              { field: 'passToTranche', condition: '===', value: false },
              { field: 'chargeChartType', condition: '!∅', message: 'Поле "Периодичность" не должно быть пустым' },
            ],
          },
        },
      ],
    },
    {
      name: 'Отсрочка-Аванс',
      showTitle: false,
      showBorder: false,
      fields: [
        {
          type: 'select',
          name: 'chargeType',
          label: 'Вид',
          defaultValue: 1,
          allowClear: true,
          options: [
            { label: 'Отсрочка', value: 3 },
            { label: 'Нет', value: 1 },
          ],
          validateCondition: {
            comparisonType: 'and',
            children: [
              {
                comparisonType: 'or',
                children: [
                  { field: 'chageComissType', condition: '===', value: '1' },
                  { field: 'chageComissType', condition: '===', value: '2' },
                ],
              },
              { field: 'passToTranche', condition: '===', value: true },
              { field: 'chargeType', condition: '!∅', message: 'Поле "Вид" не должно быть пустым.' },
            ],
          },
        },
        {
          type: 'inputNumber',
          name: 'chargePayment',
          label: 'Количество дней',
          visibleCondition: {
            comparisonType: 'and',
            children: [{ field: 'chargeType', condition: '===', value: 3 }],
          },
          validateCondition: {
            comparisonType: 'and',
            children: [{ field: 'chargePayment', condition: '!∅', message: 'Обязательное поле' }],
          },
        },
        {
          type: 'select',
          name: 'chargeDay',
          label: 'День',
          defaultValue: '1',
          options: [
            { label: 'Рабочий', value: '2' },
            { label: 'Календарный', value: '1' },
          ],
          visibleCondition: {
            comparisonType: 'and',
            children: [{ field: 'chargeType', condition: '===', value: 3 }],
          },
          validateCondition: {
            comparisonType: 'and',
            children: [{ field: 'chargeDay', condition: '!∅', message: 'Поле "День" не должно быть пустым' }],
          },
        },
      ],
    },
    {
      name: 'Параметры погашения',
      showTitle: false,
      showBorder: false,
      fields: [
        {
          type: 'select',
          name: 'chargeСorrectPayDay',
          label: 'Сдвиг даты',
          options: [
            { label: 'Назад', value: '1' },
            { label: 'Не сдвигать', value: '2' },
            { label: 'Вперед', value: '3' },
          ],
          validateCondition: {
            comparisonType: 'or',
            children: [
              { field: 'passToTranche', condition: '===', value: false },
              {
                field: 'chargeСorrectPayDay',
                condition: '!∅',
                message: 'Поле "Сдвиг даты" не должно быть пустым.',
              },
            ],
          },
        },
      ],
    },
    {
      name: 'График1',
      showTitle: false,
      showBorder: false,
      fields: [
        {
          type: 'dynamicList',
          name: 'repaymentSchedule',
          label: 'График',
          itemFields: [
            {
              type: 'date',
              label: 'Дата',
              name: 'dateRepayment',
              validateCondition: {
                comparisonType: 'and',
                children: [{ field: 'dateRepayment', condition: '!∅', message: 'Обязательное поле' }],
              },
            },
            {
              type: 'money',
              name: 'sumRepayment',
              label: 'Сумма',
              validateCondition: {
                comparisonType: 'and',
                children: [{ field: 'sumRepayment', condition: '!∅', message: 'Обязательное поле' }],
              },
            },
          ],
          addButton: {
            label: 'Добавить дату',
            block: false,
          },
          visibleCondition: {
            comparisonType: 'and',
            children: [{ field: 'chageComissType', condition: '===', value: 'manual' }],
          },
          validateCondition: {
            comparisonType: 'and',
            children: [
              { field: 'repaymentSchedule', condition: '!∅', message: ' Поле "График" не должно быть пустым' },
            ],
          },
        },
      ],
    },
  ],
}

const LoanIssuanceFeeExample = () => {
  const formRef = useRef<FormGeneratorRef>(null)

  return (
    <div>
      <Card>
        <FormGenerator
          ref={formRef}
          config={{ ...loanIssuanceFeeConfig, buttons: [] }}
          debug
          onSubmit={(values) => {
            console.log('[LoanIssuanceFee] submit values:', values)
          }}
        />
      </Card>

      <Space style={{ marginTop: 16 }}>
        <Button
          type="primary"
          onClick={() => formRef.current?.submit()}
        >
          Сохранить
        </Button>
        <Button onClick={() => formRef.current?.reset()}>
          Сбросить
        </Button>
      </Space>
    </div>
  )
}

export const LoanIssuanceFee: StoryObj = {
  render: () => <LoanIssuanceFeeExample />,
}
