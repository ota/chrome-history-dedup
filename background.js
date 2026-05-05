const ALARM_NAME = 'history-dedup';
const SEARCH_DAYS = 7;
const BATCH_SIZE = 50;

let running = false;

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 30 });
  // Do NOT run immediately on install — let the user trigger manually first
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    deduplicateHistory();
  }
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'runDedup') {
    deduplicateHistory().then(() => sendResponse({ ok: true }));
    return true;
  }
});

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T/;
const UNIX_MS_RE = /^\d{13}$/;

function isTimestampValue(raw) {
  try {
    const v = decodeURIComponent(raw);
    return ISO_DATE_RE.test(v) || UNIX_MS_RE.test(v);
  } catch {
    return false;
  }
}

// Returns true if the URL contains any query param whose value looks like a
// timestamp (ISO date or Unix ms). These are cache-buster variants, safe to delete.
function hasTimestampParam(rawUrl) {
  try {
    for (const [, value] of new URL(rawUrl).searchParams) {
      if (isTimestampValue(value)) return true;
    }
  } catch { /* ignore invalid URLs */ }
  return false;
}

function normalizeUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    for (const [key, value] of [...url.searchParams]) {
      if (isTimestampValue(value)) {
        url.searchParams.delete(key);
      }
    }
    url.hash = '';
    return url.toString();
  } catch {
    return rawUrl;
  }
}

async function deduplicateHistory() {
  if (running) return;
  running = true;

  try {
    const startTime = Date.now() - SEARCH_DAYS * 24 * 60 * 60 * 1000;

    const items = await chrome.history.search({
      text: '',
      maxResults: 5000,
      startTime,
    });

    // Group items by normalized URL, but only consider items that actually
    // have timestamp params — never touch clean URLs via normalization
    const groups = new Map();
    for (const item of items) {
      const norm = normalizeUrl(item.url);
      if (!groups.has(norm)) groups.set(norm, []);
      groups.get(norm).push(item);
    }

    let dedupedCount = 0;
    let processed = 0;

    for (const [, group] of groups) {
      if (group.length <= 1) continue;

      group.sort((a, b) => b.lastVisitTime - a.lastVisitTime);
      const [, ...toDelete] = group;

      for (const item of toDelete) {
        // Safety: only delete URLs that are confirmed timestamp variants.
        // Never delete a clean URL based solely on normalization.
        if (!hasTimestampParam(item.url)) continue;
        await chrome.history.deleteUrl({ url: item.url });
        dedupedCount++;
      }

      // Yield every BATCH_SIZE items to keep Chrome responsive
      processed++;
      if (processed % BATCH_SIZE === 0) {
        await new Promise((r) => setTimeout(r, 50));
      }
    }

    await chrome.storage.local.set({
      lastRun: Date.now(),
      lastDedupedUrls: dedupedCount,
    });

    console.log(`[History Dedup] Deleted ${dedupedCount} duplicate URL variants`);
  } finally {
    running = false;
  }
}
