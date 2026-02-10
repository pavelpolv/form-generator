import React, { Profiler, useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { Typography, Card, Space, Button, InputNumber, Switch, Statistic, Row, Col, Divider } from 'antd'
import { FormGenerator } from '@form-generator/core'
import type { FormConfig, GroupField, Field, ConditionGroup } from '@form-generator/core'
import { saveMetricsRun } from '@/db/metricsDb'

const { Text } = Typography

interface WdyrLog {
  component: string
  reason: string
  prevProps?: string
  nextProps?: string
  timestamp: number
}

function useWdyrLogs() {
  const [logs, setLogs] = useState<WdyrLog[]>([])
  const logsRef = useRef<WdyrLog[]>([])

  useEffect(() => {
    const originalGroup = console.group
    const originalGroupCollapsed = console.groupCollapsed
    const originalLog = console.log
    const originalGroupEnd = console.groupEnd

    let currentComponent = ''
    let currentReason = ''
    let prevProps = ''
    let nextProps = ''

    console.group = (...args: unknown[]) => {
      const msg = String(args[0] || '')
      if (msg.includes('re-rendered')) {
        currentComponent = msg.replace(/%c/g, '').trim()
      }
      originalGroup.apply(console, args as [])
    }

    console.groupCollapsed = (...args: unknown[]) => {
      const msg = String(args[0] || '')
      if (msg.includes('re-rendered')) {
        currentComponent = msg.replace(/%c/g, '').trim()
      }
      originalGroupCollapsed.apply(console, args as [])
    }

    console.log = (...args: unknown[]) => {
      const msg = String(args[0] || '')
      if (msg.includes('reason')) {
        currentReason = msg
      } else if (msg.includes('prev')) {
        prevProps = JSON.stringify(args[1]).slice(0, 100)
      } else if (msg.includes('next')) {
        nextProps = JSON.stringify(args[1]).slice(0, 100)
      }
      originalLog.apply(console, args as [])
    }

    console.groupEnd = () => {
      if (currentComponent && currentComponent.includes('re-rendered')) {
        const log: WdyrLog = {
          component: currentComponent.split(' ')[0] || 'Unknown',
          reason: currentReason || 'props changed',
          prevProps,
          nextProps,
          timestamp: Date.now(),
        }
        logsRef.current = [...logsRef.current.slice(-49), log]
        setLogs([...logsRef.current])
        currentComponent = ''
        currentReason = ''
        prevProps = ''
        nextProps = ''
      }
      originalGroupEnd.apply(console)
    }

    return () => {
      console.group = originalGroup
      console.groupCollapsed = originalGroupCollapsed
      console.log = originalLog
      console.groupEnd = originalGroupEnd
    }
  }, [])

  const clearLogs = useCallback(() => {
    logsRef.current = []
    setLogs([])
  }, [])

  return { logs, clearLogs }
}

interface RenderMetric {
  id: string
  phase: 'mount' | 'update'
  actualDuration: number
  baseDuration: number
  startTime: number
  commitTime: number
}

function generateField(index: number, groupIndex: number, withConditions: boolean): Field {
  const name = `field_${groupIndex}_${index}`
  const label = `Поле ${groupIndex}-${index}`

  let visibleCondition: ConditionGroup | undefined
  let disabledCondition: ConditionGroup | undefined

  if (withConditions && index > 0 && index % 3 === 0) {
    visibleCondition = {
      comparisonType: 'and',
      children: [
        { field: `field_${groupIndex}_${index - 1}`, condition: '!∅' },
      ],
    }
  }

  if (withConditions && index % 5 === 0) {
    disabledCondition = {
      comparisonType: 'or',
      children: [
        { field: `field_${groupIndex}_0`, condition: '∅' },
      ],
    }
  }

  const typeIndex = index % 4

  if (typeIndex === 0) {
    return { name, label, type: 'input', visibleCondition, disabledCondition }
  } else if (typeIndex === 1) {
    return { name, label, type: 'inputNumber', min: 0, max: 100, visibleCondition, disabledCondition }
  } else if (typeIndex === 2) {
    return {
      name,
      label,
      type: 'select',
      options: [
        { value: 'opt1', label: 'Опция 1' },
        { value: 'opt2', label: 'Опция 2' },
        { value: 'opt3', label: 'Опция 3' },
      ],
      visibleCondition,
      disabledCondition,
    }
  } else {
    return { name, label, type: 'switch', visibleCondition, disabledCondition }
  }
}

function generateGroup(groupIndex: number, fieldsPerGroup: number, withConditions: boolean): GroupField {
  const fields: Field[] = []
  for (let i = 0; i < fieldsPerGroup; i++) {
    fields.push(generateField(i, groupIndex, withConditions))
  }

  return {
    name: `Группа ${groupIndex + 1}`,
    showTitle: true,
    showBorder: true,
    fields,
  }
}

function generateFormConfig(groupCount: number, fieldsPerGroup: number, withConditions: boolean): FormConfig {
  const groups: GroupField[] = []
  for (let i = 0; i < groupCount; i++) {
    groups.push(generateGroup(i, fieldsPerGroup, withConditions))
  }
  return { groups }
}

export default function StressTest() {
  const [groupCount, setGroupCount] = useState(5)
  const [fieldsPerGroup, setFieldsPerGroup] = useState(10)
  const [withConditions, setWithConditions] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [metrics, setMetrics] = useState<RenderMetric[]>([])
  const metricsRef = useRef<RenderMetric[]>([])
  const { logs: wdyrLogs, clearLogs: clearWdyrLogs } = useWdyrLogs()

  const totalFields = groupCount * fieldsPerGroup

  const config = React.useMemo(
    () => generateFormConfig(groupCount, fieldsPerGroup, withConditions),
    [groupCount, fieldsPerGroup, withConditions]
  )

  const handleProfilerRender = useCallback(
    (
      id: string,
      phase: 'mount' | 'update',
      actualDuration: number,
      baseDuration: number,
      startTime: number,
      commitTime: number
    ) => {
      const metric: RenderMetric = {
        id,
        phase,
        actualDuration,
        baseDuration,
        startTime,
        commitTime,
      }
      metricsRef.current = [...metricsRef.current.slice(-99), metric]

      if (phase === 'mount' || metricsRef.current.length % 10 === 0) {
        setMetrics([...metricsRef.current])
      }
    },
    []
  )

  const handleStart = () => {
    metricsRef.current = []
    setMetrics([])
    setIsRunning(true)
  }

  const handleStop = async () => {
    setIsRunning(false)
    const finalMetrics = [...metricsRef.current]
    setMetrics(finalMetrics)

    // Сохраняем результаты
    const mountMetrics = finalMetrics.filter((m) => m.phase === 'mount')
    const updateMetrics = finalMetrics.filter((m) => m.phase === 'update')

    if (mountMetrics.length > 0 || updateMetrics.length > 0) {
      await saveMetricsRun({
        timestamp: Date.now(),
        config: {
          groupCount,
          fieldsPerGroup,
          withConditions,
          totalFields,
        },
        results: {
          mountAvg: mountMetrics.length
            ? mountMetrics.reduce((sum, m) => sum + m.actualDuration, 0) / mountMetrics.length
            : 0,
          updateAvg: updateMetrics.length
            ? updateMetrics.reduce((sum, m) => sum + m.actualDuration, 0) / updateMetrics.length
            : 0,
          updateMax: updateMetrics.length
            ? Math.max(...updateMetrics.map((m) => m.actualDuration))
            : 0,
          updateMin: updateMetrics.length
            ? Math.min(...updateMetrics.map((m) => m.actualDuration))
            : 0,
          totalRenders: finalMetrics.length,
          totalUpdates: updateMetrics.length,
        },
      })
    }
  }

  const handleClear = () => {
    metricsRef.current = []
    setMetrics([])
  }

  // Memoized statistics calculations
  const stats = useMemo(() => {
    const mountMetrics = metrics.filter((m) => m.phase === 'mount')
    const updateMetrics = metrics.filter((m) => m.phase === 'update')

    const avgMountTime = mountMetrics.length
      ? mountMetrics.reduce((sum, m) => sum + m.actualDuration, 0) / mountMetrics.length
      : 0

    const avgUpdateTime = updateMetrics.length
      ? updateMetrics.reduce((sum, m) => sum + m.actualDuration, 0) / updateMetrics.length
      : 0

    const maxUpdateTime = updateMetrics.length
      ? Math.max(...updateMetrics.map((m) => m.actualDuration))
      : 0

    const minUpdateTime = updateMetrics.length
      ? Math.min(...updateMetrics.map((m) => m.actualDuration))
      : 0

    return { mountMetrics, updateMetrics, avgMountTime, avgUpdateTime, maxUpdateTime, minUpdateTime }
  }, [metrics])

  const { updateMetrics, avgMountTime, avgUpdateTime, maxUpdateTime, minUpdateTime } = stats

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={24}>
        <Col span={8}>
          <Card title="Настройки теста" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>Количество групп:</Text>
                <InputNumber
                  min={1}
                  max={20}
                  value={groupCount}
                  onChange={(v) => v && setGroupCount(v)}
                  style={{ marginLeft: 8, width: 80 }}
                  disabled={isRunning}
                />
              </div>
              <div>
                <Text>Полей в группе:</Text>
                <InputNumber
                  min={1}
                  max={50}
                  value={fieldsPerGroup}
                  onChange={(v) => v && setFieldsPerGroup(v)}
                  style={{ marginLeft: 8, width: 80 }}
                  disabled={isRunning}
                />
              </div>
              <div>
                <Text>Условия (visible/disabled):</Text>
                <Switch
                  checked={withConditions}
                  onChange={setWithConditions}
                  style={{ marginLeft: 8 }}
                  disabled={isRunning}
                />
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <Text strong>Всего полей: {totalFields}</Text>
              <Space>
                {!isRunning ? (
                  <Button type="primary" onClick={handleStart}>
                    Запустить тест
                  </Button>
                ) : (
                  <Button danger onClick={handleStop}>
                    Остановить и сохранить
                  </Button>
                )}
                <Button onClick={handleClear} disabled={metrics.length === 0}>
                  Очистить
                </Button>
              </Space>
            </Space>
          </Card>

          <Card title="Метрики производительности" size="small" style={{ marginTop: 16 }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Mount (avg)"
                  value={avgMountTime.toFixed(2)}
                  suffix="ms"
                  valueStyle={{ color: avgMountTime > 16 ? '#cf1322' : '#3f8600' }}
                />
              </Col>
              <Col span={12}>
                <Statistic title="Renders" value={metrics.length} />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Update (avg)"
                  value={avgUpdateTime.toFixed(2)}
                  suffix="ms"
                  valueStyle={{ color: avgUpdateTime > 16 ? '#cf1322' : '#3f8600' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Update (max)"
                  value={maxUpdateTime.toFixed(2)}
                  suffix="ms"
                  valueStyle={{ color: maxUpdateTime > 16 ? '#cf1322' : '#3f8600' }}
                />
              </Col>
              <Col span={12}>
                <Statistic title="Update (min)" value={minUpdateTime.toFixed(2)} suffix="ms" />
              </Col>
              <Col span={12}>
                <Statistic title="Updates" value={updateMetrics.length} />
              </Col>
            </Row>
            <Divider style={{ margin: '12px 0' }} />
            <Text type="secondary">Цель: &lt;16ms для 60 FPS</Text>
          </Card>

          <Card title="Последние рендеры (Profiler)" size="small" style={{ marginTop: 16, maxHeight: 200, overflow: 'auto' }}>
            {metrics.slice(-20).reverse().map((m, i) => (
              <div key={i} style={{ fontSize: 12, marginBottom: 4 }}>
                <Text code>{m.phase}</Text>{' '}
                <Text style={{ color: m.actualDuration > 16 ? '#cf1322' : '#3f8600' }}>
                  {m.actualDuration.toFixed(2)}ms
                </Text>
              </div>
            ))}
            {metrics.length === 0 && <Text type="secondary">Нет данных</Text>}
          </Card>

          <Card
            title={<Space><span>Why Did You Render</span><Text type="secondary">({wdyrLogs.length})</Text></Space>}
            size="small"
            style={{ marginTop: 16, maxHeight: 250, overflow: 'auto' }}
            extra={<Button size="small" onClick={clearWdyrLogs} disabled={wdyrLogs.length === 0}>Очистить</Button>}
          >
            {wdyrLogs.slice(-30).reverse().map((log, i) => (
              <div key={i} style={{ fontSize: 11, marginBottom: 8, borderBottom: '1px solid #f0f0f0', paddingBottom: 4 }}>
                <div><Text strong style={{ color: '#cf1322' }}>{log.component}</Text></div>
                <div style={{ color: '#666' }}>{log.reason}</div>
              </div>
            ))}
            {wdyrLogs.length === 0 && <Text type="secondary">Нет лишних ре-рендеров</Text>}
          </Card>
        </Col>

        <Col span={16}>
          <Card title={`Форма (${totalFields} полей)`} size="small">
            {isRunning ? (
              <Profiler id="FormGenerator" onRender={handleProfilerRender}>
                <FormGenerator config={config} showSubmitButton={false} showResetButton={false} />
              </Profiler>
            ) : (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <Text type="secondary">Нажмите "Запустить тест" для начала</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
