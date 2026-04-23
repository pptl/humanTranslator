import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import type { AppConfig, FeedbackResult, FollowUpPayload } from '../shared/types'

function buildSystemPrompt(topContexts: string[]): string {
  const contextEntries = topContexts
    .map((name) => `    {"name": "${name}", "text": "<針對${name}情景的英文版本>"}`)
    .join(',\n')
  return `你是一位專業的英語教師，專門幫助母語為中文的學習者改善英語書寫能力。

你的任務是評估學生的英文翻譯，並提供結構化的回饋。

請嚴格以下面的 JSON 格式回應，不要加任何額外的說明文字、Markdown 標記或代碼塊：

{
  "score": <整數 1-10>,
  "verdict": "<一句話評語，繁體中文，不超過20字>",
  "problem": "<解釋學生版本的具體問題，繁體中文，2-4句>",
  "betterVersion": "<最自然的英文版本>",
  "contextVersions": [
${contextEntries}
  ],
  "grammarTip": "<相關語法重點，繁體中文，1-2句>"
}

評分標準：
- 9-10：意思準確且完全自然，母語人士會這樣說
- 7-8：意思正確，表達大致自然，有小瑕疵
- 5-6：意思基本正確，但有明顯的中式英語或語法問題
- 3-4：意思部分正確，有較多語法錯誤
- 1-2：意思偏差或嚴重語法錯誤

contextVersions 陣列中每個情景的版本必須真正體現不同風格，不能只改一兩個詞。`
}

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
    !Array.isArray(f.contextVersions)
  ) {
    throw new Error('回應格式不正確')
  }
  const contextVersions = (f.contextVersions as unknown[]).map((item) => {
    const cv = item as Record<string, unknown>
    if (typeof cv.name !== 'string' || typeof cv.text !== 'string') {
      throw new Error('情景版本格式不正確')
    }
    return { name: cv.name, text: cv.text }
  })
  return {
    score: f.score,
    verdict: f.verdict,
    problem: f.problem,
    betterVersion: f.betterVersion,
    contextVersions,
    grammarTip: f.grammarTip
  }
}

async function callClaude(
  chineseText: string,
  userTranslation: string,
  context: string,
  apiKey: string,
  topContexts: string[]
): Promise<FeedbackResult> {
  const client = new Anthropic({ apiKey })
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: buildSystemPrompt(topContexts),
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
  apiKey: string,
  topContexts: string[]
): Promise<FeedbackResult> {
  const client = new OpenAI({ apiKey })
  const response = await client.chat.completions.create({
    model: 'gpt-4.1',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: buildSystemPrompt(topContexts) },
      { role: 'user', content: buildUserMessage(chineseText, userTranslation, context) }
    ]
  })
  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('OpenAI 回應為空')
  const parsed = JSON.parse(extractJson(content))
  return validateFeedback(parsed)
}

function buildFollowUpSystemPrompt(payload: FollowUpPayload): string {
  const { chineseText, userTranslation, context, feedback } = payload
  const versions = feedback.contextVersions.map((v) => `  - ${v.name}：${v.text}`).join('\n')
  return `你是一位專業的英語教師，正在幫助一位中文母語學習者理解你剛剛給出的翻譯批改回饋。

學生的原始練習資料如下：

【情景】${context}
【原文（中文）】${chineseText}
【學生翻譯（英文）】${userTranslation}

【你剛才給出的批改結果】
- 分數：${feedback.score}/10
- 評語：${feedback.verdict}
- 問題說明：${feedback.problem}
- 更好的說法：${feedback.betterVersion}
- 語法重點：${feedback.grammarTip}
- 不同情景版本：
${versions}

請根據以上脈絡，用繁體中文回答學生的追問。
回答要具體、針對這次批改，不超過150字，語氣親切。
不要重複已給出的批改內容，除非學生要求解釋。
直接回答，不要有任何前置語如「好的」或「當然」。`
}

async function callClaudeFollowUp(payload: FollowUpPayload, apiKey: string): Promise<string> {
  const client = new Anthropic({ apiKey })
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: buildFollowUpSystemPrompt(payload),
    messages: [{ role: 'user', content: `學生的追問：${payload.question}` }]
  })
  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') throw new Error('Claude 回應中沒有文字內容')
  return textBlock.text.trim()
}

async function callOpenAIFollowUp(payload: FollowUpPayload, apiKey: string): Promise<string> {
  const client = new OpenAI({ apiKey })
  const response = await client.chat.completions.create({
    model: 'gpt-4.1',
    max_tokens: 512,
    messages: [
      { role: 'system', content: buildFollowUpSystemPrompt(payload) },
      { role: 'user', content: `學生的追問：${payload.question}` }
    ]
  })
  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('OpenAI 回應為空')
  return content.trim()
}

export async function callFollowUp(payload: FollowUpPayload, config: AppConfig): Promise<string> {
  if (!config.apiKey) throw new Error('尚未設定 API Key')
  if (config.selectedProvider === 'claude') {
    return callClaudeFollowUp(payload, config.apiKey)
  } else {
    return callOpenAIFollowUp(payload, config.apiKey)
  }
}

export async function callLLM(
  chineseText: string,
  userTranslation: string,
  context: string,
  config: AppConfig,
  topContexts: string[]
): Promise<FeedbackResult> {
  if (!config.apiKey) throw new Error('尚未設定 API Key')
  if (config.selectedProvider === 'claude') {
    return callClaude(chineseText, userTranslation, context, config.apiKey, topContexts)
  } else {
    return callOpenAI(chineseText, userTranslation, context, config.apiKey, topContexts)
  }
}
