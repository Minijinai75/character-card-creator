# Project Status

本次更新時間：26/06/18 01:48

## Current Phase

靜態前端 MVP 已完成，加上手機優先 UI 重構、製卡知識整合（MVU Kit＋注意力分佈）、排版優化。已初始化 git repo。尚未部署、尚未用真實卡片做完整人工測試。

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

## 26/06/18 新增

- 手機優先 UI 重構：底部分頁列、44px 觸控目標、Inspector 收合、世界書手風琴、Toast 通知、iOS 安全區
- 製卡知識整合：使用說明頁加入核心原則＋世界書擺放要點、角色卡欄位引導升級
- 世界書條目表單升級：constant/at_depth/depth 欄位、token 估算顯示
- 驗證警告升級：常駐上限、token 長度、keys 不足、D2+ 警告
- AI Skill 新增：個性調色盤設計、去八股檢查、條目配置推薦
- 素材轉角色卡 prompt 升級：融入差異化外貌＋調色盤＋白描原則
- 排版全面優化：workflow-card、tips-card 視覺層級、間距加大、字型層級、元件打磨

## Next Step

- 用真實角色卡（JSON＋PNG）做完整人工測試
- 用手機實機測試手機版 UI
- 決定部署方案（GitHub Pages / Zeabur / 其他）
- 建立 GitHub repo

## Blockers

- 尚未部署
- 尚未用真實卡片做人工測試
- 尚未用手機實機測試

## Notes

目前資料夾位於 Google Drive 同步路徑。靜態檔案無需 build。










