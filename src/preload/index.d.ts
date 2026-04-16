import type { AppConfig, Context, FeedbackResult, PracticeRecord, TranslatePayload } from '../shared/types'

declare global {
  interface Window {
    api: {
      getConfig: () => Promise<AppConfig>
      saveConfig: (partial: Partial<AppConfig>) => Promise<{ success: boolean; error?: string }>
      getContexts: () => Promise<Context[]>
      addContext: (name: string) => Promise<Context>
      deleteContext: (id: string) => Promise<{ success: boolean }>
      getAllRecords: () => Promise<PracticeRecord[]>
      addRecord: (data: Omit<PracticeRecord, 'id' | 'createdAt'>) => Promise<PracticeRecord>
      translate: (payload: TranslatePayload) => Promise<FeedbackResult | { error: string }>
      toggleWindow: () => Promise<{ isExpanded: boolean }>
      setWindowHeight: (height: number) => Promise<void>
      getWindowState: () => Promise<{ isExpanded: boolean }>
      moveWindowBy: (dx: number, dy: number) => void
      onWindowStateChanged: (cb: (data: { isExpanded: boolean }) => void) => void
      removeWindowStateListeners: () => void
      quitApp: () => Promise<void>
    }
  }
}
