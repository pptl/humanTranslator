import React, { useState } from 'react'
import { useFollowUp } from '../hooks/useFollowUp'
import type { FeedbackResult } from '../../../shared/types'

interface FollowUpPanelProps {
  chineseText: string
  userTranslation: string
  context: string
  feedback: FeedbackResult
}

export function FollowUpPanel({ chineseText, userTranslation, context, feedback }: FollowUpPanelProps) {
  const { qaList, status, errorMsg, ask } = useFollowUp()
  const [input, setInput] = useState('')

  const isLoading = status === 'loading'

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 72)}px`
  }

  async function handleSubmit() {
    const question = input.trim()
    if (!question || isLoading) return
    setInput('')
    await ask({ chineseText, userTranslation, context, feedback, question })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--color-light-border)' }} />
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>追問</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--color-light-border)' }} />
      </div>

      {qaList.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {qaList.map((qa, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <span style={{
                  flexShrink: 0,
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  background: 'var(--color-light-bg)',
                  border: '1px solid var(--color-light-border)',
                  borderRadius: '4px',
                  padding: '1px 5px',
                  lineHeight: 1.6
                }}>Q</span>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{qa.question}</span>
              </div>
              <div style={{
                fontSize: '13px',
                color: 'var(--color-text-dark)',
                lineHeight: 1.6,
                borderLeft: '2px solid var(--color-light-border)',
                paddingLeft: '10px',
                marginLeft: '2px'
              }}>
                {qa.answer}
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoading && (
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>正在思考…</p>
      )}

      {status === 'error' && (
        <div style={{
          background: '#fff5f5',
          border: '1px solid #fed7d7',
          borderRadius: 'var(--border-radius-sm)',
          padding: '8px 10px',
          color: 'var(--color-error)',
          fontSize: '12px'
        }}>
          {errorMsg}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            autoResize(e.target)
          }}
          onKeyDown={handleKeyDown}
          placeholder="對這次批改有任何疑問嗎？"
          rows={1}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '8px 10px',
            border: '1px solid var(--color-light-border)',
            borderRadius: 'var(--border-radius-sm)',
            fontSize: '13px',
            outline: 'none',
            background: 'var(--color-white)',
            color: 'var(--color-text-dark)',
            resize: 'none',
            lineHeight: 1.5,
            display: 'block',
            overflow: 'hidden',
            WebkitAppRegion: 'no-drag'
          } as React.CSSProperties}
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
          style={{
            width: '100%',
            padding: '8px',
            background: 'var(--color-primary)',
            color: 'var(--color-white)',
            border: 'none',
            borderRadius: 'var(--border-radius-sm)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
            opacity: !input.trim() || isLoading ? 0.5 : 1,
            WebkitAppRegion: 'no-drag',
            transition: 'background 0.15s ease'
          } as React.CSSProperties}
        >
          {isLoading ? '思考中…' : '送出追問'}
        </button>
      </div>
    </div>
  )
}
