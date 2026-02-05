import type { Meta, StoryObj } from '@storybook/react'
import { Typography } from 'antd'

const { Title, Paragraph, Text } = Typography

const Introduction = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <Title>Form Generator</Title>
      <Paragraph>
        Configurable form generator with conditional logic for React applications.
      </Paragraph>

      <Title level={2}>Features</Title>
      <ul>
        <li>
          <Text strong>Conditional Visibility:</Text> Show/hide fields and groups based on form values
        </li>
        <li>
          <Text strong>Conditional Validation:</Text> Dynamic validation rules with custom error messages
        </li>
        <li>
          <Text strong>Disabled State:</Text> Enable/disable fields based on conditions
        </li>
        <li>
          <Text strong>Type Safe:</Text> Fully typed with TypeScript
        </li>
        <li>
          <Text strong>Performance Optimized:</Text> Minimal re-renders with React Hook Form
        </li>
      </ul>

      <Title level={2}>Tech Stack</Title>
      <ul>
        <li>React 17</li>
        <li>TypeScript</li>
        <li>AntD v4</li>
        <li>React Hook Form</li>
      </ul>

      <Title level={2}>Examples</Title>
      <Paragraph>
        Check the sidebar for various examples and field documentation.
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
