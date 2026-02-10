import { Page } from '@playwright/test'

export interface RenderEvent {
  component: string
  phase: 'mount' | 'update'
  actualDuration: number
  timestamp: number
}

export interface TestMetrics {
  testName: string
  testGroup: string
  timestamp: string
  renders: {
    total: number
    mounts: number
    updates: number
  }
  timing: {
    avgRenderTime: number
    maxRenderTime: number
    totalRenderTime: number
  }
  events: RenderEvent[]
}

export class RenderTracker {
  private page: Page
  private testName: string
  private testGroup: string

  constructor(page: Page, testGroup: string, testName: string) {
    this.page = page
    this.testGroup = testGroup
    this.testName = testName
  }

  async startTracking(): Promise<void> {
    await this.page.evaluate(() => {
      // Click the "Начать запись" button
      const startButton = document.querySelector('button.ant-btn-primary') as HTMLButtonElement
      if (startButton && startButton.textContent?.includes('Начать запись')) {
        startButton.click()
      }
    })
    // Wait a bit for tracking to initialize
    await this.page.waitForTimeout(100)
  }

  async stopTracking(): Promise<void> {
    await this.page.evaluate(() => {
      // Click the "Остановить" button
      const stopButton = document.querySelector('button.ant-btn-dangerous') as HTMLButtonElement
      if (stopButton && stopButton.textContent?.includes('Остановить')) {
        stopButton.click()
      }
    })
    await this.page.waitForTimeout(100)
  }

  async getMetrics(): Promise<TestMetrics> {
    const metricsData = await this.page.evaluate(() => {
      // Get stats from the page
      const statsElements = document.querySelectorAll('.ant-statistic-content-value')
      const values: number[] = []
      statsElements.forEach(el => {
        const val = parseFloat(el.textContent || '0')
        values.push(isNaN(val) ? 0 : val)
      })

      const totalRenders = values[0] || 0
      const mounts = values[1] || 0
      const updates = values[2] || 0
      const avgUpdate = values[3] || 0

      return {
        totalRenders,
        mounts,
        updates,
        avgUpdate,
      }
    })

    const events = await this.collectEvents()

    return {
      testName: this.testName,
      testGroup: this.testGroup,
      timestamp: new Date().toISOString(),
      renders: {
        total: metricsData.totalRenders,
        mounts: metricsData.mounts,
        updates: metricsData.updates,
      },
      timing: {
        avgRenderTime: metricsData.avgUpdate,
        maxRenderTime: events.length > 0 ? Math.max(...events.map(e => e.actualDuration)) : 0,
        totalRenderTime: events.reduce((sum, e) => sum + e.actualDuration, 0),
      },
      events,
    }
  }

  private async collectEvents(): Promise<RenderEvent[]> {
    return this.page.evaluate(() => {
      // Try to get events from window if exposed
      const win = window as unknown as { __RENDER_EVENTS__?: RenderEvent[] }
      return win.__RENDER_EVENTS__ || []
    })
  }

  async clearMetrics(): Promise<void> {
    await this.page.evaluate(() => {
      const clearButton = Array.from(document.querySelectorAll('button')).find(
        btn => btn.textContent?.includes('Очистить')
      ) as HTMLButtonElement
      if (clearButton && !clearButton.disabled) {
        clearButton.click()
      }
    })
    await this.page.waitForTimeout(100)
  }
}

export interface GroupSummary {
  renders: number
  mounts: number
  updates: number
  avgTime: number
}

export interface TestRun {
  runId: string
  timestamp: string
  commitHash: string
  commitMessage: string
  environment: {
    browser: string
    platform: string
  }
  groupSummaries: Record<string, GroupSummary>
  tests: TestMetrics[]
}

export interface AllTestResults {
  runs: TestRun[]
  // Legacy fields for backwards compatibility
  runTimestamp: string
  environment: {
    browser: string
    platform: string
  }
  summary: {
    totalTests: number
    totalRenders: number
    avgRenderTime: number
  }
  testGroups: Record<string, TestMetrics[]>
}

export function createEmptyResults(): AllTestResults {
  return {
    runs: [],
    runTimestamp: new Date().toISOString(),
    environment: {
      browser: 'chromium',
      platform: process.platform,
    },
    summary: {
      totalTests: 0,
      totalRenders: 0,
      avgRenderTime: 0,
    },
    testGroups: {},
  }
}

export function addTestResult(results: AllTestResults, metrics: TestMetrics): void {
  if (!results.testGroups[metrics.testGroup]) {
    results.testGroups[metrics.testGroup] = []
  }
  results.testGroups[metrics.testGroup].push(metrics)

  // Update summary
  results.summary.totalTests++
  results.summary.totalRenders += metrics.renders.total

  const allTimes = Object.values(results.testGroups)
    .flat()
    .map(m => m.timing.avgRenderTime)
    .filter(t => t > 0)

  results.summary.avgRenderTime = allTimes.length > 0
    ? allTimes.reduce((a, b) => a + b, 0) / allTimes.length
    : 0
}
