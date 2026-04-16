import { BrowserWindow, screen, ipcMain } from 'electron'
import { join } from 'path'

const isDev = process.env.NODE_ENV === 'development'

const FAB_SIZE = 52
const EXPANDED_WIDTH = 320
const EXPANDED_HEIGHT = 560

let win: BrowserWindow | null = null
let isExpanded = false
let savedFabPos: { x: number; y: number } | null = null

export function getWindow(): BrowserWindow | null {
  return win
}

export function createFloatWindow(): BrowserWindow {
  isExpanded = false
  savedFabPos = null

  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize

  const x = sw - FAB_SIZE - 24
  const y = sh - FAB_SIZE - 72

  win = new BrowserWindow({
    width: FAB_SIZE,
    height: FAB_SIZE,
    x,
    y,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  win.setAlwaysOnTop(true, process.platform === 'darwin' ? 'floating' : 'screen-saver')

  win.on('blur', () => {
    win?.setAlwaysOnTop(true, process.platform === 'darwin' ? 'floating' : 'screen-saver')
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}

export function expandWindow(): void {
  if (!win) return
  isExpanded = true

  const [fabX, fabY] = win.getPosition()
  savedFabPos = { x: fabX, y: fabY }
  const { width: sw } = screen.getPrimaryDisplay().workAreaSize

  // Expand left if FAB is on the right half of the screen, otherwise expand right
  const expandX =
    fabX + FAB_SIZE > sw / 2
      ? Math.max(0, fabX + FAB_SIZE - EXPANDED_WIDTH)
      : fabX

  win.setSize(EXPANDED_WIDTH, EXPANDED_HEIGHT, false)
  win.setPosition(expandX, fabY, false)
  win.webContents.send('window:state-changed', { isExpanded: true })
}

export function collapseWindow(): void {
  if (!win) return

  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize
  const fabX = savedFabPos?.x ?? sw - FAB_SIZE - 24
  const fabY = savedFabPos?.y ?? sh - FAB_SIZE - 72

  // Tell React to render the FAB, then hide the window during the transition
  // so the briefly-clipped expanded panel content never flashes as a square
  isExpanded = false
  win.webContents.send('window:state-changed', { isExpanded: false })
  win.setOpacity(0)

  setTimeout(() => {
    if (!win) return
    win.setBounds({ x: fabX, y: fabY, width: FAB_SIZE, height: FAB_SIZE }, false)
    win.setAlwaysOnTop(true, process.platform === 'darwin' ? 'floating' : 'screen-saver')
    win.setOpacity(1)
  }, 50)
}

export function setWindowHeight(height: number): void {
  if (!win || !isExpanded) return
  const clampedHeight = Math.min(Math.max(height, 200), 800)
  const [w] = win.getSize()
  win.setSize(w, clampedHeight, false)
}

export function registerWindowIpcHandlers(): void {
  ipcMain.handle('window:toggle', () => {
    if (isExpanded) {
      collapseWindow()
    } else {
      expandWindow()
    }
    return { isExpanded }
  })

  ipcMain.handle('window:set-height', (_event, { height }: { height: number }) => {
    setWindowHeight(height)
  })

  ipcMain.handle('window:get-state', () => {
    return { isExpanded }
  })

  // Fire-and-forget: move FAB by pixel delta during JS-based drag
  ipcMain.on('window:move-by', (_event, { dx, dy }: { dx: number; dy: number }) => {
    if (!win || isExpanded) return
    const [x, y] = win.getPosition()
    win.setPosition(x + Math.round(dx), y + Math.round(dy), false)
  })
}
