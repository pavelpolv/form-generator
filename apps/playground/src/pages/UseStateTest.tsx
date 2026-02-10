import { useState } from 'react'
import { Input, Button, Form, Card, Typography } from 'antd'

const { Title } = Typography

export default function UseStateTest() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const onSubmit = () => {
    console.log('Submitted:', { firstName, lastName })
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>useState тест (без react-hook-form)</Title>
      <Card>
        <Form layout="vertical">
          <Form.Item label="Имя">
            <Input
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Введите имя"
            />
          </Form.Item>
          <Form.Item label="Фамилия">
            <Input
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Введите фамилию"
            />
          </Form.Item>
          <Button type="primary" onClick={onSubmit}>Отправить</Button>
        </Form>
      </Card>
    </div>
  )
}
