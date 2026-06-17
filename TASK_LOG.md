# Task Log

本次更新時間：26/06/10 14:26

## 26/06/10 02:49

- 建立專案資料夾：`05_Project/角色卡工坊`
- 建立初版 `PLAN.md`
- 將角色卡 JSON 結構、網站定位、MVP、風險與驗證方向寫入計畫。

## 26/06/10 02:56

- 更新 `PLAN.md`
- 將左側步驟改為：使用說明、角色卡、世界書、合併、匯出。
- 將 AI Skill 放入角色卡與世界書各自區塊。
- 將範例庫收斂為三個空白模板。
- 將 open questions 改為已決策事項。
- 將 PNG 角色卡支援納入第一版。

## 26/06/10 03:01

- 建立 `README.md`
- 建立 `AGENTS.md`
- 建立 `PROJECT_WORKFLOW.md`
- 建立 `PROJECT_STATUS.md`
- 建立 `DECISIONS.md`
- 建立 `TASK_LOG.md`
- 建立 `VERIFY.md`
- 更新 `PLAN.md` 的本次更新時間。
- 修正 `PLAN.md` 世界書 AI Skill 清單縮排。

## 26/06/10 03:03

- 將所有 Markdown 文件轉存為 Windows 友善的 UTF-8。
- 確認專案資料夾內已有 8 份 Markdown 文件。

## 26/06/10 03:20

- 建立靜態前端 MVP。
- 新增 `index.html`。
- 新增 `assets/app.css`。
- 新增 `assets/app.js`。
- 新增 `templates/character_blank.json`。
- 新增 `templates/worldbook_blank.json`。
- 新增 `templates/card_with_worldbook_blank.json`。
- 實作左側流程：使用說明、角色卡、世界書、合併、匯出。
- 實作角色卡與世界書區塊內的 AI Skill prompt 複製按鈕。
- 實作 JSON 角色卡與世界書 JSON 匯入。
- 實作 PNG 角色卡 `chara` metadata 讀取與寫入。
- 實作世界書合併策略：取代、追加、去重追加。
- 實作 JSON / PNG 匯出。
- 新增 `verification/` 截圖輸出。

## 26/06/10 11:05

- 更新匯出區功能。
- 新增「上傳封面圖片」按鈕。
- 新增 `exportImageInput` 隱藏檔案輸入。
- 新增 `handleExportImageFile`，讓使用者在匯出區上傳普通圖片作為角色卡封面。
- 新增 `imageFileToPngBytes`，可將 JPG/WebP 等圖片轉成 PNG 後寫入角色卡 metadata。
- 調整匯出說明，明確區分「讀取既有 PNG 角色卡」與「上傳普通封面轉 PNG 角色卡」。

## 26/06/10 11:18

- 將首頁使用說明改成兩個工作流入口：
  - 全新製作
  - 修卡
- 新增 `state.workflow`。
- 新增 `startWorkflow`。
- 全新製作會直接建立角色卡空白模板與世界書空白模板。
- 修卡會引導使用者匯入既有 JSON / PNG 角色卡。
- 更新角色卡與世界書區塊文案，依工作流顯示不同說明。
- 更新世界書 AI Skill prompt，融合 `世界書擺放與注意力分佈.md` 的注意力分佈與擺放策略。
- 新增世界書 Skill：「依注意力分佈重排世界書」。
- 匯出區新增：
  - `拆出角色卡 JSON`
  - `拆出世界書 JSON`
- 新增 `createCharacterOnlyCard`、`exportCharacterOnlyJson`、`exportWorldOnlyJson`。

## 26/06/10 11:21

- 更新左上角品牌區。
- 將文字改為「酒館角色卡製卡工坊 BY MINI」。
- 將原本的文字 icon 改為 `lab icon.png`。
- 新增頁面 footer，加入 `Minijinai75/stpreset-viewer` 參考連結與原工具 credit / 非官方工具說明。
- 產生品牌與 footer 驗證截圖：`verification/brand-footer.png`。

## 26/06/10 11:25

- 修正 footer 版權文字。
- 移除照搬的「SillyTavern 繁中轉換工具箱」說明。
- 改為專案自身文案：`Original toolbox credit: Made with care by Minijinai75 · © 2026 SillyTavern 酒館角色卡快速製作工作坊，本工具非官方工具。僅協助玩家預覽、編輯與安全製作成 SillyTavern角色卡。`

