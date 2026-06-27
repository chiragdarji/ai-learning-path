export interface ProgressExport {
  version: 1
  exportedAt: string
  completed: string[]
}

export function buildProgressExport(completed: Set<string>): ProgressExport {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    completed: [...completed].sort(),
  }
}

export function downloadProgress(completed: Set<string>) {
  const data = buildProgressExport(completed)
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const date = new Date().toISOString().slice(0, 10)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `ai-learning-path-progress-${date}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function parseProgressFile(text: string): string[] {
  const parsed: unknown = JSON.parse(text)

  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    'version' in parsed &&
    (parsed as ProgressExport).version === 1 &&
    Array.isArray((parsed as ProgressExport).completed)
  ) {
    return (parsed as ProgressExport).completed.filter(
      (id): id is string => typeof id === 'string',
    )
  }

  if (Array.isArray(parsed)) {
    return parsed.filter((id): id is string => typeof id === 'string')
  }

  throw new Error('Invalid progress file format')
}
