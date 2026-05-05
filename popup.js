document.addEventListener('DOMContentLoaded', async () => {
  const infoEl = document.getElementById('lastRun');
  const statusEl = document.getElementById('status');

  const data = await chrome.storage.local.get(['lastRun', 'lastDedupedUrls']);

  if (data.lastRun) {
    const date = new Date(data.lastRun).toLocaleString();
    infoEl.textContent = `Last run: ${date}\nDeduped URLs: ${data.lastDedupedUrls ?? 0}`;
  } else {
    infoEl.textContent = 'Not run yet.';
  }

  document.getElementById('runNow').addEventListener('click', async () => {
    statusEl.style.display = 'block';
    await chrome.runtime.sendMessage({ type: 'runDedup' });
    window.close();
  });
});
