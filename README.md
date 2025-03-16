# HTML5 刮刮樂遊戲

這是一個基於 HTML5 Canvas 技術開發的刮刮樂遊戲，具有響應式設計，適合各種行動裝置和品牌行銷活動使用。

## 功能特點

- **精美的視覺效果**：高質量的設計和流暢的動畫效果
- **真實的刮刮樂體驗**：模擬真實刮刮樂的觸感和互動
- **自定義獎項和權重**：可輕鬆設定不同獎項和中獎機率
- **支援觸控和滑鼠操作**：適用於智慧型手機、平板和電腦
- **獎品圖片保存功能**：可將獎品轉化為圖片下載或分享
- **適用於 LINE 官方帳號**：可嵌入 LINE Webview 中使用

## 遊戲流程

1. 初始畫面顯示一排刮刮樂卡片（10張）
2. 用戶點擊選擇一張卡片，帶有動畫效果
3. 進入刮刮樂畫面，使用手指或滑鼠刮開覆蓋層
4. 顯示獲得的獎品並提供保存功能

## 自訂選項

### 修改獎項和中獎機率

在 `script.js` 文件中，可修改以下設置：

```javascript
const prizes = [
    { name: "招待迎賓飲品乙份", weight: 40 },
    { name: "95折優惠", weight: 10 },
    { name: "再接再厲", weight: 20 },
    { name: "加購價1000元體驗秘境SUP活動(1人)", weight: 30 }
];
```

權重數值代表該獎項的相對機率。例如，在上述設置中：
- "招待迎賓飲品乙份" 的機率為 40/(40+10+20+30) = 40%
- "95折優惠" 的機率為 10/(40+10+20+30) = 10%
- "再接再厲" 的機率為 20/(40+10+20+30) = 20%
- "加購價1000元體驗秘境SUP活動(1人)" 的機率為 30/(40+10+20+30) = 30%

### 更換品牌視覺

- 卡片背景：替換 `images/card-back.png` 文件
- 品牌標誌：替換 `images/brand-logo.png` 文件
- 自訂顏色：在 `styles.css` 中修改 `:root` 變量的顏色值

## 如何使用

1. 將所有文件上傳至您的網頁伺服器
2. 確保 `images` 目錄中包含所需的圖片資源
3. 訪問 `index.html` 開始遊戲

## 技術實現

- HTML5 + CSS3 + JavaScript (ES6)
- 使用 Canvas API 實現刮刮樂效果
- 使用 `globalCompositeOperation = "destination-out"` 實現平滑刮除
- 響應式設計，支援各種螢幕尺寸
- 無需後端，純前端實現所有功能

## 注意事項

- 確保在使用前測試所有功能，特別是在各種行動裝置上的觸控體驗
- 建議使用現代瀏覽器（Chrome、Safari、Firefox、Edge 等）獲得最佳體驗
- 若需與後端系統整合（如儲存用戶獲獎紀錄），需另行開發相關功能 