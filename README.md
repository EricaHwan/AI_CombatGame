# AI Combat Game

這是一個基於網頁的 AI 戰鬥遊戲，玩家可以與 AI 對手進行對戰。遊戲使用 HTML5 Canvas 和 JavaScript 實現，具有簡單但有趣的戰鬥機制。

## 遊戲特點

- 玩家控制：使用方向鍵移動，Z 鍵進行攻擊
- AI 對手：具有智能行為，會主動追擊和攻擊玩家
- 戰鬥機制：
  - 玩家攻擊範圍：100 像素
  - AI 攻擊範圍：50 像素
  - 攻擊會造成擊退效果和傷害
- 生命值系統：雙方都有生命值顯示
- 遊戲結束條件：當一方生命值歸零時遊戲結束

## 安裝方法

1. 克隆倉庫：
```bash
git clone https://github.com/EricaHwan/AI_CombatGame.git
```

2. 進入項目目錄：
```bash
cd AI_CombatGame
```

## 運行遊戲

1. 直接在瀏覽器中打開 `index.html` 文件
2. 或者使用本地服務器運行（推薦）：
   - 使用 Python 的簡單 HTTP 服務器：
     ```bash
     python -m http.server
     ```
   - 然後在瀏覽器中訪問 `http://localhost:8000`

## 遊戲控制

- 方向鍵：控制角色移動
- Z 鍵：進行攻擊
- 遊戲開始前有 3 秒倒數計時

## 遊戲規則

1. 玩家和 AI 都有生命值顯示
2. 攻擊會造成 5 點傷害
3. 攻擊會產生擊退效果
4. 當一方生命值歸零時遊戲結束
5. 玩家有更大的攻擊範圍優勢（100 像素 vs 50 像素）

## 技術細節

- 使用 HTML5 Canvas 進行遊戲渲染
- 使用 JavaScript 實現遊戲邏輯
- 使用 Gemini API 實現 AI 決策（需要 API 密鑰）
- 響應式設計，適應不同屏幕大小

## 開發者

- Erica Hwan

## 許可證

MIT License 