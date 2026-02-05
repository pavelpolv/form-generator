import { Typography } from 'antd'

const { Title, Paragraph } = Typography

function App() {
  return (
    <div style={{ padding: '50px', maxWidth: '800px', margin: '0 auto' }}>
      <Title>Form Generator</Title>
      <Paragraph>
        Configurable form generator with conditional logic.
      </Paragraph>
      <Paragraph>
        Use <code>npm run storybook</code> to see examples and documentation.
      </Paragraph>
    </div>
  )
}

export default App
