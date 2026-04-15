import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import type { AppConfig, FeedbackResult } from '../shared/types'

const SYSTEM_PROMPT = `你是一位專業的英語教師，專門幫助母語為中文的學習者改善英語書寫能力。

你的任務是評估學生的英文翻譯，並提供結構化的回饋。

請嚴格以下面的 JSON 格式回應，不要加任何額外的說明文字、Markdown 標記或代碼塊：

{
  "score": <整數 1-10>,
  "verdict": "<一句話評語，繁體中文，不超過20字>",
  "problem": "<解釋學生版本的具體問題，繁體中文，2-4句>",
  "betterVersion": "<最自然的英文版本>",
  "contextVersions": {
    "formal": "<正式場合的英文版本>",
    "casual": "<朋友對話的英文版本>",
    "written": "<書面寫作的英文版本>"
  },
  "grammarTip": "<相關語法重點，繁體中文，1-2句>"
}

評分標準：
- 9-10：意思準確且完全自然，母語人士會這樣說
- 7-8：意思正確，表達大致自然，有小瑕疵
- 5-6：意思基本正確，但有明顯的中式英語或語法問題
- 3-4：意思部分正確，有較多語法錯誤
- 1-2：意思偏差或嚴重語法錯誤

contextVersions 的三個版本必須真正體現不同風格，不能只改一兩個詞。`

function buildUserMessage(chineseText: string, userTranslation: string, context: string): string {
  return `情景：${context}

原文（中文）：${chineseText}

學生的英文翻譯：${userTranslation}`
}

function extractJson(raw: string): string {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) return fenceMatch[1].trim()
  return raw.trim()
}

function validateFeedback(obj: unknown): FeedbackResult {
  const f = obj as Record<string, unknown>
  if (
    typeof f.score !== 'number' ||
    typeof f.verdict !== 'string' ||
    typeof f.problem !== 'string' ||
    typeof f.betterVersion !== 'string' ||
    typeof f.grammarTip !== 'string' ||
    typeof f.contextVersions !== 'object' ||
    f.contextVersions === null
  ) {
    throw new Error('回應格式不正確')
  }
  const cv = f.contextVersions as Record<string, unknown>
  if (
    typeof cv.formal !== 'string' ||
    typeof cv.casual !== 'string' ||
    typeof cv.written !== 'string'
  ) {
    throw new Error('情景版本格式不正確')
  }
  return {
    score: f.score,
    verdict: f.verdict,
    problem: f.problem,
    betterVersion: f.betterVersion,
    contextVersions: {
      formal: cv.formal,
      casual: cv.casual,
      written: cv.written
    },
    grammarTip: f.grammarTip
  }
}

async function callClaude(
  chineseText: string,
  userTranslation: string,
  context: string,
  apiKey: string
): Promise<FeedbackResult> {
  const client = new Anthropic({ apiKey })
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserMessage(chineseText, userTranslation, context) }]
  })
  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Claude 回應中沒有文字內容')
  }
  const parsed = JSON.parse(extractJson(textBlock.text))
  return validateFeedback(parsed)
}

async function callOpenAI(
  chineseText: string,
  userTranslation: string,
  context: string,
  apiKey: string
): Promise<FeedbackResult> {
  const client = new OpenAI({ apiKey })
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserMessage(chineseText, userTranslation, context) }
    ]
  })
  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('OpenAI 回應為空')
  const parsed = JSON.parse(extractJson(content))
  return validateFeedback(parsed)
}

export async function callLLM(
  chineseText: string,
  userTranslation: string,
  context: string,
  config: AppConfig
): Promise<FeedbackResult> {
  if (config.selectedProvider === 'claude') {
    if (!config.claudeApiKey) throw new Error('尚未設定 Claude API Key')
    return callClaude(chineseText, userTranslation, context, config.claudeApiKey)
  } else {
    if (!config.openaiApiKey) throw new Error('尚未設定 OpenAI API Key')
    return callOpenAI(chineseText, userTranslation, context, config.openaiApiKey)
  }
}
