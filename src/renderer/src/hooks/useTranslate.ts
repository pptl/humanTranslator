import { useState } from 'react'
import type { FeedbackResult } from '../../../shared/types'

type TranslateStatus = 'idle' | 'loading' | 'result' | 'error'

export function useTranslate() {
  const [status, setStatus] = useState<TranslateStatus>('idle')
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')

  async function submit(chineseText: string, userTranslation: string, context: string) {
    setStatus('loading')
    setErrorMsg('')
    try {
      const result = await window.api.translate({ chineseText, userTranslation, context })
      if ('error' in result) {
        setErrorMsg(result.error)
        setStatus('error')
      } else {
        setFeedback(result)
        setStatus('result')
        // Save record
        window.api.addRecord({
          chineseText,
          userTranslation,
          context,
          feedback: result,
          score: result.score
        })
      }
    } catch (e) {
      setErrorMsg('發生未知錯誤，請重試')
      setStatus('error')
    }
  }

  function reset() {
    setStatus('idle')
    setFeedback(null)
    setErrorMsg('')
  }

  return { status, feedback, errorMsg, submit, reset }
}
