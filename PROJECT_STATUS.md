# Project Status

本次更新時間：26-07-10 16:13

## Current Phase

**已部署上線**：https://minijinai75.github.io/character-card-creator/（GitHub Pages，main=master 分支自動部署）。ccv3 幽靈 bug 已修（待 push 部署）。本機 repo 已收編 GitHub 遠端歷史並設好 origin，之後改動走正常 commit→push 流程即可部署。

## Completed

- 已建立專案資料夾：`05_Project/角色卡工坊`
- 已建立產品規劃：`PLAN.md`
- 已確認專案名稱：酒館角色卡製卡工坊
- 已確認技術方向：靜態前端
- 已確認第一版支援 PNG 角色卡
- 已確認左側步驟：使用說明、角色卡、世界書、合併、匯出
- 已確認範例庫只放三個空白模板
- 已建立 continuity 文件：
  - `README.md`
  - `AGENTS.md`
  - `PROJECT_WORKFLOW.md`
  - `PROJECT_STATUS.md`
  - `DECISIONS.md`
  - `TASK_LOG.md`
  - `VERIFY.md`
- 已建立靜態前端檔案：
  - `index.html`
  - `assets/app.css`
  - `assets/app.js`
- 已建立三個模板：
  - `templates/character_blank.json`
  - `templates/worldbook_blank.json`
  - `templates/card_with_worldbook_blank.json`
- 已實作角色卡 JSON 匯入、PNG metadata 讀取、世界書 JSON 匯入、角色卡/世界書編輯、AI Skill prompt 複製、合併策略、JSON 匯出、PNG 匯出。
- 已實作匯出區上傳普通圖片作為封面，並轉成可匯入 SillyTavern 的 PNG 角色卡。
- 已改成兩個工作流入口：
  - 全新製作：直接準備角色卡與世界書空白模板。
  - 修卡：引導匯入既有角色卡，支援手動修正或拆 JSON 給 AI。
- 已加入修卡拆分匯出：
  - 拆出角色卡 JSON
  - 拆出世界書 JSON
- 已將世界書 Skill 融合 `世界書擺放與注意力分佈.md` 的 U 形注意力與擺放策略。
- 已完成 Chrome headless smoke test，包含桌機/手機截圖與 PNG roundtrip。
- 已修正世界書匯入正規化：
  - 支援 `entries` 為陣列格式。
  - 支援 `entries` 為物件索引格式。
  - 角色卡內嵌 `character_book` 匯入時不會再把物件格式 entries 清空。
- 已修正檔案 input 重選同一檔案時不觸發後續匯入的風險，現在每次 change 後都會清空 input value。
- 已調整角色卡欄位排版與命名：
  - `description` -> `角色描述`
  - `personality` -> `個性摘要`
  - `scenario` -> `場景設想`
  - `mes_example` -> `對話範例`
  - `first_mes` -> `首則訊息`
  - `alternate_greetings` -> `額外問候語`
- 已將 `對話範例` 排到 `首則訊息` 前面。
- 已將 `alternate_greetings` 改成可逐格新增 / 刪除的編輯方式，不再使用 `---` 分隔單一 textarea。

## 26/06/18 01:48 新增

- 手機優先 UI 重構：底部分頁列、44px 觸控目標、Inspector 收合、世界書手風琴、Toast 通知、iOS 安全區
- 製卡知識整合（MVU Kit＋注意力分佈，排除變量系統）
- 世界書條目表單升級：狀態三態選擇、at_depth/depth 欄位、token 估算
- 驗證警告升級：常駐上限、token 長度、關鍵字不足、深度 2+ 警告
- AI Skill 新增：個性調色盤設計、去八股檢查、條目配置推薦
- 排版全面優化：workflow-card、tips-card、間距加大、字型層級

## 26/06/18 02:43 新增

- 匯出頁 UI 重構：PNG 一組、JSON 一組、拆分一組，按操作邏輯分區
- 全站中文化：所有面向用戶的英文改中文（label、badge、驗證訊息、prompt 標題）
- 世界書條目重構：constant+enabled 合併為「狀態」三態、配置欄 4 欄 grid、標題允許換行
- AI Skill 改為可收合分頁：預設收合，主欄位拿回全寬
- Skill 卡片改緊湊清單列
- 複製按鈕回饋：點擊後顯示「已複製 ✓」1.5 秒
- 長文字溢出防護：card-summary、stat、warning、panel、message
- localStorage 自動存檔：防手機意外關頁遺失編輯，重開自動恢復
- token 估算改中文權重（中文字 ×1.5、英文字 ×0.25）
- 建立獨立 GitHub repo：Minijinai75/character-card-creator

## 26-07-10 16:13 新增

- 收編 GitHub 遠端歷史：本機 repo 原本無 remote、與 GitHub 各自為政（部署靠手動上傳）；已快照本機工作區→加 origin→merge 遠端（程式碼實質相同，文件以本機較新版為準，驗證截圖自遠端入庫）。備份分支 `backup-local-history` 保留舊本機歷史
- **修 ccv3 幽靈 bug**（Mini 回報「下載 PNG 無法匯入酒館」查案時揪出）：`insertCardIntoPng` 原本只清舊 `chara` 塊、不清 `ccv3`——SillyTavern 讀取時 ccv3 優先，封面若用「曾是角色卡的 PNG」會讓舊卡資料還魂（壞 ccv3 則直接匯入失敗）。修法：寫入端 chara/ccv3 都清都寫（與 ST 官方 write 行為一致）、讀取端 ccv3 優先（與 ST read 順序一致）
- 修復驗證：工坊函式原碼抽進 node＋ST 官方解析器全鏈重現——舊卡圖封面/乾淨封面兩場景，產物均為 chara×1＋ccv3×1、ST 讀到新卡、工坊自重讀正確（證據見 VERIFY.md）

## Next Step

- push origin master → GitHub Pages 自動部署 ccv3 修復
- Mini 用部署版重測：上傳 JSON＋封面圖→下載 PNG→匯入酒館（若仍失敗，把失敗的 PNG 給霽野驗屍塊結構）
- 用手機實機測試

## Blockers

- 無
- 尚未用真實卡片做人工測試

## Notes

- 原始碼在 Google Drive 同步路徑，靜態檔案無需 build
- 獨立 repo：https://github.com/Minijinai75/character-card-creator
- 也放在 ST-LESSON repo 的 tools/角色卡工坊/










