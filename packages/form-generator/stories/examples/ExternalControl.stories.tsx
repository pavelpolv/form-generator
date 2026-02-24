import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button, Space, Card, Typography, Divider } from 'antd'
import { FormGenerator } from '@/components/FormGenerator'
import { FormGeneratorRef } from '@/components/FormGenerator/FormGenerator'
import { FormConfig, FormValues } from '@/types'

const { Text, Title } = Typography

const meta: Meta = {
  title: 'Examples/External Control (ref)',
  parameters: {
    layout: 'padded',
  },
}

export default meta

// --- История 1: Внешние кнопки ---

const formConfig: FormConfig = {
  groups: [
    {
      name: 'Профиль',
      fields: [
        {
          type: 'input',
          name: 'name',
          label: 'Имя',
          placeholder: 'Введите ваше имя',
          inputType: 'text',
        },
        {
          type: 'input',
          name: 'email',
          label: 'Электронная почта',
          placeholder: 'Введите вашу электронную почту',
          inputType: 'email',
        },
        {
          type: 'textarea',
          name: 'bio',
          label: 'О себе',
          placeholder: 'Расскажите о себе...',
          rows: 3,
        },
      ],
    },
  ],
}

const ExternalButtonsExample = () => {
  const formRef = useRef<FormGeneratorRef>(null)

  return (
    <div>
      <Title level={4}>Внешние кнопки</Title>
      <Text type="secondary">
        Кнопки формы расположены вне компонента FormGenerator.
        Ref предоставляет методы getValues(), reset() и submit().
      </Text>

      <Card style={{ marginTop: 16 }}>
        <FormGenerator
          ref={formRef}
          config={{ ...formConfig, buttons: [] }}
          initialValues={{ name: '', email: '', bio: '' }}
        />
      </Card>

      <Divider />

      <Space>
        <Button
          type="primary"
          onClick={() => formRef.current?.submit()}
        >
          Отправить (внешняя кнопка)
        </Button>
        <Button
          onClick={() => formRef.current?.reset()}
        >
          Сбросить (внешняя кнопка)
        </Button>
        <Button
          onClick={() => formRef.current?.reset({
            name: 'John Doe',
            email: 'john@example.com',
            bio: 'Разработчик программного обеспечения',
          })}
        >
          Заполнить тестовыми данными
        </Button>
      </Space>
    </div>
  )
}

export const ExternalButtons: StoryObj = {
  render: () => <ExternalButtonsExample />,
}

// --- История 2: Чтение значений формы ---

