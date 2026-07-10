const templates = {
  character: {
    name: "未命名角色",
    description: "",
    personality: "",
    scenario: "",
    first_mes: "",
    mes_example: "",
    creatorcomment: "",
    avatar: "none",
    talkativeness: "0.5",
    fav: false,
    tags: [],
    spec: "chara_card_v3",
    spec_version: "3.0",
    data: {
      name: "未命名角色",
      description: "",
      personality: "",
      scenario: "",
      first_mes: "",
      mes_example: "",
      creator_notes: "",
      system_prompt: "",
      post_history_instructions: "",
      alternate_greetings: [],
      tags: [],
      creator: "",
      character_version: "1.0",
      extensions: {
        talkativeness: "0.5",
        fav: false,
        world: "",
        depth_prompt: {
          prompt: "",
          depth: 4,
          role: "system"
        }
      },
      character_book: {
        name: "",
        entries: []
      }
    },
    create_date: new Date().toISOString()
  },
  worldbook: {
    name: "未命名世界書",
    entries: [
      {
        id: 0,
        keys: ["關鍵詞"],
        secondary_keys: [],
        comment: "範例條目",
        content: "在這裡寫入世界觀、地點、關係、規則或設定。",
        constant: false,
        selective: true,
        enabled: true,
        position: "before_char",
        insertion_order: 90,
        use_regex: false,
        extensions: {
          position: 0,
          depth: 4,
          probability: 100,
          useProbability: true,
          role: 0,
          sticky: 0,
          cooldown: 0,
          display_index: 0
        }
      }
    ]
  }
};

templates.combined = (() => {
  const card = structuredCloneSafe(templates.character);
  card.name = "未命名角色";
  card.data.name = "未命名角色";
  card.data.character_book = structuredCloneSafe(templates.worldbook);
  card.data.character_book.name = "未命名角色世界書";
  return card;
})();

const state = {
  step: "guide",
  workflow: "",
  card: null,
  worldbook: null,
  altGreetingDraftCount: 0,
  cardFileName: "",
  worldFileName: "",
  sourcePngBytes: null,
  sourcePngUrl: "",
  exportImageName: "",
  mergeStrategy: "replace",
  warnings: []
};

const stepTitles = {
  guide: "使用說明",
  character: "角色卡",
  worldbook: "世界書",
  merge: "合併",
  export: "匯出"
};

const nextSteps = {
  guide: "先選擇全新製作或修卡。全新製作會直接打開空白模板；修卡會引導匯入既有角色卡。",
  character: "全新製作可直接填寫或複製 AI Skill；修卡可手動調整，或到匯出區拆成 JSON 給 AI 協助。",
  worldbook: "全新製作可直接填條目或複製世界書 Skill；修卡可檢查既有條目後再合併。",
  merge: "合併完成後，到匯出區下載 JSON 或 PNG 角色卡。",
  export: "匯出前先看檢查狀態；若有警告，回到對應區塊修正。"
};

const characterPrompts = [
  {
    title: "素材轉角色卡 JSON",
    desc: "依調色盤原則，把人物素材整理成 chara_card_v3 角色卡。",
    prompt: `你是 SillyTavern 角色卡製作助手。請把我提供的人物素材轉成 chara_card_v3 / spec_version 3.0 的 JSON。

格式要求：
1. 只輸出合法 JSON，不要 Markdown code fence。
2. 頂層 name、description、personality、scenario、first_mes、mes_example 必須和 data 內同名欄位一致。
3. data.system_prompt 與 data.post_history_instructions 預設留空。
4. data.alternate_greetings 使用陣列。

寫作品質要求：
5. description 放角色定義主體：外貌只寫偏離 AI 預設的特徵（日本人不用寫黑髮黑眼，白髮才要寫）；背景只放影響當前性格的關鍵事件。
6. personality 用個性調色盤結構：底色（最深層永遠存在的個性）＋主色調（日常最明顯 1-2 種）＋點綴（隱藏/壓抑的個性），各附 2-4 個具體衍生行為場景，不要只寫抽象標籤。
7. first_mes 用白描手法，避免八股（禁用：似乎、彷彿、嘴角上揚、心湖漣漪等模糊詞和微表情模板）。
8. 在 mes_example 或 personality 衍生中提供角色的具體台詞範本。
9. 保留角色語氣、關係、互動限制，不要自行加入素材沒有的大設定。

請依照這個方向產出角色卡 JSON：`
  },
  {
    title: "補完角色卡缺欄",
    desc: "請 AI 依既有角色設定補空白欄位。",
    prompt: `你是 SillyTavern 角色卡格式修補助手。請讀取我提供的角色卡 JSON，補完空白但必要的欄位。

要求：
1. 只輸出修補後的合法 JSON。
2. 不刪除未知欄位。
3. 不改變角色核心設定。
4. 保持頂層欄位與 data.* 鏡像一致。
5. 若資訊不足，使用簡潔中性的描述，不要過度創作。`
  },
  {
    title: "檢查角色一致性",
    desc: "找出設定矛盾、語氣不一致、缺少第一訊息等問題。",
    prompt: `你是角色卡審稿助手。請檢查我提供的 SillyTavern 角色卡 JSON。

請列出：
1. 角色設定是否前後矛盾。
2. description、personality、scenario、first_mes 是否互相支援。
3. 是否有太空泛或難以扮演的描述。
4. 是否缺少使用者互動情境。
5. 只提供修改建議，不要直接重寫整張卡，除非我要求。`
  },
  {
    title: "長篇設定拆欄",
    desc: "把一大段素材拆成 description、scenario、first_mes 等欄位。",
    prompt: `請把我提供的長篇角色素材拆成 SillyTavern 角色卡欄位。

請輸出 JSON 片段，包含：
- name
- description
- personality
- scenario
- first_mes
- mes_example
- alternate_greetings

要求：
1. description 放角色外觀、背景、關係、行為規則。
2. personality 放性格與語氣。
3. scenario 放開局情境。
4. first_mes 寫成可直接開始對話的第一則訊息。
5. alternate_greetings 提供 1 到 3 則備選開場。`
  },
  {
    title: "修復角色卡 JSON",
    desc: "修掉尾逗號、註解、code fence 或格式壞掉的 JSON。",
    prompt: `你是 JSON 格式修復助手。請修復我提供的 SillyTavern 角色卡內容。

要求：
1. 只輸出合法 JSON。
2. 移除 Markdown code fence、註解、尾逗號。
3. 不刪除任何角色內容。
4. 如果有欄位重複，保留資訊較完整者。
5. 修復後必須能被 JSON.parse 解析。`
  },
  {
    title: "個性調色盤設計",
    desc: "用底色＋主色＋點綴結構，把素材轉成立體的個性設計。",
    prompt: `你是角色個性設計助手。請根據我提供的角色素材，設計「個性調色盤」。

調色盤結構：
- 底色：最深層、永遠存在的個性基調（1 個）
- 主色調：日常最明顯的個性表現（1-2 個）
- 點綴：隱藏或壓抑的個性，特定條件才顯現（1-2 個）

每種色調寫 2-4 個「衍生行為」：
1. 衍生必須是具體場景＋具體行為，不是抽象描述。
2. 可以結合看似矛盾的元素（這才是真實的人）。
3. 用行為展示個性，不要用標籤定義。

輸出格式：
個性調色盤：[底色]是底色，[主色]是主色，由多種個性衍生組合而成才是活生生的人
主色調：___、___
底色：___
個性點綴：___

[色調名]衍生一：[具體場景與行為]
[色調名]衍生二：[具體場景與行為]
...

請根據以下素材設計調色盤：`
  },
  {
    title: "去八股檢查",
    desc: "找出模糊詞、壞比喻、微表情模板等八股寫法。",
    prompt: `你是角色卡文字品質審稿助手。請檢查我提供的角色卡內容，找出八股寫法並提出修改建議。

八股定義（應避免）：
1. 模糊詞：似乎、幾乎、彷彿、如同、宛如
2. 壞比喻：像小獸、投石入湖、心湖泛起漣漪
3. 微表情模板：嘴角上揚、眼中閃光、指尖泛白、瞳孔微縮
4. 語氣描述句：帶著xx的口吻、用xx的語氣
5. 極端情緒詞：極度、萬念俱灰、無比深沉
6. 否定反轉過度：不是...而是...連續出現
7. 標籤定義：「她很溫柔」「他很堅強」
8. 無意義形容詞堆疊：精緻的、無暇的、動人的

正確寫法參考：
- 白描（客觀最小限度描寫）
- 行為展示（遞過外套 vs 她很體貼）
- 具體台詞（直接寫對話 vs 描述語氣）

對每個八股用語，指出位置並提供修改建議。不要重寫整張卡。`
  }
];

