# ガーデンライトセレクター（TAKASHO / LIXIL）

タケゾーファームの外構照明セレクター。
**サーバー不要**の静的サイトで、GitHub Pages に無料で公開されます。

- 公開URL: `https://takezofarm288282-jpg.github.io/lighting-takasho/`
- 管理画面: 上記URLの末尾に `#/admin` を付ける
- 施工例ページ: 末尾に `#/cases`

## 仕組み

| やること | どこで動くか |
|---|---|
| 商品202点の表示・絞り込み・見積計算 | ブラウザの中だけ（`src/data/catalog.ts`） |
| 見積書PDFの作成 | ブラウザの中だけ |
| 来場者・見積の記録／メール通知 | Googleスプレッドシート（Google Apps Script） |

以前は ConoHa VPS 上でサーバー（Bun + Hono + Turso）を動かしていましたが、
サーバーが止まるとページが真っ白になるため、上記の構成に作り替えました。

## 更新のしかた

1. ファイルを直して GitHub に push する
2. 自動でビルドされ、数分後に公開ページへ反映される（`.github/workflows/deploy.yml`）

### 商品を追加・修正したいとき

`src/data/catalog.ts` を編集します。商品は次の形です。

```ts
{ name: "商品名", modelNo: "型番", categoryId: catMap["garden-uplight"], price: 14800,
  lumen: 350, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 4.0,
  imageUrl: "画像URL", catalogPage: 34, description: "説明",
  features: JSON.stringify(["特徴1", "特徴2"]),
  beamAngle: 30, reachDistance: 3.0, voltage: "12V" }
```

## 初期セットアップ

`docs/セットアップ.md` を参照してください。

## 手元で動かす場合

```bash
npm install
npm run dev     # http://localhost:4200
npm run build   # dist/ に書き出し
```
