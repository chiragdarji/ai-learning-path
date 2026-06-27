import { useRef, useState } from 'react'

interface ProgressActionsProps {
  count: number
  onExport: () => void
  onImport: (file: File, merge: boolean) => Promise<number>
  onReset: () => void
}

export function ProgressActions({
  count,
  onExport,
  onImport,
  onReset,
}: ProgressActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importMessage, setImportMessage] = useState<string | null>(null)

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const imported = await onImport(file, true)
      setImportMessage(`Merged ${imported} resource${imported === 1 ? '' : 's'}`)
      setTimeout(() => setImportMessage(null), 4000)
    } catch {
      setImportMessage('Invalid progress file')
      setTimeout(() => setImportMessage(null), 4000)
    }

    e.target.value = ''
  }

  return (
    <div className="progress-actions">
      <button type="button" className="action-btn" onClick={onExport}>
        Export
      </button>
      <button type="button" className="action-btn" onClick={handleImportClick}>
        Import
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleFileChange}
      />
      {count > 0 && (
        <button type="button" className="reset-btn" onClick={onReset}>
          Reset
        </button>
      )}
      {importMessage && (
        <span className="import-message" role="status">
          {importMessage}
        </span>
      )}
    </div>
  )
}
