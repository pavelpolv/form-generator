import { useState, useEffect, useMemo } from 'react'
import { Card, Button, Space, Tag, Typography, Statistic, Row, Col, Alert, Spin, Select } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const { Text } = Typography

interface GroupSummary {
  renders: number
  mounts: number
  updates: number
  avgTime: number
}

interface TestRun {
  runId: string
  timestamp: string
  commitHash: string
  commitMessage: string
  environment: {
    browser: string
    platform: string
  }
  groupSummaries: Record<string, GroupSummary>
  tests: Array<{
    testName: string
    testGroup: string
    timestamp: string
    renders: { total: number; mounts: number; updates: number }
    timing: { avgRenderTime: number; maxRenderTime: number; totalRenderTime: number }
  }>
}

interface AllTestResults {
  runs: TestRun[]
}

interface ChartDataPoint {
  commit: string
  commitFull: string
  timestamp: string
  [group: string]: string | number
}

const COLORS = [
  '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
  '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb',
]

// Custom tooltip component - must return React element
const renderCustomTooltip = (props: any) => {
  const { active, payload } = props

  if (!active || !payload || payload.length === 0) {
    return null
  }

  const point = payload[0]?.payload as ChartDataPoint

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #d9d9d9',
      borderRadius: 4,
      padding: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      maxWidth: 350,
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 13 }}>
        {point?.commitFull}
      </div>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>
        {point?.timestamp && new Date(point.timestamp).toLocaleString('ru-RU')}
      </div>
      <div style={{ borderTop: '1px solid #eee', paddingTop: 8 }}>
        {payload.map((entry: any, index: number) => {
          const groupName = entry.dataKey as string
          const renders = point?.[`${groupName}_renders`] ?? 0
          const mounts = point?.[`${groupName}_mounts`] ?? 0
          const updates = point?.[`${groupName}_updates`] ?? 0
          const avgTime = point?.[`${groupName}_avgTime`] ?? 0

          return (
            <div key={index} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: entry.color,
                  display: 'inline-block',
                }} />
                <span style={{ fontWeight: 'bold', fontSize: 12 }}>
                  {groupName}
                </span>
                <span style={{ marginLeft: 'auto', fontWeight: 'bold' }}>
                  {entry.value}
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#666', marginLeft: 18 }}>
                Renders: {renders} | Mounts: {mounts} | Updates: {updates}
              </div>
              <div style={{ fontSize: 11, color: '#888', marginLeft: 18 }}>
                Avg Time: {Number(avgTime).toFixed(1)} ms
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function MetricsHistory() {
  const [data, setData] = useState<AllTestResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])

  const loadMetrics = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/metrics')
      if (!response.ok) {
        throw new Error('Failed to load metrics')
      }
      const json = await response.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMetrics()
  }, [])

  // Extract all unique group names
  const allGroups = useMemo(() => {
    if (!data?.runs) return []
    const groups = new Set<string>()
    for (const run of data.runs) {
      for (const group of Object.keys(run.groupSummaries || {})) {
        groups.add(group)
      }
    }
    return Array.from(groups).sort()
  }, [data])

  // Set all groups as selected by default
  useEffect(() => {
    if (allGroups.length > 0 && selectedGroups.length === 0) {
      setSelectedGroups(allGroups)
    }
  }, [allGroups, selectedGroups.length])

  // Transform data for recharts
  const chartData = useMemo((): ChartDataPoint[] => {
    if (!data?.runs) return []

    // Sort runs by timestamp
    const sortedRuns = [...data.runs].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    return sortedRuns.map(run => {
      const point: ChartDataPoint = {
        commit: run.commitHash,
        commitFull: `${run.commitHash}: ${run.commitMessage}`,
        timestamp: run.timestamp,
      }

      for (const [groupName, summary] of Object.entries(run.groupSummaries || {})) {
        if (selectedGroups.includes(groupName)) {
          const total = summary.renders + summary.mounts + summary.updates
          point[groupName] = total
          point[`${groupName}_renders`] = summary.renders
          point[`${groupName}_mounts`] = summary.mounts
          point[`${groupName}_updates`] = summary.updates
          point[`${groupName}_avgTime`] = summary.avgTime
        }
      }

      return point
    })
  }, [data, selectedGroups])

  // Summary stats
  const stats = useMemo(() => {
    if (!data?.runs || data.runs.length === 0) {
      return { totalRuns: 0, latestCommit: '', avgTotal: 0 }
    }

    const latestRun = data.runs[data.runs.length - 1]
    const allTotals = data.runs.map(run =>
      Object.values(run.groupSummaries || {}).reduce(
        (sum, s) => sum + s.renders + s.mounts + s.updates,
        0
      )
    )
    const avgTotal = allTotals.length > 0
      ? allTotals.reduce((a, b) => a + b, 0) / allTotals.length
      : 0

    return {
      totalRuns: data.runs.length,
      latestCommit: `${latestRun.commitHash}: ${latestRun.commitMessage}`,
      avgTotal: Math.round(avgTotal),
    }
  }, [data])

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Загрузка метрик...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="Ошибка загрузки метрик"
          description={
            <Space direction="vertical">
              <Text>{error}</Text>
              <Text type="secondary">
                Запустите e2e тесты: <code>npm run test:e2e</code>
              </Text>
            </Space>
          }
          type="warning"
          showIcon
          action={
            <Button onClick={loadMetrics} icon={<ReloadOutlined />}>
              Повторить
            </Button>
          }
        />
      </div>
    )
  }

  const hasRuns = data?.runs && data.runs.length > 0

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Прогонов" value={stats.totalRuns} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Групп тестов" value={allGroups.length} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Avg Total (R+M+U)"
              value={stats.avgTotal}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ height: '100%' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Последний коммит</Text>
            <div style={{ marginTop: 4 }}>
              <Text ellipsis style={{ fontSize: 12 }}>{stats.latestCommit || '—'}</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title="История метрик по коммитам"
        extra={
          <Space>
            <Select
              mode="multiple"
              placeholder="Выберите группы"
              value={selectedGroups}
              onChange={setSelectedGroups}
              style={{ minWidth: 300 }}
              maxTagCount={2}
              options={allGroups.map(g => ({ label: g, value: g }))}
            />
            <Button onClick={loadMetrics} icon={<ReloadOutlined />} size="small">
              Обновить
            </Button>
          </Space>
        }
      >
        {!hasRuns ? (
          <Alert
            message="Нет данных"
            description={
              <Space direction="vertical">
                <Text>Запустите e2e тесты для сбора метрик:</Text>
                <code>npm run test:e2e</code>
              </Space>
            }
            type="info"
            showIcon
          />
        ) : chartData.length === 0 ? (
          <Alert
            message="Выберите группы для отображения"
            type="info"
            showIcon
          />
        ) : (
          <div style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="commit"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  label={{ value: 'Renders + Mounts + Updates', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={renderCustomTooltip} />
                <Legend />
                {selectedGroups.map((group, index) => (
                  <Line
                    key={group}
                    type="monotone"
                    dataKey={group}
                    name={group}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {hasRuns && (
        <Card title="Последние прогоны" style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {[...data!.runs].reverse().slice(0, 10).map(run => (
              <Card key={run.runId} size="small" style={{ background: '#fafafa' }}>
                <Row gutter={16} align="middle">
                  <Col span={4}>
                    <Tag color="blue">{run.commitHash}</Tag>
                  </Col>
                  <Col span={8}>
                    <Text ellipsis>{run.commitMessage}</Text>
                  </Col>
                  <Col span={4}>
                    <Text type="secondary">
                      {new Date(run.timestamp).toLocaleString('ru-RU')}
                    </Text>
                  </Col>
                  <Col span={8}>
                    <Space wrap>
                      {Object.entries(run.groupSummaries || {}).slice(0, 4).map(([group, summary]) => (
                        <Tag key={group}>
                          {group}: {summary.renders + summary.mounts + summary.updates}
                        </Tag>
                      ))}
                      {Object.keys(run.groupSummaries || {}).length > 4 && (
                        <Tag>+{Object.keys(run.groupSummaries).length - 4}</Tag>
                      )}
                    </Space>
                  </Col>
                </Row>
              </Card>
            ))}
          </Space>
        </Card>
      )}
    </div>
  )
}
