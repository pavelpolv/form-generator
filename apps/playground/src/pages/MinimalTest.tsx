import { useForm, Controller } from 'react-hook-form'
import { Input, Button, Form, Card, Typography } from 'antd'

const { Title } = Typography

export default function MinimalTest() {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
    },
  })

  const onSubmit = (data: Record<string, string>) => {
    console.log('Submitted:', data)
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Минимальный тест (без FormGenerator)</Title>
      <Card>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <Form.Item label="Имя">
                <Input {...field} placeholder="Введите имя" />
              </Form.Item>
            )}
          />
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <Form.Item label="Фамилия">
                <Input {...field} placeholder="Введите фамилию" />
              </Form.Item>
            )}
          />
          <Button type="primary" htmlType="submit">Отправить</Button>
        </Form>
      </Card>
    </div>
  )
}
