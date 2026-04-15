import { app } from 'electron'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'
import type { Context } from '../shared/types'

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
