# Project Workflow

本次更新時間：26/06/10 03:01

本專案採用輕量 continuity workflow。目標是讓每次接手時都能知道目前決策、狀態、下一步與驗證缺口。

## Before Work

1. 讀取 `README.md`。
2. 讀取 `PLAN.md`，確認產品範圍。
3. 讀取 `PROJECT_STATUS.md`，確認目前階段、下一步與 blockers。
4. 讀取 `DECISIONS.md`，避免重複討論已決定事項。
5. 若要修改文件，先確認台灣時間。
6. 若要開始寫 HTML，先確認是否建立新 repo 或沿用目前資料夾。

## During Work

- 優先做最小可用版本，不增加未要求的進階功能。
- 每次只處理一個清楚階段：文件、模板、UI 骨架、JSON 匯入、PNG 支援、世界書、合併、匯出、驗證。
- 對資料格式保持保守：保留未知欄位，避免自動刪除或重排使用者內容。
- 對使用者內容保持本機處理，不做上傳。
- 若專案仍在 Google Drive，同步資料夾內不要跑 heavy install/build/test。

## After Work

每次工作結束前更新：

- `PROJECT_STATUS.md`：目前階段、完成項目、下一步、blockers。
- `TASK_LOG.md`：本次做了什麼、改了哪些檔案。
- `DECISIONS.md`：新增或變更任何產品/技術決策。
- `VERIFY.md`：執行過的驗證、結果、未驗證項。

## Phase Order

1. 專案文件與 repo 決策。
2. 靜態前端骨架。
3. 三個空白模板。
4. JSON 角色卡匯入與預覽。
5. PNG 角色卡匯入解析。
6. 世界書匯入與 entries 預覽。
7. AI Skill prompt 複製按鈕。
8. 合併策略。
9. JSON / PNG 匯出。
10. 瀏覽器驗證與修正。

## Done Definition

MVP 完成需符合：

- 使用者能載入角色卡 JSON。
- 使用者能載入 PNG 角色卡。
- 使用者能載入世界書 JSON。
- 使用者能使用三個空白模板。
- 使用者能複製角色卡與世界書 AI Skill prompt。
- 使用者能合併角色卡與世界書。
- 使用者能匯出 JSON 與 PNG。
- 匯出 JSON 可被 `JSON.parse` 正常解析。
- 文件與驗證紀錄已更新。










