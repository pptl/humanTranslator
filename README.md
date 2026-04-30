# 人類翻譯機 / Human Translator

一個幫助使用者練習英文翻譯的 Electron 桌面應用程式。使用者輸入中文句子與自己的英文翻譯，AI 會給出結構化的評分與建議。

---

## 功能概覽

- 輸入中文句子與英文翻譯，提交後取得 AI 評分（1–10 分）
- 結構化回饋：判斷 → 問題說明 → 更好的說法 → 不同情景版本（正式／朋友／書面）→ 語法小提示
- 支援追問：針對 AI 回饋繼續提問，進行對話式學習
- 支援 Claude（Anthropic）與 OpenAI 兩種 LLM 供應商，使用者自行填入 API Key
- 情景管理：新增、刪除練習情景，系統依使用頻率排序
- 浮動視窗（FAB）：52×52px 圓形按鈕，常駐畫面最上層，可拖曳，點擊展開／收合主面板

---

## 技術堆疊

| 層次 | 技術 |
|------|------|
| 桌面框架 | Electron 33 |
| UI | React 18 + TypeScript |
| 建置工具 | electron-vite + Vite 5 |
| LLM | `@anthropic-ai/sdk` + `openai` |
| 資料儲存 | JSON 檔案（存於系統 userData 目錄） |

---

## 開發環境

**需求：** Node.js 18+、npm

```bash
npm install
npm run dev       # 啟動熱重載開發伺服器
npm run build     # 編譯 TypeScript → JS
npm run package   # 打包 Windows 可攜式 .exe（輸出至 dist/）
```

---

## 專案結構

```
src/
├── main/           # Electron 主程序
│   ├── index.ts          # 入口：建立視窗、註冊 IPC
│   ├── float-window.ts   # 浮動視窗管理（展開／收合）
│   ├── ipc-handlers.ts   # 所有 IPC channel 定義
│   ├── llm-service.ts    # LLM 抽象層（Claude / OpenAI）
│   ├── config-store.ts   # API Key 與設定持久化
│   ├── context-store.ts  # 情景管理與使用頻率追蹤
│   └── records-store.ts  # 練習紀錄儲存
├── preload/        # Context Bridge（安全暴露 API 給 Renderer）
└── renderer/       # React UI
    └── src/
        ├── App.tsx               # 頁籤路由（練習／復習／設定）
        ├── components/
        │   ├── MainPanel.tsx     # 主練習介面
        │   ├── ResultPanel.tsx   # AI 回饋顯示
        │   ├── FollowUpPanel.tsx # 追問對話介面
        │   ├── SettingsPanel.tsx # 設定（API Key、情景管理）
        │   ├── ReviewPanel.tsx   # 複習介面（未實作）
        │   └── FAB.tsx           # 浮動按鈕
        ├── hooks/                # useTranslate, useConfig, useFollowUp, useContexts
        └── contexts/             # ContextsProvider
shared/
└── types.ts        # 跨程序共用型別定義
```

---

## 目前進度

### P0 MVP — 已完成

- [x] Config Store — API Key 與供應商選擇
- [x] LLM Service — Claude + OpenAI 雙供應商支援
- [x] Context Manager — 情景 CRUD + 使用頻率排序
- [x] Local Storage — 練習紀錄持久化
- [x] Main Panel — 主練習輸入介面
- [x] Result Panel — 結構化 AI 回饋顯示
- [x] Follow-Up Panel — 追問對話功能
- [x] Float Widget — FAB 展開／收合視窗
- [x] Settings Panel — API Key 與情景管理 UI

### P1 後續功能 — 待實作

- [ ] Review Engine — FSRS 間隔重複演算法（`ts-fsrs`）
  - 評分對應：8–10 → Good/Easy、5–7 → Hard、1–4 → Again
- [ ] Review Panel — 複習介面與 Session 總結
- [ ] 鍵盤快捷鍵
- [ ] 語音輸入

---

## 資料儲存位置

使用者資料存於 Electron `userData` 目錄：

- **Windows：** `%APPDATA%\人類翻譯機\`

包含以下 JSON 檔案：`config.json`、`contexts.json`、`context-usage.json`、`records.json`

---

## 設定方式

首次啟動後，點擊 FAB 展開面板，切換到「設定」頁籤：

1. 選擇 LLM 供應商（Claude 或 OpenAI）
2. 填入對應的 API Key
3. 儲存後即可開始使用
