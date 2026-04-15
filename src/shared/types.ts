export interface AppConfig {
  claudeApiKey: string
  openaiApiKey: string
  selectedProvider: 'claude' | 'openai'
  windowPosition: { x: number; y: number }
}

export interface Context {
  id: string
  name: string
}

export interface FeedbackResult {
  score: number
  verdict: string
  problem: string
  betterVersion: string
  contextVersions: {
    formal: string
    casual: string
    written: string
  }
  grammarTip: string
}

export interface PracticeRecord {
  id: string
  chineseText: string
  userTranslation: string
  context: string
  feedback: FeedbackResult
  score: number
  createdAt: string
}

export type AppView = 'main' | 'review' | 'settings'
export type WindowState = 'collapsed' | 'expanded'

export interface TranslatePayload {
  chineseText: string
  userTranslation: string
  context: string
}

export interface IpcResult<T> {
  data?: T
  error?: string
}
