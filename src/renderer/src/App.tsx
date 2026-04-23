import { useState, useEffect } from 'react'
import { FAB } from './components/FAB'
import { MainPanel } from './components/MainPanel'
import { ReviewPanel } from './components/ReviewPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { ContextsProvider } from './contexts/ContextsProvider'
import type { AppView } from '../../shared/types'

export default function App() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeView, setActiveView] = useState<AppView>('main')

  useEffect(() => {
    window.api.getWindowState().then(({ isExpanded: expanded }) => {
      setIsExpanded(expanded)
    })
    window.api.onWindowStateChanged(({ isExpanded: expanded }) => {
      setIsExpanded(expanded)
    })
    return () => {
      window.api.removeWindowStateListeners()
    }
  }, [])

  async function handleFABClick() {
    const result = await window.api.toggleWindow()
    setIsExpanded(result.isExpanded)
  }

  return (
    <>
      {/* FAB — always mounted, shown only when collapsed */}
      <div
        style={{
          display: isExpanded ? 'none' : 'flex',
          width: '100vw',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent'
        }}
      >
        <FAB isExpanded={false} onClick={handleFABClick} />
      </div>

      {/* Expanded panel — always mounted, hidden when collapsed */}
      <div
        style={{
          display: isExpanded ? 'flex' : 'none',
          width: '100vw',
          height: '100vh',
          flexDirection: 'column',
          background: 'transparent'
        }}
      >
        <div
          style={{
            background: 'var(--color-white)',
            borderRadius: 'var(--border-radius)',
            boxShadow: 'var(--shadow)',
            border: '1px solid var(--color-light-border)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '100vh'
          }}
        >
          {/* Title row — drag region */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px 8px',
              WebkitAppRegion: 'drag',
              flexShrink: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span
                style={{
                  color: 'var(--color-primary)',
                  fontSize: '9px',
                  lineHeight: 1,
                  WebkitAppRegion: 'no-drag'
                }}
              >
                ●
              </span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>
                人類翻譯機
              </span>
            </div>
            <button
              onClick={handleFABClick}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                fontSize: '18px',
                lineHeight: 1,
                padding: '2px 4px',
                WebkitAppRegion: 'no-drag',
                borderRadius: '4px'
              }}
              title="收起"
            >
              ×
            </button>
          </div>

          {/* Tabs row */}
          <div
            style={{
              display: 'flex',
              padding: '0 12px',
              borderBottom: '2px solid var(--color-light-border)',
              WebkitAppRegion: 'no-drag',
              flexShrink: 0
            }}
          >
            <TabButton
              label="練習"
              active={activeView === 'main'}
              onClick={() => setActiveView('main')}
            />
            <TabButton
              label="復習"
              active={activeView === 'review'}
              onClick={() => setActiveView('review')}
            />
            <TabButton
              label="設定"
              active={activeView === 'settings'}
              onClick={() => setActiveView('settings')}
            />
          </div>

          {/* Content — all panels always mounted, toggled by display */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <ContextsProvider>
              <div style={{ display: activeView === 'main' ? 'block' : 'none', padding: '12px' }}>
                <MainPanel />
              </div>
              <div style={{ display: activeView === 'review' ? 'block' : 'none', padding: '12px' }}>
                <ReviewPanel />
              </div>
              <div style={{ display: activeView === 'settings' ? 'block' : 'none', padding: '12px' }}>
                <SettingsPanel />
              </div>
            </ContextsProvider>
          </div>
        </div>
      </div>
    </>
  )
}

function TabButton({
  label,
  active,
  onClick
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent',
        border: 'none',
        borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
        marginBottom: '-2px',
        color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
        fontWeight: active ? 600 : 400,
        fontSize: '14px',
        padding: '6px 12px',
        cursor: 'pointer',
        WebkitAppRegion: 'no-drag',
        transition: 'color 0.15s ease'
      }}
    >
      {label}
    </button>
  )
}
