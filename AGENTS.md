# AGENTS.md

本次更新時間：26/06/10 11:18

本文件定義「酒館角色卡製卡工坊」的專案內工作規則。任何後續 AI agent 或人工接手者，請先閱讀 `README.md`、`PLAN.md`、`PROJECT_STATUS.md`、`DECISIONS.md`、`VERIFY.md`。

## Project Rules

- 專案類型：long-running project。
- 技術方向：靜態前端網站，不做後端、不做帳號系統、不串接雲端儲存。
- 主要使用者：沒有 IDE、不熟 JSON，但能使用 GPT / Gemini 的 SillyTavern 角色卡創作者。
- 第一版必須支援 JSON 角色卡、PNG 角色卡、世界書 JSON、角色卡與世界書合併、匯出 JSON / PNG。
- 網站需維持兩個工作流：全新製作、修卡。
- 全新製作工作流應直接準備角色卡空白模板與世界書空白模板。
- 修卡工作流應支援匯入既有角色卡、手動修正、拆出角色卡 JSON、拆出世界書 JSON。
- 所有檔案處理預設只在瀏覽器本機完成，不上傳。
- AI Skill 是可複製 prompt，不是直接呼叫 AI API。
- 角色卡相關 AI Skill 放在角色卡區塊內；世界書相關 AI Skill 放在世界書區塊內。
- 左側步驟導覽固定為：使用說明、角色卡、世界書、合併、匯出。
- 範例庫只放三個模板：角色卡空白模板、世界書空白模板、角色卡 + 世界書合併模板。
- `Minijinai75/stpreset-viewer` 是內部設計參考，不要在前台 UI 顯示「頁面風格參考」之類的製作資訊。

## Implementation Rules

- 開始寫 HTML 前，先確認是否要開新 repo 或沿用目前資料夾。
- 若要跑 `install`、`build`、`test` 等重型步驟，請先複製到 `C:\Users\Miyabi\dev\...` 之類非雲端同步路徑。
- 優先採用簡單靜態前端架構，除非後續有明確理由，不引入複雜框架。
- 保留未知 JSON 欄位，不要因表單化編輯刪掉創作者原本的欄位。
- 修改角色卡欄位時，要留意頂層欄位與 `data.*` 鏡像同步。
- 世界書 entries 必須保留常見 SillyTavern 欄位與 `extensions` 內未知欄位。
- 錯誤訊息要用創作者能理解的語言，不只顯示技術錯誤。

## Documentation Rules

- 更新任何專案文件前，先確認台灣時間，格式使用 `YY-MM-DD HH:MM`。
- 每次工作結束前，視情況更新：
  - `PROJECT_STATUS.md`
  - `TASK_LOG.md`
  - `DECISIONS.md`
  - `VERIFY.md`
- 如果上述文件沒有更新，不要把任務描述成已完整 handoff。

## Reference

- 設計風格參考：`Minijinai75/stpreset-viewer`
- 核心產品規劃：`PLAN.md`










