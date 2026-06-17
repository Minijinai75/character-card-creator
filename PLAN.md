# Plan

本次更新時間：26/06/10 11:18

建立一個協助沒有 IDE 的創作者製作 SillyTavern 角色卡與世界書的靜態前端網站。網站第一版聚焦於本機處理、範例模板、AI 指令產生、JSON/PNG 角色卡匯入、格式驗證、角色卡與世界書合併，設計風格參考 `Minijinai75/stpreset-viewer` 的淡色工具箱語氣。

## Project Type

- 判定：long-running project
- 理由：此專案包含多頁工具、JSON schema 處理、AI prompt/skill 設計、檔案匯入匯出、格式驗證與未來部署，預期會跨多個 session 與多個階段。
- 本次範圍：先建立專案資料夾與 `PLAN.md`，不初始化 Trellis，不建立完整 continuity scaffolding。
- 後續建議：開始實作前，補上 `AGENTS.md`、`PROJECT_WORKFLOW.md`、`PROJECT_STATUS.md`、`DECISIONS.md`、`TASK_LOG.md`、`VERIFY.md`；若確認多階段長期維護，再考慮啟用 Trellis。

## Decisions

- 網站正式名稱：酒館角色卡製卡工坊
- 技術方向：只做靜態前端，不做後端與帳號系統。
- 角色卡支援：第一版就支援 PNG 角色卡。
- 左側步驟導覽固定為：使用說明、角色卡、世界書、合併、匯出。
- AI Skill 不做獨立頁，放在角色卡與世界書各自區塊內。
- 範例庫只放三個能穩定維護的模板：角色卡空白模板、世界書空白模板、角色卡 + 世界書合併模板。
- 網站工作流分成兩條：全新製作與修卡。
- 修卡工作流需支援拆出角色卡 JSON 與世界書 JSON，方便交給 AI 協助修正。

## Product Goal

讓創作者能把人物設定、世界觀筆記、劇情素材與既有 JSON，透過範例與可複製 AI 指令，轉成可匯入 SillyTavern 的角色卡 JSON 與世界書 JSON，並在瀏覽器本機完成驗證、修正、合併與匯出。

## Target Users

- 沒有 IDE 或不熟 JSON 的角色卡創作者。
- 熟悉 GPT / Gemini，但不熟 SillyTavern JSON 結構的創作者。
- 需要整理世界書、拆 entries、合併角色卡與世界書的進階使用者。
- 想檢查他人角色卡格式、預覽世界書與安全匯出的玩家。

## Scope

- In:
  - 建立角色卡與世界書製作工作台。
  - 提供角色卡、世界書、合併卡的空白範例 JSON。
  - 提供類似 skill 的 AI prompt 複製按鈕。
  - 支援角色卡 JSON / PNG 與世界書 JSON 匯入、預覽、驗證、合併、匯出。
  - 優先支援 `chara_card_v3` / `spec_version: 3.0`。
  - 全部檔案在瀏覽器本機處理，不上傳。

- Out:
  - 第一版不直接串接 GPT / Gemini API。
  - 第一版不做帳號系統、雲端儲存、作品 marketplace。
  - 第一版不提供 MVU、劇情向、群像卡等進階範例模板，這些不是單靠空白格式就能簡單製作的內容。
  - 第一版不自動改寫 NSFW 或敏感內容，只做格式層面的檢查與提示。

## Reference Style

參考 `Minijinai75/stpreset-viewer`：

- 淡色工具箱視覺。
- 柔和藍、薰衣草紫、薄荷綠、奶白底。
- Sticky 導覽與膠囊按鈕。
- 卡片式面板，但避免過度裝飾。
- 明確標示「本機處理，不上傳」。
- 以創作者友善語言替代工程術語。

新網站應比原工具更偏「創作者製卡工作台」，不是單純 JSON viewer。

## Core Data Model

主要角色卡格式：

