import localforage from 'localforage'

export interface MetricsRun {
  id?: number
  timestamp: number
  config: {
    groupCount: number
    fieldsPerGroup: number
    withConditions: boolean
    totalFields: number
  }
  results: {
    mountAvg: number
    updateAvg: number
    updateMax: number
    updateMin: number
    totalRenders: number
    totalUpdates: number
  }
  note?: string
  gitCommit?: string
}

const metricsStore = localforage.createInstance({
  name: 'form-generator-metrics',
  storeName: 'runs',
})

export async function saveMetricsRun(run: MetricsRun): Promise<number> {
  const runs = await getAllMetricsRuns()
  const id = runs.length > 0 ? Math.max(...runs.map(r => r.id || 0)) + 1 : 1
  const runWithId = { ...run, id }
  await metricsStore.setItem(`run-${id}`, runWithId)
  return id
}

export async function getAllMetricsRuns(): Promise<MetricsRun[]> {
  const runs: MetricsRun[] = []
  await metricsStore.iterate<MetricsRun, void>((value) => {
    runs.push(value)
  })
  return runs.sort((a, b) => b.timestamp - a.timestamp)
}

export async function deleteMetricsRun(id: number): Promise<void> {
  await metricsStore.removeItem(`run-${id}`)
}

export async function clearAllMetricsRuns(): Promise<void> {
  await metricsStore.clear()
}

export async function updateMetricsRunNote(id: number, note: string): Promise<void> {
  const run = await metricsStore.getItem<MetricsRun>(`run-${id}`)
  if (run) {
    run.note = note
    await metricsStore.setItem(`run-${id}`, run)
  }
}