## 26/06/10 11:26

- 修正 footer 排版，將長句拆成多行。
- 新增 `.footer-credit` 區塊。
- footer 現在分為 credit、版權、非官方工具說明、用途說明四行。
- 產生 footer 排版驗證截圖：`verification/footer-lines.png`。

## 26/06/10 11:27

- 移除前台 footer 的「頁面風格參考 Minijinai75/stpreset-viewer」文字與連結。
- 在 `AGENTS.md` 補充規則：`Minijinai75/stpreset-viewer` 是內部設計參考，不要在前台 UI 揭露。

## 26/06/10 11:39

- 修正 `assets/app.js` 世界書匯入 bug。
- 在 `normalizeCard` 將 `character_book` 改為統一走 `normalizeWorldBook`，避免物件格式 entries 被清空。
- 新增 `getWorldBookEntries`，支援世界書 `entries` 為陣列或物件索引格式。
- 修正三個 hidden file input 的 `change` 後清空 value，避免重選同一檔案時不觸發匯入。
- 以腳本驗證物件型世界書與角色卡內嵌世界書都能正確保留 entries。

## 26/06/10 14:26

- 更新 `assets/app.js` 角色卡欄位顯示名稱與說明文字。
- 將 `mes_example` 的顯示順序移到 `first_mes` 前面。
- 新增 `sanitizeAlternateGreetings`、`resetAlternateGreetingDrafts`。
- 將 `alternate_greetings` 從單一 textarea 改為可逐格新增 / 刪除的輸入區塊。
- 新增 `renderAlternateGreetingField`、`addAlternateGreeting`、`removeAlternateGreeting`。
- 更新 `assets/app.css`，補上欄位說明與問候語多格編輯樣式。

## 26/06/18 01:48 — 手機優先 UI＋製卡知識整合＋排版優化

### 手機優先 UI 重構
- 底部固定分頁導覽列（≤768px），取代頂部 sidebar
- 按鈕觸控目標升級至 44px，表單字體 16px 防 iOS 縮放
- Inspector 可收合（預設收合，顯示狀態 pill）
- 世界書條目手風琴（預設收合，點標題展開）
- Toast 訊息通知（fixed 定位＋3.5 秒自動消失）
- iPhone safe area 適配（env(safe-area-inset-bottom)）
- 拖放區新增點擊上傳、切換分頁自動捲頂
- Prompt 卡片手機版壓縮成一行
- `<meta name="theme-color">` 瀏覽器列配色

### 製卡知識整合（MVU Kit＋注意力分佈，排除變量系統）
- 使用說明頁新增「製卡核心原則」面板（調色盤、差異化、展示不定義、去八股）
- 使用說明頁新增「世界書擺放要點」面板（U 形注意力、角色前/後/D0、常駐上限）
- 角色卡欄位引導文字全面升級（description/personality/scenario/mes_example/first_mes）
- 世界書條目表單新增 constant（常駐/觸發）、at_depth 位置、depth 欄位
- 世界書條目顯示 token 估算（超 500 提示拆分，不足 50 提示內容偏少）
- 條目標題列新增常駐/觸發 badge、D 值顯示
- normalizeEntry 支援 at_depth 位置（extensions.position=4）
- 驗證新增：常駐超過 3 個、token 超 500、keys 不足 3 個、D2+ 警告
- AI Skill 新增：個性調色盤設計、去八股檢查、條目配置推薦
- 「素材轉角色卡 JSON」prompt 升級：融入差異化外貌＋調色盤＋白描原則

### 排版全面優化
- 工作流選卡升級為 workflow-card（漸層背景、hover 浮起陰影）
- 知識面板升級為 tips-card（左側彩色邊條區分）
- view 內距 18→24px、section-grid gap 12→16px＋底距 18px
- panel 內距 16→20px、h3 改藍色＋加大
- form-grid gap 14px、field label 改藍色
- dropzone 圓角 12px、hover 回饋
- prompt-card 漸層背景＋hover 高亮
- card-summary 漸層背景＋底距

### 基礎設施
- 初始化 git repo
- 更新 README.md、PROJECT_STATUS.md、TASK_LOG.md










