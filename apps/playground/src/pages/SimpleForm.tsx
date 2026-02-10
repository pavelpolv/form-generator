import { Typography, Card } from 'antd'
import { FormGenerator } from '@form-generator/core'
import type { FormConfig } from '@form-generator/core'

const { Title } = Typography

const simpleConfig: FormConfig = {
  groups: [
    {
      name: 'Тестовая группа',
      showTitle: true,
      showBorder: true,
      fields: [
        {
          name: 'firstName',
          label: 'Имя',
          type: 'input',
          placeholder: 'Введите имя',
        },
        {
          name: 'lastName',
          label: 'Фамилия',
          type: 'input',
          placeholder: 'Введите фамилию',
        },
        {
          name: 'email',
          label: 'Email',
          type: 'input',
          inputType: 'email',
          placeholder: 'example@mail.com',
        },
      ],
    },
  ],
}

export default function SimpleForm() {
  const handleSubmit = (values: Record<string, unknown>) => {
    console.log('Form submitted:', values)
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Простая форма (без условий)</Title>
      <Card>
        <FormGenerator
          config={simpleConfig}
          onSubmit={handleSubmit}
          showSubmitButton={true}
          submitButtonText="Отправить"
        />
      </Card>
    </div>
  )
}
