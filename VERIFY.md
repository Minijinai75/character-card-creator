# Verify

本次更新時間：26/06/10 14:26

## 26/06/10 03:01

### Commands Run

- `Get-Date -Format 'yy/MM/dd HH:mm'`
- `Get-ChildItem -Force 'H:\我的雲端硬碟\【0】AI WORK\MINI AGENTS HOME\05_Project\角色卡工坊'`
- `Get-Content -Raw -Encoding UTF8 'H:\我的雲端硬碟\【0】AI WORK\MINI AGENTS HOME\05_Project\角色卡工坊\PLAN.md'`

### Results

- 已確認台灣時間：26/06/10 03:01。
- 已確認專案資料夾存在。
- 已確認更新前資料夾內已有 `PLAN.md`。
- 已依目前決策建立專案 continuity 文件。

### Not Verified Yet

- 尚未驗證任何 HTML / CSS / JavaScript，因為尚未開始實作。
- 尚未驗證 PNG 角色卡解析流程，因為尚未建立前端程式。
- 尚未驗證 JSON 匯入、合併、匯出流程，因為尚未建立前端程式。
- 尚未建立 repo，也尚未執行任何 install/build/test。

## 26/06/10 03:03

### Commands Run

- 將 `05_Project/角色卡工坊` 內所有 `*.md` 以 UTF-8 重新寫入。
- `Get-ChildItem -Force -Path 'H:\我的雲端硬碟\【0】AI WORK\MINI AGENTS HOME\05_Project\角色卡工坊'`

### Results

- 已確認以下文件存在：
  - `PLAN.md`
  - `README.md`
  - `AGENTS.md`
  - `PROJECT_WORKFLOW.md`
  - `PROJECT_STATUS.md`
  - `DECISIONS.md`
  - `TASK_LOG.md`
  - `VERIFY.md`
- 已確認本次只建立與更新 Markdown 文件，未執行 install/build/test。

### Not Verified Yet

- 尚未建立前端實作檔案。
- 尚未驗證 JSON / PNG 功能。

## 26/06/10 03:20

### Commands Run

- `node --check 'assets/app.js'`
- 解析 `templates/*.json`，確認三個模板都能 `ConvertFrom-Json`。
- 使用 Chrome headless + DevTools Protocol 開啟 `index.html`。
- Smoke test：載入角色模板、載入世界書模板、切到合併、執行合併、確認匯出 JSON 按鈕可用。
- 桌機截圖：`verification/desktop-smoke.png`
- 手機截圖：`verification/mobile-smoke.png`
- PNG roundtrip：建立 fallback PNG、寫入 `chara` metadata、再解析回角色卡。

### Results

- `assets/app.js` 語法檢查通過。
- 三個模板 JSON 解析通過：
  - `character_blank.json`
  - `worldbook_blank.json`
  - `card_with_worldbook_blank.json`
- Chrome headless smoke test 通過，runtime errors 為 0。
- 桌機與手機截圖無明顯重疊或跑版。
- PNG roundtrip 通過：
  - name：`PNG Roundtrip`
  - spec：`chara_card_v3`
  - entries：`1`

### Not Verified Yet

- 尚未用真實 PNG 角色卡人工匯入測試。
- 尚未用真實世界書 JSON 人工合併測試。
- 尚未在 GitHub repo 內提交或部署。

## 26/06/10 11:05

### Commands Run

- `node --check 'assets/app.js'`
- 搜尋確認 `exportImageInput`、`handleExportImageFile`、`imageFileToPngBytes`、`上傳封面圖片` 已寫入。
- 使用 Chrome headless + DevTools Protocol 開啟 `index.html`。
- 模擬流程：載入合併模板、切到匯出、建立 JPG 封面 File、呼叫 `handleExportImageFile`、轉成 PNG、寫入 `chara` metadata、再解析回角色卡。

### Results

