# 詞光・即時文字雲

以 Firebase Cloud Firestore 即時同步的繁體中文文字雲，適合課堂、工作坊或小型活動使用。

## 本機預覽

```bash
python3 -m http.server 8000 --directory site
```

然後開啟 `http://localhost:8000`。Firebase 模組從 Firebase 官方 CDN 載入。

Firebase Web 設定位於 `firebase-config.js`。Firebase Web API key 是前端識別設定，資料存取由 `firestore.rules` 控制；不要在此加入 Admin SDK 私密金鑰。

文字雲讀取 `wordcloud_words` 集合最近 500 筆回應，將相同詞彙合併顯示。Firestore 規則限制新增內容為 1–32 字，只允許讀取和新增，不允許訪客修改或刪除資料。這是公開 demo 模式，任何人都能讀取並新增短詞，請勿輸入個資或機密資訊。

## GitHub Pages

GitHub Actions 會在推送到 `main` 時將 `site/` 部署到 GitHub Pages。
