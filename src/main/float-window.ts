import { BrowserWindow, screen, ipcMain } from 'electron'
import { join } from 'path'
import { getConfig, setConfig } from './config-store'

const isDev = process.env.NODE_ENV === 'development'

const FAB_SIZE = 52
const EXPANDED_WIDTH = 320
const EXPANDED_HEIGHT = 560

let win: BrowserWindow | null = null
let isExpanded = false
let savedFabPosition: { x: number; y: number } | null = null

export function getWindow(): BrowserWindow | null {
  return win
}

export function createFloatWindow(): BrowserWindow {
  const config = getConfig()
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize

  const x = config.windowPosition.x >= 0 ? config.windowPosition.x : sw - FAB_SIZE - 24
  const y = config.windowPosition.y >= 0 ? config.windowPosition.y : sh - FAB_SIZE - 72

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

  win.on('moved', () => {
    if (!win || isExpanded) return
    const [wx, wy] = win.getPosition()
    setConfig({ windowPosition: { x: wx, y: wy } })
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
  savedFabPosition = { x: fabX, y: fabY }

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

  // Restore FAB to where it was before expanding
  if (savedFabPosition) {
    win.setSize(FAB_SIZE, FAB_SIZE, false)
    win.setPosition(savedFabPosition.x, savedFabPosition.y, false)
    savedFabPosition = null
  } else {
    const [curX, curY] = win.getPosition()
    win.setSize(FAB_SIZE, FAB_SIZE, false)
    win.setPosition(curX, curY, false)
  }

  isExpanded = false
  win.webContents.send('window:state-changed', { isExpanded: false })
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