- `assets/app.js` 語法檢查通過。
- 匯出區新增「上傳封面圖片」按鈕。
- 封面圖片 roundtrip 通過：
  - imageName：`cover.jpg`
  - parsedName：`Cover Upload Roundtrip`
  - parsedSpec：`chara_card_v3`
  - entries：`1`
- runtime errors 為 0。

### Not Verified Yet

- 尚未用使用者提供的真實圖片做人工操作測試。

## 26/06/10 11:18

### Commands Run

- `node --check 'assets/app.js'`
- 搜尋確認 `startWorkflow`、`data-workflow`、`拆出角色卡 JSON`、`依注意力分佈重排世界書`、`createCharacterOnlyCard` 已寫入。
- 使用 Chrome headless + DevTools Protocol 開啟 `index.html`。
- Smoke test：
  - 首頁確認有「開始全新製作」與「開始修卡」。
  - 點擊「開始全新製作」後，確認 workflow 為 `new`、step 為 `character`、角色卡為空白模板、世界書 entries 為 1。
  - 進入匯出區確認拆出角色卡與拆出世界書按鈕存在。
  - 點擊「開始修卡」後，確認 workflow 為 `repair`、step 為 `character`，且提示使用者上傳既有角色卡。
  - 合併後檢查 `createCharacterOnlyCard()` 的世界書 entries 為 0，拆出的世界書 entries 為 1。
- 搜尋確認世界書 prompt 已包含 U 形分佈、D0、D1、insertion_order 等注意力擺放原則。
- 產生新首頁截圖：
  - `verification/workflow-desktop.png`
  - `verification/workflow-mobile.png`

### Results

- `assets/app.js` 語法檢查通過。
- 雙工作流 smoke test 通過。
- 修卡拆分資料檢查通過：
  - characterOnlyEntries：`0`
  - worldEntries：`1`
- 雙工作流首頁桌機與手機截圖無明顯重疊或跑版。
- runtime errors 為 0。

### Not Verified Yet

- 尚未用真實角色卡人工測試完整修卡流程。
- 尚未把拆出的 JSON 交給 AI 實際修正再回填。

## 26/06/10 11:21

### Commands Run

- 確認 `lab icon.png` 存在。
- 使用 Chrome headless + DevTools Protocol 開啟 `index.html`。
- 檢查品牌文字、品牌 icon src、footer credit。
- 產生截圖：`verification/brand-footer.png`。

### Results

- 品牌文字為：`酒館角色卡製卡工坊 BY MINI`。
- 品牌 icon 來源為：`lab icon.png`。
- footer 已包含 `Minijinai75/stpreset-viewer` 連結與 `Made with care by Minijinai75` credit。
- runtime errors 為 0。

### Not Verified Yet

- 尚未由使用者人工確認品牌圖示尺寸與換行是否符合偏好。

## 26/06/10 11:25

### Commands Run

- 搜尋 `index.html`、`TASK_LOG.md`、`VERIFY.md` 內的 footer / credit 文字。
- 更新 `index.html` footer 為專案版權說明。

### Results

- footer 已改為：`Original toolbox credit: Made with care by Minijinai75 · © 2026 SillyTavern 酒館角色卡快速製作工作坊，本工具非官方工具。僅協助玩家預覽、編輯與安全製作成 SillyTavern角色卡。`
- 已移除照搬的「SillyTavern 繁中轉換工具箱」footer 說明。

### Not Verified Yet

- 尚未重新截圖。

## 26/06/10 11:26

### Commands Run

- 使用 Chrome headless + DevTools Protocol 開啟 `index.html`。
- 檢查 `.footer-credit p` 行數與文字。
- 產生截圖：`verification/footer-lines.png`。

### Results

- footer credit 已拆成 4 行：
  - `Original toolbox credit: Made with care by Minijinai75`
  - `© 2026 SillyTavern 酒館角色卡快速製作工作坊`
  - `本工具非官方工具。`
  - `僅協助玩家預覽、編輯與安全製作成 SillyTavern 角色卡。`
