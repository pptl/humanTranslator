import React, { useState, useEffect } from 'react'
import { useConfig } from '../hooks/useConfig'
import { useContexts } from '../hooks/useContexts'

export function SettingsPanel() {
  const { config, saveConfig } = useConfig()
  const { contexts, addContext, deleteContext } = useContexts()

  const [apiKey, setApiKey] = useState('')
  const [provider, setProvider] = useState<'claude' | 'openai'>('claude')
  const [newContextName, setNewContextName] = useState('')
  const [saveStatus, setSaveStatus] = useState<'' | 'saved' | 'error'>('')

  useEffect(() => {
    setApiKey(config.apiKey)
    setProvider(config.selectedProvider)
  }, [config])

  async function handleSave() {
    const success = await saveConfig({
      apiKey,
      selectedProvider: provider
    })
    setSaveStatus(success ? 'saved' : 'error')
    setTimeout(() => setSaveStatus(''), 2000)
  }

  async function handleAddContext() {
    if (!newContextName.trim()) return
    await addContext(newContextName.trim())
    setNewContextName('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* API Provider */}
      <section>
        <SectionTitle>LLM 提供商</SectionTitle>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <ProviderButton
            label="Claude"
            selected={provider === 'claude'}
            onClick={() => setProvider('claude')}
          />
          <ProviderButton
            label="OpenAI"
            selected={provider === 'openai'}
            onClick={() => setProvider('openai')}
          />
        </div>

        <label style={labelStyle}>API Key</label>
        <input
          type="password"
          placeholder={provider === 'claude' ? 'sk-ant-...' : 'sk-...'}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{ ...inputStyle, marginBottom: '12px' }}
        />

        <button onClick={handleSave} style={buttonStyle}>
          儲存設定
        </button>
        {saveStatus === 'saved' && (
          <p style={{ fontSize: '12px', color: 'var(--color-success)', marginTop: '6px' }}>
            已儲存
          </p>
        )}
        {saveStatus === 'error' && (
          <p style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '6px' }}>
            儲存失敗
          </p>
        )}
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-light-border)' }} />

      {/* Contexts */}
      <section>
        <SectionTitle>情景管理</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
          {contexts.map((c) => (
            <div
              key={c.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                background: 'var(--color-light-bg)',
                borderRadius: 'var(--border-radius-sm)'
              }}
            >
              <span style={{ fontSize: '13px', color: 'var(--color-text)' }}>{c.name}</span>
              <button
                onClick={() => deleteContext(c.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  fontSize: '16px',
                  lineHeight: 1,
                  padding: '0 2px',
                  WebkitAppRegion: 'no-drag'
                }}
                title="刪除"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            type="text"
            placeholder="新增情景..."
            value={newContextName}
            onChange={(e) => setNewContextName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddContext()}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            onClick={handleAddContext}
            disabled={!newContextName.trim()}
            style={{
              ...buttonStyle,
              width: 'auto',
              padding: '8px 12px',
              opacity: newContextName.trim() ? 1 : 0.5
            }}
          >
            新增
          </button>
        </div>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-light-border)' }} />

      <button
        onClick={() => window.api.quitApp()}
        style={{ ...buttonStyle, background: '#e53e3e' }}
      >
        退出應用程式
      </button>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontSize: '13px',
        fontWeight: 700,
        color: 'var(--color-text)',
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}
    >
      {children}
    </h3>
  )
}

function ProviderButton({
  label,
  selected,
  onClick
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '6px',
        border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-light-border)'}`,
        borderRadius: 'var(--border-radius-sm)',
        background: selected ? 'var(--color-light-bg)' : 'transparent',
        color: selected ? 'var(--color-primary)' : 'var(--color-text-muted)',
        fontSize: '13px',
        fontWeight: selected ? 600 : 400,
        cursor: 'pointer',
        WebkitAppRegion: 'no-drag'
      }}
    >
      {label}
    </button>
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

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px',
  background: 'var(--color-primary)',
  color: 'var(--color-white)',
  border: 'none',
  borderRadius: 'var(--border-radius-sm)',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  WebkitAppRegion: 'no-drag'
}
