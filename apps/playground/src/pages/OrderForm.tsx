import { Profiler, useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { Typography, Card, Row, Col, Statistic, Divider, Button, Space } from 'antd'
import { FormGenerator } from '@form-generator/core'
import { orderFormConfig } from './orderFormConfig'
import type { FormConfig } from '@form-generator/core'

const { Title, Text } = Typography

interface RenderEvent {
  component: string
  phase: 'mount' | 'update'
  actualDuration: number
  timestamp: number
}

// Expose render events for E2E tests
declare global {
  interface Window {
    __RENDER_EVENTS__?: RenderEvent[]
  }
}

const configWithButtons: FormConfig = {
  ...orderFormConfig,
  buttons: [
    {
      key: 'submit',
      label: 'Оформить заказ',
      type: 'primary',
      action: 'submit',
      requiresValidation: true,
      url: 'https://httpbin.org/post',
    },
    {
      key: 'reset',
      label: 'Очистить',
      action: 'reset',
    },
  ],
}

export default function OrderForm() {
  const [metrics, setMetrics] = useState<RenderEvent[]>([])
  const metricsRef = useRef<RenderEvent[]>([])
  const [isTracking, setIsTracking] = useState(false)

  const handleProfilerRender = useCallback(
    (
      id: string,
      phase: 'mount' | 'update',
      actualDuration: number
    ) => {
      if (!isTracking) return

      const event: RenderEvent = {
        component: id,
        phase,
        actualDuration,
        timestamp: Date.now(),
      }
      metricsRef.current = [...metricsRef.current, event]
      window.__RENDER_EVENTS__ = metricsRef.current

      if (phase === 'mount' || metricsRef.current.length % 5 === 0) {
        setMetrics([...metricsRef.current])
      }
    },
    [isTracking]
  )

  const handleStartTracking = () => {
    metricsRef.current = []
    setMetrics([])
    setIsTracking(true)
  }

  const handleStopTracking = () => {
    setIsTracking(false)
    setMetrics([...metricsRef.current])
  }

  const handleClear = () => {
    metricsRef.current = []
    setMetrics([])
    window.__RENDER_EVENTS__ = []
  }

  // Expose render events for E2E tests
  useEffect(() => {
    window.__RENDER_EVENTS__ = metrics
  }, [metrics])

  const handleSubmit = (values: Record<string, unknown>) => {
    console.log('Form submitted:', values)
  }

  // Статистика - мемоизированные вычисления
  const stats = useMemo(() => {
    const mountEvents = metrics.filter(m => m.phase === 'mount')
    const updateEvents = metrics.filter(m => m.phase === 'update')
    const totalRenders = metrics.length
    const avgUpdateTime = updateEvents.length
      ? updateEvents.reduce((sum, m) => sum + m.actualDuration, 0) / updateEvents.length
      : 0
    return { mountEvents, updateEvents, totalRenders, avgUpdateTime }
  }, [metrics])

  const { mountEvents, updateEvents, totalRenders, avgUpdateTime } = stats

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Форма заказа (Performance Test)</Title>
      <Text type="secondary">
        50 полей, 7 групп. Включает все типы условий: visibility, validation, disabled, cross-field.
      </Text>

      <Row gutter={24} style={{ marginTop: 24 }}>
        {/* Метрики */}
        <Col span={6}>
          <Card title="Метрики рендеров" size="small">
            <Space style={{ marginBottom: 16 }}>
              {!isTracking ? (
                <Button type="primary" size="small" onClick={handleStartTracking}>
                  Начать запись
                </Button>
              ) : (
                <Button danger size="small" onClick={handleStopTracking}>
                  Остановить
                </Button>
              )}
              <Button size="small" onClick={handleClear} disabled={metrics.length === 0}>
                Очистить
              </Button>
            </Space>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic title="Total Renders" value={totalRenders} />
              </Col>
              <Col span={12}>
                <Statistic title="Mounts" value={mountEvents.length} />
              </Col>
              <Col span={12}>
                <Statistic title="Updates" value={updateEvents.length} />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Avg Update"
                  value={avgUpdateTime.toFixed(2)}
                  suffix="ms"
                />
              </Col>
            </Row>

            <Divider style={{ margin: '16px 0' }} />

            <div style={{ maxHeight: 300, overflow: 'auto' }}>
              <Text strong>Последние события:</Text>
              {metrics.slice(-20).reverse().map((m, i) => (
                <div key={i} style={{ fontSize: 11, marginTop: 4 }}>
                  <Text code>{m.phase}</Text>{' '}
                  <Text type="secondary">{m.actualDuration.toFixed(2)}ms</Text>
                </div>
              ))}
              {metrics.length === 0 && (
                <Text type="secondary" style={{ fontSize: 12 }}>Нет данных</Text>
              )}
            </div>
          </Card>
        </Col>

        {/* Форма */}
        <Col span={18}>
          <Card title="Форма заказа" size="small">
            <Profiler id="OrderForm" onRender={handleProfilerRender}>
              <FormGenerator
                config={configWithButtons}
                onSubmit={handleSubmit}
              />
            </Profiler>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
