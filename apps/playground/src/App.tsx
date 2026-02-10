import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import { DashboardOutlined, ThunderboltOutlined, FormOutlined } from '@ant-design/icons'
import StressTest from './pages/StressTest'
import MetricsHistory from './pages/MetricsHistory'
import OrderForm from './pages/OrderForm'
import SimpleForm from './pages/SimpleForm'
import MinimalTest from './pages/MinimalTest'
import UseStateTest from './pages/UseStateTest'
import NativeTest from './pages/NativeTest'

const { Header, Content, Sider } = Layout

// Menu items defined outside component to avoid recreation
const menuItems = [
  {
    key: '/order-form',
    icon: <FormOutlined />,
    label: <Link to="/order-form">Форма заказа</Link>,
  },
  {
    key: '/stress-test',
    icon: <ThunderboltOutlined />,
    label: <Link to="/stress-test">Стресс-тест</Link>,
  },
  {
    key: '/metrics',
    icon: <DashboardOutlined />,
    label: <Link to="/metrics">История метрик</Link>,
  },
]

function App() {
  const location = useLocation()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={200}>
        <div style={{ padding: 16, fontWeight: 'bold', fontSize: 16 }}>
          FormGenerator
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname === '/' ? '/order-form' : location.pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
          <h2 style={{ margin: 0, lineHeight: '64px' }}>
            {location.pathname === '/metrics' ? 'История метрик' :
             location.pathname === '/stress-test' ? 'Стресс-тест' : 'Форма заказа'}
          </h2>
        </Header>
        <Content style={{ margin: 24, background: '#fff', borderRadius: 8, minHeight: 280 }}>
          <Routes>
            <Route path="/" element={<OrderForm />} />
            <Route path="/order-form" element={<OrderForm />} />
            <Route path="/stress-test" element={<StressTest />} />
            <Route path="/metrics" element={<MetricsHistory />} />
            <Route path="/simple" element={<SimpleForm />} />
            <Route path="/minimal" element={<MinimalTest />} />
            <Route path="/usestate" element={<UseStateTest />} />
            <Route path="/native" element={<NativeTest />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
