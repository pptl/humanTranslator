import { app } from 'electron'
import { createFloatWindow, registerWindowIpcHandlers } from './float-window'
import { registerIpcHandlers } from './ipc-handlers'

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.humantranslator')
  }

  registerIpcHandlers()
  registerWindowIpcHandlers()
  createFloatWindow()

  // On macOS, re-create the window if dock icon is clicked and no windows are open
  app.on('activate', () => {
    createFloatWindow()
  })
})

// Do NOT quit when all windows are closed — the app lives in the FAB
app.on('window-all-closed', () => {
  // Intentionally empty: keep the process alive for the FAB
})
