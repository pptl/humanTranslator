export function ReviewPanel() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 20px',
        gap: '10px',
        textAlign: 'center'
      }}
    >
      <div style={{ fontSize: '36px', marginBottom: '4px' }}>📖</div>
      <p style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-text)' }}>
        復習功能即將推出
      </p>
      <p
        style={{
          fontSize: '13px',
          color: 'var(--color-text-muted)',
          lineHeight: 1.6,
          maxWidth: '200px'
        }}
      >
        完成一定數量的練習後，這裡將顯示需要複習的題目。
      </p>
    </div>
  )
}
