import React from 'react'
import type { FeedbackResult } from '../../../shared/types'

interface ResultPanelProps {
  feedback: FeedbackResult
}

function scoreColor(score: number): string {
  if (score >= 8) return '#38a169'
  if (score >= 5) return '#d69e2e'
  return '#e53e3e'
}

export function ResultPanel({ feedback }: ResultPanelProps) {
  const color = scoreColor(feedback.score)

  return (
    <div className="selectable" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* 批改結果 header + score badge */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>批改結果</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              border: `1.5px solid ${color}`,
              color: color,
              borderRadius: '6px',
              padding: '2px 10px',
              fontSize: '14px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {feedback.score} / 10
          </span>
          <span style={{ fontSize: '13px', color: 'var(--color-text-dark)', lineHeight: 1.4 }}>
            {feedback.verdict}
          </span>
        </div>
      </div>

      {/* Problem explanation */}
      <Section title="問題解釋">
        <p style={{ lineHeight: 1.6, color: 'var(--color-text-dark)', fontSize: '13px' }}>
          {feedback.problem}
        </p>
      </Section>

      {/* Better version */}
      <Section title="更好的說法">
        <p style={{ fontWeight: 500, color: 'var(--color-primary)', fontSize: '14px', lineHeight: 1.5 }}>
          {feedback.betterVersion}
        </p>
      </Section>

      {/* Context versions */}
      <Section title="不同情景版本">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {feedback.contextVersions.map((cv) => (
            <ContextItem key={cv.name} tag={cv.name} text={cv.text} />
          ))}
        </div>
      </Section>

      {/* Grammar tip — callout box */}
      <div
        style={{
          background: 'var(--color-light-bg)',
          borderRadius: 'var(--border-radius-sm)',
          padding: '10px 12px'
        }}
      >
        <p style={{ lineHeight: 1.6, color: 'var(--color-text-dark)', fontSize: '13px' }}>
          {feedback.grammarTip}
        </p>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
        {title}
      </p>
      {children}
    </div>
  )
}

function ContextItem({ tag, text }: { tag: string; text: string }) {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
      <span
        style={{
          background: 'var(--color-light-bg)',
          color: 'var(--color-primary)',
          borderRadius: '4px',
          padding: '2px 7px',
          fontSize: '11px',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          marginTop: '2px',
          flexShrink: 0
        }}
      >
        {tag}
      </span>
      <span style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--color-text-dark)' }}>
        {text}
      </span>
    </div>
  )
}
