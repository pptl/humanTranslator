# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**人類翻譯機 / Human Translator** — an Electron desktop app where users submit a Chinese sentence, write their own English translation, and receive structured AI feedback (score, problem explanation, better version, context variants, grammar tip). Built with React + TypeScript + Vite via `electron-vite`.

## Development Commands

```bash
npm run dev        # Hot-reload dev server (use this during development)
npm run build      # Compile TypeScript → JS (output to out/)
npm run start      # Preview production build
npm run package    # Build + package Windows portable .exe (dist/)
```

## Architecture

Three Electron processes, each with its own TypeScript config:

| Process | Entry | tsconfig |
|---------|-------|----------|
| Main | `src/main/index.ts` | `tsconfig.node.json` |
| Preload | `src/preload/index.ts` | `tsconfig.node.json` |
| Renderer | `src/renderer/src/main.tsx` | `tsconfig.web.json` |

**Path aliases** (configured in `electron.vite.config.ts`):
- `@shared` → `src/shared/`
- `@renderer` → `src/renderer/src/`

### Main Process (`src/main/`)

- `index.ts` — App entry: creates float window, registers IPC handlers, manages window lifecycle
- `float-window.ts` — Creates the always-on-top BrowserWindow; handles expand (320×560px) ↔ collapse (52×52px) transitions, opacity, dragging, and screen-aware positioning
- `ipc-handlers.ts` — All IPC channel definitions; delegates to the stores and LLM service
- `llm-service.ts` — Provider-agnostic LLM abstraction: builds prompts, calls Claude or OpenAI, validates and parses JSON responses into `FeedbackResult`
- `config-store.ts` — Persists `AppConfig` (API key, provider, window position) as JSON in `app.getPath('userData')`
- `context-store.ts` — Manages practice scenarios with usage tracking; top-N contexts are injected into LLM prompts
- `records-store.ts` — Appends `PracticeRecord` objects (with full feedback) to JSON

### Preload (`src/preload/index.ts`)

Exposes `window.api` via `contextBridge`. Type definitions live in `src/preload/index.d.ts`. Every IPC channel in `ipc-handlers.ts` has a corresponding method here.

### Renderer (`src/renderer/src/`)

React SPA. State lives in hooks and one React Context:

- `contexts/ContextsProvider.tsx` — Global context list state + CRUD; consumed via `useContexts` hook
- `hooks/useConfig.ts` — Loads/saves config via `window.api`
- `hooks/useTranslate.ts` — Manages translate submission lifecycle (idle → loading → result/error)
- `hooks/useFollowUp.ts` — Manages follow-up Q&A list and submission state

`App.tsx` owns the expand/collapse window state and tab routing (`練習 / 復習 / 設定`). All four panels (Main, Result, FollowUp, Settings, Review) stay mounted — visibility is controlled by CSS so state is preserved across tab switches.

### Shared Types (`src/shared/types.ts`)

Single source of truth for interfaces used across all three processes: `AppConfig`, `Context`, `FeedbackResult`, `PracticeRecord`, `TranslatePayload`, `FollowUpPayload`, `FollowUpQA`, `AppView`, `WindowState`.

### Data Storage

JSON files in Electron `userData` directory (Windows: `%APPDATA%\人類翻譯機\`):
- `config.json` — API key + provider
- `contexts.json` — Scenario list
- `context-usage.json` — Usage counts for ranking
- `records.json` — All practice records

## Implementation Status

**P0 (MVP — complete):** Config Store, LLM Service (Claude + OpenAI), Context Manager, Local Storage, Main Panel, Result Panel, Follow-Up Panel, Float Widget, Settings Panel

**P1 (not yet implemented):** Review Engine (FSRS via `ts-fsrs`), Review Panel, keyboard shortcuts, voice input

## UI Design Constants

Colors (CSS variables in `src/renderer/src/styles.css`):
```
--primary:       #534AB7
--primary-hover: #3C3489
--light-bg:      #EEEDFE
--light-border:  #AFA9EC
```

FAB: 52×52px circle. Expanded panel: 320px wide, up to 800px tall.

## IPC Communication Pattern

Renderer → Main: `ipcRenderer.invoke(channel, payload)` (all async, awaited)  
Main → Renderer: `webContents.send('window-state-changed', state)` (push events only)

New features touching both sides need: a channel constant in `ipc-handlers.ts`, a handler registered in `index.ts`, and a wrapper in `src/preload/index.ts` + `index.d.ts`.
