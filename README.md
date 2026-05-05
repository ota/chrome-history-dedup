# chrome-history-dedup

[日本語](README.ja.md)

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
