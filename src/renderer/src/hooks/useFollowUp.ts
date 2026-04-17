import { useState } from 'react'
import type { FollowUpQA, FollowUpPayload } from '../../../shared/types'

type FollowUpStatus = 'idle' | 'loading' | 'error'

export function useFollowUp() {
  const [qaList, setQaList] = useState<FollowUpQA[]>([])
  const [status, setStatus] = useState<FollowUpStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function ask(payload: FollowUpPayload) {
    setStatus('loading')
    setErrorMsg('')
    try {
      const result = await window.api.followUp(payload)
      if ('error' in result) {
        setErrorMsg(result.error)
        setStatus('error')
      } else {
        setQaList((prev) => [...prev, { question: payload.question, answer: result.answer }])
        setStatus('idle')
      }
    } catch {
      setErrorMsg('發生未知錯誤，請重試')
      setStatus('error')
    }
  }

  function clear() {
    setQaList([])
    setStatus('idle')
    setErrorMsg('')
  }

  return { qaList, status, errorMsg, ask, clear }
}