const worldPrompts = [
  {
    title: "素材轉世界書 JSON",
    desc: "把世界觀素材整理成世界書條目。",
    prompt: `你是 SillyTavern 世界書製作助手。請把我提供的世界觀素材整理成世界書 JSON。

要求：
1. 只輸出合法 JSON，不要 Markdown code fence。
2. 格式為 { "name": "...", "entries": [...] }。
3. 每個 entry 包含 id、keys、secondary_keys、comment、content、constant、selective、enabled、position、insertion_order、use_regex、extensions。
4. keys 放最可能觸發該條目的詞。
5. content 應該清楚、可被模型直接使用，不要過短也不要塞入太多無關內容。

注意力配置原則：
1. 長上下文注意力常接近 U 形分佈，開頭與結尾通常比中段可靠。
2. 不要把所有重要內容都塞到 D0；尾端太長也會互相稀釋。
3. 世界概況、核心規則、長期不變設定優先放角色定義之前，越基礎越重要越往前。
4. 次要補充可放角色定義之後或較深位置，不要讓中段承擔核心規則。
5. 最怕模型遺漏的格式要求、硬規則、行為限制可放 D0；承接最近對話的關鍵補充可放 D1。
6. 規則特別重要且常被忽略時，可同時在角色前開頭與 D0 雙重強調。
7. 盡量避免大量使用 D2 以上，以免打斷上下文連續感。
8. insertion_order 不要全部卡在 100 附近，請用明顯區段保留排序空間。`
  },
  {
    title: "世界觀筆記拆條目",
    desc: "把長篇設定拆成多條可觸發世界書。",
    prompt: `請把我提供的長篇世界觀筆記拆成 SillyTavern 世界書 entries。

拆分原則：
1. 一個 entry 只處理一個人物、地點、組織、規則或關係。
2. 每個 entry 給 2 到 8 個 keys。
3. comment 用簡短標題。
4. content 保留重要細節，避免重複。
5. 如果某條應該永遠注入，constant 設為 true；否則 selective 設為 true。
6. 依注意力分佈安排位置：核心與穩定設定放角色前，次要補充放角色後，最怕漏掉的硬規則放 D0，承接近況的關鍵補充放 D1。
7. 不要把所有重要內容都塞 D0，也不要大量使用 D2 以上。`
  },
  {
    title: "修復世界書 JSON",
    desc: "把 AI 產生的世界書修成可解析 JSON。",
    prompt: `你是 SillyTavern 世界書 JSON 修復助手。請修復我提供的世界書 JSON。

要求：
1. 只輸出合法 JSON。
2. 不刪除 entries 的 content。
3. 若缺少 id，請從 0 開始補上。
4. 若 keys 不是陣列，請轉成字串陣列。
5. 保留 extensions，缺少時補上常見欄位。`
  },
  {
    title: "依注意力分佈重排世界書",
    desc: "依 U 形注意力原則，重排條目的位置與順序。",
    prompt: `請檢查我提供的 SillyTavern 世界書 JSON，依「長上下文注意力常呈 U 形分佈」的原則，提出重排建議或輸出重排後 JSON。

重排原則：
1. 模型通常更重視提示詞開頭與結尾，中段較容易失焦。
2. 世界概況、核心規則、長期不變設定放角色定義之前，越基礎越重要越往前。
3. 重要角色、重要地點、關鍵制度也可放角色前，但排在基礎設定之後。
4. 次要補充放角色定義之後，或放在較深位置，不要承擔核心規則。
5. D1 適合承接最近對話末尾的關鍵補充。
6. D0 適合最怕模型漏掉的格式要求、硬規則、行為限制。
7. 不要把所有重要內容都塞 D0；尾端太長會稀釋效果。
8. 盡量避免大量 D2 以上，避免打斷上下文。
9. insertion_order 請用區段化數值，例如 10/30/50/90/120/200，不要全部卡在 100 附近。
10. 特別重要且常被忽略的規則，可同時放角色前開頭與 D0 做雙重強調。

如果你輸出 JSON，請只輸出合法 JSON，不要 Markdown code fence。`
  },
  {
    title: "檢查條目品質",
    desc: "檢查世界書條目是否太長、太碎、key 不足。",
    prompt: `請檢查我提供的 SillyTavern 世界書 entries。

請回報：
1. 哪些 entry 太長，建議拆分。
2. 哪些 entry 太碎，建議合併。
3. 哪些 entry keys 不足或不容易觸發。
4. 哪些 content 可能與其他條目重複。
5. 只給建議，不要直接重寫 JSON。`
  },
  {
    title: "條目配置推薦",
    desc: "依條目類型推薦位置、順序、狀態、深度的最佳配置。",
    prompt: `你是 SillyTavern 世界書配置助手。請讀取我提供的世界書 JSON，依最佳實踐推薦每個條目的配置。

推薦配置參考：
- 世界觀/基礎設定：before_char、constant: true、order 1-3
- 角色總覽/速讀：before_char、constant: true、order 4
- 核心角色詳情：after_char、單角色卡 constant / 多角色卡 keys 觸發、order 10-50
- NPC：after_char、keys 觸發（全名/暱稱/頭銜 ≥3 個）、order 100
- 場景/事件：after_char、keys 觸發、order 50-98
- 行為硬規則/二次解釋：at_depth D0、keys: 角色名、order 1（只寫行為指令，不寫設定描述）

檢查重點：
1. 常駐條目建議不超過 3 個
2. 每條 keys ≥ 3（含暱稱、別名、頭銜）
3. insertion_order 用區段化數值，不要全卡在 100
4. 不使用 D2 以上
5. 每條 200-500 tokens，太長拆分

請分析每個條目，列出目前配置與推薦修改。`
  }
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

let messageTimer = null;

function setMessage(text, type = "info") {
  if (messageTimer) { clearTimeout(messageTimer); messageTimer = null; }
  const el = $("#message");
  if (!text) {
    el.className = "message";
    el.textContent = "";
    return;
  }
  el.className = `message show ${type === "error" ? "error" : ""}`;
  el.textContent = text;
  if (window.matchMedia("(max-width: 768px)").matches && type !== "error") {
    messageTimer = setTimeout(() => setMessage(""), 3500);
  }
}

function getData() {
  if (!state.card) return null;
  if (!state.card.data) state.card.data = {};
  return state.card.data;
}

function getCharacterBook() {
  const data = getData();
  if (!data) return null;
  if (!data.character_book) data.character_book = { name: data.name || state.card.name || "", entries: [] };
  if (!Array.isArray(data.character_book.entries)) data.character_book.entries = [];
  return data.character_book;
}

function getCardEntries() {
  return getCharacterBook()?.entries || [];
}

function updateMirroredField(key, value) {
  if (!state.card) return;
  const data = getData();
  data[key] = value;
  if (["name", "description", "personality", "scenario", "first_mes", "mes_example"].includes(key)) {
    state.card[key] = value;
  }
  if (key === "creator_notes") state.card.creatorcomment = value;
}

function normalizeCard(card) {
  const normalized = card && typeof card === "object" ? card : structuredCloneSafe(templates.character);
  if (!normalized.data) normalized.data = {};
  if (!normalized.spec) normalized.spec = "chara_card_v3";
  if (!normalized.spec_version) normalized.spec_version = "3.0";
  ["name", "description", "personality", "scenario", "first_mes", "mes_example"].forEach((key) => {
    const value = normalized.data[key] ?? normalized[key] ?? "";
    normalized.data[key] = value;
    normalized[key] = value;
  });
  normalized.data.alternate_greetings = sanitizeAlternateGreetings(normalized.data.alternate_greetings);
  if (!normalized.data.extensions) normalized.data.extensions = {};
  normalized.data.character_book = normalizeWorldBook(
    normalized.data.character_book
    || normalized.character_book
    || { name: normalized.data.name || normalized.name || "", entries: [] }
  );
  return normalized;
}

function getWorldBookEntries(entries) {
  if (Array.isArray(entries)) return entries;
  if (!entries || typeof entries !== "object") return [];
  return Object.entries(entries)
    .sort(([left], [right]) => {
      const leftNumber = Number(left);
      const rightNumber = Number(right);
      if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) return leftNumber - rightNumber;
      return String(left).localeCompare(String(right), "en");
    })
    .map(([id, entry]) => {
      if (!entry || typeof entry !== "object" || entry.id !== undefined) return entry;
      return { id, ...entry };
    });
}

function normalizeWorldBook(input) {
  if (!input || typeof input !== "object") return structuredCloneSafe(templates.worldbook);
  if (input.data?.character_book) return normalizeWorldBook(input.data.character_book);
  if (input.character_book) return normalizeWorldBook(input.character_book);
  const entries = getWorldBookEntries(input.entries);
  return {
    ...input,
    name: input.name || "未命名世界書",
    entries: entries.map((entry, index) => normalizeEntry(entry, index))
  };
}

