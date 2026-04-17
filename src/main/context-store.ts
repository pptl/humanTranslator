import { app } from 'electron'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'
import type { Context } from '../shared/types'

const DEFAULT_CONTEXT_NAMES = ['正式', '朋友', '書面']

function getUsagePath(): string {
  return join(app.getPath('userData'), 'context-usage.json')
}

function getUsage(): Record<string, number> {
  const usagePath = getUsagePath()
  if (!existsSync(usagePath)) return {}
  try {
    return JSON.parse(readFileSync(usagePath, 'utf-8'))
  } catch {
    return {}
  }
}

export function getContextUsage(): Record<string, number> {
  return getUsage()
}

export function incrementContextUsage(name: string): void {
  const usage = getUsage()
  usage[name] = (usage[name] ?? 0) + 1
  writeFileSync(getUsagePath(), JSON.stringify(usage, null, 2), 'utf-8')
}

export function getTopContexts(n: number): string[] {
  const usage = getUsage()
  const contexts = getContexts()
  const sorted = [...contexts].sort((a, b) => (usage[b.name] ?? 0) - (usage[a.name] ?? 0))
  const result = sorted.slice(0, n).map((c) => c.name)
  // Pad with defaults if not enough contexts
  for (const name of DEFAULT_CONTEXT_NAMES) {
    if (result.length >= n) break
    if (!result.includes(name)) result.push(name)
  }
  return result.slice(0, n)
}

const DEFAULT_CONTEXTS: Context[] = [
  { id: randomUUID(), name: '正式' },
  { id: randomUUID(), name: '朋友' },
  { id: randomUUID(), name: '書面' }
]

function getContextsPath(): string {
  return join(app.getPath('userData'), 'contexts.json')
}

export function getContexts(): Context[] {
  const contextsPath = getContextsPath()
  if (!existsSync(contextsPath)) {
    writeFileSync(contextsPath, JSON.stringify(DEFAULT_CONTEXTS, null, 2), 'utf-8')
    return DEFAULT_CONTEXTS
  }
  try {
    const raw = readFileSync(contextsPath, 'utf-8')
    return JSON.parse(raw) as Context[]
  } catch {
    return DEFAULT_CONTEXTS
  }
}

export function addContext(name: string): Context {
  const contexts = getContexts()
  const newContext: Context = { id: randomUUID(), name: name.trim() }
  contexts.push(newContext)
  writeFileSync(getContextsPath(), JSON.stringify(contexts, null, 2), 'utf-8')
  return newContext
}

export function deleteContext(id: string): void {
  const contexts = getContexts().filter((c) => c.id !== id)
  writeFileSync(getContextsPath(), JSON.stringify(contexts, null, 2), 'utf-8')
}
