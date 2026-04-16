import React, { useState, useEffect, useRef } from 'react'
import { useContexts } from '../hooks/useContexts'
import { useTranslate } from '../hooks/useTranslate'
import { ResultPanel } from './ResultPanel'
import type { Context } from '../../../shared/types'

export function MainPanel() {
  const { contexts, addContext } = useContexts()
  const { status, feedback, errorMsg, submit } = useTranslate()

  // Combobox
  const [contextInput, setContextInput] = useState('')
  const [selectedContextId, setSelectedContextId] = useState<string>('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const comboboxRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  const [chineseText, setChineseText] = useState('')
  const [userTranslation, setUserTranslation] = useState('')
  const resultRef = useRef<HTMLDivElement>(null)

  // Default to first context on load (run only once)
  useEffect(() => {
    if (contexts.length > 0 && !initializedRef.current) {
      initializedRef.current = true
      const first = contexts[0]
      setSelectedContextId(first.id)
      setContextInput(first.name)
    }
  }, [contexts])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Adjust window height when result renders
  useEffect(() => {
    if (status !== 'result') return
    const observer = new ResizeObserver(() => {
      window.api.setWindowHeight(document.body.scrollHeight + 8)
    })
    observer.observe(document.body)
    return () => observer.disconnect()
  }, [status])

  // Combobox derived state
  const filteredContexts = contexts.filter((c) =>
    c.name.toLowerCase().includes(contextInput.toLowerCase())
  )
  const canCreateNew =
    contextInput.trim() !== '' &&
    !contexts.some((c) => c.name.toLowerCase() === contextInput.trim().toLowerCase())

  function handleContextInputChange(value: string) {
    setContextInput(value)
    setIsDropdownOpen(true)
    const exact = contexts.find((c) => c.name.toLowerCase() === value.toLowerCase())
    setSelectedContextId(exact?.id ?? '')
  }

  function handleContextSelect(c: Context) {
    setContextInput(c.name)
    setSelectedContextId(c.id)
    setIsDropdownOpen(false)
  }

  async function handleCreateContext() {
    const name = contextInput.trim()
    if (!name || !canCreateNew) return
    setContextInput(name)
    setIsDropdownOpen(false)
    const newCtx = await addContext(name)
    setSelectedContextId(newCtx.id)
  }

  function getContextName(): string {
    return selectedContextId
      ? (contexts.find((c) => c.id === selectedContextId)?.name ?? contextInput.trim())
      : contextInput.trim()
  }

  async function handleSubmit() {
    const contextName = getContextName()
    if (!contextName || !chineseText.trim() || !userTranslation.trim()) return
    await submit(chineseText.trim(), userTranslation.trim(), contextName)
  }

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  const isLoading = status === 'loading'
  const canSubmit =
    !isLoading &&
    contextInput.trim() !== '' &&
    chineseText.trim() !== '' &&
    userTranslation.trim() !== ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Context combobox */}
      <div>
        <label style={labelStyle}>情景</label>
        <div ref={comboboxRef} style={{ position: 'relative' }}>
          <input
            type="text"
            value={contextInput}
            onChange={(e) => handleContextInputChange(e.target.value)}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="選擇或輸入情景..."
            style={inputStyle}
            disabled={isLoading}
          />
          {isDropdownOpen && (filteredContexts.length > 0 || canCreateNew) && (
            <div style={dropdownStyle}>
              {filteredContexts.map((c) => (
                <div
                  key={c.id}
                  onMouseDown={() => handleContextSelect(c)}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.background =
                      'var(--color-light-bg)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.background =
                      c.id === selectedContextId ? 'var(--color-light-bg)' : 'transparent')
                  }
                  style={{
                    ...dropdownItemStyle,
                    background:
                      c.id === selectedContextId ? 'var(--color-light-bg)' : 'transparent'
                  }}
                >
                  {c.name}
                </div>
              ))}
              {canCreateNew && (
                <div
                  onMouseDown={handleCreateContext}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.background =
                      'var(--color-light-bg)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.background = 'transparent')
                  }
                  style={{
                    ...dropdownItemStyle,
                    color: 'var(--color-primary)',
                    fontWeight: 500,
                    borderTop:
                      filteredContexts.length > 0
                        ? '1px solid var(--color-light-border)'
                        : 'none'
                  }}
                >
                  ＋ 新增「{contextInput.trim()}」
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chinese text */}
      <div>
        <label style={labelStyle}>原文（中文）</label>
        <textarea
          placeholder="輸入你想練習翻譯的中文句子..."
          value={chineseText}
          onChange={(e) => {
            setChineseText(e.target.value)
            autoResize(e.target)
          }}
          rows={1}
          style={{ ...textareaStyle, overflow: 'hidden' }}
          disabled={isLoading}
        />
      </div>

      {/* English translation */}
      <div>
        <label style={labelStyle}>我的翻譯（英文）</label>
        <textarea
          placeholder="輸入你的翻譯..."
          value={userTranslation}
          onChange={(e) => {
            setUserTranslation(e.target.value)
            autoResize(e.target)
          }}
          rows={1}
          style={{ ...textareaStyle, overflow: 'hidden' }}
          disabled={isLoading}
        />
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        style={{
          ...buttonStyle,
          opacity: canSubmit ? 1 : 0.5,
          cursor: canSubmit ? 'pointer' : 'not-allowed'
        }}
      >
        {isLoading ? '批改中...' : status === 'result' ? '重新批改' : '送出批改'}
      </button>

      {/* Error */}
      {status === 'error' && (
        <div
          style={{
            background: '#fff5f5',
            border: '1px solid #fed7d7',
            borderRadius: 'var(--border-radius-sm)',
            padding: '10px',
            color: 'var(--color-error)',
            fontSize: '13px'
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Result */}
      {status === 'result' && feedback && (
        <div ref={resultRef}>
          <hr
            style={{
              border: 'none',
              borderTop: '1px solid var(--color-light-border)',
              margin: '4px 0'
            }}
          />
          <ResultPanel feedback={feedback} />
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--color-text)',
  marginBottom: '4px'
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid var(--color-light-border)',
  borderRadius: 'var(--border-radius-sm)',
  fontSize: '13px',
  outline: 'none',
  background: 'var(--color-white)',
  color: 'var(--color-text-dark)',
  WebkitAppRegion: 'no-drag'
}

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'none',
  lineHeight: 1.5,
  display: 'block'
}

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  background: 'var(--color-primary)',
  color: 'var(--color-white)',
  border: 'none',
  borderRadius: 'var(--border-radius-sm)',
  fontSize: '14px',
  fontWeight: 600,
  WebkitAppRegion: 'no-drag',
  transition: 'background 0.15s ease'
}

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  marginTop: '2px',
  background: 'var(--color-white)',
  border: '1px solid var(--color-light-border)',
  borderRadius: 'var(--border-radius-sm)',
  boxShadow: '0 4px 12px rgba(83, 74, 183, 0.15)',
  zIndex: 100,
  overflow: 'hidden'
}

const dropdownItemStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: '13px',
  color: 'var(--color-text-dark)',
  cursor: 'pointer',
  WebkitAppRegion: 'no-drag'
}