function normalizeEntry(entry, index) {
  const next = entry && typeof entry === "object" ? { ...entry } : {};
  next.id = Number.isFinite(Number(next.id)) ? Number(next.id) : index;
  next.keys = toStringArray(next.keys);
  next.secondary_keys = toStringArray(next.secondary_keys);
  next.comment = String(next.comment ?? `條目 ${index + 1}`);
  next.content = String(next.content ?? "");
  next.constant = Boolean(next.constant);
  next.selective = next.selective !== false;
  next.enabled = next.enabled !== false && next.disable !== true;
  if (next.extensions?.position === 4 || next.position === "at_depth") next.position = "at_depth";
  else next.position = next.position ?? "before_char";
  next.insertion_order = Number.isFinite(Number(next.insertion_order ?? next.order)) ? Number(next.insertion_order ?? next.order) : 90;
  next.use_regex = Boolean(next.use_regex);
  next.extensions = next.extensions && typeof next.extensions === "object" ? { ...next.extensions } : {};
  if (next.extensions.position === undefined) next.extensions.position = next.position === "after_char" ? 1 : next.position === "at_depth" ? 4 : 0;
  if (next.extensions.depth === undefined) next.extensions.depth = Number.isFinite(Number(next.depth)) ? Number(next.depth) : 4;
  if (next.extensions.probability === undefined) next.extensions.probability = 100;
  if (next.extensions.useProbability === undefined) next.extensions.useProbability = true;
  if (next.extensions.role === undefined) next.extensions.role = 0;
  if (next.extensions.display_index === undefined) next.extensions.display_index = index;
  return next;
}

function sanitizeAlternateGreetings(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function resetAlternateGreetingDrafts(card = state.card) {
  const greetings = sanitizeAlternateGreetings(card?.data?.alternate_greetings);
  state.altGreetingDraftCount = card ? (greetings.length ? 0 : 1) : 0;
}

function toStringArray(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") return value.split(/[\n,，]/).map((item) => item.trim()).filter(Boolean);
  return [];
}

function estimateTokens(text) {
  const str = String(text || "");
  let tokens = 0;
  for (const char of str) {
    tokens += char.charCodeAt(0) > 0x2e80 ? 1.5 : 0.25;
  }
  return Math.ceil(tokens);
}

function validate() {
  const warnings = [];
  if (!state.card) {
    state.warnings = ["尚未載入角色卡。"];
    return state.warnings;
  }
  const data = getData();
  const fieldNames = { name: "角色名稱", description: "角色描述", personality: "個性摘要", scenario: "場景設想", first_mes: "首則訊息", mes_example: "對話範例" };
  if (state.card.spec !== "chara_card_v3") warnings.push("角色卡規格不是 chara_card_v3。");
  if (String(state.card.spec_version) !== "3.0") warnings.push("角色卡版本不是 3.0。");
  ["name", "description", "personality", "scenario", "first_mes", "mes_example"].forEach((key) => {
    if ((state.card[key] ?? "") !== (data[key] ?? "")) warnings.push(`頂層「${fieldNames[key]}」與內層不一致。`);
  });
  if (!data.name) warnings.push("角色名稱是空白。");
  if (!data.description) warnings.push("角色描述是空白，角色可能缺少核心設定。");
  if (!data.first_mes) warnings.push("首則訊息是空白，匯入後可能沒有開場白。");
  if (!Array.isArray(data.alternate_greetings)) warnings.push("額外問候語格式不正確。");
  const entries = getCardEntries();
  const constantCount = entries.filter((e) => e.constant).length;
  if (constantCount > 3) warnings.push(`${constantCount} 個世界書條目設為常駐，建議控制在 3 個以內。`);
  entries.forEach((entry, index) => {
    if (!entry.content) warnings.push(`世界書 #${index} 內容是空白。`);
    if (!entry.constant && !toStringArray(entry.keys).length) warnings.push(`世界書 #${index} 不是常駐，但沒有關鍵字。`);
    const entryTokens = estimateTokens(entry.content);
    if (entryTokens > 500) warnings.push(`世界書 #${index}「${entry.comment || ""}」約 ${entryTokens} tokens，建議拆分（200-500 為佳）。`);
    if (!entry.constant && toStringArray(entry.keys).length > 0 && toStringArray(entry.keys).length < 3) warnings.push(`世界書 #${index} 關鍵字只有 ${toStringArray(entry.keys).length} 個，建議至少 3 個。`);
    if (entry.position === "at_depth" && entry.extensions?.depth > 1) warnings.push(`世界書 #${index} 使用深度 ${entry.extensions.depth}，深度 2 以上會打斷上下文。`);
  });
  state.warnings = warnings;
  return warnings;
}

function updateInspector() {
  const warnings = validate();
  const cardName = state.card?.data?.name || state.card?.name || "未載入";
  const worldName = state.worldbook?.name || state.card?.data?.character_book?.name || "未載入";
  const entries = state.worldbook?.entries?.length ?? getCardEntries().length;
  const cardJson = state.card ? JSON.stringify(state.card) : "";
  const tokenCount = cardJson.length > 500000 ? Math.ceil(cardJson.length * 0.6) : estimateTokens(cardJson);
  $("#stats").innerHTML = `
    <div class="stat"><strong>${escapeHtml(workflowLabel())}</strong><span>工作流</span></div>
    <div class="stat"><strong>${escapeHtml(cardName)}</strong><span>角色卡</span></div>
    <div class="stat"><strong>${escapeHtml(worldName)}</strong><span>世界書</span></div>
    <div class="stat"><strong>${entries}</strong><span>條目數</span></div>
  `;
  const pill = $("#statusPill");
  if (!state.card) {
    pill.className = "status-pill muted";
    pill.textContent = "待載入";
  } else if (warnings.length) {
    pill.className = "status-pill warn";
    pill.textContent = `${warnings.length} 提醒`;
  } else {
    pill.className = "status-pill ok";
    pill.textContent = "可匯出";
  }
  $("#warnings").innerHTML = warnings.length
    ? warnings.map((warning) => `<div class="warning">${escapeHtml(warning)}</div>`).join("")
    : `<div class="warning info">${state.card ? "目前沒有明顯格式警告。" : "請先載入或建立角色卡。"}</div>`;
  $("#nextStep").textContent = nextSteps[state.step];
  scheduleSave();
}

const STORAGE_KEY = "cc-creator-autosave";
let saveTimer = null;

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(saveToStorage, 800);
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      card: state.card,
      worldbook: state.worldbook,
      workflow: state.workflow,
      step: state.step,
      cardFileName: state.cardFileName,
      worldFileName: state.worldFileName,
      mergeStrategy: state.mergeStrategy,
      exportImageName: state.exportImageName,
      altGreetingDraftCount: state.altGreetingDraftCount,
      ts: Date.now()
    }));
  } catch {}
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    console.log("[DEBUG] loadFromStorage: raw length", raw.length);
    const save = JSON.parse(raw);
    if (!save.card && !save.worldbook) return false;
    console.log("[DEBUG] loadFromStorage: normalizeCard...");
    if (save.card) state.card = normalizeCard(save.card);
    console.log("[DEBUG] loadFromStorage: normalizeWorldBook...");
    if (save.worldbook) state.worldbook = normalizeWorldBook(save.worldbook);
    state.workflow = save.workflow || "";
    state.step = save.step || "guide";
    state.cardFileName = save.cardFileName || "";
    state.worldFileName = save.worldFileName || "";
    state.mergeStrategy = save.mergeStrategy || "replace";
    state.exportImageName = save.exportImageName || "";
    state.altGreetingDraftCount = save.altGreetingDraftCount || 0;
    state.sourcePngBytes = null;
    state.sourcePngUrl = "";
    return true;
  } catch { return false; }
}

function workflowLabel() {
  if (state.workflow === "new") return "全新製作";
  if (state.workflow === "repair") return "修卡";
  return "未選擇";
}

function render() {
  try {
    $("#viewTitle").textContent = stepTitles[state.step];
    $$(".step-link").forEach((button) => button.classList.toggle("active", button.dataset.step === state.step));
    const panel = $("#mainPanel");
    const views = {
      guide: renderGuide,
      character: renderCharacter,
      worldbook: renderWorldbook,
      merge: renderMerge,
      export: renderExport
    };
    panel.innerHTML = views[state.step]();
    bindViewEvents();
    updateInspector();
    scheduleSave();
  } catch (error) {
    console.error("[render] crash:", error.message, error.stack);
    if (error.message?.includes("stack")) {
      state.card = null;
      state.worldbook = null;
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
      setMessage("角色卡太大導致渲染失敗，已清除暫存。請重新上傳。", "error");
    } else {
      setMessage(`渲染失敗：${error.message}`, "error");
    }
  }
}

