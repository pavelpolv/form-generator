import { Page, expect } from '@playwright/test'
import { RenderTracker, TestMetrics, AllTestResults, TestRun, GroupSummary, createEmptyResults, addTestResult } from './RenderTracker'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const RESULTS_FILE = path.join(__dirname, '../../metrics/results.json')

// Current run ID (set once per test session)
let currentRunId: string | null = null

function getGitInfo(): { hash: string; message: string } {
  try {
    const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()
    const message = execSync('git log -1 --pretty=%s', { encoding: 'utf-8' }).trim()
    return { hash, message }
  } catch {
    return { hash: 'unknown', message: 'No git info' }
  }
}

function generateRunId(): string {
  return `run-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
}

export async function setupOrderFormPage(page: Page): Promise<void> {
  await page.goto('/order-form')
  await page.waitForSelector('.ant-card', { timeout: 10000 })
}

export async function startTrackingOnPage(page: Page): Promise<void> {
  // Find the start button directly
  const startButton = page.locator('button:has-text("Начать запись")')

  if (await startButton.count() > 0 && await startButton.isVisible()) {
    await startButton.click()
    // Wait for React state to update and button to change to "Остановить"
    await page.waitForSelector('button:has-text("Остановить")', { timeout: 2000 })
  }
}

export async function stopTrackingOnPage(page: Page): Promise<void> {
  const stopButton = page.locator('button:has-text("Остановить")')
  if (await stopButton.isVisible()) {
    await stopButton.click()
    await page.waitForTimeout(100)
  }
}

export async function clearTrackingOnPage(page: Page): Promise<void> {
  // Find the clear button in metrics panel (first "Очистить" button on page)
  // The second one is in the form for resetting form values
  const clearButtons = page.locator('button:has-text("Очистить")')
  const firstClearButton = clearButtons.first()

  if (await firstClearButton.count() > 0 && await firstClearButton.isEnabled()) {
    await firstClearButton.click()
    await page.waitForTimeout(100)
  }
}

export async function getMetricsFromPage(page: Page): Promise<{
  totalRenders: number
  mounts: number
  updates: number
  avgUpdate: number
}> {
  // Read directly from window.__RENDER_EVENTS__ for accurate metrics
  // (DOM statistics only update every 5 events)
  return page.evaluate(() => {
    interface RenderEvent {
      component: string
      phase: 'mount' | 'update'
      actualDuration: number
      timestamp: number
    }
    const events = (window as { __RENDER_EVENTS__?: RenderEvent[] }).__RENDER_EVENTS__ || []
    const mounts = events.filter(e => e.phase === 'mount')
    const updates = events.filter(e => e.phase === 'update')
    const avgUpdate = updates.length > 0
      ? updates.reduce((sum, e) => sum + e.actualDuration, 0) / updates.length
      : 0

    return {
      totalRenders: events.length,
      mounts: mounts.length,
      updates: updates.length,
      avgUpdate: avgUpdate,
    }
  })
}

export async function getRenderEventsFromPage(page: Page): Promise<Array<{
  component: string
  phase: 'mount' | 'update'
  actualDuration: number
  timestamp: number
}>> {
  return page.evaluate(() => {
    return (window as { __RENDER_EVENTS__?: unknown[] }).__RENDER_EVENTS__ || []
  }) as Promise<Array<{
    component: string
    phase: 'mount' | 'update'
    actualDuration: number
    timestamp: number
  }>>
}

export function loadResults(): AllTestResults {
  try {
    if (fs.existsSync(RESULTS_FILE)) {
      const content = fs.readFileSync(RESULTS_FILE, 'utf-8')
      const data = JSON.parse(content)
      // Ensure all required fields exist
      if (!data.runs) {
        data.runs = []
      }
      if (!data.testGroups) {
        data.testGroups = {}
      }
      if (!data.summary) {
        data.summary = {
          totalTests: 0,
          totalRenders: 0,
          avgRenderTime: 0,
        }
      }
      if (!data.environment) {
        data.environment = {
          browser: 'chromium',
          platform: process.platform,
        }
      }
      if (!data.runTimestamp) {
        data.runTimestamp = new Date().toISOString()
      }
      return data
    }
  } catch {
    // File doesn't exist or is invalid, create new
  }
  return createEmptyResults()
}

export function saveResults(results: AllTestResults): void {
  const dir = path.dirname(RESULTS_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2))
}

function getCurrentRun(results: AllTestResults): TestRun {
  // Initialize run ID if not set
  if (!currentRunId) {
    currentRunId = generateRunId()
  }

  // Find existing run or create new one
  let run = results.runs.find(r => r.runId === currentRunId)

  if (!run) {
    const gitInfo = getGitInfo()
    run = {
      runId: currentRunId,
      timestamp: new Date().toISOString(),
      commitHash: gitInfo.hash,
      commitMessage: gitInfo.message,
      environment: {
        browser: 'chromium',
        platform: process.platform,
      },
      groupSummaries: {},
      tests: [],
    }
    results.runs.push(run)

    // Keep only last 50 runs
    if (results.runs.length > 50) {
      results.runs = results.runs.slice(-50)
    }
  }

  return run
}

function updateGroupSummaries(run: TestRun): void {
  const groups: Record<string, TestMetrics[]> = {}

  for (const test of run.tests) {
    if (!groups[test.testGroup]) {
      groups[test.testGroup] = []
    }
    groups[test.testGroup].push(test)
  }

  run.groupSummaries = {}
  for (const [groupName, tests] of Object.entries(groups)) {
    const summary: GroupSummary = {
      renders: tests.reduce((sum, t) => sum + t.renders.total, 0),
      mounts: tests.reduce((sum, t) => sum + t.renders.mounts, 0),
      updates: tests.reduce((sum, t) => sum + t.renders.updates, 0),
      avgTime: tests.length > 0
        ? tests.reduce((sum, t) => sum + t.timing.avgRenderTime, 0) / tests.length
        : 0,
    }
    run.groupSummaries[groupName] = summary
  }
}

export function saveTestMetrics(testGroup: string, testName: string, metrics: {
  totalRenders: number
  mounts: number
  updates: number
  avgUpdate: number
  events?: Array<{
    component: string
    phase: 'mount' | 'update'
    actualDuration: number
    timestamp: number
  }>
}): void {
  const results = loadResults()

  const testMetrics: TestMetrics = {
    testName,
    testGroup,
    timestamp: new Date().toISOString(),
    renders: {
      total: metrics.totalRenders,
      mounts: metrics.mounts,
      updates: metrics.updates,
    },
    timing: {
      avgRenderTime: metrics.avgUpdate,
      maxRenderTime: metrics.events?.length
        ? Math.max(...metrics.events.map(e => e.actualDuration))
        : 0,
      totalRenderTime: metrics.events?.reduce((sum, e) => sum + e.actualDuration, 0) || 0,
    },
    events: metrics.events || [],
  }

  // Add to current run
  const run = getCurrentRun(results)
  run.tests.push(testMetrics)
  updateGroupSummaries(run)

  // Also update legacy format for backwards compatibility
  addTestResult(results, testMetrics)

  saveResults(results)
}

export async function fillInput(page: Page, fieldName: string, value: string): Promise<void> {
  const input = page.locator(`input[id="${fieldName}"], input[name="${fieldName}"]`).first()
  await input.fill(value)
}

export async function selectOption(page: Page, fieldName: string, value: string): Promise<void> {
  const select = page.locator(`[id="${fieldName}"]`).first()
  await select.click()
  await page.locator(`.ant-select-item[title="${value}"]`).click()
}

export async function checkCheckbox(page: Page, fieldName: string): Promise<void> {
  const checkbox = page.locator(`input[id="${fieldName}"][type="checkbox"]`).first()
  await checkbox.check()
}

export async function blurField(page: Page, fieldName: string): Promise<void> {
  const input = page.locator(`input[id="${fieldName}"], input[name="${fieldName}"]`).first()
  await input.blur()
}

// Reset run ID (call this at the start of a new test session if needed)
export function resetRunId(): void {
  currentRunId = null
}