```json
{
  "spec": "chara_card_v3",
  "spec_version": "3.0",
  "data": {
    "name": "",
    "description": "",
    "personality": "",
    "scenario": "",
    "first_mes": "",
    "mes_example": "",
    "creator_notes": "",
    "system_prompt": "",
    "post_history_instructions": "",
    "alternate_greetings": [],
    "extensions": {},
    "character_book": {
      "name": "",
      "entries": []
    }
  }
}
```

世界書 entry 應優先支援：

```json
{
  "id": 0,
  "keys": [],
  "secondary_keys": [],
  "comment": "",
  "content": "",
  "constant": false,
  "selective": true,
  "enabled": true,
  "position": "before_char",
  "insertion_order": 90,
  "use_regex": false,
  "extensions": {
    "position": 0,
    "depth": 4,
    "probability": 100,
    "useProbability": true,
    "role": 0,
    "sticky": 0,
    "cooldown": 0
  }
}
```

## App Structure

### 1. 使用說明

第一畫面直接進入可操作流程，不做純 landing page。使用說明只保留必要內容，幫創作者理解整體流程：

- 左側：步驟導覽
  - 使用說明
  - 角色卡
  - 世界書
  - 合併
  - 匯出
- 中間：目前步驟的表單或預覽。
- 右側：格式檢查、警告、token 估算、下一步。

使用說明區要先提供兩個工作流入口：

- 全新製作：直接準備角色卡空白模板與世界書空白模板。
- 修卡：引導匯入既有 JSON / PNG 角色卡，允許手動修正，或拆成角色卡 JSON 與世界書 JSON 給 AI 協助修。

### 2. 角色卡

角色卡區塊負責角色主體資料，不另開 AI Skill 頁。

- 匯入角色卡 JSON。
- 匯入 PNG 角色卡。
- 載入角色卡空白模板。
- 預覽與編輯 `name`、`description`、`personality`、`scenario`、`first_mes`、`mes_example`、`alternate_greetings`。
- 檢查頂層欄位與 `data.*` 欄位是否一致。
- 內建角色卡相關 AI Skill prompt：
  - 素材轉角色卡 JSON。
  - 補完角色卡缺欄。
  - 檢查角色一致性。
  - 將長篇設定拆成 `description`、`scenario`、`first_mes`、`alternate_greetings`。
  - 修復角色卡 JSON 格式。

全新製作工作流中，進入角色卡區應直接看到空白模板。
修卡工作流中，角色卡區應引導使用者匯入既有卡，並說明可直接手動修正或拆 JSON 給 AI。

### 3. 世界書

世界書區塊負責 `character_book.entries` 與獨立世界書 JSON，不另開 AI Skill 頁。

每個按鈕產生一段可複製給 GPT / Gemini 的 prompt。

- 匯入世界書 JSON。
- 載入世界書空白模板。
- 預覽與編輯 entries。
- 搜尋 comment、keys、content。
- 編輯 keys、secondary_keys、content、position、depth、sticky、cooldown、probability。
- 支援啟用、停用、constant、selective。
- 支援排序與 id 重排。
- 內建世界書相關 AI Skill prompt：
- 素材轉世界書 JSON。
- 世界觀筆記拆成 entries。
  - 修復世界書 JSON 格式。
  - 檢查 entries 是否太長、太碎或 key 不足。

世界書 AI Skill 需融合 `世界書擺放與注意力分佈.md` 的原則：

- 長上下文注意力常接近 U 形分佈。
- 重要內容應優先吃到提示詞兩端，中段只放可退讓內容。
- 世界概況、核心規則、長期不變設定放角色定義之前。
- D1 放承接最近對話末尾的關鍵補充。
- D0 放最怕模型漏掉的格式要求、硬規則、行為限制。
- 不要把所有重要內容都塞進 D0。
- 避免大量 D2 以上。
- insertion_order 要分層留空間，不要全部卡在 100 附近。

### 4. 合併

- 上傳角色卡 JSON 或 PNG。
- 上傳世界書 JSON。
- 載入角色卡 + 世界書合併模板。
- 選擇合併策略：
  - 取代原本 `data.character_book`。
  - 追加 entries。
  - 依 comment / id 去重。
  - 保留 disabled entries。
  - 自動重排 id / display_index。
