import { app } from 'electron'
import { createFloatWindow, registerWindowIpcHandlers } from './float-window'
import { registerIpcHandlers } from './ipc-handlers'

// Set by the quit button so window-all-closed knows not to recreate the FAB
let isQuitting = false

app.on('before-quit', () => {
  isQuitting = true
})

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

// If the window is closed for any reason (Alt+F4, OS close, etc.),
// recreate the FAB instead of letting the app go invisible.
app.on('window-all-closed', () => {
  if (!isQuitting) {
    createFloatWindow()
  }
})