- runtime errors 為 0。

### Not Verified Yet

- 尚未由使用者人工確認 footer 最終視覺。

## 26/06/10 11:27

### Commands Run

- 搜尋 `index.html`、`TASK_LOG.md`、`VERIFY.md` 內的 `頁面風格參考`、`stpreset-viewer`、`Original toolbox credit`。
- 移除 `index.html` 前台 footer 的 `頁面風格參考` 連結。

### Results

- 前台 footer 不再顯示「頁面風格參考 Minijinai75/stpreset-viewer」。
- `AGENTS.md` 已記錄：`Minijinai75/stpreset-viewer` 是內部設計參考，不要在前台 UI 揭露。

### Not Verified Yet

- 尚未重新截圖。

## 26/06/10 11:39

### Commands Run

- `Get-Date -Format 'yy/MM/dd HH:mm'`
- `node --check 'H:\我的雲端硬碟\【0】AI WORK\MINI AGENTS HOME\05_Project\角色卡工坊\assets\app.js'`
- 使用 `mcp__node_repl.js` 載入 `assets/app.js`（移除 `init();` 後於 VM 執行），驗證：
  - `normalizeWorldBook()` 可讀取 `entries` 為物件索引格式的世界書。
  - `normalizeCard()` 可保留角色卡內嵌 `character_book` 的物件型 entries。
- `Select-String` 確認 `getWorldBookEntries`、`normalizeWorldBook` 接線，以及三個 file input 的 `event.target.value = ""` 已寫入。

### Results

- 已確認台灣時間：`26/06/10 11:39`。
- `assets/app.js` 語法檢查通過。
- 物件型世界書正規化驗證通過：
  - `worldbookEntryCount`：`2`
  - `worldbookIds`：`[2, 10]`
- 角色卡內嵌世界書正規化驗證通過：
  - `cardEntryCount`：`1`
  - `cardEntryId`：`5`
  - `cardEntryKeys`：`["hero"]`
- 已確認修補位置存在：
  - `normalized.data.character_book = normalizeWorldBook(...)`
  - `function getWorldBookEntries(entries)`
  - 三個 hidden file input 的 `event.target.value = ""`

### Not Verified Yet

- 尚未用使用者那份真實拆分世界書在瀏覽器手動點選上傳驗證。
- 尚未重新產生本次 bugfix 專用截圖。

## 26/06/10 14:26

### Commands Run

- `Get-Date -Format 'yy/MM/dd HH:mm'`
- `node --check 'H:\我的雲端硬碟\【0】AI WORK\MINI AGENTS HOME\05_Project\角色卡工坊\assets\app.js'`
- 使用 `mcp__node_repl.js` 載入 `assets/app.js`（移除 `init();` 後於 VM 執行），驗證 `renderCharacterFields()`：
  - 欄位順序為 `角色描述 -> 個性摘要 -> 場景設想 -> 對話範例 -> 首則訊息 -> 額外問候語`
  - 已包含欄位說明文字
  - 已包含 `+ 追加填寫`
  - 已輸出 `問候語 1`、`問候語 2`
  - 已輸出 `data-alt-greeting="0"`、`data-alt-greeting="1"`
- `rg -n` 搜尋 `data-alt-greeting`、`addAlternateGreeting`、`removeAlternateGreeting`、`resetAlternateGreetingDrafts`、`field-help`、`alt-greeting`

### Results

- 已確認台灣時間：`26/06/10 14:26`。
- `assets/app.js` 語法檢查通過。
- 角色卡欄位文案與順序驗證通過。
- `alternate_greetings` 多格輸入 UI 接線已存在：
  - 逐格 textarea：存在
  - 新增按鈕：存在
  - 刪除按鈕：存在
- `assets/app.css` 已有欄位說明與問候語多格樣式。

### Not Verified Yet

- 尚未由使用者在實際瀏覽器中手動確認新欄位排版。
- 尚未重新產生這次角色卡欄位調整的專用截圖。