- 匯出完整角色卡 JSON。

### 5. 匯出

- 匯出完整角色卡 JSON。
- 上傳普通圖片作為封面，轉成可匯入 SillyTavern 的 PNG 角色卡。
- 匯出 PNG 角色卡。
- 拆出角色卡 JSON，不含世界書 entries。
- 拆出世界書 JSON，供 AI 協助修正或重排。
- 複製 JSON 到剪貼簿。
- 顯示最後檢查結果。
- 顯示本機處理提醒。

## Template Library

範例庫只放可穩定維護且能被創作者直接使用的空白模板：

- 角色卡空白模板。
- 世界書空白模板。
- 角色卡 + 世界書合併模板。

不放 MVU、劇情向、群像卡、世界觀拆條等進階範例，因為這些不是單靠固定模板就能簡單製作的內容，容易誤導創作者。

## MVP Action Items

[ ] 建立專案 repo 或確認是否沿用現有 workspace。

[ ] 建立前端架構，採用單頁靜態工具，避免後端與帳號系統。

[ ] 建立 `templates/`，放入角色卡、世界書、合併角色卡範例 JSON。

[ ] 實作本機 JSON / PNG 匯入，支援拖放與檔案選擇。

[ ] 實作角色卡解析，支援 `chara_card_v3`、PNG 角色卡與 `data.character_book.entries`。

[ ] 實作世界書解析與 entries 預覽。

[ ] 實作角色卡與世界書區塊內的 AI Skill prompt 產生器，所有 prompt 可一鍵複製。

[ ] 實作角色卡與世界書合併器，支援取代、追加、去重、id 重排。

[ ] 實作格式驗證與風險提示，包含缺欄、鏡像不一致、entries 欄位異常。

[ ] 實作匯出 JSON 與 PNG 角色卡，保留未知欄位與原始結構。

[ ] 實作匯出區上傳普通封面圖片，將目前角色卡 JSON 寫入圖片並轉成 PNG 角色卡。

[ ] 實作雙工作流入口：全新製作與修卡。

[ ] 實作修卡拆分：拆出角色卡 JSON 與世界書 JSON。

[ ] 將世界書 AI Skill 融合注意力分佈與擺放策略。

[ ] 驗證上傳範例角色卡、PNG 角色卡、獨立世界書、合併後角色卡都可被解析與匯出。

## Phase 2 Ideas

[ ] 加入 token 估算與世界書觸發成本提示。

[ ] 加入 OpenCC 簡繁轉換與台灣用語詞庫。

[ ] 加入 AI API 模式，但需支援使用者自備 key。

[ ] 加入本機草稿儲存。

[ ] 加入世界書 entries 批次拆條助手。

[ ] 加入 prompt pack / skill pack 匯入匯出。

## Validation Plan

- 使用空白角色卡模板測試匯入、預覽、匯出。
- 使用 PNG 角色卡測試匯入、解析、匯出。
- 使用既有角色卡 JSON 測試 `data.character_book.entries` 是否保留。
- 使用獨立世界書 JSON 測試合併策略。
- 檢查匯出 JSON 是否可被 `JSON.parse` 正常解析。
- 檢查頂層欄位與 `data.*` 欄位是否同步。
- 檢查未知欄位是否未被刪除。
- 檢查所有檔案處理是否只在瀏覽器本機完成。

## Risks

- 不同創作者的角色卡 JSON 變體很多，不能只依賴單一範例。
- SillyTavern 世界書 entry 欄位有多版本差異，需要保留未知欄位。
- AI 生成 JSON 容易出現註解、尾逗號、Markdown code fence，需要設計修復提示。
- 非工程使用者看到錯誤訊息會卡住，錯誤提示要轉成可操作語言。
- 如果專案放在 Google Drive，後續避免在此路徑跑 heavy install/build/test；需要複製到 `C:\Users\Miyabi\dev\...` 再做重型驗證。

## Open Questions

- 暫無。26/06/10 02:56 已確認：名稱為「酒館角色卡製卡工坊」、只做靜態前端、第一版支援 PNG 角色卡。











