import { app } from 'electron'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'
import type { PracticeRecord, FeedbackResult } from '../shared/types'

function getRecordsPath(): string {
  return join(app.getPath('userData'), 'records.json')
}

export function getRecords(): PracticeRecord[] {
  const recordsPath = getRecordsPath()
  if (!existsSync(recordsPath)) {
    return []
  }
  try {
    const raw = readFileSync(recordsPath, 'utf-8')
    return JSON.parse(raw) as PracticeRecord[]
  } catch {
    return []
  }
}

export function addRecord(data: {
  chineseText: string
  userTranslation: string
  context: string
  feedback: FeedbackResult
  score: number
}): PracticeRecord {
  const records = getRecords()
  const newRecord: PracticeRecord = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...data
  }
  records.unshift(newRecord)
  writeFileSync(getRecordsPath(), JSON.stringify(records, null, 2), 'utf-8')
  return newRecord
}
