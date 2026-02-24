import type { Meta, StoryObj } from '@storybook/react'
import { Typography } from 'antd'

const { Title, Paragraph, Text } = Typography

const Introduction = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <Title>Form Generator</Title>
      <Paragraph>
        Настраиваемый генератор форм с поддержкой условной логики для React-приложений.
      </Paragraph>

      <Title level={2}>Возможности</Title>
      <ul>
        <li>
          <Text strong>Условная видимость:</Text> Показывать/скрывать поля и группы на основе значений формы
        </li>
        <li>
          <Text strong>Условная валидация:</Text> Динамические правила валидации с пользовательскими сообщениями об ошибках
        </li>
        <li>
          <Text strong>Состояние блокировки:</Text> Включать/отключать поля на основе условий
        </li>
        <li>
          <Text strong>Типобезопасность:</Text> Полная типизация с TypeScript
        </li>
        <li>
          <Text strong>Оптимизация производительности:</Text> Минимальное количество перерисовок с React Hook Form
        </li>
      </ul>

      <Title level={2}>Технологический стек</Title>
      <ul>
        <li>React 17</li>
        <li>TypeScript</li>
        <li>AntD v4</li>
        <li>React Hook Form</li>
      </ul>

      <Title level={2}>Примеры</Title>
      <Paragraph>
        Смотрите боковую панель для просмотра различных примеров и документации по полям.
      </Paragraph>
    </div>
  )
}

const meta: Meta<typeof Introduction> = {
  title: 'Introduction',
  component: Introduction,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof Introduction>

export const Welcome: Story = {}
