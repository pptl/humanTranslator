import { useRef } from 'react'

interface FABProps {
  isExpanded: boolean
  onClick: () => void
}

export function FAB({ isExpanded, onClick }: FABProps) {
  const dragRef = useRef<{
    startX: number
    startY: number
    lastX: number
    lastY: number
    moved: boolean
  } | null>(null)

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (isExpanded) return
    e.preventDefault()

    dragRef.current = {
      startX: e.screenX,
      startY: e.screenY,
      lastX: e.screenX,
      lastY: e.screenY,
      moved: false
    }

    function onMove(ev: MouseEvent) {
      const d = dragRef.current
      if (!d) return

      const totalDx = ev.screenX - d.startX
      const totalDy = ev.screenY - d.startY
      if (!d.moved && (Math.abs(totalDx) > 4 || Math.abs(totalDy) > 4)) {
        d.moved = true
      }

      if (d.moved) {
        const ddx = ev.screenX - d.lastX
        const ddy = ev.screenY - d.lastY
        if (ddx !== 0 || ddy !== 0) {
          window.api.moveWindowBy(ddx, ddy)
        }
      }

      d.lastX = ev.screenX
      d.lastY = ev.screenY
    }

    function onUp() {
      const d = dragRef.current
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      if (d && !d.moved) {
        onClick()
      }
      dragRef.current = null
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return (
    <div
      style={{
        width: 'var(--fab-size)',
        height: 'var(--fab-size)',
        borderRadius: '50%',
        background: 'var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: 'var(--shadow)',
        flexShrink: 0,
        WebkitAppRegion: 'no-drag',
        transition: 'background 0.15s ease',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.background = 'var(--color-hover)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.background = 'var(--color-primary)'
      }}
      title="人類翻譯機"
    >
      {/* Translation icon */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ pointerEvents: 'none' }}
      >
        <path
          d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"
          fill="white"
        />
      </svg>
    </div>
  )
}
