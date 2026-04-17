import { ipcMain, app } from 'electron'
import { getConfig, setConfig } from './config-store'
import { getContexts, addContext, deleteContext, incrementContextUsage, getTopContexts, getContextUsage } from './context-store'
import { getRecords, addRecord } from './records-store'
import { callLLM, callFollowUp } from './llm-service'
import type { TranslatePayload, FollowUpPayload } from '../shared/types'

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

  ipcMain.handle('contexts:get-usage', () => {
    return getContextUsage()
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
    if (data.context) incrementContextUsage(data.context)
    return addRecord(data)
  })

  ipcMain.handle('llm:follow-up', async (_event, payload: FollowUpPayload) => {
    try {
      const config = getConfig()
      const answer = await callFollowUp(payload, config)
      return { answer }
    } catch (e) {
      return { error: e instanceof Error ? e.message : '發生未知錯誤，請重試' }
    }
  })

  // App
  ipcMain.handle('app:quit', () => {
    app.quit()
  })

  // LLM
  ipcMain.handle('llm:translate', async (_event, payload: TranslatePayload) => {
    try {
      const config = getConfig()
      const topContexts = getTopContexts(3)
      const feedback = await callLLM(
        payload.chineseText,
        payload.userTranslation,
        payload.context,
        config,
        topContexts
      )
      return feedback
    } catch (e) {
      return { error: e instanceof Error ? e.message : '發生未知錯誤，請重試' }
    }
  })
}