function renderGuide() {
  return `
    <div class="view">
      <div class="view-head">
        <div>
          <h2>先選工作流</h2>
          <p>你可以從空白模板開始全新製作，也可以匯入既有角色卡修正。兩條路最後都會回到合併與匯出。</p>
        </div>
      </div>
      <div class="section-grid">
        <section class="panel workflow-card">
          <h3>全新製作</h3>
          <p>從角色卡與世界書空白模板開始。創作者可以直接填寫，也可以複製 Skill 給 GPT、Gemini、Claude 等 AI 產出 JSON，再回來合併匯出。</p>
          <div class="action-row">
            <button class="button primary" data-workflow="new" type="button">開始全新製作</button>
          </div>
        </section>
        <section class="panel workflow-card">
          <h3>修卡</h3>
          <p>匯入既有 JSON / PNG 角色卡後，可以直接手動修正，也可以拆出角色卡 JSON 與世界書 JSON，交給 AI 協助修。</p>
          <div class="action-row">
            <button class="button primary" data-workflow="repair" type="button">開始修卡</button>
          </div>
        </section>
      </div>
      <div class="section-grid">
        <section class="panel tips-card">
          <h3>製卡核心原則</h3>
          <ul>
            <li><strong>個性調色盤</strong>：底色＋主色＋點綴，各附具體衍生行為場景。不寫「溫柔」，寫她會做什麼。</li>
            <li><strong>外貌差異化</strong>：只寫偏離 AI 預設的特徵。日本人不用寫黑髮，但白髮要寫。</li>
            <li><strong>展示不定義</strong>：用行為和台詞展現個性，不用標籤和形容詞堆疊。</li>
            <li><strong>去八股</strong>：禁用模糊詞（似乎、彷彿）、壞比喻（心湖漣漪）、微表情模板（嘴角上揚）。</li>
          </ul>
        </section>
        <section class="panel tips-card">
          <h3>世界書擺放要點</h3>
          <ul>
            <li><strong>U 形注意力</strong>：模型對頭尾最敏感，中段容易失焦。善用兩端，不要全塞 D0。</li>
            <li><strong>角色前</strong>：世界觀、核心規則、不變設定。order 越小越重要。</li>
            <li><strong>角色後</strong>：NPC、場景、次要補充。</li>
            <li><strong>D0</strong>：只放最怕被忽略的行為指令和硬規則。D2 以上不要用。</li>
            <li><strong>常駐不超過 3 條</strong>，其餘用關鍵字觸發，每條至少 3 個關鍵字。</li>
          </ul>
        </section>
      </div>
      <div class="section-grid three">
        <section class="panel">
          <h3>角色卡</h3>
          <p>全新製作會打開空白模板；修卡會匯入既有卡。</p>
        </section>
        <section class="panel">
          <h3>世界書</h3>
          <p>全新製作會打開空白世界書；修卡可從既有卡拆出世界書。</p>
        </section>
        <section class="panel">
          <h3>合併匯出</h3>
          <p>完成角色卡與世界書後，到合併區放回角色卡，再匯出 JSON 或 PNG 角色卡。</p>
        </section>
      </div>
      <div class="section-grid">
        <section class="panel">
          <h3>範例庫</h3>
          <div class="action-row">
            <button class="button" data-template="character" type="button">載入角色卡空白模板</button>
            <button class="button" data-template="worldbook" type="button">載入世界書空白模板</button>
            <button class="button primary" data-template="combined" type="button">載入合併模板</button>
          </div>
        </section>
        <section class="panel">
          <h3>本機處理提醒</h3>
          <p>此版本沒有後端。匯入、解析、合併與匯出都在瀏覽器內完成；重新整理頁面後資料會消失，請記得匯出。</p>
        </section>
      </div>
    </div>
  `;
}

function renderCharacter() {
  const data = getData();
  const avatar = state.sourcePngUrl
    ? `<img src="${state.sourcePngUrl}" alt="角色卡 PNG 預覽">`
    : escapeHtml((data?.name || "卡").slice(0, 1));
  return `
    <div class="view">
      <div class="view-head">
        <div>
          <h2>角色卡</h2>
          <p>${state.workflow === "repair" ? "修卡模式：匯入既有 JSON / PNG 後可手動修正，也可到匯出區拆出 JSON 給 AI 協助。" : "全新製作模式：直接填寫空白模板，或複製 Skill 給 GPT、Gemini、Claude 等 AI 產出角色卡 JSON。"}</p>
        </div>
        <div class="action-row">
          <button class="button primary" data-pick-card type="button">上傳 JSON / PNG</button>
          <button class="button" data-template="character" type="button">載入空白模板</button>
        </div>
      </div>
      ${data ? `
        <div class="card-summary">
          <div class="avatar-preview">${avatar}</div>
          <div>
            <h3>${escapeHtml(data.name || "未命名角色")}</h3>
            <p>${escapeHtml(state.cardFileName || "目前資料來自模板或手動建立")}</p>
            <div class="badge-list">
              <span class="badge">${escapeHtml(state.card?.spec || "unknown")}</span>
              <span class="badge">${escapeHtml(state.card?.spec_version || "-")}</span>
              <span class="badge">${getCardEntries().length} 條目</span>
            </div>
          </div>
        </div>
        <section class="panel">
          <h3>主欄位</h3>
          ${renderCharacterFields(data)}
        </section>
        <div class="skill-section">
          <button class="skill-toggle" type="button">
            <span>角色卡 AI Skill</span>
            <span class="skill-arrow">▶</span>
          </button>
          <div class="skill-content panel">
            <p>${state.workflow === "repair" ? "可把匯出的角色卡 JSON 貼給 AI，請它檢查一致性或修復格式，再貼回網站。" : "可把你的素材貼在 prompt 後面，讓 AI 依格式產出 JSON，再回網站檢查。"}</p>
            <div class="prompt-row">
              ${renderPromptButtons(characterPrompts)}
            </div>
          </div>
        </div>
      ` : `
        <div class="dropzone" data-drop-card>
          <div>
            <strong>拖放角色卡 JSON / PNG 到這裡</strong>
            <p>或使用上方按鈕選擇檔案。</p>
          </div>
        </div>
      `}
    </div>
  `;
}

function renderCharacterFields(data) {
  const greetings = [
    ...sanitizeAlternateGreetings(data.alternate_greetings),
    ...Array.from({ length: state.altGreetingDraftCount }, () => "")
  ];
  if (!greetings.length) greetings.push("");
  return `
    <div class="form-grid">
      ${field("name", "角色名稱", data.name, "input")}
      ${field("creator", "作者", data.creator || "", "input", "data-only")}
    </div>
    ${field("creator_notes", "創作者備註", data.creator_notes || "", "textarea", "data-only", "顯示在酒館角色卡的備註欄：給玩家的說明、使用方式、授權聲明等。不會進 AI 的 prompt。")}
    ${field("description", "角色描述", data.description, "textarea", "mirror", "角色定義主體。外貌只寫偏離 AI 預設的特徵，背景只放影響當前性格的事件。用行為展現個性，不用標籤。")}
    ${field("personality", "個性摘要", data.personality, "textarea", "mirror", "建議用調色盤結構：底色＋主色＋點綴，各附具體衍生行為場景。不要只寫抽象標籤。")}
    ${field("scenario", "場景設想", data.scenario, "textarea", "mirror", "定義角色與 {{user}} 互動的背景條件、關係、場景限制。")}
    ${field("mes_example", "對話範例", data.mes_example, "textarea", "mirror", "提供角色的具體台詞範本讓 AI 學語氣。怕 AI ECHO 可留空。")}
    ${field("first_mes", "首則訊息", data.first_mes, "textarea", "mirror", "第一則開場白。避免八股寫法（似乎、彷彿、嘴角上揚），用白描。")}
    <div class="field field-stack">
      <label>額外問候語</label>
      <small class="field-help">其他開場首則訊息</small>
      <div class="alt-greeting-list">
        ${greetings.map((greeting, index) => renderAlternateGreetingField(greeting, index)).join("")}
      </div>
      <div class="action-row">
        <button class="button" data-add-alt-greeting type="button">+ 追加填寫</button>
      </div>
    </div>
  `;
}

function renderAlternateGreetingField(value, index) {
  return `
    <div class="alt-greeting-item">
      <div class="alt-greeting-head">
        <strong>問候語 ${index + 1}</strong>
        <button class="button danger alt-greeting-remove" data-remove-alt-greeting="${index}" type="button">刪除</button>
      </div>
      <textarea data-alt-greeting="${index}">${escapeHtml(value)}</textarea>
    </div>
  `;
}

function field(key, label, value, type = "textarea", mode = "mirror", help = "") {
  const helpText = help ? `<small class="field-help">${escapeHtml(help)}</small>` : "";
  if (type === "input") {
    return `<div class="field"><label>${escapeHtml(label)}</label>${helpText}<input data-card-field="${escapeHtml(key)}" data-mode="${mode}" value="${escapeHtml(value)}"></div>`;
  }
  return `<div class="field"><label>${escapeHtml(label)}</label>${helpText}<textarea data-card-field="${escapeHtml(key)}" data-mode="${mode}">${escapeHtml(value)}</textarea></div>`;
}

