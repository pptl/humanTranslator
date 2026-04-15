/// <reference types="vite/client" />

export {}

// Extend React CSSProperties to support Electron's drag region
declare module 'react' {
  interface CSSProperties {
    WebkitAppRegion?: 'drag' | 'no-drag'
  }
}