const ReadValuesExample = () => {
  const formRef = useRef<FormGeneratorRef>(null)
  const [snapshot, setSnapshot] = useState<FormValues | null>(null)

  return (
    <div>
      <Title level={4}>Чтение значений формы</Title>
      <Text type="secondary">
        Используйте getValues() для чтения текущего состояния формы в любой момент без отправки.
      </Text>

      <Card style={{ marginTop: 16 }}>
        <FormGenerator
          ref={formRef}
          config={{ ...formConfig, buttons: [] }}
          initialValues={{ name: 'Alice', email: 'alice@example.com', bio: '' }}
        />
      </Card>

      <Divider />

      <Space>
        <Button
          type="primary"
          onClick={() => setSnapshot(formRef.current?.getValues() ?? null)}
        >
          Прочитать текущие значения
        </Button>
        <Button onClick={() => setSnapshot(null)}>
          Очистить снимок
        </Button>
      </Space>

      {snapshot && (
        <Card style={{ marginTop: 16, background: '#f6f6f6' }}>
          <Text strong>Снимок:</Text>
          <pre style={{ marginTop: 8, fontSize: 13 }}>
            {JSON.stringify(snapshot, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  )
}

export const ReadValues: StoryObj = {
  render: () => <ReadValuesExample />,
}

// --- История 3: Мастер / Многошаговая форма ---

const step1Config: FormConfig = {
  groups: [
    {
      name: 'Шаг 1: Личные данные',
      fields: [
        {
          type: 'input',
          name: 'firstName',
          label: 'Имя',
          placeholder: 'Введите имя',
          inputType: 'text',
        },
        {
          type: 'input',
          name: 'lastName',
          label: 'Фамилия',
          placeholder: 'Введите фамилию',
          inputType: 'text',
        },
      ],
    },
  ],
}

const step2Config: FormConfig = {
  groups: [
    {
      name: 'Шаг 2: Контакты',
      fields: [
        {
          type: 'input',
          name: 'email',
          label: 'Электронная почта',
          placeholder: 'Введите электронную почту',
          inputType: 'email',
        },
        {
          type: 'input',
          name: 'phone',
          label: 'Телефон',
          placeholder: 'Введите номер телефона',
          inputType: 'tel',
        },
      ],
    },
  ],
}

const step3Config: FormConfig = {
  groups: [
    {
      name: 'Шаг 3: Дополнительная информация',
      fields: [
        {
          type: 'textarea',
          name: 'notes',
          label: 'Примечания',
          placeholder: 'Любые дополнительные примечания...',
          rows: 4,
        },
        {
          type: 'switch',
          name: 'subscribe',
          label: 'Подписаться на рассылку',
          checkedText: 'Да',
          uncheckedText: 'Нет',
        },
      ],
    },
  ],
}

const steps = [step1Config, step2Config, step3Config]

const WizardExample = () => {
  const formRef = useRef<FormGeneratorRef>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [collectedData, setCollectedData] = useState<FormValues>({})
  const [submitted, setSubmitted] = useState(false)

  const handleNext = () => {
    const values = formRef.current?.getValues() ?? {}
    const merged = { ...collectedData, ...values }
    setCollectedData(merged)

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setSubmitted(true)
    }
  }

  const handleBack = () => {
    const values = formRef.current?.getValues() ?? {}
    setCollectedData({ ...collectedData, ...values })
    setCurrentStep(currentStep - 1)
  }

  if (submitted) {
    return (
      <div>
        <Title level={4}>Мастер завершён</Title>
        <Card style={{ background: '#f6ffed' }}>
          <Text strong>Собранные данные со всех шагов:</Text>
          <pre style={{ marginTop: 8, fontSize: 13 }}>
            {JSON.stringify(collectedData, null, 2)}
          </pre>
        </Card>
        <Button
          style={{ marginTop: 16 }}
          onClick={() => { setSubmitted(false); setCurrentStep(0); setCollectedData({}) }}
        >
          Начать заново
        </Button>
      </div>
    )
  }

  return (
    <div>
      <Title level={4}>Многошаговый мастер</Title>
      <Text type="secondary">
        Каждый шаг — отдельный FormGenerator. Ref используется для сбора значений
        перед переходом к следующему шагу.
      </Text>

      <div style={{ margin: '16px 0' }}>
        <Space>
          {steps.map((_, i) => (
            <Text
              key={i}
              strong={i === currentStep}
              type={i === currentStep ? undefined : 'secondary'}
            >
              Шаг {i + 1}{i < steps.length - 1 ? ' →' : ''}
            </Text>
          ))}
        </Space>
      </div>

      <Card>
        <FormGenerator
          key={currentStep}
          ref={formRef}
          config={{ ...steps[currentStep], buttons: [] }}
          initialValues={collectedData}
        />
      </Card>

      <Divider />

      <Space>
        <Button
          disabled={currentStep === 0}
          onClick={handleBack}
        >
          Назад
        </Button>
        <Button type="primary" onClick={handleNext}>
          {currentStep === steps.length - 1 ? 'Завершить' : 'Далее'}
        </Button>
      </Space>
    </div>
  )
}

export const Wizard: StoryObj = {
  render: () => <WizardExample />,
}

// --- История 4: SetValue ---

const SetValueExample = () => {
  const formRef = useRef<FormGeneratorRef>(null)
  const [snapshot, setSnapshot] = useState<FormValues | null>(null)

  const refreshSnapshot = () => {
    setSnapshot(formRef.current?.getValues() ?? null)
  }

  return (
    <div>
      <Title level={4}>Установка значений отдельных полей</Title>
      <Text type="secondary">
        Используйте setValue() для программной установки значений отдельных полей без сброса всей формы.
      </Text>

      <Card style={{ marginTop: 16 }}>
        <FormGenerator
          ref={formRef}
          config={{ ...formConfig, buttons: [] }}
          initialValues={{ name: '', email: '', bio: '' }}
        />
      </Card>

      <Divider />

      <Space wrap>
        <Button onClick={() => { formRef.current?.setValue('name', 'John Doe'); refreshSnapshot() }}>
          Заполнить имя
        </Button>
        <Button onClick={() => { formRef.current?.setValue('email', 'john@example.com'); refreshSnapshot() }}>
          Заполнить почту
        </Button>
        <Button onClick={() => {
          formRef.current?.setValue('name', 'Jane Smith')
          formRef.current?.setValue('email', 'jane@example.com')
          formRef.current?.setValue('bio', 'Fullstack-разработчик')
          refreshSnapshot()
        }}>
          Заполнить всё
        </Button>
        <Button onClick={() => { formRef.current?.setValue('name', ''); refreshSnapshot() }}>
          Очистить имя
        </Button>
        <Button onClick={refreshSnapshot}>
          Обновить снимок
        </Button>
      </Space>

      {snapshot && (
        <Card style={{ marginTop: 16, background: '#f6f6f6' }}>
          <Text strong>Текущие значения:</Text>
          <pre style={{ marginTop: 8, fontSize: 13 }}>
            {JSON.stringify(snapshot, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  )
}

export const SetValue: StoryObj = {
  render: () => <SetValueExample />,
}
