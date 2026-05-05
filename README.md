# chrome-history-dedup

[日本語](#日本語) | [English](#english)

---

## 日本語

ブラウザの履歴から重複URLを自動で削除し、最新の訪問だけを残すChrome拡張機能です。

## 何をするのか

サイトによっては、ページを読み込むたびにタイムスタンプ系のクエリパラメータを付与します（例：`?_reload=2026-05-05T14:00:00Z`）。これにより、ほぼ同じURLが履歴に何百件も溜まってしまいます。この拡張機能は、そういった重複エントリを30分ごとに自動検出・削除します。

**削除前:**
```
14:20  総合 | NHK  web.nhk/tv/g1?_reload=2026-05-05T05:20:00Z
14:19  総合 | NHK  web.nhk/tv/g1?_reload=2026-05-05T05:19:00Z
14:18  総合 | NHK  web.nhk/tv/g1?_reload=2026-05-05T05:18:00Z
...
```

**削除後:**
```
14:20  総合 | NHK  web.nhk/tv/g1?_reload=2026-05-05T05:20:00Z
```

## 仕組み

- タイムスタンプ系のクエリパラメータを除いた正規化URLでグループ化
- グループごとに最新のエントリだけ残し、古い重複は削除
- タイムスタンプ・キャッシュバスター系パラメータを持つURLだけが削除対象（通常のURLは絶対に触らない）
- バックグラウンドで30分ごとに自動実行。ポップアップから手動実行も可能

## インストール方法

1. このリポジトリをダウンロードまたはクローン
2. Chromeで `chrome://extensions` を開く
3. 右上の **デベロッパーモード** をONにする
4. **パッケージ化されていない拡張機能を読み込む** → このフォルダを選択

## 必要なパーミッション

| パーミッション | 用途 |
|---|---|
| `history` | 履歴の読み取りと削除 |
| `alarms` | 30分ごとのバックグラウンド実行 |
| `storage` | 最終実行日時の保存（ポップアップ表示用） |

---

## English

A Chrome extension that automatically removes duplicate URL entries from your browser history, keeping only the most recent visit.

## What it does

Some sites append timestamp-based query parameters on every page load (e.g. `?_reload=2026-05-05T14:00:00Z`), causing your history to fill up with hundreds of near-identical entries. This extension detects and removes those duplicate variants every 30 minutes.

**Before:**
```
14:20  総合 | NHK  web.nhk/tv/g1?_reload=2026-05-05T05:20:00Z
14:19  総合 | NHK  web.nhk/tv/g1?_reload=2026-05-05T05:19:00Z
14:18  総合 | NHK  web.nhk/tv/g1?_reload=2026-05-05T05:18:00Z
...
```

**After:**
```
14:20  総合 | NHK  web.nhk/tv/g1?_reload=2026-05-05T05:20:00Z
```

## How it works

- Groups history entries by their normalized URL (timestamp-like query params stripped)
- Keeps the most recent entry per group, deletes the older variants
- Only deletes URLs that actually contain timestamp/cache-buster params — clean URLs are never touched
- Runs every 30 minutes in the background; can also be triggered manually via the popup

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** and select this folder

## Permissions

| Permission | Reason |
|---|---|
| `history` | Read and delete browser history entries |
| `alarms` | Run cleanup every 30 minutes |
| `storage` | Save last run timestamp for the popup |
