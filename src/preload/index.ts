import { contextBridge, ipcRenderer } from 'electron'
import type { AppConfig, Context, FeedbackResult, FollowUpPayload, PracticeRecord, TranslatePayload } from '../shared/types'

const api = {
  // Config
  getConfig: (): Promise<AppConfig> => ipcRenderer.invoke('config:get'),
  saveConfig: (partial: Partial<AppConfig>): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('config:save', partial),

  // Contexts
  getContexts: (): Promise<Context[]> => ipcRenderer.invoke('contexts:get'),
  getContextUsage: (): Promise<Record<string, number>> => ipcRenderer.invoke('contexts:get-usage'),
  addContext: (name: string): Promise<Context> => ipcRenderer.invoke('contexts:add', { name }),
  deleteContext: (id: string): Promise<{ success: boolean }> =>
    ipcRenderer.invoke('contexts:delete', { id }),

  // Records
  getAllRecords: (): Promise<PracticeRecord[]> => ipcRenderer.invoke('records:get-all'),
  addRecord: (
    data: Omit<PracticeRecord, 'id' | 'createdAt'>
  ): Promise<PracticeRecord> => ipcRenderer.invoke('records:add', data),

  // LLM
  translate: (payload: TranslatePayload): Promise<FeedbackResult | { error: string }> =>
    ipcRenderer.invoke('llm:translate', payload),
  followUp: (payload: FollowUpPayload): Promise<{ answer: string } | { error: string }> =>
    ipcRenderer.invoke('llm:follow-up', payload),

  // Window
  toggleWindow: (): Promise<{ isExpanded: boolean }> => ipcRenderer.invoke('window:toggle'),
  setWindowHeight: (height: number): Promise<void> =>
    ipcRenderer.invoke('window:set-height', { height }),
  getWindowState: (): Promise<{ isExpanded: boolean }> => ipcRenderer.invoke('window:get-state'),
  moveWindowBy: (dx: number, dy: number): void =>
    ipcRenderer.send('window:move-by', { dx, dy }),
  onWindowStateChanged: (cb: (data: { isExpanded: boolean }) => void): void => {
    ipcRenderer.on('window:state-changed', (_event, data) => cb(data))
  },
  removeWindowStateListeners: (): void => {
    ipcRenderer.removeAllListeners('window:state-changed')
  },

  // App
  quitApp: (): Promise<void> => ipcRenderer.invoke('app:quit')
}

contextBridge.exposeInMainWorld('api', api)
