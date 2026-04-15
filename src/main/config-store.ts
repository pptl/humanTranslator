import { app } from 'electron'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import type { AppConfig } from '../shared/types'

const DEFAULT_CONFIG: AppConfig = {
  claudeApiKey: '',
  openaiApiKey: '',
  selectedProvider: 'claude',
  windowPosition: { x: -1, y: -1 }
}

function getConfigPath(): string {
  return join(app.getPath('userData'), 'config.json')
}

export function getConfig(): AppConfig {
  const configPath = getConfigPath()
  if (!existsSync(configPath)) {
    return { ...DEFAULT_CONFIG }
  }
  try {
    const raw = readFileSync(configPath, 'utf-8')
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

export function setConfig(partial: Partial<AppConfig>): void {
  const current = getConfig()
  const updated = { ...current, ...partial }
  writeFileSync(getConfigPath(), JSON.stringify(updated, null, 2), 'utf-8')
}
