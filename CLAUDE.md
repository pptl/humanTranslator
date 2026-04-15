# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This project is in **pre-development phase** — only `PRD.md` exists. No source code, `package.json`, or configuration files have been created yet.

## What This Is

**人類翻譯機 / Human Translator** — an Electron desktop app that helps users practice English by submitting Chinese sentences, writing their own English translations, and receiving structured AI feedback. Feedback includes a score (1–10), problem explanation, a better version, context-specific variants (formal/casual/written), and a grammar tip.

## Planned Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop framework | Electron (Windows priority, macOS support) |
| Language | TypeScript |
| Data storage | SQLite or JSON (local only for MVP) |
| LLM | User-provided API keys — Claude (`@anthropic-ai/sdk`) and OpenAI (`openai`) |
| Spaced repetition | `ts-fsrs` (FSRS algorithm, TypeScript) |

## Architecture

Three-layer architecture with 10 planned modules:

**UI Layer**
- `Float Widget` — always-on-top FAB (52×52px, draggable, defaults to bottom-right), expands/collapses the main window
- `Main Panel` — scenario selector, Chinese input, English translation input, submit
- `Result Panel` — structured AI feedback display (score → problem → better version → context variants → grammar tip)
- `Review Panel` — FSRS spaced repetition review interface with session summary
- `Settings Panel` — API key management and scenario list management

**Business Logic Layer**
- `LLM Service` — prompt assembly, API calls (Claude/OpenAI), result parsing
- `Context Manager` — scenario CRUD, temporary scenario handling (save checkbox, default checked)
- `Review Engine` — FSRS scheduling using `ts-fsrs`; maps AI scores to FSRS ratings (8–10 → Good/Easy, 5–7 → Hard, 1–4 → Again)

**Data Layer**
- `Local Storage` — practice records, scenario list, review schedule (SQLite or JSON)
- `Config Store` — API keys, user preferences (stored locally, never uploaded)

## Implementation Order (from PRD)

Build in this order — each module unblocks the next:

1. **Config Store** — needed before anything can be tested (no API key = nothing works)
2. **LLM Service** — core engine that all other modules depend on
3. **Context Manager** — required by Main Panel
4. **Local Storage** — needed for scenario persistence
5. **Main Panel** — first visible UI
6. **Result Panel** — feedback display
7. **Float Widget** — MVP integration point
8. **Settings Panel** — API key and scenario management UI
9. **Review Engine** — depends on complete Local Storage data *(P1, post-MVP)*
10. **Review Panel** — depends on Review Engine *(P1, post-MVP)*

## UI Design Constants

```
Primary:        #534AB7
Hover:          #3C3489
Light BG:       #EEEDFE
Light Border:   #AFA9EC
Text:           #3C3489

FAB size:       52×52px (circle)
Main window:    300px wide
```

Default scenarios pre-loaded: 正式, 朋友, 書面

## AI Feedback Format

The LLM Service must produce output matching this structure:
```
✅ 判斷：<one-line verdict> (<score>/10)
📝 你的版本問題：<explanation>
💡 更好的說法：<best version>
🔄 不同情景的版本：
 ・正式場合：「...」
 ・朋友對話：「...」
 ・書面寫作：「...」
📚 相關語法小提示：<1–2 sentences>
```

## Performance Targets (MVP)

- FAB click → input interface visible: ≤ 1 second
- Submit → AI feedback returned: ≤ 10 seconds
