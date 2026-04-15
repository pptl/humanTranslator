import { useState, useEffect } from 'react'
import type { AppConfig } from '../../../shared/types'

const DEFAULT_CONFIG: AppConfig = {
  claudeApiKey: '',
  openaiApiKey: '',
  selectedProvider: 'claude',
  windowPosition: { x: -1, y: -1 }
}

export function useConfig() {
  const [config, setConfigState] = useState<AppConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.api.getConfig().then((c) => {
      setConfigState(c)
      setLoading(false)
    })
  }, [])

  async function saveConfig(partial: Partial<AppConfig>): Promise<boolean> {
    const result = await window.api.saveConfig(partial)
    if (result.success) {
      setConfigState((prev) => ({ ...prev, ...partial }))
    }
    return result.success
  }

  return { config, saveConfig, loading }
}