function renderPromptButtons(prompts) {
  return prompts.map((item, index) => `
    <div class="prompt-card">
      <div class="prompt-info">
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.desc)}</small>
      </div>
      <button class="button" data-copy-prompt="${index}" type="button">複製</button>
    </div>
  `).join("");
}

function renderWorldbook() {
  const book = state.worldbook || getCharacterBook();
  const entries = book?.entries || [];
  return `
    <div class="view">
      <div class="view-head">
        <div>
          <h2>世界書</h2>
          <p>${state.workflow === "repair" ? "修卡模式：可檢查既有條目，也可拆出世界書給 AI 依注意力分佈重排。" : "全新製作模式：從空白世界書開始，或複製提示詞給 AI 產出條目，再回來合併。"}</p>
        </div>
        <div class="action-row">
          <button class="button primary" data-pick-world type="button">上傳世界書 JSON</button>
          <button class="button" data-template="worldbook" type="button">載入空白模板</button>
        </div>
      </div>
      <div class="section-grid" style="grid-template-columns:1fr">
        <section class="panel">
          <h3>世界書資料</h3>
          ${book ? `
            <div class="field">
              <label>世界書名稱</label>
              <input data-world-name value="${escapeHtml(book.name || "")}">
            </div>
            <div class="action-row">
              <button class="button" data-add-entry type="button">新增條目</button>
              <button class="button warn" data-apply-world-to-card type="button" ${state.card ? "" : "disabled"}>套用到角色卡</button>
            </div>
            <div class="entry-list">${entries.length ? entries.map(renderEntry).join("") : `<div class="empty">目前沒有條目。</div>`}</div>
          ` : `<div class="empty">尚未載入世界書。你可以載入空白模板或上傳 JSON。</div>`}
        </section>
      </div>
      <div class="skill-section">
        <button class="skill-toggle" type="button">
          <span>世界書 AI Skill</span>
          <span class="skill-arrow">▶</span>
        </button>
        <div class="skill-content panel">
          <p>世界書 prompt 已融合注意力分佈原則：重要內容吃兩端，中段放可退讓內容，不要迷信全部塞 D0。</p>
          <div class="prompt-row">
            ${renderPromptButtons(worldPrompts)}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderEntry(entry, index) {
  const keys = toStringArray(entry.keys).join("\n");
  const secondary = toStringArray(entry.secondary_keys).join("\n");
  const tokens = estimateTokens(entry.content);
  const posValue = entry.position || "before_char";
  const depthValue = entry.extensions?.depth ?? 4;
  const tokenHint = tokens > 500 ? "，建議拆分" : tokens > 0 && tokens < 50 ? "，內容偏少" : "";
  const status = entry.enabled === false ? "disabled" : entry.constant ? "constant" : "normal";
  const posLabel = posValue === "at_depth" ? `@D${depthValue}` : posValue === "after_char" ? "↓角色後" : "↑角色前";
  const statusLabel = status === "constant" ? "🔵 常駐" : status === "disabled" ? "❌ 停用" : "🟢 一般";
  return `
    <article class="entry-item">
      <div class="entry-title">
        <div>
          <strong>${escapeHtml(entry.comment || `條目 ${index + 1}`)}</strong>
          <small>${escapeHtml(toStringArray(entry.keys).join(", ") || "無關鍵字")}</small>
        </div>
        <div class="badge-list">
          <span class="badge ${status === "constant" ? "on" : status === "disabled" ? "off" : ""}">${statusLabel}</span>
          <span class="badge">${escapeHtml(posLabel)}</span>
          <span class="badge">#${index}</span>
        </div>
      </div>
      <div class="entry-body">
        <div class="field"><label>條目標題</label><input data-entry-field="comment" data-entry-index="${index}" value="${escapeHtml(entry.comment || "")}"></div>
        <div class="entry-config">
          <div class="field"><label>狀態</label><select data-entry-field="status" data-entry-index="${index}">
            <option value="constant" ${status === "constant" ? "selected" : ""}>🔵 常駐</option>
            <option value="normal" ${status === "normal" ? "selected" : ""}>🟢 一般</option>
            <option value="disabled" ${status === "disabled" ? "selected" : ""}>❌ 停用</option>
          </select></div>
          <div class="field"><label>插入位置</label><select data-entry-field="position" data-entry-index="${index}">
            <option value="before_char" ${posValue === "before_char" ? "selected" : ""}>↑角色前</option>
            <option value="after_char" ${posValue === "after_char" ? "selected" : ""}>↓角色後</option>
            <option value="at_depth" ${posValue === "at_depth" ? "selected" : ""}>@深度</option>
          </select></div>
          <div class="field"><label>順序</label><input type="number" data-entry-field="insertion_order" data-entry-index="${index}" value="${escapeHtml(entry.insertion_order ?? 90)}"></div>
          <div class="field"><label>深度</label><input type="number" data-entry-field="depth" data-entry-index="${index}" value="${escapeHtml(depthValue)}" min="0" max="999"></div>
        </div>
        <div class="form-grid">
          <div class="field"><label>主要關鍵字（每行一個，建議 ≥ 3）</label><textarea data-entry-field="keys" data-entry-index="${index}">${escapeHtml(keys)}</textarea></div>
          <div class="field"><label>選填過濾器（每行一個）</label><textarea data-entry-field="secondary_keys" data-entry-index="${index}">${escapeHtml(secondary)}</textarea></div>
        </div>
        <div class="field"><label>內容 <span class="token-count">（約 ${tokens} tokens${tokenHint}）</span></label><textarea data-entry-field="content" data-entry-index="${index}">${escapeHtml(entry.content || "")}</textarea></div>
        <div class="action-row">
          <button class="button danger" data-remove-entry="${index}" type="button">刪除條目</button>
        </div>
      </div>
    </article>
  `;
}

function renderMerge() {
  const cardName = state.card?.data?.name || "尚未載入角色卡";
  const book = state.worldbook || getCharacterBook();
  const bookName = book?.name || "尚未載入世界書";
  return `
    <div class="view">
      <div class="view-head">
        <div>
          <h2>合併</h2>
          <p>選擇世界書如何放進角色卡。若沒有獨立世界書，會使用角色卡內目前的 character_book。</p>
        </div>
      </div>
      <div class="section-grid">
        <section class="panel">
          <h3>目前資料</h3>
          <div class="stats">
            <div class="stat"><strong>${escapeHtml(cardName)}</strong><span>角色卡</span></div>
            <div class="stat"><strong>${escapeHtml(bookName)}</strong><span>世界書</span></div>
            <div class="stat"><strong>${book?.entries?.length || 0}</strong><span>待合併條目</span></div>
            <div class="stat"><strong>${getCardEntries().length}</strong><span>卡內條目</span></div>
          </div>
          <div class="action-row">
            <button class="button" data-pick-card type="button">上傳角色卡</button>
            <button class="button" data-pick-world type="button">上傳世界書</button>
            <button class="button" data-template="combined" type="button">載入合併模板</button>
          </div>
        </section>
        <section class="panel">
          <h3>合併策略</h3>
          <div class="merge-options">
            ${mergeOption("replace", "取代", "用目前世界書取代角色卡內的 character_book。")}
            ${mergeOption("append", "追加", "保留角色卡原本條目，將目前世界書接到後面。")}
            ${mergeOption("dedupe", "去重追加", "依 comment 與 content 去重後追加，適合整理多次生成結果。")}
          </div>
          <div class="action-row">
            <button class="button primary" data-merge type="button" ${state.card && book ? "" : "disabled"}>執行合併</button>
          </div>
        </section>
      </div>
    </div>
  `;
}

function mergeOption(value, title, desc) {
  return `
    <label>
      <input type="radio" name="mergeStrategy" value="${value}" ${state.mergeStrategy === value ? "checked" : ""}>
      <span><strong>${title}</strong><small>${desc}</small></span>
    </label>
  `;
}

function renderExport() {
  const hasCard = !!state.card;
  const cardName = hasCard ? escapeHtml(state.card.data?.name || state.card.name || "未命名角色") : "";
  const avatar = state.sourcePngUrl
    ? `<img src="${state.sourcePngUrl}" alt="封面預覽">`
    : escapeHtml((cardName || "卡").slice(0, 1));
  return `
    <div class="view">
      <div class="view-head">
        <div>
          <h2>匯出</h2>
          <p>匯出前請確認檢查狀態。JSON 保留所有欄位；PNG 把角色卡 JSON 寫入 chara metadata。</p>
        </div>
      </div>
      ${hasCard ? `
        <div class="card-summary">
          <div class="avatar-preview">${avatar}</div>
          <div>
            <h3>${cardName}</h3>
            <p>${escapeHtml(exportImageNote())}</p>
          </div>
        </div>
        <div class="section-grid">
          <section class="panel">
            <h3>PNG 角色卡</h3>
            <p>上傳封面圖片，再下載成可匯入 SillyTavern 的 PNG 角色卡。</p>
            <div class="export-actions">
              <button class="button" data-pick-export-image type="button">上傳封面圖片</button>
              <button class="button primary export-btn" data-export-png type="button">下載 PNG</button>
            </div>
          </section>
          <section class="panel">
            <h3>JSON 角色卡</h3>
            <p>下載或複製完整角色卡 JSON（含世界書）。</p>
            <div class="export-actions">
              <button class="button primary export-btn" data-export-json type="button">下載 JSON</button>
              <button class="button" data-copy-json type="button">複製 JSON</button>
            </div>
          </section>
        </div>
        <section class="panel">
          <h3>修卡用拆分</h3>
          <p>拆出不含世界書的角色主體或世界書條目，交給 AI 修完再回來合併。</p>
          <div class="export-actions">
            <button class="button" data-export-character-only type="button">拆出角色卡 JSON</button>
            <button class="button" data-export-world-only type="button">拆出世界書 JSON</button>
          </div>
        </section>
      ` : `
        <div class="empty">
          <strong>尚未載入角色卡</strong>
          <p>請先到角色卡或合併區載入角色卡，再回來匯出。</p>
        </div>
      `}
      <section class="panel">
        <h3>JSON 預覽</h3>
        ${hasCard ? `<pre class="json-preview">${escapeHtml(JSON.stringify(state.card, null, 2))}</pre>` : `<div class="empty">載入角色卡後會顯示完整 JSON。</div>`}
      </section>
    </div>
  `;
}

function bindViewEvents() {
  $$("[data-template]").forEach((button) => button.addEventListener("click", () => loadTemplate(button.dataset.template)));
  $$("[data-workflow]").forEach((button) => button.addEventListener("click", () => startWorkflow(button.dataset.workflow)));
  $$("[data-pick-card]").forEach((button) => button.addEventListener("click", () => $("#cardFileInput").click()));
  $$("[data-pick-world]").forEach((button) => button.addEventListener("click", () => $("#worldFileInput").click()));
  $$("[data-pick-export-image]").forEach((button) => button.addEventListener("click", () => $("#exportImageInput").click()));
  $$("[data-card-field]").forEach((input) => input.addEventListener("input", handleCardField));
  $$("[data-alt-greeting]").forEach((input) => input.addEventListener("input", handleGreetings));
  $$("[data-remove-alt-greeting]").forEach((button) => button.addEventListener("click", () => removeAlternateGreeting(Number(button.dataset.removeAltGreeting))));
  $("[data-add-alt-greeting]")?.addEventListener("click", addAlternateGreeting);
  $("[data-world-name]")?.addEventListener("input", (event) => {
    const book = state.worldbook || getCharacterBook();
    if (book) book.name = event.target.value;
    render();
  });
  $$("[data-entry-field]").forEach((input) => input.addEventListener("input", handleEntryField));
  $$("[data-remove-entry]").forEach((button) => button.addEventListener("click", () => removeEntry(Number(button.dataset.removeEntry))));
  $("[data-add-entry]")?.addEventListener("click", addEntry);
  $("[data-apply-world-to-card]")?.addEventListener("click", applyWorldToCard);
  $$("[data-copy-prompt]").forEach((button) => button.addEventListener("click", () => copyPrompt(Number(button.dataset.copyPrompt))));
  $$("input[name='mergeStrategy']").forEach((input) => input.addEventListener("change", () => {
    state.mergeStrategy = input.value;
  }));
  $("[data-merge]")?.addEventListener("click", mergeWorldIntoCard);
  $("[data-export-json]")?.addEventListener("click", exportJson);
  $("[data-export-png]")?.addEventListener("click", exportPng);
  $("[data-export-character-only]")?.addEventListener("click", exportCharacterOnlyJson);
  $("[data-export-world-only]")?.addEventListener("click", exportWorldOnlyJson);
  $("[data-copy-json]")?.addEventListener("click", copyJson);
  $$(".skill-toggle").forEach((btn) => btn.addEventListener("click", () => {
    btn.closest(".skill-section").classList.toggle("expanded");
  }));
  bindDropzones();
  if (window.matchMedia("(max-width: 768px)").matches) {
    $$(".entry-item").forEach((item) => {
      item.classList.add("collapsed");
      const title = item.querySelector(".entry-title");
      if (title) title.addEventListener("click", (e) => { e.stopPropagation(); item.classList.toggle("collapsed"); });
    });
  }
}

function startWorkflow(type) {
  state.workflow = type;
  if (type === "new") {
    state.card = normalizeCard(structuredCloneSafe(templates.character));
    resetAlternateGreetingDrafts(state.card);
    state.worldbook = normalizeWorldBook(structuredCloneSafe(templates.worldbook));
    state.cardFileName = "character_blank.json";
    state.worldFileName = "worldbook_blank.json";
    state.sourcePngBytes = null;
    state.sourcePngUrl = "";
    state.exportImageName = "";
    state.step = "character";
    setMessage("已進入全新製作：角色卡與世界書空白模板已準備好。");
  } else {
    state.card = null;
    resetAlternateGreetingDrafts(null);
    state.worldbook = null;
    state.cardFileName = "";
    state.worldFileName = "";
    state.sourcePngBytes = null;
    state.sourcePngUrl = "";
    state.exportImageName = "";
    state.step = "character";
    setMessage("已進入修卡：請上傳既有 JSON / PNG 角色卡，或先用空白模板建立可修內容。");
  }
  render();
}

function handleCardField(event) {
  const key = event.target.dataset.cardField;
  if (event.target.dataset.mode === "data-only") {
    getData()[key] = event.target.value;
    /* creator_notes 的 v1 頂層對應鍵是 creatorcomment，同步鏡射讓新舊酒館都讀得到 */
    if (key === "creator_notes" && state.card) state.card.creatorcomment = event.target.value;
  } else {
    updateMirroredField(key, event.target.value);
  }
  updateInspector();
}

function handleGreetings(event) {
  const values = $$("[data-alt-greeting]").map((input) => input.value);
  getData().alternate_greetings = sanitizeAlternateGreetings(values);
  state.altGreetingDraftCount = Math.max(0, values.length - getData().alternate_greetings.length);
  updateInspector();
}

function addAlternateGreeting() {
  if (!state.card) return;
  state.altGreetingDraftCount += 1;
  render();
  $$("[data-alt-greeting]").at(-1)?.focus();
}

function removeAlternateGreeting(index) {
  if (!state.card) return;
  const values = $$("[data-alt-greeting]").map((input) => input.value);
  values.splice(index, 1);
  getData().alternate_greetings = sanitizeAlternateGreetings(values);
  state.altGreetingDraftCount = values.length ? values.length - getData().alternate_greetings.length : 1;
  render();
}

function handleEntryField(event) {
  const book = state.worldbook || getCharacterBook();
  const entry = book?.entries?.[Number(event.target.dataset.entryIndex)];
  if (!entry) return;
  const fieldName = event.target.dataset.entryField;
  let value = event.target.value;
  if (fieldName === "keys" || fieldName === "secondary_keys") value = toStringArray(value);
  if (fieldName === "status") {
    entry.constant = value === "constant";
    entry.enabled = value !== "disabled";
    updateInspector();
    render();
    return;
  }
  if (fieldName === "enabled") value = value === "true";
  if (fieldName === "constant") value = value === "true";
  if (fieldName === "insertion_order") value = Number(value);
  if (fieldName === "depth") {
    if (!entry.extensions) entry.extensions = {};
    entry.extensions.depth = Number(value);
    updateInspector();
    return;
  }
  entry[fieldName] = value;
  if (fieldName === "position") entry.extensions = { ...(entry.extensions || {}), position: value === "after_char" ? 1 : value === "at_depth" ? 4 : 0 };
  updateInspector();
}

function loadTemplate(type) {
  if (type === "character") {
    if (!state.workflow) state.workflow = "new";
    state.card = normalizeCard(structuredCloneSafe(templates.character));
    resetAlternateGreetingDrafts(state.card);
    state.cardFileName = "character_blank.json";
    state.sourcePngBytes = null;
    state.sourcePngUrl = "";
    state.exportImageName = "";
    state.step = "character";
  }
  if (type === "worldbook") {
    if (!state.workflow) state.workflow = "new";
    state.worldbook = normalizeWorldBook(structuredCloneSafe(templates.worldbook));
    state.worldFileName = "worldbook_blank.json";
    state.step = "worldbook";
  }
  if (type === "combined") {
    if (!state.workflow) state.workflow = "new";
    state.card = normalizeCard(structuredCloneSafe(templates.combined));
    resetAlternateGreetingDrafts(state.card);
    state.worldbook = normalizeWorldBook(state.card.data.character_book);
    state.cardFileName = "card_with_worldbook_blank.json";
    state.sourcePngBytes = null;
    state.sourcePngUrl = "";
    state.exportImageName = "";
    state.step = "merge";
  }
  setMessage(`已載入${type === "worldbook" ? "世界書" : type === "combined" ? "合併" : "角色卡"}模板。`);
  render();
}

async function handleCardFile(file) {
  if (!file) return;
  try {
    if (file.type === "image/png" || file.name.toLowerCase().endsWith(".png")) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const parsed = extractCardFromPng(bytes);
      state.card = normalizeCard(parsed.card);
      resetAlternateGreetingDrafts(state.card);
      state.cardFileName = file.name;
      state.sourcePngBytes = bytes;
      state.exportImageName = file.name;
      if (state.sourcePngUrl) URL.revokeObjectURL(state.sourcePngUrl);
      state.sourcePngUrl = URL.createObjectURL(file);
      if (state.card.data.character_book) state.worldbook = normalizeWorldBook(state.card.data.character_book);
      setMessage(`已從 PNG 讀取角色卡：${file.name}`);
    } else {
      console.log("[DEBUG] step 1: parsing JSON...");
      const card = JSON.parse(await file.text());
      console.log("[DEBUG] step 2: normalizeCard...");
      state.card = normalizeCard(card);
      console.log("[DEBUG] step 3: resetAlternateGreetingDrafts...");
      resetAlternateGreetingDrafts(state.card);
      state.cardFileName = file.name;
      state.sourcePngBytes = null;
      state.sourcePngUrl = "";
      state.exportImageName = "";
      console.log("[DEBUG] step 4: normalizeWorldBook...");
      if (state.card.data.character_book) state.worldbook = normalizeWorldBook(state.card.data.character_book);
      console.log("[DEBUG] step 5: setMessage...");
      setMessage(`已載入角色卡 JSON：${file.name}`);
    }
    if (!state.workflow) state.workflow = "repair";
    state.step = "character";
    console.log("[DEBUG] step 6: render...");
    render();
    console.log("[DEBUG] step 7: done!");
  } catch (error) {
    console.error("[DEBUG] CRASH:", error.message, error.stack);
    setMessage(`角色卡載入失敗：${error.message}`, "error");
  }
}

async function handleExportImageFile(file) {
  if (!file) return;
  if (!state.card) {
    setMessage("請先載入或建立角色卡，再上傳封面圖片。", "error");
    return;
  }
  try {
    if (state.sourcePngUrl) URL.revokeObjectURL(state.sourcePngUrl);
    state.exportImageName = file.name;
    state.sourcePngUrl = URL.createObjectURL(file);
    if (file.type === "image/png" || file.name.toLowerCase().endsWith(".png")) {
      state.sourcePngBytes = new Uint8Array(await file.arrayBuffer());
    } else {
      state.sourcePngBytes = await imageFileToPngBytes(file);
    }
    setMessage(`已載入封面圖片：${file.name}。下載 PNG 時會轉成角色卡 PNG。`);
    render();
  } catch (error) {
    setMessage(`封面圖片載入失敗：${error.message}`, "error");
  }
}

async function handleWorldFile(file) {
  if (!file) return;
  try {
    state.worldbook = normalizeWorldBook(JSON.parse(await file.text()));
    if (!state.workflow) state.workflow = "repair";
    state.worldFileName = file.name;
    state.step = "worldbook";
    setMessage(`已載入世界書 JSON：${file.name}`);
    render();
  } catch (error) {
    setMessage(`世界書載入失敗：${error.message}`, "error");
  }
}

function addEntry() {
  const book = state.worldbook || getCharacterBook();
  if (!book) return;
  book.entries.push(normalizeEntry({ comment: `條目 ${book.entries.length + 1}`, keys: [], content: "" }, book.entries.length));
  render();
}

function removeEntry(index) {
  const book = state.worldbook || getCharacterBook();
  if (!book) return;
  book.entries.splice(index, 1);
  reindexEntries(book.entries);
  render();
}

function applyWorldToCard() {
  if (!state.card) return;
  const book = state.worldbook || getCharacterBook();
  getData().character_book = normalizeWorldBook(book);
  setMessage("已將目前世界書套用到角色卡。");
  render();
}

function mergeWorldIntoCard() {
  if (!state.card) return;
  const target = getCharacterBook();
  const incoming = normalizeWorldBook(state.worldbook || target);
  let merged = [];
  if (state.mergeStrategy === "replace") {
    merged = incoming.entries;
  } else if (state.mergeStrategy === "append") {
    merged = [...target.entries, ...incoming.entries];
  } else {
    const seen = new Set();
    merged = [...target.entries, ...incoming.entries].filter((entry) => {
      const key = `${entry.comment || ""}::${entry.content || ""}`.trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  getData().character_book = {
    ...incoming,
    name: incoming.name || target.name || getData().name || "",
    entries: reindexEntries(merged.map((entry, index) => normalizeEntry(entry, index)))
  };
  state.worldbook = normalizeWorldBook(getData().character_book);
  setMessage("合併完成，已更新角色卡內的 character_book。");
  state.step = "export";
  render();
}

function reindexEntries(entries) {
  entries.forEach((entry, index) => {
    entry.id = index;
    if (!entry.extensions) entry.extensions = {};
    entry.extensions.display_index = index;
  });
  return entries;
}

function copyPrompt(index) {
  const prompts = state.step === "worldbook" ? worldPrompts : characterPrompts;
  copyText(prompts[index]?.prompt || "");
  const btn = $$("[data-copy-prompt]")[index];
  if (btn) {
    const original = btn.textContent;
    btn.textContent = "已複製 ✓";
    btn.disabled = true;
    setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1500);
  }
}

function copyJson() {
  copyText(JSON.stringify(state.card, null, 2));
  const btn = $("[data-copy-json]");
  if (btn) {
    const original = btn.textContent;
    btn.textContent = "已複製 ✓";
    btn.disabled = true;
    setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1500);
  }
}

function exportImageNote() {
  if (state.exportImageName) return `目前封面：${state.exportImageName}。下載 PNG 會把目前角色卡 JSON 寫入這張圖片。`;
  if (state.sourcePngBytes) return "目前會使用匯入角色卡時的 PNG 原圖，並替換 chara metadata。也可以上傳另一張封面圖片。";
  return "可以先上傳一張普通圖片當封面，再下載成可匯入 SillyTavern 的 PNG 角色卡；如果沒有封面，會產生一張簡易封面。";
}

function copyText(text) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function exportJson() {
  if (!state.card) return;
  downloadBytes(
    new TextEncoder().encode(JSON.stringify(state.card, null, 2)),
    `${safeFileName(state.card.data?.name || state.card.name || "character")}.json`,
    "application/json;charset=utf-8"
  );
}

function exportCharacterOnlyJson() {
  if (!state.card) return;
  const card = createCharacterOnlyCard();
  downloadBytes(
    new TextEncoder().encode(JSON.stringify(card, null, 2)),
    `${safeFileName(card.data?.name || card.name || "character")}_character_only.json`,
    "application/json;charset=utf-8"
  );
}

function exportWorldOnlyJson() {
  const book = normalizeWorldBook(state.worldbook || getCharacterBook());
  downloadBytes(
    new TextEncoder().encode(JSON.stringify(book, null, 2)),
    `${safeFileName(book.name || "worldbook")}_worldbook.json`,
    "application/json;charset=utf-8"
  );
}

function createCharacterOnlyCard() {
  const card = structuredCloneSafe(state.card);
  if (!card.data) card.data = {};
  card.data.character_book = {
    name: card.data.name ? `${card.data.name} 世界書` : "",
    entries: []
  };
  if (card.data.extensions?.world) card.data.extensions.world = "";
  return normalizeCard(card);
}

async function exportPng() {
  if (!state.card) return;
  try {
    const source = state.sourcePngBytes || await createFallbackPng(state.card);
    const bytes = insertCardIntoPng(source, state.card);
    downloadBytes(bytes, `${safeFileName(state.card.data?.name || state.card.name || "character")}.png`, "image/png");
    setMessage("已匯出 PNG 角色卡。");
  } catch (error) {
    setMessage(`PNG 匯出失敗：${error.message}`, "error");
  }
}

function downloadBytes(bytes, fileName, type) {
  const blob = new Blob([bytes], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function safeFileName(name) {
  return String(name || "character").replace(/[\\/:*?"<>|]+/g, "_").slice(0, 80);
}

function bindDropzones() {
  $$("[data-drop-card]").forEach((zone) => {
    bindDropzone(zone, handleCardFile);
    zone.addEventListener("click", () => $("#cardFileInput").click());
  });
}

function bindDropzone(zone, handler) {
  ["dragenter", "dragover"].forEach((name) => zone.addEventListener(name, (event) => {
    event.preventDefault();
    zone.classList.add("drag");
  }));
  ["dragleave", "drop"].forEach((name) => zone.addEventListener(name, (event) => {
    event.preventDefault();
    zone.classList.remove("drag");
  }));
  zone.addEventListener("drop", (event) => handler(event.dataTransfer.files[0]));
}

function extractCardFromPng(bytes) {
  const chunks = readPngChunks(bytes);
  let charaCard = null;
  let ccv3Card = null;
  for (const chunk of chunks) {
    const keyword = getPngTextKeyword(chunk).toLowerCase();
    if (keyword !== "chara" && keyword !== "ccv3") continue;
    let card = null;
    if (chunk.type === "tEXt") {
      card = parseCharaText(readTextChunk(chunk.data).text);
    } else if (chunk.type === "iTXt") {
      const text = readItxtChunk(chunk.data);
      if (text.compressed) throw new Error(`此 PNG 的 ${keyword} iTXt 使用壓縮，目前無法在純靜態版本解析。`);
      card = parseCharaText(text.text);
    } else if (chunk.type === "zTXt") {
      throw new Error(`此 PNG 的 ${keyword} zTXt 使用壓縮，目前無法在純靜態版本解析。`);
    }
    if (!card) continue;
    if (keyword === "ccv3") ccv3Card = card;
    else charaCard = card;
  }
  /* ccv3 優先，與 SillyTavern 的讀取順序一致 */
  if (ccv3Card) return { card: ccv3Card };
  if (charaCard) return { card: charaCard };
  throw new Error("找不到 SillyTavern chara metadata。");
}

function parseCharaText(text) {
  const raw = String(text || "").trim();
  const attempts = [raw];
  try {
    const cleaned = raw.replace(/\s+/g, "");
    const binary = atob(cleaned);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    attempts.unshift(new TextDecoder("utf-8").decode(bytes));
  } catch {
    // Some tools store raw JSON instead of base64.
  }
  for (const attempt of attempts) {
    try {
      return JSON.parse(attempt);
    } catch {
      // Try next representation.
    }
  }
  throw new Error("找到 chara metadata，但內容不是可解析的 JSON。");
}

function readPngChunks(bytes) {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (!signature.every((value, index) => bytes[index] === value)) throw new Error("不是有效的 PNG 檔案。");
  const chunks = [];
  let offset = 8;
  while (offset < bytes.length) {
    const length = readUint32(bytes, offset);
    const type = String.fromCharCode(...bytes.slice(offset + 4, offset + 8));
    const data = bytes.slice(offset + 8, offset + 8 + length);
    const crc = bytes.slice(offset + 8 + length, offset + 12 + length);
    chunks.push({ length, type, data, crc, start: offset, end: offset + 12 + length });
    offset += 12 + length;
    if (type === "IEND") break;
  }
  return chunks;
}

function getPngTextKeyword(chunk) {
  if (!["tEXt", "iTXt", "zTXt"].includes(chunk.type)) return "";
  const zero = chunk.data.indexOf(0);
  if (zero < 0) return "";
  return latin1Decode(chunk.data.slice(0, zero));
}

function readTextChunk(data) {
  const zero = data.indexOf(0);
  return {
    keyword: latin1Decode(data.slice(0, zero)),
    text: latin1Decode(data.slice(zero + 1))
  };
}

function readItxtChunk(data) {
  let offset = 0;
  const keywordEnd = data.indexOf(0, offset);
  const keyword = latin1Decode(data.slice(offset, keywordEnd));
  offset = keywordEnd + 1;
  const compressed = data[offset] === 1;
  offset += 2;
  const languageEnd = data.indexOf(0, offset);
  offset = languageEnd + 1;
  const translatedEnd = data.indexOf(0, offset);
  offset = translatedEnd + 1;
  return {
    keyword,
    compressed,
    text: new TextDecoder("utf-8").decode(data.slice(offset))
  };
}

function insertCardIntoPng(bytes, card) {
  const chunks = readPngChunks(bytes);
  const base64Card = bytesToBase64(new TextEncoder().encode(JSON.stringify(card)));
  const charaChunk = createTextChunk("chara", base64Card);
  const ccv3Chunk = createTextChunk("ccv3", base64Card);
  const output = [];
  output.push(bytes.slice(0, 8));
  chunks.forEach((chunk) => {
    const keyword = getPngTextKeyword(chunk).toLowerCase();
    /* chara 與 ccv3 都要清：SillyTavern 讀取時 ccv3 優先，殘留舊 ccv3 會蓋掉新寫入的資料 */
    if (keyword === "chara" || keyword === "ccv3") return;
    if (chunk.type === "IEND") {
      output.push(charaChunk);
      output.push(ccv3Chunk);
    }
    output.push(bytes.slice(chunk.start, chunk.end));
  });
  return concatBytes(output);
}

function createTextChunk(keyword, text) {
  const keywordBytes = latin1Encode(keyword);
  const textBytes = latin1Encode(text);
  const data = concatBytes([keywordBytes, new Uint8Array([0]), textBytes]);
  const type = latin1Encode("tEXt");
  const length = new Uint8Array(4);
  writeUint32(length, 0, data.length);
  const crcInput = concatBytes([type, data]);
  const crc = new Uint8Array(4);
  writeUint32(crc, 0, crc32(crcInput));
  return concatBytes([length, type, data, crc]);
}

function readUint32(bytes, offset) {
  return ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
}

function writeUint32(bytes, offset, value) {
  bytes[offset] = (value >>> 24) & 255;
  bytes[offset + 1] = (value >>> 16) & 255;
  bytes[offset + 2] = (value >>> 8) & 255;
  bytes[offset + 3] = value & 255;
}

function latin1Encode(text) {
  return Uint8Array.from(String(text), (char) => char.charCodeAt(0) & 255);
}

function latin1Decode(bytes) {
  let result = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    result += String.fromCharCode(...bytes.slice(i, i + chunkSize));
  }
  return result;
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(index, index + chunkSize));
  }
  return btoa(binary);
}

function concatBytes(parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });
  return output;
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createFallbackPng(card) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 512, 768);
    gradient.addColorStop(0, "#6f9fc3");
    gradient.addColorStop(0.55, "#9fcbb8");
    gradient.addColorStop(1, "#b8add8");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 768);
    ctx.fillStyle = "rgba(255,253,249,0.88)";
    ctx.fillRect(42, 54, 428, 660);
    ctx.fillStyle = "#26303f";
    ctx.font = "700 42px Microsoft JhengHei, sans-serif";
    wrapCanvasText(ctx, card.data?.name || card.name || "未命名角色", 72, 150, 370, 52);
    ctx.fillStyle = "#6e7687";
    ctx.font = "24px Microsoft JhengHei, sans-serif";
    wrapCanvasText(ctx, "酒館角色卡製卡工坊", 72, 620, 370, 34);
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error("無法產生 PNG。"));
        return;
      }
      resolve(new Uint8Array(await blob.arrayBuffer()));
    }, "image/png");
  });
}

function imageFileToPngBytes(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth || image.width || 512;
        canvas.height = image.naturalHeight || image.height || 768;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        canvas.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error("無法把圖片轉成 PNG。"));
            return;
          }
          resolve(new Uint8Array(await blob.arrayBuffer()));
        }, "image/png");
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("圖片無法讀取。"));
    };
    image.src = url;
  });
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split("");
  let line = "";
  for (const word of words) {
    const test = line + word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, y);
}

function init() {
  console.log("[init] app.js v2-debug loaded");
  const controls = $("#fileControlsTemplate").content.cloneNode(true);
  document.body.appendChild(controls);
  $$(".step-link").forEach((button) => button.addEventListener("click", () => {
    state.step = button.dataset.step;
    setMessage("");
    render();
    if (window.matchMedia("(max-width: 768px)").matches) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }));
  $("#loadCharacterTemplate").addEventListener("click", () => loadTemplate("character"));
  $("#loadWorldTemplate").addEventListener("click", () => loadTemplate("worldbook"));
  $("#loadCombinedTemplate").addEventListener("click", () => loadTemplate("combined"));
  $("#cardFileInput").addEventListener("change", (event) => {
    handleCardFile(event.target.files[0]);
    event.target.value = "";
  });
  $("#worldFileInput").addEventListener("change", (event) => {
    handleWorldFile(event.target.files[0]);
    event.target.value = "";
  });
  $("#exportImageInput").addEventListener("change", (event) => {
    handleExportImageFile(event.target.files[0]);
    event.target.value = "";
  });
  if (loadFromStorage()) {
    console.log("[DEBUG] init: loadFromStorage OK, step:", state.step);
    setMessage("已自動恢復上次的編輯內容。封面圖片需要重新上傳。");
  } else {
    console.log("[DEBUG] init: no saved data");
  }
  console.log("[DEBUG] init: calling render...");
  render();
  console.log("[DEBUG] init: render done");
  window.addEventListener("beforeunload", (e) => {
    if (state.card || state.worldbook) {
      saveToStorage();
      e.preventDefault();
    }
  });
  $(".inspector-head")?.addEventListener("click", () => {
    if (!window.matchMedia("(max-width: 768px)").matches) return;
    $(".inspector")?.classList.toggle("collapsed");
  });
  if (window.matchMedia("(max-width: 768px)").matches) {
    $(".inspector")?.classList.add("collapsed");
  }
}

init();
