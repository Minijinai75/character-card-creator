# 酒館角色卡製卡工坊

本次更新時間：26/06/18 01:48

協助沒有 IDE 的創作者製作 SillyTavern 角色卡與世界書的靜態前端工具。瀏覽器本機處理，不上傳任何資料。

## 功能

- 匯入 JSON / PNG 角色卡、世界書 JSON
- 兩種工作流：全新製作、修卡
- 角色卡與世界書欄位編輯
- AI Skill prompt 複製（角色卡 7 個、世界書 6 個）
- 世界書合併策略（取代、追加、去重）
- JSON / PNG 匯出、拆出角色卡 / 世界書 JSON
- 格式驗證與智慧警告

## 手機優先設計

- 底部分頁導覽列（固定 5 分頁）
- 44px 觸控目標、iOS 防縮放
- Inspector 可收合、世界書條目手風琴
- Toast 訊息通知、iPhone 安全區適配

## 製卡知識整合

融合 MVU 製卡 Kit 與世界書擺放知識（排除變量系統）：

- **個性調色盤**：底色＋主色＋點綴結構
- **外貌差異化**：只寫偏離 AI 預設的特徵
- **去八股**：避免模糊詞、壞比喻、微表情模板
- **U 形注意力分佈**：世界書擺放策略
- **常駐/觸發策略**：constant 上限、keys 最低數量

## 檔案結構

```
index.html          主頁面
assets/app.css      樣式
assets/app.js       全部邏輯
templates/          三個空白模板（角色卡、世界書、合併）
verification/       smoke test 截圖
```

## Continuity

| 檔案 | 用途 |
|------|------|
| `PROJECT_STATUS.md` | 目前狀態 |
| `TASK_LOG.md` | 任務紀錄 |
| `DECISIONS.md` | 決策紀錄 |
| `VERIFY.md` | 驗證紀錄 |
| `PLAN.md` | 產品規劃 |
| `AGENTS.md` | 工作規則 |

## 限制

此專案位於 Google Drive 同步資料夾。若需 install/build/test，先複製到 `C:\Users\Miyabi\dev\...`。










