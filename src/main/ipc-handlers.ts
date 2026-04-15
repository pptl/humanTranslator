import { ipcMain } from 'electron'
import { getConfig, setConfig } from './config-store'
import { getContexts, addContext, deleteContext } from './context-store'
import { getRecords, addRecord } from './records-store'
import { callLLM } from './llm-service'
import type { TranslatePayload } from '../shared/types'

export function registerIpcHandlers(): void {
  // Config
  ipcMain.handle('config:get', () => {
    return getConfig()
  })

  ipcMain.handle('config:save', (_event, partial) => {
    try {
      setConfig(partial)
      return { success: true }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })

  // Contexts
  ipcMain.handle('contexts:get', () => {
    return getContexts()
  })

  ipcMain.handle('contexts:add', (_event, { name }: { name: string }) => {
    return addContext(name)
  })

  ipcMain.handle('contexts:delete', (_event, { id }: { id: string }) => {
    try {
      deleteContext(id)
      return { success: true }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })

  // Records
  ipcMain.handle('records:get-all', () => {
    return getRecords()
  })

  ipcMain.handle('records:add', (_event, data) => {
    return addRecord(data)
  })

  // LLM
  ipcMain.handle('llm:translate', async (_event, payload: TranslatePayload) => {
    try {
      const config = getConfig()
      const feedback = await callLLM(
        payload.chineseText,
        payload.userTranslation,
        payload.context,
        config
      )
      return feedback
    } catch (e) {
      return { error: e instanceof Error ? e.message : '發生未知錯誤，請重試' }
    }
  })
}
